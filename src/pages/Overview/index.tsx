import LogsByLevelChart from "@/components/charts/LogsByLevelChart";
import TerminalView from "./Terminal";

export default function OverviewPage() {
  return (
    <div>
      <div className="p-4">
        <TerminalView logsUrl="/api/logs"/>
      </div>
      <div className="p-3">
        <LogsByLevelChart logsUrl="/api/logs/charts" />
      </div>
    </div>
  );
}
