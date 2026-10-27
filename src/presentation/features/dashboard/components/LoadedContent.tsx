import type { ReactNode } from "react";
import { Button, Spinner } from "@heroui/react";
import type { LoadState } from "@/presentation/features/dashboard/hooks/useLoadedData";
import { useTexts } from "@/presentation/texts/useTexts";

interface LoadedContentProps<T> {
  readonly state: LoadState<T>;
  readonly onRetry: () => void;
  readonly children: (data: T) => ReactNode;
}

export function LoadedContent<T>({ state, onRetry, children }: LoadedContentProps<T>) {
  const {
    common: { loading },
    summary: texts,
  } = useTexts();

  if (state.status === "loading") {
    return (
      <div className="flex justify-center">
        <Spinner size="sm" aria-label={loading} />
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

  return <>{children(state.data)}</>;
}
