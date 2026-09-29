import { useState } from "react";

export type FilterCategory = "plant" | "controller" | "route" | "mode" | "vendor";

export type FilterState = Record<FilterCategory, string[]>;
export type FilterOption = { value: string; sub?: string };

export const EMPTY_FILTERS: FilterState = {
  plant: [], controller: [], route: [], mode: [], vendor: [],
};

interface Props {
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters: FilterState;
}

const CATEGORIES: { key: FilterCategory; label: string }[] = [
  { key: "plant", label: "Plant" },
  { key: "controller", label: "MRP Controller" },
  { key: "route", label: "TLO Route" },
  { key: "mode", label: "Transportation Mode" },
  { key: "vendor", label: "Vendor" },
];

const VALUES: Record<FilterCategory, FilterOption[]> = {
  plant: [
    { value: "0101" },
    { value: "0102" },
    { value: "0103" },
  ],
  controller: [
    { value: "Planner A", sub: "(Team 1)" },
    { value: "Planner B", sub: "(Team 3)" },
  ],
  route: [
    { value: "Demo North Route" },
    { value: "Demo FTL Route" },
    { value: "Demo MR Route" },
  ],
  mode: [
    { value: "FTL" },
    { value: "LTL" },
    { value: "MR" },
    { value: "FCL" },
  ],
  vendor: [
    { value: "Supplier Alpha" },
    { value: "Supplier Beta" },
    { value: "Supplier Gamma" },
    { value: "Vendor A1" },
    { value: "Vendor A2" },
  ],
};

function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="#4E5969" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Checkbox({ checked, indeterminate = false, onChange }: { checked: boolean; indeterminate?: boolean; onChange: () => void }) {
  return (
    <span
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={e => { e.stopPropagation(); onChange(); }}
      onKeyDown={e => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          onChange();
        }
      }}
      className="shrink-0 size-[14px] border flex items-center justify-center cursor-pointer"
      style={{ borderColor: checked || indeterminate ? "#007BC0" : "#D0D4D8", backgroundColor: checked || indeterminate ? "#007BC0" : "white" }}
    >
      {indeterminate ? (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ) : checked ? (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  );
}

export default function FilterPanel({ onClose, onApply, initialFilters }: Props) {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("plant");
  const [selections, setSelections] = useState<FilterState>(() => ({
    ...initialFilters,
    plant: [...initialFilters.plant],
    controller: [...initialFilters.controller],
    route: [...initialFilters.route],
    mode: [...initialFilters.mode],
    vendor: [...initialFilters.vendor],
  }));

  const toggleCategory = (cat: FilterCategory) => {
    const allValues = VALUES[cat].map(item => item.value);
    setSelections(prev => ({
      ...prev,
      [cat]: prev[cat].length === allValues.length ? [] : allValues,
    }));
  };

  const toggleValue = (cat: FilterCategory, val: string) => {
    setSelections(prev => {
      const list = prev[cat];
      return {
        ...prev,
        [cat]: list.includes(val) ? list.filter(v => v !== val) : [...list, val],
      };
    });
  };

  const handleApply = () => {
    onApply(selections);
    onClose();
  };

  const handleReset = () => {
    setSelections({ ...EMPTY_FILTERS, plant: [], controller: [], route: [], mode: [], vendor: [] });
  };

  const values = VALUES[activeCategory];

  return (
    <div className="absolute top-full right-0 z-30 mt-1 drop-shadow-[0px_0px_4px_rgba(0,0,0,0.25)] flex">
      {/* Left panel: categories */}
      <div className="bg-white w-[136px] border border-[#e0e2e5]">
        {CATEGORIES.map(({ key, label }) => {
          const allValuesSelected = selections[key].length === VALUES[key].length;
          const isCatPartiallySelected = selections[key].length > 0 && !allValuesSelected;
          const isActive = activeCategory === key;
          return (
            <button
              key={key}
              onClick={() => { setActiveCategory(key); }}
              className={`flex items-center w-full px-3 py-[9px] text-left gap-2 ${isActive ? "bg-[#f2f3f5]" : "bg-white hover:bg-[#f7f8f9]"}`}
            >
              <Checkbox checked={allValuesSelected} indeterminate={isCatPartiallySelected} onChange={() => toggleCategory(key)} />
              <span className="flex-1 text-[10px] text-[#333] leading-[1.2] min-w-0" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>
                {label}
              </span>
              <ChevronRight />
            </button>
          );
        })}
      </div>

      {/* Right panel: values */}
      <div className="bg-white w-[180px] border border-l-0 border-[#e0e2e5]">
        <div className="max-h-[220px] overflow-y-auto">
          {values.map((item, i) => {
            const isChecked = selections[activeCategory].includes(item.value);
            return (
            <div
              key={`${item.value}-${item.sub ?? ""}`}
                onClick={() => toggleValue(activeCategory, item.value)}
                className="flex items-start w-full px-3 py-[9px] gap-2 bg-white hover:bg-[#f7f8f9] cursor-pointer"
              >
                <Checkbox checked={isChecked} onChange={() => toggleValue(activeCategory, item.value)} />
                <span className="flex-1 text-left min-w-0">
                  <span className="block text-[10px] text-[#333] leading-[1.2] whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>{item.value}</span>
                  {item.sub && <span className="block text-[8px] text-[#71767c] leading-[1.2]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>{item.sub}</span>}
                </span>
              </div>
            );
          })}
        </div>
        {/* Footer actions */}
        <div className="border-t border-[#e0e2e5] px-3 py-2 flex gap-2 justify-end">
          <button onClick={handleReset} className="text-[10px] text-[#595e62] hover:text-[#2e3033] px-2 py-1" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Reset</button>
          <button onClick={handleApply} className="text-[10px] bg-[#007bc0] text-white px-3 py-1 hover:bg-[#006aa8]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Apply</button>
        </div>
      </div>
    </div>
  );
}
