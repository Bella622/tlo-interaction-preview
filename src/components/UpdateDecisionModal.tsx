import { useState } from "react";
import svgPaths from "@/imports/Frame1000003018/svg-5svwoopg8h";

interface Props {
  open: boolean;
  routeName: string;
  onClose: () => void;
  onConfirm: (routeName: string) => void;
  onSave: () => void;
}

const FONT_REG = { fontFamily: "'Bosch Sans:Regular', sans-serif" } as const;
const FONT_BOLD = { fontFamily: "'Bosch Sans:Bold', sans-serif" } as const;

const DECISION_OPTIONS = ["Approved", "Rejected"];
const PROPOSAL_OPTIONS = ["SAP Scenario", "Manual Scenario", "Recalculation Request"];

type PNRow = { pn: string; decision: string; proposal: string };

const DEFAULT_ROWS: PNRow[] = [
  { pn: "DEMO-PN-01", decision: "Approved",  proposal: "" },
  { pn: "DEMO-PN-01", decision: "Rejected",  proposal: "Manual Scenario" },
  { pn: "DEMO-PN-01", decision: "Rejected",  proposal: "Recalculation Request" },
];

function ChevronSmall() {
  return (
    <svg width="12" height="7" viewBox="0 0 11.775 6.42188" fill="none" style={{ flexShrink: 0 }}>
      <path d={svgPaths.p34ce9400} fill="#2E3033" />
    </svg>
  );
}

function DecisionDropdown({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const isEmpty = !value;

  return (
    <div className="relative bg-white border border-[#e0e2e5] px-[14px] py-2 flex flex-col w-[440px] max-w-[46%]">
      <p className="text-[12px] text-[#2e3033] mb-0.5" style={FONT_REG}>{label}</p>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full text-left"
      >
        <span
          className="text-[14px] truncate"
          style={{ ...FONT_REG, color: isEmpty ? "#979ea4" : "#595e62" }}
        >
          {value || placeholder}
        </span>
        <ChevronSmall />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-0.5 w-full bg-white border border-[#e0e2e5] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.16)] z-10">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              className="w-full text-left px-[14px] py-2 text-[12px] text-[#595e62] hover:bg-[#f5f6f8]"
              style={FONT_REG}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UpdateDecisionModal({ open, routeName, onClose, onConfirm, onSave }: Props) {
  const [rows, setRows] = useState<PNRow[]>(DEFAULT_ROWS);
  const [rejectReason, setRejectReason] = useState("");

  const hasRejected = rows.some(r => r.decision === "Rejected");

  const setDecision = (idx: number, decision: string) =>
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, decision } : r));

  const setProposal = (idx: number, proposal: string) =>
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, proposal } : r));

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white shadow-[0px_8px_16px_0px_rgba(0,0,0,0.2)] w-[960px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <div className="p-8 flex flex-col gap-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-[16px] text-[#2e3033]" style={FONT_BOLD}>Scenario Confirmation</p>
            <button
              onClick={onClose}
              className="p-0.5 hover:bg-[#f5f6f8] rounded"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d={svgPaths.pe131680} fill="#333333" />
                <path d={svgPaths.p113abc00} fill="#333333" />
              </svg>
            </button>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-[10px]">
            <p className="text-[20px] text-[#2e3033]" style={FONT_BOLD}>
              Please confirm the following P/N and scenario decision
            </p>
            <p className="text-[16px] text-[#2e3033]" style={FONT_REG}>
              Could you please submit your decision and your proposed reason?
            </p>
          </div>

          {/* P/N rows */}
          <div className="flex flex-col gap-3">
            {rows.map((row, idx) => (
              <div key={row.pn} className="flex flex-col gap-2">
                <p className="text-[12px] text-[#2e3033]" style={FONT_REG}>P/N - {row.pn}</p>
                <div className="flex gap-4 flex-wrap">
                  <DecisionDropdown
                    label="Automated scenario"
                    value={row.decision}
                    options={DECISION_OPTIONS}
                    placeholder="Select your decision"
                    onChange={v => setDecision(idx, v)}
                  />
                  <DecisionDropdown
                    label="Proposal"
                    value={row.proposal}
                    options={PROPOSAL_OPTIONS}
                    placeholder="Select your decision"
                    onChange={v => setProposal(idx, v)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Rejection reason — visible when any row is Rejected */}
          {hasRejected && (
            <div className="flex flex-col gap-2">
              <p className="text-[12px] text-black" style={FONT_REG}>
                Submit rejection reason for above P/N:
              </p>
              <div className="bg-white border border-[#e0e2e5]">
                <textarea
                  className="w-full h-[80px] px-[14px] py-2 text-[12px] bg-transparent border-none outline-none resize-none"
                  style={FONT_REG}
                  placeholder="Please tell us more about the reject reason."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-[11px] justify-end">
            <button
              onClick={onClose}
              className="border border-[#007bc0] text-[#007bc0] px-4 py-[5px] text-[14px] hover:bg-[#e6f4ff] transition-colors"
              style={FONT_REG}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="border border-[#007bc0] text-[#007bc0] px-4 py-[5px] text-[14px] hover:bg-[#e6f4ff] transition-colors"
              style={FONT_REG}
            >
              Save
            </button>
            <button
              onClick={() => onConfirm(routeName)}
              className="bg-[#007bc0] text-white px-4 py-[5px] text-[14px] hover:bg-[#006aa8] transition-colors"
              style={FONT_REG}
            >
              Confirm
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
