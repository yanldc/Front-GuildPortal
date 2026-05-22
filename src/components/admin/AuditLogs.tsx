import React from 'react';
import { Activity, Sword, Shield } from 'lucide-react';
import { PointTransaction } from '../../types';

interface AuditLogsProps {
  transactions: PointTransaction[];
}

export default function AuditLogs({ transactions }: AuditLogsProps) {
  const isAuctionTransaction = (t: PointTransaction) => {
    const r = t.reason.toLowerCase();
    return r.includes('bid') || r.includes('outbid') || r.includes('auction') || r.includes('leilão') || r.includes('lance') || r.includes('arremate') || r.includes('refund') || r.includes('item:');
  };

  const auctionTxs = [...transactions].reverse().filter(isAuctionTransaction);
  const adminTxs = [...transactions].reverse().filter(t => !isAuctionTransaction(t));

  const renderTable = (txs: PointTransaction[], emptyMsg: string) => (
    <div className="flex-1 overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#0b0e15]/50 border-b border-slate-800/80 font-mono text-[9px] text-slate-500 uppercase tracking-widest">
            <th className="py-2.5 px-3">Player</th>
            <th className="py-2.5 px-3">GP Amount</th>
            <th className="py-2.5 px-3">Reason</th>
            <th className="py-2.5 px-3 text-right">Date / Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40 text-[11px] leading-relaxed">
          {txs.length === 0 ? (
            <tr><td colSpan={4} className="py-12 text-center text-slate-600 font-mono uppercase text-[9.5px]">{emptyMsg}</td></tr>
          ) : (
            txs.map((t) => (
              <tr key={t.id} className="hover:bg-slate-900/10">
                <td className="py-2.5 px-3 font-semibold text-slate-350">{t.memberName}</td>
                <td className={`py-2.5 px-3 font-mono font-extrabold ${t.type === 'add' ? 'text-emerald-450' : 'text-red-400'}`}>{t.type === 'add' ? '+' : '-'}{t.amount} GP</td>
                <td className="py-2.5 px-3 text-slate-400 max-w-[150px] truncate" title={t.reason}>{t.reason}</td>
                <td className="py-2.5 px-3 text-right font-mono text-[10px] text-slate-500">{new Date(t.timestamp).toLocaleDateString()} {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-[#0a0c10] border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2"><Activity className="text-cyan-400" size={18} /> GP Audit Ledger</h3>
        <p className="text-slate-400 text-xs mt-1">Full logs auditing distributed clanship resources, manual edits, and active bidding histories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0a0c10] border border-slate-800 rounded-2xl p-5 flex flex-col h-full min-h-[350px]">
          <div className="pb-3 border-b border-slate-800 mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2"><Sword size={14} /> Auction & Bidding Logs</h4>
              <p className="text-slate-500 text-[11px] mt-0.5">Bid expenditures, outbid refunds, and guild item acquisitions.</p>
            </div>
            <span className="text-[10px] bg-cyan-950/40 text-cyan-400 border border-cyan-800/20 px-2 py-0.5 rounded font-mono font-bold">{auctionTxs.length} Total</span>
          </div>
          {renderTable(auctionTxs, 'No auction logs registered.')}
        </div>

        <div className="bg-[#0a0c10] border border-slate-800 rounded-2xl p-5 flex flex-col h-full min-h-[350px]">
          <div className="pb-3 border-b border-slate-800 mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2"><Shield size={14} /> Staff Manual Operations</h4>
              <p className="text-slate-500 text-[11px] mt-0.5">GP rewards, direct alterations, and event attendance credit adjustments.</p>
            </div>
            <span className="text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800/20 px-2 py-0.5 rounded font-mono font-bold">{adminTxs.length} Total</span>
          </div>
          {renderTable(adminTxs, 'No manual operations logged.')}
        </div>
      </div>
    </div>
  );
}
