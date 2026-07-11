"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, HandCoins, Eye, Trash2, CheckSquare, Phone, Pencil } from "lucide-react";
import { loansAPI } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Modal, PageHeader, EmptyState, StatusBadge, ConfirmDialog, TableSkeleton } from "@/components/ui/index";
import LoanForm from "@/components/loans/LoanForm";

const STATUS_TABS = ["all", "active", "closed", "defaulted"];

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLoans = async (status) => {
    setLoading(true);
    try {
      const params = status !== "all" ? { status } : {};
      const { data } = await loansAPI.getAll(params);
      setLoans(data.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLoans(statusFilter); }, [statusFilter]);

  const handleSuccess = (loan) => {
    if (editItem) setLoans((prev) => prev.map((l) => (l._id === loan._id ? loan : l)));
    else setLoans((prev) => [loan, ...prev]);
    setShowModal(false);
    setEditItem(null);
  };

  const handleClose = async (loan) => {
    if (!confirm(`Close loan for ${loan.borrower?.name}?`)) return;
    try {
      const { data } = await loansAPI.close(loan._id);
      setLoans((prev) => prev.map((l) => (l._id === loan._id ? data.data : l)));
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await loansAPI.delete(deleteItem._id);
      setLoans((prev) => prev.filter((l) => l._id !== deleteItem._id));
      setDeleteItem(null);
    } catch (err) { alert(err.response?.data?.message || "Delete failed"); }
    finally { setDeleting(false); }
  };

  const isOverdue = (loan) => loan.status === "active" && new Date(loan.dueDate) < new Date();

  return (
    <div>
      <PageHeader
        title="Loans"
        subtitle={`${loans.length} loan${loans.length !== 1 ? "s" : ""}`}
        action={
          <button
            onClick={() => { setEditItem(null); setShowModal(true); }}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm cursor-pointer transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} /> New Loan
          </button>
        }
      />

      {/* Status Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize cursor-pointer
              ${statusFilter === s ? "bg-indigo-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-100 border border-gray-200/80 rounded-xl overflow-hidden">
        {loading ? <TableSkeleton rows={6} /> : loans.length === 0 ? (
          <EmptyState message="No loans found. Create your first loan!" icon={HandCoins} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 900 }}>
              <thead>
                <tr className="bg-gray-100 border-b border-gray-100">
                  {["Borrower", "Principal", "Total Repayable", "Paid", "Next Due", "Progress", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loans.map((loan) => {
                  const progress = loan.totalRepayable > 0 ? (loan.totalPaid / loan.totalRepayable) * 100 : 0;
                  const overdue = isOverdue(loan);
                  return (
                    <tr key={loan._id} className="bg-gray-50 hover:bg-white transition-colors group">
                      {/* Borrower */}
                      <td className="px-5 py-4">
                        <Link href={`/loans/${loan._id}`} className="flex items-center gap-3 no-underline">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                            style={{ background: "linear-gradient(135deg,#6366f1,#4338ca)" }}
                          >
                            {loan.borrower?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[14px] text-gray-900 leading-none tracking-tight">{loan.borrower?.name}</p>
                            <p className="text-[11px] font-medium text-gray-400 mt-1 flex items-center gap-1">
                              <Phone size={10} /> {loan.borrower?.phone}
                            </p>
                            <span className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${loan.repaymentType === "interest_only" ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"}`}>
                              {loan.repaymentType === "interest_only" ? "Interest only" : "Installment"}
                            </span>
                          </div>
                        </Link>
                      </td>

                      {/* Principal */}
                      <td className="px-5 py-4">
                        <span className="font-semibold text-[13px] text-gray-700">{formatCurrency(loan.principalAmount)}</span>
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-[13px] text-indigo-600">{formatCurrency(loan.totalRepayable)}</span>
                      </td>

                      {/* Paid */}
                      <td className="px-5 py-4">
                        <span className="font-semibold text-[13px] text-emerald-600">{formatCurrency(loan.totalPaid)}</span>
                      </td>

                      {/* Next Due */}
                      <td className="px-5 py-4">
                        {loan.status === "closed" ? (
                          <span className="text-gray-300">—</span>
                        ) : loan.nextDueDate ? (
                          <span className={`text-[13px] font-medium ${new Date(loan.nextDueDate) < new Date() ? "text-red-500" : "text-gray-600"}`}>
                            {formatDate(loan.nextDueDate)}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Progress */}
                      <td className="px-5 py-4" style={{ minWidth: 130 }}>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-gray-400">{progress.toFixed(0)}%</span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={overdue ? "overdue" : loan.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/loans/${loan._id}`}
                            title="View Details"
                            className="w-8 h-8 rounded-lg flex items-center justify-center no-underline
                              bg-amber-50 border border-amber-200 text-amber-500
                              hover:bg-amber-100 transition-all"
                          >
                            <Eye size={13} />
                          </Link>
                          <button
                            onClick={() => { setEditItem(loan); setShowModal(true); }}
                            title="Edit Loan"
                            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer
                              bg-gray-100 border border-gray-200 text-gray-500
                              hover:border-indigo-300 hover:text-indigo-600 transition-all"
                          >
                            <Pencil size={13} />
                          </button>
                          {loan.status === "active" && (
                            <button
                              onClick={() => handleClose(loan)}
                              title="Close Loan"
                              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer
                                bg-emerald-50 border border-emerald-200 text-emerald-500
                                hover:bg-emerald-100 transition-all"
                            >
                              <CheckSquare size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteItem(loan)}
                            title="Delete"
                            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer
                              bg-red-50 border border-red-200 text-red-400
                              hover:bg-red-100 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={13} />
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

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? "Edit Loan" : "Create New Loan"}>
        <LoanForm initial={editItem || {}} onSuccess={handleSuccess} onCancel={() => { setShowModal(false); setEditItem(null); }} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Loan"
        message="This will permanently delete the loan and all its repayments. Are you sure?"
      />
    </div>
  );
}
