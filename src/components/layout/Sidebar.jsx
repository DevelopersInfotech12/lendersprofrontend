"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, HandCoins, Receipt, Menu, X, TrendingUp,
  RefreshCw, ShieldCheck, Landmark, BellRing, Moon, Sun, Zap, UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { authAPI } from "@/lib/api";
import { useTheme } from "./ThemeProvider";

const navItems = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/borrowers",    label: "Borrowers",    icon: Users },
  { href: "/loans",        label: "Loans",        icon: HandCoins },
  { href: "/recurring",    label: "Recurring",    icon: RefreshCw },
  { href: "/repayments",   label: "Repayments",   icon: Receipt },
  { href: "/collaterals",  label: "Collaterals",  icon: Landmark },
  { href: "/guarantors",   label: "Guarantors",   icon: ShieldCheck },
  { href: "/reminders",    label: "Reminders",    icon: BellRing },
  { href: "/reports",      label: "Reports",      icon: TrendingUp },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = mounted && theme === "dark";
  const [user, setUser] = useState(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    authAPI.me().then((r) => setUser(r.data.data)).catch(() => {});
  }, []);

  const sidebarBg    = isDark ? "#0f0e0c" : "#072041";
  const activeColor  = isDark ? "#e8b84b" : "#e6e6eb";
  const activeBg     = isDark ? "rgba(232,184,75,0.12)" : "#006cc465";
  const activeBorder = isDark ? "rgba(232,184,75,0.25)" : "rgba(129,140,248,0.3)";
  const initials      = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "A";

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 bg-indigo-500 text-white p-2 rounded-lg shadow-lg"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {open && <div className="md:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside
        style={{ background: sidebarBg }}
        className={`fixed top-0 left-0 h-full w-64 text-white z-40 flex flex-col shadow-2xl transform transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Gold top strip */}
        <div style={{ height: 2, background: "linear-gradient(90deg,#b88c2a,#e8b84b,#f5cc6a,#e8b84b)" }} />

        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: isDark ? "linear-gradient(135deg,#e8b84b,#b88c2a)" : "linear-gradient(135deg,#818cf8,#4f46e5)", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
            >
              <Zap size={17} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-extrabold text-sm text-white tracking-tight leading-none">LenderPro</p>
              <p className="text-[9px] font-bold tracking-widest uppercase mt-0.5 text-white/60">Interest Manager</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="block mb-0.5 no-underline">
                <div
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer"
                  style={{ background: active ? activeBg : "transparent", border: `1px solid ${active ? activeBorder : "transparent"}` }}
                >
                  <Icon size={16} color={active ? activeColor : "rgb(255,255,255)"} strokeWidth={active ? 2.5 : 2} />
                  <span className="text-sm flex-1" style={{ fontWeight: active ? 800 : 600, color: active ? activeColor : "rgb(255,255,255)" }}>
                    {label}
                  </span>
                  {active && <span className="w-1.5 h-1.5 rounded-full" style={{ background: activeColor }} />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2.5 py-2.5 border-t border-white/10 space-y-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] cursor-pointer transition-all hover:bg-white/10"
          >
            {isDark ? <Sun size={15} color="#e8b84b" /> : <Moon size={15} color="#ffffff" />}
            <span className="text-xs font-bold text-white flex-1 text-left">{isDark ? "Light Mode" : "Dark Mode"}</span>
            <div className="w-9 h-5 rounded-full relative transition-all" style={{ background: isDark ? "#e8b84b" : "#6366f1" }}>
              <div className="absolute top-1 w-3 h-3 bg-white rounded-full shadow transition-all" style={{ left: isDark ? "20px" : "4px" }} />
            </div>
          </button>

          {/* Profile card */}
          <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] no-underline hover:bg-white/10 transition-all">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-[#0a0a0a] flex-shrink-0"
                style={{ background: isDark ? "linear-gradient(135deg,#e8b84b,#b88c2a)" : "linear-gradient(135deg,#818cf8,#4f46e5)" }}
              >
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/90 leading-none truncate">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-white/40 mt-0.5 truncate">{user?.email || ""}</p>
            </div>
            <UserCircle size={14} className="text-white/30 flex-shrink-0" />
          </Link>
        </div>
      </aside>
    </>
  );
}
