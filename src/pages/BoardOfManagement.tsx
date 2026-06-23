import { useEffect, useState } from 'react';
import { Users, Plus, Trash2, Upload, Loader, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type BoardMember = {
  id: string;
  name: string;
  designation: string | null;
  photo_url: string | null;
  display_order: number;
  created_at: string;
};

type AddForm = {
  name: string;
  designation: string;
  photo_url: string;
  display_order: string;
};

export default function BoardOfManagement() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddForm>({ name: '', designation: '', photo_url: '', display_order: '0' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);
    const { data } = await supabase
      .from('board_members')
      .select('*')
      .order('display_order', { ascending: true });
    setMembers(data ?? []);
    setLoading(false);
  }

  async function uploadPhoto(file: File): Promise<string | null> {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `board/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(fileName, file, { upsert: true });
    if (error) { setUploading(false); return null; }
    const { data } = supabase.storage.from('photos').getPublicUrl(fileName);
    setUploading(false);
    return data.publicUrl;
  }

  async function saveMember(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('board_members').insert({
      name: form.name,
      designation: form.designation || null,
      photo_url: form.photo_url || null,
      display_order: parseInt(form.display_order) || 0,
    });
    setForm({ name: '', designation: '', photo_url: '', display_order: '0' });
    setShowForm(false);
    setSaving(false);
    loadMembers();
  }

  async function deleteMember(id: string) {
    await supabase.from('board_members').delete().eq('id', id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="bg-navy-950 py-8 md:py-14">
        <div className="page-container text-center">
          <Users className="w-8 h-8 md:w-9 md:h-9 text-gold-400 mx-auto mb-2 md:mb-3" />
          <h1 className="text-xl md:text-3xl font-serif font-bold text-white mb-1 md:mb-2">Board of Management</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-xs md:text-sm">
            The governing body of Aizawl Bible College — spiritual leaders and administrators guiding the institution.
          </p>
        </div>
      </section>

      <div className="page-container py-10">
        {/* Admin controls */}
        {isAdmin && (
          <div className="flex justify-end mb-6">
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Member
            </button>
          </div>
        )}

        {/* Add form */}
        {isAdmin && showForm && (
          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-navy-900">Add Board Member</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveMember} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Rev. Dr. John Doe"
                  required
                />
              </div>
              <div>
                <label className="label">Designation</label>
                <input
                  value={form.designation}
                  onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Chairman"
                />
              </div>
              <div>
                <label className="label">Display Order</label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))}
                  className="input-field"
                  placeholder="0 = first"
                />
              </div>
              <div>
                <label className="label">Photo (optional)</label>
                <div className="flex items-center gap-3">
                  {form.photo_url && (
                    <img src={form.photo_url} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  )}
                  <label htmlFor="board-photo-upload" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${uploading ? 'bg-slate-100 text-slate-400' : 'bg-navy-800 text-white hover:bg-navy-700'}`}>
                    {uploading ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload Photo</>}
                  </label>
                  <input id="board-photo-upload" type="file" accept="image/*" className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await uploadPhoto(file);
                      if (url) setForm((f) => ({ ...f, photo_url: url }));
                      e.target.value = '';
                    }}
                  />
                </div>
              </div>
              <div className="sm:col-span-2 flex gap-2 pt-2">
                <button type="submit" disabled={saving || uploading} className="btn-primary">
                  {saving ? 'Saving...' : 'Add Member'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Members grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-navy-200 border-t-navy-800 rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-semibold text-slate-600 mb-2">Board members not yet added</h3>
            {isAdmin && (
              <p className="text-slate-400 text-sm">Use the "Add Member" button to add board members.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {members.map((member) => (
              <div key={member.id} className="card p-5 text-center relative group hover:shadow-md transition-shadow">
                {isAdmin && (
                  <button
                    onClick={() => deleteMember(member.id)}
                    className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-4 border-gold-200 bg-navy-100 flex items-center justify-center">
                  {member.photo_url ? (
                    <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-navy-700 text-2xl font-bold">{member.name[0]}</span>
                  )}
                </div>
                <h3 className="font-serif font-bold text-navy-900 text-sm leading-tight">{member.name}</h3>
                {member.designation && (
                  <p className="text-gold-600 text-xs font-medium mt-1">{member.designation}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
