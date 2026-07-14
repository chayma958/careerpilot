import PDFDocument from "pdfkit";

export function generateTextPdf(title: string, body: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(16).font("Helvetica-Bold").text(title);
    doc.moveDown();
    doc.fontSize(11).font("Helvetica").text(body, { align: "left", lineGap: 4 });

    doc.end();
  });
}
