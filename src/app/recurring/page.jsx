"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, AlertCircle, Calendar, Wallet, Search, Eye, Plus, Phone } from "lucide-react";
import { loansAPI } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Modal, PageHeader, EmptyState, StatusBadge, StatCard, TableSkeleton } from "@/components/ui/index";
import RepaymentForm from "@/components/repayments/RepaymentForm";

const FILTERS = [
  { key: "all",      label: "All" },
  { key: "overdue",  label: "Overdue" },
  { key: "upcoming", label: "Due This Week" },
];

export default function RecurringPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const [search, setSearch]   = useState("");
  const [payLoan, setPayLoan] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: d } = await loansAPI.getRecurring();
      setData(d.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePaySuccess = () => { setPayLoan(null); fetchData(); };

  if (loading || !data) {
    return (
      <div>
        <PageHeader title="Recurring Loans" subtitle="Monthly installment tracking" />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  const { loans, overdue, upcoming, stats } = data;
  const overdueIds  = new Set(overdue.map((l) => l._id));
  const upcomingIds = new Set(upcoming.map((l) => l._id));

  let rows = filter === "overdue" ? overdue : filter === "upcoming" ? upcoming : loans;
  if (search.trim()) {
    const q = search.toLowerCase();
    rows = rows.filter((l) => l.borrower?.name?.toLowerCase().includes(q) || l.borrower?.phone?.includes(q));
  }

  return (
    <div>
      <PageHeader
        title="Recurring Loans"
        subtitle={`${stats.activeCount} active loan${stats.activeCount !== 1 ? "s" : ""} on monthly installments`}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Active Recurring" value={stats.activeCount} icon={RefreshCw} color="blue" />
        <StatCard title="Overdue" value={stats.overdueCount} sub={stats.overdueCount > 0 ? "needs attention" : "all clear"} icon={AlertCircle} color={stats.overdueCount > 0 ? "red" : "green"} />
        <StatCard title="Due This Week" value={stats.upcomingCount} icon={Calendar} color="orange" />
        <StatCard title="Expected / Month" value={formatCurrency(stats.monthlyExpected)} icon={Wallet} color="green" />
      </div>

      {/* Filters + Search */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                filter === f.key ? "bg-indigo-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300"
              }`}
            >
              {f.label}
              {f.key === "overdue" && stats.overdueCount > 0 && <span className="ml-1.5 opacity-80">({stats.overdueCount})</span>}
              {f.key === "upcoming" && stats.upcomingCount > 0 && <span className="ml-1.5 opacity-80">({stats.upcomingCount})</span>}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search borrower or phone…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200
              text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400
              focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-100 border border-gray-200/80 rounded-xl overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState message="No recurring loans found for this filter." icon={RefreshCw} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 820 }}>
              <thead>
                <tr className="bg-gray-100 border-b border-gray-100">
                  {["Borrower", "Principal", "Monthly Amount", "Next Due", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((l) => {
                  const monthly    = l.monthlyInstallment ?? (l.durationMonths > 0 ? l.totalRepayable / l.durationMonths : 0);
                  const isOverdue  = overdueIds.has(l._id);
                  const isUpcoming = upcomingIds.has(l._id);
                  return (
                    <tr key={l._id} className="bg-gray-50 hover:bg-white transition-colors group">
                      {/* Borrower */}
                      <td className="px-5 py-4">
                        <Link href={`/borrowers/${l.borrower?._id}`} className="flex items-center gap-3 no-underline">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                            style={{ background: "linear-gradient(135deg,#6366f1,#4338ca)" }}
                          >
                            {l.borrower?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[14px] text-gray-900 leading-none tracking-tight">{l.borrower?.name}</p>
                            <p className="text-[11px] font-medium text-gray-400 mt-1 flex items-center gap-1">
                              <Phone size={10} /> {l.borrower?.phone}
                            </p>
                            <span className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${l.repaymentType === "interest_only" ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"}`}>
                              {l.repaymentType === "interest_only" ? "Interest only" : "Installment"}
                            </span>
                          </div>
                        </Link>
                      </td>

                      {/* Principal */}
                      <td className="px-5 py-4">
                        <span className="font-semibold text-[13px] text-gray-700">{formatCurrency(l.principalAmount)}</span>
                      </td>

                      {/* Monthly Installment */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-[13px] text-indigo-600">{formatCurrency(monthly)}</span>
                      </td>

                      {/* Next Due */}
                      <td className="px-5 py-4">
                        <span className={`text-[13px] font-medium ${isOverdue ? "text-red-500" : isUpcoming ? "text-amber-600" : "text-gray-600"}`}>
                          {formatDate(l.nextDueDate)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={isOverdue ? "overdue" : l.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/loans/${l._id}`}
                            title="View Loan"
                            className="w-8 h-8 rounded-lg flex items-center justify-center no-underline
                              bg-amber-50 border border-amber-200 text-amber-500
                              hover:bg-amber-100 transition-all"
                          >
                            <Eye size={13} />
                          </Link>
                          <button
                            onClick={() => setPayLoan(l)}
                            title="Record Payment"
                            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer
                              bg-emerald-50 border border-emerald-200 text-emerald-500
                              hover:bg-emerald-100 transition-all"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!payLoan} onClose={() => setPayLoan(null)} title="Record Repayment">
        {payLoan && <RepaymentForm loan={payLoan} onSuccess={handlePaySuccess} onCancel={() => setPayLoan(null)} />}
      </Modal>
    </div>
  );
}
