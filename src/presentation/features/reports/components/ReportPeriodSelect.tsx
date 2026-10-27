import { Label, ListBox, Select } from "@heroui/react";
import { REPORT_PERIOD_IDS, type ReportPeriodId } from "@/domain/reports/reportPeriod";

interface ReportPeriodSelectProps {
  readonly label: string;
  readonly value: ReportPeriodId;
  readonly periodLabels: Record<ReportPeriodId, string>;
  readonly onChange: (periodId: ReportPeriodId) => void;
}

export function ReportPeriodSelect({ label, value, periodLabels, onChange }: ReportPeriodSelectProps) {
  const options = REPORT_PERIOD_IDS.map((id) => ({ id, label: periodLabels[id] }));

  return (
    <Select
      name="period"
      value={value}
      onChange={(key) => {
        if (key) onChange(String(key) as ReportPeriodId);
      }}
      className="w-full"
    >
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox items={options}>
          {(option) => (
            <ListBox.Item id={option.id} textValue={option.label}>
              {option.label}
            </ListBox.Item>
          )}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
