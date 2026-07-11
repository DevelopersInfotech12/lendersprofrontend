"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Pencil, Plus, Phone, Mail, MapPin, FileText, StickyNote,
  TrendingUp, Wallet, HandCoins, Receipt, AlertCircle, Calendar, ChevronRight,
} from "lucide-react";
import { borrowersAPI } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Modal, StatusBadge, StatCard, Spinner, EmptyState } from "@/components/ui/index";
import BorrowerForm from "@/components/borrowers/BorrowerForm";
import LoanForm from "@/components/loans/LoanForm";

export default function BorrowerProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showEdit, setShowEdit] = useState(false);
  const [showLoan, setShowLoan] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await borrowersAPI.getProfile(id);
      setProfile(data.data);
    } catch { router.push("/borrowers"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, [id]);

  if (loading) return <Spinner />;
  if (!profile) return null;

  const { borrower, loans, repayments, stats, overdueLoans, upcomingLoans } = profile;
  const initials = borrower.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const tabs = [
    { key: "overview",   label: "Overview" },
    { key: "loans",      label: `Loans (${loans.length})` },
    { key: "repayments", label: `Repayments (${repayments.length})` },
  ];

  return (
    <div>
      <Link href="/borrowers" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm no-underline w-fit">
        <ArrowLeft size={16} /> Back to Borrowers
      </Link>

      {/* ── Header ── */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#6366f1,#4338ca)" }}
            >
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-bold text-xl text-gray-900 tracking-tight">{borrower.name}</h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  borrower.isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${borrower.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                  {borrower.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <a href={`tel:${borrower.phone}`} className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 no-underline hover:text-indigo-600">
                  <Phone size={12} className="text-gray-400" /> {borrower.phone}
                </a>
                {borrower.email && (
                  <a href={`mailto:${borrower.email}`} className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 no-underline hover:text-indigo-600">
                    <Mail size={12} className="text-gray-400" /> {borrower.email}
                  </a>
                )}
                {borrower.address && (
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500">
                    <MapPin size={12} className="text-gray-400" /> {borrower.address}
                  </span>
                )}
              </div>
              {borrower.idType && borrower.idNumber && (
                <p className="flex items-center gap-1.5 text-[12px] font-medium text-gray-400 mt-2 capitalize">
                  <FileText size={11} /> {borrower.idType.replace("_", " ")}: {borrower.idNumber}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowLoan(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold border border-gray-200 bg-white text-gray-600 hover:border-indigo-300 transition-all cursor-pointer"
            >
              <Plus size={14} /> New Loan
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all cursor-pointer"
            >
              <Pencil size={14} /> Edit
            </button>
          </div>
        </div>

        {borrower.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2">
            <StickyNote size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-[13px] text-gray-500 leading-relaxed">{borrower.notes}</p>
          </div>
        )}
      </div>

      {/* ── Alert banners ── */}
      {overdueLoans.length > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-3">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
          <p className="text-[13px] font-semibold text-red-700">
            {overdueLoans.length} loan{overdueLoans.length > 1 ? "s" : ""} overdue for payment
          </p>
        </div>
      )}
      {upcomingLoans.length > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
          <Calendar size={15} className="text-amber-500 flex-shrink-0" />
          <p className="text-[13px] font-semibold text-amber-700">
            {upcomingLoans.length} installment{upcomingLoans.length > 1 ? "s" : ""} due within 7 days
          </p>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Loaned" value={formatCurrency(stats.totalPrincipal)} sub={`${stats.loanCount} loan${stats.loanCount !== 1 ? "s" : ""}`} icon={HandCoins} color="blue" />
        <StatCard title="Outstanding" value={formatCurrency(stats.totalOutstanding)} sub={`${formatCurrency(stats.totalPaid)} collected`} icon={Wallet} color={stats.totalOutstanding > 0 ? "orange" : "green"} />
        <StatCard title="Active Loans" value={stats.activeLoans} sub={`${stats.closedLoans} closed`} icon={TrendingUp} color="green" />
        <StatCard title="Repayments" value={repayments.length} sub={stats.defaultedLoans > 0 ? `${stats.defaultedLoans} defaulted` : "on track"} icon={Receipt} color={stats.defaultedLoans > 0 ? "red" : "blue"} />
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 border border-gray-200/80 p-1 rounded-xl mb-6 w-fit flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-all ${
              activeTab === t.key ? "bg-indigo-500 text-white" : "bg-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW ══ */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white border border-gray-200/80 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-[14px] font-bold text-gray-800">Loan Summary</h3>
            </div>
            {loans.length === 0 ? (
              <EmptyState message="No loans yet for this borrower" icon={HandCoins} />
            ) : (
              <div className="divide-y divide-gray-100">
                {loans.slice(0, 5).map((l) => (
                  <Link key={l._id} href={`/loans/${l._id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors no-underline">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800">{formatCurrency(l.principalAmount)}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{l.interestRate}% / mo · {l.durationMonths} months</p>
                    </div>
                    <StatusBadge status={l.status} />
                    <ChevronRight size={13} className="text-gray-300" />
                  </Link>
                ))}
                {loans.length > 5 && (
                  <button
                    onClick={() => setActiveTab("loans")}
                    className="w-full text-[12px] font-semibold text-indigo-600 py-3 cursor-pointer border-none bg-transparent hover:bg-slate-50 transition-colors"
                  >
                    View all {loans.length} loans →
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200/80 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-[14px] font-bold text-gray-800">Recent Repayments</h3>
            </div>
            {repayments.length === 0 ? (
              <EmptyState message="No repayments recorded yet" icon={Receipt} />
            ) : (
              <div className="divide-y divide-gray-100">
                {repayments.slice(0, 5).map((r) => (
                  <div key={r._id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div>
                      <p className="text-[13px] font-semibold text-emerald-600">{formatCurrency(r.amount)}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(r.paymentDate)} · {r.paymentMode.replace("_", " ")}</p>
                    </div>
                  </div>
                ))}
                {repayments.length > 5 && (
                  <button
                    onClick={() => setActiveTab("repayments")}
                    className="w-full text-[12px] font-semibold text-indigo-600 py-3 cursor-pointer border-none bg-transparent hover:bg-slate-50 transition-colors"
                  >
                    View all {repayments.length} repayments →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ LOANS TAB ══ */}
      {activeTab === "loans" && (
        <div className="space-y-3 max-w-3xl">
          {loans.length === 0 ? (
            <EmptyState message="No loans yet for this borrower" icon={HandCoins} />
          ) : loans.map((l) => {
            const progress = l.totalRepayable > 0 ? (l.totalPaid / l.totalRepayable) * 100 : 0;
            return (
              <Link key={l._id} href={`/loans/${l._id}`}
                className="flex items-center gap-4 p-4 bg-white border border-gray-200/80 rounded-xl hover:border-indigo-300 transition-all no-underline group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                  <HandCoins size={16} className="text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-gray-800">
                    {formatCurrency(l.principalAmount)} <span className="text-gray-400 font-medium text-[12px]">· {l.interestRate}%/mo</span>
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1"><Calendar size={10} />{formatDate(l.startDate)}</span>
                    {l.status !== "closed" && l.nextDueDate && (
                      <span className={`text-[11px] font-medium ${new Date(l.nextDueDate) < new Date() ? "text-red-500" : "text-gray-400"}`}>
                        Next due {formatDate(l.nextDueDate)}
                      </span>
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2 max-w-[200px]">
                    <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                </div>
                <StatusBadge status={l.status} />
                <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
              </Link>
            );
          })}
        </div>
      )}

      {/* ══ REPAYMENTS TAB ══ */}
      {activeTab === "repayments" && (
        <div className="bg-white border border-gray-200/80 rounded-xl overflow-hidden max-w-4xl">
          {repayments.length === 0 ? (
            <EmptyState message="No repayments recorded yet" icon={Receipt} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Date</th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Amount</th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Principal</th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Interest</th>
                    <th className="text-center px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Mode</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Loan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {repayments.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 text-gray-600">{formatDate(r.paymentDate)}</td>
                      <td className="px-5 py-3.5 text-right font-semibold text-emerald-600">{formatCurrency(r.amount)}</td>
                      <td className="px-5 py-3.5 text-right text-gray-500">{formatCurrency(r.principalPaid)}</td>
                      <td className="px-5 py-3.5 text-right text-orange-500">{formatCurrency(r.interestPaid)}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full capitalize">{r.paymentMode.replace("_", " ")}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/loans/${r.loan?._id}`} className="text-indigo-600 text-[12px] font-semibold no-underline hover:underline">
                          {formatCurrency(r.loan?.principalAmount)} loan
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Borrower">
        <BorrowerForm initial={borrower} onSuccess={() => { setShowEdit(false); fetchProfile(); }} onCancel={() => setShowEdit(false)} />
      </Modal>
      <Modal isOpen={showLoan} onClose={() => setShowLoan(false)} title="New Loan">
        <LoanForm initial={{ borrower: borrower._id }} onSuccess={() => { setShowLoan(false); fetchProfile(); }} onCancel={() => setShowLoan(false)} />
      </Modal>
    </div>
  );
}
