import { Tabs } from "@heroui/react";

interface SegmentTabsProps<Id extends string> {
  readonly label: string;
  readonly value: Id;
  readonly options: readonly { readonly id: Id; readonly label: string }[];
  readonly onChange: (id: Id) => void;
}

export function SegmentTabs<Id extends string>({ label, value, options, onChange }: SegmentTabsProps<Id>) {
  return (
    <Tabs selectedKey={value} onSelectionChange={(key) => onChange(String(key) as Id)}>
      <Tabs.ListContainer>
        <Tabs.List aria-label={label}>
          {options.map((option) => (
            <Tabs.Tab key={option.id} id={option.id}>
              {option.label}
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  );
}
