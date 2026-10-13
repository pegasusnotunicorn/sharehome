import CardViewer from "./utils/CardViewer";
import { Helmet } from "react-helmet";
import { BOX_MM } from "./utils/box3d";
import type { BoxArt } from "./utils/box3d";

// A test page for the 3D game box, not linked from anywhere.
const panels = (part: "lid" | "base") => ({
  top: `/images/box/${part}.webp`,
  near: `/images/box/${part}-near.webp`,
  far: `/images/box/${part}-far.webp`,
  left: `/images/box/${part}-left.webp`,
  right: `/images/box/${part}-right.webp`,
});
const BOX: BoxArt = { lid: panels("lid"), base: panels("base") };

const BoxPreviewPage = () => (
  <div className="content">
    <Helmet>
      <meta name="robots" content="noindex" />
    </Helmet>
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "7rem 1rem 3rem" }}>
      <CardViewer mm={BOX_MM} box={BOX} label="The Love, Career & Magic game box" still={BOX.lid.top} />
    </div>
  </div>
);

export default BoxPreviewPage;
