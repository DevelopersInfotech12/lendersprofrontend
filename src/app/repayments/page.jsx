"use client";
import { useEffect, useState } from "react";
import { Plus, Receipt, Trash2 } from "lucide-react";
import { repaymentsAPI } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Modal, PageHeader, EmptyState, ConfirmDialog, TableSkeleton } from "@/components/ui/index";
import AddRepaymentForm from "@/components/repayments/AddRepaymentForm";

export default function RepaymentsPage() {
  const [repayments, setRepayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRepayments = async () => {
    setLoading(true);
    try {
      const { data } = await repaymentsAPI.getAll();
      setRepayments(data.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRepayments(); }, []);

  const handleSuccess = (repayment) => {
    setRepayments((prev) => [repayment, ...prev]);
    setShowModal(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await repaymentsAPI.delete(deleteItem._id);
      setRepayments((prev) => prev.filter((r) => r._id !== deleteItem._id));
      setDeleteItem(null);
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
    finally { setDeleting(false); }
  };

  const totalCollected = repayments.reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <PageHeader
        title="Repayments"
        subtitle={`${repayments.length} payment${repayments.length !== 1 ? "s" : ""} recorded · Total collected: ${formatCurrency(totalCollected)}`}
        action={
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm cursor-pointer transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} /> Add Repayment
          </button>
        }
      />

      {/* Table */}
      <div className="bg-gray-100 border border-gray-200/80 rounded-xl overflow-hidden">
        {loading ? <TableSkeleton rows={6} /> : repayments.length === 0 ? (
          <EmptyState message="No repayments recorded yet." icon={Receipt} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 900 }}>
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-100">
                    {["Borrower", "Date", "Amount", "Principal", "Interest", "Mode", "Notes", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {repayments.map((r) => (
                    <tr key={r._id} className="bg-gray-50 hover:bg-white transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                            style={{ background: "linear-gradient(135deg,#6366f1,#4338ca)" }}
                          >
                            {r.borrower?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[14px] text-gray-900 leading-none tracking-tight">{r.borrower?.name}</p>
                            <p className="text-[11px] font-medium text-gray-400 mt-1">{r.borrower?.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[13px] font-medium text-gray-500">{formatDate(r.paymentDate)}</td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-[13px] text-emerald-600">{formatCurrency(r.amount)}</span>
                      </td>
                      <td className="px-5 py-4 text-[13px] font-medium text-gray-500">{formatCurrency(r.principalPaid)}</td>
                      <td className="px-5 py-4 text-[13px] font-medium text-orange-500">{formatCurrency(r.interestPaid)}</td>
                      <td className="px-5 py-4">
                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize border border-gray-200">
                          {r.paymentMode?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs max-w-40 truncate">{r.notes || "—"}</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setDeleteItem(r)}
                          title="Delete"
                          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer
                            bg-red-50 border border-red-200 text-red-400
                            hover:bg-red-100 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-100">
                    <td colSpan={2} className="px-5 py-3 text-sm font-bold text-gray-600">Total</td>
                    <td className="px-5 py-3 font-bold text-emerald-600">{formatCurrency(totalCollected)}</td>
                    <td colSpan={5}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Repayment">
        <AddRepaymentForm onSuccess={handleSuccess} onCancel={() => setShowModal(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Repayment"
        message="This reverses the repayment from the loan balance. Are you sure?"
      />
    </div>
  );
}
