"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Calendar, Percent, Clock } from "lucide-react";
import { loansAPI, repaymentsAPI } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge, Modal, Spinner, ConfirmDialog } from "@/components/ui/index";
import RepaymentForm from "@/components/repayments/RepaymentForm";

export default function LoanDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRepModal, setShowRepModal] = useState(false);
  const [deleteRep, setDeleteRep] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLoan = async () => {
    try {
      const { data: d } = await loansAPI.getOne(id);
      setData(d.data);
    } catch { router.push("/loans"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLoan(); }, [id]);

  const handleRepaymentSuccess = () => {
    setShowRepModal(false);
    fetchLoan();
  };

  const handleDeleteRep = async () => {
    setDeleting(true);
    try {
      await repaymentsAPI.delete(deleteRep._id);
      setDeleteRep(null);
      fetchLoan();
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
    finally { setDeleting(false); }
  };

  if (loading) return <Spinner />;
  if (!data) return null;

  const { loan, repayments } = data;
  const progress = loan.totalRepayable > 0 ? (loan.totalPaid / loan.totalRepayable) * 100 : 0;
  const remaining = Math.max(loan.totalRepayable - loan.totalPaid, 0);

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft size={16} /> Back to Loans
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loan Summary */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200/80 rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{loan.borrower?.name}</h2>
                <p className="text-slate-400 text-sm">{loan.borrower?.phone}</p>
              </div>
              <StatusBadge status={loan.status} />
            </div>

            {loan.purpose && (
              <div className="mb-4 bg-slate-50 rounded-lg px-3 py-2">
                <p className="text-xs text-slate-400">Purpose</p>
                <p className="text-sm text-slate-700">{loan.purpose}</p>
              </div>
            )}

            <div className="space-y-3">
              {[
                { label: "Principal", value: formatCurrency(loan.principalAmount), icon: null },
                { label: "Interest Rate", value: `${loan.interestRate}% / month (${loan.interestType})`, icon: Percent },
                { label: "Duration", value: `${loan.durationMonths} months`, icon: Clock },
                { label: "Start Date", value: formatDate(loan.startDate), icon: Calendar },
                { label: "Due Date", value: formatDate(loan.dueDate), icon: Calendar },
                { label: "Next Payment Due", value: loan.status === "closed" ? "—" : formatDate(loan.nextDueDate), icon: Calendar },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-medium text-slate-700">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Interest</span>
                <span className="font-medium text-orange-600">{formatCurrency(loan.totalInterest)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Repayable</span>
                <span className="font-bold text-indigo-600">{formatCurrency(loan.totalRepayable)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Paid</span>
                <span className="font-bold text-green-600">{formatCurrency(loan.totalPaid)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Outstanding</span>
                <span className="font-bold text-red-600">{formatCurrency(remaining)}</span>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Paid</span><span>{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
            </div>
          </div>

          {loan.status === "active" && (
            <button onClick={() => setShowRepModal(true)} className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl py-2.5 transition-colors cursor-pointer w-full flex items-center justify-center gap-2">
              <Plus size={16} /> Record Repayment
            </button>
          )}
        </div>

        {/* Repayments */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200/80 rounded-xl p-5">
            <h3 className="text-base font-bold text-gray-800 mb-4">Repayment History ({repayments.length})</h3>
            {repayments.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No repayments recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs text-slate-400 pb-2 font-medium">Date</th>
                      <th className="text-right text-xs text-slate-400 pb-2 font-medium">Amount</th>
                      <th className="text-right text-xs text-slate-400 pb-2 font-medium">Principal</th>
                      <th className="text-right text-xs text-slate-400 pb-2 font-medium">Interest</th>
                      <th className="text-center text-xs text-slate-400 pb-2 font-medium">Mode</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {repayments.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50">
                        <td className="py-3 text-slate-600">{formatDate(r.paymentDate)}</td>
                        <td className="py-3 text-right font-semibold text-green-600">{formatCurrency(r.amount)}</td>
                        <td className="py-3 text-right text-slate-500">{formatCurrency(r.principalPaid)}</td>
                        <td className="py-3 text-right text-orange-500">{formatCurrency(r.interestPaid)}</td>
                        <td className="py-3 text-center">
                          <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full capitalize">{r.paymentMode.replace("_", " ")}</span>
                        </td>
                        <td className="py-3 pl-2">
                          <button onClick={() => setDeleteRep(r)} className="p-1 hover:bg-red-50 rounded text-red-400">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showRepModal} onClose={() => setShowRepModal(false)} title="Record Repayment">
        <RepaymentForm
          loan={loan}
          onSuccess={handleRepaymentSuccess}
          onCancel={() => setShowRepModal(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteRep}
        onClose={() => setDeleteRep(null)}
        onConfirm={handleDeleteRep}
        loading={deleting}
        title="Delete Repayment"
        message="This will reverse the repayment from the loan balance. Continue?"
      />
    </div>
  );
}
