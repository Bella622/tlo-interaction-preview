import { useState } from "react";
import TopNav from "@/components/TopNav";
import PlannerCenter from "@/pages/PlannerCenter";
import RouteDetailPage from "@/pages/RouteDetailPage";

type Page = "planner" | "demo-location" | "route-detail";
type SelectedCard = "approvals" | "routes" | "costs";
type ActiveTab = "planner" | "coordinator";

export default function App() {
  const [page, setPage] = useState<Page>("planner");
  const [selectedCard, setSelectedCard] = useState<SelectedCard>("approvals");
  const [activeTab, setActiveTab] = useState<ActiveTab>("planner");
  const [confirmedRoutes, setConfirmedRoutes] = useState<string[]>([]);

  const handleNavigate = (dest: "planner" | "demo-location") => {
    setPage(dest);
  };

  const handleViewDetail = () => {
    setPage("route-detail");
  };

  const handleBack = () => {
    setPage("planner");
  };

  const handleRouteConfirmed = (name: string) => {
    if (name.startsWith("__restart__")) {
      // Re-start Approval / Recalculation: remove from confirmed so it re-appears in planner Open Approval
      const routeName = name.replace("__restart__", "");
      setConfirmedRoutes(prev => prev.filter(r => r !== routeName));
    } else {
      setConfirmedRoutes(prev => prev.includes(name) ? prev : [...prev, name]);
    }
  };

  if (page === "route-detail") {
    return (
      <div className="flex flex-col h-full overflow-auto">
        <RouteDetailPage onBack={handleBack} source={activeTab} onRouteConfirmed={handleRouteConfirmed} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopNav
        activePage={page === "demo-location" ? "demo-location" : "planner"}
        onNavigate={handleNavigate}
      />
      {/* At 1920px+ viewport: center with 60px side margins */}
      <div className="flex-1 overflow-auto pt-[60px] pb-0 px-4">
        <div className="w-full 2xl:max-w-[1800px] 2xl:mx-auto">
        {page === "planner" && (
          <PlannerCenter
            selectedCard={selectedCard}
            activeTab={activeTab}
            onSelectCard={setSelectedCard}
            onSelectTab={setActiveTab}
            onViewDetail={handleViewDetail}
            confirmedRoutes={confirmedRoutes}
            onRouteConfirmed={handleRouteConfirmed}
          />
        )}
        {page === "demo-location" && (
          <div className="flex items-center justify-center h-full text-[#595e62]" style={{ fontFamily: "'Bosch Sans:Regular', sans-serif" }}>
            <strong>You don't currently have access to this page. Please contact your Admin to request access.</strong>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
