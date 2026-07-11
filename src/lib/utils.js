export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const formatPercent = (val) => `${val}%`;

export const statusColor = (status) => {
  const map = {
    active: "bg-green-100 text-green-700",
    closed: "bg-slate-100 text-slate-600",
    defaulted: "bg-red-100 text-red-700",
    overdue: "bg-orange-100 text-orange-700",
  };
  return map[status] || "bg-slate-100 text-slate-600";
};

export const monthName = (m) =>
  ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m - 1];
