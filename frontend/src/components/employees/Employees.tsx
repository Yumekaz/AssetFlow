import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Shield, Mail, CheckCircle, Search, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  departmentId: string | null;
  department?: {
    id: string;
    name: string;
  };
}

interface Department {
  id: string;
  name: string;
}

export const Employees: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchEmployeesAndDepts = async () => {
    try {
      setLoading(true);
      const [empRes, deptRes] = await Promise.all([
        axios.get('/api/employees'),
        axios.get('/api/departments')
      ]);
      if (Array.isArray(empRes.data)) setEmployees(empRes.data);
      if (Array.isArray(deptRes.data)) setDepartments(deptRes.data);
    } catch (err) {
      console.error('Error fetching employee directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesAndDepts();
  }, []);

  const handleRoleChange = async (employeeId: string, newRole: string) => {
    setActionLoading(employeeId);
    try {
      await axios.put(`/api/employees/${employeeId}/role`, { role: newRole });
      setEmployees(prev =>
        prev.map(emp => (emp.id === employeeId ? { ...emp, role: newRole } : emp))
      );
    } catch (err) {
      alert('Failed to promote/demote employee. Verify you have Admin rights.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDepartmentChange = async (employeeId: string, deptId: string) => {
    setActionLoading(employeeId);
    try {
      await axios.put(`/api/employees/${employeeId}/department`, { departmentId: deptId || null });
      const matchedDept = departments.find(d => d.id === deptId);
      setEmployees(prev =>
        prev.map(emp =>
          emp.id === employeeId
            ? { ...emp, departmentId: deptId || null, department: matchedDept ? { id: deptId, name: matchedDept.name } : undefined }
            : emp
        )
      );
    } catch (err) {
      alert('Failed to update employee department.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredEmployees = employees.filter(
    emp =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      (emp.department?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="p-10 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-white/60 mb-4 tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
            Directory Management
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-lg">
            Employee <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600 dark:from-brand-400 dark:to-accent-500">Directory</span>
          </h1>
          <p className="text-slate-500 dark:text-white/40 mt-3 text-lg font-medium tracking-wide">
            Promote employee roles, assign departments, and manage credentials organizational-wide.
          </p>
        </div>

        <button
          onClick={fetchEmployeesAndDepts}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all font-semibold shadow-sm text-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Directory
        </button>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" size={20} />
        <input
          type="text"
          placeholder="Search by name, email, or department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 focus:border-brand-500 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 outline-none transition-all shadow-sm"
        />
      </div>

      <div className="rounded-3xl overflow-hidden glass-panel border border-slate-200 dark:border-white/10 shadow-lg bg-white dark:bg-transparent">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-xs uppercase tracking-wider text-slate-500 dark:text-white/50 font-bold">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">System Role</th>
                <th className="px-6 py-4">Status</th>
                {isAdmin && <th className="px-6 py-4 text-right">Administrative Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="animate-spin text-brand-500" size={32} />
                      <p className="text-slate-400 dark:text-white/40 font-medium">Loading employee directory...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-20 text-center text-slate-400 dark:text-white/40 font-medium">
                    No employees found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => (
                  <tr key={emp.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 rounded-xl">
                          <User size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">{emp.name}</span>
                          <span className="text-xs text-slate-500 dark:text-white/40 flex items-center gap-1 mt-0.5">
                            <Mail size={12} /> {emp.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-white/80">
                      {isAdmin ? (
                        <select
                          value={emp.departmentId || ''}
                          onChange={e => handleDepartmentChange(emp.id, e.target.value)}
                          disabled={actionLoading === emp.id}
                          className="bg-slate-100 dark:bg-white/5 border border-transparent dark:border-white/5 focus:border-brand-500 rounded-xl px-2 py-1 text-sm outline-none"
                        >
                          <option value="">Unassigned</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                        </select>
                      ) : (
                        emp.department?.name || 'Unassigned'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Shield size={16} className="text-brand-500" />
                        {isAdmin ? (
                          <select
                            value={emp.role}
                            onChange={e => handleRoleChange(emp.id, e.target.value)}
                            disabled={actionLoading === emp.id}
                            className="bg-slate-100 dark:bg-white/5 border border-transparent dark:border-white/5 focus:border-brand-500 rounded-xl px-2 py-1 text-sm outline-none font-semibold text-slate-800 dark:text-white"
                          >
                            <option value="Employee">Employee</option>
                            <option value="Department Head">Department Head</option>
                            <option value="Asset Manager">Asset Manager</option>
                            <option value="Admin">Admin</option>
                          </select>
                        ) : (
                          <span className="font-semibold text-slate-800 dark:text-white">{emp.role}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                        <CheckCircle size={16} />
                        Active
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs text-slate-400 dark:text-white/30 italic">
                          Promotions active
                        </span>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
