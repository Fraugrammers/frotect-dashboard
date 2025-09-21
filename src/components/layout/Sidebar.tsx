import { NavLink } from "react-router-dom";
import { Lock, Terminal } from "lucide-react";
import TimeCard from "../TimeCard";

const nav = [
  { to: "/overview", label: "OVERVIEW", icon: Terminal, enabled: true },
  // { to: "/analyzer", label: "ANALYZER", icon: FileText, enabled: true },
];

export default function Sidebar() {
  return (
    <aside className="w-[300px] h-screen bg-[#1E1F23] p-6">
      <div className="h-full flex flex-col rounded-2xl border border-white/10 bg-[#17181B] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_6px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3 p-4 pb-3">
          <div className="grid place-items-center rounded-xl p-2">
            <img src="/img/logo.svg" />
          </div>
          <div className="leading-tight">
            <div className="text-[18px] font-extrabold tracking-widest text-white">
              F.R.O.T.E.C.T.
            </div>
            <div className="text-[11px] tracking-wider text-white/60">
              fraugrammers
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-white/10"/>

        <nav className="px-2 pb-3 mt-4">
          <ul className="space-y-1">
            {nav.map(({ to, label, icon: Icon, enabled }) => (
              <li key={to}>
                {enabled ? (
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      [
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold",
                        "text-white/85 hover:text-white transition",
                        "border border-transparent hover:border-white/10",
                        isActive
                          ? "bg-white/5 border-white/10"
                          : "bg-transparent",
                      ].join(" ")
                    }
                  >
                    <Icon className="size-4 opacity-90" />
                    <span className="tracking-wider">{label}</span>
                  </NavLink>
                ) : (
                  <div
                    aria-disabled
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-white/35 select-none cursor-not-allowed border border-transparent"
                  >
                    <Icon className="size-4" />
                    <span className="tracking-wider flex-1">{label}</span>
                    <Lock className="size-4 opacity-60" />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto p-4">
          <TimeCard
            city="Almaty"
            country="Kazakhstan"
            tzLabel="UTC-3"
          />
        </div>
      </div>
    </aside>
  );
}
