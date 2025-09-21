import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import { Outlet } from "react-router-dom"

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-[#141518] text-white">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-3">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
