import { Accordion, Button } from "@heroui/react";
import type { NavigationEntry, NavigationItem } from "@/presentation/layout/navigationMenu";

export function NavigationList({
  entries,
  pathname,
  onNavigate,
}: {
  readonly entries: NavigationEntry[];
  readonly pathname: string;
  readonly onNavigate: (path: string) => void;
}) {
  return (
    <nav className="flex flex-col gap-2">
      {entries.map((entry) => {
        if (entry.kind === "item") {
          return (
            <NavigationLink
              key={entry.path}
              item={entry}
              isActive={pathname === entry.path}
              onPress={() => onNavigate(entry.path)}
            />
          );
        }

        const hasActiveItem = entry.items.some((item) => item.path === pathname);

        return (
          <Accordion
            key={entry.id}
            defaultExpandedKeys={hasActiveItem ? [entry.id] : []}
          >
            <Accordion.Item id={entry.id}>
              <Accordion.Heading>
                <Accordion.Trigger className="flex w-full items-center justify-start gap-3 px-4 py-2 text-sm font-medium">
                  <entry.Icon size={20} />
                  {entry.label}
                  <Accordion.Indicator className="ml-auto" />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body className="flex flex-col gap-2 pt-2">
                  {entry.items.map((item) => (
                    <NavigationLink
                      key={item.path}
                      item={item}
                      isActive={pathname === item.path}
                      isNested
                      onPress={() => onNavigate(item.path)}
                    />
                  ))}
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        );
      })}
    </nav>
  );
}

function NavigationLink({
  item,
  isActive,
  isNested = false,
  onPress,
}: {
  readonly item: NavigationItem;
  readonly isActive: boolean;
  readonly isNested?: boolean;
  readonly onPress: () => void;
}) {
  const { Icon, label } = item;

  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      aria-current={isActive ? "page" : undefined}
      className={`w-full justify-start gap-3 ${isNested ? "pl-6" : ""}`}
      onPress={onPress}
    >
      <Icon size={20} />
      {label}
    </Button>
  );
}
