import React, { useRef } from 'react';
import { useFetch } from '../hooks';
import { resumeAPI } from '../utils/api';
import { PageHeader, PageSpinner } from '../components/common';
import { formatDate } from '../utils/helpers';

// ── Print styles injected globally for resume ─────────────────────────────────
const PRINT_STYLES = `
  @media print {
    body > * { display: none !important; }
    #resume-root { display: block !important; }
    #resume-root .no-print { display: none !important; }
    #resume-root { margin: 0; padding: 0; }
  }
`;

// ── Resume Document component (renders clean printable resume) ────────────────
const ResumeDocument = ({ data }) => {
  const { personalInfo: p, skills, bio, codingStats, codingProfiles, participations, totalPoints, badges } = data;

  return (
    <div id="resume-root" className="bg-white text-slate-900 font-body max-w-[794px] mx-auto shadow-2xl"
      style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '1122px', padding: '48px 56px' }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900 mb-6">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px', fontFamily: "'Space Grotesk', sans-serif" }}>
            {p.name}
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
            {p.department} Engineering · Year {p.year}
            {p.rollNumber && ` · ${p.rollNumber}`}
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#64748b', lineHeight: '1.7' }}>
          {p.email    && <div>✉ {p.email}</div>}
          {p.phone    && <div>📞 {p.phone}</div>}
          {p.linkedIn && <div>🔗 {p.linkedIn}</div>}
          {p.github   && <div>🐙 {p.github}</div>}
          {p.portfolio && <div>🌐 {p.portfolio}</div>}
        </div>
      </div>

      {/* ── Summary ──────────────────────────────────────────────────────── */}
      {bio && (
        <Section title="About">
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>{bio}</p>
        </Section>
      )}

      {/* ── Skills ───────────────────────────────────────────────────────── */}
      {skills?.length > 0 && (
        <Section title="Technical Skills">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {skills.map(s => (
              <span key={s} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px',
                padding: '2px 10px', fontSize: '12px', color: '#334155', fontWeight: 500 }}>
                {s}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* ── Coding Profiles ──────────────────────────────────────────────── */}
      {(codingStats?.leetcode?.totalSolved > 0 || codingStats?.codechef?.rating > 0) && (
        <Section title="Competitive Programming">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {codingStats?.leetcode?.totalSolved > 0 && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>
                  🟡 LeetCode{codingProfiles?.leetcode && ` · @${codingProfiles.leetcode}`}
                </div>
                <div style={{ fontSize: '12px', color: '#78350f' }}>
                  {codingStats.leetcode.totalSolved} problems solved
                  {codingStats.leetcode.contestRating > 0 && ` · Rating: ${codingStats.leetcode.contestRating}`}
                  {codingStats.leetcode.ranking > 0 && ` · Rank: #${codingStats.leetcode.ranking?.toLocaleString()}`}
                </div>
              </div>
            )}
            {codingStats?.codechef?.rating > 0 && (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#9a3412', marginBottom: '4px' }}>
                  🍴 CodeChef{codingProfiles?.codechef && ` · @${codingProfiles.codechef}`}
                </div>
                <div style={{ fontSize: '12px', color: '#7c2d12' }}>
                  Rating: {codingStats.codechef.rating} {codingStats.codechef.stars && `(${codingStats.codechef.stars})`}
                  {codingStats.codechef.problemsSolved > 0 && ` · ${codingStats.codechef.problemsSolved} problems`}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ── Event Participation ───────────────────────────────────────────── */}
      {participations?.length > 0 && (
        <Section title="Events & Activities">
          {participations.slice(0, 8).map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{p.eventTitle}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  {p.category?.charAt(0).toUpperCase() + p.category?.slice(1)} Event
                  {p.position && ` · ${p.position}`}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                {p.date && formatDate(p.date)}
                {p.pointsEarned > 0 && <div style={{ color: '#f59e0b', fontWeight: 600 }}>+{p.pointsEarned} pts</div>}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* ── Achievements ─────────────────────────────────────────────────── */}
      {(badges?.length > 0 || totalPoints > 0) && (
        <Section title="Achievements">
          <div style={{ fontSize: '13px', color: '#475569' }}>
            {totalPoints > 0 && <span>🏆 Total Points: <strong>{totalPoints}</strong>  &nbsp;</span>}
            {badges?.map((b, i) => <span key={i}>{b.icon || '🏅'} {b.name}  &nbsp;</span>)}
          </div>
        </Section>
      )}

      {/* Footer */}
      <div style={{ marginTop: '40px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', textAlign: 'center',
        fontSize: '10px', color: '#cbd5e1' }}>
        Generated by 4U App · {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '20px' }}>
    <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
      color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '10px',
      fontFamily: "'Space Grotesk', sans-serif" }}>
      {title}
    </h2>
    {children}
  </div>
);

export const ResumePage = () => {
  const { data, loading } = useFetch(() => resumeAPI.getData());
  const printRef = useRef();

  const handlePrint = () => {
    const style = document.createElement('style');
    style.textContent = PRINT_STYLES;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.head.removeChild(style), 1000);
  };

  return (
    <div>
      <style>{PRINT_STYLES}</style>
      <div className="no-print">
        <PageHeader
          title="Resume Builder"
          subtitle="Auto-generated from your 4U App profile"
          action={
            <div className="flex gap-2">
              <button onClick={handlePrint} className="btn-primary">
                🖨️ Print / Save as PDF
              </button>
            </div>
          }
        />

        <div className="no-print mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          💡 <strong>Tip:</strong> Click "Print / Save as PDF" → in the print dialog, choose "Save as PDF" as destination.
          Update your profile to add more details to the resume.
        </div>
      </div>

      {loading ? <PageSpinner /> : data?.resumeData ? (
        <ResumeDocument data={data.resumeData} />
      ) : (
        <div className="text-center py-20 text-slate-400">No data available</div>
      )}
    </div>
  );
};
