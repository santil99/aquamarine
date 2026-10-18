import { Button, Card } from "@heroui/react";
import { Eye } from "lucide-react";
import type { SaleSearchItem } from "@/domain/sales/saleSearch";
import { formatArsAmount } from "@/presentation/formatters/amount";
import { formatTransactionDate } from "@/presentation/formatters/transactionDate";
import { useTexts } from "@/presentation/texts/useTexts";

interface TransactionCardProps {
  readonly item: SaleSearchItem;
  readonly onOpen: (saleId: string) => void;
}

export function TransactionCard({ item, onOpen }: TransactionCardProps) {
  const { common, search: texts } = useTexts();

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start gap-4">
        {/* Columna izquierda: Categoría, detalle y metadatos */}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <p className="font-bold text-foreground">{item.category}</p>
          <p className="text-sm line-clamp-2 text-default-600" title={item.detail ?? undefined}>
            {item.detail ?? texts.noDetail}
          </p>
          <div className="flex gap-2 text-xs text-default-400 mt-1">
            <span>{formatTransactionDate(item.transactionDate, common.locale)}</span>
            <span>•</span>
            <span>{item.paymentMethod ?? texts.noPaymentMethod}</span>
          </div>
        </div>

        {/* Columna derecha: Monto y botón de acción */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <p
            className="font-semibold text-foreground"
            style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}
          >
            {formatArsAmount(item.amount, common.locale)}
          </p>
          <Button
            isIconOnly
            aria-label={texts.viewDetail}
            variant="outline"
            size="sm"
            onPress={() => onOpen(item.id)}
          >
            <Eye size={20} />
          </Button>
        </div>
      </div>
    </Card>
  );
}