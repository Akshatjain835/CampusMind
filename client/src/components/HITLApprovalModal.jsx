import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, AlertCircle, Award } from 'lucide-react';

const HITLApprovalModal = ({ isOpen, onClose, approvalContext, onApprove, onReject }) => {
  if (!isOpen || !approvalContext) return null;

  const role = approvalContext.approver_role || 'HOD';
  const query = approvalContext.query || 'Administrative Operation Request';
  const reason = approvalContext.reason || 'High-impact policy operation requiring administrative sanction.';

  const roleColors = {
    HOD: 'from-amber-600 to-orange-600',
    FACULTY: 'from-blue-600 to-indigo-600',
    REGISTRAR: 'from-purple-600 to-pink-600'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${roleColors[role] || 'from-indigo-600 to-purple-600'} text-white`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-white/80">Human-In-The-Loop Governance</span>
              <h2 className="text-xl font-bold">{role} Sanction Required</h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-slate-200">
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span>INTERRUPTED GRAPH TASK</span>
            </div>
            <p className="text-sm font-medium text-slate-100 italic">"{query}"</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>SANCTION AUTHORITY REASONING</span>
            </div>
            <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              {reason}
            </p>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Agent Graph execution is currently paused awaiting your decision.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onReject}
            className="px-4 py-2.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/50 hover:bg-rose-900/80 border border-rose-800/60 rounded-xl transition flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Reject Request
          </button>
          <button
            onClick={onApprove}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve & Resume Graph
          </button>
        </div>
      </div>
    </div>
  );
};

export default HITLApprovalModal;
