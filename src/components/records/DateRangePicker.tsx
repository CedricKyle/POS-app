import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateRangePickerProps {
  from: string | null;
  to: string | null;
  onChange: (from: string | null, to: string | null) => void;
}

export default function DateRangePicker({
  from,
  to,
  onChange,
}: DateRangePickerProps) {
  return (
    <div className="flex items-end gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
      <div className="flex flex-1 items-end gap-2 min-w-0">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
            From
          </Label>
          <Input
            type="date"
            value={from ?? ""}
            max={to ?? undefined}
            onChange={(e) => onChange(e.target.value || null, to)}
            className="h-9 text-sm w-full"
          />
        </div>
        <span className="text-muted-foreground text-sm pb-2 shrink-0">–</span>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
            To
          </Label>
          <Input
            type="date"
            value={to ?? ""}
            min={from ?? undefined}
            onChange={(e) => onChange(from, e.target.value || null)}
            className="h-9 text-sm w-full"
          />
        </div>
      </div>
    </div>
  );
}
