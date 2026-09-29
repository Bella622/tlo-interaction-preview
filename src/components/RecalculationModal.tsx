import { useState } from "react";
import { createPortal } from "react-dom";
import svgPaths from "@/imports/Frame1000003132/svg-awdqbl2e1j";

interface Props {
  open: boolean;
  routeName: string;
  onClose: () => void;
  onConfirmRecalculation: () => void;
}

const FONT_REG = { fontFamily: "'Bosch Sans:Regular', sans-serif" } as const;
const FONT_BOLD = { fontFamily: "'Bosch Sans:Bold', sans-serif" } as const;

const PN_ROWS = [
  { pn: "DEMO-PN-01", planner: "Planner B (Team 3)", automatedDecision: "Rejected" as const },
  { pn: "DEMO-PN-01", planner: "Planner B (Team 3)", automatedDecision: "Rejected" as const },
  { pn: "DEMO-PN-01", planner: "Planner B (Team 3)", automatedDecision: "Approved" as const },
  { pn: "DEMO-PN-01", planner: "Planner B (Team 3)", automatedDecision: "Approved" as const },
  { pn: "DEMO-PN-01", planner: "Planner B (Team 3)", automatedDecision: "Approved" as const },
];

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d={svgPaths.pe131680} fill="#333333" />
      <path d={svgPaths.p113abc00} fill="#333333" />
    </svg>
  );
}

function CheckboxChecked() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect width="14" height="14" fill="#007BC0" />
      <path d={svgPaths.p2402ad00} fill="white" />
    </svg>
  );
}

function CheckboxUnchecked({ indeterminate = false }: { indeterminate?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="13" height="13" stroke="#c9cdd4" />
      {indeterminate && <path d="M3 7h8" stroke="#007BC0" strokeWidth="2" />}
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="20" height="17" viewBox="0 0 20 16.2071" fill="none">
      <path d={svgPaths.p3967f480} fill="#595E62" />
    </svg>
  );
}

function AutoDecisionBadge({ value }: { value: "Approved" | "Rejected" }) {
  if (value === "Approved") {
    return (
      <span className="inline-block bg-[#e2f5e7] text-[#5ebd82] px-4 py-[5px] text-[14px] whitespace-nowrap" style={FONT_REG}>
        Approved
      </span>
    );
  }
  return (
    <span className="inline-block bg-[#ffecec] text-[#ed0007] px-4 py-[5px] text-[14px] whitespace-nowrap" style={FONT_REG}>
      Rejected
    </span>
  );
}

