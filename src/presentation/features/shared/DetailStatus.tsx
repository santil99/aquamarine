import { Button, Spinner } from "@heroui/react";
import { useTexts } from "@/presentation/texts/useTexts";

type DetailStatusProps =
  | { readonly kind: "loading" }
  | { readonly kind: "notFound"; readonly message: string }
  | {
      readonly kind: "error";
      readonly message: string;
      readonly retryLabel: string;
      readonly onRetry: () => void;
    };

export function DetailStatus(props: DetailStatusProps) {
  const { common } = useTexts();

  if (props.kind === "loading") {
    return (
      <div className="flex justify-center">
        <Spinner size="sm" aria-label={common.loading} />
      </div>
    );
  }

  if (props.kind === "notFound") {
    return <p role="alert">{props.message}</p>;
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <p role="alert" className="text-danger">{props.message}</p>
      <Button variant="outline" onPress={props.onRetry}>
        {props.retryLabel}
      </Button>
    </div>
  );
}
