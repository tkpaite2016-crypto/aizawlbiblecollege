import { useEffect, useState, useRef } from 'react';
import {
  LayoutDashboard, Users, Bell, BookOpen, Image, FileText,
  Plus, Trash2, CreditCard as EditIcon, Check, X, AlertCircle,
  MessageSquare, Upload, Loader, Mail,
} from 'lucide-react';
import { supabase, Profile, Notice, Teacher, SiteSetting, ContactMessage } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'overview' | 'users' | 'notices' | 'teachers' | 'applications' | 'settings' | 'messages';

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
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, students: 0, faculty: 0, notices: 0, pending: 0, unread_messages: 0 });

  // Notice form
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', category: 'general', priority: 'medium' });
  const [savingNotice, setSavingNotice] = useState(false);
  const [noticeError, setNoticeError] = useState('');
  const [showNoticeForm, setShowNoticeForm] = useState(false);

  // Teacher form
  const [teacherForm, setTeacherForm] = useState({ full_name: '', qualification: '', address: '', subject_in_charge: '', photo_url: '', is_current: true, bio: '' });
  const [savingTeacher, setSavingTeacher] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [teacherPhotoUploading, setTeacherPhotoUploading] = useState(false);
  const teacherPhotoRef = useRef<HTMLInputElement>(null);

  // Site settings upload
  const [settingUploading, setSettingUploading] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [usersRes, noticesRes, teachersRes, appsRes, settingsRes, messagesRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('notices').select('*').order('created_at', { ascending: false }),
      supabase.from('teachers').select('*').order('display_order'),
      supabase.from('applications').select('*').order('submitted_at', { ascending: false }),
      supabase.from('site_settings').select('*').order('setting_key'),
      supabase.from('contact_messages').select('*').order('submitted_at', { ascending: false }),
    ]);
    const u = usersRes.data ?? [];
    const n = noticesRes.data ?? [];
    const t = teachersRes.data ?? [];
    const a = appsRes.data ?? [];
    const s = settingsRes.data ?? [];
    const m = messagesRes.data ?? [];
    setUsers(u); setNotices(n); setTeachers(t); setApplications(a); setSiteSettings(s); setContactMessages(m);
    setStats({
      users: u.length,
      students: u.filter((x) => x.role === 'student').length,
      faculty: u.filter((x) => x.role === 'faculty').length,
      notices: n.length,
      pending: a.filter((x: any) => x.status === 'pending').length,
      unread_messages: m.filter((x: any) => !x.is_read).length,
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

  async function uploadTeacherPhoto(file: File): Promise<string | null> {
    setTeacherPhotoUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `teachers/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(fileName, file, { upsert: true });
    if (error) { setTeacherPhotoUploading(false); return null; }
    const { data } = supabase.storage.from('photos').getPublicUrl(fileName);
    setTeacherPhotoUploading(false);
    return data.publicUrl;
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

  async function uploadSiteImage(key: string, file: File) {
    setSettingUploading(key);
    setSettingsError('');
    setSettingsSuccess(false);
    const ext = file.name.split('.').pop();
    const fileName = `${key}_${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from('site-images')
      .upload(fileName, file, { upsert: true });
    if (uploadErr) {
      setSettingsError(uploadErr.message);
      setSettingUploading(null);
      return;
    }
    const { data: urlData } = supabase.storage.from('site-images').getPublicUrl(fileName);
    const { error: dbErr } = await supabase
      .from('site_settings')
      .update({ setting_value: urlData.publicUrl })
      .eq('setting_key', key);
    if (dbErr) {
      setSettingsError(dbErr.message);
    } else {
      setSiteSettings((prev) =>
        prev.map((s) => (s.setting_key === key ? { ...s, setting_value: urlData.publicUrl } : s)),
      );
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    }
    setSettingUploading(null);
  }

  async function markMessageRead(id: string) {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
    setContactMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
    setStats((prev) => ({ ...prev, unread_messages: Math.max(0, prev.unread_messages - 1) }));
  }

  async function deleteMessage(id: string) {
    await supabase.from('contact_messages').delete().eq('id', id);
    const deleted = contactMessages.find((m) => m.id === id);
    setContactMessages((prev) => prev.filter((m) => m.id !== id));
    if (deleted && !deleted.is_read) {
      setStats((prev) => ({ ...prev, unread_messages: Math.max(0, prev.unread_messages - 1) }));
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'notices', label: 'Notices', icon: Bell },
    { id: 'teachers', label: 'Faculty', icon: BookOpen },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'settings', label: 'Site Images', icon: Image },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: stats.unread_messages },
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
          {tabs.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                tab === id ? 'bg-navy-800 text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-navy-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge != null && badge > 0 && (
                <span className="ml-0.5 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center">
                  {badge}
                </span>
              )}
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
                    {noticeError && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5" />{noticeError}
                      </div>
                    )}
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
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${n.priority === 'high' ? 'bg-red-100 text-red-700' : n.priority === 'medium' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {n.priority}
                              </span>
                            </td>
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

                      {/* Photo upload */}
                      <div className="sm:col-span-2">
                        <label className="label mb-1.5 block">Photo (optional)</label>
                        <div className="flex items-center gap-3">
                          {teacherForm.photo_url && (
                            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                              <img src={teacherForm.photo_url} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <label
                            htmlFor="teacher-photo-upload"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${teacherPhotoUploading ? 'bg-slate-100 text-slate-400' : 'bg-navy-800 text-white hover:bg-navy-700'}`}
                          >
                            {teacherPhotoUploading
                              ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</>
                              : <><Upload className="w-4 h-4" /> {teacherForm.photo_url ? 'Change Photo' : 'Upload Photo'}</>
                            }
                          </label>
                          <input
                            id="teacher-photo-upload"
                            ref={teacherPhotoRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const url = await uploadTeacherPhoto(file);
                              if (url) setTeacherForm((f) => ({ ...f, photo_url: url }));
                            }}
                          />
                          {teacherForm.photo_url && (
                            <button
                              type="button"
                              onClick={() => setTeacherForm((f) => ({ ...f, photo_url: '' }))}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="is_current" checked={teacherForm.is_current} onChange={(e) => setTeacherForm((f) => ({ ...f, is_current: e.target.checked }))} className="rounded" />
                        <label htmlFor="is_current" className="text-sm text-slate-700">Current Faculty</label>
                      </div>
                      <textarea value={teacherForm.bio} onChange={(e) => setTeacherForm((f) => ({ ...f, bio: e.target.value }))} rows={2} className="input-field resize-none sm:col-span-2" placeholder="Short bio (optional)" />
                      <div className="sm:col-span-2 flex gap-2">
                        <button type="submit" disabled={savingTeacher || teacherPhotoUploading} className="btn-primary">
                          {savingTeacher ? 'Saving...' : 'Save Faculty'}
                        </button>
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
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {t.photo_url ? (
                                  <img src={t.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center">
                                    <span className="text-navy-700 text-xs font-bold">{t.full_name[0]}</span>
                                  </div>
                                )}
                                <span className="font-medium text-navy-900">{t.full_name}</span>
                              </div>
                            </td>
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
                          <td className="px-4 py-3 text-slate-600">{a.course_applied ?? a.applying_for ?? '—'}</td>
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
                                  <button onClick={() => updateAppStatus(a.id, 'reviewed')} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Mark Reviewed"><EditIcon className="w-4 h-4" /></button>
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

            {/* SITE IMAGES */}
            {tab === 'settings' && (
              <div className="space-y-4">
                <div className="card p-6">
                  <h2 className="font-serif font-bold text-navy-900 text-lg mb-1">Site Image Settings</h2>
                  <p className="text-slate-500 text-sm mb-5">Upload photos directly to update images displayed on the Home and About pages.</p>

                  {settingsError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4 mt-0.5" />{settingsError}
                    </div>
                  )}
                  {settingsSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4 text-green-700 text-sm">
                      <Check className="w-4 h-4" /> Image updated successfully!
                    </div>
                  )}

                  <div className="space-y-5">
                    {siteSettings.map((setting) => (
                      <div key={setting.id} className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-36 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={setting.setting_value}
                              alt={setting.description || setting.setting_key}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-navy-900 mb-0.5">
                              {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                            </p>
                            <p className="text-xs text-slate-500 mb-3">{setting.description}</p>
                            <div className="flex items-center gap-3 flex-wrap">
                              <label
                                htmlFor={`upload-setting-${setting.setting_key}`}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                                  settingUploading === setting.setting_key
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-navy-800 text-white hover:bg-navy-700'
                                }`}
                              >
                                {settingUploading === setting.setting_key
                                  ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</>
                                  : <><Upload className="w-4 h-4" /> Upload New Image</>
                                }
                              </label>
                              <input
                                id={`upload-setting-${setting.setting_key}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={settingUploading !== null}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) uploadSiteImage(setting.setting_key, file);
                                  e.target.value = '';
                                }}
                              />
                              <span className="text-xs text-slate-400">JPG, PNG, WebP recommended</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MESSAGES */}
            {tab === 'messages' && (
              <div className="space-y-4">
                <div className="card overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="font-serif font-bold text-navy-900">
                      Contact Messages ({contactMessages.length})
                    </h2>
                    {stats.unread_messages > 0 && (
                      <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        {stats.unread_messages} unread
                      </span>
                    )}
                  </div>

                  {contactMessages.length === 0 ? (
                    <div className="text-center py-16">
                      <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No messages yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {contactMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-5 transition-colors ${msg.is_read ? 'bg-white' : 'bg-blue-50/40'}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${msg.is_read ? 'bg-slate-100' : 'bg-navy-100'}`}>
                                <span className={`text-sm font-bold ${msg.is_read ? 'text-slate-600' : 'text-navy-700'}`}>
                                  {msg.name[0].toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-navy-900 text-sm">{msg.name}</p>
                                  {!msg.is_read && (
                                    <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">New</span>
                                  )}
                                  {msg.subject && (
                                    <span className="text-xs text-slate-500 capitalize">· {msg.subject.replace(/_/g, ' ')}</span>
                                  )}
                                </div>
                                <a href={`mailto:${msg.email}`} className="text-xs text-navy-600 hover:text-navy-800 transition-colors">{msg.email}</a>
                                <p className="text-slate-700 text-sm mt-2 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                <p className="text-slate-400 text-xs mt-2">
                                  {new Date(msg.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!msg.is_read && (
                                <button
                                  onClick={() => markMessageRead(msg.id)}
                                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="w-3.5 h-3.5" /> Read
                                </button>
                              )}
                              <button
                                onClick={() => deleteMessage(msg.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