export default function RecalculationModal({ open, routeName, onClose, onConfirmRecalculation }: Props) {
  const [paramUpdates, setParamUpdates] = useState<boolean[]>(
    PN_ROWS.map((r, i) => i < 2)
  );
  const [selectedPNs, setSelectedPNs] = useState<Set<string>>(
    () => new Set(PN_ROWS.map(row => row.pn))
  );

  if (!open) return null;

  const toggleParam = (idx: number, val: boolean) =>
    setParamUpdates(prev => prev.map((v, i) => i === idx ? val : v));
  const allSelected = selectedPNs.size === PN_ROWS.length;
  const partiallySelected = selectedPNs.size > 0 && !allSelected;
  const toggleAllPNs = () =>
    setSelectedPNs(allSelected ? new Set() : new Set(PN_ROWS.map(row => row.pn)));
  const togglePN = (pn: string) =>
    setSelectedPNs(prev => {
      const next = new Set(prev);
      if (next.has(pn)) next.delete(pn);
      else next.add(pn);
      return next;
    });

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(0,0,0,0.5)]"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white shadow-[0px_8px_16px_0px_rgba(0,0,0,0.2)] w-[780px] max-w-[96vw] max-h-[90vh] overflow-y-auto">
        <div className="p-8 flex flex-col gap-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-[16px] text-[#2e3033]" style={FONT_BOLD}>Recalculation</p>
            <button onClick={onClose} className="hover:bg-[#f5f6f8] rounded p-0.5" aria-label="Close">
              <CloseIcon />
            </button>
          </div>

          {/* Subtitle */}
          <div className="flex flex-col gap-[10px]">
            <p className="text-[20px] text-[#2e3033]" style={FONT_BOLD}>Review P/N scenario</p>
            <p className="text-[16px] text-[#2e3033]" style={FONT_REG}>Review and update the P/N scenario</p>
          </div>

          {/* Column headers */}
          <div className="flex gap-8 items-end pb-3 border-b border-[#e0e2e5]">
            <div className="flex items-center gap-3 w-[220px] shrink-0">
              <button
                type="button"
                role="checkbox"
                aria-checked={partiallySelected ? "mixed" : allSelected}
                aria-label={allSelected ? "Deselect all part numbers" : "Select all part numbers"}
                onClick={toggleAllPNs}
                className="shrink-0"
              >
                {allSelected ? <CheckboxChecked /> : <CheckboxUnchecked indeterminate={partiallySelected} />}
              </button>
              <span className="text-[12px] text-[#2e3033]" style={FONT_BOLD}>Part Number</span>
            </div>
            <div className="w-6 shrink-0" />
            <div className="text-[12px] text-[#2e3033] text-center w-[120px] shrink-0" style={FONT_BOLD}>Automated decision</div>
            <div className="text-[12px] text-[#2e3033] text-center flex-1" style={FONT_BOLD}>Parameter update</div>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-6">
            {PN_ROWS.map((row, idx) => (
              <div key={row.pn} className="flex gap-8 items-center">
                {/* Part Number */}
                <div className="flex items-center gap-3 w-[220px] shrink-0">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={selectedPNs.has(row.pn)}
                    aria-label={`${selectedPNs.has(row.pn) ? "Deselect" : "Select"} part number ${row.pn}`}
                    onClick={() => togglePN(row.pn)}
                    className="shrink-0"
                  >
                    {selectedPNs.has(row.pn) ? <CheckboxChecked /> : <CheckboxUnchecked />}
                  </button>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14px] text-[#595e62]" style={FONT_BOLD}>{row.pn}</span>
                    <span className="text-[12px] text-[#333]" style={FONT_REG}>{row.planner}</span>
                  </div>
                </div>

                {/* Chat icon */}
                <div className="w-6 shrink-0 flex justify-center">
                  <ChatIcon />
                </div>

                {/* Automated decision */}
                <div className="w-[120px] shrink-0 flex justify-center">
                  <AutoDecisionBadge value={row.automatedDecision} />
                </div>

                {/* Parameter update YES / NO */}
                <div className="flex-1 flex gap-3 justify-center" role="radiogroup" aria-label={`Parameter update for ${row.pn}`}>
                  <label
                    className={`w-[91px] px-4 py-[5px] text-[14px] text-center whitespace-nowrap transition-colors cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#007bc0] ${
                      paramUpdates[idx]
                        ? "border border-[#007bc0] bg-[#e6f4ff] text-[#007bc0]"
                        : "border border-[#e0e2e5] text-[#595e62] hover:border-[#007bc0] hover:bg-[#f5fbff] hover:text-[#007bc0]"
                    }`}
                    style={FONT_REG}
                  >
                    <input
                      type="radio"
                      name={`parameter-update-${row.pn}`}
                      value="yes"
                      checked={paramUpdates[idx]}
                      onChange={() => toggleParam(idx, true)}
                      className="sr-only"
                    />
                    YES
                  </label>
                  <label
                    className={`w-[91px] px-4 py-[5px] text-[14px] text-center whitespace-nowrap transition-colors cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#007bc0] ${
                      !paramUpdates[idx]
                        ? "border border-[#007bc0] bg-[#e6f4ff] text-[#007bc0]"
                        : "border border-[#e0e2e5] text-[#595e62] hover:border-[#007bc0] hover:bg-[#f5fbff] hover:text-[#007bc0]"
                    }`}
                    style={FONT_REG}
                  >
                    <input
                      type="radio"
                      name={`parameter-update-${row.pn}`}
                      value="no"
                      checked={!paramUpdates[idx]}
                      onChange={() => toggleParam(idx, false)}
                      className="sr-only"
                    />
                    NO
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-[11px] justify-end pt-2">
            <button
              onClick={onClose}
              className="border border-[#007bc0] text-[#007bc0] px-4 py-[5px] text-[14px] hover:bg-[#e6f4ff] transition-colors"
              style={FONT_REG}
            >
              Cancel
            </button>
            <button
              onClick={onConfirmRecalculation}
              className="bg-[#007bc0] text-white px-4 py-[5px] text-[14px] hover:bg-[#006aa8] transition-colors"
              style={FONT_REG}
            >
              Recalculation
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
