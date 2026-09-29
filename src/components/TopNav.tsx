interface Props {
  activePage: "planner" | "demo-location";
  onNavigate: (page: "planner" | "demo-location") => void;
}

function LocationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1C4.79 1 3 2.79 3 5c0 3.25 4 8 4 8s4-4.75 4-8c0-2.21-1.79-4-4-4z" stroke="#595E62" strokeWidth="1.2" fill="none" />
      <circle cx="7" cy="5" r="1.5" stroke="#595E62" strokeWidth="1.2" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2a5 5 0 0 0-5 5v3l-1.5 2h13L14 10V7a5 5 0 0 0-5-5z" stroke="#424C58" strokeWidth="1.2" fill="none" />
      <path d="M7.5 14.5a1.5 1.5 0 0 0 3 0" stroke="#424C58" strokeWidth="1.2" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="#424C58" strokeWidth="1.4" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke="#424C58" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TopNav({ activePage, onNavigate }: Props) {
  return (
    <div className="bg-white border-b border-[rgba(66,76,88,0.12)] flex items-center justify-between px-8 h-[65px] shrink-0 shadow-sm sticky top-0 z-20">
      {/* Left: logo + nav */}
      <div className="flex items-center gap-6">
        <span className="text-lg font-bold text-[#2e3033] whitespace-nowrap" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>Bosch TLO V2.0</span>
        <div className="flex items-end gap-1">
          <button
            onClick={() => onNavigate("planner")}
            className={`flex items-center gap-1.5 pb-[18px] pt-[18px] px-1 border-b-2 text-sm transition-colors ${activePage === "planner" ? "border-[#007bc0] text-[#007bc0] font-bold" : "border-transparent text-[#595e62] hover:text-[#2e3033]"}`}
            style={{ fontFamily: activePage === "planner" ? "'Bosch Sans:Bold', sans-serif" : "'Bosch Sans:Regular', sans-serif" }}
          >
            Planner center
            <span className="bg-[#007bc0] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center shrink-0" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>2</span>
          </button>
          <button
            onClick={() => onNavigate("demo-location")}
            className={`pb-[18px] pt-[18px] px-4 border-b-2 text-sm transition-colors ${activePage === "demo-location" ? "border-[#007bc0] text-[#007bc0] font-bold" : "border-transparent text-[#595e62] hover:text-[#2e3033]"}`}
            style={{ fontFamily: activePage === "demo-location" ? "'Bosch Sans:Bold', sans-serif" : "'Bosch Sans:Regular', sans-serif" }}
          >
            Route Management
          </button>
        </div>
      </div>

      {/* Right: location + icons + user */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[12px] text-[#595e62]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>
          <LocationIcon />
          Demo Location
        </div>
        <button className="p-1 hover:bg-[#f5f6f8] rounded"><SettingsIcon /></button>
        <button className="p-1 hover:bg-[#f5f6f8] rounded"><BellIcon /></button>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[12px] font-bold text-[#2e3033]" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>Planner A</div>
            <div className="text-[10px] text-[#595e62]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>Material Planner</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#007bc0] flex items-center justify-center text-white text-[12px] font-bold" style={{ fontFamily: "'Bosch Sans:Bold', sans-serif" }}>JS</div>
        </div>
      </div>
    </div>
  );
}
