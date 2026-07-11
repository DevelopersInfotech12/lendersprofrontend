"use client";
import { useEffect, useState } from "react";
import { guarantorsAPI, loansAPI } from "@/lib/api";

const ID_TYPES = ["aadhaar", "pan", "passport", "voter_id", "driving_license", "other"];

export default function GuarantorForm({ initial = {}, onSuccess, onCancel }) {
  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState({
    loan: initial.loan?._id || initial.loan || "",
    name: initial.name || "",
    phone: initial.phone || "",
    address: initial.address || "",
    relationToBorrower: initial.relationToBorrower || "",
    idType: initial.idType || "aadhaar",
    idNumber: initial.idNumber || "",
    notes: initial.notes || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loansAPI.getAll({ status: "active" }).then(({ data }) => setLoans(data.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (initial._id) {
        const { data } = await guarantorsAPI.update(initial._id, form);
        onSuccess(data.data);
      } else {
        const { data } = await guarantorsAPI.create(form);
        onSuccess(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save guarantor");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Loan *</label>
        <select name="loan" value={form.loan} onChange={handleChange} className="input" required disabled={!!initial._id}>
          <option value="">Select loan...</option>
          {loans.map((l) => <option key={l._id} value={l._id}>{l.borrower?.name} — ₹{l.principalAmount}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Guarantor Name *</label>
          <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="Full name" required />
        </div>
        <div>
          <label className="label">Phone *</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="input" placeholder="+91 98765 43210" required />
        </div>
        <div>
          <label className="label">Relation to Borrower</label>
          <input name="relationToBorrower" value={form.relationToBorrower} onChange={handleChange} className="input" placeholder="Brother, friend, colleague..." />
        </div>
        <div>
          <label className="label">ID Type</label>
          <select name="idType" value={form.idType} onChange={handleChange} className="input capitalize">
            {ID_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ").toUpperCase()}</option>)}
          </select>
        </div>
        <div>
          <label className="label">ID Number</label>
          <input name="idNumber" value={form.idNumber} onChange={handleChange} className="input" placeholder="XXXX XXXX XXXX" />
        </div>
      </div>

      <div>
        <label className="label">Address</label>
        <textarea name="address" value={form.address} onChange={handleChange} className="input" rows={2} />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} className="input" rows={2} />
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? "Saving..." : initial._id ? "Update Guarantor" : "Add Guarantor"}
        </button>
      </div>
    </form>
  );
}
