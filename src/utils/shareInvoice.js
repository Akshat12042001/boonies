import {generatePDF} from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import createInvoiceHtml from './invoiceHtml';
import {getShareFileUrl, saveNamedCachePdf} from './sharePdf';

const getFileName = invoice => {
  const guestName = String(invoice?.to || '')
    .trim()
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ');
  const safeName = guestName || invoice?.invoiceNo || invoice?.id || 'Guest';

  return `Invoice-${safeName}`;
};

export const shareInvoice = async (invoice, title = 'Share invoice') => {
  const fileName = getFileName(invoice);
  const pdf = await generatePDF({
    html: createInvoiceHtml(invoice),
    fileName,
    width: 595,
    height: 842,
    padding: 0,
    bgColor: '#FFFFFF',
    shouldPrintBackgrounds: true,
  });

  if (!pdf?.filePath) {
    throw new Error('Invoice PDF could not be generated');
  }

  const sharePath = await saveNamedCachePdf(pdf.filePath, fileName);

  await Share.open({
    title,
    subject: `Invoice #${invoice?.invoiceNo || ''}`,
    url: getShareFileUrl(sharePath),
    type: 'application/pdf',
    filename: `${fileName}.pdf`,
    failOnCancel: false,
  });

  return {...pdf, filePath: sharePath};
};

export default shareInvoice;
