import { useState, useRef, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, CreditCard as Edit2, Save, X, BookOpen,
  Calendar, Loader, RefreshCw, Upload, Award, FileCheck, GraduationCap,
  CreditCard, IndianRupee, Plus, CheckCircle, AlertCircle, Sparkles, Palette,
  Ban, Bell, CheckCheck, Clock,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Notification } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getTheme } from '../lib/themes';

type Transaction = {
  id: string;
  season: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  payment_type: string;
  status: string;
  receipt_number: string | null;
  reference_no: string | null;
  notes: string | null;
};

export default function Profile() {
  const { profile, profileLoading, profileError, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    address: profile?.address ?? '',
    bio: profile?.bio ?? '',
    avatar_url: profile?.avatar_url ?? '',
    course: profile?.course ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Payment state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_type: 'fee' as 'fee' | 'mess',
    payment_method: 'online' as 'cash' | 'bank_transfer' | 'online' | 'cheque',
    notes: '',
  });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Razorpay state
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState('');

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  function openEdit() {
    setForm({
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      address: profile?.address ?? '',
      bio: profile?.bio ?? '',
      avatar_url: profile?.avatar_url ?? '',
      course: profile?.course ?? '',
    });
    setAvatarPreview(null);
    setEditing(true);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function uploadAvatar(file: File): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const fileName = `avatars/${profile!.id}_${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from('photos')
      .upload(fileName, file, { upsert: true });

    if (uploadErr) {
      setError(uploadErr.message);
      return null;
    }

    const { data } = supabase.storage.from('photos').getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    let avatarUrl = form.avatar_url;
    const file = avatarInputRef.current?.files?.[0];
    if (file) {
      setUploadingAvatar(true);
      const uploadedUrl = await uploadAvatar(file);
      if (uploadedUrl) avatarUrl = uploadedUrl;
      setUploadingAvatar(false);
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone: form.phone,
        address: form.address,
        bio: form.bio,
        avatar_url: avatarUrl,
        course: form.course || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile!.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    await refreshProfile();
    setSaving(false);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleRetry() {
    setRetrying(true);
    await refreshProfile();
    setRetrying(false);
  }

  // Load transactions and notifications
  useEffect(() => {
    if (!profile?.id) return;
    loadNotifications();
    if (profile.role === 'student') {
      loadTransactions();
      loadRazorpaySettings();
    }
  }, [profile?.id, profile?.role]);

  async function loadTransactions() {
    setTransactionsLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', profile!.id)
      .order('created_at', { ascending: false });
    setTransactions(data ?? []);
    setTransactionsLoading(false);
  }

  async function loadRazorpaySettings() {
    const { data } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['razorpay_enabled', 'razorpay_key_id']);
    if (data) {
      const enabledSetting = data.find((s) => s.setting_key === 'razorpay_enabled');
      if (enabledSetting) setRazorpayEnabled(enabledSetting.setting_value === 'true');
      const keyIdSetting = data.find((s) => s.setting_key === 'razorpay_key_id');
      if (keyIdSetting) setRazorpayKeyId(keyIdSetting.setting_value || '');
    }
  }

  async function loadNotifications() {
    setNotifLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile!.id)
      .order('created_at', { ascending: false })
      .limit(20);
    const notifs = data ?? [];
    setNotifications(notifs);
    setUnreadCount(notifs.filter((n) => !n.is_read).length);
    setNotifLoading(false);
  }

  async function markNotifRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function markAllRead() {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', profile!.id).eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    setPaymentError('');
    setPaymentSubmitting(true);

    try {
      const amount = parseFloat(paymentForm.amount);

      // If Razorpay is enabled and payment method is online, use Razorpay
      if (razorpayEnabled && razorpayKeyId && paymentForm.payment_method === 'online') {
        await initiateRazorpayPayment(amount);
        return;
      }

      // Manual payment recording
      const timestamp = Date.now();
      const receiptNum = `RCP-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(timestamp).slice(-5)}`;

      const { error: txError } = await supabase.from('transactions').insert({
        user_id: profile!.id,
        season: `Payment - ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`,
        amount: amount,
        payment_type: paymentForm.payment_type,
        payment_method: paymentForm.payment_method,
        status: 'completed',
        receipt_number: receiptNum,
        notes: paymentForm.notes || null,
        recorded_by: profile!.id,
      });

      if (txError) throw txError;

      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setShowPaymentForm(false);
        setPaymentForm({ amount: '', payment_type: 'fee', payment_method: 'online', notes: '' });
        loadTransactions();
      }, 2000);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setPaymentSubmitting(false);
    }
  }

  async function initiateRazorpayPayment(amount: number) {
    if (!(window as any).Razorpay) {
      setPaymentError('Razorpay SDK not loaded. Please refresh the page and try again.');
      setPaymentSubmitting(false);
      return;
    }

    const timestamp = Date.now();
    const receiptNum = `RCP-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(timestamp).slice(-5)}`;

    const options = {
      key: razorpayKeyId,
      amount: amount * 100,
      currency: 'INR',
      name: 'Aizawl Bible College',
      description: `${paymentForm.payment_type === 'fee' ? 'Fee' : 'Mess'} Payment`,
      order_id: undefined as string | undefined,
      handler: async (response: any) => {
        try {
          const { error: txError } = await supabase.from('transactions').insert({
            user_id: profile!.id,
            season: `Payment - ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`,
            amount: amount,
            payment_type: paymentForm.payment_type,
            payment_method: 'online',
            status: 'completed',
            receipt_number: receiptNum,
            notes: paymentForm.notes || null,
            recorded_by: profile!.id,
            gateway: 'razorpay',
            gateway_order_id: response.razorpay_order_id,
            gateway_payment_id: response.razorpay_payment_id,
            gateway_signature: response.razorpay_signature,
          });

          if (txError) throw txError;

          setPaymentSuccess(true);
          setTimeout(() => {
            setPaymentSuccess(false);
            setShowPaymentForm(false);
            setPaymentForm({ amount: '', payment_type: 'fee', payment_method: 'online', notes: '' });
            loadTransactions();
          }, 2000);
        } catch (err) {
          setPaymentError('Payment recorded but failed to save. Please contact admin.');
        } finally {
          setPaymentSubmitting(false);
        }
      },
      prefill: {
        name: profile?.full_name || '',
        email: profile?.email || '',
        contact: profile?.phone || '',
      },
      theme: {
        color: '#0F1B3D',
      },
      modal: {
        ondismiss: () => {
          setPaymentSubmitting(false);
          setPaymentError('Payment cancelled.');
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
    setPaymentSubmitting(false);
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader className="w-8 h-8 animate-spin text-gold-500" />
          <p className="text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="card max-w-sm w-full p-8 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="text-lg font-serif font-bold text-navy-900 mb-2">Profile unavailable</h2>
          {profileError ? (
            <p className="text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg p-3 mb-4 text-slate-700 text-left break-all">
              {profileError}
            </p>
          ) : (
            <p className="text-sm text-slate-500 mb-6">
              Your profile could not be loaded. This can happen after a fresh login — please try again.
            </p>
          )}
          <button onClick={handleRetry} disabled={retrying} className="btn-primary w-full justify-center">
            {retrying ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {retrying ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  const roleBadge: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    faculty: 'bg-navy-100 text-navy-700',
    student: 'bg-gold-100 text-gold-700',
    standard: 'bg-slate-100 text-slate-700',
    finance: 'bg-green-100 text-green-700',
  };

  const yearLabel: Record<string, string> = {
    '1st_year': '1st Year',
    '2nd_year': '2nd Year',
    'final_year': 'Final Year',
  };

  const isPrincipal = profile?.role === 'faculty' && profile?.position === 'Principal';
  const isDesigner = profile?.email === 'tkpaite2016@gmail.com';
  const isBanned = profile?.is_banned ?? false;
  const theme = getTheme(profile?.profile_theme);

  return (
    <div className="page-enter min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {saved && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center font-medium">
            Profile updated successfully!
          </div>
        )}

        {/* Banned User Notice */}
        {isBanned && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-red-700">Account Banned</h3>
                <p className="text-sm text-red-600">Your account has been restricted. You cannot edit your profile or participate in forums.</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile card */}
        <div className={`card overflow-hidden relative ${theme.ringClass} ${isPrincipal ? 'ring-2 ring-gold-400' : ''} ${isDesigner ? '!ring-2 !ring-purple-400' : ''}`}>
          {/* Cover with theme */}
          <div className="relative h-36 overflow-hidden">
            <div
              className={`absolute inset-0 ${
                isDesigner
                  ? 'bg-gradient-to-r from-purple-900 via-pink-600 to-purple-900'
                  : isPrincipal
                    ? 'bg-gradient-to-r from-navy-900 via-navy-800 to-gold-700'
                    : theme.coverClass
              }`}
            />
            {isDesigner && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-purple-600/30" />
            )}
            {theme.shimmerClass && !isDesigner && !isPrincipal && (
              <div className={`absolute inset-0 overflow-hidden ${theme.shimmerClass}`} />
            )}

            {/* Badges — top-right inside cover */}
            <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
              {isDesigner && (
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                  <Palette className="w-3 h-3" /> DESIGNER <Sparkles className="w-3 h-3" />
                </span>
              )}
              {isPrincipal && (
                <span className="inline-flex items-center gap-1 bg-gold-500 text-navy-900 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                  <Award className="w-3 h-3" /> PRINCIPAL
                </span>
              )}
              {profile.graduated && (
                <span className="inline-flex items-center gap-1 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                  <GraduationCap className="w-3 h-3" /> GRADUATED
                </span>
              )}
              {isBanned && (
                <span className="inline-flex items-center gap-1 bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                  <Ban className="w-3 h-3" /> BANNED
                </span>
              )}
            </div>
          </div>

          {/* Avatar - centered at bottom of cover */}
          <div className="px-6 pb-6">
            <div className="flex flex-col items-center -mt-14 mb-4">
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
              </div>
            </div>

            {/* Role badge below avatar */}
            <div className="flex justify-center mb-3">
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${roleBadge[profile.role] ?? 'bg-slate-100 text-slate-700'}`}>
                {profile.role}
              </span>
            </div>

            {/* Edit button */}
            <div className="flex justify-center mb-4">
              <button
                onClick={openEdit}
                disabled={isBanned}
                className={`btn-secondary flex items-center gap-2 ${isBanned ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isBanned ? 'Your account is banned. Editing is disabled.' : ''}
              >
                <Edit2 className="w-4 h-4" /> {isBanned ? 'Profile Locked' : 'Edit Profile'}
              </button>
              {isBanned && (
                <p className="text-xs text-red-500 mt-1 text-center">Editing disabled for banned accounts</p>
              )}
            </div>

            {/* Name */}
            <div className="text-center mb-3">
              <h1 className={`text-2xl font-serif font-bold ${isDesigner ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent' : 'text-navy-900'}`}>
                {profile.full_name ?? 'No name set'}
              </h1>
            </div>

            {/* Position / year sub-badges */}
            <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
              {(profile.role === 'faculty' || profile.role === 'admin') && profile.position && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gold-100 text-gold-700">
                  <Award className="w-3 h-3" /> {profile.position}
                </span>
              )}
              {profile.role === 'student' && profile.student_year && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gold-100 text-gold-700">
                  <Calendar className="w-3 h-3" /> {yearLabel[profile.student_year]}
                </span>
              )}
            </div>

            {/* Student details section */}
            {profile.role === 'student' && (
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h3 className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gold-500" /> Academic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Course / Program</p>
                    <p className="font-medium text-navy-900">{profile.course || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Year of Study</p>
                    <p className="font-medium text-navy-900">{profile.student_year ? yearLabel[profile.student_year] : 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Date of Admission</p>
                    <p className="font-medium text-navy-900">
                      {profile.admission_date
                        ? new Date(profile.admission_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                        : 'Not recorded'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Status</p>
                    <p className={`font-medium ${profile.graduated ? 'text-green-600' : 'text-navy-900'}`}>
                      {profile.graduated ? 'Completed' : 'In Progress'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Faculty Information section */}
            {(profile.role === 'faculty' || profile.role === 'admin') && (profile.position || profile.qualification || profile.subject_in_charge) && (
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h3 className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gold-500" /> Faculty Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {profile.position && (
                    <div>
                      <p className="text-slate-500 text-xs">Position</p>
                      <p className="font-medium text-navy-900">{profile.position}</p>
                    </div>
                  )}
                  {profile.qualification && (
                    <div>
                      <p className="text-slate-500 text-xs">Qualification</p>
                      <p className="font-medium text-navy-900">{profile.qualification}</p>
                    </div>
                  )}
                  {profile.subject_in_charge && (
                    <div>
                      <p className="text-slate-500 text-xs">Subject In Charge</p>
                      <p className="font-medium text-navy-900">{profile.subject_in_charge}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Section for Students */}
            {profile.role === 'student' && !profile.graduated && (
              <div className="mt-6 p-5 bg-gradient-to-br from-navy-50 to-gold-50 rounded-xl border border-gold-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-navy-900 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-gold-600" /> Fee & Mess Payments
                  </h3>
                  <button
                    onClick={() => setShowPaymentForm(true)}
                    className="btn-gold text-xs px-3 py-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Make Payment
                  </button>
                </div>

                {transactionsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader className="w-5 h-5 animate-spin text-gold-500" />
                  </div>
                ) : transactions.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No payment records yet.</p>
                ) : (
                  <div className="space-y-2">
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tx.payment_type === 'fee' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                              {tx.payment_type === 'fee' ? 'Fee' : 'Mess'}
                            </span>
                            <span className="text-sm font-medium text-navy-900">₹{tx.amount.toLocaleString('en-IN')}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(tx.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right">
                          {tx.receipt_number && (
                            <p className="text-xs text-slate-600 font-mono">{tx.receipt_number}</p>
                          )}
                          <span className={`text-xs font-medium ${tx.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {transactions.length > 5 && (
                      <p className="text-xs text-slate-400 text-center pt-2">
                        Showing recent 5 of {transactions.length} payments
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Contact details */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="w-4 h-4 text-gold-500" />
                <span className="text-sm">{profile.email ?? 'No email'}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="w-4 h-4 text-gold-500" />
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
                <div className="flex items-start gap-3 text-slate-600 pt-2">
                  <BookOpen className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>

            {/* Certificate Section */}
            {profile.role === 'student' && profile.graduated && (
              <div className="mt-6 p-5 bg-gradient-to-br from-navy-50 to-gold-50 rounded-xl border border-gold-200">
                <h3 className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-gold-600" /> Certificate Status
                </h3>

                {profile.certificate_url ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <Award className="w-5 h-5" />
                      <span className="font-semibold">Your certificate has been issued!</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Completion Date:{' '}
                      {profile.completion_date
                        ? new Date(profile.completion_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                        : 'Not specified'}
                    </p>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                      Your graduation certificate is ready. Please contact your faculty or the administration office to collect or download it.
                    </div>
                    {/* Ask/Inform Button */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <a
                        href={`mailto:aizawlbiblecollege24@gmail.com?subject=Certificate Inquiry - ${profile.full_name || 'Student'}&body=Dear Admin,%0D%0A%0D%0AI am writing to inquire about my graduation certificate.%0D%0A%0D%0AStudent Name: ${profile.full_name}%0D%0AEmail: ${profile.email}%0D%0ACourse: ${profile.course || 'Not specified'}%0D%0ACompletion Date: ${profile.completion_date ? new Date(profile.completion_date).toLocaleDateString('en-IN') : 'Not specified'}%0D%0A%0D%0APlease let me know how I can collect or download my certificate.%0D%0A%0D%0AThank you.`}
                        className="btn-primary text-sm flex items-center justify-center gap-2"
                      >
                        <Mail className="w-4 h-4" /> Ask About Certificate
                      </a>
                      <a
                        href="tel:9383007361"
                        className="btn-secondary text-sm flex items-center justify-center gap-2"
                      >
                        <Phone className="w-4 h-4" /> Call Office
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-slate-400">?</span>
                      </div>
                      <span className="text-sm">Certificate not yet issued. Contact the administration upon completion.</span>
                    </div>
                    {/* Inform Admin Button */}
                    <a
                      href={`mailto:aizawlbiblecollege24@gmail.com?subject=Certificate Request - ${profile.full_name || 'Student'}&body=Dear Admin,%0D%0A%0D%0AI have completed my course and would like to request my graduation certificate.%0D%0A%0D%0AStudent Name: ${profile.full_name}%0D%0AEmail: ${profile.email}%0D%0ACourse: ${profile.course || 'Not specified'}%0D%0A%0D%0APlease process my certificate at your earliest convenience.%0D%0A%0D%0AThank you.`}
                      className="btn-gold text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <Mail className="w-4 h-4" /> Request Certificate
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Notifications Section */}
            {notifications.length > 0 && (
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-navy-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-500" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">{unreadCount}</span>
                    )}
                  </h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>
                {notifLoading ? (
                  <div className="flex justify-center py-3"><Loader className="w-4 h-4 animate-spin text-amber-500" /></div>
                ) : (
                  <div className="space-y-2">
                    {notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => !n.is_read && markNotifRead(n.id)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          n.is_read
                            ? 'bg-white border-slate-100 opacity-70'
                            : 'bg-white border-amber-300 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? 'bg-slate-300' : 'bg-amber-500'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${n.is_read ? 'text-slate-600' : 'text-navy-900'}`}>{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {notifications.length > 5 && (
                      <p className="text-xs text-slate-400 text-center pt-1">
                        Showing 5 of {notifications.length} notifications
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                Member since {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowPaymentForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-serif font-bold text-navy-900">Make Payment</h2>
              <button onClick={() => setShowPaymentForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">Payment Recorded!</h3>
                <p className="text-sm text-slate-500">Your payment has been successfully recorded.</p>
              </div>
            ) : (
              <form onSubmit={submitPayment} className="space-y-4">
                {paymentError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{paymentError}
                  </div>
                )}

                <div>
                  <label className="label">Payment Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentForm((f) => ({ ...f, payment_type: 'fee' }))}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        paymentForm.payment_type === 'fee'
                          ? 'border-navy-800 bg-navy-50 text-navy-800'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1" />
                      Fee Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentForm((f) => ({ ...f, payment_type: 'mess' }))}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        paymentForm.payment_type === 'mess'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <IndianRupee className="w-5 h-5 mx-auto mb-1" />
                      Mess Payment
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">Amount (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
                      className="input-field pl-10"
                      placeholder="Enter amount"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Payment Method</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm((f) => ({ ...f, payment_method: e.target.value as any }))}
                    className="input-field"
                  >
                    {razorpayEnabled && razorpayKeyId && (
                      <option value="online">Pay Online (Razorpay)</option>
                    )}
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                  {razorpayEnabled && razorpayKeyId && paymentForm.payment_method === 'online' && (
                    <p className="text-xs text-blue-600 mt-1.5 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Secure payment powered by Razorpay
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">Notes (optional)</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    className="input-field resize-none"
                    placeholder="Add any notes..."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={paymentSubmitting || !paymentForm.amount}
                    className="btn-primary flex-1 justify-center"
                  >
                    {paymentSubmitting ? (
                      <><Loader className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : (
                      <><CheckCircle className="w-4 h-4" /> Record Payment</>
                    )}
                  </button>
                  <button type="button" onClick={() => setShowPaymentForm(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setEditing(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-serif font-bold text-navy-900">Edit Profile</h2>
              <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4 text-red-700 text-sm">{error}</div>
            )}

            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="label">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border-2 border-slate-200 overflow-hidden bg-slate-100 flex-shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : form.avatar_url ? (
                      <img src={form.avatar_url} alt="Current" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" id="avatar-upload" />
                    <label htmlFor="avatar-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors text-sm font-medium">
                      {uploadingAvatar ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                    </label>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} className="input-field pl-10" placeholder="Your full name" />
                </div>
              </div>

              {profile.role === 'student' && (
                <div>
                  <label className="label">Course / Program</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={form.course} onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))} className="input-field pl-10" placeholder="e.g., Bachelor of Theology" />
                  </div>
                </div>
              )}

              <div>
                <label className="label">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="input-field pl-10" placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>

              <div>
                <label className="label">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} rows={2} className="input-field pl-10 resize-none" placeholder="Your address" />
                </div>
              </div>

              <div>
                <label className="label">Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} className="input-field resize-none" placeholder="A brief bio about yourself..." />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving || uploadingAvatar} className="btn-primary flex-1 justify-center">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
