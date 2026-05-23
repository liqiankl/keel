// ─────────────────────────────────────────────
// Column definitions for the scoring table.
// Each framework gets its own column list.
// ─────────────────────────────────────────────

export type ColType =
  | "rank"
  | "title"
  | "number"
  | "impact-select"   // RICE impact: 0.25 | 0.5 | 1 | 2 | 3
  | "moscow"
  | "score"           // computed, read-only
  | "goals"
  | "status";

export interface ColDef {
  id: string;          // used as data-col attribute for Tab navigation
  label: string;
  type: ColType;
  widthPx?: number;    // fixed width; undefined = flex-1
  align?: "left" | "right" | "center";
  editable?: boolean;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;     // e.g. "%" for confidence
}

export const RICE_COLUMNS: ColDef[] = [
  { id: "rank",       label: "#",           type: "rank",          widthPx: 40, align: "center" },
  { id: "title",      label: "Initiative",  type: "title",                      align: "left"   },
  { id: "reach",      label: "Reach",       type: "number",        widthPx: 72, align: "right",  editable: true,  min: 0, step: 10 },
  { id: "impact",     label: "Impact",      type: "impact-select", widthPx: 76, align: "right",  editable: true  },
  { id: "confidence", label: "Conf %",      type: "number",        widthPx: 72, align: "right",  editable: true,  min: 0, max: 100, step: 5, suffix: "%" },
  { id: "effort",     label: "Effort",      type: "number",        widthPx: 72, align: "right",  editable: true,  min: 0.1, step: 0.5 },
  { id: "riceScore",  label: "RICE Score",  type: "score",         widthPx: 88, align: "right"  },
  { id: "goals",      label: "Goals",       type: "goals",         widthPx: 128, align: "left"  },
  { id: "status",     label: "Status",      type: "status",        widthPx: 100, align: "left"  },
];

export const MOSCOW_COLUMNS: ColDef[] = [
  { id: "rank",    label: "#",          type: "rank",   widthPx: 40,  align: "center" },
  { id: "title",   label: "Initiative", type: "title",                align: "left"   },
  { id: "moscow",  label: "Priority",   type: "moscow", widthPx: 120, align: "left",  editable: true },
  { id: "goals",   label: "Goals",      type: "goals",  widthPx: 160, align: "left"  },
  { id: "status",  label: "Status",     type: "status", widthPx: 100, align: "left"  },
];

export const WSJF_COLUMNS: ColDef[] = [
  { id: "rank",         label: "#",            type: "rank",   widthPx: 40, align: "center" },
  { id: "title",        label: "Initiative",   type: "title",               align: "left"   },
  { id: "costOfDelay",  label: "Cost of Delay",type: "number", widthPx: 104, align: "right", editable: true, min: 0, step: 1 },
  { id: "jobSize",      label: "Job Size",     type: "number", widthPx: 88, align: "right", editable: true, min: 0.1, step: 0.5 },
  { id: "wsjfScore",    label: "WSJF Score",   type: "score",  widthPx: 88, align: "right"  },
  { id: "goals",        label: "Goals",        type: "goals",  widthPx: 128, align: "left"  },
  { id: "status",       label: "Status",       type: "status", widthPx: 100, align: "left"  },
];

export const RICE_EDITABLE_COL_ORDER = ["reach", "impact", "confidence", "effort"];
export const WSJF_EDITABLE_COL_ORDER = ["costOfDelay", "jobSize"];

export const IMPACT_VALUES = [0.25, 0.5, 1, 2, 3] as const;
