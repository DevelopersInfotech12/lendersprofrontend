"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { dashboardAPI } from "@/lib/api";
import { formatCurrency, monthName } from "@/lib/utils";
import { PageHeader, Spinner } from "@/components/ui/index";

const PIE_COLORS = ["#6366f1", "#16a34a", "#dc2626", "#d97706"];

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get()
      .then((r) => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <p className="text-slate-500">Failed to load reports.</p>;

  const { stats, monthlyData } = data;

  const chartData = monthlyData.map((m) => ({
    name: `${monthName(m._id.month)} '${String(m._id.year).slice(2)}`,
    collected: m.totalCollected,
    count: m.count,
  }));

  const pieData = [
    { name: "Active Loans", value: stats.activeLoans },
    { name: "Closed Loans", value: stats.closedLoans },
    { name: "Overdue Loans", value: stats.overdueLoans },
  ].filter((d) => d.value > 0);

  const portfolioData = [
    { name: "Amount Lent", value: stats.totalPrincipal },
    { name: "Interest Earned", value: stats.totalInterestEarned },
    { name: "Outstanding", value: stats.totalOutstanding },
  ];

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Overview of your lending portfolio" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {portfolioData.map((item) => (
          <div key={item.name} className="bg-white border border-gray-200/80 rounded-xl p-5 text-center">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{item.name}</p>
            <p className="text-2xl font-bold text-indigo-600 mt-2">{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Collection Trend */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">Monthly Collection Trend</h2>
          {chartData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Line type="monotone" dataKey="collected" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Loan Status Pie */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">Loan Status Distribution</h2>
          {pieData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No loans yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Monthly Table */}
      {chartData.length > 0 && (
        <div className="bg-white border border-gray-200/80 rounded-xl p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">Monthly Breakdown</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs text-slate-400 pb-2 font-medium">Month</th>
                <th className="text-right text-xs text-slate-400 pb-2 font-medium">Collections</th>
                <th className="text-right text-xs text-slate-400 pb-2 font-medium">Transactions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...chartData].reverse().map((row) => (
                <tr key={row.name} className="hover:bg-slate-50">
                  <td className="py-2.5 font-medium text-slate-700">{row.name}</td>
                  <td className="py-2.5 text-right text-green-600 font-semibold">{formatCurrency(row.collected)}</td>
                  <td className="py-2.5 text-right text-slate-500">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
