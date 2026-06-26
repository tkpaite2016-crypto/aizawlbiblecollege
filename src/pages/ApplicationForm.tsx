import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { CheckCircle, AlertCircle, Camera, RotateCcw, Upload, FileText, Download, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type AcademicRow = { class_name: string; school_college: string; pass_fail: string; year: string };

type FormState = {
  course_applied: string;
  full_name: string;
  present_address: string;
  gender: string;
  dob: string;
  phone: string;
  pin_code: string;
  email: string;
  guardian_name: string;
  parent_occupation: string;
  annual_income: string;
  mother_tongue: string;
  other_languages: string;
  marital_status: string;
  born_again: string;
  water_baptism_date: string;
  denomination: string;
  church_involvement: string;
  statement_of_purpose: string;
  calling_aim: string;
  practices_vices: string;
  can_pay_fees: string;
  fee_sponsor: string;
};

const emptyForm: FormState = {
  course_applied: '', full_name: '', present_address: '', gender: '', dob: '',
  phone: '', pin_code: '', email: '', guardian_name: '', parent_occupation: '',
  annual_income: '', mother_tongue: '', other_languages: '', marital_status: '',
  born_again: '', water_baptism_date: '', denomination: '', church_involvement: '',
  statement_of_purpose: '', calling_aim: '', practices_vices: '', can_pay_fees: '',
  fee_sponsor: '',
};

const emptyRow = (): AcademicRow => ({ class_name: '', school_college: '', pass_fail: '', year: '' });

function RadioGroup({ name, value, options, onChange }: {
  name: string; value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {options.map(o => (
        <label key={o.value} className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="radio" name={name} value={o.value} checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="w-4 h-4 accent-navy-700"
          />
          <span className="text-sm text-slate-700">{o.label}</span>
        </label>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export default function ApplicationForm() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState<FormState>({
    ...emptyForm,
    email: profile?.email ?? '',
    full_name: profile?.full_name ?? '',
  });
  const [academicRows, setAcademicRows] = useState<AcademicRow[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const sigRef = useRef<SignatureCanvas>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [formDownloadUrl, setFormDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('downloads')
      .select('file_url, title')
      .eq('category', 'application_form')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.file_url) setFormDownloadUrl(data.file_url);
      });
  }, []);

  const set = useCallback((key: keyof FormState, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
  }, []);

  function onInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function updateRow(i: number, key: keyof AcademicRow, val: string) {
    setAcademicRows(rows => rows.map((r, idx) => idx === i ? { ...r, [key]: val } : r));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.full_name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }

    const signatureDataUrl = sigRef.current?.isEmpty() ? null : sigRef.current?.toDataURL() ?? null;

    setLoading(true);
    const { error: dbErr } = await supabase.from('applications').insert({
      user_id: user?.id ?? null,
      // core legacy fields (backwards compat)
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      dob: form.dob || null,
      gender: form.gender || null,
      address: form.present_address,
      applying_for: form.course_applied || null,
      // new fields
      course_applied: form.course_applied || null,
      pin_code: form.pin_code || null,
      guardian_name: form.guardian_name || null,
      parent_occupation: form.parent_occupation || null,
      annual_income: form.annual_income || null,
      mother_tongue: form.mother_tongue || null,
      other_languages: form.other_languages || null,
      marital_status: form.marital_status || null,
      academic_qualifications: academicRows.filter(r => r.class_name || r.school_college),
      born_again: form.born_again || null,
      water_baptism_date: form.water_baptism_date || null,
      denomination: form.denomination || null,
      church_involvement: form.church_involvement || null,
      statement_of_purpose: form.statement_of_purpose || null,
      calling_aim: form.calling_aim || null,
      practices_vices: form.practices_vices === 'yes' ? true : form.practices_vices === 'no' ? false : null,
      can_pay_fees: form.can_pay_fees === 'yes' ? true : form.can_pay_fees === 'no' ? false : null,
      fee_sponsor: form.fee_sponsor || null,
      passport_photo_url: photoPreview,
      signature_data_url: signatureDataUrl,
    });

    if (dbErr) {
      setError(dbErr.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-5">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-navy-900 mb-3">Application Submitted!</h2>
          <p className="text-slate-600 leading-relaxed">
            Thank you for applying to Aizawl Bible College. We will review your application and contact you soon at <strong>{form.email}</strong>.
          </p>
          <button onClick={() => { setSuccess(false); setForm({ ...emptyForm, email: profile?.email ?? '', full_name: profile?.full_name ?? '' }); setAcademicRows([emptyRow(), emptyRow(), emptyRow()]); setPhotoPreview(null); sigRef.current?.clear(); }} className="btn-primary mt-6">
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">

      {/* Hero */}
      <section className="bg-navy-950 py-8 md:py-12 lg:py-14">
        <div className="page-container text-center">
          <FileText className="w-8 h-8 md:w-9 md:h-9 text-gold-400 mx-auto mb-2 md:mb-3" />
          <h1 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-white mb-1 md:mb-2">Application Form</h1>
          <p className="text-slate-400 max-w-lg mx-auto text-xs md:text-sm">
            Apply for admission to Aizawl Bible College. Fill in the form below and submit — it takes just a few minutes.
          </p>
          <div className="flex justify-center mt-4">
            <Link
              to="/downloads#application"
              className="inline-flex items-center gap-2 text-gold-300 hover:text-gold-100 text-sm transition-colors border border-gold-500/30 px-5 py-2.5 rounded-lg hover:bg-white/5"
            >
              <ExternalLink className="w-4 h-4" />
              View Application Form in Downloads
            </Link>
          </div>
        </div>
      </section>

      <div className="min-h-screen bg-slate-100 py-10">
      <div className="max-w-3xl mx-auto px-4">

        {/* Institution Letterhead */}
        <div className="bg-white border border-slate-200 rounded-t-2xl px-6 pt-7 pb-5 text-center shadow-sm">
          <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-widest text-navy-900 uppercase">Aizawl Bible College</h1>
          <p className="text-xs text-slate-500 mt-1">Regd No: MSR 1801 of 29.07.2025</p>
          <p className="text-xs font-medium text-slate-600 italic">A Theological Institution of Assemblies of God Mizoram District</p>
          <p className="text-xs text-slate-500 italic">Accredited by Pentecostal Association for Theological Accreditation (PATA)</p>
          <p className="text-xs text-slate-500 italic">(Member of Evangelical Theological Colleges Association – NEI)</p>
          <p className="text-xs text-slate-500 mt-1">Post Box – 115, Tuikual North 'D' Mual, Aizawl – 796001, Mizoram, India</p>
          <p className="text-xs text-slate-500">Phone: 9383007361 / 9862713689 &nbsp;|&nbsp; Email: aizawlbiblecollege24@gmail.com</p>

          <div className="my-5 border-t border-slate-200" />

          <div className="inline-block border-2 border-navy-900 px-8 py-1.5 rounded">
            <span className="text-base font-bold tracking-widest text-navy-900 uppercase">Application Form</span>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2 px-5 py-3 bg-red-50 border-x border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border-x border-b border-slate-200 rounded-b-2xl shadow-sm px-6 md:px-8 pb-8">

          {/* ── PART A ── */}
          <div className="pt-7 pb-2 text-center">
            <h2 className="text-base font-bold underline tracking-widest text-navy-900">PART A</h2>
            <p className="text-xs italic text-slate-500 mt-1">To be filled in by the applicant only</p>
          </div>

          {/* Course + Photo row */}
          <div className="flex items-start justify-between gap-4 mt-4 mb-6">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Course Applied for:</p>
              <RadioGroup
                name="course_applied" value={form.course_applied}
                options={[{ label: 'B.Th', value: 'BTh' }, { label: 'Dip.Th', value: 'DipTh' }, { label: 'C.Th', value: 'CTh' }]}
                onChange={v => set('course_applied', v)}
              />
            </div>

            {/* Passport Photo */}
            <div className="flex flex-col items-center">
              <div
                onClick={() => photoRef.current?.click()}
                className="w-24 h-28 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-navy-400 overflow-hidden bg-slate-50 transition-colors"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Passport" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-1">
                    <Camera className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400 leading-tight">Affix passport size photograph</p>
                  </div>
                )}
              </div>
              <button type="button" onClick={() => photoRef.current?.click()} className="mt-1.5 flex items-center gap-1 text-xs text-navy-600 hover:text-navy-800 font-medium">
                <Upload className="w-3 h-3" /> Upload
              </button>
              <input ref={photoRef} type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
            </div>
          </div>

          <div className="space-y-4">
            {/* 1. Name */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2.5">1.</span>
              <Field label="Name of Applicant (in CAPITALS as in Board/Degree Certificate)">
                <input name="full_name" value={form.full_name} onChange={onInput} required
                  className="input-field uppercase placeholder:normal-case" placeholder="Full name as on certificate" />
              </Field>
            </div>

            {/* 2. Address */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2.5">2.</span>
              <Field label="Present Address">
                <textarea name="present_address" value={form.present_address} onChange={onInput} rows={2}
                  className="input-field resize-none" placeholder="Village/Town, District, State" />
              </Field>
            </div>

            {/* 3. Gender + DOB */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2.5">3.</span>
              <div className="flex-1 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <p className="label">Gender</p>
                  <RadioGroup name="gender" value={form.gender}
                    options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]}
                    onChange={v => set('gender', v)} />
                </div>
                <Field label="Date of Birth">
                  <input type="date" name="dob" value={form.dob} onChange={onInput} className="input-field" />
                </Field>
              </div>
            </div>

            {/* 4. Mobile + Pin */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2.5">4.</span>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Mobile">
                  <input type="tel" name="phone" value={form.phone} onChange={onInput} className="input-field" placeholder="+91 XXXXX XXXXX" />
                </Field>
                <Field label="Pin Code">
                  <input name="pin_code" value={form.pin_code} onChange={onInput} className="input-field" placeholder="796001" />
                </Field>
              </div>
            </div>

            {/* 5. Email */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2.5">5.</span>
              <Field label="Email Id">
                <input type="email" name="email" value={form.email} onChange={onInput} required className="input-field" placeholder="you@example.com" />
              </Field>
            </div>

            {/* 6. Guardian */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2.5">6.</span>
              <Field label="Name of the Father / Mother or Guardian">
                <input name="guardian_name" value={form.guardian_name} onChange={onInput} className="input-field" placeholder="Parent or guardian's full name" />
              </Field>
            </div>

            {/* 7. Parent Occupation */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2.5">7.</span>
              <Field label="Parent's Occupation">
                <input name="parent_occupation" value={form.parent_occupation} onChange={onInput} className="input-field" placeholder="e.g., Farmer, Government employee" />
              </Field>
            </div>

            {/* 8. Annual Income */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2.5">8.</span>
              <Field label="Annual Income of Parent or Guardian">
                <input name="annual_income" value={form.annual_income} onChange={onInput} className="input-field" placeholder="e.g., ₹1,20,000 per year" />
              </Field>
            </div>

            {/* 9. Mother Tongue + Other languages */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2.5">9.</span>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Mother Tongue">
                  <input name="mother_tongue" value={form.mother_tongue} onChange={onInput} className="input-field" placeholder="e.g., Mizo" />
                </Field>
                <Field label="Do you speak any other language(s)?">
                  <input name="other_languages" value={form.other_languages} onChange={onInput} className="input-field" placeholder="e.g., Hindi, English" />
                </Field>
              </div>
            </div>

            {/* 10. Status */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2">10.</span>
              <div>
                <p className="label">Status</p>
                <RadioGroup name="marital_status" value={form.marital_status}
                  options={[{ label: 'Single', value: 'single' }, { label: 'Married', value: 'married' }]}
                  onChange={v => set('marital_status', v)} />
              </div>
            </div>

            {/* 11. Academic Qualifications */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2">11.</span>
              <div className="flex-1">
                <p className="label mb-3">Academic Qualification</p>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-navy-50">
                        <th className="text-left px-3 py-2 font-semibold text-navy-800 border-b border-slate-200 w-1/4">Class</th>
                        <th className="text-left px-3 py-2 font-semibold text-navy-800 border-b border-slate-200">School / College</th>
                        <th className="text-left px-3 py-2 font-semibold text-navy-800 border-b border-slate-200 w-24">Pass / Fail</th>
                        <th className="text-left px-3 py-2 font-semibold text-navy-800 border-b border-slate-200 w-20">Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {academicRows.map((row, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          <td className="px-2 py-1.5">
                            <input value={row.class_name} onChange={e => updateRow(i, 'class_name', e.target.value)}
                              className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-navy-400"
                              placeholder="e.g., HSLC" />
                          </td>
                          <td className="px-2 py-1.5">
                            <input value={row.school_college} onChange={e => updateRow(i, 'school_college', e.target.value)}
                              className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-navy-400"
                              placeholder="Institution name" />
                          </td>
                          <td className="px-2 py-1.5">
                            <select value={row.pass_fail} onChange={e => updateRow(i, 'pass_fail', e.target.value)}
                              className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-navy-400 bg-white">
                              <option value="">—</option>
                              <option value="Pass">Pass</option>
                              <option value="Fail">Fail</option>
                            </select>
                          </td>
                          <td className="px-2 py-1.5">
                            <input value={row.year} onChange={e => updateRow(i, 'year', e.target.value)}
                              className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-navy-400"
                              placeholder="YYYY" maxLength={4} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={() => setAcademicRows(r => [...r, emptyRow()])}
                  className="mt-2 text-xs text-navy-600 hover:text-navy-800 font-medium underline">
                  + Add row
                </button>
              </div>
            </div>
          </div>

          {/* ── PART B ── */}
          <div className="mt-10 pt-6 border-t border-slate-200 pb-2 text-center">
            <h2 className="text-base font-bold underline tracking-widest text-navy-900">PART B</h2>
          </div>

          <div className="mt-5 space-y-4">
            {/* B1 */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2.5">1.</span>
              <Field label="Are you a Born-Again Believer?">
                <input name="born_again" value={form.born_again} onChange={onInput} className="input-field" placeholder="Yes — explain briefly" />
              </Field>
            </div>

            {/* B2 */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2.5">2.</span>
              <Field label="When did you take Water Baptism?">
                <input name="water_baptism_date" value={form.water_baptism_date} onChange={onInput} className="input-field" placeholder="e.g., March 2018" />
              </Field>
            </div>

            {/* B3 */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2.5">3.</span>
              <Field label="What is your denomination?">
                <input name="denomination" value={form.denomination} onChange={onInput} className="input-field" placeholder="e.g., Assemblies of God" />
              </Field>
            </div>

            {/* B4 */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2.5">4.</span>
              <Field label="State your involvement in the Church activities">
                <textarea name="church_involvement" value={form.church_involvement} onChange={onInput} rows={3}
                  className="input-field resize-none" placeholder="Describe your roles, ministries, and activities in church..." />
              </Field>
            </div>

            {/* B5 */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2.5">5.</span>
              <Field label="Write Statement of purpose to study in this college">
                <textarea name="statement_of_purpose" value={form.statement_of_purpose} onChange={onInput} rows={3}
                  className="input-field resize-none" placeholder="Why do you want to study at Aizawl Bible College?" />
              </Field>
            </div>

            {/* B6 */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2.5">6.</span>
              <Field label="What is your calling / aim in life?">
                <input name="calling_aim" value={form.calling_aim} onChange={onInput} className="input-field" placeholder="e.g., Full-time pastor, missionary..." />
              </Field>
            </div>

            {/* B7 */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2">7.</span>
              <div>
                <p className="label">Do you practice smoking, chewing tobacco and Pan, drinking alcohol etc.?</p>
                <RadioGroup name="practices_vices" value={form.practices_vices}
                  options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
                  onChange={v => set('practices_vices', v)} />
              </div>
            </div>

            {/* B8 */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2">8.</span>
              <div>
                <p className="label">Will you be able to pay your fees during study in ABC?</p>
                <RadioGroup name="can_pay_fees" value={form.can_pay_fees}
                  options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
                  onChange={v => set('can_pay_fees', v)} />
              </div>
            </div>

            {/* B9 */}
            <div className="flex gap-2 items-start">
              <span className="text-sm font-medium text-slate-600 w-5 flex-shrink-0 mt-2">9.</span>
              <div>
                <p className="label">Who is going to sponsor your fees?</p>
                <RadioGroup name="fee_sponsor" value={form.fee_sponsor}
                  options={[
                    { label: 'Self', value: 'self' },
                    { label: 'Guardian', value: 'guardian' },
                    { label: 'Church or Organization', value: 'church' },
                  ]}
                  onChange={v => set('fee_sponsor', v)} />
              </div>
            </div>
          </div>

          {/* ── DECLARATION ── */}
          <div className="mt-10 pt-6 border-t border-slate-200">
            <h2 className="text-sm font-bold tracking-widest text-center text-navy-900 mb-4">DECLARATION OF THE APPLICANT</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 leading-relaxed space-y-3">
              <p>
                I, <span className="font-medium text-navy-800">{form.full_name || '(applicant\'s name)'}</span>, declare that the information given in this form by me is true and correct. I understand that any information which I have given above, if proved to be false or incorrect, it will automatically disqualify myself for admitted to, or continuing at ABC. I hereby promise by God's help, to faithfully co-operate in observing them and I will endeavour to maintain the high standard of excellence in my conduct and study that will glorify Christ.
              </p>
              <p>
                I promise to fulfill all my financial obligations in paying promptly the required fee for the entire course as per the rules of the college.
              </p>
            </div>

            {/* Date + Signature */}
            <div className="mt-6 flex flex-col sm:flex-row gap-6">
              <div className="sm:w-44">
                <label className="label">Date</label>
                <input type="date" defaultValue={new Date().toISOString().split('T')[0]} readOnly
                  className="input-field bg-slate-50 cursor-default" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Signature of Applicant</label>
                  <button type="button" onClick={() => sigRef.current?.clear()}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition-colors">
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                </div>
                <div className="border-2 border-slate-300 rounded-lg bg-white overflow-hidden" style={{ height: 120 }}>
                  <SignatureCanvas
                    ref={sigRef}
                    penColor="#1e2a8a"
                    canvasProps={{ className: 'w-full h-full', style: { width: '100%', height: '100%' } }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Sign using your mouse or finger on a touchscreen.</p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base font-semibold">
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
