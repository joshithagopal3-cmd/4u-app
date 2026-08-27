import React, { useState } from 'react';
import { useFetch } from '../hooks';
import { registrationsAPI } from '../utils/api';
import { PageHeader, PageSpinner, EmptyState, Modal, Avatar, Alert } from '../components/common';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const OverrideCard = ({ reg, onDecision }) => {
  const [rejectModal, setRejectModal] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const decide = async (decision, rejectionNote = '') => {
    setLoading(true);
    try {
      await onDecision(reg._id, decision, rejectionNote);
    } finally {
      setLoading(false);
      setRejectModal(false);
    }
  };

  return (
    <>
      <div className="card p-5 animate-in">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Student info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar name={reg.student?.name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-slate-900">{reg.student?.name}</h3>
                <span className="badge-blue text-[10px]">{reg.student?.department}</span>
                <span className="badge-gray text-[10px]">Year {reg.student?.year}</span>
                {reg.student?.rollNumber && (
                  <span className="text-xs text-slate-400 font-mono">{reg.student.rollNumber}</span>
                )}
              </div>
              <p className="text-xs text-slate-400">{reg.student?.email}</p>
            </div>
          </div>

          {/* Request date */}
          <div className="text-xs text-slate-400 flex-shrink-0">
            {formatDate(reg.createdAt)}
          </div>
        </div>

        {/* Event info */}
        <div className="mt-3 p-3 bg-slate-50 rounded-xl">
          <div className="flex items-start gap-2">
            <span className="text-base">📅</span>
            <div>
              <p className="text-sm font-semibold text-slate-800">{reg.event?.title}</p>
              <p className="text-xs text-slate-400">{reg.event?.date && formatDate(reg.event.date)}</p>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs font-semibold text-amber-700 mb-1">Student's reason:</p>
          <p className="text-sm text-amber-800 leading-relaxed">"{reg.attendAnywayReason}"</p>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => decide('approved')}
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? '…' : '✓ Approve'}
          </button>
          <button
            onClick={() => setRejectModal(true)}
            disabled={loading}
            className="btn-danger flex-1"
          >
            ✗ Reject
          </button>
        </div>
      </div>

      {/* Reject modal */}
      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} title="Reject Request">
        <div className="space-y-4">
          <Alert type="warning">
            You're about to reject {reg.student?.name}'s request to attend <strong>{reg.event?.title}</strong>.
          </Alert>
          <div>
            <label className="label">Reason for rejection (optional)</label>
            <textarea
              className="textarea h-24"
              placeholder="Explain why the request was rejected…"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setRejectModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={() => decide('rejected', note)} className="btn-danger flex-1" disabled={loading}>
              {loading ? '…' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export const OverridesPage = () => {
  const { data, loading, refetch } = useFetch(() => registrationsAPI.getPendingOverrides());

  const handleDecision = async (id, decision, note) => {
    try {
      await registrationsAPI.reviewOverride(id, { decision, note });
      toast.success(`Request ${decision} successfully`);
      refetch();
    } catch {
      toast.error('Failed to process request');
    }
  };

  const regs = data?.registrations || [];

  return (
    <div>
      <PageHeader
        title="Attend-Anyway Requests"
        subtitle="Review students requesting access to events outside their eligibility"
      />

      {regs.length > 0 && (
        <div className="mb-6">
          <Alert type="warning">
            You have <strong>{regs.length}</strong> pending request{regs.length !== 1 ? 's' : ''} awaiting review.
          </Alert>
        </div>
      )}

      {loading ? <PageSpinner /> : regs.length === 0 ? (
        <EmptyState
          icon="✅"
          title="All caught up!"
          subtitle="No pending attendance override requests."
        />
      ) : (
        <div className="space-y-4">
          {regs.map(reg => (
            <OverrideCard key={reg._id} reg={reg} onDecision={handleDecision} />
          ))}
        </div>
      )}
    </div>
  );
};
