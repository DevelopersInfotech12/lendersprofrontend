"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Phone, Mail, Users, Eye } from "lucide-react";
import { borrowersAPI } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Modal, PageHeader, EmptyState, ConfirmDialog, TableSkeleton } from "@/components/ui/index";
import BorrowerForm from "@/components/borrowers/BorrowerForm";

export default function BorrowersPage() {
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBorrowers = async (q = "") => {
    setLoading(true);
    try {
      const { data } = await borrowersAPI.getAll({ search: q });
      setBorrowers(data.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBorrowers(); }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchBorrowers(e.target.value);
  };

  const handleSuccess = (borrower) => {
    if (editItem) {
      setBorrowers((prev) => prev.map((b) => (b._id === borrower._id ? borrower : b)));
    } else {
      setBorrowers((prev) => [borrower, ...prev]);
    }
    setShowModal(false);
    setEditItem(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await borrowersAPI.delete(deleteItem._id);
      setBorrowers((prev) => prev.filter((b) => b._id !== deleteItem._id));
      setDeleteItem(null);
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Borrowers"
        subtitle={`${borrowers.length} borrower${borrowers.length !== 1 ? "s" : ""} registered`}
        action={
          <button
            onClick={() => { setEditItem(null); setShowModal(true); }}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm cursor-pointer transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} /> Add Borrower
          </button>
        }
      />

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Search by name, phone or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200
              text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400
              focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-100 border border-gray-200/80 rounded-xl overflow-hidden">
        {loading ? <TableSkeleton rows={6} /> : borrowers.length === 0 ? (
          <EmptyState message="No borrowers found. Add your first borrower to get started." icon={Users} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 700 }}>
              <thead>
                <tr className="bg-gray-100 border-b border-gray-100">
                  {["Borrower", "Contact", "ID Proof", "Added", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {borrowers.map((b) => (
                  <tr key={b._id} className="bg-gray-50 hover:bg-white transition-colors group">
                    {/* Borrower */}
                    <td className="px-5 py-4">
                      <Link href={`/borrowers/${b._id}`} className="flex items-center gap-3 no-underline">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                          style={{ background: "linear-gradient(135deg,#6366f1,#4338ca)" }}
                        >
                          {b.name[0]?.toUpperCase()}
                        </div>
                        <p className="font-bold text-[14px] text-gray-900 leading-none tracking-tight hover:text-indigo-600 transition-colors">{b.name}</p>
                      </Link>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4" style={{ minWidth: 220 }}>
                      <div className="space-y-1">
                        <a href={`tel:${b.phone}`} className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 no-underline hover:text-indigo-600">
                          <Phone size={11} className="text-gray-400 flex-shrink-0" />{b.phone}
                        </a>
                        {b.email && (
                          <a href={`mailto:${b.email}`} className="flex items-start gap-1.5 text-[13px] font-semibold text-gray-600 no-underline hover:text-indigo-600">
                            <Mail size={11} className="text-gray-400 flex-shrink-0 mt-0.5" />
                            <span style={{ wordBreak: "break-all" }}>{b.email}</span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* ID Proof */}
                    <td className="px-5 py-4">
                      {b.idType ? (
                        <span className="text-[13px] font-medium text-gray-600 capitalize">
                          {b.idType.replace("_", " ")}: <span className="text-gray-400">{b.idNumber || "N/A"}</span>
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Added */}
                    <td className="px-5 py-4">
                      <p className="text-[12px] font-medium text-gray-400">{formatDate(b.createdAt)}</p>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/borrowers/${b._id}`}
                          title="View Details"
                          className="w-8 h-8 rounded-lg flex items-center justify-center no-underline
                            bg-amber-50 border border-amber-200 text-amber-500
                            hover:bg-amber-100 transition-all"
                        >
                          <Eye size={13} />
                        </Link>
                        <button
                          onClick={() => { setEditItem(b); setShowModal(true); }}
                          title="Edit"
                          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer
                            bg-gray-100 border border-gray-200 text-gray-500
                            hover:border-indigo-300 hover:text-indigo-600 transition-all"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteItem(b)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? "Edit Borrower" : "Add Borrower"}>
        <BorrowerForm
          initial={editItem || {}}
          onSuccess={handleSuccess}
          onCancel={() => { setShowModal(false); setEditItem(null); }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Borrower"
        message={`Are you sure you want to delete "${deleteItem?.name}"? This cannot be undone.`}
      />
    </div>
  );
}
