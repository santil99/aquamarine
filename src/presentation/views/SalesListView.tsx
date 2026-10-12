import { useEffect, useState } from "react";
import { Button, Spinner, Table } from "@heroui/react";
import type { SaleListItem } from "@/domain/sales/saleListItem";
import { sumSaleAmounts } from "@/domain/sales/saleTotal";
import { formatAmount } from "@/presentation/formatters/amount";
import { salesListTexts as texts } from "@/presentation/texts/salesList";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; sales: SaleListItem[] };

interface SalesListViewProps {
  listSales: () => Promise<SaleListItem[]>;
}

export function SalesListView({ listSales }: SalesListViewProps) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    listSales()
      .then((sales) => {
        if (isCurrent) setState({ status: "success", sales });
      })
      .catch(() => {
        if (isCurrent) setState({ status: "error" });
      });

    return () => {
      isCurrent = false;
    };
  }, [listSales, attempt]);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  };

  return (
    <section className="flex w-full max-w-3xl flex-col gap-4">
      <h1 className="text-xl font-bold">{texts.title}</h1>
      <SalesListContent state={state} onRetry={retry} />
    </section>
  );
}

function SalesListContent({
  state,
  onRetry,
}: {
  state: LoadState;
  onRetry: () => void;
}) {
  if (state.status === "loading") {
    return (
      <div className="flex items-center gap-3">
        <Spinner size="sm" />
        <p>{texts.loading}</p>
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
    return <p>{texts.empty}</p>;
  }

  return (
    <>
      <Table.Root>
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
                    {formatAmount(sale.amount)}
                  </Table.Cell>
                  <Table.Cell>{sale.category}</Table.Cell>
                  <Table.Cell>
                    {sale.paymentMethod ?? texts.noPaymentMethod}
                  </Table.Cell>
                  <Table.Cell>
                    <Button size="sm" variant="ghost">
                      {texts.detail}
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
        <span>{formatAmount(sumSaleAmounts(state.sales.map((sale) => sale.amount)))}</span>
      </div>
    </>
  );
}
