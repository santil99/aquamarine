import { useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import type { SalesCatalogs } from "@/application/ports/salesRepository";
import { getTodayInTimeZone } from "@/domain/business/businessDay";
import type { SaleSearchFilters, SaleSearchItem } from "@/domain/sales/saleSearch";
import { getDefaultSaleSearchFilters } from "@/domain/sales/saleSearch";
import { SearchFilterFields, type SearchType } from "@/presentation/components/SearchFilterFields";
import { TransactionCard } from "@/presentation/components/TransactionCard";
import { useSaleCatalogs } from "@/presentation/hooks/useSaleCatalogs";
import { useTexts } from "@/presentation/texts/useTexts";

type ResultState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; items: SaleSearchItem[] };

interface SearchViewProps {
  readonly loadCatalogs: () => Promise<SalesCatalogs>;
  readonly searchSales: (filters: SaleSearchFilters) => Promise<SaleSearchItem[]>;
  readonly timeZone: string;
  readonly onOpenSale: (saleId: string) => void;
}

const EMPTY_OPTIONS: SalesCatalogs["categories"] = [];

export function SearchView({ loadCatalogs, searchSales, timeZone, onOpenSale }: SearchViewProps) {
  const texts = useTexts().search;
  const [today] = useState(() => getTodayInTimeZone(timeZone));
  const [type, setType] = useState<SearchType>("sales");
  const [draft, setDraft] = useState<SaleSearchFilters>(() => getDefaultSaleSearchFilters(today));
  const [applied, setApplied] = useState<SaleSearchFilters>(draft);
  const [results, setResults] = useState<ResultState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const { state: catalogState } = useSaleCatalogs(loadCatalogs);

  useEffect(() => {
    if (type === "expenses") return;

    let isCurrent = true;

    searchSales(applied)
      .then((items) => {
        if (isCurrent) setResults({ status: "success", items });
      })
      .catch(() => {
        if (isCurrent) setResults({ status: "error" });
      });

    return () => {
      isCurrent = false;
    };
  }, [type, applied, attempt, searchSales]);

  const isSales = type === "sales";
  const catalogs = catalogState.status === "success" ? catalogState.catalogs : null;

  const changeType = (nextType: SearchType) => {
    setType(nextType);
    setDraft((current) =>
      nextType === "expenses" ? { ...current, categoryId: null, paymentMethodId: null } : current,
    );
    if (nextType === "sales") setResults({ status: "loading" });
  };

  const changeField = <Field extends keyof SaleSearchFilters>(
    field: Field,
    value: SaleSearchFilters[Field],
  ) => setDraft((current) => ({ ...current, [field]: value }));

  const submit = () => {
    setApplied(draft);
    setResults({ status: "loading" });
  };

  const clear = () => setDraft(getDefaultSaleSearchFilters(today));

  const retry = () => {
    setResults({ status: "loading" });
    setAttempt((current) => current + 1);
  };

  const visibleResults: ResultState = isSales ? results : { status: "success", items: [] };

  return (
    <section className="flex w-full flex-col gap-6">
      <h1 className="text-2xl font-semibold">{texts.title}</h1>

      <SearchFilterFields
        type={type}
        onTypeChange={changeType}
        filters={draft}
        categories={isSales ? (catalogs?.categories ?? EMPTY_OPTIONS) : EMPTY_OPTIONS}
        paymentMethods={catalogs?.paymentMethods ?? EMPTY_OPTIONS}
        isLoadingCatalogs={catalogState.status === "loading"}
        onChange={changeField}
        onSubmit={submit}
        onClear={clear}
      />

      <SearchResults
        type={type}
        state={visibleResults}
        timeZone={timeZone}
        onRetry={retry}
        onOpenSale={onOpenSale}
      />
    </section>
  );
}

function SearchResults({
  type,
  state,
  timeZone,
  onRetry,
  onOpenSale,
}: {
  readonly type: SearchType;
  readonly state: ResultState;
  readonly timeZone: string;
  readonly onRetry: () => void;
  readonly onOpenSale: (saleId: string) => void;
}) {
  const { common, search: texts } = useTexts();

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

  const countTitle = `${type === "sales" ? texts.salesFound : texts.expensesFound} (${state.items.length})`;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{countTitle}</h2>
      {state.items.length === 0 ? (
        <p>{texts.empty}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.items.map((item) => (
            <li key={item.id}>
              <TransactionCard item={item} timeZone={timeZone} onOpen={onOpenSale} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
