import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, Bell, BookOpen, Image, FileText, Download,
  Plus, Trash2, Edit, Check, X, AlertCircle, ChevronDown, Settings, Save
} from 'lucide-react';
import { supabase, Profile, Notice, Teacher, SiteSetting } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'overview' | 'users' | 'notices' | 'teachers' | 'applications' | 'settings';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-serif font-bold text-navy-900">{value}</p>
        <p className="text-slate-500 text-sm">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { profile: adminProfile } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [users, setUsers] = useState<Profile[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, students: 0, faculty: 0, notices: 0, pending: 0 });

  // Notice form
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', category: 'general', priority: 'medium' });
  const [savingNotice, setSavingNotice] = useState(false);
  const [noticeError, setNoticeError] = useState('');
  const [showNoticeForm, setShowNoticeForm] = useState(false);

  // Teacher form
  const [teacherForm, setTeacherForm] = useState({ full_name: '', qualification: '', address: '', subject_in_charge: '', photo_url: '', is_current: true, bio: '' });
  const [savingTeacher, setSavingTeacher] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);

  // Site settings form
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [usersRes, noticesRes, teachersRes, appsRes, settingsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('notices').select('*').order('created_at', { ascending: false }),
      supabase.from('teachers').select('*').order('display_order'),
      supabase.from('applications').select('*').order('submitted_at', { ascending: false }),
      supabase.from('site_settings').select('*').order('setting_key'),
    ]);
    const u = usersRes.data ?? [];
    const n = noticesRes.data ?? [];
    const t = teachersRes.data ?? [];
    const a = appsRes.data ?? [];
    const s = settingsRes.data ?? [];
    setUsers(u); setNotices(n); setTeachers(t); setApplications(a); setSiteSettings(s);
    setStats({
      users: u.length,
      students: u.filter((x) => x.role === 'student').length,
      faculty: u.filter((x) => x.role === 'faculty').length,
      notices: n.length,
      pending: a.filter((x: any) => x.status === 'pending').length,
    });
    setLoading(false);
  }

  async function updateUserRole(userId: string, role: string) {
    await supabase.from('profiles').update({ role }).eq('id', userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: role as any } : u)));
  }

  async function updateUserYear(userId: string, year: string) {
    await supabase.from('profiles').update({ student_year: year || null }).eq('id', userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, student_year: year as any } : u)));
  }

  async function saveNotice(e: React.FormEvent) {
    e.preventDefault();
    setNoticeError('');
    setSavingNotice(true);
    const { error } = await supabase.from('notices').insert({ ...noticeForm, author_id: adminProfile?.id });
    if (error) { setNoticeError(error.message); setSavingNotice(false); return; }
    setNoticeForm({ title: '', content: '', category: 'general', priority: 'medium' });
    setShowNoticeForm(false);
    setSavingNotice(false);
    loadData();
  }

  async function deleteNotice(id: string) {
    await supabase.from('notices').delete().eq('id', id);
    setNotices((prev) => prev.filter((n) => n.id !== id));
  }

  async function saveTeacher(e: React.FormEvent) {
    e.preventDefault();
    setSavingTeacher(true);
    await supabase.from('teachers').insert(teacherForm);
    setTeacherForm({ full_name: '', qualification: '', address: '', subject_in_charge: '', photo_url: '', is_current: true, bio: '' });
    setShowTeacherForm(false);
    setSavingTeacher(false);
    loadData();
  }

  async function deleteTeacher(id: string) {
    await supabase.from('teachers').delete().eq('id', id);
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  }

  async function updateAppStatus(id: string, status: string) {
    await supabase.from('applications').update({ status, reviewed_by: adminProfile?.id, reviewed_at: new Date().toISOString() }).eq('id', id);
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  async function updateSetting(key: string, value: string) {
    setSavingSettings(true);
    setSettingsError('');
    setSettingsSuccess(false);
    const { error } = await supabase.from('site_settings').update({ setting_value: value }).eq('setting_key', key);
    if (error) {
      setSettingsError(error.message);
    } else {
      setSiteSettings((prev) => prev.map((s) => (s.setting_key === key ? { ...s, setting_value: value } : s)));
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 2000);
    }
    setSavingSettings(false);
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'notices', label: 'Notices', icon: Bell },
    { id: 'teachers', label: 'Faculty', icon: BookOpen },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'settings', label: 'Site Images', icon: Image },
  ];

  return (
    <div className="page-enter min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-navy-950 py-8 px-4">
        <div className="page-container">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 text-gold-400" />
            <div>
              <h1 className="text-2xl font-serif font-bold text-white">Admin Dashboard</h1>
              <p className="text-slate-400 text-sm">Welcome, {adminProfile?.full_name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-6">
        {/* Tab nav */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-6">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                tab === id ? 'bg-navy-800 text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-navy-800'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-navy-200 border-t-navy-800 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === 'overview' && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard label="Total Users" value={stats.users} icon={Users} color="bg-navy-700" />
                <StatCard label="Students" value={stats.students} icon={Users} color="bg-blue-600" />
                <StatCard label="Faculty" value={stats.faculty} icon={BookOpen} color="bg-green-600" />
                <StatCard label="Notices" value={stats.notices} icon={Bell} color="bg-orange-500" />
                <StatCard label="Pending Apps" value={stats.pending} icon={FileText} color="bg-red-600" />
              </div>
            )}

            {/* USERS */}
            {tab === 'users' && (
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h2 className="font-serif font-bold text-navy-900">User Management ({users.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wide">
                      <tr>
                        <th className="px-4 py-3 text-left">Name / Email</th>
                        <th className="px-4 py-3 text-left">Role</th>
                        <th className="px-4 py-3 text-left">Student Year</th>
                        <th className="px-4 py-3 text-left">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-navy-900">{u.full_name ?? '—'}</p>
                            <p className="text-slate-400 text-xs">{u.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={u.role}
                              onChange={(e) => updateUserRole(u.id, e.target.value)}
                              className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-navy-500 bg-white"
                            >
                              {['standard', 'student', 'faculty', 'admin'].map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            {u.role === 'student' ? (
                              <select
                                value={u.student_year ?? ''}
                                onChange={(e) => updateUserYear(u.id, e.target.value)}
                                className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-navy-500 bg-white"
                              >
                                <option value="">Not set</option>
                                <option value="1st_year">1st Year</option>
                                <option value="2nd_year">2nd Year</option>
                                <option value="final_year">Final Year</option>
                              </select>
                            ) : <span className="text-slate-400 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* NOTICES */}
            {tab === 'notices' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button onClick={() => setShowNoticeForm(!showNoticeForm)} className="btn-primary">
                    <Plus className="w-4 h-4" /> Add Notice
                  </button>
                </div>

                {showNoticeForm && (
                  <div className="card p-6">
                    <h3 className="font-semibold text-navy-900 mb-4">New Notice</h3>
                    {noticeError && <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 text-red-700 text-sm"><AlertCircle className="w-4 h-4 mt-0.5" />{noticeError}</div>}
                    <form onSubmit={saveNotice} className="space-y-3">
                      <input value={noticeForm.title} onChange={(e) => setNoticeForm((f) => ({ ...f, title: e.target.value }))} className="input-field" placeholder="Notice title" required />
                      <textarea value={noticeForm.content} onChange={(e) => setNoticeForm((f) => ({ ...f, content: e.target.value }))} rows={3} className="input-field resize-none" placeholder="Notice content" required />
                      <div className="grid grid-cols-2 gap-3">
                        <select value={noticeForm.category} onChange={(e) => setNoticeForm((f) => ({ ...f, category: e.target.value }))} className="input-field">
                          {['general', 'academic', 'event', 'urgent', 'financial'].map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={noticeForm.priority} onChange={(e) => setNoticeForm((f) => ({ ...f, priority: e.target.value }))} className="input-field">
                          {['low', 'medium', 'high'].map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" disabled={savingNotice} className="btn-primary">{savingNotice ? 'Saving...' : 'Save Notice'}</button>
                        <button type="button" onClick={() => setShowNoticeForm(false)} className="btn-secondary">Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wide">
                        <tr>
                          <th className="px-4 py-3 text-left">Title</th>
                          <th className="px-4 py-3 text-left">Category</th>
                          <th className="px-4 py-3 text-left">Priority</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {notices.map((n) => (
                          <tr key={n.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-navy-900 max-w-xs truncate">{n.title}</td>
                            <td className="px-4 py-3 text-slate-600 capitalize">{n.category}</td>
                            <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${n.priority === 'high' ? 'bg-red-100 text-red-700' : n.priority === 'medium' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{n.priority}</span></td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{new Date(n.created_at).toLocaleDateString('en-IN')}</td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => deleteNotice(n.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TEACHERS */}
            {tab === 'teachers' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button onClick={() => setShowTeacherForm(!showTeacherForm)} className="btn-primary">
                    <Plus className="w-4 h-4" /> Add Faculty
                  </button>
                </div>

                {showTeacherForm && (
                  <div className="card p-6">
                    <h3 className="font-semibold text-navy-900 mb-4">New Faculty Member</h3>
                    <form onSubmit={saveTeacher} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input value={teacherForm.full_name} onChange={(e) => setTeacherForm((f) => ({ ...f, full_name: e.target.value }))} className="input-field" placeholder="Full Name *" required />
                      <input value={teacherForm.qualification} onChange={(e) => setTeacherForm((f) => ({ ...f, qualification: e.target.value }))} className="input-field" placeholder="Qualification (e.g., Ph.D., Th.M.)" />
                      <input value={teacherForm.address} onChange={(e) => setTeacherForm((f) => ({ ...f, address: e.target.value }))} className="input-field" placeholder="Address" />
                      <input value={teacherForm.subject_in_charge} onChange={(e) => setTeacherForm((f) => ({ ...f, subject_in_charge: e.target.value }))} className="input-field" placeholder="Subject In Charge" />
                      <input value={teacherForm.photo_url} onChange={(e) => setTeacherForm((f) => ({ ...f, photo_url: e.target.value }))} className="input-field" placeholder="Photo URL (optional)" />
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="is_current" checked={teacherForm.is_current} onChange={(e) => setTeacherForm((f) => ({ ...f, is_current: e.target.checked }))} className="rounded" />
                        <label htmlFor="is_current" className="text-sm text-slate-700">Current Faculty</label>
                      </div>
                      <textarea value={teacherForm.bio} onChange={(e) => setTeacherForm((f) => ({ ...f, bio: e.target.value }))} rows={2} className="input-field resize-none sm:col-span-2" placeholder="Short bio (optional)" />
                      <div className="sm:col-span-2 flex gap-2">
                        <button type="submit" disabled={savingTeacher} className="btn-primary">{savingTeacher ? 'Saving...' : 'Save Faculty'}</button>
                        <button type="button" onClick={() => setShowTeacherForm(false)} className="btn-secondary">Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wide">
                        <tr>
                          <th className="px-4 py-3 text-left">Name</th>
                          <th className="px-4 py-3 text-left">Qualification</th>
                          <th className="px-4 py-3 text-left">Subject</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {teachers.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-navy-900">{t.full_name}</td>
                            <td className="px-4 py-3 text-slate-600">{t.qualification ?? '—'}</td>
                            <td className="px-4 py-3 text-slate-600">{t.subject_in_charge ?? '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${t.is_current ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                {t.is_current ? 'Current' : 'Former'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => deleteTeacher(t.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* APPLICATIONS */}
            {tab === 'applications' && (
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h2 className="font-serif font-bold text-navy-900">Admission Applications ({applications.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wide">
                      <tr>
                        <th className="px-4 py-3 text-left">Applicant</th>
                        <th className="px-4 py-3 text-left">Program</th>
                        <th className="px-4 py-3 text-left">Church</th>
                        <th className="px-4 py-3 text-left">Submitted</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {applications.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-navy-900">{a.full_name}</p>
                            <p className="text-slate-400 text-xs">{a.email}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{a.applying_for ?? '—'}</td>
                          <td className="px-4 py-3 text-slate-600">{a.church_name ?? '—'}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{new Date(a.submitted_at).toLocaleDateString('en-IN')}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              a.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              a.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              a.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>{a.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {a.status === 'pending' && (
                                <>
                                  <button onClick={() => updateAppStatus(a.id, 'accepted')} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Accept"><Check className="w-4 h-4" /></button>
                                  <button onClick={() => updateAppStatus(a.id, 'reviewed')} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Mark Reviewed"><Edit className="w-4 h-4" /></button>
                                  <button onClick={() => updateAppStatus(a.id, 'rejected')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject"><X className="w-4 h-4" /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SITE SETTINGS */}
            {tab === 'settings' && (
              <div className="space-y-4">
                <div className="card p-6">
                  <h2 className="font-serif font-bold text-navy-900 text-lg mb-2">Site Image Settings</h2>
                  <p className="text-slate-500 text-sm mb-4">Update images displayed on the Home and About pages. Enter full image URLs (e.g., from Pexels, Unsplash, or your own hosting).</p>

                  {settingsError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4 mt-0.5" />{settingsError}
                    </div>
                  )}
                  {settingsSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4 text-green-700 text-sm">
                      <Check className="w-4 h-4" />Image updated successfully!
                    </div>
                  )}

                  <div className="space-y-6">
                    {siteSettings.map((setting) => (
                      <div key={setting.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-32 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={setting.setting_value}
                              alt={setting.description || setting.setting_key}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128x96?text=Invalid+URL';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-navy-900 mb-1">
                              {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </label>
                            <p className="text-xs text-slate-500 mb-2">{setting.description}</p>
                            <div className="flex gap-2">
                              <input
                                type="url"
                                value={setting.setting_value}
                                onChange={(e) => {
                                  setSiteSettings((prev) =>
                                    prev.map((s) =>
                                      s.setting_key === setting.setting_key
                                        ? { ...s, setting_value: e.target.value }
                                        : s
                                    )
                                  );
                                }}
                                className="input-field text-sm flex-1"
                                placeholder="https://example.com/image.jpg"
                              />
                              <button
                                onClick={() => updateSetting(setting.setting_key, setting.setting_value)}
                                disabled={savingSettings}
                                className="btn-primary text-sm px-4"
                              >
                                {savingSettings ? 'Saving...' : 'Save'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
