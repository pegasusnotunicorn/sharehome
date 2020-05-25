import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';

//function to download blob data to a file
const downloadPDFFile = async (documentData, fileName) => {
  const blob = await pdf(documentData).toBlob();
  saveAs(blob, fileName);
};

export default downloadPDFFile;
