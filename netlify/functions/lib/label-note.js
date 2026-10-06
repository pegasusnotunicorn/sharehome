import zlib from "node:zlib";
import { PDFDocument, PDFName, PDFRawStream, StandardFonts, rgb } from "pdf-lib";

// UPS Ground Saver labels have no reference field — Shippo's reference_1/2
// and UPS's own reference options all come back unprinted — so we stamp the
// note onto the label PDF ourselves.
//
// The label is one 800x1200 grayscale image filling a 4x6 page. The box below
// (in image pixels) is the blank area right of the ZIP routing barcode. That
// barcode encodes a fixed-length ZIP+4, so the gap doesn't move between
// labels; we still check it's blank before drawing so we never print over a
// barcode if UPS changes the layout.
// Blob store for stamped labels, keyed by Shippo transaction id; served by
// the `label` function.
export const STAMPED_LABEL_STORE = "stamped-labels";

const LABEL_IMAGE = { width: 800, height: 1200 };
const NOTE_BOX_PX = { x0: 636, y0: 292, x1: 794, y1: 416 };

const MAX_FONT_SIZE = 11;
const MIN_FONT_SIZE = 5;
const LINE_GAP = 1.15;

/**
 * Stamp a note into the blank box of a UPS Ground Saver label.
 * Throws if the PDF isn't the expected layout or the box isn't blank.
 *
 * @param {Uint8Array} pdfBytes
 * @param {Object} note
 * @param {string} [note.heading] - first line, e.g. the order number
 * @param {string[]} note.lines - one item per line, e.g. ["1x LCM", "1x URG"]
 * @returns {Promise<Uint8Array>}
 */
export async function stampGroundSaverNote(pdfBytes, { heading, lines }) {
  const pdf = await PDFDocument.load(pdfBytes);
  if (pdf.getPageCount() !== 1) {
    throw new Error(`Expected a 1-page label, got ${pdf.getPageCount()} pages`);
  }

  const image = labelRaster(pdf);
  if (image.width !== LABEL_IMAGE.width || image.height !== LABEL_IMAGE.height) {
    throw new Error(`Unexpected label image size ${image.width}x${image.height}`);
  }
  if (!isBlank(image, NOTE_BOX_PX)) {
    throw new Error("Note box on the label isn't blank — layout may have changed");
  }

  const page = pdf.getPage(0);
  const { width: pageW, height: pageH } = page.getSize();
  const sx = pageW / image.width;
  const sy = pageH / image.height;
  const box = {
    left: NOTE_BOX_PX.x0 * sx,
    top: pageH - NOTE_BOX_PX.y0 * sy,
    width: (NOTE_BOX_PX.x1 - NOTE_BOX_PX.x0) * sx,
    height: (NOTE_BOX_PX.y1 - NOTE_BOX_PX.y0) * sy,
  };

  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fitWidth = (texts) =>
    box.width / Math.max(...texts.map((t) => font.widthOfTextAtSize(t, 1)));

  // The heading (order number) is long, so it gets its own size; the item
  // lines share the largest size that fits the widest item and the space left.
  const headingSize = heading ? Math.min(MAX_FONT_SIZE, fitWidth([heading])) : 0;
  const items = lines.filter(Boolean);
  if (!heading && !items.length) throw new Error("Nothing to stamp");
  const itemSize = !items.length ? Infinity : Math.min(
    MAX_FONT_SIZE,
    fitWidth(items),
    (box.height - headingSize * LINE_GAP) / (items.length * LINE_GAP)
  );
  const smallest = Math.min(itemSize, heading ? headingSize : Infinity);
  if (smallest < MIN_FONT_SIZE) {
    throw new Error(`Note too long to fit legibly (${smallest.toFixed(1)}pt)`);
  }

  let y = box.top;
  const draw = (text, size) => {
    y -= size;
    page.drawText(text, { x: box.left, y, size, font, color: rgb(0, 0, 0) });
    y -= size * (LINE_GAP - 1);
  };
  if (heading) draw(heading, headingSize);
  for (const item of items) draw(item, itemSize);

  return pdf.save();
}

// Decode the label's single grayscale image to raw 8-bit pixels.
function labelRaster(pdf) {
  const images = [];
  for (const [, obj] of pdf.context.enumerateIndirectObjects()) {
    if (
      obj instanceof PDFRawStream &&
      obj.dict.get(PDFName.of("Subtype")) === PDFName.of("Image")
    ) {
      images.push(obj);
    }
  }
  if (images.length !== 1) {
    throw new Error(`Expected 1 label image, found ${images.length}`);
  }
  const img = images[0];
  const num = (key) => Number(img.dict.get(PDFName.of(key))?.toString());
  const width = num("Width");
  const height = num("Height");
  if (
    img.dict.get(PDFName.of("Filter")) !== PDFName.of("FlateDecode") ||
    img.dict.get(PDFName.of("ColorSpace")) !== PDFName.of("DeviceGray") ||
    num("BitsPerComponent") !== 8
  ) {
    throw new Error("Label image isn't 8-bit grayscale Flate");
  }

  const raw = zlib.inflateSync(Buffer.from(img.contents));
  const predictor = Number(
    img.dict.lookup(PDFName.of("DecodeParms"))?.get(PDFName.of("Predictor"))?.toString() ?? 1
  );
  const pixels = predictor >= 10 ? unfilterPng(raw, width, height) : raw;
  if (pixels.length < width * height) {
    throw new Error("Label image data is truncated");
  }
  return { width, height, pixels };
}

// Undo PNG row filters (PDF Predictor >= 10), 1 byte per pixel.
function unfilterPng(raw, width, height) {
  const out = Buffer.alloc(width * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (width + 1)];
    for (let x = 0; x < width; x++) {
      const r = raw[y * (width + 1) + 1 + x];
      const a = x ? out[y * width + x - 1] : 0;
      const b = y ? out[(y - 1) * width + x] : 0;
      const c = x && y ? out[(y - 1) * width + x - 1] : 0;
      let v;
      if (filter === 0) v = r;
      else if (filter === 1) v = r + a;
      else if (filter === 2) v = r + b;
      else if (filter === 3) v = r + ((a + b) >> 1);
      else {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v = r + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      }
      out[y * width + x] = v & 0xff;
    }
  }
  return out;
}

function isBlank({ width, pixels }, { x0, y0, x1, y1 }) {
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (pixels[y * width + x] < 128) return false;
    }
  }
  return true;
}
