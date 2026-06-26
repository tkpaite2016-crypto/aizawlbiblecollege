import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Bell, BookOpen, Image, FileText,
  Plus, Trash2, CreditCard as EditIcon, Check, X, AlertCircle,
  MessageSquare, Upload, Loader, Mail, GraduationCap, Award,
  ShieldCheck, UserCheck, AlertTriangle, Pencil, Download,
  CreditCard, Settings, Save, Ban, Shield, Palette,
} from 'lucide-react';
import { supabase, Profile, Notice, Teacher, SiteSetting, ContactMessage, Download as DownloadType } from '../lib/supabase';
import { THEMES } from '../lib/themes';
import { useAuth } from '../contexts/AuthContext';
import { pdf } from '@react-pdf/renderer';
import { CertificateDocument } from '../components/CertificateDocument';

type Tab = 'overview' | 'users' | 'students' | 'admins' | 'notices' | 'teachers' | 'applications' | 'downloads' | 'settings' | 'messages' | 'payment';

type GraduationForm = {
  userId: string;
  userName: string;
  course: string;
  completionDate: string;
  pataRegNo: string;
};

type ConfirmConfig = {
  title: string;
  message: string;
  detail?: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
};

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

function ConfirmModal({ config, onClose }: { config: ConfirmConfig; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${config.danger ? 'bg-red-50' : 'bg-amber-50'}`}>
          <AlertTriangle className={`w-7 h-7 ${config.danger ? 'text-red-500' : 'text-amber-500'}`} />
        </div>
        <h3 className="text-lg font-serif font-bold text-navy-900 text-center mb-2">{config.title}</h3>
        <p className="text-sm text-slate-600 text-center leading-relaxed">{config.message}</p>
        {config.detail && (
          <p className="text-xs text-slate-400 text-center mt-1.5">{config.detail}</p>
        )}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { config.onConfirm(); onClose(); }}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${
              config.danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const downloadCategories = ['academic_calendar', 'syllabus', 'application_form', 'result', 'general', 'policy'] as const;
type DownloadCategory = typeof downloadCategories[number];

const catLabel: Record<string, string> = {
  academic_calendar: 'Academic Calendar',
  syllabus: 'Syllabus',
  application_form: 'Application Form',
  result: 'Results',
  general: 'General',
  policy: 'Policy',
};

type Application = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  dob: string | null;
  gender: string | null;
  address: string | null;
  applying_for: string | null;
  previous_education: string | null;
  church_name: string | null;
  pastor_name: string | null;
  statement: string | null;
  status: string;
  reviewed_by: string | null;
  review_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  course_applied: string | null;
  pin_code: string | null;
  guardian_name: string | null;
  parent_occupation: string | null;
  annual_income: string | null;
  mother_tongue: string | null;
  other_languages: string | null;
  marital_status: string | null;
  academic_qualifications: any;
  born_again: string | null;
  water_baptism_date: string | null;
  denomination: string | null;
  church_involvement: string | null;
  statement_of_purpose: string | null;
  calling_aim: string | null;
  practices_vices: boolean | null;
  can_pay_fees: boolean | null;
  fee_sponsor: string | null;
  passport_photo_url: string | null;
  signature_data_url: string | null;
};

export default function AdminDashboard() {
  const { profile: adminProfile } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [users, setUsers] = useState<Profile[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSetting[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [downloads, setDownloads] = useState<DownloadType[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, students: 0, faculty: 0, admins: 0, notices: 0, pending: 0, unread_messages: 0 });

  // Notice form
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', category: 'general', priority: 'medium', image_url: '' });
  const [savingNotice, setSavingNotice] = useState(false);
  const [noticeError, setNoticeError] = useState('');
  const [showNoticeForm, setShowNoticeForm] = useState(false);

  // Teacher form
  const [teacherForm, setTeacherForm] = useState({ full_name: '', qualification: '', address: '', subject_in_charge: '', photo_url: '', is_current: true, bio: '' });
  const [savingTeacher, setSavingTeacher] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [teacherPhotoUploading, setTeacherPhotoUploading] = useState(false);
  const teacherPhotoRef = useRef<HTMLInputElement>(null);

  // Downloads form
  const [downloadForm, setDownloadForm] = useState({ title: '', category: 'general' as DownloadCategory, description: '', semester: '', file_url: '' });
  const [downloadFileUploading, setDownloadFileUploading] = useState(false);
  const [showDownloadForm, setShowDownloadForm] = useState(false);
  const [savingDownload, setSavingDownload] = useState(false);

  // Application detail/edit modal
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showAppModal, setShowAppModal] = useState(false);
  const [appForm, setAppForm] = useState({ status: 'pending', review_notes: '' });
  const [savingApp, setSavingApp] = useState(false);

  // Site settings upload
  const [settingUploading, setSettingUploading] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Principal greeting settings
  const [greetingEnabled, setGreetingEnabled] = useState(true);
  const [greetingName, setGreetingName] = useState('Rev. Dr. C.S. Muanga');
  const [greetingTitle, setGreetingTitle] = useState('Principal, Aizawl Bible College');
  const [greetingImage, setGreetingImage] = useState('/images/PrincipalsGreets.jpg');
  const [greetingSaving, setGreetingSaving] = useState(false);
  const [greetingImageUploading, setGreetingImageUploading] = useState(false);

  // Hero opacity
  const [heroOpacity, setHeroOpacity] = useState(0.88);
  const [heroOpacitySaving, setHeroOpacitySaving] = useState(false);

  // Board members
  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [showBoardMemberForm, setShowBoardMemberForm] = useState(false);
  const [boardMemberForm, setBoardMemberForm] = useState({ name: '', designation: '', photo_url: '', display_order: 0 });
  const [savingBoardMember, setSavingBoardMember] = useState(false);
  const [boardPhotoUploading, setBoardPhotoUploading] = useState(false);
  const [editingBoardMember, setEditingBoardMember] = useState<any | null>(null);
  const [boardEditForm, setBoardEditForm] = useState({ name: '', designation: '', photo_url: '', display_order: 0 });
  const [savingBoardEdit, setSavingBoardEdit] = useState(false);
  const [boardEditPhotoUploading, setBoardEditPhotoUploading] = useState(false);

  // Notice image upload
  const [noticeImageUploading, setNoticeImageUploading] = useState(false);

  // Graduation modal
  const [showGraduationModal, setShowGraduationModal] = useState(false);
  const [graduationForm, setGraduationForm] = useState<GraduationForm | null>(null);
  const [processingGraduation, setProcessingGraduation] = useState(false);
  const [graduationError, setGraduationError] = useState('');

  // Confirm modal (replaces browser confirm())
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  // Student search
  const [studentSearch, setStudentSearch] = useState('');

  // Razorpay payment settings
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState('');
  const [paymentSettingsSaving, setPaymentSettingsSaving] = useState(false);
  const [paymentSettingsSuccess, setPaymentSettingsSuccess] = useState(false);

  // Faculty edit modal
  const [facultyEditTarget, setFacultyEditTarget] = useState<Profile | null>(null);
  const [facultyEditForm, setFacultyEditForm] = useState({
    full_name: '', qualification: '', subject_in_charge: '', bio: '', phone: '', address: '', position: '',
  });
  const [savingFacultyEdit, setSavingFacultyEdit] = useState(false);
  const [facultyPhotoUploading, setFacultyPhotoUploading] = useState(false);
  const facultyPhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  function recomputeStats(userList: Profile[], noticeList: Notice[], appList: any[], msgList: ContactMessage[]) {
    setStats({
      users: userList.length,
      students: userList.filter((x) => x.role === 'student').length,
      faculty: userList.filter((x) => x.role === 'faculty').length,
      admins: userList.filter((x) => x.role === 'admin').length,
      notices: noticeList.length,
      pending: appList.filter((x: any) => x.status === 'pending').length,
      unread_messages: msgList.filter((x: any) => !x.is_read).length,
    });
  }

  async function loadData() {
    setLoading(true);
    const [usersRes, noticesRes, teachersRes, appsRes, settingsRes, messagesRes, downloadsRes, boardRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('notices').select('*').order('created_at', { ascending: false }),
      supabase.from('teachers').select('*').order('display_order'),
      supabase.from('applications').select('*').order('submitted_at', { ascending: false }),
      supabase.from('site_settings').select('*').order('setting_key'),
      supabase.from('contact_messages').select('*').order('submitted_at', { ascending: false }),
      supabase.from('downloads').select('*').order('created_at', { ascending: false }),
      supabase.from('board_members').select('*').order('display_order'),
    ]);
    const u = usersRes.data ?? [];
    const n = noticesRes.data ?? [];
    const t = teachersRes.data ?? [];
    const a = appsRes.data ?? [];
    const s = settingsRes.data ?? [];
    const m = messagesRes.data ?? [];
    const d = downloadsRes.data ?? [];
    const b = boardRes.data ?? [];
    setUsers(u); setNotices(n); setTeachers(t); setApplications(a); setSiteSettings(s); setContactMessages(m); setDownloads(d); setBoardMembers(b);
    recomputeStats(u, n, a, m);

    // Load principal greeting settings
    const greetingSettings = s.filter((x) => x.setting_key.startsWith('principal_greeting_'));
    greetingSettings.forEach((gs) => {
      if (gs.setting_key === 'principal_greeting_enabled') setGreetingEnabled(gs.setting_value === 'true');
      if (gs.setting_key === 'principal_greeting_name') setGreetingName(gs.setting_value || 'Rev. Dr. C.S. Muanga');
      if (gs.setting_key === 'principal_greeting_title') setGreetingTitle(gs.setting_value || 'Principal, Aizawl Bible College');
      if (gs.setting_key === 'principal_greeting_image') setGreetingImage(gs.setting_value || '/images/PrincipalsGreets.jpg');
    });
    // Load hero opacity
    const heroOpacitySetting = s.find((x) => x.setting_key === 'home_hero_opacity');
    if (heroOpacitySetting) setHeroOpacity(parseFloat(heroOpacitySetting.setting_value) || 0.88);

    // Load Razorpay payment settings
    const razorpayEnabledSetting = s.find((x) => x.setting_key === 'razorpay_enabled');
    if (razorpayEnabledSetting) setRazorpayEnabled(razorpayEnabledSetting.setting_value === 'true');
    const razorpayKeyIdSetting = s.find((x) => x.setting_key === 'razorpay_key_id');
    if (razorpayKeyIdSetting) setRazorpayKeyId(razorpayKeyIdSetting.setting_value || '');
    const razorpayKeySecretSetting = s.find((x) => x.setting_key === 'razorpay_key_secret');
    if (razorpayKeySecretSetting) setRazorpayKeySecret(razorpayKeySecretSetting.setting_value || '');
    const razorpayWebhookSetting = s.find((x) => x.setting_key === 'razorpay_webhook_secret');
    if (razorpayWebhookSetting) setRazorpayWebhookSecret(razorpayWebhookSetting.setting_value || '');

    setLoading(false);
  }

  async function updateUserRole(userId: string, role: string) {
    await supabase.from('profiles').update({ role }).eq('id', userId);
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === userId ? { ...u, role: role as any } : u));
      recomputeStats(next, notices, applications, contactMessages);
      return next;
    });
  }

  async function updateUserYear(userId: string, year: string) {
    await supabase.from('profiles').update({ student_year: year || null }).eq('id', userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, student_year: year as any } : u)));
  }

  async function updateUserCourse(userId: string, course: string) {
    await supabase.from('profiles').update({ course: course || null }).eq('id', userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, course: course || null } : u)));
  }

  function openGraduationModal(user: Profile) {
    setGraduationForm({
      userId: user.id,
      userName: user.full_name || user.email || 'Student',
      course: user.course || '',
      completionDate: new Date().toISOString().split('T')[0],
      pataRegNo: user.pata_reg_no || '',
    });
    setGraduationError('');
    setShowGraduationModal(true);
  }

  async function processGraduation(e: React.FormEvent) {
    e.preventDefault();
    if (!graduationForm) return;

    setProcessingGraduation(true);
    setGraduationError('');

    try {
      const certificateId = `ABC-${new Date().getFullYear()}-${graduationForm.userId.slice(0, 8).toUpperCase()}`;

      const certificateDoc = (
        <CertificateDocument
          studentName={graduationForm.userName}
          course={graduationForm.course || 'Theology Program'}
          completionDate={graduationForm.completionDate}
          certificateId={certificateId}
          pataRegNo={graduationForm.pataRegNo}
        />
      );

      const blob = await pdf(certificateDoc).toBlob();

      const fileName = `certificates/${graduationForm.userId}_${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(fileName, blob, { upsert: true, contentType: 'application/pdf' });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('certificates').getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          graduated: true,
          course: graduationForm.course || null,
          completion_date: graduationForm.completionDate,
          certificate_url: urlData.publicUrl,
          pata_reg_no: graduationForm.pataRegNo || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', graduationForm.userId);

      if (updateError) throw updateError;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === graduationForm.userId
            ? { ...u, graduated: true, course: graduationForm.course || null, completion_date: graduationForm.completionDate, certificate_url: urlData.publicUrl, pata_reg_no: graduationForm.pataRegNo || null }
            : u
        )
      );

      setShowGraduationModal(false);
      setGraduationForm(null);
    } catch (err) {
      setGraduationError(err instanceof Error ? err.message : 'Failed to process graduation');
    } finally {
      setProcessingGraduation(false);
    }
  }

  function confirmRevokeGraduation(user: Profile) {
    setConfirmConfig({
      title: 'Revoke Graduation',
      message: `Are you sure you want to revoke the graduation status of ${user.full_name || 'this student'}?`,
      detail: 'This will remove their certificate and completion record.',
      confirmLabel: 'Yes, Revoke',
      danger: true,
      onConfirm: () => doRevokeGraduation(user.id),
    });
  }

  async function doRevokeGraduation(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ graduated: false, certificate_url: null, completion_date: null, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, graduated: false, certificate_url: null, completion_date: null } : u
        )
      );
    }
  }

  function openFacultyEdit(u: Profile) {
    setFacultyEditTarget(u);
    setFacultyEditForm({
      full_name: u.full_name ?? '',
      qualification: u.qualification ?? '',
      subject_in_charge: u.subject_in_charge ?? '',
      bio: u.bio ?? '',
      phone: u.phone ?? '',
      address: u.address ?? '',
      position: u.position ?? '',
    });
  }

  async function uploadFacultyPhoto(file: File): Promise<string | null> {
    setFacultyPhotoUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `faculty/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(fileName, file, { upsert: true });
    if (error) { setFacultyPhotoUploading(false); return null; }
    const { data } = supabase.storage.from('photos').getPublicUrl(fileName);
    setFacultyPhotoUploading(false);
    return data.publicUrl;
  }

  async function saveFacultyEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!facultyEditTarget) return;
    setSavingFacultyEdit(true);
    const { error } = await supabase.from('profiles').update({
      full_name: facultyEditForm.full_name || null,
      qualification: facultyEditForm.qualification || null,
      subject_in_charge: facultyEditForm.subject_in_charge || null,
      bio: facultyEditForm.bio || null,
      phone: facultyEditForm.phone || null,
      address: facultyEditForm.address || null,
      position: facultyEditForm.position || null,
      updated_at: new Date().toISOString(),
    }).eq('id', facultyEditTarget.id);
    if (!error) {
      setUsers((prev) => prev.map((u) =>
        u.id === facultyEditTarget.id
          ? { ...u, ...facultyEditForm, qualification: facultyEditForm.qualification || null, subject_in_charge: facultyEditForm.subject_in_charge || null, position: facultyEditForm.position || null }
          : u
      ));
      setFacultyEditTarget(null);
    }
    setSavingFacultyEdit(false);
  }

  async function saveNotice(e: React.FormEvent) {
    e.preventDefault();
    setNoticeError('');
    setSavingNotice(true);
    const { error } = await supabase.from('notices').insert({
      title: noticeForm.title,
      content: noticeForm.content,
      category: noticeForm.category,
      priority: noticeForm.priority,
      image_url: noticeForm.image_url || null,
      author_id: adminProfile?.id,
    });
    if (error) { setNoticeError(error.message); setSavingNotice(false); return; }
    setNoticeForm({ title: '', content: '', category: 'general', priority: 'medium', image_url: '' });
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
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status, reviewed_by: adminProfile?.id, reviewed_at: new Date().toISOString() } : a)));
    recomputeStats(users, notices, applications, contactMessages);
  }

  function openAppDetail(app: Application) {
    setSelectedApp(app);
    setAppForm({ status: app.status, review_notes: app.review_notes || '' });
    setShowAppModal(true);
  }

  async function saveAppDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedApp) return;
    setSavingApp(true);
    const { error } = await supabase
      .from('applications')
      .update({
        status: appForm.status,
        review_notes: appForm.review_notes || null,
        reviewed_by: adminProfile?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', selectedApp.id);
    if (!error) {
      setApplications((prev) => prev.map((a) => (a.id === selectedApp.id ? { ...a, status: appForm.status, review_notes: appForm.review_notes, reviewed_by: adminProfile?.id, reviewed_at: new Date().toISOString() } : a)));
      recomputeStats(users, notices, applications, contactMessages);
    }
    setSavingApp(false);
    setShowAppModal(false);
    setSelectedApp(null);
  }

  async function deleteApplication(id: string) {
    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (!error) {
      setApplications((prev) => prev.filter((a) => a.id !== id));
      recomputeStats(users, notices, applications, contactMessages);
    }
  }

  function confirmDeleteApplication(app: Application) {
    setConfirmConfig({
      title: 'Delete Application',
      message: `Are you sure you want to permanently delete the application from ${app.full_name}?`,
      detail: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: () => deleteApplication(app.id),
    });
  }

  // Downloads
  async function uploadDownloadFile(file: File): Promise<string | null> {
    setDownloadFileUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'bin';
      const fileName = `downloads/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error } = await supabase.storage.from('downloads').upload(fileName, file, {
        upsert: true,
        contentType: file.type || 'application/octet-stream',
      });
      if (error) {
        console.error('Upload error:', error);
        alert(`Upload failed: ${error.message}`);
        setDownloadFileUploading(false);
        return null;
      }
      const { data } = supabase.storage.from('downloads').getPublicUrl(fileName);
      setDownloadFileUploading(false);
      return data.publicUrl;
    } catch (err) {
      console.error('Upload exception:', err);
      alert(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setDownloadFileUploading(false);
      return null;
    }
  }

  async function saveDownload(e: React.FormEvent) {
    e.preventDefault();
    if (!downloadForm.file_url) return;
    setSavingDownload(true);
    const { error } = await supabase.from('downloads').insert({
      title: downloadForm.title,
      category: downloadForm.category,
      description: downloadForm.description || null,
      semester: downloadForm.semester || null,
      file_url: downloadForm.file_url,
      is_active: true,
    });
    if (!error) {
      setDownloadForm({ title: '', category: 'general', description: '', semester: '', file_url: '' });
      setShowDownloadForm(false);
      loadData();
    }
    setSavingDownload(false);
  }

  async function toggleDownloadActive(id: string, is_active: boolean) {
    await supabase.from('downloads').update({ is_active }).eq('id', id);
    setDownloads((prev) => prev.map((d) => (d.id === id ? { ...d, is_active } : d)));
  }

  async function deleteDownload(id: string) {
    await supabase.from('downloads').delete().eq('id', id);
    setDownloads((prev) => prev.filter((d) => d.id !== id));
  }

  async function uploadSiteImage(key: string, file: File) {
    setSettingUploading(key);
    setSettingsError('');
    setSettingsSuccess(false);
    const ext = file.name.split('.').pop();
    const fileName = `${key}_${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('site-images').upload(fileName, file, { upsert: true });
    if (uploadErr) { setSettingsError(uploadErr.message); setSettingUploading(null); return; }
    const { data: urlData } = supabase.storage.from('site-images').getPublicUrl(fileName);
    const { error: dbErr } = await supabase.from('site_settings').update({ setting_value: urlData.publicUrl }).eq('setting_key', key);
    if (dbErr) {
      setSettingsError(dbErr.message);
    } else {
      setSiteSettings((prev) => prev.map((s) => (s.setting_key === key ? { ...s, setting_value: urlData.publicUrl } : s)));
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    }
    setSettingUploading(null);
  }

  async function saveGreetingSettings(e: React.FormEvent) {
    e.preventDefault();
    setGreetingSaving(true);
    const updates = [
      { key: 'principal_greeting_enabled', value: greetingEnabled ? 'true' : 'false' },
      { key: 'principal_greeting_name', value: greetingName },
      { key: 'principal_greeting_title', value: greetingTitle },
      { key: 'principal_greeting_image', value: greetingImage },
    ];
    for (const { key, value } of updates) {
      await supabase.from('site_settings').update({ setting_value: value }).eq('setting_key', key);
      setSiteSettings((prev) => prev.map((s) => (s.setting_key === key ? { ...s, setting_value: value } : s)));
    }
    setGreetingSaving(false);
  }

  async function saveHeroOpacity() {
    setHeroOpacitySaving(true);
    await supabase.from('site_settings').update({ setting_value: heroOpacity.toString() }).eq('setting_key', 'home_hero_opacity');
    setSiteSettings((prev) => prev.map((s) => s.setting_key === 'home_hero_opacity' ? { ...s, setting_value: heroOpacity.toString() } : s));
    setHeroOpacitySaving(false);
  }

  async function savePaymentSettings(e: React.FormEvent) {
    e.preventDefault();
    setPaymentSettingsSaving(true);
    setPaymentSettingsSuccess(false);

    const settingsToUpdate = [
      { key: 'razorpay_enabled', value: razorpayEnabled ? 'true' : 'false' },
      { key: 'razorpay_key_id', value: razorpayKeyId },
      { key: 'razorpay_key_secret', value: razorpayKeySecret },
      { key: 'razorpay_webhook_secret', value: razorpayWebhookSecret },
    ];

    for (const setting of settingsToUpdate) {
      await supabase.from('site_settings').update({ setting_value: setting.value }).eq('setting_key', setting.key);
    }

    setSiteSettings((prev) => {
      const next = [...prev];
      for (const setting of settingsToUpdate) {
        const idx = next.findIndex((s) => s.setting_key === setting.key);
        if (idx >= 0) {
          next[idx] = { ...next[idx], setting_value: setting.value };
        }
      }
      return next;
    });

    setPaymentSettingsSaving(false);
    setPaymentSettingsSuccess(true);
    setTimeout(() => setPaymentSettingsSuccess(false), 2500);
  }

  async function uploadNoticeImage(file: File): Promise<string | null> {
    setNoticeImageUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `notices/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(fileName, file, { upsert: true });
    if (error) { setNoticeImageUploading(false); return null; }
    const { data } = supabase.storage.from('photos').getPublicUrl(fileName);
    setNoticeImageUploading(false);
    return data.publicUrl;
  }

  async function uploadGreetingImage(file: File) {
    setGreetingImageUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `principal_greeting_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('site-images').upload(fileName, file, { upsert: true });
    if (error) {
      setSettingsError(error.message);
      setGreetingImageUploading(false);
      return;
    }
    const { data } = supabase.storage.from('site-images').getPublicUrl(fileName);
    setGreetingImage(data.publicUrl);
    await supabase.from('site_settings').update({ setting_value: data.publicUrl }).eq('setting_key', 'principal_greeting_image');
    setSiteSettings((prev) => prev.map((s) => (s.setting_key === 'principal_greeting_image' ? { ...s, setting_value: data.publicUrl } : s)));
    setGreetingImageUploading(false);
  }

  async function updateUserPataRegNo(userId: string, pataRegNo: string) {
    await supabase.from('profiles').update({ pata_reg_no: pataRegNo || null }).eq('id', userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, pata_reg_no: pataRegNo || null } : u)));
  }

  async function updateUserTheme(userId: string, theme: string) {
    await supabase.from('profiles').update({ profile_theme: theme }).eq('id', userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, profile_theme: theme } : u)));
  }

  async function banUser(userId: string) {
    await supabase.from('profiles').update({ is_banned: true }).eq('id', userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_banned: true } : u)));
  }

  async function unbanUser(userId: string) {
    await supabase.from('profiles').update({ is_banned: false }).eq('id', userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_banned: false } : u)));
  }

  function confirmBanUser(user: Profile) {
    setConfirmConfig({
      title: 'Ban User',
      message: `Are you sure you want to ban ${user.full_name || user.email}? They will not be able to post in forums or edit their profile.`,
      confirmLabel: 'Ban User',
      danger: true,
      onConfirm: () => banUser(user.id),
    });
  }

  function confirmUnbanUser(user: Profile) {
    setConfirmConfig({
      title: 'Unban User',
      message: `Are you sure you want to unban ${user.full_name || user.email}? They will regain full access to the site.`,
      confirmLabel: 'Unban User',
      danger: false,
      onConfirm: () => unbanUser(user.id),
    });
  }

  async function deleteUser(userId: string) {
    // Call the edge function to delete user completely from Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (response.ok) {
      setUsers((prev) => {
        const next = prev.filter((u) => u.id !== userId);
        recomputeStats(next, notices, applications, contactMessages);
        return next;
      });
    } else {
      const error = await response.json();
      console.error('Failed to delete user:', error);
    }
  }

  function confirmDeleteUser(user: Profile) {
    setConfirmConfig({
      title: 'Delete User',
      message: `Are you sure you want to permanently delete ${user.full_name || user.email}? This action cannot be undone.`,
      detail: 'All their data including transactions, posts, and notifications will be removed.',
      confirmLabel: 'Delete User',
      danger: true,
      onConfirm: () => deleteUser(user.id),
    });
  }

  // Board member functions
  async function uploadBoardPhoto(file: File): Promise<string | null> {
    setBoardPhotoUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `board/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(fileName, file, { upsert: true });
    if (error) { setBoardPhotoUploading(false); return null; }
    const { data } = supabase.storage.from('photos').getPublicUrl(fileName);
    setBoardPhotoUploading(false);
    return data.publicUrl;
  }

  async function saveBoardMember(e: React.FormEvent) {
    e.preventDefault();
    setSavingBoardMember(true);
    await supabase.from('board_members').insert({
      name: boardMemberForm.name,
      designation: boardMemberForm.designation || null,
      photo_url: boardMemberForm.photo_url || null,
      display_order: boardMemberForm.display_order || 0,
    });
    setBoardMemberForm({ name: '', designation: '', photo_url: '', display_order: 0 });
    setShowBoardMemberForm(false);
    setSavingBoardMember(false);
    loadData();
  }

  async function deleteBoardMember(id: string) {
    await supabase.from('board_members').delete().eq('id', id);
    setBoardMembers((prev) => prev.filter((b) => b.id !== id));
  }

  function openBoardMemberEdit(b: any) {
    setEditingBoardMember(b);
    setBoardEditForm({ name: b.name, designation: b.designation ?? '', photo_url: b.photo_url ?? '', display_order: b.display_order ?? 0 });
  }

  async function uploadBoardEditPhoto(file: File): Promise<string | null> {
    setBoardEditPhotoUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `board/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(fileName, file, { upsert: true });
    if (error) { setBoardEditPhotoUploading(false); return null; }
    const { data } = supabase.storage.from('photos').getPublicUrl(fileName);
    setBoardEditPhotoUploading(false);
    return data.publicUrl;
  }

  async function saveBoardMemberEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBoardMember) return;
    setSavingBoardEdit(true);
    const { error } = await supabase.from('board_members').update({
      name: boardEditForm.name,
      designation: boardEditForm.designation || null,
      photo_url: boardEditForm.photo_url || null,
      display_order: boardEditForm.display_order || 0,
    }).eq('id', editingBoardMember.id);
    if (!error) {
      setBoardMembers((prev) => prev.map((b) => b.id === editingBoardMember.id ? { ...b, ...boardEditForm, designation: boardEditForm.designation || null, photo_url: boardEditForm.photo_url || null } : b));
      setEditingBoardMember(null);
    }
    setSavingBoardEdit(false);
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

  const studentList = users.filter((u) => u.role === 'student');
  const adminList = users.filter((u) => u.role === 'admin');
  const facultyList = users.filter((u) => u.role === 'faculty');

  // Filtered student list based on search
  const filteredStudentList = studentList.filter((s) => {
    if (!studentSearch.trim()) return true;
    const search = studentSearch.toLowerCase();
    return (
      s.full_name?.toLowerCase().includes(search) ||
      s.email?.toLowerCase().includes(search) ||
      s.course?.toLowerCase().includes(search) ||
      s.student_year?.toLowerCase().includes(search) ||
      s.phone?.includes(search)
    );
  });

  const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'students', label: 'Students', icon: UserCheck },
    { id: 'admins', label: 'Admins', icon: ShieldCheck },
    { id: 'notices', label: 'Notices', icon: Bell },
    { id: 'teachers', label: 'Faculty', icon: BookOpen },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'settings', label: 'Site Images', icon: Image },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: stats.unread_messages },
  ];

  function renderUserTable(list: Profile[], isStudentView = false) {
    if (list.length === 0) {
      return (
        <div className="py-16 text-center text-slate-400 text-sm">No users in this group.</div>
      );
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Name / Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Theme</th>
              {isStudentView && <th className="px-4 py-3 text-left">Course</th>}
              {isStudentView && <th className="px-4 py-3 text-left">Year</th>}
              {isStudentView && <th className="px-4 py-3 text-left">Graduated</th>}
              {isStudentView && <th className="px-4 py-3 text-left">PATA Reg#</th>}
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((u) => (
              <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${u.is_banned ? 'bg-red-50' : ''}`}>
                <td className="px-4 py-3">
                  <Link
                    to={`/admin/users/${u.id}`}
                    className="font-medium text-navy-900 hover:text-gold-600 hover:underline transition-colors"
                  >
                    {u.full_name ?? '—'}
                  </Link>
                  <p className="text-slate-400 text-xs">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => updateUserRole(u.id, e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-navy-500 bg-white"
                  >
                    {['standard', 'student', 'faculty', 'admin', 'finance'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {u.is_banned ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      <Ban className="w-3 h-3" /> Banned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      <Shield className="w-3 h-3" /> Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.profile_theme ?? 'classic'}
                    onChange={(e) => updateUserTheme(u.id, e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-navy-500 bg-white"
                    title="Set profile theme"
                  >
                    {THEMES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}{t.animated ? ' ✨' : ''}</option>
                    ))}
                  </select>
                </td>
                {isStudentView && (
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={u.course ?? ''}
                      onChange={(e) => updateUserCourse(u.id, e.target.value)}
                      placeholder="e.g., BTh"
                      className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-navy-500 bg-white w-24"
                    />
                  </td>
                )}
                {isStudentView && (
                  <td className="px-4 py-3">
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
                  </td>
                )}
                {isStudentView && (
                  <td className="px-4 py-3">
                    {u.graduated ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        <GraduationCap className="w-3 h-3" /> Yes
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">No</span>
                    )}
                  </td>
                )}
                {isStudentView && (
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={u.pata_reg_no ?? ''}
                      onChange={(e) => updateUserPataRegNo(u.id, e.target.value)}
                      placeholder="e.g., PATA-2024-001"
                      className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-navy-500 bg-white w-28"
                    />
                  </td>
                )}
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {u.role === 'student' && (
                      <>
                        {u.graduated ? (
                          <>
                            {u.certificate_url && (
                              <a
                                href={u.certificate_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="View Certificate"
                              >
                                <Award className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => confirmRevokeGraduation(u)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                              title="Revoke Graduation"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => openGraduationModal(u)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            title="Mark as Graduated"
                          >
                            <GraduationCap className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                    {u.is_banned ? (
                      <button
                        onClick={() => confirmUnbanUser(u)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                        title="Unban User"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => confirmBanUser(u)}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 rounded"
                        title="Ban User"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => confirmDeleteUser(u)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

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
                <StatCard label="Students" value={stats.students} icon={UserCheck} color="bg-blue-600" />
                <StatCard label="Faculty" value={stats.faculty} icon={BookOpen} color="bg-green-600" />
                <StatCard label="Notices" value={stats.notices} icon={Bell} color="bg-orange-500" />
                <StatCard label="Pending Apps" value={stats.pending} icon={FileText} color="bg-red-600" />
              </div>
            )}

            {/* ALL USERS */}
            {tab === 'users' && (
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-serif font-bold text-navy-900">All Users</h2>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{users.length} total</span>
                </div>
                {renderUserTable(users)}
              </div>
            )}

            {/* STUDENTS */}
            {tab === 'students' && (
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                      <h2 className="font-serif font-bold text-navy-900">Students</h2>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                        {filteredStudentList.length}{studentSearch.trim() && studentList.length > filteredStudentList.length ? ` of ${studentList.length}` : ''} enrolled
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search by name, email, course..."
                        className="input-field text-sm pr-8 w-64"
                      />
                      {studentSearch && (
                        <button
                          onClick={() => setStudentSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {renderUserTable(filteredStudentList, true)}
              </div>
            )}

            {/* ADMINS */}
            {tab === 'admins' && (
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-navy-700" />
                  <h2 className="font-serif font-bold text-navy-900">Administrators</h2>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full ml-auto">{adminList.length} admins</span>
                </div>
                {renderUserTable(adminList)}
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
                      {/* Notice image */}
                      <div>
                        <label className="label text-xs mb-1.5 block">Thumbnail / Banner Image (optional)</label>
                        <div className="flex items-center gap-3 flex-wrap">
                          {noticeForm.image_url && (
                            <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                              <img src={noticeForm.image_url} alt="" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => setNoticeForm((f) => ({ ...f, image_url: '' }))} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">×</button>
                            </div>
                          )}
                          <label
                            htmlFor="notice-image-upload"
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${noticeImageUploading ? 'bg-slate-100 text-slate-400' : 'bg-navy-800 text-white hover:bg-navy-700'}`}
                          >
                            {noticeImageUploading ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> {noticeForm.image_url ? 'Change Image' : 'Upload Image'}</>}
                          </label>
                          <input
                            id="notice-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const url = await uploadNoticeImage(file);
                              if (url) setNoticeForm((f) => ({ ...f, image_url: url }));
                              e.target.value = '';
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" disabled={savingNotice || noticeImageUploading} className="btn-primary">{savingNotice ? 'Saving...' : 'Save Notice'}</button>
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

            {/* FACULTY */}
            {tab === 'teachers' && (
              <div className="space-y-6">

                {/* Section 1: Current faculty from profiles (role-based) */}
                <div className="card overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    <div>
                      <h2 className="font-serif font-bold text-navy-900">Current Faculty</h2>
                      <p className="text-xs text-slate-400">Users with the "faculty" role. Edit to fill in missing details.</p>
                    </div>
                    <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{facultyList.length}</span>
                  </div>

                  {facultyList.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-sm">
                      No users have been given the faculty role yet.
                      <br />
                      <span className="text-xs text-slate-300 mt-1 block">Go to Users tab and change a user's role to "faculty".</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wide">
                          <tr>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Qualification</th>
                            <th className="px-4 py-3 text-left">Subject</th>
                            <th className="px-4 py-3 text-left">Contact</th>
                            <th className="px-4 py-3" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {facultyList.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {u.avatar_url ? (
                                    <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0">
                                      <span className="text-navy-700 text-xs font-bold">{(u.full_name ?? u.email ?? 'F')[0].toUpperCase()}</span>
                                    </div>
                                  )}
                                  <div>
                                    <Link to={`/admin/users/${u.id}`} className="font-medium text-navy-900 hover:text-gold-600 hover:underline transition-colors">
                                      {u.full_name ?? '—'}
                                    </Link>
                                    <p className="text-slate-400 text-xs">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {u.qualification
                                  ? <span>{u.qualification}</span>
                                  : <span className="text-slate-300 italic text-xs">Not set</span>}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {u.subject_in_charge
                                  ? <span>{u.subject_in_charge}</span>
                                  : <span className="text-slate-300 italic text-xs">Not set</span>}
                              </td>
                              <td className="px-4 py-3 text-slate-500 text-xs">{u.phone ?? '—'}</td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => openFacultyEdit(u)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-navy-700 border border-navy-200 rounded-lg hover:bg-navy-50 transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" /> Manage
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Section 2: Former faculty — manually added records */}
                <div className="card overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-slate-400" />
                    <div>
                      <h2 className="font-serif font-bold text-navy-900">Former Faculty</h2>
                      <p className="text-xs text-slate-400">Manually added records for former teachers.</p>
                    </div>
                    <button onClick={() => setShowTeacherForm(!showTeacherForm)} className="ml-auto btn-primary text-xs px-3 py-1.5">
                      <Plus className="w-3.5 h-3.5" /> Add Former
                    </button>
                  </div>

                  {showTeacherForm && (
                    <div className="p-5 border-b border-slate-100 bg-slate-50">
                      <h3 className="font-semibold text-navy-900 mb-4 text-sm">Add Former Faculty Record</h3>
                      <form onSubmit={saveTeacher} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input value={teacherForm.full_name} onChange={(e) => setTeacherForm((f) => ({ ...f, full_name: e.target.value }))} className="input-field text-sm" placeholder="Full Name *" required />
                        <input value={teacherForm.qualification} onChange={(e) => setTeacherForm((f) => ({ ...f, qualification: e.target.value }))} className="input-field text-sm" placeholder="Qualification (e.g., Ph.D., Th.M.)" />
                        <input value={teacherForm.address} onChange={(e) => setTeacherForm((f) => ({ ...f, address: e.target.value }))} className="input-field text-sm" placeholder="Address" />
                        <input value={teacherForm.subject_in_charge} onChange={(e) => setTeacherForm((f) => ({ ...f, subject_in_charge: e.target.value }))} className="input-field text-sm" placeholder="Subject In Charge" />
                        <div className="sm:col-span-2">
                          <label className="label mb-1.5 block text-sm">Photo (optional)</label>
                          <div className="flex items-center gap-3">
                            {teacherForm.photo_url && (
                              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                                <img src={teacherForm.photo_url} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <label
                              htmlFor="teacher-photo-upload"
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${teacherPhotoUploading ? 'bg-slate-100 text-slate-400' : 'bg-navy-800 text-white hover:bg-navy-700'}`}
                            >
                              {teacherPhotoUploading
                                ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</>
                                : <><Upload className="w-4 h-4" /> {teacherForm.photo_url ? 'Change' : 'Upload Photo'}</>
                              }
                            </label>
                            <input id="teacher-photo-upload" ref={teacherPhotoRef} type="file" accept="image/*" className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const url = await uploadTeacherPhoto(file);
                                if (url) setTeacherForm((f) => ({ ...f, photo_url: url }));
                              }}
                            />
                            {teacherForm.photo_url && (
                              <button type="button" onClick={() => setTeacherForm((f) => ({ ...f, photo_url: '' }))} className="text-red-500 hover:text-red-700 p-1">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <textarea value={teacherForm.bio} onChange={(e) => setTeacherForm((f) => ({ ...f, bio: e.target.value }))} rows={2} className="input-field resize-none text-sm sm:col-span-2" placeholder="Short bio (optional)" />
                        <div className="sm:col-span-2 flex gap-2">
                          <button type="submit" disabled={savingTeacher || teacherPhotoUploading} className="btn-primary text-sm">
                            {savingTeacher ? 'Saving...' : 'Save Record'}
                          </button>
                          <button type="button" onClick={() => setShowTeacherForm(false)} className="btn-secondary text-sm">Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {teachers.length === 0 && !showTeacherForm ? (
                    <div className="py-10 text-center text-slate-400 text-sm">No former faculty records added yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wide">
                          <tr>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Qualification</th>
                            <th className="px-4 py-3 text-left">Subject</th>
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
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                      <span className="text-slate-500 text-xs font-bold">{t.full_name[0]}</span>
                                    </div>
                                  )}
                                  <span className="font-medium text-navy-900">{t.full_name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-600">{t.qualification ?? '—'}</td>
                              <td className="px-4 py-3 text-slate-600">{t.subject_in_charge ?? '—'}</td>
                              <td className="px-4 py-3 text-right">
                                <button onClick={() => deleteTeacher(t.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Section 3: Board of Management */}
                <div className="card overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                    <Users className="w-5 h-5 text-navy-600" />
                    <div>
                      <h2 className="font-serif font-bold text-navy-900">Board of Management</h2>
                      <p className="text-xs text-slate-400">Manage board members displayed on the Board page.</p>
                    </div>
                    <button onClick={() => setShowBoardMemberForm(!showBoardMemberForm)} className="ml-auto btn-primary text-xs px-3 py-1.5">
                      <Plus className="w-3.5 h-3.5" /> Add Member
                    </button>
                  </div>

                  {showBoardMemberForm && (
                    <div className="p-5 border-b border-slate-100 bg-slate-50">
                      <h3 className="font-semibold text-navy-900 mb-4 text-sm">Add Board Member</h3>
                      <form onSubmit={saveBoardMember} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          value={boardMemberForm.name}
                          onChange={(e) => setBoardMemberForm((f) => ({ ...f, name: e.target.value }))}
                          className="input-field text-sm"
                          placeholder="Full Name *"
                          required
                        />
                        <input
                          value={boardMemberForm.designation}
                          onChange={(e) => setBoardMemberForm((f) => ({ ...f, designation: e.target.value }))}
                          className="input-field text-sm"
                          placeholder="Designation (e.g., Chairman, Secretary)"
                        />
                        <input
                          type="number"
                          value={boardMemberForm.display_order}
                          onChange={(e) => setBoardMemberForm((f) => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                          className="input-field text-sm"
                          placeholder="Display Order (default: 0)"
                        />
                        <div className="sm:col-span-2">
                          <label className="label mb-1.5 block text-sm">Photo (optional)</label>
                          <div className="flex items-center gap-3">
                            {boardMemberForm.photo_url && (
                              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                                <img src={boardMemberForm.photo_url} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <label
                              htmlFor="board-photo-upload"
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${boardPhotoUploading ? 'bg-slate-100 text-slate-400' : 'bg-navy-800 text-white hover:bg-navy-700'}`}
                            >
                              {boardPhotoUploading
                                ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</>
                                : <><Upload className="w-4 h-4" /> {boardMemberForm.photo_url ? 'Change' : 'Upload Photo'}</>
                              }
                            </label>
                            <input
                              id="board-photo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const url = await uploadBoardPhoto(file);
                                if (url) setBoardMemberForm((f) => ({ ...f, photo_url: url }));
                              }}
                            />
                            {boardMemberForm.photo_url && (
                              <button type="button" onClick={() => setBoardMemberForm((f) => ({ ...f, photo_url: '' }))} className="text-red-500 hover:text-red-700 p-1">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="sm:col-span-2 flex gap-2">
                          <button type="submit" disabled={savingBoardMember || boardPhotoUploading} className="btn-primary text-sm">
                            {savingBoardMember ? 'Saving...' : 'Save Member'}
                          </button>
                          <button type="button" onClick={() => { setShowBoardMemberForm(false); setBoardMemberForm({ name: '', designation: '', photo_url: '', display_order: 0 }); }} className="btn-secondary text-sm">
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {boardMembers.length === 0 && !showBoardMemberForm ? (
                    <div className="py-10 text-center text-slate-400 text-sm">No board members added yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wide">
                          <tr>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Designation</th>
                            <th className="px-4 py-3 text-left">Order</th>
                            <th className="px-4 py-3" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {boardMembers.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {b.photo_url ? (
                                    <img src={b.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                      <span className="text-slate-500 text-xs font-bold">{b.name[0]}</span>
                                    </div>
                                  )}
                                  <span className="font-medium text-navy-900">{b.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-600">{b.designation ?? '—'}</td>
                              <td className="px-4 py-3 text-slate-500 text-xs">{b.display_order ?? 0}</td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => openBoardMemberEdit(b)} className="p-1.5 text-navy-600 hover:bg-navy-50 rounded" title="Edit">
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => deleteBoardMember(b.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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
                              <button onClick={() => openAppDetail(a)} className="p-1.5 text-navy-600 hover:bg-navy-50 rounded" title="View Details"><EditIcon className="w-4 h-4" /></button>
                              {a.status !== 'accepted' && (
                                <button onClick={() => updateAppStatus(a.id, 'accepted')} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Accept"><Check className="w-4 h-4" /></button>
                              )}
                              <button onClick={() => confirmDeleteApplication(a)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Application Detail Modal */}
            {showAppModal && selectedApp && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAppModal(false)}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between">
                    <h3 className="font-serif font-bold text-navy-900">Application Details</h3>
                    <button onClick={() => setShowAppModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={saveAppDetails} className="p-6 space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h4 className="font-semibold text-navy-900 text-sm mb-3 flex items-center gap-2"><User className="w-4 h-4 text-gold-500" /> Personal Information</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Full Name</p>
                          <p className="text-sm font-medium text-navy-900">{selectedApp.full_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Email</p>
                          <p className="text-sm text-navy-900">{selectedApp.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Phone</p>
                          <p className="text-sm text-navy-900">{selectedApp.phone || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Date of Birth</p>
                          <p className="text-sm text-navy-900">{selectedApp.dob ? new Date(selectedApp.dob).toLocaleDateString('en-IN') : '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Gender</p>
                          <p className="text-sm text-navy-900 capitalize">{selectedApp.gender || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Marital Status</p>
                          <p className="text-sm text-navy-900 capitalize">{selectedApp.marital_status || '—'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-slate-400 mb-0.5">Address</p>
                          <p className="text-sm text-navy-900">{selectedApp.address || '—'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Church Information */}
                    <div>
                      <h4 className="font-semibold text-navy-900 text-sm mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-gold-500" /> Church Background</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Church Name</p>
                          <p className="text-sm text-navy-900">{selectedApp.church_name || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Denomination</p>
                          <p className="text-sm text-navy-900">{selectedApp.denomination || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Pastor Name</p>
                          <p className="text-sm text-navy-900">{selectedApp.pastor_name || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Born Again</p>
                          <p className="text-sm text-navy-900">{selectedApp.born_again || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Water Baptism Date</p>
                          <p className="text-sm text-navy-900">{selectedApp.water_baptism_date || '—'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-slate-400 mb-0.5">Church Involvement</p>
                          <p className="text-sm text-navy-900">{selectedApp.church_involvement || '—'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div>
                      <h4 className="font-semibold text-navy-900 text-sm mb-3 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-gold-500" /> Academic Information</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Course Applied</p>
                          <p className="text-sm font-medium text-navy-900">{selectedApp.course_applied || selectedApp.applying_for || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Previous Education</p>
                          <p className="text-sm text-navy-900">{selectedApp.previous_education || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Mother Tongue</p>
                          <p className="text-sm text-navy-900">{selectedApp.mother_tongue || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Other Languages</p>
                          <p className="text-sm text-navy-900">{selectedApp.other_languages || '—'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Calling & Purpose */}
                    <div>
                      <h4 className="font-semibold text-navy-900 text-sm mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold-500" /> Calling & Purpose</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Calling Aim</p>
                          <p className="text-sm text-navy-900">{selectedApp.calling_aim || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Statement of Purpose</p>
                          <p className="text-sm text-navy-900 leading-relaxed">{selectedApp.statement_of_purpose || selectedApp.statement || '—'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Fee Information */}
                    <div>
                      <h4 className="font-semibold text-navy-900 text-sm mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-gold-500" /> Fee Information</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Can Pay Fees</p>
                          <p className="text-sm text-navy-900">{selectedApp.can_pay_fees === true ? 'Yes' : selectedApp.can_pay_fees === false ? 'No' : '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Fee Sponsor</p>
                          <p className="text-sm text-navy-900">{selectedApp.fee_sponsor || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Guardian Name</p>
                          <p className="text-sm text-navy-900">{selectedApp.guardian_name || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Parent Occupation</p>
                          <p className="text-sm text-navy-900">{selectedApp.parent_occupation || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Annual Income</p>
                          <p className="text-sm text-navy-900">{selectedApp.annual_income || '—'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">Status</label>
                          <select value={appForm.status} onChange={(e) => setAppForm((f) => ({ ...f, status: e.target.value }))} className="input-field">
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1.5">Submitted</p>
                          <p className="text-sm text-navy-900">{new Date(selectedApp.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div>
                        <label className="label">Review Notes</label>
                        <textarea value={appForm.review_notes} onChange={(e) => setAppForm((f) => ({ ...f, review_notes: e.target.value }))} rows={3} className="input-field resize-none" placeholder="Add notes about this application..." />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={savingApp} className="btn-primary flex-1">
                        {savingApp ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button type="button" onClick={() => setShowAppModal(false)} className="btn-secondary">Cancel</button>
                      <button type="button" onClick={() => { confirmDeleteApplication(selectedApp); setShowAppModal(false); }} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium">
                        Delete
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* DOWNLOADS */}
            {tab === 'downloads' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button onClick={() => setShowDownloadForm(!showDownloadForm)} className="btn-primary">
                    <Plus className="w-4 h-4" /> Upload File
                  </button>
                </div>

                {showDownloadForm && (
                  <div className="card p-6">
                    <h3 className="font-semibold text-navy-900 mb-4">Upload New File</h3>
                    <form onSubmit={saveDownload} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          value={downloadForm.title}
                          onChange={(e) => setDownloadForm((f) => ({ ...f, title: e.target.value }))}
                          className="input-field"
                          placeholder="Title *"
                          required
                        />
                        <select
                          value={downloadForm.category}
                          onChange={(e) => setDownloadForm((f) => ({ ...f, category: e.target.value as DownloadCategory }))}
                          className="input-field"
                        >
                          {downloadCategories.map((c) => (
                            <option key={c} value={c}>{catLabel[c]}</option>
                          ))}
                        </select>
                      </div>
                      <input
                        value={downloadForm.semester}
                        onChange={(e) => setDownloadForm((f) => ({ ...f, semester: e.target.value }))}
                        className="input-field"
                        placeholder="Semester (optional, e.g., Spring 2025)"
                      />
                      <textarea
                        value={downloadForm.description}
                        onChange={(e) => setDownloadForm((f) => ({ ...f, description: e.target.value }))}
                        rows={2}
                        className="input-field resize-none"
                        placeholder="Description (optional)"
                      />
                      <div>
                        <label className="label mb-1.5 block">File</label>
                        <div className="flex items-center gap-3">
                          {downloadForm.file_url && (
                            <a
                              href={downloadForm.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-sm text-green-600"
                            >
                              <FileText className="w-4 h-4" /> File uploaded
                            </a>
                          )}
                          <label
                            htmlFor="download-file-upload"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                              downloadFileUploading ? 'bg-slate-100 text-slate-400' : 'bg-navy-800 text-white hover:bg-navy-700'
                            }`}
                          >
                            {downloadFileUploading
                              ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</>
                              : <><Upload className="w-4 h-4" /> {downloadForm.file_url ? 'Replace File' : 'Upload File'}</>
                            }
                          </label>
                          <input
                            id="download-file-upload"
                            type="file"
                            accept="application/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const url = await uploadDownloadFile(file);
                              if (url) {
                                setDownloadForm((f) => ({ ...f, file_url: url }));
                              }
                              e.target.value = '';
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={savingDownload || !downloadForm.file_url} className="btn-primary">
                          {savingDownload ? 'Saving...' : 'Save File'}
                        </button>
                        <button type="button" onClick={() => { setShowDownloadForm(false); setDownloadForm({ title: '', category: 'general', description: '', semester: '', file_url: '' }); }} className="btn-secondary">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="card overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <h2 className="font-serif font-bold text-navy-900">Downloads Library ({downloads.length})</h2>
                  </div>
                  {downloads.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-sm">No files uploaded yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wide">
                          <tr>
                            <th className="px-4 py-3 text-left">Title</th>
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-left">Semester</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Added</th>
                            <th className="px-4 py-3" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {downloads.map((d) => (
                            <tr key={d.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                  <a
                                    href={d.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-navy-900 hover:text-gold-600 hover:underline transition-colors"
                                  >
                                    {d.title}
                                  </a>
                                </div>
                                {d.description && (
                                  <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{d.description}</p>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  d.category === 'academic_calendar' ? 'bg-blue-100 text-blue-700' :
                                  d.category === 'syllabus' ? 'bg-purple-100 text-purple-700' :
                                  d.category === 'application_form' ? 'bg-green-100 text-green-700' :
                                  d.category === 'result' ? 'bg-orange-100 text-orange-700' :
                                  d.category === 'policy' ? 'bg-red-100 text-red-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {catLabel[d.category] ?? d.category}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600 text-xs">{d.semester ?? '—'}</td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => toggleDownloadActive(d.id, !d.is_active)}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                                    d.is_active
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                  }`}
                                >
                                  {d.is_active ? <><Check className="w-3 h-3" /> Active</> : 'Hidden'}
                                </button>
                              </td>
                              <td className="px-4 py-3 text-slate-500 text-xs">
                                {new Date(d.created_at).toLocaleDateString('en-IN')}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <a
                                  href={d.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded inline-block mr-1"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() => deleteDownload(d.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SITE IMAGES */}
            {tab === 'settings' && (
              <div className="space-y-4">
                {/* Principal Greeting Settings */}
                <div className="card p-6">
                  <div className="flex items-center gap-3 mb-1">
                    <Bell className="w-5 h-5 text-gold-600" />
                    <h2 className="font-serif font-bold text-navy-900 text-lg">Principal's Greeting</h2>
                  </div>
                  <p className="text-slate-500 text-sm mb-5">Configure the greeting modal shown to first-time visitors.</p>

                  <form onSubmit={saveGreetingSettings} className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-navy-900">Show Greeting Modal</p>
                        <p className="text-xs text-slate-500">Display the principal's greeting to new visitors</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGreetingEnabled(!greetingEnabled)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${greetingEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${greetingEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="label text-xs">Principal's Name</label>
                        <input
                          type="text"
                          value={greetingName}
                          onChange={(e) => setGreetingName(e.target.value)}
                          className="input-field"
                          placeholder="e.g., Rev. Dr. John Smith"
                        />
                      </div>
                      <div>
                        <label className="label text-xs">Title</label>
                        <input
                          type="text"
                          value={greetingTitle}
                          onChange={(e) => setGreetingTitle(e.target.value)}
                          className="input-field"
                          placeholder="e.g., Principal, ABC"
                        />
                      </div>
                    </div>

                    {/* Greeting Image */}
                    <div>
                      <label className="label text-xs mb-1.5 block">Greeting Image</label>
                      <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg">
                        {greetingImage && (
                          <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 bg-white">
                            <img src={greetingImage} alt="Greeting" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <label
                            htmlFor="greeting-image-upload"
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                              greetingImageUploading ? 'bg-slate-100 text-slate-400' : 'bg-navy-800 text-white hover:bg-navy-700'
                            }`}
                          >
                            {greetingImageUploading
                              ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</>
                              : <><Upload className="w-4 h-4" /> {greetingImage ? 'Change Image' : 'Upload Image'}</>
                            }
                          </label>
                          <input
                            id="greeting-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadGreetingImage(file);
                            }}
                          />
                          <p className="text-xs text-slate-400 mt-1.5">Recommended: 800x500px, JPG/PNG</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button type="submit" disabled={greetingSaving} className="btn-primary">
                        {greetingSaving ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Settings</>}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Hero Opacity Slider */}
                <div className="card p-6">
                  <div className="flex items-center gap-3 mb-1">
                    <Image className="w-5 h-5 text-gold-600" />
                    <h2 className="font-serif font-bold text-navy-900 text-lg">Hero Background Opacity</h2>
                  </div>
                  <p className="text-slate-500 text-sm mb-5">Control how transparent the hero background image is. Lower = more image visible, Higher = darker overlay.</p>

                  <div className="space-y-4">
                    {/* Live preview */}
                    <div
                      className="w-full h-36 rounded-xl overflow-hidden relative"
                      style={{
                        backgroundImage: `url('${siteSettings.find((s) => s.setting_key === 'home_hero_image')?.setting_value || 'https://images.pexels.com/photos/289737/pexels-photo-289737.jpeg?auto=compress&cs=tinysrgb&w=800'}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: `rgba(17,20,64,${heroOpacity})` }}
                      />
                      <div className="relative z-10 h-full flex items-center justify-center">
                        <p className="text-white font-serif text-lg font-bold text-shadow">Aizawl Bible College</p>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                        Opacity: {Math.round(heroOpacity * 100)}%
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-500 w-16 text-right">Transparent</span>
                      <input
                        type="range"
                        min="0.3"
                        max="0.98"
                        step="0.01"
                        value={heroOpacity}
                        onChange={(e) => setHeroOpacity(parseFloat(e.target.value))}
                        className="flex-1 accent-navy-800"
                      />
                      <span className="text-xs text-slate-500 w-12">Dark</span>
                      <span className="text-sm font-mono font-semibold text-navy-900 w-12">{Math.round(heroOpacity * 100)}%</span>
                    </div>

                    <button
                      onClick={saveHeroOpacity}
                      disabled={heroOpacitySaving}
                      className="btn-primary"
                    >
                      {heroOpacitySaving ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Opacity</>}
                    </button>
                  </div>
                </div>

                {/* Site Image Settings */}
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
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
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

            {/* PAYMENT SETTINGS */}
            {tab === 'payment' && (
              <div className="space-y-6">
                <div className="card p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-5 h-5 text-navy-700" />
                    <h2 className="font-serif font-bold text-navy-900">Razorpay Payment Settings</h2>
                  </div>

                  {paymentSettingsSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4 text-green-700 text-sm">
                      <Check className="w-4 h-4" /> Payment settings saved successfully!
                    </div>
                  )}

                  <form onSubmit={savePaymentSettings} className="space-y-5">
                    {/* Enable/Disable Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <p className="font-medium text-navy-900">Enable Razorpay Payments</p>
                        <p className="text-sm text-slate-500 mt-0.5">Allow students to make online payments through Razorpay</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={razorpayEnabled}
                          onChange={(e) => setRazorpayEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-navy-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-700"></div>
                      </label>
                    </div>

                    {/* API Keys Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-navy-900 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-gold-500" /> API Credentials
                      </h3>

                      <div>
                        <label className="label">Razorpay Key ID</label>
                        <input
                          type="text"
                          value={razorpayKeyId}
                          onChange={(e) => setRazorpayKeyId(e.target.value)}
                          placeholder="rzp_live_xxxxxxxx or rzp_test_xxxxxxxx"
                          className="input-field font-mono text-sm"
                        />
                        <p className="text-xs text-slate-400 mt-1">Find this in your Razorpay Dashboard under Settings &gt; API Keys</p>
                      </div>

                      <div>
                        <label className="label">Razorpay Key Secret</label>
                        <input
                          type="password"
                          value={razorpayKeySecret}
                          onChange={(e) => setRazorpayKeySecret(e.target.value)}
                          placeholder="Your secret key (kept secure)"
                          className="input-field font-mono text-sm"
                        />
                        <p className="text-xs text-slate-400 mt-1">Keep this secret! Never share it publicly.</p>
                      </div>

                      <div>
                        <label className="label">Webhook Secret (Optional)</label>
                        <input
                          type="text"
                          value={razorpayWebhookSecret}
                          onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
                          placeholder="For verifying webhook signatures"
                          className="input-field font-mono text-sm"
                        />
                        <p className="text-xs text-slate-400 mt-1">Used to verify payment notifications from Razorpay</p>
                      </div>
                    </div>

                    {/* Setup Instructions */}
                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <h4 className="text-sm font-semibold text-amber-900 mb-2">Setup Instructions</h4>
                      <ol className="text-xs text-amber-800 space-y-1.5 list-decimal list-inside">
                        <li>Create a Razorpay account at <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">razorpay.com</a></li>
                        <li>Complete KYC verification for live payments</li>
                        <li>Go to Dashboard &gt; Settings &gt; API Keys</li>
                        <li>Generate Key ID and Key Secret</li>
                        <li>Copy and paste them above</li>
                        <li>Set up webhooks in Razorpay to receive payment confirmations</li>
                      </ol>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <button
                        type="submit"
                        disabled={paymentSettingsSaving}
                        className="btn-primary flex items-center gap-2"
                      >
                        {paymentSettingsSaving ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" /> Save Payment Settings
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MESSAGES */}
            {tab === 'messages' && (
              <div className="space-y-4">
                <div className="card overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="font-serif font-bold text-navy-900">Contact Messages ({contactMessages.length})</h2>
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
                        <div key={msg.id} className={`p-5 transition-colors ${msg.is_read ? 'bg-white' : 'bg-blue-50/40'}`}>
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
                                >
                                  <Check className="w-3.5 h-3.5" /> Read
                                </button>
                              )}
                              <button
                                onClick={() => deleteMessage(msg.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
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

      {/* Board Member Edit Modal */}
      {editingBoardMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setEditingBoardMember(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-navy-600" />
                <h2 className="text-lg font-serif font-bold text-navy-900">Edit Board Member</h2>
              </div>
              <button onClick={() => setEditingBoardMember(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveBoardMemberEdit} className="space-y-4">
              <div>
                <label className="label text-xs">Full Name *</label>
                <input value={boardEditForm.name} onChange={(e) => setBoardEditForm((f) => ({ ...f, name: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label className="label text-xs">Designation</label>
                <input value={boardEditForm.designation} onChange={(e) => setBoardEditForm((f) => ({ ...f, designation: e.target.value }))} className="input-field" placeholder="e.g., Chairman, Secretary" />
              </div>
              <div>
                <label className="label text-xs">Display Order</label>
                <input type="number" value={boardEditForm.display_order} onChange={(e) => setBoardEditForm((f) => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} className="input-field" />
              </div>
              <div>
                <label className="label text-xs mb-1.5 block">Photo</label>
                <div className="flex items-center gap-3">
                  {boardEditForm.photo_url && (
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-slate-200">
                      <img src={boardEditForm.photo_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label htmlFor="board-edit-photo" className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${boardEditPhotoUploading ? 'bg-slate-100 text-slate-400' : 'bg-navy-800 text-white hover:bg-navy-700'}`}>
                    {boardEditPhotoUploading ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> {boardEditForm.photo_url ? 'Change Photo' : 'Upload Photo'}</>}
                  </label>
                  <input id="board-edit-photo" type="file" accept="image/*" className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await uploadBoardEditPhoto(file);
                      if (url) setBoardEditForm((f) => ({ ...f, photo_url: url }));
                      e.target.value = '';
                    }}
                  />
                  {boardEditForm.photo_url && (
                    <button type="button" onClick={() => setBoardEditForm((f) => ({ ...f, photo_url: '' }))} className="text-red-500 hover:text-red-700 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={savingBoardEdit || boardEditPhotoUploading} className="btn-primary flex-1 justify-center">
                  {savingBoardEdit ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Changes</>}
                </button>
                <button type="button" onClick={() => setEditingBoardMember(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Graduation Modal */}
      {showGraduationModal && graduationForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowGraduationModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-gold-600" />
                <h2 className="text-lg font-serif font-bold text-navy-900">Mark as Graduated</h2>
              </div>
              <button onClick={() => setShowGraduationModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {graduationError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5" />{graduationError}
              </div>
            )}
            <div className="mb-4 p-3 bg-gold-50 border border-gold-200 rounded-lg">
              <p className="text-sm text-navy-800">
                <span className="font-semibold">{graduationForm.userName}</span> will be marked as graduated.
              </p>
              <p className="text-xs text-slate-600 mt-1">A certificate will be automatically generated and stored in their profile.</p>
            </div>
            <form onSubmit={processGraduation} className="space-y-4">
              <div>
                <label className="label">Student Name (on certificate)</label>
                <input
                  type="text"
                  value={graduationForm.userName}
                  onChange={(e) => setGraduationForm((f) => f ? { ...f, userName: e.target.value } : null)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Course / Program</label>
                <input
                  type="text"
                  value={graduationForm.course}
                  onChange={(e) => setGraduationForm((f) => f ? { ...f, course: e.target.value } : null)}
                  placeholder="e.g., Bachelor of Theology"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Completion Date</label>
                <input
                  type="date"
                  value={graduationForm.completionDate}
                  onChange={(e) => setGraduationForm((f) => f ? { ...f, completionDate: e.target.value } : null)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">PATA Registration No.</label>
                <input
                  type="text"
                  value={graduationForm.pataRegNo}
                  onChange={(e) => setGraduationForm((f) => f ? { ...f, pataRegNo: e.target.value } : null)}
                  placeholder="e.g., PATA-2024-001"
                  className="input-field"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={processingGraduation} className="btn-primary flex-1 justify-center">
                  {processingGraduation ? <><Loader className="w-4 h-4 animate-spin" /> Processing...</> : <><Award className="w-4 h-4" /> Generate Certificate</>}
                </button>
                <button type="button" onClick={() => setShowGraduationModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {confirmConfig && (
        <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />
      )}

      {/* Faculty Edit Modal */}
      {facultyEditTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setFacultyEditTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-navy-600" />
                <h2 className="text-lg font-serif font-bold text-navy-900">Manage Faculty Profile</h2>
              </div>
              <button onClick={() => setFacultyEditTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5 p-3 bg-slate-50 rounded-xl">
              {facultyEditTarget.avatar_url ? (
                <img src={facultyEditTarget.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-navy-700 font-bold text-lg">{(facultyEditTarget.full_name ?? facultyEditTarget.email ?? 'F')[0].toUpperCase()}</span>
                </div>
              )}
              <div>
                <p className="font-semibold text-navy-900">{facultyEditTarget.full_name ?? 'No name'}</p>
                <p className="text-xs text-slate-400">{facultyEditTarget.email}</p>
              </div>
              <div className="ml-auto">
                <label
                  htmlFor="faculty-avatar-upload"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border border-slate-200 hover:bg-slate-100 transition-colors ${facultyPhotoUploading ? 'text-slate-400 pointer-events-none' : 'text-slate-600'}`}
                >
                  {facultyPhotoUploading ? <><Loader className="w-3.5 h-3.5 animate-spin" /> Uploading</> : <><Upload className="w-3.5 h-3.5" /> Photo</>}
                </label>
                <input
                  id="faculty-avatar-upload"
                  ref={facultyPhotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadFacultyPhoto(file);
                    if (url) {
                      await supabase.from('profiles').update({ avatar_url: url }).eq('id', facultyEditTarget.id);
                      setUsers((prev) => prev.map((u) => u.id === facultyEditTarget.id ? { ...u, avatar_url: url } : u));
                      setFacultyEditTarget((t) => t ? { ...t, avatar_url: url } : null);
                    }
                    e.target.value = '';
                  }}
                />
              </div>
            </div>

            <form onSubmit={saveFacultyEdit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="label text-xs">Full Name</label>
                  <input value={facultyEditForm.full_name} onChange={(e) => setFacultyEditForm((f) => ({ ...f, full_name: e.target.value }))} className="input-field" placeholder="Full name" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label text-xs">Current Position</label>
                  <input value={facultyEditForm.position} onChange={(e) => setFacultyEditForm((f) => ({ ...f, position: e.target.value }))} className="input-field" placeholder="e.g., Principal, Academic Dean, Male Warden, Female Warden, Lecturer" />
                </div>
                <div>
                  <label className="label text-xs">Qualification</label>
                  <input value={facultyEditForm.qualification} onChange={(e) => setFacultyEditForm((f) => ({ ...f, qualification: e.target.value }))} className="input-field" placeholder="e.g., M.Div., Ph.D." />
                </div>
                <div>
                  <label className="label text-xs">Subject In Charge</label>
                  <input value={facultyEditForm.subject_in_charge} onChange={(e) => setFacultyEditForm((f) => ({ ...f, subject_in_charge: e.target.value }))} className="input-field" placeholder="e.g., Old Testament" />
                </div>
                <div>
                  <label className="label text-xs">Phone</label>
                  <input value={facultyEditForm.phone} onChange={(e) => setFacultyEditForm((f) => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="Contact number" />
                </div>
                <div>
                  <label className="label text-xs">Address</label>
                  <input value={facultyEditForm.address} onChange={(e) => setFacultyEditForm((f) => ({ ...f, address: e.target.value }))} className="input-field" placeholder="Address" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label text-xs">Bio</label>
                  <textarea value={facultyEditForm.bio} onChange={(e) => setFacultyEditForm((f) => ({ ...f, bio: e.target.value }))} rows={3} className="input-field resize-none" placeholder="Short biography..." />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={savingFacultyEdit} className="btn-primary flex-1 justify-center">
                  {savingFacultyEdit ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Changes</>}
                </button>
                <button type="button" onClick={() => setFacultyEditTarget(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
