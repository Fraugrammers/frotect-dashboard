import { Routes, Route, Navigate } from "react-router-dom"
import DashboardLayout from "./layouts/DashboardLayout"
import OverviewPage from "./pages/Overview"
import AnalyzerPage from "./pages/Analyzer"
import ErrorPage from "./components/errors/ErrorPage"

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/analyzer" element={<AnalyzerPage />} />
      </Route>

      <Route path="*" element={<ErrorPage />} />
    </Routes>
  )
}
