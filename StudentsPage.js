import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks';
import { usersAPI } from '../utils/api';
import { PageHeader, PageSpinner, SelectFilter, EmptyState, Avatar } from '../components/common';
import { getPointsTier, DEPARTMENTS, YEARS } from '../utils/helpers';
import { useDebounce } from '../hooks';

export const StudentsPage = () => {
  const [search, setSearch] = useState('');
  const [dept, setDept]     = useState('');
  const [year, setYear]     = useState('');
  const [page, setPage]     = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const { data, loading } = useFetch(
    () => usersAPI.getStudents({ search: debouncedSearch, department: dept, year, page, limit: 20 }),
    [debouncedSearch, dept, year, page]
  );

  const students = data?.students || [];
  const totalPages = data?.pages || 1;

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${data?.total || 0} students found`}
      />

      {/* Search + filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center">
        <input
          className="input max-w-xs" placeholder="🔍 Search by name, email, roll no…"
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <SelectFilter value={dept} onChange={(v) => { setDept(v); setPage(1); }}
          options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
          placeholder="All Departments" className="w-44" />
        <SelectFilter value={year} onChange={(v) => { setYear(v); setPage(1); }}
          options={YEARS.map(y => ({ value: y, label: `Year ${y}` }))}
          placeholder="All Years" className="w-32" />
        {(search || dept || year) && (
          <button onClick={() => { setSearch(''); setDept(''); setYear(''); setPage(1); }}
            className="btn-ghost btn-sm text-red-500">× Clear</button>
        )}
      </div>

      {loading ? <PageSpinner /> : students.length === 0 ? (
        <EmptyState icon="👥" title="No students found" subtitle="Try different search terms or filters" />
      ) : (
        <>
          <div className="card overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Student', 'Roll No.', 'Dept', 'Year', 'Section', 'Points', 'LC Solved', 'Skills', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map(s => {
                  const tier = getPointsTier(s.points);
                  return (
                    <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={s.name} size="sm" />
                          <div>
                            <Link to={`/users/${s._id}/profile`}
                              className="font-semibold text-slate-800 hover:text-primary-700 transition-colors">
                              {s.name}
                            </Link>
                            <p className="text-xs text-slate-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{s.rollNumber || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="badge-blue">{s.department}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">Y{s.year}</td>
                      <td className="px-4 py-3 text-slate-500">{s.section || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-sm ${tier.color}`}>{s.points}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {s.codingStats?.leetcode?.totalSolved || 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(s.skills || []).slice(0, 2).map(skill => (
                            <span key={skill} className="badge-gray text-[10px]">{skill}</span>
                          ))}
                          {(s.skills || []).length > 2 && (
                            <span className="text-[10px] text-slate-400">+{s.skills.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/users/${s._id}/profile`} className="btn-ghost btn-sm">View</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="btn-secondary btn-sm disabled:opacity-40">← Prev</button>
              <span className="text-sm text-slate-500 px-3">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                className="btn-secondary btn-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
