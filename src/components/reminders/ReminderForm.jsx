"use client";
import { useEffect, useState } from "react";
import { remindersAPI, borrowersAPI, loansAPI } from "@/lib/api";

const TYPES = ["payment_followup", "call", "visit", "document", "other"];

export default function ReminderForm({ initial = {}, onSuccess, onCancel }) {
  const [borrowers, setBorrowers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState({
    title: initial.title || "",
    borrower: initial.borrower?._id || initial.borrower || "",
    loan: initial.loan?._id || initial.loan || "",
    dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    type: initial.type || "payment_followup",
    notes: initial.notes || "",
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form, borrower: form.borrower || undefined, loan: form.loan || undefined };
      if (initial._id) {
        const { data } = await remindersAPI.update(initial._id, payload);
        onSuccess(data.data);
      } else {
        const { data } = await remindersAPI.create(payload);
        onSuccess(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save reminder");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Title *</label>
        <input name="title" value={form.title} onChange={handleChange} className="input" placeholder="Call about overdue installment" required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Borrower</label>
          <select name="borrower" value={form.borrower} onChange={handleChange} className="input">
            <option value="">Not linked</option>
            {borrowers.map((b) => <option key={b._id} value={b._id}>{b.name} — {b.phone}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Loan</label>
          <select name="loan" value={form.loan} onChange={handleChange} className="input" disabled={!form.borrower}>
            <option value="">Not linked</option>
            {loans.map((l) => <option key={l._id} value={l._id}>₹{l.principalAmount} — {l.status}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Type</label>
          <select name="type" value={form.type} onChange={handleChange} className="input capitalize">
            {TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Due Date *</label>
          <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} className="input" required />
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} className="input" rows={2} />
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? "Saving..." : initial._id ? "Update Reminder" : "Add Reminder"}
        </button>
      </div>
    </form>
  );
}
