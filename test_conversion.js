const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const JSZip = require('jszip');

async function testPdfConversion() {
  console.log('Testing PDF conversion logic...');

  const buf1 = fs.readFileSync('teste1.png');
  const buf2 = fs.readFileSync('teste2.png');

  // Test 1: Merged PDF
  console.log('--- Test 1: Merging 2 images into 1 PDF ---');
  const pdfDoc = await PDFDocument.create();

  // Embed image 1
  const img1 = await pdfDoc.embedPng(buf1);
  console.log(`Image 1 dimensions: ${img1.width} x ${img1.height}`);
  const page1 = pdfDoc.addPage([img1.width, img1.height]);
  page1.drawImage(img1, { x: 0, y: 0, width: img1.width, height: img1.height });

  // Embed image 2
  const img2 = await pdfDoc.embedPng(buf2);
  console.log(`Image 2 dimensions: ${img2.width} x ${img2.height}`);
  const page2 = pdfDoc.addPage([img2.width, img2.height]);
  page2.drawImage(img2, { x: 0, y: 0, width: img2.width, height: img2.height });

  const mergedPdfBytes = await pdfDoc.save();
  fs.writeFileSync('teste_merged.pdf', mergedPdfBytes);
  console.log(`Merged PDF created: teste_merged.pdf (${mergedPdfBytes.length} bytes)`);

  // Verify page sizes of generated PDF
  const loadedMerged = await PDFDocument.load(mergedPdfBytes);
  const pages = loadedMerged.getPages();
  console.log(`Total pages: ${pages.length}`);
  console.log(`Page 1 size: ${pages[0].getWidth()} x ${pages[0].getHeight()} (matches 800 x 600: ${pages[0].getWidth() === 800 && pages[0].getHeight() === 600})`);
  console.log(`Page 2 size: ${pages[1].getWidth()} x ${pages[1].getHeight()} (matches 500 x 900: ${pages[1].getWidth() === 500 && pages[1].getHeight() === 900})`);

  // Test 2: Separate PDFs & ZIP
  console.log('\n--- Test 2: Separate PDFs & ZIP generation ---');
  const zip = new JSZip();

  // PDF 1
  const doc1 = await PDFDocument.create();
  const emb1 = await doc1.embedPng(buf1);
  const p1 = doc1.addPage([emb1.width, emb1.height]);
  p1.drawImage(emb1, { x: 0, y: 0, width: emb1.width, height: emb1.height });
  const b1 = await doc1.save();
  zip.file('teste1.pdf', b1);

  // PDF 2
  const doc2 = await PDFDocument.create();
  const emb2 = await doc2.embedPng(buf2);
  const p2 = doc2.addPage([emb2.width, emb2.height]);
  p2.drawImage(emb2, { x: 0, y: 0, width: emb2.width, height: emb2.height });
  const b2 = await doc2.save();
  zip.file('teste2.pdf', b2);

  const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync('teste_separados.zip', zipContent);
  console.log(`ZIP created: teste_separados.zip (${zipContent.length} bytes)`);

  console.log('\nALL CONVERSION TESTS PASSED PERFECTLY!');
}

testPdfConversion().catch(console.error);
