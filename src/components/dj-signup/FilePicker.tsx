import { useCallback, useRef, useState } from "react";
import { UploadCloud, X, FileText, ImageIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  hint?: string;
  accept: string;
  max: number;
  value: FileWithPreview[];
  onChange: (files: FileWithPreview[]) => void;
  variant?: "image" | "document";
};

export type FileWithPreview = File & { preview?: string; id: string };

export function FilePicker({ label, hint, accept, max, value, onChange, variant = "image" }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFiles = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      const incoming: FileWithPreview[] = Array.from(list).slice(0, max - value.length).map((f) => {
        const fp = f as FileWithPreview;
        fp.id = `${f.name}-${f.size}-${f.lastModified}`;
        if (f.type.startsWith("image/")) fp.preview = URL.createObjectURL(f);
        return fp;
      });
      onChange([...value, ...incoming].slice(0, max));
    },
    [max, onChange, value],
  );

  const remove = (id: string) => {
    onChange(value.filter((f) => f.id !== id));
  };

  const move = (id: string, dir: -1 | 1) => {
    const next = [...value];
    const i = next.findIndex((f) => f.id === id);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-sm font-medium">{label}</div>
          {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
        </div>
        <div className="text-xs text-muted-foreground">
          {value.length} / {max}
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 px-6 py-8 text-center transition-all",
          dragging && "border-accent bg-accent/10 scale-[1.01]",
          value.length >= max && "pointer-events-none opacity-50",
        )}
      >
        <motion.div animate={{ y: dragging ? -3 : 0 }} className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
          <UploadCloud className="h-6 w-6" />
        </motion.div>
        <p className="mt-3 text-sm font-medium">
          {dragging ? "Drop to upload" : "Drag & drop or click to upload"}
        </p>
        <p className="text-xs text-muted-foreground">
          {variant === "image" ? "PNG, JPG up to 10MB" : "PDF or image up to 10MB"} · {max - value.length} slot{max - value.length === 1 ? "" : "s"} remaining
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={max > 1}
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>

      {value.length > 0 && (
        <ul className={variant === "image" ? "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" : "space-y-2"}>
          <AnimatePresence initial={false}>
            {value.map((f, i) => (
              <motion.li
                key={f.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "group relative overflow-hidden rounded-lg border bg-card",
                  variant === "image" ? "aspect-square" : "flex items-center gap-3 p-3",
                )}
              >
                {variant === "image" && f.preview && (
                  <img src={f.preview} alt={f.name} className="h-full w-full object-cover" />
                )}
                {variant === "image" && !f.preview && (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                {variant === "document" && (
                  <>
                    <FileText className="h-5 w-5 text-accent" />
                    <span className="min-w-0 flex-1 truncate text-sm">{f.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                  </>
                )}

                <div
                  className={cn(
                    "absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-white",
                    variant === "document" && "static bg-none p-0 text-foreground",
                  )}
                >
                  {variant === "image" && (
                    <span className="rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium">
                      {i === 0 ? "Cover" : `#${i + 1}`}
                    </span>
                  )}
                  <div className="ml-auto flex gap-1">
                    {value.length > 1 && (
                      <>
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-6 w-6 bg-white/90 text-foreground"
                          disabled={i === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            move(f.id, -1);
                          }}
                          aria-label="Move up"
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-6 w-6 bg-white/90 text-foreground"
                          disabled={i === value.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            move(f.id, 1);
                          }}
                          aria-label="Move down"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(f.id);
                      }}
                      aria-label="Remove"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
