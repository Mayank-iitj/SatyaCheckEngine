const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const path = require('path');

async function createPDF(title, content, filename) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText(title, {
    x: 50,
    y: 350,
    size: 24,
    font: font,
    color: rgb(0.1, 0.2, 0.4),
  });

  page.drawText(content, {
    x: 50,
    y: 300,
    size: 14,
    font: regularFont,
    color: rgb(0, 0, 0),
    maxWidth: 500,
    lineHeight: 20
  });

  const pdfBytes = await pdfDoc.save();
  const outPath = path.join(__dirname, '..', 'demo-data', filename);
  fs.writeFileSync(outPath, pdfBytes);
  console.log(`Created ${outPath}`);
}

async function main() {
  const dir = path.join(__dirname, '..', 'demo-data');
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }

  await createPDF(
    "Certificate of Completion",
    "This is to certify that John Doe has successfully completed the degree program for Bachelor of Science in Computer Science with Honors.\n\nDate: May 2024\nUniversity of Example",
    "demo-certificate.pdf"
  );

  await createPDF(
    "Official Transcript",
    "Student: Jane Smith\nID: 987654321\n\nCourse History:\n- Intro to Programming: A\n- Data Structures: A-\n- Web Development: B+\n\nGPA: 3.8/4.0",
    "demo-transcript.pdf"
  );
}

main().catch(console.error);
