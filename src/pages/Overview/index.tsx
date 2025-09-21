import LogsByLevelChart from "@/components/charts/LogsByLevelChart";
import TerminalView from "./Terminal";

export default function OverviewPage() {
  return (
    <div>
      <div className="p-4">
        <TerminalView logsUrl="/json/mock-logs.json"/>
      </div>
      <div className="p-3">
        <LogsByLevelChart logsUrl="/json/mock-logs.json" />
      </div>
    </div>
  );
}
