import { useEffect, useState } from "react";
import { Button, Card, Spinner } from "@heroui/react";
import { FileDown } from "lucide-react";
import type { ReportPeriodId } from "@/domain/reports/reportPeriod";
import type { SalesReport } from "@/domain/reports/salesReport";
import { formatArsAmount } from "@/presentation/formatters/amount";
import { ReportPeriodSelect } from "@/presentation/features/reports/components/ReportPeriodSelect";
import { useTexts } from "@/presentation/texts/useTexts";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; report: SalesReport };

interface SalesReportViewProps {
  readonly loadReport: (periodId: ReportPeriodId) => Promise<SalesReport>;
}

export function SalesReportView({ loadReport }: SalesReportViewProps) {
  const { common, reports: texts } = useTexts();
  const [periodId, setPeriodId] = useState<ReportPeriodId>("thisWeek");
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasDownloadError, setHasDownloadError] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    loadReport(periodId)
      .then((report) => {
        if (isCurrent) setState({ status: "success", report });
      })
      .catch(() => {
        if (isCurrent) setState({ status: "error" });
      });

    return () => {
      isCurrent = false;
    };
  }, [loadReport, periodId, attempt]);

  const changePeriod = (nextPeriodId: ReportPeriodId) => {
    setPeriodId(nextPeriodId);
    setState({ status: "loading" });
    setHasDownloadError(false);
  };

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  };

  const download = async (report: SalesReport) => {
    setIsDownloading(true);
    setHasDownloadError(false);

    try {
      const { downloadSalesReportPdf } = await import("@/presentation/features/reports/pdf/salesReportPdf");
      downloadSalesReportPdf(report, texts, common.locale);
    } catch {
      setHasDownloadError(true);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className="flex w-full max-w-none flex-col gap-4">
      <h2 className="text-xl font-semibold">{texts.salesTitle}</h2>
      <ReportPeriodSelect
        label={texts.period}
        value={periodId}
        periodLabels={texts.periods}
        onChange={changePeriod}
      />

      {state.status === "loading" ? (
        <div className="flex justify-center">
          <Spinner size="sm" aria-label={common.loading} />
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="flex flex-col items-start gap-3">
          <p role="alert">{texts.loadError}</p>
          <Button variant="outline" onPress={retry}>
            {texts.retry}
          </Button>
        </div>
      ) : null}

      {state.status === "success" ? (
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-1 p-5">
            <p className="text-sm text-default-500">{texts.total}</p>
            <p className="text-3xl font-bold tabular-nums">
              {formatArsAmount(state.report.total, common.locale)}
            </p>
          </Card>

          {state.report.items.length === 0 ? (
            <p className="text-default-500">{texts.empty}</p>
          ) : null}

          <Button
            variant="primary"
            className="w-full"
            isDisabled={isDownloading || state.report.items.length === 0}
            onPress={() => download(state.report)}
          >
            {isDownloading ? (
              <Spinner size="sm" aria-label={common.loading} />
            ) : (
              <>
                <FileDown size={18} aria-hidden="true" />
                {texts.download}
              </>
            )}
          </Button>

          {hasDownloadError ? (
            <p role="alert" className="text-sm text-danger">
              {texts.error}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
