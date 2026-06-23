import { useState } from 'react';
import { MapPin, Mail, Facebook, Youtube, Instagram, MessageCircle, Send, CheckCircle, Loader, AlertCircle } from 'lucide-react';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            subject: form.subject || undefined,
            message: form.message,
          }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      setSent(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-enter">
      <section className="bg-navy-950 py-8 md:py-14">
        <div className="page-container text-center">
          <Mail className="w-8 h-8 md:w-9 md:h-9 text-gold-400 mx-auto mb-2 md:mb-3" />
          <h1 className="text-xl md:text-3xl font-serif font-bold text-white mb-1 md:mb-2">Contact Us</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-xs md:text-sm">
            We'd love to hear from you. Reach out with questions, prayer requests, or inquiries.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-slate-50">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact info */}
            <div className="space-y-5">
              <div className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-navy-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-navy-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-900 text-sm mb-1">Our Address</p>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Post Box - 115<br />
                      Tuikual North 'D' Mual<br />
                      Aizawl - 796001<br />
                      Mizoram, India
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-900 text-sm mb-1">Email</p>
                    <a href="mailto:aizawlbiblecollege24@gmail.com" className="text-navy-700 hover:text-navy-900 text-sm">
                      aizawlbiblecollege24@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="card p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-navy-900 text-sm mb-3">Follow Us</p>
                <div className="flex items-center gap-3">
                  <a
                    href="https://www.facebook.com/people/Aizawl-Bible-College/100072019050045/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    <Facebook className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href="https://youtube.com/@AizawlBibleCollege"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors"
                  >
                    <Youtube className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href="https://instagram.com/@AizawlBibleCollege"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <Instagram className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 text-white" />
                  </a>
                </div>
              </div>

              <div className="bg-navy-950 rounded-2xl p-5 text-center">
                <p className="text-gold-400 font-serif font-bold text-base mb-1">Office Hours</p>
                <p className="text-slate-300 text-sm">Monday – Friday</p>
                <p className="text-white font-medium text-sm">9:00 AM – 4:00 PM</p>
                <p className="text-slate-400 text-xs mt-2">Closed on Sundays & Public Holidays</p>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2">
              {sent ? (
                <div className="card p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-navy-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-600">Thank you for reaching out. We'll get back to you soon.</p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                    className="btn-primary mt-6"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <div className="card p-6 md:p-8">
                  <h2 className="text-xl font-serif font-bold text-navy-900 mb-6">Send Us a Message</h2>

                  {submitError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {submitError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Your Name *</label>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Full Name"
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Subject</label>
                      <select name="subject" value={form.subject} onChange={handleChange} className="input-field">
                        <option value="">Select a subject</option>
                        <option value="admissions">Admissions Inquiry</option>
                        <option value="programs">Academic Programs</option>
                        <option value="fees">Fee Structure</option>
                        <option value="visit">Campus Visit</option>
                        <option value="prayer">Prayer Request</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Message *</label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={6}
                        className="input-field resize-none"
                        placeholder="Write your message here..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full justify-center py-3 text-base"
                    >
                      {submitting ? (
                        <><Loader className="w-4 h-4 animate-spin" /> Sending...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Send Message</>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
