import { Button, Input, Label, ListBox, Select, Spinner, Tabs, TextField } from "@heroui/react";
import type { SaleCatalogOption } from "@/domain/sales/saleCatalog";
import type { SaleSearchFilters } from "@/domain/sales/saleSearch";
import { useTexts } from "@/presentation/texts/useTexts";

export type SearchType = "sales" | "expenses";

const ALL_OPTIONS = "all";

interface SearchFilterFieldsProps {
  readonly type: SearchType;
  readonly onTypeChange: (type: SearchType) => void;
  readonly filters: SaleSearchFilters;
  readonly categories: SaleCatalogOption[];
  readonly paymentMethods: SaleCatalogOption[];
  readonly isLoadingCatalogs: boolean;
  readonly onChange: <Field extends keyof SaleSearchFilters>(
    field: Field,
    value: SaleSearchFilters[Field],
  ) => void;
  readonly onSubmit: () => void;
  readonly onClear: () => void;
}

export function SearchFilterFields({
  type,
  onTypeChange,
  filters,
  categories,
  paymentMethods,
  isLoadingCatalogs,
  onChange,
  onSubmit,
  onClear,
}: SearchFilterFieldsProps) {
  const { search: texts } = useTexts();
  const isSales = type === "sales";

  return (
    <form
      className="flex w-full flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Tabs selectedKey={type} onSelectionChange={(key) => onTypeChange(String(key) as SearchType)}>
        <Tabs.ListContainer>
          <Tabs.List aria-label={texts.typeLabel}>
            <Tabs.Tab id="sales">
              {texts.sales}
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="expenses">
              {texts.expenses}
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      <div className="grid grid-cols-4 gap-4">
        <TextField
          name="dateFrom"
          type="date"
          value={filters.dateFrom}
          onChange={(value) => onChange("dateFrom", value)}
          className="col-span-2 w-full"
        >
          <Label>{texts.dateFromLabel}</Label>
          <Input />
        </TextField>

        <TextField
          name="dateTo"
          type="date"
          value={filters.dateTo}
          onChange={(value) => onChange("dateTo", value)}
          className="col-span-2 w-full"
        >
          <Label>{texts.dateToLabel}</Label>
          <Input />
        </TextField>

        {isSales ? (
          <>
            <TextField
              name="minAmount"
              value={filters.minAmount ?? ""}
              onChange={(value) => onChange("minAmount", value || null)}
              className="col-span-2 w-full"
            >
              <Label>{texts.minAmountLabel}</Label>
              <Input inputMode="decimal" />
            </TextField>

            <TextField
              name="maxAmount"
              value={filters.maxAmount ?? ""}
              onChange={(value) => onChange("maxAmount", value || null)}
              className="col-span-2 w-full"
            >
              <Label>{texts.maxAmountLabel}</Label>
              <Input inputMode="decimal" />
            </TextField>
          </>
        ) : null}

        <TextField
          name="detail"
          value={filters.detail ?? ""}
          onChange={(value) => onChange("detail", value || null)}
          className="col-span-4 w-full"
        >
          <Label>{texts.detailLabel}</Label>
          <Input />
        </TextField>

        <Select
          name="categoryId"
          value={filters.categoryId ?? ALL_OPTIONS}
          onChange={(key) => onChange("categoryId", key && key !== ALL_OPTIONS ? String(key) : null)}
          isDisabled={isLoadingCatalogs}
          className="col-span-4 w-full"
        >
          <Label>{texts.categoryLabel}</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator>
              {isLoadingCatalogs ? <Spinner size="sm" /> : <Select.Indicator />}
            </Select.Indicator>
          </Select.Trigger>
          <Select.Popover>
            <ListBox
              items={[{ id: ALL_OPTIONS, name: texts.allCategories }, ...categories]}
            >
              {(category) => (
                <ListBox.Item id={String(category.id)} textValue={category.name}>
                  {category.name}
                </ListBox.Item>
              )}
            </ListBox>
          </Select.Popover>
        </Select>

        {isSales ? (
          <Select
            name="paymentMethodId"
            value={filters.paymentMethodId ?? ALL_OPTIONS}
            onChange={(key) =>
              onChange("paymentMethodId", key && key !== ALL_OPTIONS ? String(key) : null)
            }
            isDisabled={isLoadingCatalogs}
            className="col-span-4 w-full"
          >
            <Label>{texts.paymentMethodLabel}</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator>
                {isLoadingCatalogs ? <Spinner size="sm" /> : <Select.Indicator />}
              </Select.Indicator>
            </Select.Trigger>
            <Select.Popover>
              <ListBox
                items={[{ id: ALL_OPTIONS, name: texts.allPaymentMethods }, ...paymentMethods]}
              >
                {(method) => (
                  <ListBox.Item id={String(method.id)} textValue={method.name}>
                    {method.name}
                  </ListBox.Item>
                )}
              </ListBox>
            </Select.Popover>
          </Select>
        ) : null}
      </div>

      <div className="flex gap-2">
        <Button type="submit" variant="primary">
          {texts.submit}
        </Button>
        <Button type="button" variant="outline" onPress={onClear}>
          {texts.clear}
        </Button>
      </div>
    </form>
  );
}
