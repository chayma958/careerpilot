import { PDFParse } from "pdf-parse";

export async function extractTextFromUrl(url: string, filename: string): Promise<string> {
  const isPdf = filename.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    throw new Error("Only PDF documents can be analyzed right now. Upload your CV as a PDF.");
  }

  const response = await fetch(url, { signal: AbortSignal.timeout(20 * 1000) });
  if (!response.ok) {
    throw new Error("Could not download the document for analysis");
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    const text = result.text.trim();

    if (!text) {
      throw new Error("Could not extract any text from this PDF");
    }

    return text;
  } finally {
    await parser.destroy();
  }
}
