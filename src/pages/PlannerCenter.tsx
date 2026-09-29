import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import FilterPanel, { EMPTY_FILTERS, type FilterCategory, type FilterState } from "@/components/FilterPanel";
import UpdateDecisionModal from "@/components/UpdateDecisionModal";
import CoordinatorUpdateDecisionModal from "@/components/CoordinatorUpdateDecisionModal";
import RecalculationModal from "@/components/RecalculationModal";
import Notification from "@/components/Notification";

type SelectedCard = "approvals" | "routes" | "costs";
type ActiveTab = "planner" | "coordinator";

function hasActiveFilters(filters: FilterState) {
  return Object.values(filters).some(values => values.length > 0);
}

function matchesFilters(values: Partial<Record<FilterCategory, string[]>>, filters: FilterState) {
  return (Object.keys(filters) as FilterCategory[]).every(category => {
    const selected = filters[category];
    return selected.length === 0 || selected.some(value => values[category]?.includes(value));
  });
}

interface Props {
  selectedCard: SelectedCard;
  activeTab: ActiveTab;
  onSelectCard: (card: SelectedCard) => void;
  onSelectTab: (tab: ActiveTab) => void;
  onViewDetail: () => void;
  confirmedRoutes?: string[];
  onRouteConfirmed?: (name: string) => void;
}

/* ── Shared icons ── */
function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="#007BC0" strokeWidth="1.5" />
      <path d="M6 10l3 3 5-5" stroke="#007BC0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SyncIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 10a6 6 0 0 1 10.47-4" stroke="#595E62" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 10a6 6 0 0 1-10.47 4" stroke="#595E62" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 6l.47 0L16 4" stroke="#595E62" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 14l-.47 0L4 16" stroke="#595E62" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function EuroIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="#595E62" strokeWidth="1.5" />
      <text x="10" y="14" textAnchor="middle" fontSize="11" fill="#595E62" fontFamily="sans-serif">€</text>
    </svg>
  );
}
function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 3h12M3 7h8M5 11h4" stroke="#595E62" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function ExportIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1v8M4 5l3-3 3 3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 10v2h10v-2" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function ChevronDown({ up }: { up?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={up ? "rotate-180" : ""}>
      <path d="M4 6l4 4 4-4" stroke="#595E62" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function WarningRedIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
      <path d="M7 1L1 11h12L7 1z" stroke="#F53F3F" strokeWidth="1" fill="none" />
      <path d="M7 5v3M7 9.5v.5" stroke="#F53F3F" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function WarningYellowIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
      <path d="M7 1L1 11h12L7 1z" stroke="#BD9900" strokeWidth="1" fill="none" />
      <path d="M7 5v3M7 9.5v.5" stroke="#BD9900" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="15" height="12" viewBox="0 0 15 12.16" fill="none">
      <path d="M13.5 0.75H1.5C1.086 0.75 0.75 1.086 0.75 1.5v7.5c0 .414.336.75.75.75h2.25v2.16l3.51-2.16H13.5c.414 0 .75-.336.75-.75V1.5c0-.414-.336-.75-.75-.75z" fill="#007BC0" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
      <path d="M3.5 1v5M1 3.5h5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/* ── Summary cards ── */
