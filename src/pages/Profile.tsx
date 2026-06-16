import { useState } from 'react';
import { User, Mail, Phone, MapPin, CreditCard as Edit2, Save, X, Camera, BookOpen, Calendar, Loader, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { profile, profileLoading, profileError, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    address: profile?.address ?? '',
    bio: profile?.bio ?? '',
    avatar_url: profile?.avatar_url ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [retrying, setRetrying] = useState(false);

  function openEdit() {
    setForm({
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      address: profile?.address ?? '',
      bio: profile?.bio ?? '',
      avatar_url: profile?.avatar_url ?? '',
    });
    setEditing(true);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', profile!.id);
    if (error) { setError(error.message); setSaving(false); return; }
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
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="btn-primary w-full justify-center"
          >
            {retrying ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
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
  };

  const yearLabel: Record<string, string> = {
    '1st_year': '1st Year',
    '2nd_year': '2nd Year',
    'final_year': 'Final Year',
  };

  return (
    <div className="page-enter min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success toast */}
        {saved && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center font-medium">
            Profile updated successfully!
          </div>
        )}

        {/* Profile card */}
        <div className="card overflow-hidden">
          {/* Cover */}
          <div className="h-28 bg-hero-gradient" />

          {/* Avatar */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-navy-200">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-navy-700">
                        {(profile.full_name ?? profile.email ?? 'U')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={openEdit} className="btn-secondary mt-14 flex items-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            </div>

            <h1 className="text-2xl font-serif font-bold text-navy-900">{profile.full_name ?? 'No name set'}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold capitalize ${roleBadge[profile.role]}`}>
                {profile.role}
              </span>
              {profile.role === 'student' && profile.student_year && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gold-100 text-gold-700">
                  <Calendar className="w-3 h-3" /> {yearLabel[profile.student_year]}
                </span>
              )}
            </div>

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

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                Member since {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

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
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} className="input-field pl-10" placeholder="Your full name" />
                </div>
              </div>
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
              <div>
                <label className="label">Avatar URL</label>
                <div className="relative">
                  <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={form.avatar_url} onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))} className="input-field pl-10" placeholder="https://..." />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
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
