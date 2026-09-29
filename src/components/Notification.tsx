import { useEffect } from "react";
import svgPaths from "@/imports/Alert/svg-510dk91kz2";

interface Props {
  message: string;
  onClose: () => void;
  durationMs?: number;
}

export default function Notification({ message, onClose, durationMs = 4000 }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, durationMs);
    return () => clearTimeout(t);
  }, [onClose, durationMs]);

  return (
    <div className="fixed top-[72px] right-4 z-[60] w-[395px] animate-[slideIn_0.2s_ease-out]">
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}`}</style>
      {/* Success alert — matches Alert type="success" icon=true closeBtn=true */}
      <div className="bg-[#e2f5e7] relative rounded-[2px] shadow-[0px_4px_12px_rgba(0,0,0,0.15)]">
        <div aria-hidden className="absolute border border-[#86d7a2] border-solid inset-0 pointer-events-none rounded-[2px]" />
        <div className="content-stretch flex flex-col gap-[6px] items-start px-[16px] py-[9px] relative">
          <div className="content-stretch flex gap-[10px] items-center relative w-full">
            {/* Success checkmark icon */}
            <div className="relative shrink-0 size-[28px]">
              <svg className="absolute block inset-0 size-full" fill="none" height="28" viewBox="0 0 28 28" width="28">
                <path d={svgPaths.p1e244700} fill="#00884A" />
              </svg>
            </div>
            <p
              className="flex-1 min-w-0 font-['Roboto:Regular',sans-serif] font-normal leading-[24px] text-[16px] text-[rgba(0,0,0,0.85)] [word-break:break-word]"
              style={{ fontVariationSettings: '"wdth" 100' }}
            >
              {message}
            </p>
            {/* Close X button */}
            <button onClick={onClose} className="shrink-0 p-0.5 hover:opacity-70" aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 13.8937 14.1875" fill="none">
                <path d={svgPaths.p2b15ff00} fill="black" fillOpacity="0.45" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