function SummaryCards({ selectedCard, onSelectCard }: { selectedCard: SelectedCard; onSelectCard: (c: SelectedCard) => void }) {
  return (
    <div className="bg-white border-b border-[#e0e2e5] flex">
      <button onClick={() => onSelectCard("approvals")} className={`flex-1 flex items-start gap-3 px-6 py-4 border-l-4 text-left transition-colors ${selectedCard === "approvals" ? "border-l-[#007bc0] bg-[#f0f8ff]" : "border-l-transparent hover:bg-[#f5f6f8]"}`}>
        <div className="mt-0.5"><CheckCircleIcon /></div>
        <div>
          <div className="text-2xl font-bold text-[#2e3033]" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>2</div>
          <div className="text-sm font-bold text-[#007bc0]" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>My Open Approvals</div>
          <div className="text-xs text-[#595e62]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Routes require decision</div>
        </div>
      </button>
      <div className="w-px bg-[#e0e2e5] my-3" />
      <button onClick={() => onSelectCard("routes")} className={`flex-1 flex items-start gap-3 px-6 py-4 border-l-4 text-left transition-colors ${selectedCard === "routes" ? "border-l-[#007bc0] bg-[#f0f8ff]" : "border-l-transparent hover:bg-[#f5f6f8]"}`}>
        <div className="mt-0.5"><SyncIcon /></div>
        <div>
          <div className="text-2xl font-bold text-[#2e3033]" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>4</div>
          <div className="text-sm font-bold text-[#2e3033]" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>Routes in Responsibility</div>
          <div className="text-xs text-[#595e62]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Across 6 plants</div>
        </div>
      </button>
      <div className="w-px bg-[#e0e2e5] my-3" />
      <button onClick={() => onSelectCard("costs")} className={`flex-1 flex items-start gap-3 px-6 py-4 border-l-4 text-left transition-colors ${selectedCard === "costs" ? "border-l-[#007bc0] bg-[#f0f8ff]" : "border-l-transparent hover:bg-[#f5f6f8]"}`}>
        <div className="mt-0.5"><EuroIcon /></div>
        <div>
          <div className="text-2xl font-bold text-[#2e3033]" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>€ 1,872,540</div>
          <div className="text-sm font-bold text-[#2e3033]" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>Costs Saved This Year</div>
          <div className="text-xs text-[#595e62]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>vs. SAP Initial Scenario</div>
        </div>
      </button>
      <div className="w-px bg-[#e0e2e5] my-3" />
      <div className="flex-1 px-6 py-4">
        <div className="text-xs font-bold text-[#2e3033] mb-2" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>Constraints Consideration</div>
        <div className="flex flex-wrap gap-1.5">
          {["Stock Availability", "Planning Time Fence", "Safety Stock", "Transport Capacity", "Truck Capacity (Weight/LDM/PPL)", "Packaging / Stackability", "Transport Calendar / Cut-off"].map(tag => (
            <span key={tag} className="text-[10px] bg-[#f0f4f8] text-[#595e62] px-2 py-0.5 rounded-sm border border-[#d8dce0]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Scenario Summary (Component10 behavior) ── */
function ScenarioSummary() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-[rgba(0,0,0,0.06)] shadow-sm mb-4">
      <div className="flex items-center justify-between px-6 py-[18px]">
        <span className="text-[18px] font-bold text-[#424c58]" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>Scenario Summary</span>
        <button onClick={() => setOpen(v => !v)} className="p-1 hover:bg-[#f5f6f8] rounded">
          <ChevronDown up={open} />
        </button>
      </div>
      {open && (
        <div className="px-6 pb-6 border-t border-[#e0e2e5]">
          <div className="grid grid-cols-6 gap-2 pt-5 text-[12px]">
            {[
              { label: "Total Cost", sap: "€ 12,450", auto: "€ 534,780", man: "€ 596,210" },
              { label: "Transportation Cost", sap: "€ 4,530", auto: "€ 2,416", man: "-" },
              { label: "Inventory Capital Cost", sap: "€ 12,450", auto: "€ 534,780", man: "€ 596,210" },
              { label: "Truck Utilization", sap: "812,450", auto: "534,780", man: "596,210" },
              { label: "Truck Count", sap: "812,450", auto: "534,780", man: "596,210" },
              { label: "DIO Impact", sap: "812,450", auto: "534,780", man: "596,210" },
            ].map(col => (
              <div key={col.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#2e3033]" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>{col.label}</span>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="5" stroke="#71767C" strokeWidth="0.75" /><text x="5.5" y="9" textAnchor="middle" fontSize="7" fill="#71767C">i</text></svg>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[rgba(0,0,0,0.45)]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>SAP</span>
                    <span className="text-[#595e62]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>{col.sap}</span>
                  </div>
                  <div className="flex justify-between bg-[#f7f8f9] px-2 py-1">
                    <span className="font-bold text-[#2e3033]" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>Automated</span>
                    <span className="font-bold text-[#007bc0]" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>{col.auto}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(0,0,0,0.45)]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Manual</span>
                    <span className="text-[#595e62]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>{col.man}</span>
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

/* ── Component11: Pending/Approved/Rejected action row ── */
function StatusActionRow({ status }: { status: "pending" | "approved" | "rejected" }) {
  const isPending = status === "pending";
  const isApproved = status === "approved";
  const isRejected = status === "rejected";
  return (
    <div className="bg-white flex items-center justify-between px-3 py-2 border-b border-[#f0f0f0]">
      <div>
        {isPending && <span className="bg-[#ffdf95] text-[#8f7300] text-[10px] px-3 py-[2px]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Pending</span>}
        {isApproved && <span className="bg-[#e2f5e7] text-[#00512a] text-[10px] px-3 py-[2px]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Approved</span>}
        {isRejected && <span className="bg-[#ffecec] text-[#ed0007] text-[10px] px-3 py-[2px] border border-dashed border-[#ffecec]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Rejected</span>}
      </div>
      <div className="flex items-center gap-2">
        {(isPending || isApproved) && (
          <>
            <ChatIcon />
            <div className="bg-[#007bc0] rounded-full size-[18px] flex items-center justify-center">
              <PlusIcon />
            </div>
            <button className="border border-[#007bc0] text-[#007bc0] text-[10px] px-3 py-[2px] hover:bg-[#e6f4ff]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Copy from</button>
          </>
        )}
        {isPending && (
          <>
            <button className="border border-[#007bc0] text-[#007bc0] text-[10px] px-3 py-[2px] hover:bg-[#e6f4ff]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Reject Automated</button>
            <button className="bg-[#007bc0] text-white text-[10px] px-3 py-[2px] hover:bg-[#006aa8]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Accept Automated</button>
          </>
        )}
        {isRejected && (
          <>
            <ChatIcon />
            <div className="bg-[#007bc0] rounded-full size-[18px] flex items-center justify-center">
              <PlusIcon />
            </div>
            <button className="border border-[#007bc0] text-[#007bc0] text-[10px] px-3 py-[2px] hover:bg-[#e6f4ff]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Copy from</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Component13: Constraint violation route row ── */
function ConstraintRouteRow({ routeName }: { routeName: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-b border-[#e0e2e5]">
      {/* Header row */}
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-[13px] text-[#71767c]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Route - {routeName}</span>
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2 bg-[#ffecec] text-[#ed0007] text-[13px] px-4 py-[3px]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>
            <WarningRedIcon /> Hard Constraints
          </span>
          <span className="flex items-center gap-2 bg-[#ffefd1] text-[#8f7300] text-[13px] px-4 py-[3px]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>
            <WarningYellowIcon /> Constraints Status
          </span>
          <button onClick={() => setExpanded(v => !v)} className="p-1 hover:bg-[#f5f6f8] rounded">
            <ChevronDown up={expanded} />
          </button>
        </div>
      </div>

      {/* Expanded: violations table */}
      {expanded && (
        <div className="border-t border-[#e0e2e5]">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="bg-[#f5f6f8] border-b border-[#e0e2e5]">
                <th className="text-left px-4 py-2 font-normal text-[#595e62]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>P/N</th>
                <th className="text-left px-4 py-2 font-normal text-[#595e62]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Material Description</th>
                <th className="text-left px-4 py-2 font-normal text-[#595e62]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Supplier</th>
                <th className="text-left px-4 py-2 font-normal text-[#595e62]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Planned Delivery Date</th>
                <th className="text-left px-4 py-2 font-normal text-[#595e62]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Scenario</th>
                <th className="text-left px-4 py-2 font-normal text-[#595e62]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Constraints Not Met</th>
                <th className="text-left px-4 py-2 font-normal text-[#595e62]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Violation Level</th>
                <th className="text-left px-4 py-2 font-normal text-[#595e62]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Detail/Reason</th>
                <th className="text-left px-4 py-2 font-normal text-[#595e62]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { pn: "DEMO-PN-01", desc: "Sample Component", supplier: "VENDOR-005 XXXXXXXXX", date: "15.07.2026", scenario: "SAP", constraint: "Safety Stock", level: "red", reason: "Projected available stock (732) is below safety stock (1,000) on 15.07.2026." },
                { pn: "DEMO-PN-01", desc: "Sample Component", supplier: "VENDOR-005 XXXXXXXXX", date: "15.07.2026", scenario: "SAP", constraint: "Safety Stock", level: "yellow", reason: "Projected available stock (732) is below safety stock (1,000) on 15.07.2026." },
              ].map((row, i) => (
                <tr key={i} className="border-b border-[#e0e2e5] hover:bg-[#fafbfc]">
                  <td className="px-4 py-3 text-[#2e3033]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>{row.pn}</td>
                  <td className="px-4 py-3 text-[#2e3033]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>{row.desc}</td>
                  <td className="px-4 py-3 text-[#2e3033] whitespace-pre-line" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>{row.supplier}</td>
                  <td className="px-4 py-3 text-[#2e3033]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>{row.date}</td>
                  <td className="px-4 py-3 text-[#2e3033]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>{row.scenario}</td>
                  <td className="px-4 py-3 text-[#2e3033]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>{row.constraint}</td>
                  <td className="px-4 py-3">
                    {row.level === "red" ? <WarningRedIcon /> : <WarningYellowIcon />}
                  </td>
                  <td className="px-4 py-3 text-[#2e3033] max-w-[300px]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>{row.reason}</td>
                  <td className="px-4 py-3">
                    <button className="text-[#007bc0] text-[11px] hover:underline" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>View Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Constraint Violations Details section ── */
function ConstraintViolationsDetails() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-[#e0e2e5] mt-4">
      <div className="flex items-center justify-between px-6 py-4 cursor-pointer" onClick={() => setOpen(v => !v)}>
        <span className="text-sm font-bold text-[#2e3033]" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>Constraint Violations Details</span>
        <ChevronDown up={open} />
      </div>
      {open && (
        <div className="border-t border-[#e0e2e5]">
          <ConstraintRouteRow routeName="Demo North Route" />
          <ConstraintRouteRow routeName="Demo North Route" />
        </div>
      )}
    </div>
  );
}

/* ── Filter trigger button ── */
function FilterButton({ onClick, active }: { onClick: () => void; active: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 border px-3 py-1.5 text-[12px] hover:bg-[#f5f6f8] transition-colors ${active ? "border-[#007bc0] text-[#007bc0] bg-[#e6f4ff]" : "border-[#d8dce0] text-[#595e62]"}`}
      style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}
    >
      <FilterIcon /> Filter
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}

/* ── Route name hover tooltip ── */
const PLANNER_ROWS = [
  { initials: "BA", color: "#004975", name: "Planner A", role: "(Team 1)", pns: "3 P/Ns" },
  { initials: "BA", color: "#005587", name: "Planner A", role: "(Team 1)", pns: "3 P/Ns" },
  { initials: "BA", color: "#007bc0", name: "Planner A", role: "(Team 1)", pns: "3 P/Ns" },
  { initials: "BA", color: "#0096e8", name: "Planner A", role: "(Team 1)", pns: "3 P/Ns" },
  { initials: "BA", color: "#56b0ff", name: "Planner A", role: "(Team 1)", pns: "3 P/Ns" },
];

function RouteNameTooltipContent() {
  return (
    <div className="bg-white shadow-[0px_8px_12px_rgba(0,0,0,0.12)] flex flex-col items-start pb-[14px] pt-[10px] w-[189px]">
      <div className="px-[12px] h-[16px] flex items-center w-full mb-2">
        <p className="text-[#2e3033] text-[10px] whitespace-nowrap" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>6 people</p>
      </div>
      <div className="flex flex-col gap-[8px] w-full">
        {PLANNER_ROWS.map((p, i) => (
          <div key={i} className="flex flex-col gap-[8px] w-full">
            <div className="border-t border-[#e0e2e5] w-full" />
            <div className="flex gap-[24px] items-center px-[12px]">
              <div className="flex gap-[10px] items-center shrink-0">
                <div className="flex flex-col items-center justify-center rounded-[13px] size-[24px]" style={{ backgroundColor: p.color }}>
                  <p className="text-[10px] text-center text-white" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>{p.initials}</p>
                </div>
                <div className="flex flex-col items-start w-[71px]">
                  <p className="text-[#2e3033] text-[10px] leading-[14px]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>{p.name}</p>
                  <p className="text-[#595e62] text-[8px] leading-[12px]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>{p.role}</p>
                </div>
              </div>
              <p className="text-[#595e62] text-[10px] text-right flex-1" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>{p.pns}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RouteNameWithTooltip({ name, onClick }: { name: string; onClick: () => void }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setPos({ top: rect.bottom + 4, left: rect.left });
      }
      setShow(true);
    }, 1000);
  };
  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShow(false);
  };

  return (
    <div ref={wrapperRef} className="inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        onClick={onClick}
        className="font-bold text-[#2e3033] hover:underline text-left whitespace-pre-line"
        style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}
      >
        {name}
      </button>
      {show && createPortal(
        <div style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}>
          <RouteNameTooltipContent />
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── Approvals table – Planner view ── */
function ApprovalsTablePlanner({ onViewDetail, onUpdateDecision, confirmedRoutes = [], filters = EMPTY_FILTERS }: { onViewDetail: () => void; onUpdateDecision: (routeName: string) => void; confirmedRoutes?: string[]; filters?: FilterState }) {
  const allRows = [
    { name: "Demo North Route", saving: "€ 714", mode: "MR", pairs: ["Supplier Alpha -> FeP", "Supplier Beta -> FeP"], sapCost: "€ 3,330", sapUtil: "78%", sapConst: "✓", sapDio: "12.5", autoCost: "€ 8,250", autoUtil: "78%", autoConst: "✓", autoDio: "13", manCost: "€ 8,250", manUtil: "78%", manConst: "⚠ 2", manDio: "12.4", status: "Open Approval", pending: "3/3 pending", pn: "16 P/N in total", filterValues: { plant: ["0101", "0102"], controller: ["Planner A"], route: ["Demo North Route"], mode: ["MR"], vendor: ["Supplier Alpha", "Supplier Beta"] } },
    { name: "Demo FTL Route", saving: "€ 0", mode: "FTL", pairs: ["Supplier Gamma -> FeP"], sapCost: "€ 4,412", sapUtil: "78%", sapConst: "✓", sapDio: "11.2", autoCost: "€ 8,250", autoUtil: "78%", autoConst: "✓", autoDio: "12.3", manCost: "€ 8,250", manUtil: "78%", manConst: "✓", manDio: "12.1", status: "Open Approval", pending: "0/2 pending", pn: "5 P/N in total", filterValues: { plant: ["0103"], controller: ["Planner A"], route: ["Demo FTL Route"], mode: ["FTL"], vendor: ["Supplier Gamma"] } },
  ];
  const rows = allRows
    .filter(r => !confirmedRoutes.includes(r.name.replace(/\n/g, " ")))
    .filter(r => matchesFilters(r.filterValues, filters));
  const hdr = "'Bosch Sans:Regular', sans-serif";
  const bold = "'Bosch Sans:Bold', sans-serif";
  const reg = "'Bosch Sans:Regular', sans-serif";
  return (
    <div className="overflow-x-auto bg-white">
      <table className="w-full text-[12px] border-collapse">
        <thead>
          <tr className="bg-[#f5f6f8] border-b border-[#e0e2e5]">
            <th className="text-left px-3 py-2 font-normal text-[#595e62] w-28" style={{ fontFamily: hdr }}>TLO Route Name</th>
            <th className="text-left px-3 py-2 font-normal text-[#595e62] w-24" style={{ fontFamily: hdr }}>Potential Total Saving</th>
            <th className="text-left px-3 py-2 font-normal text-[#595e62] w-40" style={{ fontFamily: hdr }}>Shipping Mode & OD Pair</th>
            <th colSpan={4} className="text-center px-3 py-2 font-normal text-[#595e62] border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>SAP</th>
            <th colSpan={4} className="text-center px-3 py-2 font-normal text-[#595e62] border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>Automated</th>
            <th colSpan={4} className="text-center px-3 py-2 font-normal text-[#595e62] border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>Manual</th>
            <th className="text-left px-3 py-2 font-normal text-[#595e62] border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>Approval Status</th>
            <th className="text-left px-3 py-2 font-normal text-[#595e62]" style={{ fontFamily: hdr }}>Action</th>
          </tr>
          <tr className="bg-[#f5f6f8] border-b border-[#e0e2e5] text-[10px] text-[#595e62]">
            <th /><th /><th />
            {["Total Cost", "Avg. Utilization", "Constraints", "DIO"].map(h => <th key={`s-${h}`} className="text-center px-2 py-1 font-normal border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>{h}</th>)}
            {["Total Cost", "Avg. Utilization", "Constraints", "DIO"].map(h => <th key={`a-${h}`} className="text-center px-2 py-1 font-normal border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>{h}</th>)}
            {["Total Cost", "Avg. Utilization", "Constraints", "DIO"].map(h => <th key={`m-${h}`} className="text-center px-2 py-1 font-normal border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>{h}</th>)}
            <th /><th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#e0e2e5] hover:bg-[#fafbfc]">
              <td className="px-3 py-3 align-top"><RouteNameWithTooltip name={row.name} onClick={onViewDetail} /></td>
              <td className="px-3 py-3 align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.saving}</td>
              <td className="px-3 py-3 align-top">
                <div className="text-[#2e3033] font-bold mb-1" style={{ fontFamily: bold }}>{row.mode}</div>
                {row.pairs.map(p => <div key={p} className="text-[10px] text-[#595e62]" style={{ fontFamily: reg }}>{p}</div>)}
              </td>
              <td className="px-2 py-3 text-center align-top border-l border-[#e0e2e5] text-[#2e3033]" style={{ fontFamily: reg }}>{row.sapCost}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.sapUtil}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.sapConst}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.sapDio}</td>
              <td className="px-2 py-3 text-center align-top border-l border-[#e0e2e5] text-[#2e3033]" style={{ fontFamily: reg }}>{row.autoCost}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.autoUtil}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.autoConst}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.autoDio}</td>
              <td className="px-2 py-3 text-center align-top border-l border-[#e0e2e5] text-[#2e3033]" style={{ fontFamily: reg }}>{row.manCost}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.manUtil}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.manConst}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.manDio}</td>
              <td className="px-3 py-3 align-top border-l border-[#e0e2e5]">
                <div className="bg-[#ffdf95] text-[#8f7300] text-[10px] px-2 py-0.5 inline-block mb-1" style={{ fontFamily: reg }}>{row.status}</div>
                <div className="text-[10px] font-bold text-[#2e3033]" style={{ fontFamily: bold }}>{row.pending}</div>
                <div className="text-[10px] text-[#595e62]" style={{ fontFamily: reg }}>{row.pn}</div>
              </td>
              <td className="px-3 py-3 align-top">
                <div className="flex flex-col gap-1">
                  <button onClick={() => onUpdateDecision(row.name.replace(/\n/g, " "))} className="bg-[#007bc0] text-white text-[11px] px-3 py-1 whitespace-nowrap hover:bg-[#006aa8]" style={{ fontFamily: reg }}>Update Decision</button>
                  <button onClick={onViewDetail} className="text-[#007bc0] text-[11px] hover:underline text-center" style={{ fontFamily: reg }}>View detail</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Coordinator approvals table ── */
function CoordinatorApprovalsTable({ onViewDetail, onUpdateDecision, filters = EMPTY_FILTERS }: { onViewDetail: () => void; onUpdateDecision: (name: string) => void; filters?: FilterState }) {
  const rows = [
    { name: "Demo MR Route", saving: "€ 714", mode: "MR", pairs: ["Vendor A1 -> Plant B", "Vendor A2 -> Plant B"], sapCost: "€ 18,250", sapUtil: "78%", sapConst: "✓", sapDio: "12.5", autoCost: "€ 8,250", autoUtil: "78%", autoConst: "✓", autoDio: "13", manCost: "€ 8,250", manUtil: "78%", manConst: "⚠ 2", manDio: "12.4", confirmed: "3/5", rejected: "2/5", needAction: 2, filterValues: { plant: ["0101"], controller: ["Planner B"], route: ["Demo MR Route"], mode: ["MR"], vendor: ["Vendor A1", "Vendor A2"] } },
  ];
  const filteredRows = rows.filter(row => matchesFilters(row.filterValues, filters));
  const hdr = "'Bosch Sans:Regular', sans-serif";
  const bold = "'Bosch Sans:Bold', sans-serif";
  const reg = "'Bosch Sans:Regular', sans-serif";
  return (
    <div className="overflow-x-auto bg-white">
      <table className="w-full text-[12px] border-collapse">
        <thead>
          <tr className="bg-[#f5f6f8] border-b border-[#e0e2e5]">
            <th className="text-left px-3 py-2 font-normal text-[#595e62] w-28" style={{ fontFamily: hdr }}>TLO Route Name</th>
            <th className="text-left px-3 py-2 font-normal text-[#595e62] w-24" style={{ fontFamily: hdr }}>Potential Total Saving</th>
            <th className="text-left px-3 py-2 font-normal text-[#595e62] w-40" style={{ fontFamily: hdr }}>Shipping Mode & OD Pair</th>
            <th colSpan={4} className="text-center px-3 py-2 font-normal text-[#595e62] border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>SAP</th>
            <th colSpan={4} className="text-center px-3 py-2 font-normal text-[#595e62] border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>Automated</th>
            <th colSpan={4} className="text-center px-3 py-2 font-normal text-[#595e62] border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>Manual</th>
            <th className="text-left px-3 py-2 font-normal text-[#595e62] border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>Approval Status</th>
            <th className="text-left px-3 py-2 font-normal text-[#595e62]" style={{ fontFamily: hdr }}>Action</th>
          </tr>
          <tr className="bg-[#f5f6f8] border-b border-[#e0e2e5] text-[10px] text-[#595e62]">
            <th /><th /><th />
            {["Total Cost", "Avg. Utilization", "Constraints", "DIO"].map(h => <th key={`s-${h}`} className="text-center px-2 py-1 font-normal border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>{h}</th>)}
            {["Total Cost", "Avg. Utilization", "Constraints", "DIO"].map(h => <th key={`a-${h}`} className="text-center px-2 py-1 font-normal border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>{h}</th>)}
            {["Total Cost", "Avg. Utilization", "Constraints", "DIO"].map(h => <th key={`m-${h}`} className="text-center px-2 py-1 font-normal border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>{h}</th>)}
            <th /><th />
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row, i) => (
            <tr key={i} className="border-b border-[#e0e2e5] hover:bg-[#fafbfc]">
              <td className="px-3 py-3 align-top"><RouteNameWithTooltip name={row.name} onClick={onViewDetail} /></td>
              <td className="px-3 py-3 align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.saving}</td>
              <td className="px-3 py-3 align-top">
                <div className="text-[#2e3033] font-bold mb-1" style={{ fontFamily: bold }}>{row.mode}</div>
                {row.pairs.map(p => <div key={p} className="text-[10px] text-[#595e62]" style={{ fontFamily: reg }}>{p}</div>)}
              </td>
              <td className="px-2 py-3 text-center align-top border-l border-[#e0e2e5] text-[#2e3033]" style={{ fontFamily: reg }}>{row.sapCost}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.sapUtil}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.sapConst}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.sapDio}</td>
              <td className="px-2 py-3 text-center align-top border-l border-[#e0e2e5] text-[#2e3033]" style={{ fontFamily: reg }}>{row.autoCost}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.autoUtil}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.autoConst}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.autoDio}</td>
              <td className="px-2 py-3 text-center align-top border-l border-[#e0e2e5] text-[#2e3033]" style={{ fontFamily: reg }}>{row.manCost}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.manUtil}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.manConst}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.manDio}</td>
              <td className="px-2 py-3 align-top border-l border-[#e0e2e5] w-[161px]">
                <div className="flex flex-col gap-[6px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#2e3033]" style={{ fontFamily: bold }}>P/N decision status</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="5.833" stroke="#2e3033" strokeWidth="0.667" />
                      <text x="7" y="10.5" textAnchor="middle" fontSize="7" fill="#2e3033">i</text>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-px text-[10px]" style={{ fontFamily: reg }}>
                    <div className="flex items-center gap-[35px]">
                      <span className="text-[#2e3033] whitespace-nowrap">{row.confirmed}</span>
                      <span className="text-[#595e62] text-right w-[79px]">Confirmed</span>
                    </div>
                    <div className="flex items-center gap-[35px]">
                      <span className="text-[#2e3033] whitespace-nowrap">{row.rejected}</span>
                      <span className="text-[#595e62] text-right w-[79px]">Rejected</span>
                    </div>
                    <div className="flex items-center gap-[35px]">
                      <span className="text-[#2e3033] whitespace-nowrap">0/5</span>
                      <span className="text-[#595e62] text-right w-[79px]">Open Approval</span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 align-top">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => onUpdateDecision(row.name.replace(/\n/g, " "))}
                    className={`text-[11px] px-3 py-1 whitespace-nowrap ${i === 1 ? "bg-[#007bc0] text-white hover:bg-[#006aa8]" : "border border-[#007bc0] text-[#007bc0] hover:bg-[#e6f4ff]"}`}
                    style={{ fontFamily: reg }}
                  >
                    Update decision
                  </button>
                  <button onClick={onViewDetail} className="text-[#007bc0] text-[11px] hover:underline text-center" style={{ fontFamily: reg }}>
                    View detail
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Route Overview Page table ── */
function RouteOverviewTable({ onViewDetail, filters = EMPTY_FILTERS }: { onViewDetail: () => void; filters?: FilterState }) {
  const rows = [
    { name: "Demo MR Route", plants: "Site A, Site B", mrp: ["H1", "AL", "TL", "+6"], supplier: "Supplier Alpha\nVENDOR-001", mode: "MR", since: "12/06/2026", sapCost: "€ 12,450", approvedCost: "€ 12,450", savings: "€ 12,450", savingsPct: "26%", sapUtil: "52.1%", approvedUtil: "71.6%", status: "Await Approval", filterValues: { plant: ["0101", "0102"], controller: ["Planner A"], route: ["Demo MR Route"], mode: ["MR"], vendor: ["Supplier Alpha"] } },
    { name: "Demo FTL Route", plants: "Demo North Route", mrp: ["D1", "AL", "TL", "+6"], supplier: "Supplier Gamma\nVENDOR-006", mode: "FCL", since: "12/06/2026", sapCost: "€ 12,450", approvedCost: "€ 12,450", savings: "€ 12,450", savingsPct: "26%", sapUtil: "52.1%", approvedUtil: "71.6%", status: "Approval done", filterValues: { plant: ["0103"], controller: ["Planner B"], route: ["Demo FTL Route"], mode: ["FCL"], vendor: ["Supplier Gamma"] } },
  ];
  const filteredRows = rows.filter(row => matchesFilters(row.filterValues, filters));
  const hdr = "'Bosch Sans:Regular', sans-serif";
  const bold = "'Bosch Sans:Bold', sans-serif";
  const reg = "'Bosch Sans:Regular', sans-serif";
  return (
    <div className="overflow-x-auto bg-white">
      <table className="w-full text-[12px] border-collapse">
        <thead>
          <tr className="bg-[#f5f6f8] border-b border-[#e0e2e5]">
            <th className="text-left px-3 py-2 font-normal text-[#595e62]" style={{ fontFamily: hdr }}>TLO Route Name</th>
            <th className="text-left px-3 py-2 font-normal text-[#595e62]" style={{ fontFamily: hdr }}>Plant (s)</th>
            <th className="text-left px-3 py-2 font-normal text-[#595e62]" style={{ fontFamily: hdr }}>MRP Controller</th>
            <th className="text-left px-3 py-2 font-normal text-[#595e62]" style={{ fontFamily: hdr }}>Supplier</th>
            <th className="text-left px-3 py-2 font-normal text-[#595e62]" style={{ fontFamily: hdr }}>Transportation Mode</th>
            <th className="text-left px-3 py-2 font-normal text-[#595e62]" style={{ fontFamily: hdr }}>Active Since</th>
            <th colSpan={4} className="text-center px-3 py-2 font-normal text-[#595e62] border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>THIS YEAR (EUR)</th>
            <th colSpan={2} className="text-center px-3 py-2 font-normal text-[#595e62] border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>Avg. Utilization (%)</th>
            <th className="text-left px-3 py-2 font-normal text-[#595e62] border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>Approval Status</th>
            <th className="text-left px-3 py-2 font-normal text-[#595e62]" style={{ fontFamily: hdr }}>Action</th>
          </tr>
          <tr className="bg-[#f5f6f8] border-b border-[#e0e2e5] text-[10px] text-[#595e62]">
            <th colSpan={6} />
            {["SAP Cost", "Approved Cost", "Savings", "Savings (%)"].map(h => <th key={h} className="text-center px-2 py-1 font-normal border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>{h}</th>)}
            {["SAP", "Approved"].map(h => <th key={h} className="text-center px-2 py-1 font-normal border-l border-[#e0e2e5]" style={{ fontFamily: hdr }}>{h}</th>)}
            <th /><th />
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row, i) => (
            <tr key={i} className="border-b border-[#e0e2e5] hover:bg-[#fafbfc]">
              <td className="px-3 py-3 align-top"><button onClick={onViewDetail} className="font-bold text-[#2e3033] hover:underline text-left" style={{ fontFamily: bold }}>{row.name}</button></td>
              <td className="px-3 py-3 align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.plants}</td>
              <td className="px-3 py-3 align-top">
                <div className="flex gap-1 flex-wrap">
                  {row.mrp.map((m, j) => <span key={j} className={`text-[10px] px-1.5 py-0.5 rounded-full ${j < 3 ? "bg-[#007bc0] text-white" : "bg-[#e0e2e5] text-[#595e62]"}`} style={{ fontFamily: reg }}>{m}</span>)}
                </div>
              </td>
              <td className="px-3 py-3 align-top whitespace-pre-line text-[#2e3033]" style={{ fontFamily: reg }}>{row.supplier}</td>
              <td className="px-3 py-3 align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.mode}</td>
              <td className="px-3 py-3 align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.since}</td>
              <td className="px-2 py-3 text-center align-top border-l border-[#e0e2e5] text-[#2e3033]" style={{ fontFamily: reg }}>{row.sapCost}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.approvedCost}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.savings}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.savingsPct}</td>
              <td className="px-2 py-3 text-center align-top border-l border-[#e0e2e5] text-[#2e3033]" style={{ fontFamily: reg }}>{row.sapUtil}</td>
              <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.approvedUtil}</td>
              <td className="px-3 py-3 align-top border-l border-[#e0e2e5]">
                <span className={`text-[10px] px-2 py-0.5 ${row.status === "Await Approval" ? "bg-[#ffdf95] text-[#8f7300]" : "bg-[#e2f5e7] text-[#00512a]"}`} style={{ fontFamily: reg }}>{row.status}</span>
              </td>
              <td className="px-3 py-3 align-top">
                <button onClick={onViewDetail} className="text-[#007bc0] text-[11px] hover:underline" style={{ fontFamily: reg }}>View Detail</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── KPI Summary ── */
function MiniSparkline({ color }: { color: string }) {
  return (
    <svg width="100%" height="40" viewBox="0 0 200 40" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d="M0,30 C20,28 40,35 60,25 C80,15 100,32 120,20 C140,8 160,18 180,12 L200,10 L200,40 L0,40 Z" fill={`url(#grad-${color.replace("#", "")})`} />
      <path d="M0,30 C20,28 40,35 60,25 C80,15 100,32 120,20 C140,8 160,18 180,12 L200,10" fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function KPISummary({ onViewDetail }: { onViewDetail: () => void }) {
  const kpis = [
    { title: "Total Transport Costs", value: "€ 1,872,540", sub: "Total Savings vs. SAP", sapScen: "€ 3,004", manScen: "€ 4,504", autoScen: "€ 4,504", color: "#007bc0" },
    { title: "Average Truck Utilization", value: "73%", sub: "Average (Actual)", sapScen: "56%", manScen: "64%", autoScen: "73%", color: "#007bc0" },
    { title: "CO2 Emissions (tCO₂e)", value: "7,678", sub: "Total Savings vs. SAP", sapScen: "12,234", manScen: "10,342", autoScen: "7,678", color: "#007bc0" },
    { title: "DIO (Days of Inventory Outstanding)", value: "- 2.3", sub: "Total Savings vs. SAP", sapScen: "6.3", manScen: "2.4", autoScen: "15.3", color: "#007bc0" },
  ];
  const savingRows = [
    { name: "Demo MR Route", plants: "Site A, Site B", mrp: ["H1", "AL", "TL", "+6"], sapInitial: "€ 12,450", automated: "-€12,450", approved: "+€ 2,450", sap: "48%", automatedUtil: "52.1%", approvedUtil: "45.6%", dio: "-2.5" },
    { name: "Demo FTL Route", plants: "Site A, Site B", mrp: ["D1", "AL", "TL", "+6"], sapInitial: "€ 12,450", automated: "€ 12,450", approved: "€ 12,450", sap: "26%", automatedUtil: "52.1%", approvedUtil: "71.6%", dio: "-2.5" },
  ];
  const reg = "'Bosch Sans:Regular', sans-serif";
  const bold = "'Bosch Sans:Bold', sans-serif";
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white border border-[#e0e2e5] rounded p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-[11px] text-[#595e62]" style={{ fontFamily: reg }}>{kpi.title}</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#595E62" strokeWidth="1" /><text x="7" y="11" textAnchor="middle" fontSize="9" fill="#595E62">i</text></svg>
            </div>
            <div className="text-xl font-bold text-[#007bc0] mb-1" style={{ fontFamily: bold }}>{kpi.value}</div>
            <div className="text-[10px] text-[#595e62] mb-2" style={{ fontFamily: reg }}>{kpi.sub}</div>
            <div className="flex gap-3 text-[10px] text-[#595e62] mb-2" style={{ fontFamily: reg }}>
              <span>● SAP Scen. {kpi.sapScen}</span>
              <span>● Manual {kpi.manScen}</span>
              <span className="text-[#007bc0]">● Auto. {kpi.autoScen}</span>
            </div>
            <div className="h-10"><MiniSparkline color={kpi.color} /></div>
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#2e3033]" style={{ fontFamily: bold }}>Saving by Route</h3>
          <div className="flex items-center border border-[#d8dce0] rounded px-3 py-1 gap-2">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="4" stroke="#595E62" strokeWidth="1" /><path d="M9 9l2 2" stroke="#595E62" strokeWidth="1" strokeLinecap="round" /></svg>
            <span className="text-[11px] text-[#9ca3af]" style={{ fontFamily: reg }}>Search route...</span>
          </div>
        </div>
        <div className="overflow-x-auto bg-white">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="bg-[#f5f6f8] border-b border-[#e0e2e5]">
                <th className="text-left px-3 py-2 font-normal text-[#595e62]" style={{ fontFamily: reg }}>TLO Route Name</th>
                <th className="text-left px-3 py-2 font-normal text-[#595e62]" style={{ fontFamily: reg }}>Plant (s)</th>
                <th className="text-left px-3 py-2 font-normal text-[#595e62]" style={{ fontFamily: reg }}>MRP Controller</th>
                <th colSpan={3} className="text-center px-3 py-2 font-normal text-[#595e62] border-l border-[#e0e2e5]" style={{ fontFamily: reg }}>Total Cost Saving</th>
                <th colSpan={3} className="text-center px-3 py-2 font-normal text-[#595e62] border-l border-[#e0e2e5]" style={{ fontFamily: reg }}>Avg. Utilization (%)</th>
                <th className="text-center px-3 py-2 font-normal text-[#595e62] border-l border-[#e0e2e5]" style={{ fontFamily: reg }}>DIO IMP (Days)</th>
                <th className="text-left px-3 py-2 font-normal text-[#595e62]" style={{ fontFamily: reg }}>Action</th>
              </tr>
              <tr className="bg-[#f5f6f8] border-b border-[#e0e2e5] text-[10px] text-[#595e62]">
                <th colSpan={3} />
                {["SAP Initial", "Automated vs. SAP", "Approved vs. SAP Initial"].map(h => <th key={h} className="text-center px-2 py-1 font-normal border-l border-[#e0e2e5]" style={{ fontFamily: reg }}>{h}</th>)}
                {["SAP", "Automated", "Approved"].map(h => <th key={h} className="text-center px-2 py-1 font-normal border-l border-[#e0e2e5]" style={{ fontFamily: reg }}>{h}</th>)}
                <th /><th />
              </tr>
            </thead>
            <tbody>
              {savingRows.map((row, i) => (
                <tr key={i} className="border-b border-[#e0e2e5] hover:bg-[#fafbfc]">
                  <td className="px-3 py-3 align-top"><button onClick={onViewDetail} className="font-bold text-[#2e3033] hover:underline text-left" style={{ fontFamily: bold }}>{row.name}</button></td>
                  <td className="px-3 py-3 align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.plants}</td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex gap-1 flex-wrap">
                      {row.mrp.map((m, j) => <span key={j} className={`text-[10px] px-1.5 py-0.5 rounded-full ${j < 3 ? "bg-[#007bc0] text-white" : "bg-[#e0e2e5] text-[#595e62]"}`} style={{ fontFamily: reg }}>{m}</span>)}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center align-top border-l border-[#e0e2e5] text-[#2e3033]" style={{ fontFamily: reg }}>{row.sapInitial}</td>
                  <td className={`px-2 py-3 text-center align-top font-bold ${row.automated.startsWith("-") ? "text-[#e00]" : "text-[#2e3033]"}`} style={{ fontFamily: bold }}>{row.automated}</td>
                  <td className={`px-2 py-3 text-center align-top font-bold ${row.approved.startsWith("+") ? "text-[#007bc0]" : "text-[#2e3033]"}`} style={{ fontFamily: bold }}>{row.approved}</td>
                  <td className="px-2 py-3 text-center align-top border-l border-[#e0e2e5] text-[#2e3033]" style={{ fontFamily: reg }}>{row.sap}</td>
                  <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.automatedUtil}</td>
                  <td className="px-2 py-3 text-center align-top text-[#2e3033]" style={{ fontFamily: reg }}>{row.approvedUtil}</td>
                  <td className="px-2 py-3 text-center align-top border-l border-[#e0e2e5] text-[#2e3033]" style={{ fontFamily: reg }}>{row.dio}</td>
                  <td className="px-3 py-3 align-top"><button onClick={onViewDetail} className="text-[#007bc0] text-[11px] hover:underline" style={{ fontFamily: reg }}>View Detail</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Main PlannerCenter export ── */
export default function PlannerCenter({ selectedCard, activeTab, onSelectCard, onSelectTab, onViewDetail, confirmedRoutes = [], onRouteConfirmed }: Props) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [approvalFilters, setApprovalFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [proxyFilterOpen, setProxyFilterOpen] = useState(false);
  const proxyFilterRef = useRef<HTMLDivElement>(null);
  const [proxyFilters, setProxyFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [routeFilterOpen, setRouteFilterOpen] = useState(false);
  const routeFilterRef = useRef<HTMLDivElement>(null);
  const [routeFilters, setRouteFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionRouteName, setDecisionRouteName] = useState("");
  const [coordinatorModalOpen, setCoordinatorModalOpen] = useState(false);
  const [coordinatorRouteName, setCoordinatorRouteName] = useState("");
  const [recalcModalOpen, setRecalcModalOpen] = useState(false);
  const [recalcRouteName, setRecalcRouteName] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Close filters when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (proxyFilterRef.current && !proxyFilterRef.current.contains(e.target as Node)) setProxyFilterOpen(false);
      if (routeFilterRef.current && !routeFilterRef.current.contains(e.target as Node)) setRouteFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-[#f5f6f8]">
      <SummaryCards selectedCard={selectedCard} onSelectCard={onSelectCard} />

      {/* Tab bar */}
      {selectedCard === "approvals" && (
        <div className="bg-transparent border-b border-[#e0e2e5] px-6 flex items-center justify-between pt-[40px] pb-0">
          <div className="flex">
            {(["planner", "coordinator"] as ActiveTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => onSelectTab(tab)}
                className={`px-4 py-3 text-sm border-b-2 transition-colors ${activeTab === tab ? "bg-white border-[#007bc0] text-[#007bc0]" : "border-transparent text-[#595e62] hover:text-[#2e3033]"}`}
                style={{ fontFamily: activeTab === tab ? "'Bosch Sans:Bold', sans-serif" : "'Bosch Sans:Regular', sans-serif" }}
              >
                {tab === "planner" ? "Planner view" : "Coordinator View"}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 bg-[#007bc0] text-white text-sm px-4 py-2 my-2 hover:bg-[#006aa8]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>
            <ExportIcon /> Export
          </button>
        </div>
      )}

      {(selectedCard === "routes" || selectedCard === "costs") && (
        <div className="bg-white border-b border-[#e0e2e5] px-6 flex justify-end py-2">
          <button className="flex items-center gap-2 bg-[#007bc0] text-white text-sm px-4 py-2 hover:bg-[#006aa8]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>
            <ExportIcon /> Export
          </button>
        </div>
      )}

      {/* ── Approvals content ── */}
      {selectedCard === "approvals" && (
        <div className="p-6 space-y-4">
          {/* Routes Requiring Decision + Constraint Violations — one section */}
          <div className="bg-white">
            <div className="flex items-center justify-between bg-white py-3 px-6">
              <h2 className="text-sm font-bold text-[#2e3033]" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>
                Approvals – Routes Requiring Decision
              </h2>
              <div ref={filterRef} className="relative">
                <FilterButton onClick={() => setFilterOpen(v => !v)} active={filterOpen || hasActiveFilters(approvalFilters)} />
                {filterOpen && (
                  <FilterPanel
                    onClose={() => setFilterOpen(false)}
                    onApply={setApprovalFilters}
                    initialFilters={approvalFilters}
                  />
                )}
              </div>
            </div>
            <div className="border border-[#e0e2e5]">
              {activeTab === "planner" ? (
                <ApprovalsTablePlanner onViewDetail={onViewDetail} onUpdateDecision={(name) => { setDecisionRouteName(name); setDecisionModalOpen(true); }} confirmedRoutes={confirmedRoutes} filters={approvalFilters} />
              ) : (
                <CoordinatorApprovalsTable onViewDetail={onViewDetail} onUpdateDecision={(name) => { setCoordinatorRouteName(name); setCoordinatorModalOpen(true); }} filters={approvalFilters} />
              )}
            </div>
          </div>

          {/* Constraint Violations Details — below Open Approvals */}
          {activeTab === "planner" && <ConstraintViolationsDetails />}

          {/* Proxy Routes — exact same design + data as Approvals section */}
          <div className="bg-white">
            <div className="flex items-center justify-between bg-white py-3 px-6">
              <h2 className="text-sm font-bold text-[#2e3033]" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>
                Proxy Routes Requiring Decision
              </h2>
              <div ref={proxyFilterRef} className="relative">
                <FilterButton onClick={() => setProxyFilterOpen(v => !v)} active={proxyFilterOpen || hasActiveFilters(proxyFilters)} />
                {proxyFilterOpen && (
                  <FilterPanel
                    onClose={() => setProxyFilterOpen(false)}
                    onApply={setProxyFilters}
                    initialFilters={proxyFilters}
                  />
                )}
              </div>
            </div>
            <div className="border border-[#e0e2e5]">
              {activeTab === "planner" ? (
                <ApprovalsTablePlanner onViewDetail={onViewDetail} onUpdateDecision={(name) => { setDecisionRouteName(name); setDecisionModalOpen(true); }} confirmedRoutes={confirmedRoutes} filters={proxyFilters} />
              ) : (
                <CoordinatorApprovalsTable onViewDetail={onViewDetail} onUpdateDecision={(name) => { setCoordinatorRouteName(name); setCoordinatorModalOpen(true); }} filters={proxyFilters} />
              )}
            </div>
          </div>

          {/* Constraint Violations Details */}
          {activeTab === "planner" && <ConstraintViolationsDetails />}
        </div>
      )}

      {/* ── Routes content ── */}
      {selectedCard === "routes" && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#2e3033]" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>Route Overview Page</h2>
            <div ref={routeFilterRef} className="relative">
              <FilterButton onClick={() => setRouteFilterOpen(v => !v)} active={routeFilterOpen || hasActiveFilters(routeFilters)} />
              {routeFilterOpen && (
                <FilterPanel
                  onClose={() => setRouteFilterOpen(false)}
                  onApply={setRouteFilters}
                  initialFilters={routeFilters}
                />
              )}
            </div>
          </div>
          <div className="bg-white border border-[#e0e2e5]">
            <RouteOverviewTable onViewDetail={onViewDetail} filters={routeFilters} />
          </div>
        </div>
      )}

      {/* ── KPI Summary content ── */}
      {selectedCard === "costs" && <KPISummary onViewDetail={onViewDetail} />}

      <UpdateDecisionModal
        open={decisionModalOpen}
        routeName={decisionRouteName}
        onClose={() => setDecisionModalOpen(false)}
        onSave={() => setDecisionModalOpen(false)}
        onConfirm={(name) => {
          setDecisionModalOpen(false);
          onRouteConfirmed?.(name);
          setNotification(`${name} – decision submitted!`);
        }}
      />
      <CoordinatorUpdateDecisionModal
        open={coordinatorModalOpen}
        routeName={coordinatorRouteName}
        onClose={() => setCoordinatorModalOpen(false)}
        onRelease={() => {
          setCoordinatorModalOpen(false);
          setNotification(`${coordinatorRouteName} – coordinator release submitted!`);
        }}
        onRestartApproval={() => {
          setCoordinatorModalOpen(false);
          onRouteConfirmed?.("__restart__" + coordinatorRouteName);
          setNotification(`${coordinatorRouteName} – re-sent to planners for approval.`);
        }}
      />
      <RecalculationModal
        open={recalcModalOpen}
        routeName={recalcRouteName}
        onClose={() => setRecalcModalOpen(false)}
        onConfirmRecalculation={() => {
          setRecalcModalOpen(false);
          onRouteConfirmed?.("__restart__" + recalcRouteName);
          setNotification(`${recalcRouteName} – recalculation requested. Route returned to Open Approval.`);
        }}
      />
      {notification && (
        <Notification
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
