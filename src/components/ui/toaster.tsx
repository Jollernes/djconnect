import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      richColors
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "rounded-md border bg-popover text-popover-foreground shadow-md",
        },
      }}
    />
  );
}

export { toast } from "sonner";
