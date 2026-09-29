import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import svgPaths from "@/imports/矩形LabelEllipsisV蒙版-1/svg-esxoi128m2";

interface Props {
  open: boolean;
  routeName: string;
  onClose: () => void;
  onRelease: () => void;
  onRestartApproval: () => void;
}

const FONT_REG = { fontFamily: "'Bosch Sans:Regular', sans-serif" } as const;
const FONT_BOLD = { fontFamily: "'Bosch Sans:Bold', sans-serif" } as const;

const SCENARIO_OPTIONS = ["SAP Scenario", "Manual scenario", "Automated scenario"] as const;

const PN_ROWS = [
  { pn: "DEMO-PN-01", planner: "Planner A (Team 1)", automatedDecision: "Rejected" as const, plannerProposal: "Manual scenario", comment: "Planner rejects due to cost constraints on this P/N. Manual scenario preferred." },
  { pn: "DEMO-PN-01", planner: "Planner A (Team 1)", automatedDecision: "Rejected" as const, plannerProposal: "Manual scenario", comment: "Safety stock concerns raised. Manual scenario selected." },
  { pn: "DEMO-PN-01", planner: "Planner A (Team 1)", automatedDecision: "Approved" as const, plannerProposal: "", comment: "" },
  { pn: "DEMO-PN-01", planner: "Planner A (Team 1)", automatedDecision: "Approved" as const, plannerProposal: "", comment: "" },
  { pn: "DEMO-PN-01", planner: "Planner A (Team 1)", automatedDecision: "Approved" as const, plannerProposal: "", comment: "" },
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

function CheckboxUnchecked() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect width="14" height="14" fill="white" />
      <rect x="0.5" y="0.5" width="13" height="13" stroke="#c1c7cc" />
    </svg>
  );
}

