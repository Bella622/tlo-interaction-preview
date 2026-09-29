import { useState, Fragment, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import TopNav from "@/components/TopNav";
import UpdateDecisionModal from "@/components/UpdateDecisionModal";
import RecalculationModal from "@/components/RecalculationModal";
import Notification from "@/components/Notification";

interface Props {
  onBack: () => void;
  source?: "planner" | "coordinator";
  onRouteConfirmed?: (name: string) => void;
}

const FONT_REG = { fontFamily: "'Bosch Sans:Regular', sans-serif" } as const;
const FONT_BOLD = { fontFamily: "'Bosch Sans:Bold', sans-serif" } as const;

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
      <path d="M4 6L8 10L12 6" stroke="#595E62" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="#595E62" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1v8M4 6l3 3 3-3M2 10v2a1 1 0 001 1h8a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="#007BC0" strokeWidth="1.2" />
      <path d="M7 6.5v3.5M7 4.5v.5" stroke="#007BC0" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1.5" y="2.5" width="11" height="10" rx="1" stroke="#595E62" strokeWidth="1.2" />
      <path d="M5 1v3M9 1v3M1.5 6h11" stroke="#595E62" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Scenario Summary ─────────────────────────────────────────────────────────

const KPI_CARDS = [
  { label: "Total Cost",             sap: "€ 1,250", auto: "€ 980", manual: "-" },
  { label: "Transportation Cost",    sap: "€ 1,600", auto: "€ 850", manual: "-" },
  { label: "Inventory Capital Cost", sap: "€ 900", auto: "€ 1,050", manual: "-" },
  { label: "Truck Utilization",      sap: "27.5%",   auto: "27.5%",   manual: "-" },
  { label: "Liquid Utilization",     sap: "21.4%",   auto: "23.9%",   manual: "-" },
  { label: "DIO Impact",             sap: "?",       auto: "?",       manual: "?" },
];

function InfoDot() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="5.5" cy="5.5" r="5" stroke="#71767C" strokeWidth="0.75" />
      <path d="M5.5 4.5v3M5.5 3.5v.5" stroke="#71767C" strokeWidth="0.75" strokeLinecap="round" />
    </svg>
  );
}

