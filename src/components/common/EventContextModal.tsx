import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EventTypeGrid } from "./EventTypeGrid";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onSelect: (id: string) => void;
  /** Optional callback for "browse all event types" — defaults to closing without setting. */
  onBrowseAll?: () => void;
  title?: string;
  description?: string;
};

export function EventContextModal({
  open,
  onOpenChange,
  value,
  onSelect,
  onBrowseAll,
  title = "What kind of event are you planning?",
  description = "We'll show DJs that match the event type — same photos, sets, and pricing they'd bring on the night.",
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <EventTypeGrid
          value={value}
          onChange={(id) => {
            onSelect(id);
            onOpenChange(false);
          }}
          showDescription
          className="mt-2"
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <button
            type="button"
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            onClick={() => {
              if (onBrowseAll) onBrowseAll();
              onOpenChange(false);
            }}
          >
            Just let me browse all DJs
          </button>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
