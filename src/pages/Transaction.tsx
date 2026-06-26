import { useEffect, useState } from 'react';
import { CreditCard, Search, Plus, Trash2, DollarSign, Calendar, User, AlertCircle, X, Bell, CheckCircle, Loader, IndianRupee, Send } from 'lucide-react';
import { supabase, Transaction as Tx, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type UserWithTx = Profile & { transactions: Tx[]; total: number };

type PaymentRequest = {
  id: string;
  student_id: string;
  requested_by: string;
  title: string;
  amount: number;
  payment_type: string;
  due_date: string | null;
  description: string | null;
  status: string;
  created_at: string;
  student?: Profile;
};

export default function Transaction() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const isFaculty = profile?.role === 'faculty';
  const isFinance = profile?.role === 'finance';
  const isStudent = profile?.role === 'student';
  const canEdit = isAdmin || isFinance;
  const canSearchAll = isAdmin || isFaculty || isFinance;

  // Admin/Faculty state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithTx | null>(null);
  const [allTx, setAllTx] = useState<Tx[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [searching, setSearching] = useState(false);

  // Student state
  const [myTx, setMyTx] = useState<Tx[]>([]);
  const [myTotal, setMyTotal] = useState(0);
  const [myLoading, setMyLoading] = useState(false);

  // Payment requests
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [allPaymentRequests, setAllPaymentRequests] = useState<PaymentRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Add transaction form (admin only)
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    season: '', amount: '', payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash', payment_type: 'fee', reference_no: '', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Payment request form (admin/faculty)
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    title: '', amount: '', payment_type: 'fee', due_date: '', description: '',
  });
  const [savingRequest, setSavingRequest] = useState(false);
  const [requestError, setRequestError] = useState('');

  // Student make payment state
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [showPayForm, setShowPayForm] = useState(false);
  const [payingRequest, setPayingRequest] = useState<PaymentRequest | null>(null);
  const [payForm, setPayForm] = useState({
    amount: '', payment_method: 'online' as 'cash' | 'bank_transfer' | 'online' | 'cheque',
    payment_type: 'fee' as 'fee' | 'mess' | 'other', notes: '',
  });
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState(false);

  // Notification form (admin/finance)
  const [showNotifForm, setShowNotifForm] = useState(false);
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'payment' });
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifSent, setNotifSent] = useState(false);

  useEffect(() => {
    if (isStudent) {
      loadMyTx();
      loadMyPaymentRequests();
      loadRazorpaySettings();
    } else if (canSearchAll) {
      loadRecentTx();
      loadAllPaymentRequests();
    }
  }, [profile?.id]);

  async function loadRazorpaySettings() {
    const { data } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['razorpay_enabled', 'razorpay_key_id']);
    if (data) {
      const enabled = data.find((s) => s.setting_key === 'razorpay_enabled');
      if (enabled) setRazorpayEnabled(enabled.setting_value === 'true');
      const keyId = data.find((s) => s.setting_key === 'razorpay_key_id');
      if (keyId) setRazorpayKeyId(keyId.setting_value || '');
    }
  }

  async function loadMyTx() {
    if (!profile?.id) return;
    setMyLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', profile.id)
      .order('payment_date', { ascending: false });
    const list = data ?? [];
    setMyTx(list);
    setMyTotal(list.reduce((sum, t) => sum + Number(t.amount), 0));
    setMyLoading(false);
  }

  async function loadMyPaymentRequests() {
    if (!profile?.id) return;
    setRequestsLoading(true);
    const { data } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false });
    setPaymentRequests(data ?? []);
    setRequestsLoading(false);
  }

  async function loadAllPaymentRequests() {
    const { data } = await supabase
      .from('payment_requests')
      .select('*, student:student_id(*)')
      .order('created_at', { ascending: false });
    setAllPaymentRequests(data ?? []);
  }

  async function loadRecentTx() {
    setLoadingAll(true);
    const { data } = await supabase
      .from('transactions')
      .select('*, user:user_id(*)')
      .order('payment_date', { ascending: false })
      .limit(20);
    setAllTx(data ?? []);
    setLoadingAll(false);
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
    setLoadingAll(true);
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('payment_date', { ascending: false });
    const txList = data ?? [];
    const total = txList.reduce((sum, t) => sum + Number(t.amount), 0);
    setSelectedUser({ ...user, transactions: txList, total });
    setLoadingAll(false);
  }

  async function addTransaction(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    setSaveError('');
    setSaving(true);
    const timestamp = Date.now();
    const receiptNum = `RCP-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(timestamp).slice(-5)}`;
    const { error } = await supabase.from('transactions').insert({
      user_id: selectedUser.id,
      season: addForm.season,
      amount: parseFloat(addForm.amount),
      payment_date: addForm.payment_date,
      payment_method: addForm.payment_method,
      payment_type: addForm.payment_type,
      receipt_number: receiptNum,
      status: 'completed',
      reference_no: addForm.reference_no || null,
      notes: addForm.notes || null,
      recorded_by: profile?.id,
    });
    if (error) { setSaveError(error.message); setSaving(false); return; }
    setShowAddForm(false);
    setAddForm({ season: '', amount: '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'cash', payment_type: 'fee', reference_no: '', notes: '' });
    setSaving(false);
    await selectUser(selectedUser);
  }

  async function deleteTransaction(id: string) {
    await supabase.from('transactions').delete().eq('id', id);
    if (selectedUser) {
      const newTx = selectedUser.transactions.filter((t) => t.id !== id);
      setSelectedUser({ ...selectedUser, transactions: newTx, total: newTx.reduce((s, t) => s + Number(t.amount), 0) });
    }
  }

  async function sendPaymentRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    setRequestError('');
    setSavingRequest(true);
    const { error } = await supabase.from('payment_requests').insert({
      student_id: selectedUser.id,
      requested_by: profile?.id,
      title: requestForm.title,
      amount: parseFloat(requestForm.amount),
      payment_type: requestForm.payment_type,
      due_date: requestForm.due_date || null,
      description: requestForm.description || null,
      status: 'pending',
    });
    if (error) { setRequestError(error.message); setSavingRequest(false); return; }
    setShowRequestForm(false);
    setRequestForm({ title: '', amount: '', payment_type: 'fee', due_date: '', description: '' });
    setSavingRequest(false);
    loadAllPaymentRequests();
  }

  async function cancelPaymentRequest(id: string) {
    await supabase.from('payment_requests').update({ status: 'cancelled' }).eq('id', id);
    setAllPaymentRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'cancelled' } : r));
  }

  async function sendNotification(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !profile) return;
    setSendingNotif(true);
    await supabase.from('notifications').insert({
      user_id: selectedUser.id,
      sent_by: profile.id,
      title: notifForm.title,
      message: notifForm.message,
      type: notifForm.type,
    });
    setNotifForm({ title: '', message: '', type: 'payment' });
    setShowNotifForm(false);
    setNotifSent(true);
    setTimeout(() => setNotifSent(false), 3000);
    setSendingNotif(false);
  }

  async function markRequestPaid(requestId: string) {
    await supabase.from('payment_requests').update({ status: 'paid' }).eq('id', requestId);
    setPaymentRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, status: 'paid' } : r));
  }

  function openPayForm(request?: PaymentRequest) {
    setPayingRequest(request ?? null);
    setPayForm({
      amount: request ? String(request.amount) : '',
      payment_method: 'online',
      payment_type: (request?.payment_type as any) ?? 'fee',
      notes: '',
    });
    setPayError('');
    setPaySuccess(false);
    setShowPayForm(true);
  }

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    setPayError('');
    setPaySubmitting(true);

    const amount = parseFloat(payForm.amount);

    if (razorpayEnabled && razorpayKeyId && payForm.payment_method === 'online') {
      await initiateRazorpay(amount);
      return;
    }

    await recordPayment(amount, payForm.payment_method, null);
  }

  async function recordPayment(amount: number, method: string, gateway: any) {
    const timestamp = Date.now();
    const receiptNum = `RCP-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(timestamp).slice(-5)}`;

    const { error } = await supabase.from('transactions').insert({
      user_id: profile!.id,
      season: `Payment - ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`,
      amount,
      payment_type: payForm.payment_type,
      payment_method: method,
      status: 'completed',
      receipt_number: receiptNum,
      notes: payForm.notes || null,
      recorded_by: profile!.id,
      ...(gateway || {}),
    });

    if (error) {
      setPayError(error.message);
      setPaySubmitting(false);
      return;
    }

    if (payingRequest) {
      await markRequestPaid(payingRequest.id);
    }

    setPaySuccess(true);
    setPaySubmitting(false);
    setTimeout(() => {
      setShowPayForm(false);
      setPaySuccess(false);
      loadMyTx();
      loadMyPaymentRequests();
    }, 2000);
  }

  async function initiateRazorpay(amount: number) {
    if (!(window as any).Razorpay) {
      setPayError('Razorpay not loaded. Please refresh and try again.');
      setPaySubmitting(false);
      return;
    }
    const options = {
      key: razorpayKeyId,
      amount: amount * 100,
      currency: 'INR',
      name: 'Aizawl Bible College',
      description: payingRequest?.title ?? `${payForm.payment_type} Payment`,
      handler: async (response: any) => {
        await recordPayment(amount, 'online', {
          gateway: 'razorpay',
          gateway_payment_id: response.razorpay_payment_id,
          gateway_order_id: response.razorpay_order_id,
          gateway_signature: response.razorpay_signature,
        });
      },
      prefill: { name: profile?.full_name || '', email: profile?.email || '', contact: profile?.phone || '' },
      theme: { color: '#0F1B3D' },
      modal: {
        ondismiss: () => { setPaySubmitting(false); setPayError('Payment cancelled.'); },
      },
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
    setPaySubmitting(false);
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    cancelled: 'bg-slate-100 text-slate-500',
  };

  // ── STUDENT VIEW ──────────────────────────────────────────────
  if (isStudent) {
    const pendingRequests = paymentRequests.filter((r) => r.status === 'pending');
    const hasPending = pendingRequests.length > 0;

    return (
      <div className="page-enter min-h-screen bg-slate-50">
        <div className="bg-navy-950 py-8 px-4">
          <div className="page-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-7 h-7 text-gold-400" />
                <div>
                  <h1 className="text-2xl font-serif font-bold text-white">My Fee Payments</h1>
                  <p className="text-slate-400 text-sm">Your payment history — {profile?.full_name}</p>
                </div>
              </div>
              <button
                onClick={() => openPayForm()}
                className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                <Plus className="w-4 h-4" /> Make Payment
              </button>
            </div>
          </div>
        </div>

        <div className="page-container py-8 max-w-3xl space-y-6">
          {/* Pending payment requests */}
          {hasPending && (
            <div className="card overflow-hidden border-l-4 border-l-amber-400">
              <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-amber-800 text-sm">Payment Requests from Administration</h3>
                <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
              </div>
              <div className="divide-y divide-amber-100">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="p-4 flex items-center justify-between gap-4 bg-amber-50/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy-900 text-sm">{req.title}</p>
                      {req.description && <p className="text-xs text-slate-500 mt-0.5">{req.description}</p>}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-lg font-bold text-amber-700">₹{Number(req.amount).toLocaleString('en-IN')}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${req.payment_type === 'fee' ? 'bg-blue-100 text-blue-700' : req.payment_type === 'mess' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                          {req.payment_type}
                        </span>
                        {req.due_date && (
                          <span className="text-xs text-slate-500">Due: {new Date(req.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => openPayForm(req)}
                      className="flex-shrink-0 flex items-center gap-2 bg-navy-800 hover:bg-navy-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Pay Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All payment requests */}
          {paymentRequests.filter((r) => r.status !== 'pending').length > 0 && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-navy-900 text-sm">Payment Request History</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {paymentRequests.filter((r) => r.status !== 'pending').map((req) => (
                  <div key={req.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-navy-900 text-sm">{req.title}</p>
                      <span className="text-sm font-bold text-slate-700">₹{Number(req.amount).toLocaleString('en-IN')}</span>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[req.status]}`}>{req.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {myLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-navy-200 border-t-navy-800 rounded-full animate-spin" />
            </div>
          ) : myTx.length === 0 ? (
            <div className="card p-12 text-center">
              <DollarSign className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No payment records found.</p>
              <p className="text-slate-400 text-sm mt-1">Use "Make Payment" to record a fee or mess payment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="card p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Fees Paid</p>
                  <p className="text-3xl font-serif font-bold text-green-600">₹{myTotal.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Transactions</p>
                  <p className="text-2xl font-bold text-navy-900">{myTx.length}</p>
                </div>
              </div>

              <div className="card overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-semibold text-navy-900">Payment History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wide">
                      <tr>
                        <th className="px-4 py-3 text-left">Season / Term</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myTx.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-navy-900">{tx.season}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${(tx as any).payment_type === 'fee' ? 'bg-blue-100 text-blue-700' : (tx as any).payment_type === 'mess' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                              {(tx as any).payment_type ?? 'fee'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-green-600">₹{Number(tx.amount).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(tx.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs font-mono">{(tx as any).receipt_number ?? '—'}</td>
                        </tr>
                      ))}
                      <tr className="bg-green-50 font-semibold">
                        <td className="px-4 py-3 text-navy-900" colSpan={2}>Total</td>
                        <td className="px-4 py-3 text-right text-green-700 text-base">₹{myTotal.toLocaleString('en-IN')}</td>
                        <td colSpan={2} />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment modal */}
        {showPayForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowPayForm(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-serif font-bold text-navy-900">
                  {payingRequest ? `Pay: ${payingRequest.title}` : 'Make Payment'}
                </h2>
                <button onClick={() => setShowPayForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {paySuccess ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-2">Payment Recorded!</h3>
                  <p className="text-sm text-slate-500">Your payment has been successfully recorded.</p>
                </div>
              ) : (
                <form onSubmit={submitPayment} className="space-y-4">
                  {payError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{payError}
                    </div>
                  )}

                  {!payingRequest && (
                    <div>
                      <label className="label">Payment Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['fee', 'mess', 'other'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setPayForm((f) => ({ ...f, payment_type: t }))}
                            className={`p-2.5 rounded-lg border-2 text-sm font-medium capitalize transition-all ${payForm.payment_type === t ? 'border-navy-800 bg-navy-50 text-navy-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="label">Amount (₹)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        value={payForm.amount}
                        onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))}
                        className="input-field pl-10"
                        placeholder="Enter amount"
                        required
                        min="1"
                        readOnly={!!payingRequest}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Payment Method</label>
                    <select
                      value={payForm.payment_method}
                      onChange={(e) => setPayForm((f) => ({ ...f, payment_method: e.target.value as any }))}
                      className="input-field"
                    >
                      {razorpayEnabled && razorpayKeyId && <option value="online">Pay Online (Razorpay)</option>}
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                    {razorpayEnabled && razorpayKeyId && payForm.payment_method === 'online' && (
                      <p className="text-xs text-blue-600 mt-1.5">Secure payment powered by Razorpay</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Notes (optional)</label>
                    <textarea
                      value={payForm.notes}
                      onChange={(e) => setPayForm((f) => ({ ...f, notes: e.target.value }))}
                      rows={2}
                      className="input-field resize-none"
                      placeholder="Add any notes..."
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={paySubmitting || !payForm.amount}
                      className="btn-primary flex-1 justify-center"
                    >
                      {paySubmitting ? (
                        <><Loader className="w-4 h-4 animate-spin" /> Processing...</>
                      ) : (
                        <><CheckCircle className="w-4 h-4" /> Confirm Payment</>
                      )}
                    </button>
                    <button type="button" onClick={() => setShowPayForm(false)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── ADMIN / FACULTY VIEW ──────────────────────────────────────
  return (
    <div className="page-enter min-h-screen bg-slate-50">
      <div className="bg-navy-950 py-8 px-4">
        <div className="page-container">
          <div className="flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-gold-400" />
            <div>
              <h1 className="text-2xl font-serif font-bold text-white">
                {isFinance ? 'Finance Workspace' : 'Fee Transactions'}
              </h1>
              <p className="text-slate-400 text-sm">
                {isFinance
                  ? 'Manage student payments, record transactions, and send notifications'
                  : isFaculty
                    ? 'View payment records and send payment requests'
                    : 'Manage student payments and requests'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-5">
              <h2 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-gold-500" /> Search Student
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
                  <button
                    onClick={() => { setSearchQuery(''); setSearchResults([]); setSelectedUser(null); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
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

              {/* Recent transactions */}
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Recent Payments</h3>
                {loadingAll && !selectedUser ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-navy-200 border-t-navy-800 rounded-full animate-spin" />
                  </div>
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

            {/* All payment requests panel */}
            <div className="card p-5">
              <h2 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 text-gold-500" /> Payment Requests
              </h2>
              {allPaymentRequests.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No payment requests sent yet.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allPaymentRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-navy-900 truncate">{(req.student as any)?.full_name ?? 'Student'}</p>
                        <p className="text-xs text-slate-500 truncate">{req.title} — ₹{Number(req.amount).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor[req.status]}`}>{req.status}</span>
                        {req.status === 'pending' && canEdit && (
                          <button onClick={() => cancelPaymentRequest(req.id)} className="text-slate-400 hover:text-red-500 p-0.5">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User detail */}
          <div className="lg:col-span-2">
            {!selectedUser ? (
              <div className="card p-12 text-center">
                <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Search for a student to view their transaction history.</p>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-center">
                        <p className="text-2xl font-serif font-bold text-green-600">₹{selectedUser.total.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-slate-500">Total Paid</p>
                      </div>
                      <button onClick={() => setShowRequestForm(true)} className="btn-secondary text-sm">
                        <Send className="w-3.5 h-3.5" /> Request Payment
                      </button>
                      {canEdit && (
                        <button onClick={() => setShowAddForm(true)} className="btn-primary text-sm">
                          <Plus className="w-4 h-4" /> Record Payment
                        </button>
                      )}
                      <button onClick={() => setShowNotifForm(true)} className="btn-secondary text-sm">
                        <Bell className="w-3.5 h-3.5" /> Notify User
                      </button>
                    </div>
                  </div>
                </div>

                {/* Send payment request form */}
                {showRequestForm && (
                  <div className="card p-5">
                    <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                      <Send className="w-4 h-4 text-gold-500" /> Send Payment Request to {selectedUser.full_name}
                    </h3>
                    {requestError && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-3 text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5" />{requestError}
                      </div>
                    )}
                    <form onSubmit={sendPaymentRequest} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input value={requestForm.title} onChange={(e) => setRequestForm((f) => ({ ...f, title: e.target.value }))} className="input-field sm:col-span-2" placeholder="Title (e.g., Semester 1 Fee)" required />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                        <input type="number" min="1" step="0.01" value={requestForm.amount} onChange={(e) => setRequestForm((f) => ({ ...f, amount: e.target.value }))} className="input-field pl-7" placeholder="Amount" required />
                      </div>
                      <select value={requestForm.payment_type} onChange={(e) => setRequestForm((f) => ({ ...f, payment_type: e.target.value }))} className="input-field">
                        <option value="fee">Fee Payment</option>
                        <option value="mess">Mess Payment</option>
                        <option value="other">Other</option>
                      </select>
                      <input type="date" value={requestForm.due_date} onChange={(e) => setRequestForm((f) => ({ ...f, due_date: e.target.value }))} className="input-field" placeholder="Due date (optional)" />
                      <input value={requestForm.description} onChange={(e) => setRequestForm((f) => ({ ...f, description: e.target.value }))} className="input-field" placeholder="Description (optional)" />
                      <div className="sm:col-span-2 flex gap-2">
                        <button type="submit" disabled={savingRequest} className="btn-primary">{savingRequest ? 'Sending...' : 'Send Request'}</button>
                        <button type="button" onClick={() => setShowRequestForm(false)} className="btn-secondary">Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Notification sent toast */}
                {notifSent && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
                    <CheckCircle className="w-4 h-4" /> Notification sent to {selectedUser.full_name}.
                  </div>
                )}

                {/* Send notification form */}
                {showNotifForm && (
                  <div className="card p-5">
                    <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-500" /> Send Notification to {selectedUser.full_name}
                    </h3>
                    <form onSubmit={sendNotification} className="space-y-3">
                      <input
                        value={notifForm.title}
                        onChange={(e) => setNotifForm((f) => ({ ...f, title: e.target.value }))}
                        className="input-field"
                        placeholder="Title (e.g., Payment Due Reminder)"
                        required
                      />
                      <textarea
                        value={notifForm.message}
                        onChange={(e) => setNotifForm((f) => ({ ...f, message: e.target.value }))}
                        className="input-field resize-none"
                        rows={3}
                        placeholder="Message to the user..."
                        required
                      />
                      <select
                        value={notifForm.type}
                        onChange={(e) => setNotifForm((f) => ({ ...f, type: e.target.value }))}
                        className="input-field"
                      >
                        <option value="payment">Payment</option>
                        <option value="reminder">Reminder</option>
                        <option value="general">General</option>
                        <option value="urgent">Urgent</option>
                      </select>
                      <div className="flex gap-2">
                        <button type="submit" disabled={sendingNotif} className="btn-primary">
                          {sendingNotif ? 'Sending...' : 'Send Notification'}
                        </button>
                        <button type="button" onClick={() => setShowNotifForm(false)} className="btn-secondary">Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Record payment form (admin/finance only) */}
                {showAddForm && canEdit && (
                  <div className="card p-5">
                    <h3 className="font-semibold text-navy-900 mb-4">Record New Payment</h3>
                    {saveError && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-3 text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5" />{saveError}
                      </div>
                    )}
                    <form onSubmit={addTransaction} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input value={addForm.season} onChange={(e) => setAddForm((f) => ({ ...f, season: e.target.value }))} className="input-field" placeholder="Season / Term (e.g., 2024 Spring)" required />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                        <input type="number" min="1" step="0.01" value={addForm.amount} onChange={(e) => setAddForm((f) => ({ ...f, amount: e.target.value }))} className="input-field pl-7" placeholder="Amount" required />
                      </div>
                      <input type="date" value={addForm.payment_date} onChange={(e) => setAddForm((f) => ({ ...f, payment_date: e.target.value }))} className="input-field" required />
                      <select value={addForm.payment_type} onChange={(e) => setAddForm((f) => ({ ...f, payment_type: e.target.value }))} className="input-field">
                        <option value="fee">Fee Payment</option>
                        <option value="mess">Mess Payment</option>
                        <option value="other">Other</option>
                      </select>
                      <select value={addForm.payment_method} onChange={(e) => setAddForm((f) => ({ ...f, payment_method: e.target.value }))} className="input-field">
                        {['cash', 'bank_transfer', 'online', 'cheque'].map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                      </select>
                      <input value={addForm.reference_no} onChange={(e) => setAddForm((f) => ({ ...f, reference_no: e.target.value }))} className="input-field" placeholder="Reference No. (optional)" />
                      <input value={addForm.notes} onChange={(e) => setAddForm((f) => ({ ...f, notes: e.target.value }))} className="input-field sm:col-span-2" placeholder="Notes (optional)" />
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
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left">Receipt</th>
                            {canEdit && <th className="px-4 py-3" />}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedUser.transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-medium text-navy-900">{tx.season}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${(tx as any).payment_type === 'fee' ? 'bg-blue-100 text-blue-700' : (tx as any).payment_type === 'mess' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                                  {(tx as any).payment_type ?? 'fee'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-green-600">₹{Number(tx.amount).toLocaleString('en-IN')}</td>
                              <td className="px-4 py-3 text-slate-600">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {new Date(tx.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-500 text-xs font-mono">{(tx as any).receipt_number ?? '—'}</td>
                              {canEdit && (
                                <td className="px-4 py-3">
                                  <button onClick={() => deleteTransaction(tx.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                          <tr className="bg-green-50 font-semibold">
                            <td className="px-4 py-3 text-navy-900">Total</td>
                            <td />
                            <td className="px-4 py-3 text-right text-green-700 text-base">₹{selectedUser.total.toLocaleString('en-IN')}</td>
                            <td colSpan={canEdit ? 3 : 2} />
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
