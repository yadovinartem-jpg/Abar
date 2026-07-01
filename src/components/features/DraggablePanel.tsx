import { ReactNode, useRef, useState, CSSProperties } from "react";
import { useEditMode } from "@/stores/editModeStore";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  children: ReactNode;
  className?: string;
}

/**
 * Draggable wrapper for main content panels.
 * Only active in edit mode. Uses CSS transform to preserve layout.
 * Position is snapped to 20px grid.
 */
export default function DraggablePanel({ id, children, className }: Props) {
  const isEditing = useEditMode((s) => s.isEditing);
  const panel = useEditMode((s) => (s.isEditing ? s.draftPanels[id] : s.panels[id]));
  const setPanelDraft = useEditMode((s) => s.setPanelDraft);
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const x = panel?.x ?? 0;
  const y = panel?.y ?? 0;

  const onMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;
    // ignore clicks on inputs, buttons, images inside
    const target = e.target as HTMLElement;
    if (target.closest("button, input, a, [data-nodrag]")) return;
    drag.current = { startX: e.clientX, startY: e.clientY, origX: x, origY: y };
    setDragging(true);
    e.preventDefault();

    const move = (ev: MouseEvent) => {
      if (!drag.current) return;
      const dx = ev.clientX - drag.current.startX;
      const dy = ev.clientY - drag.current.startY;
      const nx = Math.round((drag.current.origX + dx) / 20) * 20;
      const ny = Math.round((drag.current.origY + dy) / 20) * 20;
      setPanelDraft(id, { x: nx, y: ny });
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      drag.current = null;
      setDragging(false);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const style: CSSProperties = {
    transform: `translate(${x}px, ${y}px)`,
    transition: dragging ? "none" : "transform 200ms ease",
  };

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      style={style}
      className={cn(
        "relative",
        isEditing && "outline-2 outline-dashed outline-brand/40 hover:outline-brand outline-offset-4 rounded-2xl cursor-move",
        dragging && "z-30 opacity-90",
        className
      )}
    >
      {children}
    </div>
  );
}
