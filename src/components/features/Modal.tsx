import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Modal({ open, onClose, title, children, className }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center px-4 animate-fade-in"
      style={{
        backgroundColor: "rgba(5,8,16,0.6)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full max-w-3xl bg-panel border border-border rounded-2xl shadow-2xl animate-scale-in",
          "max-h-[85vh] flex flex-col",
          className
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <div className="text-base font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="size-8 rounded-md grid place-items-center text-muted-foreground hover:text-foreground hover:bg-elevated"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-5">{children}</div>
      </div>
    </div>
  );
}
