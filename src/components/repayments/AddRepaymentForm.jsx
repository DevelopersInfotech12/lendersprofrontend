"use client";
import { useEffect, useState } from "react";
import { loansAPI, repaymentsAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const MODES = ["cash", "upi", "bank_transfer", "cheque", "other"];

export default function AddRepaymentForm({ onSuccess, onCancel }) {
  const [loans, setLoans] = useState([]);
  const [loansLoading, setLoansLoading] = useState(true);
  const [form, setForm] = useState({
    loan: "",
    amount: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMode: "cash",
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      loansAPI.getAll({ status: "active" }),
      loansAPI.getAll({ status: "defaulted" }),
    ])
      .then(([a, d]) => setLoans([...a.data.data, ...d.data.data]))
      .catch(() => {})
      .finally(() => setLoansLoading(false));
  }, []);

  const selectedLoan = loans.find((l) => l._id === form.loan);
  const remaining = selectedLoan ? Math.max(selectedLoan.totalRepayable - selectedLoan.totalPaid, 0) : 0;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.loan) { setError("Please select a loan"); return; }
    if (parseFloat(form.amount) > remaining) {
      setError(`Amount cannot exceed remaining balance of ${formatCurrency(remaining)}`);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await repaymentsAPI.create({ ...form, amount: parseFloat(form.amount) });
      onSuccess(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record repayment");
    } finally {
      setLoading(false);
    }
  };

  if (!loansLoading && loans.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-6">
        No active loans found. Create a loan first before recording a repayment.
        <div className="pt-4">
          <button type="button" onClick={onCancel} className="btn-secondary">Close</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Loan *</label>
        <select name="loan" value={form.loan} onChange={handleChange} className="input" required disabled={loansLoading}>
          <option value="">{loansLoading ? "Loading loans..." : "Select loan..."}</option>
          {loans.map((l) => (
            <option key={l._id} value={l._id}>
              {l.status === "defaulted" ? "⚠ " : ""}{l.borrower?.name} — Remaining {formatCurrency(Math.max(l.totalRepayable - l.totalPaid, 0))}
            </option>
          ))}
        </select>
      </div>

      {selectedLoan && (
        <div className="bg-indigo-50 rounded-xl p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Total Repayable</span>
            <span className="font-medium">{formatCurrency(selectedLoan.totalRepayable)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Already Paid</span>
            <span className="font-medium text-green-600">{formatCurrency(selectedLoan.totalPaid)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-indigo-100 pt-1 mt-1">
            <span className="text-slate-600">Remaining</span>
            <span className="text-red-600">{formatCurrency(remaining)}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Amount (₹) *</label>
          <input
            name="amount" type="number" min="1" max={remaining || undefined} step="1"
            value={form.amount} onChange={handleChange} className="input" placeholder="5000"
            disabled={!selectedLoan} required
          />
        </div>
        <div>
          <label className="label">Payment Date</label>
          <input name="paymentDate" type="date" value={form.paymentDate} onChange={handleChange} className="input" />
        </div>
      </div>

      <div>
        <label className="label">Payment Mode</label>
        <select name="paymentMode" value={form.paymentMode} onChange={handleChange} className="input">
          {MODES.map((m) => <option key={m} value={m}>{m.replace("_", " ").toUpperCase()}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} className="input" rows={2} />
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={loading || !selectedLoan} className="btn-primary flex-1">
          {loading ? "Recording..." : "Record Payment"}
        </button>
      </div>
    </form>
  );
}
