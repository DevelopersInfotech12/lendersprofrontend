"use client";
import { useEffect, useState } from "react";
import { loansAPI, borrowersAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function LoanForm({ initial = {}, onSuccess, onCancel }) {
  const [borrowers, setBorrowers] = useState([]);
  const [form, setForm] = useState({
    borrower: initial.borrower?._id || initial.borrower || "",
    principalAmount: initial.principalAmount || "",
    interestRate: initial.interestRate || "",
    interestType: initial.interestType || "flat",
    repaymentType: initial.repaymentType || "installment",
    durationMonths: initial.durationMonths || "",
    startDate: initial.startDate ? initial.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    purpose: initial.purpose || "",
    notes: initial.notes || "",
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    borrowersAPI.getAll().then(({ data }) => setBorrowers(data.data)).catch(() => {});
  }, []);

  // Live preview
  useEffect(() => {
    const p = parseFloat(form.principalAmount);
    const r = parseFloat(form.interestRate);
    const d = parseInt(form.durationMonths);
    if (p > 0 && r >= 0 && d > 0) {
      let totalInterest;
      if (form.interestType === "flat") {
        totalInterest = (p * r * d) / 100;
      } else {
        let balance = p, ti = 0;
        const mp = p / d;
        for (let i = 0; i < d; i++) { ti += (balance * r) / 100; balance -= mp; }
        totalInterest = ti;
      }
      const monthlyPayment = form.repaymentType === "interest_only"
        ? (p * r) / 100
        : (p + totalInterest) / d;
      setPreview({ totalInterest: totalInterest.toFixed(2), totalRepayable: (p + totalInterest).toFixed(2), monthlyPayment: monthlyPayment.toFixed(2) });
    } else setPreview(null);
  }, [form.principalAmount, form.interestRate, form.durationMonths, form.interestType, form.repaymentType]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (initial._id) {
        const { data } = await loansAPI.update(initial._id, form);
        onSuccess(data.data);
      } else {
        const { data } = await loansAPI.create(form);
        onSuccess(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${initial._id ? "update" : "create"} loan`);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Borrower *</label>
        <select name="borrower" value={form.borrower} onChange={handleChange} className="input" required>
          <option value="">Select borrower...</option>
          {borrowers.map((b) => <option key={b._id} value={b._id}>{b.name} — {b.phone}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Principal Amount (₹) *</label>
          <input name="principalAmount" type="number" min="1" value={form.principalAmount} onChange={handleChange} className="input" placeholder="50000" required />
        </div>
        <div>
          <label className="label">Interest Rate (% / month) *</label>
          <input name="interestRate" type="number" min="0" step="0.1" value={form.interestRate} onChange={handleChange} className="input" placeholder="2.5" required />
        </div>
        <div>
          <label className="label">Interest Type</label>
          <select name="interestType" value={form.interestType} onChange={handleChange} className="input">
            <option value="flat">Flat Rate</option>
            <option value="reducing">Reducing Balance</option>
          </select>
        </div>
        <div>
          <label className="label">Repayment Type</label>
          <select name="repaymentType" value={form.repaymentType} onChange={handleChange} className="input">
            <option value="installment">Recurring Installment (EMI)</option>
            <option value="interest_only">Monthly Interest Only</option>
          </select>
        </div>
        <div>
          <label className="label">Duration (Months) *</label>
          <input name="durationMonths" type="number" min="1" value={form.durationMonths} onChange={handleChange} className="input" placeholder="12" required />
        </div>
        <div>
          <label className="label">Start Date *</label>
          <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="label">Purpose</label>
          <input name="purpose" value={form.purpose} onChange={handleChange} className="input" placeholder="Business, Medical..." />
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} className="input" rows={2} />
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-indigo-50 rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-slate-500">Total Interest</p>
            <p className="font-bold text-indigo-600 text-sm">{formatCurrency(preview.totalInterest)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Repayable</p>
            <p className="font-bold text-indigo-600 text-sm">{formatCurrency(preview.totalRepayable)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">
              {form.repaymentType === "interest_only" ? "Monthly Interest" : "Monthly (avg)"}
            </p>
            <p className="font-bold text-indigo-600 text-sm">{formatCurrency(preview.monthlyPayment)}</p>
          </div>
        </div>
      )}
      {preview && form.repaymentType === "interest_only" && (
        <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
          Borrower pays only interest each month. Principal ({formatCurrency(form.principalAmount)}) is due as a lump sum on the due date.
        </p>
      )}

      {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? "Saving..." : initial._id ? "Update Loan" : "Create Loan"}
        </button>
      </div>
    </form>
  );
}
