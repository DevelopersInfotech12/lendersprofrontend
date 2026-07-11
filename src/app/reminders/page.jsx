"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Plus, ChevronLeft, ChevronRight, Clock, Phone, MapPin, FileText, Wallet, Bell,
  Pencil, Trash2, CheckCircle2, Calendar as CalendarIcon, BellRing,
} from "lucide-react";
import { remindersAPI } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Modal, PageHeader, EmptyState, ConfirmDialog, TableSkeleton } from "@/components/ui/index";
import ReminderForm from "@/components/reminders/ReminderForm";

const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const TABS   = ["pending", "done", "all"];

const TYPE_CFG = {
  call:              { label: "Call",             color: "#6366f1", bg: "rgba(99,102,241,0.12)",  icon: Phone },
  visit:             { label: "Visit",             color: "#10b981", bg: "rgba(16,185,129,0.12)",  icon: MapPin },
  payment_followup:  { label: "Payment Follow-up", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: Wallet },
  document:          { label: "Document",          color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  icon: FileText },
  other:             { label: "Other",             color: "#9ca3af", bg: "rgba(156,163,175,0.12)", icon: Bell },
};
const typeCfg = (t) => TYPE_CFG[t] || TYPE_CFG.other;

export default function RemindersPage() {
  const today = new Date();
  const [current, setCurrent] = useState({ month: today.getMonth(), year: today.getFullYear() });
  const [selectedDate, setSelectedDate] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await remindersAPI.getAll();
      setItems(data.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSuccess = (item) => {
    if (editItem) setItems((prev) => prev.map((r) => (r._id === item._id ? item : r)));
    else setItems((prev) => [item, ...prev]);
    setShowModal(false);
    setEditItem(null);
  };

  const handleComplete = async (item) => {
    try {
      const { data } = await remindersAPI.complete(item._id);
      setItems((prev) => prev.map((r) => (r._id === item._id ? data.data : r)));
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await remindersAPI.delete(deleteItem._id);
      setItems((prev) => prev.filter((r) => r._id !== deleteItem._id));
      setDeleteItem(null);
    } catch (err) { alert(err.response?.data?.message || "Delete failed"); }
    finally { setDeleting(false); }
  };

  const isOverdue = (r) => r.status === "pending" && new Date(r.dueDate) < new Date(new Date().toDateString());

  const prevMonth = () => setCurrent((c) => (c.month === 0 ? { month: 11, year: c.year - 1 } : { ...c, month: c.month - 1 }));
  const nextMonth = () => setCurrent((c) => (c.month === 11 ? { month: 0, year: c.year + 1 } : { ...c, month: c.month + 1 }));

  // Build calendar grid
  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => (i < firstDay ? null : i - firstDay + 1));

  const getItemsForDay = (day) => {
    if (!day) return [];
    return items.filter((r) => {
      const d = new Date(r.dueDate);
      return d.getDate() === day && d.getMonth() === current.month && d.getFullYear() === current.year;
    });
  };

  const isToday = (day) => day === today.getDate() && current.month === today.getMonth() && current.year === today.getFullYear();

  const todayItems = items.filter((r) => {
    const d = new Date(r.dueDate);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });
  const selectedItems = selectedDate ? getItemsForDay(selectedDate) : [];

  const upcoming = items
    .filter((r) => r.status === "pending" && new Date(r.dueDate) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 8);

  const pendingCount = items.filter((r) => r.status === "pending").length;
  const overdueCount = items.filter(isOverdue).length;
  const filteredList = tab === "all" ? items : items.filter((r) => r.status === tab);

  return (
    <div>
      <PageHeader
        title="Reminders"
        subtitle={`${items.length} follow-up${items.length !== 1 ? "s" : ""}`}
        action={
          <button
            onClick={() => { setEditItem(null); setShowModal(true); }}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm cursor-pointer transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} /> Add Reminder
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {[
          { label: "Total", value: items.length, color: "#6366f1", icon: CalendarIcon },
          { label: "Today", value: todayItems.length, color: "#10b981", icon: Clock },
          { label: "Pending", value: pendingCount, color: "#f59e0b", icon: BellRing },
          { label: "Overdue", value: overdueCount, color: "#ef4444", icon: Bell },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-gray-100 border border-gray-200/80 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border" style={{ background: `${color}15`, borderColor: `${color}25` }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <p className="font-bold text-xl text-gray-800">{value}</p>
              <p className="text-xs font-semibold text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar grid */}
        <div className="lg:col-span-2 bg-gray-100 border border-gray-200/80 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="font-bold text-base text-gray-900">{MONTHS[current.month]} {current.year}</h2>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-gray-500 cursor-pointer hover:border-indigo-300 transition-all">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setCurrent({ month: today.getMonth(), year: today.getFullYear() })} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-600 cursor-pointer hover:border-indigo-300 transition-all">
                Today
              </button>
              <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-gray-500 cursor-pointer hover:border-indigo-300 transition-all">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-gray-200">
            {DAYS.map((d) => (
              <div key={d} className="py-2 text-center text-[11px] font-bold uppercase tracking-widest text-gray-400">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              const dayItems = getItemsForDay(day);
              const selected = selectedDate === day;
              const todayCell = isToday(day);
              return (
                <div
                  key={idx}
                  onClick={() => day && setSelectedDate(selected ? null : day)}
                  className={`min-h-[80px] p-1.5 border-b border-r border-gray-200 transition-all
                    ${day ? "cursor-pointer hover:bg-indigo-50" : ""}
                    ${selected ? "bg-indigo-50" : ""}`}
                >
                  {day && (
                    <>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 mx-auto ${todayCell ? "bg-indigo-500 text-white" : "text-gray-700"}`}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dayItems.slice(0, 3).map((r) => {
                          const t = typeCfg(r.type);
                          return (
                            <div key={r._id} className="truncate text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: t.bg, color: t.color }}>
                              {r.title}
                            </div>
                          );
                        })}
                        {dayItems.length > 3 && (
                          <div className="text-[10px] font-bold text-gray-400 pl-1">+{dayItems.length - 3} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="bg-gray-100 border border-gray-200/80 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">
                {selectedDate ? `${MONTHS[current.month]} ${selectedDate}` : "Today's Reminders"}
              </h3>
              <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                {selectedDate ? selectedItems.length : todayItems.length}
              </span>
            </div>
            <div className="p-3 space-y-2 max-h-[320px] overflow-y-auto">
              {(selectedDate ? selectedItems : todayItems).length === 0 ? (
                <div className="py-8 text-center">
                  <CalendarIcon size={28} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs font-medium text-gray-400">No reminders {selectedDate ? "this day" : "today"}</p>
                  <button onClick={() => { setEditItem(null); setShowModal(true); }} className="mt-2 text-xs font-semibold text-indigo-500 hover:underline cursor-pointer bg-transparent border-none">
                    Add one →
                  </button>
                </div>
              ) : (
                (selectedDate ? selectedItems : todayItems).map((r) => {
                  const t = typeCfg(r.type);
                  const Icon = t.icon;
                  return (
                    <div key={r._id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-gray-100">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: t.bg }}>
                        <Icon size={13} color={t.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{r.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{r.borrower?.name || "Not linked"}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${r.status === "done" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                        {r.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-gray-100 border border-gray-200/80 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-bold text-sm text-gray-900">Upcoming</h3>
            </div>
            <div className="p-3 space-y-2 max-h-[280px] overflow-y-auto">
              {upcoming.length === 0 ? (
                <p className="text-xs text-center text-gray-400 py-6">No upcoming reminders</p>
              ) : upcoming.map((r) => {
                const t = typeCfg(r.type);
                const d = new Date(r.dueDate);
                return (
                  <div
                    key={r._id}
                    onClick={() => { setSelectedDate(d.getDate()); setCurrent({ month: d.getMonth(), year: d.getFullYear() }); }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-gray-100 cursor-pointer hover:border-indigo-300 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg flex flex-col items-center justify-center flex-shrink-0" style={{ background: t.bg }}>
                      <span className="text-[10px] font-bold leading-none" style={{ color: t.color }}>{MONTHS[d.getMonth()].slice(0, 3)}</span>
                      <span className="text-sm font-extrabold leading-none" style={{ color: t.color }}>{d.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{r.title}</p>
                      <p className="text-[11px] text-gray-400">{t.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Full list */}
      <div className="mt-6">
        <div className="flex gap-2 mb-5 flex-wrap">
          {TABS.map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize cursor-pointer
                ${tab === s ? "bg-indigo-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300"}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="bg-gray-100 border border-gray-200/80 rounded-xl overflow-hidden">
          {loading ? <TableSkeleton rows={6} /> : filteredList.length === 0 ? (
            <EmptyState message="No reminders here. Add a follow-up to stay on top of collections." icon={BellRing} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 760 }}>
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-100">
                    {["Reminder", "Linked To", "Type", "Due Date", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredList.map((r) => (
                    <tr key={r._id} className="bg-gray-50 hover:bg-white transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-[14px] text-gray-900">{r.title}</p>
                        {r.notes && <p className="text-[12px] text-gray-400 max-w-xs truncate">{r.notes}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] font-medium text-gray-600">{r.borrower?.name || "—"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] text-gray-600 capitalize">{r.type.replace("_", " ")}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[13px] font-medium ${isOverdue(r) ? "text-red-500" : "text-gray-600"}`}>{formatDate(r.dueDate)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
                          ${r.status === "done" ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isOverdue(r) ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                          {r.status === "done" ? "done" : isOverdue(r) ? "overdue" : "pending"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {r.status === "pending" && (
                            <button
                              onClick={() => handleComplete(r)}
                              title="Mark Done"
                              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer bg-emerald-50 border border-emerald-200 text-emerald-500 hover:bg-emerald-100 transition-all"
                            >
                              <CheckCircle2 size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => { setEditItem(r); setShowModal(true); }}
                            title="Edit"
                            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer bg-gray-100 border border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteItem(r)}
                            title="Delete"
                            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer bg-red-50 border border-red-200 text-red-400 hover:bg-red-100 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? "Edit Reminder" : "Add Reminder"}>
        <ReminderForm initial={editItem || {}} onSuccess={handleSuccess} onCancel={() => { setShowModal(false); setEditItem(null); }} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Reminder"
        message={`Remove "${deleteItem?.title}"? This cannot be undone.`}
      />
    </div>
  );
}