function ScenarioSummary() {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white border border-[rgba(0,0,0,0.06)] shadow-sm">
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full px-6 py-4 text-left"
      >
        <span className="text-[18px] text-[#424c58]" style={FONT_BOLD}>Scenario Summary</span>
        <ChevronDown open={open} />
      </button>

      {open && (
        <div className="px-6 pb-4 overflow-x-auto">
          <div className="flex gap-2" style={{ minWidth: 1328 }}>
            {KPI_CARDS.map((kpi) => (
              <div
                key={kpi.label}
                className="bg-white flex-1 relative"
                style={{ border: "1px solid rgba(0,0,0,0.06)", height: 136, minWidth: 200 }}
              >
                <div className="flex flex-col gap-3 p-3 h-full justify-center">
                  {/* KPI label + info icon */}
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] text-[#2e3033] overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0" style={FONT_BOLD}>
                      {kpi.label}
                    </p>
                    <InfoDot />
                  </div>

                  {/* SAP / Automated / Manual rows */}
                  <div className="flex flex-col gap-[6px]">
                    {/* SAP */}
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-[rgba(0,0,0,0.45)]" style={FONT_REG}>SAP</p>
                      <p className="text-[14px] text-[#595e62] text-right" style={FONT_REG}>{kpi.sap}</p>
                    </div>
                    {/* Automated — highlighted row */}
                    <div
                      className="flex items-center justify-between h-[30px] px-3"
                      style={{ background: "#f7f8f9" }}
                    >
                      <p className="text-[12px] text-[#2e3033] whitespace-nowrap" style={FONT_BOLD}>Automated</p>
                      <p className="text-[14px] text-[#007bc0] text-right" style={FONT_BOLD}>{kpi.auto}</p>
                    </div>
                    {/* Manual */}
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-[rgba(0,0,0,0.45)]" style={FONT_REG}>Manual</p>
                      <p className="text-[14px] text-[#595e62] text-right" style={FONT_REG}>{kpi.manual}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Transport Comparison Table ───────────────────────────────────────────────

type DayData = {
  weekday: string;
  date: string;
  highlight?: boolean;
  pickup?: boolean;
  badge?: string;
  badgeBlue?: boolean;
};

const SHARED_WEEKS: { label: string; days: DayData[] }[] = [
  {
    label: "Week 23",
    days: [
      { weekday: "Mon", date: "10/05" },
      { weekday: "Tue", date: "10/06" },
      { weekday: "Wed", date: "10/07", badge: "H", badgeBlue: true },
      { weekday: "Thu", date: "10/08" },
      { weekday: "Fri", date: "10/09", pickup: true },
      { weekday: "Sat", date: "10/10" },
      { weekday: "Sun", date: "10/11" },
    ],
  },
  {
    label: "Week 24",
    days: [
      { weekday: "Mon", date: "10/12", pickup: true },
      { weekday: "Tue", date: "10/13" },
      { weekday: "Wed", date: "10/14" },
      { weekday: "Thu", date: "10/15" },
      { weekday: "Fri", date: "10/16", pickup: true },
      { weekday: "Sat", date: "10/17" },
      { weekday: "Sun", date: "10/18" },
    ],
  },
  {
    label: "Week 25",
    days: [
      { weekday: "Mon", date: "10/19", pickup: true },
      { weekday: "Tue", date: "10/20" },
      { weekday: "Wed", date: "10/21" },
      { weekday: "Thu", date: "10/22" },
      { weekday: "Fri", date: "10/23", pickup: true },
      { weekday: "Sat", date: "10/24" },
      { weekday: "Sun", date: "10/25" },
    ],
  },
];

const T_WEEKS = SHARED_WEEKS;
const T_DAYS: DayData[] = T_WEEKS.flatMap(w => w.days);

const T_GROUPS: {
  label: string;
  labelColor: string;
  bgGroup: string;
  bgRow: string;
  metrics: { name: string; values: string[]; isBar?: boolean }[];
}[] = [
  {
    label: "SAP Scenario",
    labelColor: "#007bc0",
    bgGroup: "white",
    bgRow: "white",
    metrics: [
      { name: "LDM Utilization",    values: ["60%","13.3%","79.6%","73.4%","33.3%","—","—", "48%","82.1%","91.5%","67.3%","45.2%","—","—", "55%","38.7%","76.4%","83.1%","29.8%","—","—"] },
      { name: "Liquid Utilization", values: ["60%","3.2%","79.6%","26.9%","31.5%","—","—",  "52%","41.0%","85.3%","31.2%","27.8%","—","—", "48%","22.4%","71.9%","64.5%","35.1%","—","—"] },
      { name: "Cost (€)",           values: ["125","125","125","125","125","—","—",           "125","125","125","125","125","—","—",           "125","125","125","125","125","—","—"] },
    ],
  },
  {
    label: "Automated Scenario",
    labelColor: "#007bc0",
    bgGroup: "#f0f7ff",
    bgRow: "#f7fbff",
    metrics: [
      { name: "LDM Utilization",    values: ["60%","13.3%","79.6%","73.4%","33.3%","—","—", "48%","82.1%","91.5%","67.3%","45.2%","—","—", "55%","38.7%","76.4%","83.1%","29.8%","—","—"] },
      { name: "Liquid Utilization", values: ["60%","3.2%","79.6%","26.9%","31.5%","—","—",  "52%","41.0%","85.3%","31.2%","27.8%","—","—", "48%","22.4%","71.9%","64.5%","35.1%","—","—"] },
      { name: "Cost (€)",           values: ["125","125","125","125","125","—","—",           "125","125","125","125","125","—","—",           "125","125","125","125","125","—","—"] },
    ],
  },
  {
    label: "Manual Scenario",
    labelColor: "#007bc0",
    bgGroup: "white",
    bgRow: "white",
    metrics: [
      { name: "LDM Utilization",    values: ["0.0%","45.5%","153.8%","215.2%","0.0%","—","—", "0.0%","38.2%","142.1%","198.4%","0.0%","—","—", "0.0%","51.7%","167.3%","224.6%","0.0%","—","—"] },
      { name: "Liquid Utilization", values: ["0.0%","30.7%","153.8%","158.1%","0.0%","—","—", "0.0%","28.4%","138.6%","149.3%","0.0%","—","—", "0.0%","33.1%","161.4%","172.8%","0.0%","—","—"] },
      { name: "Cost (€)",           values: ["—","480","480","480","—","—","—",          "—","480","480","480","—","—","—",          "—","480","480","480","—","—","—"] },
    ],
  },
];

const OPT_ROWS = [
  { name: "Ava. pallets",         values: ["13","27","15","8","20","0","0", "11","24","18","6","22","0","0", "14","19","21","9","17","0","0"] },
  { name: "Ava. pallet places",   values: ["6","13","8","4","10","0","0",   "5","11","9","3","11","0","0",   "7","9","10","4","8","0","0"] },
  { name: "Ava. weight capacity", values: ["2799","6778","1426","5225","4797","0","0", "2450","5900","1800","4800","5100","0","0", "3100","6200","2100","5500","4300","0","0"] },
  { name: "Ava. LDM capacity",    values: ["2.4","5.2","3.1","1.6","4.0","0","0",       "2.1","4.8","3.5","1.4","4.3","0","0",       "2.7","5.0","3.8","1.9","3.8","0","0"] },
];

function TruckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="5" width="10" height="7" rx="1" stroke="#595E62" strokeWidth="1.2"/>
      <path d="M11 7h2.5L15 10v2h-4V7z" stroke="#595E62" strokeWidth="1.2"/>
      <circle cx="4" cy="13" r="1.5" fill="#595E62"/>
      <circle cx="12.5" cy="13" r="1.5" fill="#595E62"/>
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M6.5 1L9 3.5L6.5 6H5L3.5 7.5V6H2L4.5 3.5V2L6.5 1Z" fill="#007bc0"/>
      <line x1="2" y1="8" x2="3.5" y2="6.5" stroke="#007bc0" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

const TRUCK_TYPES_INFO = [
  {
    label: "Truck type 1",
    highlighted: false,
    stats: [
      { name: "Max sum pallet", value: "40" },
      { name: "Max pallet places", value: "20" },
      { name: "Max Weight", value: "12,000" },
      { name: "Max LDM", value: "8.5" },
    ],
  },
  {
    label: "Truck type 2",
    highlighted: true,
    stats: [
      { name: "Max sum pallet", value: "40" },
      { name: "Max pallet places", value: "20" },
      { name: "Max Weight", value: "12,000" },
      { name: "Max LDM", value: "8.5" },
    ],
  },
];

const TRUCK_OPTIONS = ["Truck type 1", "Truck type 2", "Truck type 3"];

function TruckTypePicker({ pos, slot, onClose, onSelect }: {
  pos: { top: number; left: number };
  slot: number;
  onClose: () => void;
  onSelect: (type: string) => void;
}) {
  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-white py-[6px]"
        style={{ top: pos.top, left: pos.left, width: 145, boxShadow: "0px 8px_12px rgba(0,0,0,0.12), 0px 2px 4px rgba(0,0,0,0.16)", border: "0.75px solid #eff1f2" }}
      >
        <div className="px-[10px] py-[4px]">
          <span className="text-[10px] text-[#2e3033]" style={FONT_BOLD}>
            {slot === 0 ? "Select truck type" : "Add truck"}
          </span>
        </div>
        {TRUCK_OPTIONS.map(opt => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className="flex items-center justify-between px-[10px] h-[24px] w-full hover:bg-[#f5f5f7] transition-colors"
          >
            <span className="text-[10px] text-[#43464a]" style={FONT_REG}>{opt}</span>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <circle cx="5.5" cy="5.5" r="5" stroke="#71767C" strokeWidth="0.75"/>
              <path d="M5.5 7.33V5.5M5.5 3.67H5.505" stroke="#71767C" strokeLinecap="round" strokeWidth="0.75"/>
            </svg>
          </button>
        ))}
      </div>
    </>,
    document.body
  );
}

function TruckInfoPopover({ pos, onClose }: { pos: { top: number; left: number }; onClose: () => void }) {
  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-white border border-[#e0e2e5] shadow-[0px_4px_12px_rgba(0,0,0,0.15)] p-[10px] flex flex-col gap-[12px]"
        style={{ top: pos.top, left: pos.left, minWidth: 280 }}
      >
        {TRUCK_TYPES_INFO.map((truck) => (
          <div key={truck.label} className="flex flex-col gap-[8px]">
            <div
              className="flex items-center justify-center px-[2px] py-[2px] rounded-[2px]"
              style={{
                background: truck.highlighted ? "rgba(230,247,255,0.5)" : "#f5f5f7",
                border: truck.highlighted ? "0.25px solid #d1e4ff" : "0.25px solid #e0e2e5",
              }}
            >
              <span
                className="text-[10px] leading-[9px]"
                style={{ fontFamily: "'Bosch Sans:Regular', sans-serif", color: truck.highlighted ? "#007bc0" : "#2e3033" }}
              >
                {truck.label}
              </span>
            </div>
            <div className="flex gap-[8px]">
              {truck.stats.map((stat) => (
                <div key={stat.name} className="flex flex-col items-start">
                  <span className="text-[8px] leading-[9px] text-[#595e62]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>
                    {stat.name}
                  </span>
                  <span
                    className="text-[10px] leading-[18px]"
                    style={{ fontFamily: "'Bosch Sans:Bold', sans-serif", color: truck.highlighted ? "#007bc0" : "#2e3033" }}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>,
    document.body
  );
}

type DayHighlightProps = {
  hoveredDay?: number | null;
  clickedDay?: number | null;
  isSource?: boolean;
  onDayHover?: (di: number) => void;
  onDayClick?: (di: number) => void;
  onDayLeave?: () => void;
};

function TransportTable({ scrollRef, noScroll, hoveredDay, clickedDay, isSource, onDayHover, onDayClick, onDayLeave }: { scrollRef?: React.RefObject<HTMLDivElement | null>; noScroll?: boolean } & DayHighlightProps) {
  const [optOpen, setOptOpen] = useState(false);
  const [visibleWidth, setVisibleWidth] = useState(0);
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const effectiveScrollRef = (scrollRef ?? internalScrollRef) as React.RefObject<HTMLDivElement>;
  useEffect(() => {
    const el = effectiveScrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setVisibleWidth(el.clientWidth));
    ro.observe(el);
    setVisibleWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const [truckInfoOpen, setTruckInfoOpen] = useState<string | null>(null);
  const [truckInfoPos, setTruckInfoPos] = useState({ top: 0, left: 0 });
  const truckBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [daysWithSecondTruck, setDaysWithSecondTruck] = useState<Set<number>>(new Set());
  const [truckTypes, setTruckTypes] = useState<Record<string, string>>({});
  const [openPicker, setOpenPicker] = useState<{ di: number; slot: number } | null>(null);
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });
  const truckCellRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const openTruckPicker = (key: string, di: number, slot: number) => {
    const btn = truckCellRefs.current[key];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setPickerPos({ top: rect.bottom + 2, left: rect.left });
    }
    setOpenPicker({ di, slot });
  };

  const handleTruckInfo = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (truckInfoOpen === label) { setTruckInfoOpen(null); return; }
    const btn = truckBtnRefs.current[label];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setTruckInfoPos({ top: rect.bottom + 4, left: rect.left });
    }
    setTruckInfoOpen(label);
  };

  const headerBg = (_day: DayData) => "bg-[#f2f3f5]";
  const dataCellBg = (_day: DayData, rowBg: string) => rowBg;

  const dayColBg = (di: number, base: string) => {
    const isWhite = base === "white";
    if (clickedDay === di) return isSource ? (isWhite ? "#9dcce8" : "#85bce3") : (isWhite ? "#dff0fb" : "#cce5f6");
    if (hoveredDay === di) return isSource ? (isWhite ? "#b8daf0" : "#9dcce8") : (isWhite ? "#eaf5fd" : "#d6ecf8");
    return base;
  };
  const dayHeaderBg = (di: number) => {
    if (clickedDay === di) return isSource ? "#5aa8d4" : "#cce5f6";
    if (hoveredDay === di) return isSource ? "#7ebfe0" : "#d4ecf9";
    return "#f2f3f5";
  };
  const dayEvents = (di: number) => ({
    onMouseEnter: () => onDayHover?.(di),
    onMouseLeave: onDayLeave,
    onClick: () => onDayClick?.(di),
  });

  const COL_GROUP = 90;
  const COL_METRIC = 198;
  const COL_DAY = 122;
  const totalMin = COL_GROUP + COL_METRIC + T_DAYS.length * COL_DAY;

  const portals = (
    <>
      {truckInfoOpen && (
        <TruckInfoPopover pos={truckInfoPos} onClose={() => setTruckInfoOpen(null)} />
      )}
      {openPicker && (
        <TruckTypePicker
          pos={pickerPos}
          slot={openPicker.slot}
          onClose={() => setOpenPicker(null)}
          onSelect={type => {
            const { di, slot } = openPicker;
            setTruckTypes(prev => ({ ...prev, [`${di}-${slot}`]: type }));
            if (slot === 1) setDaysWithSecondTruck(prev => new Set([...prev, di]));
            setOpenPicker(null);
          }}
        />
      )}
    </>
  );

  const tableEl = (
    <table className="border-collapse w-full" style={{ minWidth: totalMin }}>
      <colgroup>
        <col style={{ width: COL_GROUP }} />
        <col style={{ width: COL_METRIC }} />
        {T_DAYS.map((_, i) => (
          <col key={i} style={{ width: COL_DAY }} />
        ))}
      </colgroup>
        <thead>
          {/* Week group header */}
          <tr>
            <th className="sticky left-0 z-20 bg-[#f2f3f5] border-b border-r border-[#e0e2e5]" rowSpan={2} />
            <th className="sticky left-[90px] z-20 bg-[#f2f3f5] border-b border-r border-[#e0e2e5]" rowSpan={2}>
              <span className="block px-3 text-left text-[11px] text-[#595e62]" style={FONT_REG}>Scenario</span>
            </th>
            {T_WEEKS.map((wk) => (
              <th
                key={wk.label}
                colSpan={wk.days.length}
                className="border-b border-r border-[#e0e2e5] px-2 py-1.5 text-center text-[11px] text-[#2e3033] bg-[#f2f3f5]"
                style={FONT_BOLD}
              >
                {wk.label}
              </th>
            ))}
          </tr>
          {/* Weekday + date + badge row */}
          <tr>
            {T_DAYS.map((day, di) => (
              <th key={di}
                className="border-b border-r border-[#e0e2e5] px-1 pt-1.5 pb-1 text-center relative cursor-pointer"
                style={{ background: dayHeaderBg(di), ...(day.pickup ? { boxShadow: "inset 0 0 0 1.5px #18837E" } : {}) }}
                {...dayEvents(di)}
              >
                {day.pickup && (
                  <div style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderTop: "13px solid #18837E", borderLeft: "13px solid transparent" }} />
                )}
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <span className="text-[12px] font-bold text-[#2e3033]" style={FONT_BOLD}>{day.weekday}</span>
                  {day.badge && (
                    <span
                      className="inline-flex items-center justify-center text-[8px] font-bold text-white rounded px-[3px]"
                      style={{ ...FONT_BOLD, background: day.badgeBlue ? "#007bc0" : "#71767c", lineHeight: "13px" }}
                    >
                      {day.badge}
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-[#595e62]" style={FONT_REG}>{day.date}</div>
              </th>
            ))}
          </tr>
          {/* (Truck 12t row removed) */}
          <tr className="hidden">
            {T_DAYS.map((day, di) => (
              <th key={di} className={`border-b border-r border-[#e0e2e5] px-1.5 py-1 ${headerBg(day)}`}>
                <div></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {T_GROUPS.map((group) => {
            const isAuto = group.label === "Automated Scenario";
            const isManual = group.label === "Manual Scenario";

            if (isManual) {
              const totalRows = group.metrics.length + 1; // truck row + metric rows
              return (
                <Fragment key={group.label}>
                  {/* ── Truck type selection row ── */}
                  <tr className="border-b border-[#e0e2e5] bg-white">
                    {/* Group label — spans truck row + all metric rows */}
                    <td
                      className="sticky left-0 z-10 border-r border-[#e0e2e5] p-0 align-top bg-white"
                      rowSpan={totalRows}
                    >
                      <div className="flex flex-col items-start gap-2 px-3 py-3">
                        <div className="flex items-center gap-[4px]">
                          <PinIcon />
                          <span style={{ ...FONT_BOLD, color: "#007bc0", fontSize: 13, lineHeight: "17px" }}>
                            Manual<br />Scenario
                          </span>
                        </div>
                        <button
                          ref={el => { truckBtnRefs.current["Manual Scenario"] = el; }}
                          onClick={e => handleTruckInfo("Manual Scenario", e)}
                          className="flex items-center gap-[3px] border border-[#d0d4d8] rounded-[2px] px-[5px] py-[2px] bg-[#f5f5f7] w-full hover:bg-[#e6f4ff] hover:border-[#007bc0] transition-colors"
                        >
                          <span className="text-[9px] text-[#595e62] flex-1 text-left" style={FONT_REG}>Truck Info</span>
                          <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
                            <path d="M1 1l3 3 3-3" stroke="#007BC0" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                    {/* "Truck Utilization" metric header */}
                    <td className="sticky left-[90px] z-10 border-r border-[#e0e2e5] px-3 py-1.5 bg-white">
                      <div className="flex items-center gap-[3px]">
                        <span className="text-[11px] text-[#2e3033]" style={FONT_BOLD}>Truck Info</span>
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                          <path d="M2 3.5l3 3 3-3" stroke="#007BC0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </td>
                    {/* Truck type dropdown per day */}
                    {T_DAYS.map((day, di) => {
                      const isWeekend = day.weekday === "Sat" || day.weekday === "Sun";
                      const bg = dayColBg(di, "white");
                      const hasSecond = daysWithSecondTruck.has(di);
                      const truck0 = truckTypes[`${di}-0`] || "Truck type 1";
                      const truck1 = truckTypes[`${di}-1`] || "Truck type 1";
                      return (
                        <td key={di} className="border-r border-[#e0e2e5] px-1 py-[5px]" style={{ background: bg }} {...dayEvents(di)}>
                          {isWeekend ? (
                            <div className="text-center text-[10px] text-[#c0c4c8]" style={FONT_REG}>—</div>
                          ) : (
                            <div className="flex items-center gap-[3px]">
                              {/* Primary truck dropdown */}
                              <button
                                ref={el => { truckCellRefs.current[`drop-${di}-0`] = el; }}
                                onClick={() => openTruckPicker(`drop-${di}-0`, di, 0)}
                                className="flex-1 bg-[#f5f5f7] border border-[#e0e2e5] rounded-[2px] flex items-center justify-between px-[3px] py-[2px] min-w-0 overflow-hidden hover:border-[#007bc0] transition-colors"
                              >
                                <span className="text-[8px] text-[#2e3033] truncate leading-tight" style={FONT_REG}>{truck0}</span>
                                <svg width="7" height="5" viewBox="0 0 8 5" fill="none" className="shrink-0 ml-0.5">
                                  <path d="M1 1l3 3 3-3" stroke="#007BC0" strokeWidth="1.2" strokeLinecap="round"/>
                                </svg>
                              </button>
                              {/* Second truck dropdown */}
                              {hasSecond && (
                                <button
                                  ref={el => { truckCellRefs.current[`drop-${di}-1`] = el; }}
                                  onClick={() => openTruckPicker(`drop-${di}-1`, di, 1)}
                                  className="flex-1 border rounded-[2px] flex items-center justify-between px-[3px] py-[2px] min-w-0 overflow-hidden hover:border-[#007bc0] transition-colors"
                                  style={{ background: "rgba(230,247,255,0.5)", borderColor: "#d1e4ff" }}
                                >
                                  <span className="text-[8px] text-[#007bc0] truncate leading-tight" style={FONT_REG}>{truck1}</span>
                                  <svg width="7" height="5" viewBox="0 0 8 5" fill="none" className="shrink-0 ml-0.5">
                                    <path d="M1 1l3 3 3-3" stroke="#007BC0" strokeWidth="1.2" strokeLinecap="round"/>
                                  </svg>
                                </button>
                              )}
                              {/* + / × button */}
                              {hasSecond ? (
                                <button
                                  onClick={() => setDaysWithSecondTruck(prev => { const s = new Set(prev); s.delete(di); return s; })}
                                  className="flex items-center justify-center shrink-0"
                                  style={{ background: "#005587", borderRadius: 7, width: 14, height: 14 }}
                                >
                                  <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                                    <path d="M1.5 1.5l4 4M5.5 1.5l-4 4" stroke="white" strokeWidth="1.1" strokeLinecap="round"/>
                                  </svg>
                                </button>
                              ) : (
                                <button
                                  ref={el => { truckCellRefs.current[`add-${di}`] = el; }}
                                  onClick={() => openTruckPicker(`add-${di}`, di, 1)}
                                  className="bg-[#007bc0] rounded-full flex items-center justify-center shrink-0 hover:bg-[#006aa8] transition-colors"
                                  style={{ width: 14, height: 14 }}
                                >
                                  <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                                    <path d="M3 1v4M1 3h4" stroke="white" strokeWidth="1.1" strokeLinecap="round"/>
                                  </svg>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* ── Metric rows ── */}
                  {group.metrics.map((metric, mi) => (
                    <tr key={`${group.label}-${mi}`} className="border-b border-[#e0e2e5] bg-white">
                      {/* Metric name */}
                      <td className="sticky left-[90px] z-10 border-r border-[#e0e2e5] px-3 py-1.5 bg-white">
                        <span className="text-[11px] text-[#2e3033]" style={FONT_BOLD}>{metric.name}</span>
                      </td>
                      {T_DAYS.map((day, di) => {
                        const val = metric.values[di];
                        const isEmpty = val === "—";
                        const bg = dayColBg(di, "white");
                        const hasSecond = daysWithSecondTruck.has(di);
                        const truck0 = truckTypes[`${di}-0`] || "Truck type 1";
                        const truck1 = truckTypes[`${di}-1`] || "Truck type 2";
                        const isPercent = val.endsWith("%");

                        // Derive second truck value: split % evenly, duplicate cost
                        const truck0Val = (() => {
                          if (isEmpty || !hasSecond) return val;
                          if (isPercent) {
                            const n = parseFloat(val);
                            return `${(n / 2).toFixed(1).replace(/\.0$/, "")}%`;
                          }
                          return val;
                        })();
                        const truck1Val = truck0Val;

                        if (hasSecond && !isEmpty) {
                          return (
                            <td key={di} className="border-r border-[#e0e2e5] px-0 py-0" style={{ background: bg }} {...dayEvents(di)}>
                              <div className="flex divide-x divide-[#e0e2e5] h-full">
                                <div className="flex-1 flex flex-col items-center justify-center px-[4px] py-[3px] gap-[1px]">
                                  <span className="text-[8px] text-[#595e62] leading-tight truncate w-full text-center" style={FONT_REG}>{truck0}</span>
                                  <span className="text-[10px] text-[#2e3033]" style={FONT_BOLD}>{truck0Val}</span>
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-center px-[4px] py-[3px] gap-[1px]">
                                  <span className="text-[8px] text-[#007bc0] leading-tight truncate w-full text-center" style={FONT_REG}>{truck1}</span>
                                  <span className="text-[10px] text-[#007bc0]" style={FONT_BOLD}>{truck1Val}</span>
                                </div>
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td key={di} className="border-r border-[#e0e2e5] px-2 py-1.5 text-center text-[11px]" style={{ ...FONT_BOLD, background: bg, color: isEmpty ? "#c0c4c8" : "#2e3033" }} {...dayEvents(di)}>
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              );
            }

            // ── SAP / Automated: same horizontal-label style as Manual ──
            const labelLines = group.label.split(" ");
            const labelLine1 = labelLines[0]; // "SAP" or "Automated"
            const labelLine2 = labelLines.slice(1).join(" "); // "Scenario"
            return (
              <Fragment key={group.label}>
                {group.metrics.map((metric, mi) => (
                  <tr
                    key={`${group.label}-${mi}`}
                    className="border-b border-[#e0e2e5]"
                    style={{ background: group.bgRow }}
                  >
                    {mi === 0 && (
                      <td
                        className="sticky left-0 z-10 border-r border-[#e0e2e5] p-0 align-top"
                        rowSpan={group.metrics.length}
                        style={{ background: group.bgGroup }}
                      >
                        <div className="flex flex-col items-start gap-2 px-3 py-3">
                          <div className="flex items-center gap-[4px]">
                            <PinIcon />
                            <span style={{ ...FONT_BOLD, color: group.labelColor, fontSize: 13, lineHeight: "17px" }}>
                              {labelLine1}<br />{labelLine2}
                            </span>
                          </div>
                          <button
                            ref={el => { truckBtnRefs.current[group.label] = el; }}
                            onClick={e => handleTruckInfo(group.label, e)}
                            className="flex items-center gap-[3px] border border-[#d0d4d8] rounded-[2px] px-[5px] py-[2px] bg-[#f5f5f7] w-full hover:bg-[#e6f4ff] hover:border-[#007bc0] transition-colors"
                          >
                            <span className="text-[9px] text-[#595e62] flex-1 text-left" style={FONT_REG}>Truck Info</span>
                            <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
                              <path d="M1 1l3 3 3-3" stroke="#007BC0" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="sticky left-[90px] z-10 border-r border-[#e0e2e5] px-3 py-1.5" style={{ background: group.bgGroup }}>
                      <div className="flex items-center gap-[3px]">
                        <span className="text-[11px]" style={{ ...FONT_BOLD, color: isAuto ? "#007bc0" : "#2e3033" }}>
                          {metric.name}
                        </span>
                        {!isAuto && (
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="shrink-0">
                            <circle cx="6" cy="6" r="5" stroke="#71767C" strokeWidth="0.8"/>
                            <path d="M6 5v3.5M6 3.5v.5" stroke="#71767C" strokeWidth="0.8" strokeLinecap="round"/>
                          </svg>
                        )}
                      </div>
                    </td>
                    {T_DAYS.map((day, di) => {
                      const val = metric.values[di];
                      const isEmpty = val === "—";
                      const bg = dayColBg(di, group.bgRow);
                      const isCost = metric.name === "Cost (€)";
                      return (
                        <td key={di} className="border-r border-[#e0e2e5] px-2 py-1.5 text-center text-[11px]"
                          style={{ background: bg, ...(isCost && !isEmpty ? FONT_BOLD : FONT_REG) }} {...dayEvents(di)}>
                          <span style={{ color: isEmpty ? "#c0c4c8" : (isAuto ? "#007bc0" : "#2e3033") }}>{val}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            );
          })}

          {/* Optional Transportation Information toggle row */}
          <tr className="border-t border-[#e0e2e5]">
            <td colSpan={2 + T_DAYS.length} className="p-0">
              <div style={{ position: "sticky", left: 0, width: visibleWidth || "100%" }}>
                <button
                  onClick={() => setOptOpen(v => !v)}
                  className="flex items-center gap-2 w-full px-4 py-2 bg-[#f7f8f9] hover:bg-[#eef0f2] text-left transition-colors border-b border-[#e0e2e5]"
                >
                  <ChevronDown open={optOpen} />
                  <span className="text-[11px] font-bold text-[#2e3033]" style={FONT_BOLD}>Optional Transportation Information</span>
                </button>
              </div>
            </td>
          </tr>

          {/* Optional rows — same tbody, guaranteed column alignment */}
          {optOpen && OPT_ROWS.map((row, ri) => (
            <tr key={ri} className="border-b border-[#e0e2e5] bg-white">
              {ri === 0 && (
                <td
                  className="border-r border-[#e0e2e5] px-0.5 text-center align-middle bg-[#f7f8f9]"
                  rowSpan={OPT_ROWS.length}
                >
                  <span
                    className="block text-[9px] text-[#595e62]"
                    style={{ ...FONT_REG, writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap" }}
                  >
                    Available Capacity
                  </span>
                </td>
              )}
              <td className="border-r border-[#e0e2e5] px-3 py-1.5 bg-[#fafafa]">
                <span className="text-[11px] text-[#595e62]" style={FONT_REG}>{row.name}</span>
              </td>
              {T_DAYS.map((day, di) => {
                const val = row.values[di];
                const isZero = val === "0";
                return (
                  <td
                    key={di}
                    className="border-r border-[#e0e2e5] px-2 py-1.5 text-center text-[11px]"
                    style={{ ...FONT_REG, background: dayColBg(di, "white"), color: isZero ? "#c0c4c8" : "#2e3033" }}
                    {...dayEvents(di)}
                  >
                    {val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
    </table>
  );

  if (noScroll) {
    return <>{tableEl}{portals}</>;
  }

  return (
    <div className="overflow-x-auto border border-[#e0e2e5] rounded" ref={effectiveScrollRef}>
      {tableEl}
      {portals}
    </div>
  );
}

// ─── Planning Comparison Table ────────────────────────────────────────────────

type PNEntry = {
  no: number;
  pn: string;
  person: string;
  group: string;
  vendor: string;
  status: "pending" | "approved" | "rejected";
  rejectReason?: string;
};

const PLAN_WEEKS = SHARED_WEEKS;
const PLAN_ALL_DAYS = PLAN_WEEKS.flatMap(w => w.days);

const PN_LIST: PNEntry[] = [
  { no: 1,  pn: "DEMO-PN-01", person: "Planner C", group: "Team 2", vendor: "VENDOR-001", status: "pending" },
  { no: 2,  pn: "DEMO-PN-01", person: "Planner C", group: "Team 2", vendor: "VENDOR-002", status: "pending" },
  { no: 3,  pn: "DEMO-PN-01", person: "Planner C", group: "Team 2", vendor: "VENDOR-003", status: "pending" },
  { no: 4,  pn: "DEMO-PN-01", person: "Planner D",     group: "Team 3", vendor: "VENDOR-01", status: "approved" },
  { no: 5,  pn: "DEMO-PN-01", person: "Planner C", group: "Team 2", vendor: "VENDOR-01", status: "pending" },
  { no: 6,  pn: "DEMO-PN-01", person: "Planner D",     group: "Team 3", vendor: "VENDOR-01", status: "pending" },
  { no: 7,  pn: "DEMO-PN-01", person: "Planner E",      group: "Team 2", vendor: "VENDOR-01", status: "pending" },
  { no: 8,  pn: "DEMO-PN-01", person: "Planner E",      group: "Team 2", vendor: "VENDOR-01", status: "rejected", rejectReason: "Sample planning note. Manual scenario required for this route." },
  { no: 9,  pn: "DEMO-PN-01", person: "Planner C", group: "Team 2", vendor: "VENDOR-01", status: "pending" },
  { no: 10, pn: "DEMO-PN-01", person: "Planner C", group: "Team 2", vendor: "VENDOR-01", status: "pending" },
  { no: 11, pn: "DEMO-PN-01", person: "Planner E",      group: "Team 2", vendor: "VENDOR-01", status: "pending" },
  { no: 12, pn: "DEMO-PN-01", person: "Planner E",      group: "Team 2", vendor: "VENDOR-01", status: "approved" },
  { no: 13, pn: "DEMO-PN-01", person: "Planner D",     group: "Team 3", vendor: "VENDOR-01", status: "pending" },
  { no: 14, pn: "DEMO-PN-01", person: "Planner D",     group: "Team 3", vendor: "VENDOR-01", status: "pending" },
  { no: 15, pn: "DEMO-PN-01", person: "Planner F",        group: "Team 3", vendor: "VENDOR-01", status: "pending" },
  { no: 16, pn: "DEMO-PN-01", person: "Planner C", group: "Team 2", vendor: "VENDOR-01", status: "pending" },
];

type DayCell = { qty: string; pcs: string; pal: string };

function getPlanCell(day: DayData, scenario: "sap" | "auto" | "manual", enabled = true): DayCell {
  if (!enabled) return { qty: "—", pcs: "—", pal: "—" };
  const isWeekend = day.weekday === "Sat" || day.weekday === "Sun";
  if (isWeekend) return { qty: "—", pcs: "—", pal: "—" };
  if (scenario === "manual") return { qty: "*", pcs: "*", pal: "-" };
  return { qty: "- 80", pcs: "-", pal: "-" };
}

function StarIcon() {
  return (
    <svg width="14" height="13" viewBox="0 0 16 15.14" fill="none">
      <path d="M8 1l2.163 4.38 4.837.703-3.5 3.411.826 4.815L8 12.075 3.674 14.35l.826-4.815L1 5.083l4.837-.703z" stroke="#007BC0" strokeWidth="1.1" />
    </svg>
  );
}

function ChatBubbleIcon() {
  return (
    <svg width="14" height="11" viewBox="0 0 15 11.16" fill="none">
      <path d="M0.5 0.5h14v8H8.5l-3 2.66V8.5H0.5z" stroke="#007BC0" strokeWidth="1.1" />
    </svg>
  );
}

function CopySmallIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="#007BC0" strokeWidth="1" />
      <path d="M2 8H1.5A.5.5 0 011 7.5v-6A.5.5 0 011.5 1h6a.5.5 0 01.5.5V2" stroke="#007BC0" strokeWidth="1" />
    </svg>
  );
}

const INFO_FIELDS = {
  material: [
    { key: "matDesc",      label: "Material Description",  value: "Slot Insulation",           unit: "" },
    { key: "suppName",     label: "Supplier Name 1",        value: "Supplier Delta",            unit: "" },
    { key: "suppId",       label: "Supplier ID",            value: "VENDOR-007",                 unit: "" },
    { key: "suppNote",     label: "Supplier Note",          value: "This is Supplier Note...",   unit: "" },
  ],
  planning: [
    { key: "mrpType",      label: "MRP Type",               value: "PD",            unit: "" },
    { key: "planFence",    label: "End of Planning Time Fence", value: "06/15/2026", unit: "" },
    { key: "safetyTime",  label: "Safety Time",             value: "3",             unit: "Working days" },
    { key: "roundValue",  label: "Rounding Value",          value: "50",        unit: "" },
    { key: "minCov",      label: "Minimum Coverage Days",   value: "3",             unit: "Working days" },
    { key: "maxCov",      label: "Maximum Coverage Days",   value: "3",             unit: "Working days" },
    { key: "maxLot",      label: "Max Lot Size",            value: "2,000",       unit: "" },
    { key: "minLot",      label: "Min Lot Size",            value: "2,000",       unit: "" },
  ],
  package: [
    { key: "stack",        label: "Stackability",           value: "2",             unit: "" },
    { key: "weight",       label: "Weight",                 value: "85.5",       unit: "Kg" },
    { key: "specLen",      label: "Special Length",         value: "1,000",         unit: "mm" },
    { key: "specWid",      label: "Special Width",          value: "1,000",         unit: "mm" },
    { key: "specHgt",      label: "Special Height",         value: "600",           unit: "mm" },
    { key: "qtyPallet",   label: "Quantity per pallet",     value: "2,000",       unit: "" },
  ],
  stock: [
    { key: "availStock",   label: "Available Stock",        value: "100",           unit: "" },
    { key: "safetyStock",  label: "Safety Stock",           value: "500",       unit: "" },
    { key: "backlogQty",   label: "Backlog Quantity",       value: "250",        unit: "" },
    { key: "dueAsn",       label: "Due ASN Quantity",       value: "2,000",       unit: "" },
    { key: "blockedStock", label: "Blocked Stock(S+Q)",     value: "250",        unit: "" },
    { key: "unrestStock",  label: "Unrestricted Stock (Use+Consignment)", value: "2,000", unit: "" },
  ],
};

const SECTION_COLS = 4;

function InfoSection({
  title,
  fields,
  editing,
  overrides,
  originals,
  onChange,
}: {
  title: string;
  fields: { key: string; label: string; value: string; unit: string }[];
  editing: boolean;
  overrides: Record<string, string>;
  originals: Record<string, string>;
  onChange: (key: string, val: string) => void;
}) {
  return (
    <div className="border border-[#e0e2e5]">
      <div className="bg-[#eff1f2] border-b border-[#e0e2e5] px-4 py-[6px]">
        <span className="text-[14px] text-[#2e3033]" style={FONT_BOLD}>{title}</span>
      </div>
      <div className={`grid grid-cols-${SECTION_COLS}`} style={{ gridTemplateColumns: `repeat(${SECTION_COLS}, 1fr)` }}>
        {fields.map(f => {
          const current = overrides[f.key] ?? f.value;
          const changed = f.key in overrides && overrides[f.key] !== originals[f.key];
          return (
            <div key={f.key} className="border-b border-r border-[#e0e2e5] p-3 flex flex-col gap-[2px]">
              <span className="text-[10px] text-[#595e62]" style={FONT_REG}>{f.label}</span>
              <div className="flex items-center justify-between gap-2">
                {editing ? (
                  <input
                    className="text-[12px] text-[#2e3033] border border-[#007bc0] px-[6px] py-[2px] outline-none flex-1 min-w-0"
                    style={FONT_REG}
                    value={current}
                    onChange={e => onChange(f.key, e.target.value)}
                  />
                ) : (
                  <span className="text-[12px] text-[#2e3033] flex-1" style={FONT_REG}>
                    {current}{f.unit ? <span className="text-[#595e62] ml-1">{f.unit}</span> : null}
                  </span>
                )}
                {changed && (
                  <span className="bg-[rgba(230,247,255,0.8)] text-[#007bc0] text-[10px] px-[6px] py-[1px] rounded-[2px] shrink-0 whitespace-nowrap" style={FONT_BOLD}>
                    {originals[f.key]}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OptionalInfoModal({ pn, pnNo, person, onClose }: { pn: string; pnNo: number; person: string; onClose: () => void }) {
  const [editing, setEditing] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, string>>({});
  const originals = Object.fromEntries(
    Object.values(INFO_FIELDS).flat().map(f => [f.key, saved[f.key] ?? f.value])
  );

  const handleChange = (key: string, val: string) => {
    setOverrides(p => ({ ...p, [key]: val }));
  };

  const handleConfirm = () => {
    setSaved(prev => ({ ...prev, ...overrides }));
    setEditing(false);
  };

  const allFields = { ...INFO_FIELDS };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[rgba(67,70,74,0.6)] backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative bg-white shadow-[0px_8px_24px_rgba(0,0,0,0.2)] w-[860px] max-h-[85vh] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e2e5]">
          <span className="text-[16px] text-[#2e3033]" style={FONT_BOLD}>Optional Transportation Information</span>
          <button onClick={onClose} className="hover:opacity-60 transition-opacity">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M14 4L4 14M4 4l10 10" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* PN subtitle */}
        <div className="px-6 py-3 border-b border-[#e0e2e5] flex items-center gap-2">
          <span className="text-[14px] text-[#2e3033]" style={FONT_BOLD}>PN{String(pnNo).padStart(2, "0")}</span>
          <span className="bg-[#e6f7ff] text-[#007bc0] text-[14px] px-[4px]" style={FONT_BOLD}>{pn}</span>
          <span className="text-[12px] text-[#43464a] ml-2" style={FONT_REG}>{person}</span>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-4">
          {(Object.entries(allFields) as [string, typeof INFO_FIELDS["material"]][]).map(([section, fields]) => (
            <InfoSection
              key={section}
              title={section === "material" ? "Material Information" : section === "planning" ? "Planning Information" : section === "package" ? "Package Information" : "Stock Information"}
              fields={fields.map(f => ({ ...f, value: saved[f.key] ?? f.value }))}
              editing={editing}
              overrides={overrides}
              originals={originals}
              onChange={handleChange}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 border-t border-[#e0e2e5]">
          {editing ? (
            <button
              onClick={handleConfirm}
              className="bg-[#007bc0] text-white text-[14px] px-4 py-[5px] hover:bg-[#006aa8] transition-colors"
              style={FONT_REG}
            >
              Confirm Options
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-[#007bc0] text-white text-[14px] px-4 py-[5px] hover:bg-[#006aa8] transition-colors"
              style={FONT_REG}
            >
              Edit detail
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function PNActionRow({
  status,
  colSpan,
  onAccept,
  onReject,
  onAdd,
  onCopyFrom,
  visibleWidth,
  isCoordinator,
  viewOnly,
}: {
  status: PNEntry["status"];
  colSpan: number;
  onAccept: () => void;
  onReject: () => void;
  onAdd: () => void;
  onCopyFrom: (source: "sap" | "auto") => void;
  visibleWidth: number;
  isCoordinator?: boolean;
  viewOnly?: boolean;
}) {
  const [copyDropOpen, setCopyDropOpen] = useState(false);
  const copyBtnRef = useRef<HTMLButtonElement>(null);
  const [dropPos, setDropPos] = useState<{ top: number; left: number } | null>(null);

  const openCopyDrop = () => {
    if (copyBtnRef.current) {
      const r = copyBtnRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 4, left: r.left });
    }
    setCopyDropOpen(true);
  };

  return (
    <tr className="border-b border-[#e0e2e5] bg-white h-[40px]">
      <td colSpan={colSpan} className="p-0">
        <div
          className="flex items-center justify-between px-3 py-[6px] bg-white"
          style={{ position: "sticky", left: 0, width: visibleWidth || "100%" }}
        >
          {viewOnly ? (
            <span className="border border-[#e0e2e5] px-4 py-[1px] text-[14px] leading-[17px] text-[#595e62]" style={FONT_REG}>
              View only
            </span>
          ) : (
            <div className="flex items-center gap-[6px]">
              {status === "pending" && (
                <span className="bg-[#ffdf95] text-[#8f7300] text-[10px] px-3 py-[2px]" style={FONT_REG}>Pending</span>
              )}
              {status === "approved" && (
                <span className="bg-[#e2f5e7] text-[#00512a] text-[10px] px-3 py-[2px]" style={FONT_REG}>Approved</span>
              )}
              {status === "rejected" && (
                <span className="bg-[#ffecec] border border-dashed border-[#ffecec] text-[#ed0007] text-[10px] px-3 py-[2px]" style={FONT_REG}>Rejected</span>
              )}
              {/* Coordinator: scenario tag next to the status badge */}
              {isCoordinator && status === "approved" && (
                <span className="bg-[#e2f5e7] text-[#00512a] text-[10px] px-[6px] py-[2px]" style={FONT_REG}>Automated scenario</span>
              )}
              {isCoordinator && status === "rejected" && (
                <span className="bg-[#f5f5f7] text-[#595e62] text-[10px] px-[6px] py-[2px]" style={FONT_BOLD}>Manual scenario</span>
              )}
            </div>
          )}
          {!viewOnly && (
            <div className="flex items-center gap-[6px]">
            <button className="w-[18px] h-[18px] flex items-center justify-center hover:opacity-70">
              <ChatBubbleIcon />
            </button>
            <button onClick={onAdd} className="flex flex-col items-center gap-[2px] hover:opacity-80 transition-opacity shrink-0">
              <div className="bg-[#007bc0] rounded-full w-[22px] h-[22px] flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1.5v7M1.5 5h7" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[9px] text-[#007bc0] leading-none whitespace-nowrap" style={FONT_REG}>Transport Info</span>
            </button>
            <button
              ref={copyBtnRef}
              onClick={openCopyDrop}
              className="border border-[#007bc0] text-[#007bc0] text-[12px] px-3 py-[1px] hover:bg-[#e6f4ff] transition-colors"
              style={FONT_REG}
            >
              Copy from
            </button>
            {copyDropOpen && dropPos && createPortal(
              <>
                <div className="fixed inset-0 z-[280]" onClick={() => setCopyDropOpen(false)} />
                <div
                  className="fixed z-[290] bg-white border border-[#e0e2e5] shadow-[0px_8px_12px_rgba(0,0,0,0.12)] py-[6px] w-[180px]"
                  style={{ top: dropPos.top, left: dropPos.left }}
                >
                  <div className="px-[10px] pb-[6px]">
                    <p className="text-[10px] text-[#2e3033]" style={FONT_BOLD}>Copy value to Manual Scenario</p>
                  </div>
                  {(["sap", "auto"] as const).map(src => (
                    <button
                      key={src}
                      className="w-full text-left px-[10px] py-[6px] text-[10px] text-[#43464a] hover:bg-[#f5f6f8] transition-colors"
                      style={FONT_REG}
                      onClick={() => { onCopyFrom(src); setCopyDropOpen(false); }}
                    >
                      {src === "sap" ? "From SAP scenario" : "From Automated scenario"}
                    </button>
                  ))}
                </div>
              </>,
              document.body
            )}
            {/* Planner-only inline approve/reject buttons */}
            {!isCoordinator && status === "pending" && (
              <>
                <button
                  onClick={onReject}
                  className="border border-[#007bc0] text-[#007bc0] text-[12px] px-3 py-[1px] hover:bg-[#e6f4ff] transition-colors"
                  style={FONT_REG}
                >
                  Reject Automated
                </button>
                <button
                  onClick={onAccept}
                  className="bg-[#007bc0] text-white text-[12px] px-3 py-[1px] hover:bg-[#006aa8] transition-colors"
                  style={FONT_REG}
                >
                  Accept Automated
                </button>
              </>
            )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function PlanningComparisonTable({ source, onRecalculate, scrollRef: externalScrollRef, noScroll, hoveredDay, clickedDay, isSource, onDayHover, onDayClick, onDayLeave }: { source?: "planner" | "coordinator"; onRecalculate?: () => void; scrollRef?: React.RefObject<HTMLDivElement | null>; noScroll?: boolean } & DayHighlightProps) {
  const [open, setOpen] = useState(true);
  const [toolbarOpen, setToolbarOpen] = useState<"scenario" | "sort" | "filter" | null>(null);
  const [scenarios, setScenarios] = useState<string[]>(["SAP", "Auto.", "Manual"]);
  const [sortBy, setSortBy] = useState<"controller" | "supplier" | "volume" | null>(null);
  const [sortAscending, setSortAscending] = useState(true);
  const [selectedControllers, setSelectedControllers] = useState<string[]>([]);
  const [selectedPNs, setSelectedPNs] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<PNEntry["status"][]>([]);
  const [activePNFilter, setActivePNFilter] = useState<"controller" | "pn" | "status">("pn");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [pnStatuses, setPnStatuses] = useState<Record<number, PNEntry["status"]>>(
    () => Object.fromEntries(PN_LIST.map(p => [p.no, p.status]))
  );
  const [infoModalPN, setInfoModalPN] = useState<number | null>(null);
  const [pinnedPNs, setPinnedPNs] = useState<Set<number>>(new Set());
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [commentPopover, setCommentPopover] = useState<{ no: number; rect: DOMRect } | null>(null);

  const filteredPNList = PN_LIST.filter(item =>
    (!selectedControllers.length || selectedControllers.includes(item.person)) &&
    (!selectedPNs.length || selectedPNs.includes(item.pn)) &&
    (!selectedStatuses.length || selectedStatuses.includes(pnStatuses[item.no] ?? item.status))
  );
  const sortedPNList = [
    ...filteredPNList.filter(p => pinnedPNs.has(p.no)),
    ...filteredPNList.filter(p => !pinnedPNs.has(p.no)),
  ];
  if (sortBy) sortedPNList.sort((a, b) => {
    if (pinnedPNs.has(a.no) !== pinnedPNs.has(b.no)) return pinnedPNs.has(a.no) ? -1 : 1;
    const left = sortBy === "controller" ? a.person : sortBy === "supplier" ? a.vendor : String(a.no).padStart(3, "0");
    const right = sortBy === "controller" ? b.person : sortBy === "supplier" ? b.vendor : String(b.no).padStart(3, "0");
    const result = left.localeCompare(right, undefined, { numeric: true }) * (sortAscending ? 1 : -1);
    return result || a.no - b.no;
  });

  const toggleSelection = <T extends string>(values: T[], value: T, setter: (next: T[]) => void) => {
    setter(values.includes(value) ? values.filter(item => item !== value) : [...values, value]);
  };
  const activeFilterChips = [
    ...selectedControllers.map(value => ({ label: `MRP Controller: ${value}`, remove: () => setSelectedControllers(v => v.filter(item => item !== value)) })),
    ...selectedPNs.map(value => ({ label: `P/N: ${value}`, remove: () => setSelectedPNs(v => v.filter(item => item !== value)) })),
    ...selectedStatuses.map(value => ({ label: `Decision status: ${value[0].toUpperCase()}${value.slice(1)}`, remove: () => setSelectedStatuses(v => v.filter(item => item !== value)) })),
  ];

  const handleCopy = (pn: string) => {
    navigator.clipboard.writeText(pn).catch(() => {});
    setCopyToast(pn);
    setTimeout(() => setCopyToast(null), 2000);
  };

  const handleComment = (no: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCommentPopover(prev => prev?.no === no ? null : { no, rect });
  };
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = (externalScrollRef ?? internalScrollRef) as React.RefObject<HTMLDivElement>;
  const [visibleWidth, setVisibleWidth] = useState(0);
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setVisibleWidth(el.clientWidth));
    ro.observe(el);
    setVisibleWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const COL_NO = 70;
  const COL_PN = 150;
  const COL_SC = 68;
  const COL_QTY = 60;
  const COL_DTL = 62;
  const TOTAL_COLS = 3 + PLAN_ALL_DAYS.length * 2;

  const dayColBg = (di: number, base: string) => {
    const isWhite = base === "white";
    if (clickedDay === di) return isSource ? (isWhite ? "#b8daf0" : "#9dcce8") : (isWhite ? "#cce5f6" : "#b8daf0");
    if (hoveredDay === di) return isSource ? (isWhite ? "#cce5f6" : "#b8daf0") : (isWhite ? "#e8f4fd" : "#d6ecf8");
    return base;
  };
  const dayHeaderBg = (di: number) => {
    if (clickedDay === di) return isSource ? "#9dcce8" : "#b8daf0";
    if (hoveredDay === di) return isSource ? "#b8daf0" : "#cce5f6";
    return "#f2f3f5";
  };
  const dayEvents = (di: number) => ({
    onMouseEnter: () => onDayHover?.(di),
    onMouseLeave: onDayLeave,
    onClick: () => onDayClick?.(di),
  });

  const renderDetailCell = (
    pnNo: number, di: number, scenario: string, field: "pcs" | "pal",
    value: string, bg: string, textColor: string, extraClass: string, readOnly: boolean
  ) => {
    const key = `${pnNo}-${di}-${scenario}-${field}`;
    const isEmpty = value === "—";
    const editing = editingKey === key;
    const displayVal = isEmpty ? value : (overrides[key] ?? value);
    return (
      <td
        key={key}
        className={`border-r border-[#e0e2e5] px-[6px] py-[2px] ${extraClass}${!isEmpty && !readOnly ? " cursor-pointer" : ""}`}
        style={{ background: dayColBg(di, bg), ...(editing ? { outline: "1px solid #007bc0", outlineOffset: "-1px", zIndex: 1, position: "relative" } : {}) }}
        onMouseEnter={() => onDayHover?.(di)}
        onMouseLeave={onDayLeave}
        onClick={() => { onDayClick?.(di); if (!readOnly && !isEmpty && !editing) setEditingKey(key); }}
      >
        <div className={`text-[8px] ${editing ? "text-[#007bc0]" : "text-[#a4abb3]"}`} style={FONT_REG}>{field}</div>
        {editing && !isEmpty ? (
          <input
            autoFocus
            value={displayVal}
            onChange={e => setOverrides(p => ({ ...p, [key]: e.target.value }))}
            onBlur={() => setEditingKey(null)}
            className="text-[10px] w-full outline-none bg-transparent text-[#2e3033]"
            style={FONT_REG}
          />
        ) : (
          <div className="text-[10px]" style={{ ...FONT_REG, color: isEmpty ? "#c0c4c8" : textColor }}>{displayVal}</div>
        )}
      </td>
    );
  };

  return (
    <div className={`border-t border-[#e0e2e5] mt-4${noScroll ? "" : " -mx-4 sm:-mx-6"}`}>
      <div className="w-full px-4 sm:px-6 py-3 border-b border-[#e0e2e5]">
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => setOpen(v => !v)} className="flex items-center gap-3 text-left shrink-0">
            <span className="text-[18px] text-[#424c58]" style={FONT_BOLD}>Planning Comparison</span>
            <span className="text-[11px] text-[#595e62]" style={FONT_REG}>Sep 7 – Sep 27, 2026</span>
          </button>
          <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setToolbarOpen(v => v === "scenario" ? null : "scenario")} className="inline-flex items-center gap-2 border border-[#007bc0] bg-white text-[#007bc0] px-4 py-[5px] text-[12px] hover:bg-[#e6f4ff]" style={FONT_REG}><span aria-hidden="true">☰</span><span>Show scenario</span><ChevronDown open={toolbarOpen === "scenario"} /></button>
            {toolbarOpen === "scenario" && <div className="absolute right-0 top-full mt-1 z-40 w-40 bg-white border border-[#e0e2e5] shadow-lg py-1">
              {["SAP", "Auto.", "Manual"].map(name => <button key={name} onClick={() => setScenarios(current => {
                const next = current.includes(name) ? (current.length > 1 ? current.filter(item => item !== name) : current) : [...current, name];
                return ["SAP", "Auto.", "Manual"].filter(item => next.includes(item));
              })} className="w-full text-left px-3 py-2 text-[12px] hover:bg-[#f2f3f5]" style={FONT_REG}><span className="text-[#007bc0] mr-2">{scenarios.includes(name) ? "☑" : "□"}</span>{name}</button>)}
            </div>}
          </div>
          <div className="relative">
            <button onClick={() => setToolbarOpen(v => v === "sort" ? null : "sort")} className="inline-flex items-center gap-2 border border-[#007bc0] bg-white text-[#007bc0] px-4 py-[5px] text-[12px] hover:bg-[#e6f4ff]" style={FONT_REG}><span aria-hidden="true">↕</span><span>{sortBy ? `Sort: ${sortBy === "controller" ? "Controller name A-Z" : sortBy === "supplier" ? "Supplier name A-Z" : "Volume low to high"}` : "Sort by"}</span><ChevronDown open={toolbarOpen === "sort"} /></button>
            {toolbarOpen === "sort" && <div className="absolute right-0 top-full mt-1 z-40 w-52 bg-white border border-[#e0e2e5] shadow-lg py-1">
              <div className="px-3 py-2 text-[11px] text-[#2e3033]" style={FONT_BOLD}>Sort by</div>
              {([{ key: "controller", label: "Controller name A-Z" }, { key: "supplier", label: "Supplier name A-Z" }, { key: "volume", label: "Volume low to high" }] as const).map(option => <button key={option.key} onClick={() => { if (sortBy === option.key) setSortAscending(v => !v); else { setSortBy(option.key); setSortAscending(true); } }} className={`w-full text-left px-3 py-2 text-[12px] hover:bg-[#f2f3f5] ${sortBy === option.key ? "bg-[#f2f3f5] text-[#007bc0]" : "text-[#595e62]"}`} style={FONT_REG}>{option.label}{sortBy === option.key ? (sortAscending ? " ↑" : " ↓") : ""}</button>)}
            </div>}
          </div>
          <div className="relative">
            <button onClick={() => setToolbarOpen(v => v === "filter" ? null : "filter")} className="inline-flex items-center gap-2 border border-[#007bc0] bg-white text-[#007bc0] px-4 py-[5px] text-[12px] hover:bg-[#e6f4ff]" style={FONT_REG}><span aria-hidden="true">☷</span><span>Filter P/Ns</span><ChevronDown open={toolbarOpen === "filter"} /></button>
            {toolbarOpen === "filter" && <div className="absolute right-0 top-full mt-1 z-40 w-[330px] bg-white border border-[#e0e2e5] shadow-lg p-3">
              <div className="grid grid-cols-[120px_1fr] min-h-[170px] text-[12px]">
                <div className="border-r border-[#e0e2e5] pr-2 space-y-1">
                  {([{ key: "controller", label: "MRP Controller" }, { key: "pn", label: "P/N" }, { key: "status", label: "Decision status" }] as const).map(category => <button key={category.key} onClick={() => setActivePNFilter(category.key)} className={`w-full flex items-center gap-2 text-left px-2 py-2 ${activePNFilter === category.key ? "font-bold bg-[#f2f3f5]" : "text-[#595e62] hover:bg-[#f7f8f9]"}`}><span>{category.label}</span><span className="ml-auto shrink-0"><ChevronRight size={12} /></span></button>)}
                </div>
                <div className="pl-2 max-h-[190px] overflow-y-auto">
                  {activePNFilter === "controller" && <div className="space-y-1">{[...new Set(PN_LIST.map(item => item.person))].map(person => <label key={person} className="flex items-center gap-2 px-1 py-1 cursor-pointer"><input type="checkbox" checked={selectedControllers.includes(person)} onChange={() => toggleSelection(selectedControllers, person, setSelectedControllers)} />{person}</label>)}</div>}
                  {activePNFilter === "pn" && <div className="space-y-1">{PN_LIST.map(item => { const disabled = source === "planner" && item.no > 5; return <label key={item.pn} className={`flex items-center gap-2 px-1 py-1 ${disabled ? "text-[#c0c4c8] cursor-not-allowed" : "cursor-pointer"}`}><input type="checkbox" disabled={disabled} checked={selectedPNs.includes(item.pn)} onChange={() => toggleSelection(selectedPNs, item.pn, setSelectedPNs)} />{item.pn}</label>; })}</div>}
                  {activePNFilter === "status" && <div className="space-y-1">{(["rejected", "pending", "approved"] as const).map(status => <label key={status} className="flex items-center gap-2 px-1 py-1 cursor-pointer"><input type="checkbox" checked={selectedStatuses.includes(status)} onChange={() => toggleSelection(selectedStatuses, status, setSelectedStatuses)} />{status[0].toUpperCase() + status.slice(1)}</label>)}</div>}
                </div>
              </div>
              <div className="border-t border-[#e0e2e5] mt-2 pt-2 flex justify-end gap-3"><button className="text-[#595e62]" onClick={() => { setSelectedControllers([]); setSelectedPNs([]); setSelectedStatuses([]); }}>Reset</button><button className="bg-[#007bc0] text-white px-3 py-1" onClick={() => setToolbarOpen(null)}>Apply</button></div>
            </div>}
          </div>
          {source === "coordinator" && (
            <button
              onClick={onRecalculate}
              className="border border-[#007bc0] text-[#007bc0] text-[12px] px-4 py-[5px] hover:bg-[#e6f4ff] transition-colors"
              style={FONT_REG}
            >
              Recalculate
            </button>
          )}
          <button onClick={() => setOpen(v => !v)}>
            <ChevronDown open={open} />
          </button>
          </div>
        </div>
        {activeFilterChips.length > 0 && <div className="flex items-center justify-end gap-2 pt-3 text-[11px] text-[#595e62]"><strong>{sortedPNList.length} results</strong>{activeFilterChips.map(chip => <button key={chip.label} onClick={chip.remove} className="bg-[#f2f3f5] border border-[#e0e2e5] px-2 py-1 hover:bg-[#e6f4ff]">{chip.label} ×</button>)}<button className="text-[#007bc0] px-1" onClick={() => { setSelectedControllers([]); setSelectedPNs([]); setSelectedStatuses([]); }}>Clear all</button></div>}
      </div>
      {open && (
        <div className={noScroll ? "" : "overflow-x-auto"} ref={scrollContainerRef}>
          <table className="border-collapse" style={{ minWidth: COL_NO + COL_PN + COL_SC + PLAN_ALL_DAYS.length * (COL_QTY + COL_DTL) }}>
            <colgroup>
              <col style={{ width: COL_NO }} />
              <col style={{ width: COL_PN }} />
              <col style={{ width: COL_SC }} />
              {PLAN_ALL_DAYS.map((_, i) => (
                <Fragment key={i}>
                  <col style={{ width: COL_QTY }} />
                  <col style={{ width: COL_DTL }} />
                </Fragment>
              ))}
            </colgroup>
            <thead>
              {/* Row 1 – week group headers */}
              <tr>
                <th className="sticky left-0 z-30 bg-[#f5f6f8] border-b border-r border-[#e0e2e5]" rowSpan={2} />
                <th className="sticky left-[70px] z-30 bg-[#f5f6f8] border-b border-r border-[#e0e2e5] px-3 text-left text-[11px] text-[#595e62]" style={FONT_BOLD} rowSpan={2}>
                  P/N
                </th>
                <th className="sticky left-[220px] z-30 bg-[#f5f6f8] border-b border-r border-[#e0e2e5] px-2 text-left text-[10px] text-[#595e62]" style={FONT_BOLD} rowSpan={2}>
                  Scenario
                </th>
                {PLAN_WEEKS.map((wk, wi) => (
                  <th key={wi} colSpan={wk.days.length * 2}
                    className="border-b border-r border-[#e0e2e5] py-1.5 text-center text-[11px] text-[#007bc0] bg-[#e6f7ff]"
                    style={FONT_BOLD}
                  >
                    {wk.label}
                  </th>
                ))}
              </tr>
              {/* Row 2 – day headers */}
              <tr>
                {PLAN_ALL_DAYS.map((day, di) => (
                  <th key={di} colSpan={2}
                    className="border-b border-r border-[#e0e2e5] px-1 py-1 text-center relative cursor-pointer"
                    style={{ background: dayHeaderBg(di), ...(day.pickup ? { boxShadow: "inset 0 0 0 1.5px #18837E" } : {}) }}
                    {...dayEvents(di)}
                  >
                    {day.pickup && (
                      <div style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderTop: "13px solid #18837E", borderLeft: "13px solid transparent" }} />
                    )}
                    <div className="text-[10px] text-[#2e3033]" style={FONT_BOLD}>{day.weekday}</div>
                    <div className="text-[9px] text-[#595e62]" style={FONT_REG}>{day.date}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedPNList.map((item) => {
                const viewOnly = source === "planner" && item.no > 5;
                const identityRowSpan = scenarios.length * 2;
                const identityCells = <>
                  <td className="sticky left-0 z-20 border-r border-[#e0e2e5] bg-white align-top" rowSpan={identityRowSpan}>
                    <div className="flex flex-col items-center gap-2 py-3 px-1">
                      <span className="text-[12px] text-[#2e3033]" style={FONT_BOLD}>PN{String(item.no).padStart(2, "0")}</span>
                      {!viewOnly && <button className="border w-[32px] h-[24px] flex items-center justify-center hover:bg-[#f5f6f8] transition-colors" style={{ borderColor: pinnedPNs.has(item.no) ? "#007bc0" : "#e0e2e5", background: pinnedPNs.has(item.no) ? "#e6f4ff" : undefined }} onClick={() => setPinnedPNs(prev => { const s = new Set(prev); s.has(item.no) ? s.delete(item.no) : s.add(item.no); return s; })} title="Pin to top"><StarIcon /></button>}
                      {!viewOnly && <button className="border border-[#e0e2e5] w-[32px] h-[24px] flex items-center justify-center hover:bg-[#f5f6f8] transition-colors" onClick={(e) => handleComment(item.no, e)} title="View reject reason"><ChatBubbleIcon /></button>}
                    </div>
                  </td>
                  <td className="sticky left-[70px] z-20 border-r border-[#e0e2e5] bg-white px-3 py-3 align-top" rowSpan={identityRowSpan}>
                    <div className="flex items-center gap-1 mb-1"><span className="text-[13px] text-[#007bc0]" style={FONT_BOLD}>{item.pn}</span><button onClick={() => handleCopy(item.pn)} className="hover:opacity-70 transition-opacity" title="Copy P/N"><CopySmallIcon /></button></div>
                    <div className="text-[11px] text-[#43464a]" style={FONT_BOLD}>{item.person}</div><div className="text-[10px] text-[#43464a]" style={FONT_REG}>{item.group}</div><div className="text-[10px] text-[#43464a]" style={FONT_REG}>{item.vendor}</div>
                  </td>
                </>;
                return (
                  <Fragment key={item.no}>
                  {/* Per-P/N action row */}
                  <PNActionRow
                    status={pnStatuses[item.no] ?? item.status}
                    colSpan={TOTAL_COLS}
                    onAccept={() => setPnStatuses(p => ({ ...p, [item.no]: "approved" }))}
                    onReject={() => setPnStatuses(p => ({ ...p, [item.no]: "rejected" }))}
                    onAdd={() => setInfoModalPN(item.no)}
                    onCopyFrom={(src) => {
                      setOverrides(prev => {
                        const next = { ...prev };
                        PLAN_ALL_DAYS.forEach((day, di) => {
                          const cell = getPlanCell(day, src === "sap" ? "sap" : "auto");
                          next[`${item.no}-${di}-manual-qty`] = cell.qty;
                          next[`${item.no}-${di}-manual-pcs`] = cell.pcs;
                          next[`${item.no}-${di}-manual-pal`] = cell.pal;
                        });
                        return next;
                      });
                    }}
                    visibleWidth={visibleWidth}
                    isCoordinator={source === "coordinator"}
                    viewOnly={viewOnly}
                  />

                  {/* ── SAP pcs row ── */}
                  <tr className="border-b border-[#e0e2e5]" style={{ display: scenarios.includes("SAP") ? undefined : "none" }}>
                    {scenarios[0] === "SAP" && identityCells}
                    {/* SAP badge – rowspan 2 */}
                    <td className="sticky left-[220px] z-10 border-r border-[#e0e2e5] bg-white px-2 py-2 align-top" rowSpan={2}>
                      <div className="inline-flex items-center bg-[#f5f5f7] rounded-[2px] px-[6px] py-[2px]">
                        <span className="text-[10px] text-[#595e62]" style={FONT_BOLD}>SAP</span>
                      </div>
                    </td>
                    {/* Day data: qty (rowspan 2) + pcs cell */}
                    {PLAN_ALL_DAYS.flatMap((day, di) => {
                      const cell = getPlanCell(day, "sap", scenarios.includes("SAP"));
                      const empty = cell.qty === "—";
                      return [
                        <td key={`sq${di}`} className="border-r border-[#e0e2e5] text-center align-middle" rowSpan={2} style={{ background: dayColBg(di, "white") }} {...dayEvents(di)}>
                          <span className="text-[11px]" style={{ ...FONT_BOLD, color: empty ? "#c0c4c8" : "#2e3033" }}>{cell.qty}</span>
                        </td>,
                        <td key={`sp${di}`} className="border-r border-[#e0e2e5] border-b border-[#eef0f2] px-[6px] py-[2px]" style={{ background: dayColBg(di, "white") }} {...dayEvents(di)}>
                          <div className="text-[8px] text-[#a4abb3]" style={FONT_REG}>pcs</div>
                          <div className="text-[10px]" style={{ ...FONT_REG, color: empty ? "#c0c4c8" : "#2e3033" }}>{cell.pcs}</div>
                        </td>,
                      ];
                    })}
                  </tr>

                  {/* ── SAP pal row ── */}
                  <tr className="border-b border-[#e0e2e5]" style={{ display: scenarios.includes("SAP") ? undefined : "none" }}>
                    {PLAN_ALL_DAYS.map((day, di) => {
                      const cell = getPlanCell(day, "sap", scenarios.includes("SAP"));
                      const empty = cell.qty === "—";
                      return (
                        <td key={`spal${di}`} className="border-r border-[#e0e2e5] px-[6px] py-[2px]" style={{ background: dayColBg(di, "white") }} {...dayEvents(di)}>
                          <div className="text-[8px] text-[#a4abb3]" style={FONT_REG}>pal</div>
                          <div className="text-[10px]" style={{ ...FONT_REG, color: empty ? "#c0c4c8" : "#2e3033" }}>{cell.pal}</div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* ── Auto pcs row ── */}
                  <tr className="border-b border-[#e0e2e5]" style={{ background: "#f7fbff", display: scenarios.includes("Auto.") ? undefined : "none" }}>
                    {scenarios[0] === "Auto." && identityCells}
                    {/* Auto. badge – rowspan 2 */}
                    <td className="sticky left-[220px] z-10 border-r border-[#e0e2e5] px-2 py-2 align-top" rowSpan={2} style={{ background: "#f0f7ff" }}>
                      <div className="inline-flex items-center bg-[#e6f7ff] rounded-[2px] px-[6px] py-[2px]">
                        <span className="text-[10px] text-[#007bc0]" style={FONT_BOLD}>Auto.</span>
                      </div>
                    </td>
                    {PLAN_ALL_DAYS.flatMap((day, di) => {
                      const cell = getPlanCell(day, "auto", scenarios.includes("Auto."));
                      const empty = cell.qty === "—";
                      return [
                        <td key={`aq${di}`} className="border-r border-[#e0e2e5] text-center align-middle" rowSpan={2} style={{ background: dayColBg(di, "#f7fbff") }} {...dayEvents(di)}>
                          <span className="text-[11px]" style={{ ...FONT_BOLD, color: empty ? "#c0c4c8" : "#007bc0" }}>{cell.qty}</span>
                        </td>,
                        <td key={`ap${di}`} className="border-r border-[#e0e2e5] border-b border-[#eef0f2] px-[6px] py-[2px]" style={{ background: dayColBg(di, "#f7fbff") }} {...dayEvents(di)}>
                          <div className="text-[8px] text-[#a4abb3]" style={FONT_REG}>pcs</div>
                          <div className="text-[10px]" style={{ ...FONT_REG, color: empty ? "#c0c4c8" : "#007bc0" }}>{cell.pcs}</div>
                        </td>,
                      ];
                    })}
                  </tr>

                  {/* ── Auto pal row ── */}
                  <tr className="border-b border-[#e0e2e5]" style={{ background: "#f7fbff", display: scenarios.includes("Auto.") ? undefined : "none" }}>
                    {PLAN_ALL_DAYS.map((day, di) => {
                      const cell = getPlanCell(day, "auto", scenarios.includes("Auto."));
                      const empty = cell.qty === "—";
                      return (
                        <td key={`apal${di}`} className="border-r border-[#e0e2e5] px-[6px] py-[2px]" style={{ background: dayColBg(di, "#f7fbff") }} {...dayEvents(di)}>
                          <div className="text-[8px] text-[#a4abb3]" style={FONT_REG}>pal</div>
                          <div className="text-[10px]" style={{ ...FONT_REG, color: empty ? "#c0c4c8" : "#007bc0" }}>{cell.pal}</div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* ── Manual pcs row ── */}
                  <tr className="border-b border-[#e0e2e5]" style={{ display: scenarios.includes("Manual") ? undefined : "none" }}>
                    {scenarios[0] === "Manual" && identityCells}
                    {/* Manual badge – rowspan 2 */}
                    <td className="sticky left-[220px] z-10 border-r border-[#e0e2e5] bg-white px-2 py-2 align-top" rowSpan={2}>
                      <div className="inline-flex items-center bg-[#f5f5f7] rounded-[2px] px-[6px] py-[2px]">
                        <span className="text-[10px] text-[#595e62]" style={FONT_BOLD}>Manual</span>
                      </div>
                    </td>
                    {PLAN_ALL_DAYS.flatMap((day, di) => {
                      const cell = getPlanCell(day, "manual", scenarios.includes("Manual"));
                      const empty = cell.qty === "—";
                      const bg = "white";
                      return [
                        (() => {
                          const qtyKey = `${item.no}-${di}-manual-qty`;
                          const editingQty = !viewOnly && editingKey === qtyKey;
                          const qtyVal = overrides[qtyKey] ?? cell.qty;
                          return (
                            <td
                              key={`mq${di}`}
                              className={`border-r border-[#e0e2e5] text-center align-middle${!empty && !viewOnly ? " cursor-pointer" : ""}`}
                              rowSpan={2}
                              style={{ background: dayColBg(di, "white"), ...(editingQty ? { outline: "1px solid #007bc0", outlineOffset: "-1px", position: "relative", zIndex: 1 } : {}) }}
                              onMouseEnter={() => onDayHover?.(di)}
                              onMouseLeave={onDayLeave}
                              onClick={() => { onDayClick?.(di); if (!viewOnly && !empty && !editingQty) setEditingKey(qtyKey); }}
                            >
                              {editingQty ? (
                                <input
                                  autoFocus
                                  value={qtyVal}
                                  onChange={e => setOverrides(p => ({ ...p, [qtyKey]: e.target.value }))}
                                  onBlur={() => setEditingKey(null)}
                                  className="text-[11px] text-center w-full outline-none bg-transparent"
                                  style={{ ...FONT_REG, color: "#595e62" }}
                                />
                              ) : (
                                <span className="text-[11px]" style={{ ...FONT_REG, color: empty ? "#c0c4c8" : "#595e62" }}>{qtyVal}</span>
                              )}
                            </td>
                          );
                        })(),
                        renderDetailCell(item.no, di, "manual", "pcs", cell.pcs, bg, "#595e62", "border-b border-[#eef0f2]", viewOnly),
                      ];
                    })}
                  </tr>

                  {/* ── Manual pal row ── */}
                  <tr className="border-b-2 border-[#d0d4d8]" style={{ display: scenarios.includes("Manual") ? undefined : "none" }}>
                    {PLAN_ALL_DAYS.map((day, di) => {
                      const cell = getPlanCell(day, "manual", scenarios.includes("Manual"));
                      return (
                        renderDetailCell(item.no, di, "manual", "pal", cell.pal, "white", "#595e62", "", viewOnly)
                      );
                    })}
                  </tr>
                  </Fragment>
                );
              })}
              {sortedPNList.length === 0 && <tr><td colSpan={TOTAL_COLS} className="text-center text-[12px] text-[#71767c] py-8" style={FONT_REG}>No P/Ns match the selected filters.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {infoModalPN !== null && (() => {
        const item = PN_LIST.find(p => p.no === infoModalPN);
        if (!item) return null;
        return (
          <OptionalInfoModal
            pn={item.pn}
            pnNo={item.no}
            person={item.person}
            onClose={() => setInfoModalPN(null)}
          />
        );
      })()}

      {/* Copy toast */}
      {copyToast !== null && createPortal(
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] bg-[#2e3033] text-white text-[13px] px-4 py-2 shadow-lg flex items-center gap-2" style={FONT_REG}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          P/N just copied
        </div>,
        document.body
      )}

      {/* Comment popover */}
      {commentPopover !== null && createPortal(
        <>
          <div className="fixed inset-0 z-[290]" onClick={() => setCommentPopover(null)} />
          <div
            className="fixed z-[300] bg-white border border-[#e0e2e5] shadow-[0px_4px_16px_rgba(0,0,0,0.15)] p-3 w-[260px]"
            style={{ top: commentPopover.rect.bottom + 6, left: commentPopover.rect.left }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-[#2e3033]" style={FONT_BOLD}>Reject Reason</span>
              <button onClick={() => setCommentPopover(null)} className="text-[#595e62] hover:text-[#2e3033] text-[14px] leading-none">×</button>
            </div>
            <p className="text-[11px] text-[#595e62] leading-relaxed" style={FONT_REG}>
              {PN_LIST.find(p => p.no === commentPopover.no)?.rejectReason ?? "No reject reason provided."}
            </p>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

// ─── Route Info Panel ─────────────────────────────────────────────────────────

function RouteInfoPanel() {
  return (
    <div className="bg-white border border-[#e0e2e5] rounded p-4 sm:p-6">
      <h3 className="text-[13px] font-bold text-[#2e3033] mb-4" style={FONT_BOLD}>Route Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Plant", value: "0101 – Demo Location" },
          { label: "MRP Controller", value: "Planner A (Team 1)" },
          { label: "Route", value: "Demo North Route" },
          { label: "Transportation Mode", value: "FTL" },
          { label: "Vendor", value: "Supplier Delta (VENDOR-004)" },
          { label: "Schedule", value: "Weekly, Mon–Fri" },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="text-[10px] text-[#8b909a] mb-0.5" style={FONT_REG}>{label}</div>
            <div className="text-[12px] text-[#2e3033]" style={FONT_REG}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Planning Horizon View ────────────────────────────────────────────────────

type CheckboxState = { weekdaysOnly: boolean; pickupDaysOnly: boolean; pnWithVolume: boolean; daysWithVolume: boolean };

function CheckboxFilter({ checked, label, onChange }: { checked: boolean; label: string; blue?: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`group flex items-center gap-[6px] px-[10px] py-[6px] border transition-colors cursor-pointer
        ${checked
          ? "bg-[#e6f7ff] border-[#007bc0]"
          : "bg-white border-[#c9cdd4] hover:border-[#007bc0] hover:bg-[#e6f4ff]"
        }`}
      style={FONT_REG}
    >
      <div className="relative shrink-0 size-[14px]">
        {checked ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect width="14" height="14" fill="#007BC0" />
            <path d="M10.1787 4.48866C10.3626 4.67236 10.3747 4.96606 10.207 5.16469L7.02914 8.92534L7.05538 8.95296L6.74049 9.26785L6.46221 9.59723C6.38965 9.68306 6.29457 9.73609 6.19359 9.75951C6.00891 9.83603 5.78823 9.79845 5.64116 9.64488L3.79053 7.71138C3.60265 7.51508 3.60545 7.20484 3.79744 7.01256L4.15099 6.65901C4.34921 6.46067 4.67172 6.46412 4.86569 6.66661L5.99057 7.83982L9.09176 4.16963C9.28044 3.94631 9.61944 3.93146 9.82649 4.13787L10.1787 4.48866Z" fill="white" />
          </svg>
        ) : (
          <div className="absolute bg-white border border-[#c9cdd4] group-hover:border-[#007bc0] rounded-[2px] inset-0 transition-colors" />
        )}
      </div>
      <span className={`text-[12px] ${checked ? "text-[#007bc0]" : "text-[#595e62]"}`}
        style={checked ? FONT_BOLD : FONT_REG}>
        {label}
      </span>
    </button>
  );
}

// ─── Date Range Picker ────────────────────────────────────────────────────────

const DR_WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MAX_RANGE_DAYS = 42; // 6 weeks

function drDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function drFirstWeekday(y: number, m: number) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }
function drAddMonths(y: number, m: number, delta: number) { const d = new Date(y, m + delta, 1); return { year: d.getFullYear(), month: d.getMonth() }; }
function drFormat(d: Date) {
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}
function drSameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

function DrMonthGrid({
  year, month, startDate, endDate, hoverDate, onDay, onHover, onLeave,
}: {
  year: number; month: number;
  startDate: Date | null; endDate: Date | null; hoverDate: Date | null;
  onDay: (d: Date) => void; onHover: (d: Date) => void; onLeave: () => void;
}) {
  const daysCount = drDaysInMonth(year, month);
  const offset = drFirstWeekday(year, month);
  const rangeEnd = endDate || hoverDate;
  const cells: (Date | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysCount }, (_, i) => new Date(year, month, i + 1))];

  const isDisabled = (d: Date) => {
    if (!startDate) return false;
    return Math.abs(d.getTime() - startDate.getTime()) / 86400000 > MAX_RANGE_DAYS;
  };
  const isStart = (d: Date) => !!startDate && drSameDay(d, startDate);
  const isEnd = (d: Date) => !!rangeEnd && drSameDay(d, rangeEnd);
  const inRange = (d: Date) => {
    if (!startDate || !rangeEnd) return false;
    const [lo, hi] = startDate <= rangeEnd ? [startDate, rangeEnd] : [rangeEnd, startDate];
    return d > lo && d < hi;
  };

  const monthNames = ["01","02","03","04","05","06","07","08","09","10","11","12"];
  return (
    <div style={{ width: 210 }}>
      <p className="text-center text-[13px] mb-2 text-[#2e3033]" style={FONT_BOLD}>{monthNames[month]}/{year}</p>
      <div className="grid grid-cols-7">
        {DR_WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center text-[11px] text-[#595e62] py-1" style={FONT_BOLD}>{w}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const dis = isDisabled(d);
          const st = isStart(d);
          const en = isEnd(d);
          const ir = inRange(d);
          return (
            <button
              key={i}
              disabled={dis}
              onClick={() => onDay(d)}
              onMouseEnter={() => onHover(d)}
              onMouseLeave={onLeave}
              className={[
                "text-[12px] h-7 w-full leading-none transition-colors",
                dis ? "text-[#c9cdd4] cursor-not-allowed" : "cursor-pointer",
                (st || en) ? "bg-[#007bc0] text-white rounded-full" : "",
                ir ? "bg-[#e6f4ff] text-[#2e3033]" : "",
                !st && !en && !ir && !dis ? "hover:bg-[#f5f6f8] text-[#2e3033]" : "",
              ].join(" ")}
              style={FONT_REG}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateRangePicker({ startDate, endDate, onChange }: {
  startDate: Date | null; endDate: Date | null;
  onChange: (s: Date | null, e: Date | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"start" | "end">("start");
  const [hover, setHover] = useState<Date | null>(null);
  const [viewY, setViewY] = useState(2026);
  const [viewM, setViewM] = useState(4); // May
  const ref = useRef<HTMLDivElement>(null);
  const next = drAddMonths(viewY, viewM, 1);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const handleDay = (d: Date) => {
    if (phase === "start") { onChange(d, null); setPhase("end"); }
    else {
      const [s, e] = startDate && d < startDate ? [d, startDate] : [startDate, d];
      onChange(s, e);
      setPhase("start");
      setHover(null);
      setOpen(false);
    }
  };

  const weeksText = () => {
    if (!startDate || !endDate) return "";
    const days = Math.abs(endDate.getTime() - startDate.getTime()) / 86400000;
    return `(${Math.ceil(days / 7)} weeks)`;
  };

  const prev2 = () => { const p = drAddMonths(viewY, viewM, -2); setViewY(p.year); setViewM(p.month); };
  const prev1 = () => { const p = drAddMonths(viewY, viewM, -1); setViewY(p.year); setViewM(p.month); };
  const next1 = () => { const p = drAddMonths(viewY, viewM, 1); setViewY(p.year); setViewM(p.month); };
  const next2 = () => { const p = drAddMonths(viewY, viewM, 2); setViewY(p.year); setViewM(p.month); };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 bg-white border border-[#c1c7cc] px-3 py-[6px] hover:border-[#007bc0] transition-colors"
      >
        <CalendarIcon />
        <span className="text-[12px] text-[#2e3033]" style={FONT_REG}>{startDate ? drFormat(startDate) : "Start date"}</span>
        <span className="text-[12px] text-[#b2b9c0]" style={FONT_REG}>to</span>
        <span className={`text-[12px] ${endDate ? "text-[#2e3033]" : "text-[#b2b9c0]"}`} style={FONT_REG}>
          {endDate ? `${drFormat(endDate)}${weeksText()}` : "End date"}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-[#e0e2e5] shadow-[0px_8px_16px_rgba(0,0,0,0.12)] p-4 min-w-max">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex gap-1">
              <button onClick={prev2} className="px-1 text-[#595e62] hover:text-[#007bc0]" style={FONT_REG}>«</button>
              <button onClick={prev1} className="px-1 text-[#595e62] hover:text-[#007bc0]" style={FONT_REG}>‹</button>
            </div>
            <div className="flex gap-1">
              <button onClick={next1} className="px-1 text-[#595e62] hover:text-[#007bc0]" style={FONT_REG}>›</button>
              <button onClick={next2} className="px-1 text-[#595e62] hover:text-[#007bc0]" style={FONT_REG}>»</button>
            </div>
          </div>
          <div className="flex gap-6">
            <DrMonthGrid year={viewY} month={viewM} startDate={startDate} endDate={endDate}
              hoverDate={phase === "end" ? hover : null}
              onDay={handleDay} onHover={d => phase === "end" && setHover(d)} onLeave={() => setHover(null)} />
            <DrMonthGrid year={next.year} month={next.month} startDate={startDate} endDate={endDate}
              hoverDate={phase === "end" ? hover : null}
              onDay={handleDay} onHover={d => phase === "end" && setHover(d)} onLeave={() => setHover(null)} />
          </div>
          <p className="text-[11px] text-[#595e62] mt-3 text-center" style={FONT_REG}>
            {phase === "start" ? "Select start date" : "Select end date — max 6 weeks from start"}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Coordinator Decision Modal ────────────────────────────────────────────────

const COORD_PN_ROWS = PN_LIST.slice(0, 5).map(p => ({
  no: p.no,
  pn: p.pn,
  person: p.person,
  automatedDecision: (["rejected", "rejected", "approved", "approved", "approved"] as PNEntry["status"][])[PN_LIST.indexOf(p) % 5],
}));

function CoordinatorDecisionModal({ open, routeName, onClose }: { open: boolean; routeName: string; onClose: () => void }) {
  const [checked, setChecked] = useState<Set<number>>(new Set(COORD_PN_ROWS.map(r => r.no)));
  const [coordDecisions, setCoordDecisions] = useState<Record<number, string>>({});

  if (!open) return null;

  const toggleAll = () => {
    if (checked.size === COORD_PN_ROWS.length) setChecked(new Set());
    else setChecked(new Set(COORD_PN_ROWS.map(r => r.no)));
  };

  const toggle = (no: number) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(no) ? next.delete(no) : next.add(no);
      return next;
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-[5px]" onClick={onClose} />
      <div className="relative bg-white shadow-[0px_8px_32px_rgba(0,0,0,0.2)] w-[760px] max-h-[85vh] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#e0e2e5]">
          <span className="text-[16px] text-[#2e3033]" style={FONT_BOLD}>
            Update P/N decision for {routeName}
          </span>
          <button onClick={onClose} className="hover:opacity-60 transition-opacity">
            <img src={`${import.meta.env.BASE_URL}assets/40346.svg`} alt="close" width={18} height={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-8 py-6 flex flex-col gap-[14px]">
          <div className="flex flex-col gap-[10px]">
            <p className="text-[20px] text-[#2e3033]" style={FONT_BOLD}>Review P/N scenario</p>
            <p className="text-[16px] text-[#2e3033]" style={FONT_REG}>Review and update the P/N scenario</p>
          </div>

          {/* Table header */}
          <div className="flex items-start gap-4">
            {/* Part number col */}
            <div className="flex flex-col gap-[18px] shrink-0" style={{ width: 220 }}>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#2e3033]" style={FONT_BOLD}>Part Number</span>
                <button className="text-[10px] text-[#595e62] hover:text-[#007bc0]" style={FONT_REG} onClick={toggleAll}>Select all</button>
              </div>
              {COORD_PN_ROWS.map(row => (
                <div key={row.no} className="flex items-center gap-3">
                  <button
                    onClick={() => toggle(row.no)}
                    className="shrink-0 w-[14px] h-[14px] border flex items-center justify-center transition-colors"
                    style={{ borderColor: checked.has(row.no) ? "#007bc0" : "#c0c4c8", background: checked.has(row.no) ? "#007bc0" : "white" }}
                  >
                    {checked.has(row.no) && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[10px] text-[#333] leading-[1.2]" style={FONT_REG}>{row.person} (Team 1)</span>
                    <span className="text-[14px] text-[#595e62]" style={FONT_BOLD}>{row.pn}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat icons col */}
            <div className="flex flex-col gap-[18px] shrink-0 pt-[28px]">
              {COORD_PN_ROWS.map(row => (
                <button key={row.no} className="w-[24px] h-[24px] flex items-center justify-center hover:opacity-70">
                  <img src={`${import.meta.env.BASE_URL}assets/8a9c0.svg`} alt="chat" width={24} height={24} />
                </button>
              ))}
            </div>

            {/* Automated decision col */}
            <div className="flex flex-col gap-[21px] shrink-0" style={{ width: 120 }}>
              <span className="text-[12px] text-[#2e3033] text-center" style={FONT_BOLD}>Automated decision</span>
              {COORD_PN_ROWS.map(row => (
                <div key={row.no}
                  className="px-4 py-[5px] flex items-center justify-center"
                  style={{ background: row.automatedDecision === "rejected" ? "#ffecec" : "#e2f5e7" }}
                >
                  <span className="text-[14px] whitespace-nowrap" style={{ ...FONT_REG, color: row.automatedDecision === "rejected" ? "#ed0007" : "#5ebd82" }}>
                    {row.automatedDecision === "rejected" ? "Rejected" : "Approved"}
                  </span>
                </div>
              ))}
            </div>

            {/* Planners' proposal col */}
            <div className="flex flex-col gap-[21px] shrink-0" style={{ width: 143 }}>
              <span className="text-[12px] text-[#2e3033] text-center" style={FONT_BOLD}>{"Planners' proposal"}</span>
              {COORD_PN_ROWS.map(row => (
                <div key={row.no}
                  className="px-4 py-[5px] flex items-center justify-center"
                  style={{ background: row.automatedDecision === "rejected" ? "#c9cdd4" : "#f2f3f5", border: row.automatedDecision !== "rejected" ? "1px dashed #e5e6eb" : "none" }}
                >
                  <span className="text-[14px] whitespace-nowrap" style={{ ...FONT_REG, color: row.automatedDecision === "rejected" ? "#4e5969" : "#f2f3f5" }}>
                    Manual scenario
                  </span>
                </div>
              ))}
            </div>

            {/* Coordinator decision col */}
            <div className="flex flex-col gap-[21px] flex-1">
              <span className="text-[12px] text-[#2e3033] text-center" style={FONT_BOLD}>Coordinator decision</span>
              {COORD_PN_ROWS.map(row => {
                const isRejected = row.automatedDecision === "rejected";
                const active = isRejected;
                return (
                  <button
                    key={row.no}
                    disabled={!active}
                    onClick={() => active && setCoordDecisions(p => ({ ...p, [row.no]: "Manual scenario" }))}
                    className="px-4 py-[5px] flex items-center justify-center w-full transition-colors"
                    style={{
                      border: active ? "1px solid #007bc0" : "1px dashed #e5e6eb",
                      background: active ? "white" : "#f2f3f5",
                      cursor: active ? "pointer" : "default",
                    }}
                  >
                    <span className="text-[14px] whitespace-nowrap" style={{ ...FONT_REG, color: active ? "#007bc0" : "#c9cdd4" }}>
                      Manual scenario
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[11px] px-8 py-4 border-t border-[#e0e2e5]">
          <button
            onClick={onClose}
            className="border border-[#007bc0] text-[#007bc0] text-[14px] px-4 py-[5px] hover:bg-[#e6f4ff] transition-colors"
            style={FONT_REG}
          >
            Cancel
          </button>
          <button
            className="bg-[#e5e6eb] text-[#4e5969] text-[14px] px-4 py-[5px] hover:bg-[#d8d9de] transition-colors cursor-pointer"
            style={FONT_REG}
          >
            Re-start Approval
          </button>
          <button
            onClick={onClose}
            className="bg-[#007bc0] text-white text-[14px] px-4 py-[5px] hover:bg-[#006aa8] transition-colors"
            style={FONT_REG}
          >
            Coordinator Release
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function PlanningHorizonView({ children, onUpdateDecision }: { children: React.ReactNode; onUpdateDecision?: () => void }) {
  const [checks, setChecks] = useState<CheckboxState>({
    weekdaysOnly: false,
    pickupDaysOnly: false,
    pnWithVolume: true,
    daysWithVolume: true,
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const toggle = (k: keyof CheckboxState) => setChecks(prev => ({ ...prev, [k]: !prev[k] }));

  return (
    <div className="bg-white border border-[#e0e2e5]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-[#e0e2e5]">
        <div className="flex items-center gap-2">
          <span className="text-[18px] text-[#424c58]" style={FONT_BOLD}>Planning Horizon View</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onUpdateDecision} className="bg-[#007bc0] text-white px-4 py-[6px] text-[14px] hover:bg-[#006aa8] transition-colors" style={FONT_REG}>
            Update Decision
          </button>
        </div>
      </div>
      {/* Checkbox filters + Date Range */}
      <div className="flex flex-wrap items-center gap-2 px-4 sm:px-6 py-2 border-b border-[#e0e2e5]">
        <div className="flex items-center gap-2 flex-wrap">
          <CheckboxFilter checked={checks.weekdaysOnly} label="Weekdays Only" onChange={() => toggle("weekdaysOnly")} />
          <CheckboxFilter checked={checks.pickupDaysOnly} label="Pickup Days Only" onChange={() => toggle("pickupDaysOnly")} />
          <CheckboxFilter checked={checks.pnWithVolume} label="P/N with volume only" blue={true} onChange={() => toggle("pnWithVolume")} />
          <CheckboxFilter checked={checks.daysWithVolume} label="Days with volume only" blue={true} onChange={() => toggle("daysWithVolume")} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[12px] text-[#595e62]" style={FONT_BOLD}>Date Range</span>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(s, e) => { setStartDate(s); setEndDate(e); }}
          />
        </div>
      </div>
      <div className="px-4 sm:px-6 py-3 border-b border-[#e0e2e5]">
        <span className="text-[16px] text-[#2e3033]" style={FONT_BOLD}>Transport Comparison</span>
      </div>
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}

function SyncedTables({ source, onRecalculate }: { source?: "planner" | "coordinator"; onRecalculate?: () => void }) {
  const transportRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [clickedDay, setClickedDay] = useState<number | null>(null);

  useEffect(() => {
    const a = transportRef.current;
    const b = comparisonRef.current;
    if (!a || !b) return;
    let busy = false;
    const onScrollA = () => { if (!busy) { busy = true; b.scrollLeft = a.scrollLeft; requestAnimationFrame(() => { busy = false; }); } };
    const onScrollB = () => { if (!busy) { busy = true; a.scrollLeft = b.scrollLeft; requestAnimationFrame(() => { busy = false; }); } };
    a.addEventListener("scroll", onScrollA, { passive: true });
    b.addEventListener("scroll", onScrollB, { passive: true });
    return () => {
      a.removeEventListener("scroll", onScrollA);
      b.removeEventListener("scroll", onScrollB);
    };
  }, []);

  const [sourceTable, setSourceTable] = useState<"transport" | "planning" | null>(null);

  const makeDayProps = (table: "transport" | "planning") => ({
    hoveredDay,
    clickedDay,
    isSource: sourceTable === table,
    onDayHover: (di: number) => { setHoveredDay(di); setSourceTable(table); },
    onDayClick: (di: number) => { setClickedDay(prev => prev === di ? null : di); setSourceTable(table); },
    onDayLeave: () => { setHoveredDay(null); setSourceTable(null); },
  });

  return (
    <>
      <TransportTable scrollRef={transportRef} {...makeDayProps("transport")} />
      <PlanningComparisonTable source={source} onRecalculate={onRecalculate} scrollRef={comparisonRef} {...makeDayProps("planning")} />
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const ROUTE_NAME = "Demo MR Route";

export default function RouteDetailPage({ onBack, source, onRouteConfirmed }: Props) {
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [recalcModalOpen, setRecalcModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleConfirm = () => {
    setDecisionModalOpen(false);
    onRouteConfirmed?.(ROUTE_NAME);
    setNotification(`${ROUTE_NAME} – decision submitted!`);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col">
      <TopNav activePage="planner" onNavigate={() => {}} />

      <div className="flex-1">
        <div className="w-full 2xl:max-w-[1800px] 2xl:mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#595e62]" style={FONT_REG}>
            <button onClick={onBack} className="hover:text-[#007bc0] transition-colors">Open Approval</button>
            <ChevronRight size={10} />
            <span className="text-[#2e3033]" style={FONT_BOLD}>Demo MR Route</span>
          </div>

          {/* Page header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-bold text-[#2e3033] leading-tight" style={FONT_BOLD}>
                Route Overview
              </h1>
              <div className="text-[12px] text-[#595e62] mt-0.5 flex items-center gap-1.5" style={FONT_REG}>
                <span>Demo MR Route</span>
                <span className="text-[#c0c4c8]">·</span>
                <span>FTL</span>
                <span className="text-[#c0c4c8]">·</span>
                <span>Plant 0101</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 border border-[#d0d4d8] text-[#595e62] px-3 py-1.5 text-[12px] rounded hover:bg-[#f5f6f8] transition-colors"
                style={FONT_REG}
              >
                ← Back to Open Approval
              </button>
              <button className="flex items-center gap-1.5 bg-[#007bc0] text-white px-4 py-1.5 text-[12px] rounded hover:bg-[#006aa8] transition-colors" style={FONT_REG}>
                <ExportIcon />
                Export
              </button>
            </div>
          </div>

          {/* Scenario Summary */}
          <ScenarioSummary />

          {/* Planning Horizon View — Transport Comparison + Planning Comparison in one card */}
          <PlanningHorizonView onUpdateDecision={() => setDecisionModalOpen(true)}>
            <SyncedTables source={source} onRecalculate={() => setRecalcModalOpen(true)} />
          </PlanningHorizonView>


        </div>
      </div>

      {source === "coordinator" ? (
        <CoordinatorDecisionModal
          open={decisionModalOpen}
          routeName={ROUTE_NAME}
          onClose={() => setDecisionModalOpen(false)}
        />
      ) : (
        <UpdateDecisionModal
          open={decisionModalOpen}
          routeName={ROUTE_NAME}
          onClose={() => setDecisionModalOpen(false)}
          onSave={() => setDecisionModalOpen(false)}
          onConfirm={handleConfirm}
        />
      )}
      <RecalculationModal
        open={recalcModalOpen}
        routeName={ROUTE_NAME}
        onClose={() => setRecalcModalOpen(false)}
        onConfirmRecalculation={() => {
          setRecalcModalOpen(false);
          onRouteConfirmed?.("__restart__" + ROUTE_NAME);
          setNotification(`${ROUTE_NAME} – recalculation requested. Route returned to Open Approval.`);
        }}
      />
      {notification && (
        <Notification message={notification} onClose={() => setNotification(null)} />
      )}
    </div>
  );
}
