import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SalesReport } from "@/domain/reports/salesReport";
import { SalesReportView } from "@/presentation/features/reports/views/SalesReportView";

const downloadSalesReportPdf = vi.fn();

vi.mock("@/presentation/features/reports/pdf/salesReportPdf", () => ({
  downloadSalesReportPdf: (...args: unknown[]) => downloadSalesReportPdf(...args),
}));

const period = { id: "thisWeek" as const, dateFrom: "2024-05-06", dateTo: "2024-05-12" };

const report: SalesReport = {
  period,
  total: "1334.5",
  items: [
    {
      transactionDate: "2024-05-10",
      time: "10:30",
      paymentMethod: "Efectivo",
      detail: "Gaseosas",
      amount: "1234.5",
    },
    {
      transactionDate: "2024-05-11",
      time: "11:00",
      paymentMethod: null,
      detail: null,
      amount: "100",
    },
  ],
};

const emptyReport: SalesReport = { period, total: "0", items: [] };

describe("SalesReportView", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("muestra el total del período y permite descargar el PDF", async () => {
    const user = userEvent.setup();
    const loadReport = vi.fn().mockResolvedValue(report);

    render(<SalesReportView loadReport={loadReport} />);

    expect(await screen.findByText("1.334,50", { exact: false })).toBeTruthy();
    expect(loadReport).toHaveBeenCalledWith("thisWeek");

    await user.click(screen.getByRole("button", { name: /Descargar PDF/ }));

    await waitFor(() => expect(downloadSalesReportPdf).toHaveBeenCalledTimes(1));
    expect(downloadSalesReportPdf.mock.calls[0][0]).toBe(report);
  });

  it("muestra el error de carga y reintenta", async () => {
    const user = userEvent.setup();
    const loadReport = vi.fn().mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce(report);

    render(<SalesReportView loadReport={loadReport} />);

    expect((await screen.findByRole("alert")).textContent).toBe("No se pudieron cargar las ventas.");

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect((await screen.findByRole("button", { name: /Descargar PDF/ }) as HTMLButtonElement).disabled).toBe(false);
    expect(loadReport).toHaveBeenCalledTimes(2);
  });

  it("deshabilita la descarga y muestra el aviso cuando el período no tiene ventas", async () => {
    const loadReport = vi.fn().mockResolvedValue(emptyReport);

    render(<SalesReportView loadReport={loadReport} />);

    expect(await screen.findByText("No hay ventas en este período.")).toBeTruthy();
    expect((screen.getByRole("button", { name: /Descargar PDF/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("muestra un error fijo si falla la generación del PDF", async () => {
    const user = userEvent.setup();
    const loadReport = vi.fn().mockResolvedValue(report);
    downloadSalesReportPdf.mockImplementationOnce(() => {
      throw new Error("pdf failed");
    });

    render(<SalesReportView loadReport={loadReport} />);

    await user.click(await screen.findByRole("button", { name: /Descargar PDF/ }));

    expect(await screen.findByText("No se pudo generar el reporte. Reintenta.")).toBeTruthy();
  });
});
