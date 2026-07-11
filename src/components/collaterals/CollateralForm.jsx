"use client";
import { useEffect, useState } from "react";
import { collateralsAPI, borrowersAPI, loansAPI } from "@/lib/api";
import { ImagePlus, X } from "lucide-react";

const ASSET_TYPES = ["property", "gold_jewelry", "vehicle", "electronics", "document", "other"];
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB

export default function CollateralForm({ initial = {}, onSuccess, onCancel }) {
  const [borrowers, setBorrowers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState({
    borrower: initial.borrower?._id || initial.borrower || "",
    loan: initial.loan?._id || initial.loan || "",
    assetType: initial.assetType || "gold_jewelry",
    description: initial.description || "",
    estimatedValue: initial.estimatedValue || "",
    image: initial.image || "",
    depositDate: initial.depositDate ? initial.depositDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    notes: initial.notes || "",
  });
  const [imageError, setImageError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    borrowersAPI.getAll().then(({ data }) => setBorrowers(data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.borrower) { setLoans([]); return; }
    loansAPI.getAll({ borrower: form.borrower }).then(({ data }) => setLoans(data.data)).catch(() => {});
  }, [form.borrower]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageError("");
    if (!file.type.startsWith("image/")) { setImageError("Please select an image file"); return; }
    if (file.size > MAX_IMAGE_BYTES) { setImageError("Image must be under 4MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result }));
    reader.onerror = () => setImageError("Failed to read image");
    reader.readAsDataURL(file);
  };

  const removeImage = () => setForm((f) => ({ ...f, image: "" }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form, loan: form.loan || undefined };
      if (initial._id) {
        const { data } = await collateralsAPI.update(initial._id, payload);
        onSuccess(data.data);
      } else {
        const { data } = await collateralsAPI.create(payload);
        onSuccess(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save collateral");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Borrower *</label>
          <select name="borrower" value={form.borrower} onChange={handleChange} className="input" required>
            <option value="">Select borrower...</option>
            {borrowers.map((b) => <option key={b._id} value={b._id}>{b.name} — {b.phone}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Linked Loan (optional)</label>
          <select name="loan" value={form.loan} onChange={handleChange} className="input" disabled={!form.borrower}>
            <option value="">No specific loan</option>
            {loans.map((l) => <option key={l._id} value={l._id}>₹{l.principalAmount} — {l.status}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Asset Type *</label>
          <select name="assetType" value={form.assetType} onChange={handleChange} className="input capitalize" required>
            {ASSET_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Estimated Value (₹) *</label>
          <input name="estimatedValue" type="number" min="0" value={form.estimatedValue} onChange={handleChange} className="input" placeholder="100000" required />
        </div>
        <div>
          <label className="label">Deposit Date *</label>
          <input name="depositDate" type="date" value={form.depositDate} onChange={handleChange} className="input" required />
        </div>
      </div>

      <div>
        <label className="label">Description *</label>
        <input name="description" value={form.description} onChange={handleChange} className="input" placeholder="e.g. 20g gold necklace, land documents..." required />
      </div>

      <div>
        <label className="label">Collateral Image</label>
        {form.image ? (
          <div className="relative inline-block">
            <img src={form.image} alt="Collateral" className="h-32 w-32 object-cover rounded-xl border border-gray-200" />
            <button
              type="button"
              onClick={removeImage}
              title="Remove image"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-1.5 w-full border-2 border-dashed border-gray-200 rounded-xl py-6 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/40 transition-all">
            <ImagePlus size={20} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-500">Click to upload an image</span>
            <span className="text-[11px] text-gray-400">JPG, PNG — max 4MB</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </label>
        )}
        {imageError && <p className="text-red-600 text-xs mt-1.5">{imageError}</p>}
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} className="input" rows={2} />
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? "Saving..." : initial._id ? "Update Collateral" : "Add Collateral"}
        </button>
      </div>
    </form>
  );
}
