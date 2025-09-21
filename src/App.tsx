import { Routes, Route, Navigate } from "react-router-dom"
import DashboardLayout from "./layouts/DashboardLayout"
import OverviewPage from "./pages/Overview"
import LoginPage from "./pages/Login"
import ErrorPage from "./components/errors/ErrorPage"

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
      </Route>

      <Route path="*" element={<ErrorPage />} />
    </Routes>
  )
}
