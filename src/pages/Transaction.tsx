import { useEffect, useState } from 'react';
import { CreditCard, Search, Plus, Trash2, DollarSign, Calendar, User, AlertCircle, X } from 'lucide-react';
import { supabase, Transaction as Tx, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type UserWithTx = Profile & { transactions: Tx[]; total: number };

export default function Transaction() {
  const { profile: adminProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithTx | null>(null);
  const [allTx, setAllTx] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    season: '', amount: '', payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash', reference_no: '', notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    loadAllTx();
  }, []);

  async function loadAllTx() {
    setLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('*, user:user_id(*)')
      .order('payment_date', { ascending: false });
    setAllTx(data ?? []);
    setLoading(false);
  }

  async function searchUsers(query: string) {
    setSearchQuery(query);
    if (query.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);
    setSearchResults(data ?? []);
    setSearching(false);
  }

  async function selectUser(user: Profile) {
    setSearchResults([]);
    setSearchQuery(user.full_name ?? user.email ?? '');
    setLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('payment_date', { ascending: false });
    const txList = data ?? [];
    const total = txList.reduce((sum, t) => sum + Number(t.amount), 0);
    setSelectedUser({ ...user, transactions: txList, total });
    setLoading(false);
  }

  async function addTransaction(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    setSaveError('');
    setSaving(true);
    const { error } = await supabase.from('transactions').insert({
      user_id: selectedUser.id,
      season: addForm.season,
      amount: parseFloat(addForm.amount),
      payment_date: addForm.payment_date,
      payment_method: addForm.payment_method,
      reference_no: addForm.reference_no || null,
      notes: addForm.notes || null,
      recorded_by: adminProfile?.id,
    });
    if (error) { setSaveError(error.message); setSaving(false); return; }
    setShowAddForm(false);
    setAddForm({ season: '', amount: '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'cash', reference_no: '', notes: '' });
    setSaving(false);
    await selectUser(selectedUser);
  }

  async function deleteTransaction(id: string) {
    await supabase.from('transactions').delete().eq('id', id);
    if (selectedUser) {
      const newTx = selectedUser.transactions.filter((t) => t.id !== id);
      const total = newTx.reduce((sum, t) => sum + Number(t.amount), 0);
      setSelectedUser({ ...selectedUser, transactions: newTx, total });
    }
  }

  return (
    <div className="page-enter min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-navy-950 py-8 px-4">
        <div className="page-container">
          <div className="flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-gold-400" />
            <div>
              <h1 className="text-2xl font-serif font-bold text-white">Fee Transactions</h1>
              <p className="text-slate-400 text-sm">Search users and manage payment records</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search panel */}
          <div className="lg:col-span-1">
            <div className="card p-5">
              <h2 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-gold-500" /> Search User
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => searchUsers(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Name or email..."
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setSearchResults([]); setSelectedUser(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {searching && <p className="text-xs text-slate-400 mt-2">Searching...</p>}

              {searchResults.length > 0 && (
                <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden">
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => selectUser(u)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-left border-b last:border-b-0 border-slate-100"
                    >
                      <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-navy-700 text-xs font-bold">{(u.full_name ?? u.email ?? 'U')[0].toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-navy-900 truncate">{u.full_name ?? '—'}</p>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Recent transactions summary */}
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Recent Payments</h3>
                {loading ? (
                  <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-navy-200 border-t-navy-800 rounded-full animate-spin" /></div>
                ) : (
                  <div className="space-y-2">
                    {allTx.slice(0, 6).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-navy-900 truncate">{(tx.user as any)?.full_name ?? 'Unknown'}</p>
                          <p className="text-xs text-slate-400">{tx.season}</p>
                        </div>
                        <span className="text-xs font-semibold text-green-600 flex-shrink-0 ml-2">₹{Number(tx.amount).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User detail */}
          <div className="lg:col-span-2">
            {!selectedUser ? (
              <div className="card p-12 text-center">
                <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Search for a user to view their transaction history.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* User info header */}
                <div className="card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center">
                        <span className="text-navy-700 font-bold text-lg">{(selectedUser.full_name ?? selectedUser.email ?? 'U')[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <h2 className="font-serif font-bold text-navy-900 text-lg">{selectedUser.full_name}</h2>
                        <p className="text-slate-500 text-sm">{selectedUser.email} · <span className="capitalize">{selectedUser.role}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-serif font-bold text-green-600">₹{selectedUser.total.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-slate-500">Total Paid</p>
                      </div>
                      <button onClick={() => setShowAddForm(true)} className="btn-primary">
                        <Plus className="w-4 h-4" /> Add Payment
                      </button>
                    </div>
                  </div>
                </div>

                {/* Add payment form */}
                {showAddForm && (
                  <div className="card p-5">
                    <h3 className="font-semibold text-navy-900 mb-4">Record New Payment</h3>
                    {saveError && <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-3 text-red-700 text-sm"><AlertCircle className="w-4 h-4 mt-0.5" />{saveError}</div>}
                    <form onSubmit={addTransaction} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input value={addForm.season} onChange={(e) => setAddForm((f) => ({ ...f, season: e.target.value }))} className="input-field" placeholder="Season / Term (e.g., 2024 Spring)" required />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                        <input type="number" min="1" step="0.01" value={addForm.amount} onChange={(e) => setAddForm((f) => ({ ...f, amount: e.target.value }))} className="input-field pl-7" placeholder="Amount" required />
                      </div>
                      <input type="date" value={addForm.payment_date} onChange={(e) => setAddForm((f) => ({ ...f, payment_date: e.target.value }))} className="input-field" required />
                      <select value={addForm.payment_method} onChange={(e) => setAddForm((f) => ({ ...f, payment_method: e.target.value }))} className="input-field">
                        {['cash', 'bank_transfer', 'online', 'cheque'].map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                      </select>
                      <input value={addForm.reference_no} onChange={(e) => setAddForm((f) => ({ ...f, reference_no: e.target.value }))} className="input-field" placeholder="Reference / Receipt No." />
                      <input value={addForm.notes} onChange={(e) => setAddForm((f) => ({ ...f, notes: e.target.value }))} className="input-field" placeholder="Notes (optional)" />
                      <div className="sm:col-span-2 flex gap-2">
                        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Record Payment'}</button>
                        <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Transaction history */}
                <div className="card overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <h3 className="font-semibold text-navy-900">Payment History ({selectedUser.transactions.length} records)</h3>
                  </div>
                  {selectedUser.transactions.length === 0 ? (
                    <div className="text-center py-10">
                      <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">No payments recorded yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wide">
                          <tr>
                            <th className="px-4 py-3 text-left">Season</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left">Method</th>
                            <th className="px-4 py-3 text-left">Reference</th>
                            <th className="px-4 py-3" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedUser.transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-medium text-navy-900">{tx.season}</td>
                              <td className="px-4 py-3 text-right font-semibold text-green-600">₹{Number(tx.amount).toLocaleString('en-IN')}</td>
                              <td className="px-4 py-3 text-slate-600">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {new Date(tx.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-600 capitalize">{tx.payment_method?.replace('_', ' ')}</td>
                              <td className="px-4 py-3 text-slate-500 text-xs">{tx.reference_no ?? '—'}</td>
                              <td className="px-4 py-3">
                                <button onClick={() => deleteTransaction(tx.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-green-50 font-semibold">
                            <td className="px-4 py-3 text-navy-900">Total</td>
                            <td className="px-4 py-3 text-right text-green-700 text-base">₹{selectedUser.total.toLocaleString('en-IN')}</td>
                            <td colSpan={4} />
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
