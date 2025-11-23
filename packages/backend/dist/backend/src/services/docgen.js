"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMarkdownEditable = generateMarkdownEditable;
exports.generatePdfImmutable = generatePdfImmutable;
const pdfkit_1 = __importDefault(require("pdfkit"));
const storage_1 = require("./storage");
async function generateMarkdownEditable(content, context) {
    const md = `# ${content.title}\n\n` +
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
    const { urlOrPath } = await (0, storage_1.saveObject)({
        buffer,
        filename: `${Date.now()}_analysis_draft.md`,
        caseId: context.caseId,
        contentType: "text/markdown",
    });
    return { filePath: urlOrPath };
}
async function generatePdfImmutable(content, context) {
    const doc = new pdfkit_1.default({ size: "A4", margin: 48 });
    const stream = doc;
    doc.fontSize(18).text(content.title, { underline: true });
    doc.moveDown();
    doc.fontSize(10).text(`증거: ${context.evidenceLabel}`);
    if (context.caseId)
        doc.text(`사건 ID: ${context.caseId}`);
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
    const { urlOrPath } = await (0, storage_1.saveObject)({
        stream: stream,
        filename: `${Date.now()}_analysis_report.pdf`,
        caseId: context.caseId,
        contentType: "application/pdf",
    });
    return { filePath: urlOrPath };
}
