"use client";
import { useEffect, useState } from "react";
import { borrowersAPI, loansAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const ID_TYPES = ["aadhaar", "pan", "passport", "voter_id", "driving_license", "other"];
const INTEREST_PRESETS = ["1", "1.5", "2", "2.5", "3", "3.5", "4", "5", "6", "8", "10"];

export default function BorrowerForm({ initial = {}, onSuccess, onCancel }) {
  const isEdit = !!initial._id;

  const [form, setForm] = useState({
    name: initial.name || "",
    phone: initial.phone || "",
    email: initial.email || "",
    address: initial.address || "",
    idType: initial.idType || "aadhaar",
    idNumber: initial.idNumber || "",
    notes: initial.notes || "",
  });

  // Loan-at-onboarding fields (only used when adding a new borrower)
  const [loan, setLoan] = useState({
    principalAmount: "",
    repaymentType: "installment",   // "installment" (EMI) | "interest_only"
    interestRate: "2",
    durationMonths: "",
  });
  const [preview, setPreview] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleLoanChange = (e) => setLoan({ ...loan, [e.target.name]: e.target.value });

  // Live EMI / interest-only preview
  useEffect(() => {
    if (isEdit) return;
    const p = parseFloat(loan.principalAmount);
    const r = parseFloat(loan.interestRate);
    const d = parseInt(loan.durationMonths);
    if (p > 0 && r >= 0 && d > 0) {
      const totalInterest = (p * r * d) / 100;           // flat rate
      const totalRepayable = p + totalInterest;
      const monthlyAmount = loan.repaymentType === "interest_only"
        ? (p * r) / 100
        : totalRepayable / d;
      setPreview({
        totalInterest: totalInterest.toFixed(2),
        totalRepayable: totalRepayable.toFixed(2),
        monthlyAmount: monthlyAmount.toFixed(2),
      });
    } else {
      setPreview(null);
    }
  }, [loan.principalAmount, loan.interestRate, loan.durationMonths, loan.repaymentType, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isEdit) {
        const { data } = await borrowersAPI.update(initial._id, form);
        onSuccess(data.data);
        return;
      }

      // 1. Create the borrower
      const { data: borrowerRes } = await borrowersAPI.create(form);
      const borrower = borrowerRes.data;

      // 2. Create their opening loan, if loan details were filled in
      if (loan.principalAmount && loan.durationMonths) {
        try {
          await loansAPI.create({
            borrower: borrower._id,
            principalAmount: loan.principalAmount,
            interestRate: loan.interestRate,
            interestType: "flat",
            repaymentType: loan.repaymentType,
            durationMonths: loan.durationMonths,
            startDate: new Date().toISOString().slice(0, 10),
          });
        } catch (loanErr) {
          alert(
            `Borrower saved, but the loan could not be created: ${loanErr.response?.data?.message || "please add it from the Loans page."}`
          );
        }
      }

      onSuccess(borrower);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save borrower");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name *</label>
          <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="John Doe" required />
        </div>
        <div>
          <label className="label">Phone *</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="input" placeholder="+91 98765 43210" required />
        </div>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="input" placeholder="john@example.com" />
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
        <textarea name="address" value={form.address} onChange={handleChange} className="input" rows={2} placeholder="Street, City, State" />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} className="input" rows={2} placeholder="Any additional notes..." />
      </div>

      {/* Loan-at-onboarding — only when creating a new borrower */}
      {!isEdit && (
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Loan Details (optional)</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Loan Amount (₹)</label>
              <input
                name="principalAmount" type="number" min="1" value={loan.principalAmount}
                onChange={handleLoanChange} className="input" placeholder="100000"
              />
            </div>
            <div>
              <label className="label">Duration (Months)</label>
              <input
                name="durationMonths" type="number" min="1" value={loan.durationMonths}
                onChange={handleLoanChange} className="input" placeholder="12"
              />
            </div>
          </div>

          {/* Repayment type toggle */}
          <div className="mt-4">
            <label className="label">Repayment Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLoan({ ...loan, repaymentType: "installment" })}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer
                  ${loan.repaymentType === "installment" ? "bg-indigo-500 border-indigo-500 text-white" : "bg-white border-slate-200 text-gray-600 hover:border-indigo-300"}`}
              >
                EMI Installments
              </button>
              <button
                type="button"
                onClick={() => setLoan({ ...loan, repaymentType: "interest_only" })}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer
                  ${loan.repaymentType === "interest_only" ? "bg-indigo-500 border-indigo-500 text-white" : "bg-white border-slate-200 text-gray-600 hover:border-indigo-300"}`}
              >
                Monthly Interest Only
              </button>
            </div>
          </div>

          {/* Interest rate: dropdown for interest-only, free number for EMI */}
          <div className="mt-4">
            <label className="label">Interest Rate (% / month)</label>
            {loan.repaymentType === "interest_only" ? (
              <select name="interestRate" value={loan.interestRate} onChange={handleLoanChange} className="input">
                {INTEREST_PRESETS.map((r) => <option key={r} value={r}>{r}% / month</option>)}
              </select>
            ) : (
              <input
                name="interestRate" type="number" min="0" step="0.1" value={loan.interestRate}
                onChange={handleLoanChange} className="input" placeholder="2.5"
              />
            )}
          </div>

          {/* Live preview */}
          {preview && (
            <div className="bg-indigo-50 rounded-xl p-4 grid grid-cols-3 gap-3 text-center mt-4">
              <div>
                <p className="text-xs text-slate-500">Total Interest</p>
                <p className="font-bold text-indigo-600 text-sm">{formatCurrency(preview.totalInterest)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Repayable</p>
                <p className="font-bold text-indigo-600 text-sm">{formatCurrency(preview.totalRepayable)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{loan.repaymentType === "interest_only" ? "Monthly Interest" : "EMI / Month"}</p>
                <p className="font-bold text-indigo-600 text-sm">{formatCurrency(preview.monthlyAmount)}</p>
              </div>
            </div>
          )}
          {preview && loan.repaymentType === "interest_only" && (
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mt-2">
              Borrower pays only interest each month. Principal ({formatCurrency(loan.principalAmount)}) is due as a lump sum at the end of the term.
            </p>
          )}
        </div>
      )}

      {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? "Saving..." : isEdit ? "Update Borrower" : "Add Borrower"}
        </button>
      </div>
    </form>
  );
}
