"use client";
import { useEffect, useState } from "react";
import { HandCoins, Users, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { dashboardAPI } from "@/lib/api";
import { formatCurrency, formatDate, monthName } from "@/lib/utils";
import { StatCard, Spinner, StatusBadge, PageHeader } from "@/components/ui/index";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get()
      .then((r) => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <p className="text-slate-500">Failed to load dashboard.</p>;

  const { stats, recentRepayments, monthlyData } = data;

  const chartData = monthlyData.map((m) => ({
    name: `${monthName(m._id.month)} ${m._id.year}`,
    collected: m.totalCollected,
  }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back! Here's your lending overview.`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Principal Lent" value={formatCurrency(stats.totalPrincipal)} icon={HandCoins} color="blue" sub={`${stats.activeLoans} active loans`} />
        <StatCard title="Interest Earned" value={formatCurrency(stats.totalInterestEarned)} icon={TrendingUp} color="green" sub="from repayments" />
        <StatCard title="Outstanding Amount" value={formatCurrency(stats.totalOutstanding)} icon={Clock} color="orange" sub="to be collected" />
        <StatCard title="Total Borrowers" value={stats.totalBorrowers} icon={Users} color="blue" sub={`${stats.closedLoans} loans closed`} />
      </div>

      {/* Loan Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{stats.activeLoans}</p>
          <p className="text-sm text-slate-500 mt-1">Active Loans</p>
        </div>
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-orange-500">{stats.overdueLoans}</p>
          <p className="text-sm text-slate-500 mt-1">Overdue Loans</p>
        </div>
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-slate-500">{stats.closedLoans}</p>
          <p className="text-sm text-slate-500 mt-1">Closed Loans</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Collections Chart */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">Monthly Collections (Last 6 Months)</h2>
          {chartData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No repayments yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="collected" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Repayments */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">Recent Repayments</h2>
          {recentRepayments.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No repayments recorded yet</p>
          ) : (
            <div className="space-y-3">
              {recentRepayments.map((r) => (
                <div key={r._id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{r.borrower?.name}</p>
                      <p className="text-xs text-slate-400">{formatDate(r.paymentDate)}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-green-600">{formatCurrency(r.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
