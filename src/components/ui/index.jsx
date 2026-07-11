"use client";
import { X, AlertTriangle } from "lucide-react";

// ── PageHeader ──────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <h1 className="font-bold text-3xl tracking-tight leading-tight text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm mt-1.5 font-medium text-gray-500">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ── Modal ───────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[calc(100vh-40px)] flex flex-col
        bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-bold text-xl text-gray-900 tracking-tight">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100
            text-gray-500 hover:text-indigo-600 hover:border-indigo-300 border border-transparent
            transition-all duration-150 cursor-pointer">
            <X size={14} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// ── ConfirmDialog ───────────────────────────────────────────────────
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || "Confirm"}>
      <div className="flex gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={18} className="text-red-500" />
        </div>
        <p className="text-sm text-gray-600 leading-relaxed pt-1">{message}</p>
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100
          text-gray-700 hover:bg-gray-200 transition-all cursor-pointer">Cancel</button>
        <button onClick={onConfirm} disabled={loading}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600
          text-white border-none cursor-pointer transition-all disabled:opacity-50">
          {loading ? "Deleting…" : "Delete"}
        </button>
      </div>
    </Modal>
  );
}

// ── StatusBadge ─────────────────────────────────────────────────────
const badgeMap = {
  active:    { dot: "bg-emerald-500", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  closed:    { dot: "bg-gray-400",    cls: "bg-gray-100 text-gray-500 border border-gray-200" },
  defaulted: { dot: "bg-red-500",     cls: "bg-red-50 text-red-700 border border-red-200" },
  overdue:   { dot: "bg-orange-400",  cls: "bg-orange-50 text-orange-700 border border-orange-200" },
};

export function StatusBadge({ status }) {
  const c = badgeMap[status] || badgeMap.closed;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {status}
    </span>
  );
}

// ── StatCard ────────────────────────────────────────────────────────
export function StatCard({ title, value, sub, icon: Icon, color = "blue" }) {
  const colors = {
    blue:   { bg: "bg-indigo-50", icon: "bg-indigo-100 text-indigo-700" },
    green:  { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-700" },
    orange: { bg: "bg-orange-50", icon: "bg-orange-100 text-orange-700" },
    red:    { bg: "bg-red-50", icon: "bg-red-100 text-red-700" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="bg-white border border-gray-200/80 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
        </div>
        <div className={`${c.icon} p-2.5 rounded-xl flex-shrink-0`}><Icon size={18} /></div>
      </div>
    </div>
  );
}

// ── EmptyState ──────────────────────────────────────────────────────
export function EmptyState({ message = "No data found", icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-4">
          <Icon size={28} className="text-gray-400" />
        </div>
      )}
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed">{message}</p>
    </div>
  );
}

// ── Skeleton / TableSkeleton ────────────────────────────────────────
export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} style={{ minHeight: 16 }} />;
}
export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
          <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <div className="skeleton h-3.5 w-2/5 rounded mb-1.5" />
            <div className="skeleton h-3 w-1/4 rounded" />
          </div>
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ── Spinner ─────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
}
