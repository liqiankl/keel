"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({ content, children, placement = "top", className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const anchorRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => {
      if (!anchorRef.current) return;
      const r = anchorRef.current.getBoundingClientRect();
      let x = 0, y = 0;
      switch (placement) {
        case "top":    x = r.left + r.width / 2;  y = r.top - 8;             break;
        case "bottom": x = r.left + r.width / 2;  y = r.bottom + 8;          break;
        case "left":   x = r.left - 8;             y = r.top + r.height / 2;  break;
        case "right":  x = r.right + 8;            y = r.top + r.height / 2;  break;
      }
      setCoords({ x, y });
      setVisible(true);
    }, 150);
  }, [placement]);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const transformMap = {
    top:    "translate(-50%, -100%)",
    bottom: "translate(-50%, 0)",
    left:   "translate(-100%, -50%)",
    right:  "translate(0, -50%)",
  };

  return (
    <>
      <span
        ref={anchorRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className={cn("inline-flex", className)}
      >
        {children}
      </span>

      {visible && typeof window !== "undefined" && createPortal(
        <span
          role="tooltip"
          className={cn(
            "fixed z-[9999] pointer-events-none whitespace-nowrap",
            "rounded-md px-2.5 py-1.5",
            "text-[11px] font-medium leading-none tracking-wide",
            "animate-in fade-in duration-75",
          )}
          style={{
            left: coords.x,
            top: coords.y,
            transform: transformMap[placement],
            backgroundColor: "#0e0e12",
            color: "#e0e0e8",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.32), 0 0 0 0.5px rgba(0,0,0,0.2)",
            letterSpacing: "0.01em",
          }}
        >
          {content}
        </span>,
        document.body,
      )}
    </>
  );
}
