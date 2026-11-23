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
  title = "Hvilken slags event planlægger du?",
  description = "Vi viser DJs, der matcher eventtypen — samme billeder, sæt og priser, som de ville tage med på aftenen.",
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
Lad mig bare se alle DJs
          </button>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Luk
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
