"use client";
import { useEffect, useState } from "react";
import { Plus, Landmark, Trash2, Pencil, Undo2, X } from "lucide-react";
import { collateralsAPI } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Modal, PageHeader, EmptyState, ConfirmDialog, TableSkeleton } from "@/components/ui/index";
import CollateralForm from "@/components/collaterals/CollateralForm";

const STATUS_STYLES = {
  held:       "bg-amber-50 text-amber-700 border border-amber-200",
  returned:   "bg-gray-100 text-gray-500 border border-gray-200",
  liquidated: "bg-red-50 text-red-700 border border-red-200",
};

export default function CollateralsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await collateralsAPI.getAll();
      setItems(data.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSuccess = (item) => {
    if (editItem) setItems((prev) => prev.map((c) => (c._id === item._id ? item : c)));
    else setItems((prev) => [item, ...prev]);
    setShowModal(false);
    setEditItem(null);
  };

  const handleReturn = async (item) => {
    try {
      const { data } = await collateralsAPI.return(item._id);
      setItems((prev) => prev.map((c) => (c._id === item._id ? data.data : c)));
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await collateralsAPI.delete(deleteItem._id);
      setItems((prev) => prev.filter((c) => c._id !== deleteItem._id));
      setDeleteItem(null);
    } catch (err) { alert(err.response?.data?.message || "Delete failed"); }
    finally { setDeleting(false); }
  };

  const totalHeldValue = items.filter((i) => i.status === "held").reduce((s, i) => s + i.estimatedValue, 0);

  return (
    <div>
      <PageHeader
        title="Collaterals"
        subtitle={`${items.length} asset${items.length !== 1 ? "s" : ""} deposited · ${formatCurrency(totalHeldValue)} currently held`}
        action={
          <button
            onClick={() => { setEditItem(null); setShowModal(true); }}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm cursor-pointer transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} /> Add Collateral
          </button>
        }
      />

      <div className="bg-gray-100 border border-gray-200/80 rounded-xl overflow-hidden">
        {loading ? <TableSkeleton rows={6} /> : items.length === 0 ? (
          <EmptyState message="No collateral recorded yet. Add an asset a borrower has deposited against a loan." icon={Landmark} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 820 }}>
              <thead>
                <tr className="bg-gray-100 border-b border-gray-100">
                  {["Image", "Borrower", "Asset", "Type", "Value", "Deposited", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((c) => (
                  <tr key={c._id} className="bg-gray-50 hover:bg-white transition-colors">
                    <td className="px-5 py-4">
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.description}
                          onClick={() => setLightboxImage(c.image)}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <Landmark size={14} className="text-gray-300" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-[14px] text-gray-900">{c.borrower?.name}</p>
                      <p className="text-[11px] font-medium text-gray-400">{c.borrower?.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[13px] font-medium text-gray-700 max-w-xs">{c.description}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[13px] font-medium text-gray-600 capitalize">{c.assetType.replace("_", " ")}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-[13px] text-indigo-600">{formatCurrency(c.estimatedValue)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[12px] font-medium text-gray-400">{formatDate(c.depositDate)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {c.status === "held" && (
                          <button
                            onClick={() => handleReturn(c)}
                            title="Mark Returned"
                            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer
                              bg-emerald-50 border border-emerald-200 text-emerald-500 hover:bg-emerald-100 transition-all"
                          >
                            <Undo2 size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => { setEditItem(c); setShowModal(true); }}
                          title="Edit"
                          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer
                            bg-gray-100 border border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteItem(c)}
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

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? "Edit Collateral" : "Add Collateral"}>
        <CollateralForm initial={editItem || {}} onSuccess={handleSuccess} onCancel={() => { setShowModal(false); setEditItem(null); }} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Collateral Record"
        message={`Remove "${deleteItem?.description}" from records? This cannot be undone.`}
      />

      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm cursor-zoom-out"
        >
          <button
            onClick={() => setLightboxImage(null)}
            title="Close"
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all"
          >
            <X size={18} />
          </button>
          <img
            src={lightboxImage}
            alt="Collateral full view"
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain shadow-2xl cursor-default"
          />
        </div>
      )}
    </div>
  );
}
