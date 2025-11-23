import PDFDocument from "pdfkit";
import { Readable } from "stream";
import { saveObject } from "./storage";

export type AnalysisContent = {
  title: string;
  summary: string;
  keyFindings: string[];
  nextSteps: string[];
};

export async function generateMarkdownEditable(
  content: AnalysisContent,
  context: { evidenceLabel: string; caseId?: string }
) {
  const md =
    `# ${content.title}\n\n` +
    `- 증거: ${context.evidenceLabel}\n` +
    (context.caseId ? `- 사건 ID: ${context.caseId}\n` : "") +
    `\n## 요약\n\n${content.summary}\n\n` +
    `## 주요 발견 사항\n\n` +
    content.keyFindings.map((x, i) => `- (${i + 1}) ${x}`).join("\n") +
    "\n\n" +
    `## 추후 권고 사항\n\n` +
    content.nextSteps.map((x, i) => `- (${i + 1}) ${x}`).join("\n") +
    "\n";

  const buffer = Buffer.from(md, "utf8");
  const { urlOrPath } = await saveObject({
    buffer,
    filename: `${Date.now()}_analysis_draft.md`,
    caseId: context.caseId,
    contentType: "text/markdown",
  });
  return { filePath: urlOrPath };
}

export async function generatePdfImmutable(
  content: AnalysisContent,
  context: { evidenceLabel: string; caseId?: string }
) {
  const doc = new PDFDocument({ size: "A4", margin: 48 });
  const stream = doc as unknown as Readable;

  doc.fontSize(18).text(content.title, { underline: true });
  doc.moveDown();
  doc.fontSize(10).text(`증거: ${context.evidenceLabel}`);
  if (context.caseId) doc.text(`사건 ID: ${context.caseId}`);
  doc.moveDown();

  doc.fontSize(14).text("요약");
  doc.fontSize(11).text(content.summary, { paragraphGap: 8 });
  doc.moveDown();

  doc.fontSize(14).text("주요 발견 사항");
  doc.fontSize(11);
  content.keyFindings.forEach((k, i) => {
    doc.text(`${i + 1}. ${k}`, { paragraphGap: 4 });
  });
  doc.moveDown();

  doc.fontSize(14).text("추후 권고 사항");
  doc.fontSize(11);
  content.nextSteps.forEach((k, i) => {
    doc.text(`${i + 1}. ${k}`, { paragraphGap: 4 });
  });

  doc.end();

  const { urlOrPath } = await saveObject({
    stream: stream,
    filename: `${Date.now()}_analysis_report.pdf`,
    caseId: context.caseId,
    contentType: "application/pdf",
  });
  return { filePath: urlOrPath };
}
