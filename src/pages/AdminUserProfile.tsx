import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, MapPin, BookOpen, Calendar,
  Loader, Award, GraduationCap, FileCheck, CreditCard as IdCard,
  Clock, DollarSign, Sparkles, Palette,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile, Transaction } from '../lib/supabase';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CertificateDocument } from '../components/CertificateDocument';
import { getTheme } from '../lib/themes';

type ApplicationSummary = {
  id: string;
  status: string;
  course_applied: string | null;
  applying_for: string | null;
  submitted_at: string;
};

export default function AdminUserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [application, setApplication] = useState<ApplicationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    loadUser(id);
  }, [id]);

  async function loadUser(userId: string) {
    setLoading(true);
    setError('');

    const [profileRes, txRes, appRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('transactions').select('*').eq('user_id', userId).order('payment_date', { ascending: false }),
      supabase.from('applications').select('id, status, course_applied, applying_for, submitted_at').eq('user_id', userId).order('submitted_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    if (profileRes.error) {
      setError('Could not load user profile.');
    } else {
      setProfile(profileRes.data);
    }

    setTransactions(txRes.data ?? []);
    setApplication(appRes.data ?? null);
    setLoading(false);
  }

  const yearLabel: Record<string, string> = {
    '1st_year': '1st Year',
    '2nd_year': '2nd Year',
    'final_year': 'Final Year',
  };

  const roleBadge: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    faculty: 'bg-navy-100 text-navy-700',
    student: 'bg-gold-100 text-gold-700',
    standard: 'bg-slate-100 text-slate-700',
  };

  const statusColor: Record<string, string> = {
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    reviewed: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
  };

  const isPrincipal = profile?.role === 'faculty' && (profile as any)?.position === 'Principal';
  const isDesigner = profile?.email === 'tkpaite2016@gmail.com';
  const theme = getTheme(profile?.profile_theme);

  const totalPaid = transactions.reduce((sum, t) => sum + t.amount, 0);

  function certificateId() {
    const year = profile?.completion_date
      ? new Date(profile.completion_date).getFullYear()
      : new Date().getFullYear();
    return `ABC-${year}-${profile?.id.slice(0, 8).toUpperCase()}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="w-7 h-7 animate-spin text-gold-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600">{error || 'User not found.'}</p>
        <button onClick={() => navigate('/admin')} className="btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="page-enter min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back link */}
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-navy-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
        </Link>

        {/* Profile card */}
        <div className={`card overflow-hidden ${theme.ringClass} ${isPrincipal ? 'ring-2 ring-gold-400' : ''} ${isDesigner ? 'ring-2 ring-purple-400 relative' : ''}`}>
          {/* Special Designer Badge */}
          {isDesigner && (
            <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
              <Palette className="w-3.5 h-3.5" />
              <span>DESIGNER</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          )}
          {/* Cover */}
          <div className="relative">
            <div className={`h-32 ${
              isDesigner
                ? 'bg-gradient-to-r from-purple-900 via-pink-600 to-purple-900'
                : isPrincipal
                  ? 'bg-gradient-to-r from-navy-900 via-navy-800 to-gold-700'
                  : profile.graduated
                    ? 'bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400'
                    : theme.coverClass
            }`} />
            {isDesigner && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-purple-600/30" />
            )}
            {theme.shimmerClass && !isDesigner && !isPrincipal && (
              <div className={`absolute inset-0 overflow-hidden ${theme.shimmerClass}`} />
            )}
          </div>

          {/* Avatar - centered at bottom of cover */}
          <div className="px-6 pb-6">
            <div className="flex flex-col items-center -mt-16 mb-4">
              <div className={`w-28 h-28 rounded-full border-4 ${isDesigner ? 'border-purple-400 ring-4 ring-pink-400/50' : isPrincipal ? 'border-gold-400' : theme.avatarBorderClass} shadow-xl overflow-hidden bg-navy-200 relative`}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl font-bold text-navy-700">
                      {(profile.full_name ?? profile.email ?? 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                {profile.graduated && (
                  <div className="absolute inset-0 bg-gold-400/20 flex items-center justify-center">
                    <Award className="w-12 h-12 text-white drop-shadow" />
                  </div>
                )}
              </div>
            </div>

            {/* Role Badges - below avatar */}
            <div className="flex justify-center flex-wrap items-center gap-2 mb-4">
              {isPrincipal && (
                <div className="flex items-center gap-2 bg-gold-100 border border-gold-300 px-4 py-2 rounded-full shadow-sm">
                  <Award className="w-4 h-4 text-gold-600" />
                  <span className="font-bold text-navy-900 text-sm tracking-wide">PRINCIPAL</span>
                </div>
              )}
              {profile.graduated && !isPrincipal && !isDesigner && (
                <div className="flex items-center gap-2 bg-gold-100 border border-gold-200 px-4 py-2 rounded-full shadow-sm">
                  <GraduationCap className="w-4 h-4 text-gold-600" />
                  <span className="font-bold text-navy-900 text-sm tracking-wide">GRADUATED</span>
                </div>
              )}
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${roleBadge[profile.role]}`}>
                {profile.role}
              </span>
            </div>

            {/* Name */}
            <div className="text-center mb-4">
              <h1 className={`text-2xl font-serif font-bold ${isDesigner ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent' : 'text-navy-900'}`}>
                {profile.full_name ?? 'No name set'}
              </h1>
              {isDesigner && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white shadow-sm mt-2">
                  <Palette className="w-3 h-3" /> Designer
                </span>
              )}
            </div>

            {/* Additional role badges */}
            <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
              {(profile.role === 'faculty' || profile.role === 'admin') && (profile as any).position && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gold-100 text-gold-700">
                  <Award className="w-3 h-3" /> {(profile as any).position}
                </span>
              )}
              {profile.role === 'student' && profile.student_year && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gold-100 text-gold-700">
                  <Calendar className="w-3 h-3" /> {yearLabel[profile.student_year]}
                </span>
              )}
              {profile.graduated && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  <Award className="w-3 h-3" /> Graduated
                </span>
              )}
            </div>

            {/* Contact */}
            <div className="mt-6 space-y-2.5">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="w-4 h-4 text-gold-500 flex-shrink-0" />
                <span className="text-sm">{profile.email ?? '—'}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="w-4 h-4 text-gold-500 flex-shrink-0" />
                  <span className="text-sm">{profile.phone}</span>
                </div>
              )}
              {profile.address && (
                <div className="flex items-start gap-3 text-slate-600">
                  <MapPin className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{profile.address}</span>
                </div>
              )}
              {profile.bio && (
                <div className="flex items-start gap-3 text-slate-600">
                  <BookOpen className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-6 pt-4 border-t border-slate-100">
              Member since {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Faculty info */}
        {(profile.role === 'faculty' || profile.role === 'admin') && ((profile as any).position || profile.qualification || profile.subject_in_charge) && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-navy-900 flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-gold-500" /> Faculty Information
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {(profile as any).position && (
                <div className="col-span-2">
                  <p className="text-slate-400 text-xs mb-0.5">Position</p>
                  <p className="font-semibold text-navy-900">{(profile as any).position}</p>
                </div>
              )}
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Qualification</p>
                <p className="font-medium text-navy-900">{profile.qualification || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Subject In Charge</p>
                <p className="font-medium text-navy-900">{profile.subject_in_charge || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Phone</p>
                <p className="font-medium text-navy-900">{profile.phone || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Address</p>
                <p className="font-medium text-navy-900">{profile.address || '—'}</p>
              </div>
              {profile.bio && (
                <div className="col-span-2">
                  <p className="text-slate-400 text-xs mb-0.5">Bio</p>
                  <p className="font-medium text-navy-900 leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Academic info (students only) */}
        {profile.role === 'student' && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-navy-900 flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-gold-500" /> Academic Information
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Course / Program</p>
                <p className="font-medium text-navy-900">{profile.course || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Year of Study</p>
                <p className="font-medium text-navy-900">
                  {profile.student_year ? yearLabel[profile.student_year] : '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Date of Admission</p>
                <p className="font-medium text-navy-900">
                  {profile.admission_date
                    ? new Date(profile.admission_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Status</p>
                <p className={`font-medium ${profile.graduated ? 'text-green-600' : 'text-navy-900'}`}>
                  {profile.graduated ? 'Completed / Graduated' : 'In Progress'}
                </p>
              </div>
              {profile.completion_date && (
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Completion Date</p>
                  <p className="font-medium text-navy-900">
                    {new Date(profile.completion_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Application summary */}
        {application && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-navy-900 flex items-center gap-2 mb-4">
              <IdCard className="w-4 h-4 text-gold-500" /> Admission Application
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColor[application.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {application.status}
              </span>
              <span className="text-sm text-slate-600">
                {application.course_applied ?? application.applying_for ?? 'Program not specified'}
              </span>
              <span className="text-xs text-slate-400 ml-auto">
                Submitted {new Date(application.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        )}

        {/* Certificate */}
        {profile.role === 'student' && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-navy-900 flex items-center gap-2 mb-4">
              <FileCheck className="w-4 h-4 text-gold-500" /> Certificate
            </h2>
            {profile.graduated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                  <Award className="w-4 h-4" /> Certificate issued
                </div>
                <div className="flex flex-wrap gap-3">
                  <PDFDownloadLink
                    document={
                      <CertificateDocument
                        studentName={profile.full_name || 'Student'}
                        course={profile.course || 'Theology Program'}
                        completionDate={profile.completion_date || new Date().toISOString()}
                        certificateId={certificateId()}
                      />
                    }
                    fileName={`${profile.full_name?.replace(/\s+/g, '_') || 'Student'}_Certificate.pdf`}
                    className="btn-primary text-sm flex items-center gap-2"
                  >
                    {({ loading: l }) => (
                      <>{l ? 'Preparing...' : 'Download Certificate PDF'}</>
                    )}
                  </PDFDownloadLink>
                  {profile.certificate_url && (
                    <a
                      href={profile.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      View Stored PDF
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Certificate not yet issued.</p>
            )}
          </div>
        )}

        {/* Fee transactions — students only */}
        {profile.role === 'student' && <div className="card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-navy-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gold-500" /> Fee Transactions
            </h2>
            {transactions.length > 0 && (
              <span className="text-sm font-semibold text-navy-900">
                Total: ₹{totalPaid.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {transactions.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">No transactions recorded.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Season</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-navy-900">{t.season}</td>
                    <td className="px-4 py-3 text-green-700 font-semibold">₹{Number(t.amount).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 capitalize text-slate-600">{t.payment_method}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(t.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{t.reference_no || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>}

      </div>
    </div>
  );
}
