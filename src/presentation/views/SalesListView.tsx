import { useEffect, useState } from "react";
import { Button, Spinner, Table } from "@heroui/react";
import { Eye } from "lucide-react";
import { getTodayInTimeZone } from "@/domain/business/businessDay";
import type { SaleListItem } from "@/domain/sales/saleListItem";
import { sumSaleAmounts } from "@/domain/sales/saleTotal";
import { DateNavigator } from "@/presentation/components/DateNavigator";
import { formatAmount } from "@/presentation/formatters/amount";
import type { SaleFeedback } from "@/presentation/navigation/salesNavigation";
import { useTexts } from "@/presentation/texts/useTexts";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; sales: SaleListItem[] };

interface SalesListViewProps {
  readonly listSales: (date: string) => Promise<SaleListItem[]>;
  readonly timeZone: string;
  readonly initialDate?: string;
  readonly feedback?: SaleFeedback;
  readonly onOpenSale: (saleId: string, date: string) => void;
}

export function SalesListView({
  listSales,
  timeZone,
  initialDate,
  feedback,
  onOpenSale,
}: SalesListViewProps) {
  const texts = useTexts().salesList;
  const [today] = useState(() => getTodayInTimeZone(timeZone));
  const [selectedDate, setSelectedDate] = useState(initialDate ?? today);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    listSales(selectedDate)
      .then((sales) => {
        if (isCurrent) setState({ status: "success", sales });
      })
      .catch(() => {
        if (isCurrent) setState({ status: "error" });
      });

    return () => {
      isCurrent = false;
    };
  }, [listSales, selectedDate, attempt]);

  const changeDate = (date: string) => {
    setSelectedDate(date);
    setState({ status: "loading" });
  };

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  };

  return (
    <section className="flex w-full max-w-none flex-col gap-4">
      {feedback ? (
        <p role="status" className="rounded-lg bg-success/10 p-3 text-sm text-success">
          {texts.feedback[feedback]}
        </p>
      ) : null}
      <DateNavigator date={selectedDate} today={today} onDateChange={changeDate} />
      <SalesListContent
        state={state}
        onRetry={retry}
        onOpenSale={(saleId) => onOpenSale(saleId, selectedDate)}
      />
    </section>
  );
}

function SalesListContent({
  state,
  onRetry,
  onOpenSale,
}: {
  readonly state: LoadState;
  readonly onRetry: () => void;
  readonly onOpenSale: (saleId: string) => void;
}) {
  const { common, salesList: texts } = useTexts();
  const locale = common.locale;

  if (state.status === "loading") {
    return (
      <div className="flex justify-center">
        <Spinner size="sm" aria-label={common.loading} />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-start gap-3">
        <p role="alert">{texts.error}</p>
        <Button variant="outline" onPress={onRetry}>
          {texts.retry}
        </Button>
      </div>
    );
  }

  if (state.sales.length === 0) {
    return (
      <div className="flex justify-center">
        <p>{texts.empty}</p>
      </div>
    );
  }

  return (
    <>
      <Table.Root variant="secondary">
        <Table.ScrollContainer>
          <Table.Content aria-label={texts.title}>
            <Table.Header>
              <Table.Column isRowHeader>{texts.columns.amount}</Table.Column>
              <Table.Column>{texts.columns.category}</Table.Column>
              <Table.Column>{texts.columns.paymentMethod}</Table.Column>
              <Table.Column>{texts.columns.action}</Table.Column>
            </Table.Header>
            <Table.Body items={state.sales}>
              {(sale) => (
                <Table.Row id={sale.id}>
                  <Table.Cell className="whitespace-nowrap text-right">
                    {formatAmount(sale.amount, locale)}
                  </Table.Cell>
                  <Table.Cell>{sale.category}</Table.Cell>
                  <Table.Cell>
                    {sale.paymentMethod ?? texts.noPaymentMethod}
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      aria-label={texts.detail}
                      onPress={() => onOpenSale(sale.id)}
                    >
                      <Eye size={18} />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table.Root>
      <div className="flex justify-between gap-2 border-t pt-3 font-semibold">
        <span>{texts.dailyTotal}</span>
        <span>{formatAmount(sumSaleAmounts(state.sales.map((sale) => sale.amount)), locale)}</span>
      </div>
    </>
  );
}
