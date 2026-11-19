import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Activity,
  Layers,
  Package,
  ShoppingBag,
  CreditCard,
  Warehouse,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminActivityLog } from '../../types';

export const AdminActivityLogs: React.FC = () => {
  const { activityLogs, authUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedDateRange, setSelectedDateRange] = useState<'ALL' | 'TODAY' | '7DAYS' | '30DAYS'>('ALL');
  const [selectedLog, setSelectedLog] = useState<AdminActivityLog | null>(null);

  const modules = [
    'ALL',
    'Products',
    'Categories',
    'Subcategories',
    'Brands',
    'Orders',
    'Inventory',
    'Payments',
    'Coupons',
    'Banners',
    'Settings',
    'Auth',
    'Shipping',
  ];

  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      // Module filter
      if (selectedModule !== 'ALL' && log.module !== selectedModule) {
        return false;
      }

      // Date range filter
      if (selectedDateRange !== 'ALL') {
        const logTime = new Date(log.timestamp).getTime();
        const now = Date.now();
        if (selectedDateRange === 'TODAY') {
          const oneDayAgo = now - 24 * 60 * 60 * 1000;
          if (logTime < oneDayAgo) return false;
        } else if (selectedDateRange === '7DAYS') {
          const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
          if (logTime < sevenDaysAgo) return false;
        } else if (selectedDateRange === '30DAYS') {
          const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
          if (logTime < thirtyDaysAgo) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAction = log.action.toLowerCase().includes(q);
        const matchDesc = log.description?.toLowerCase().includes(q);
        const matchActor = log.actorName?.toLowerCase().includes(q) || log.actorEmail?.toLowerCase().includes(q);
        const matchRecord = log.recordName?.toLowerCase().includes(q) || log.recordId?.toLowerCase().includes(q);
        if (!matchAction && !matchDesc && !matchActor && !matchRecord) return false;
      }

      return true;
    });
  }, [activityLogs, selectedModule, selectedDateRange, searchQuery]);

  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = [
      'Timestamp',
      'Admin Name',
      'Admin Email',
      'Module',
      'Action',
      'Record Name / ID',
      'Description',
    ];
    const rows = filteredLogs.map((l) => [
      new Date(l.timestamp).toLocaleString('en-IN'),
      `"${l.actorName || ''}"`,
      `"${l.actorEmail || ''}"`,
      `"${l.module || ''}"`,
      `"${l.action || ''}"`,
      `"${l.recordName || l.recordId || ''}"`,
      `"${(l.description || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `admin_activity_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getModuleBadgeColor = (mod: string) => {
    switch (mod) {
      case 'Products':
        return 'bg-orange-100 text-[#FF6A00] border-orange-200';
      case 'Orders':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Inventory':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Payments':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Categories':
      case 'Subcategories':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Auth':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-[11px] font-bold mb-1.5 border border-red-100">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Audit Trail & Security Events</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Administrative Activity Logs
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Cryptographically linked tamper-evident audit trail of all store administrative changes.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          disabled={filteredLogs.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Logs (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search action, administrator, record or description..."
              className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0 hidden sm:block" />
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value as any)}
              className="text-xs py-2 px-3 rounded-xl border border-gray-200 bg-white font-semibold text-gray-700 focus:outline-none"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today (Past 24h)</option>
              <option value="7DAYS">Past 7 Days</option>
              <option value="30DAYS">Past 30 Days</option>
            </select>
          </div>
        </div>

        {/* Module Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-gray-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Module:</span>
          </span>
          {modules.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedModule(m)}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-colors ${
                selectedModule === m
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Record Name / ID</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-gray-700">No administrative activity logs found.</p>
                    <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto">
                      All administrative changes to products, orders, inventory, settings, and categories are automatically recorded in real time.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono text-gray-900 font-bold">
                        {new Date(log.timestamp).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900">{log.actorName || 'Admin'}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{log.actorEmail}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getModuleBadgeColor(
                          log.module
                        )}`}
                      >
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-medium">
                      {log.recordName || log.recordId || '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-[280px] truncate" title={log.description}>
                      {log.description}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6A00]">
                  Log Entry Details
                </span>
                <h3 className="font-bold text-base text-gray-900">{selectedLog.action}</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-2xl">
                <div>
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Administrator</span>
                  <p className="font-bold text-gray-900">{selectedLog.actorName}</p>
                  <p className="text-gray-500 text-[11px]">{selectedLog.actorEmail}</p>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Timestamp</span>
                  <p className="font-bold text-gray-900">{new Date(selectedLog.timestamp).toLocaleString('en-IN')}</p>
                  <span className="text-[10px] text-gray-400 font-mono">ID: {selectedLog.id}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px] font-bold uppercase mb-1">Description</span>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-xl leading-relaxed">{selectedLog.description}</p>
              </div>

              {selectedLog.previousValue && (
                <div>
                  <span className="text-gray-400 block text-[10px] font-bold uppercase mb-1">Previous State</span>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded-xl overflow-x-auto text-[11px] font-mono">
                    {typeof selectedLog.previousValue === 'object'
                      ? JSON.stringify(selectedLog.previousValue, null, 2)
                      : String(selectedLog.previousValue)}
                  </pre>
                </div>
              )}

              {selectedLog.newValue && (
                <div>
                  <span className="text-gray-400 block text-[10px] font-bold uppercase mb-1">New / Updated State</span>
                  <pre className="bg-gray-900 text-amber-300 p-3 rounded-xl overflow-x-auto text-[11px] font-mono">
                    {typeof selectedLog.newValue === 'object'
                      ? JSON.stringify(selectedLog.newValue, null, 2)
                      : String(selectedLog.newValue)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
