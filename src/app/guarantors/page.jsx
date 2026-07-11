"use client";
import { useEffect, useState } from "react";
import { Plus, ShieldCheck, Trash2, Pencil, Phone } from "lucide-react";
import { guarantorsAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Modal, PageHeader, EmptyState, ConfirmDialog, TableSkeleton } from "@/components/ui/index";
import GuarantorForm from "@/components/guarantors/GuarantorForm";

export default function GuarantorsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await guarantorsAPI.getAll();
      setItems(data.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSuccess = (item) => {
    if (editItem) setItems((prev) => prev.map((g) => (g._id === item._id ? item : g)));
    else setItems((prev) => [item, ...prev]);
    setShowModal(false);
    setEditItem(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await guarantorsAPI.delete(deleteItem._id);
      setItems((prev) => prev.filter((g) => g._id !== deleteItem._id));
      setDeleteItem(null);
    } catch (err) { alert(err.response?.data?.message || "Delete failed"); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <PageHeader
        title="Guarantors"
        subtitle={`${items.length} guarantor${items.length !== 1 ? "s" : ""} on record`}
        action={
          <button
            onClick={() => { setEditItem(null); setShowModal(true); }}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm cursor-pointer transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} /> Add Guarantor
          </button>
        }
      />

      <div className="bg-gray-100 border border-gray-200/80 rounded-xl overflow-hidden">
        {loading ? <TableSkeleton rows={6} /> : items.length === 0 ? (
          <EmptyState message="No guarantors added yet. Attach a co-signer to a loan for extra security." icon={ShieldCheck} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 780 }}>
              <thead>
                <tr className="bg-gray-100 border-b border-gray-100">
                  {["Guarantor", "For Loan / Borrower", "Relation", "ID Proof", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((g) => (
                  <tr key={g._id} className="bg-gray-50 hover:bg-white transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-[14px] text-gray-900">{g.name}</p>
                      <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1"><Phone size={10} /> {g.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[13px] font-semibold text-gray-700">{g.borrower?.name}</p>
                      <p className="text-[12px] text-gray-400">{g.loan ? `${formatCurrency(g.loan.principalAmount)} · ${g.loan.status}` : "—"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[13px] text-gray-600">{g.relationToBorrower || "—"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[13px] font-medium text-gray-600 capitalize">
                        {g.idType?.replace("_", " ")}: <span className="text-gray-400">{g.idNumber || "N/A"}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setEditItem(g); setShowModal(true); }}
                          title="Edit"
                          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer
                            bg-gray-100 border border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteItem(g)}
                          title="Delete"
                          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer
                            bg-red-50 border border-red-200 text-red-400 hover:bg-red-100 hover:text-red-500 transition-all"
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

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? "Edit Guarantor" : "Add Guarantor"}>
        <GuarantorForm initial={editItem || {}} onSuccess={handleSuccess} onCancel={() => { setShowModal(false); setEditItem(null); }} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Guarantor"
        message={`Remove "${deleteItem?.name}" as guarantor? This cannot be undone.`}
      />
    </div>
  );
}