function ChatIconSvg() {
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

function CommentPopover({ comment, anchorRef }: { comment: string; anchorRef: React.RefObject<HTMLButtonElement | null> }) {
  const rect = anchorRef.current?.getBoundingClientRect();
  if (!rect) return null;
  return createPortal(
    <div
      style={{
        position: "fixed",
        top: rect.bottom + 6,
        left: rect.left,
        zIndex: 9999,
        maxWidth: 260,
      }}
      className="bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.15)] border border-[#e0e2e5] px-4 py-3 text-[12px] text-[#2e3033]"
    >
      <p style={FONT_REG}>{comment}</p>
    </div>,
    document.body
  );
}

export default function CoordinatorUpdateDecisionModal({ open, routeName, onClose, onRelease, onRestartApproval }: Props) {
  const [checked, setChecked] = useState<boolean[]>(PN_ROWS.map(() => false));
  const [coordinatorDecisions, setCoordinatorDecisions] = useState<string[]>(
    PN_ROWS.map(r => r.plannerProposal || "Manual scenario")
  );
  const [openComment, setOpenComment] = useState<number | null>(null);
  const chatRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (!open) return null;

  const allChecked = checked.every(Boolean);

  const toggleSelectAll = () => {
    setChecked(checked.fill(!allChecked).slice());
    setChecked(prev => prev.map(() => !allChecked));
  };

  const toggleChecked = (idx: number) =>
    setChecked(prev => prev.map((v, i) => i === idx ? !v : v));

  const toggleComment = (idx: number) =>
    setOpenComment(prev => prev === idx ? null : idx);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]"
      onClick={e => { if (e.target === e.currentTarget) { onClose(); setOpenComment(null); } }}
    >
      <div className="bg-white shadow-[0px_8px_16px_0px_rgba(0,0,0,0.2)] w-[840px] max-w-[96vw] max-h-[90vh] overflow-y-auto">
        <div className="p-8 flex flex-col gap-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-[16px] text-[#2e3033]" style={FONT_BOLD}>
              Update P/N decision for Route {routeName}
            </p>
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
          <div className="flex items-end pb-3 border-b border-[#e0e2e5] gap-4">
            <div className="flex items-center justify-between w-[160px] shrink-0">
              <span className="text-[12px] text-[#2e3033]" style={FONT_BOLD}>Part Number</span>
              <button className="text-[10px] text-[#595e62]" style={FONT_REG} onClick={toggleSelectAll}>
                Select all
              </button>
            </div>
            <div className="w-6 shrink-0" />
            <div className="text-[12px] text-[#2e3033] w-[120px] shrink-0" style={FONT_BOLD}>Automated decision</div>
            <div className="text-[12px] text-[#2e3033] w-[140px] shrink-0" style={FONT_BOLD}>{"Planners' proposal"}</div>
            <div className="text-[12px] text-[#2e3033] flex-1" style={FONT_BOLD}>Coordinator decision</div>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-5">
            {PN_ROWS.map((row, idx) => {
              const hasProposal = !!row.plannerProposal;
              const decision = coordinatorDecisions[idx];
              return (
                <div key={row.pn} className="flex items-center gap-4">

                  {/* Checkbox + Part Number */}
                  <div className="flex items-center gap-2 w-[160px] shrink-0">
                    <button className="shrink-0" onClick={() => toggleChecked(idx)}>
                      {checked[idx] ? <CheckboxChecked /> : <CheckboxUnchecked />}
                    </button>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-[#333] leading-tight" style={FONT_REG}>{row.planner}</span>
                      <span className="text-[12px] text-[#595e62]" style={FONT_REG}>{row.pn}</span>
                    </div>
                  </div>

                  {/* Chat icon */}
                  <div className="w-6 shrink-0 flex justify-center relative">
                    <button
                      ref={el => { chatRefs.current[idx] = el; }}
                      className={`hover:opacity-70 transition-opacity ${!row.comment ? "opacity-30 cursor-default" : "cursor-pointer"}`}
                      onClick={() => row.comment && toggleComment(idx)}
                      aria-label="View comment"
                    >
                      <ChatIconSvg />
                    </button>
                    {openComment === idx && row.comment && (
                      <CommentPopover comment={row.comment} anchorRef={{ current: chatRefs.current[idx] }} />
                    )}
                  </div>

                  {/* Automated decision */}
                  <div className="w-[120px] shrink-0">
                    <AutoDecisionBadge value={row.automatedDecision} />
                  </div>

                  {/* Planner's proposal — fixed width, blank if empty */}
                  <div className="w-[140px] shrink-0">
                    {hasProposal ? (
                      <span className="inline-block bg-[#c9cdd4] text-[#4e5969] px-4 py-[5px] text-[14px] whitespace-nowrap" style={FONT_REG}>
                        {row.plannerProposal}
                      </span>
                    ) : (
                      <span className="inline-block border border-dashed border-[#e5e6eb] bg-[#f2f3f5] px-4 py-[5px] text-[14px] whitespace-nowrap text-transparent" style={FONT_REG}>
                        placeholder
                      </span>
                    )}
                  </div>

                  {/* Coordinator decision — single static label */}
                  <div className="flex-1">
                    {hasProposal ? (
                      <span
                        className="inline-block border border-[#007bc0] text-[#007bc0] px-4 py-[5px] text-[14px] whitespace-nowrap"
                        style={FONT_REG}
                      >
                        {decision}
                      </span>
                    ) : (
                      <span
                        className="inline-block border border-dashed border-[#e5e6eb] bg-[#f2f3f5] text-[#c9cdd4] px-4 py-[5px] text-[14px] whitespace-nowrap"
                        style={FONT_REG}
                      >
                        {decision}
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
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
              onClick={onRestartApproval}
              className="bg-[#e5e6eb] text-[#4e5969] px-4 py-[5px] text-[14px] hover:bg-[#d8d9de] transition-colors"
              style={FONT_REG}
            >
              Re-start Approval
            </button>
            <button
              onClick={onRelease}
              className="bg-[#007bc0] text-white px-4 py-[5px] text-[14px] hover:bg-[#006aa8] transition-colors"
              style={FONT_REG}
            >
              Coordinator Release
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
