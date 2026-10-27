import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { SalesReport } from "@/domain/reports/salesReport";
import { formatArsAmount } from "@/presentation/formatters/amount";
import { formatTransactionDate } from "@/presentation/formatters/transactionDate";
import type { Texts } from "@/presentation/texts/types";

type ReportTexts = Texts["reports"];
type Rgb = [number, number, number];

const MARGIN = 14;
const SUMMARY_CARD_HEIGHT = 22;
const SUMMARY_TOP = 38;
const TABLE_TOP = 70;
const INK: Rgb = [15, 23, 42];
const MUTED: Rgb = [100, 116, 139];
const RULE: Rgb = [226, 232, 240];
const TABLE_HEADER_FILL: Rgb = [241, 245, 249];
const POSITIVE: Rgb = [22, 163, 74];

const DATE_TIME_COLUMN_WIDTH = 42;
const PAYMENT_METHOD_COLUMN_WIDTH = 40;
const AMOUNT_COLUMN_WIDTH = 34;

/** Builds the sales report PDF in the browser and starts its download. */
export function downloadSalesReportPdf(report: SalesReport, texts: ReportTexts, locale: string): void {
  const { dateFrom, dateTo } = report.period;
  const doc = new jsPDF();

  drawHeader(doc, report, texts, locale);
  drawSummaryCards(doc, report, texts, locale);
  drawItemsTable(doc, report, texts, locale);

  doc.save(`reporte-ventas_${dateFrom}_${dateTo}.pdf`);
}

function drawHeader(doc: jsPDF, report: SalesReport, texts: ReportTexts, locale: string): void {
  const { id, dateFrom, dateTo } = report.period;
  const pageWidth = doc.internal.pageSize.getWidth();
  const range = `${formatTransactionDate(dateFrom, locale)} - ${formatTransactionDate(dateTo, locale)}`;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text(texts.pdf.title, MARGIN, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`${texts.period}: ${texts.periods[id]} (${range})`, MARGIN, 27);

  doc.setFontSize(8);
  doc.text(texts.pdf.issuedAt, pageWidth - MARGIN, 17, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(new Date().toLocaleDateString(locale), pageWidth - MARGIN, 23, { align: "right" });

  doc.setDrawColor(...INK);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, 32, pageWidth - MARGIN, 32);
}

function drawSummaryCards(doc: jsPDF, report: SalesReport, texts: ReportTexts, locale: string): void {
  const gap = 6;
  const cardWidth = (doc.internal.pageSize.getWidth() - MARGIN * 2 - gap) / 2;
  const cards = [
    { label: texts.pdf.operations, value: String(report.items.length), color: INK },
    { label: texts.pdf.revenue, value: formatArsAmount(report.total, locale), color: POSITIVE },
  ];

  cards.forEach((card, index) => {
    const x = MARGIN + index * (cardWidth + gap);

    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, SUMMARY_TOP, cardWidth, SUMMARY_CARD_HEIGHT, 2, 2, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(card.label.toUpperCase(), x + 5, SUMMARY_TOP + 8);

    doc.setFontSize(16);
    doc.setTextColor(...card.color);
    doc.text(card.value, x + 5, SUMMARY_TOP + 17);
  });
}

function drawItemsTable(doc: jsPDF, report: SalesReport, texts: ReportTexts, locale: string): void {
  const { columns } = texts.pdf;

  autoTable(doc, {
    startY: TABLE_TOP,
    margin: { left: MARGIN, right: MARGIN },
    theme: "plain",
    head: [[columns.dateTime, columns.paymentMethod, columns.detail, columns.amount].map((title) => title.toUpperCase())],
    body: report.items.map((item) => [
      `${formatTransactionDate(item.transactionDate, locale)} ${item.time}`,
      item.paymentMethod ?? texts.pdf.noPaymentMethod,
      item.detail ?? "",
      formatArsAmount(item.amount, locale),
    ]),
    styles: {
      font: "helvetica",
      fontSize: 9,
      textColor: INK,
      cellPadding: 3,
      valign: "middle",
      lineWidth: 0,
    },
    headStyles: {
      fillColor: TABLE_HEADER_FILL,
      textColor: MUTED,
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: DATE_TIME_COLUMN_WIDTH },
      1: { cellWidth: PAYMENT_METHOD_COLUMN_WIDTH },
      3: { cellWidth: AMOUNT_COLUMN_WIDTH, halign: "right", fontStyle: "bold" },
    },
    didDrawCell: (data) => {
      if (data.section !== "body") return;

      const bottom = data.cell.y + data.cell.height;
      doc.setDrawColor(...RULE);
      doc.setLineWidth(0.2);
      doc.line(data.cell.x, bottom, data.cell.x + data.cell.width, bottom);
    },
  });
}

