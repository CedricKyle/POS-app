import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FilterMode } from "@/store/recordsSlice";

interface RecordsFilterTabsProps {
  mode: FilterMode;
  onChange: (mode: FilterMode) => void;
}

const TABS: { value: FilterMode; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function RecordsFilterTabs({
  mode,
  onChange,
}: RecordsFilterTabsProps) {
  // When in "custom" mode, no quick tab is highlighted
  const tabValue = mode === "custom" ? "" : mode;

  return (
    <Tabs value={tabValue} onValueChange={(v) => onChange(v as FilterMode)}>
      <TabsList className="w-full">
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value} className="flex-1">
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
