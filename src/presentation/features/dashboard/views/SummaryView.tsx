import { useState } from "react";
import { getMonthStart, getTodayInTimeZone } from "@/domain/business/businessDay";
import { DateNavigator } from "@/presentation/components/DateNavigator";
import { createMonthMode } from "@/presentation/components/monthMode";
import { MonthSegment } from "@/presentation/features/dashboard/components/MonthSegment";
import { SegmentTabs } from "@/presentation/features/dashboard/components/SegmentTabs";
import { TrendSegment } from "@/presentation/features/dashboard/components/TrendSegment";
import type { SummaryLoaders } from "@/presentation/features/dashboard/summaryLoaders";
import { useTexts } from "@/presentation/texts/useTexts";

type SummarySegment = "month" | "trend";

interface SummaryViewProps {
  readonly loaders: SummaryLoaders;
  readonly timeZone: string;
}

export function SummaryView({ loaders, timeZone }: SummaryViewProps) {
  const today = getTodayInTimeZone(timeZone);
  const currentMonth = getMonthStart(today);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [segment, setSegment] = useState<SummarySegment>("month");
  const {
    common: { locale, monthNavigator },
    summary: { segments },
  } = useTexts();
  const monthMode = createMonthMode({ locale, today, texts: monthNavigator });

  return (
    <section className="flex w-full max-w-none flex-col gap-4">
      <DateNavigator mode={monthMode} date={selectedMonth} onDateChange={setSelectedMonth} />
      <SegmentTabs
        label={segments.label}
        value={segment}
        options={[
          { id: "month", label: segments.month },
          { id: "trend", label: segments.trend },
        ]}
        onChange={setSegment}
      />
      {segment === "month" && (
        <MonthSegment key={selectedMonth} loaders={loaders} monthStart={selectedMonth} />
      )}
      {segment === "trend" && (
        <TrendSegment
          key={selectedMonth}
          loaders={loaders}
          monthStart={selectedMonth}
          currentMonth={currentMonth}
        />
      )}
    </section>
  );
}
