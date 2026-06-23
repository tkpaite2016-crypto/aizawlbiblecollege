import { BookOpen, Mail, FileText, GraduationCap, Heart, ClipboardCheck, Calendar, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const documents = [
  'Duly completed application form.',
  'A written personal statement of Christian experience, and a clear sense of call for full-time Christian ministry.',
  'Duly attested copies of all the certificates and transcripts (original copies should be shown at the time of admission).',
  'Medical fitness certificate.',
  'Financial support statement from the sponsor(s).',
  'Confidential letters of recommendation from pastor.',
  'Three copies of recent passport size photographs.',
];

const qualifications = [
  {
    title: 'Physical Qualification',
    icon: Heart,
    text: 'The Candidate must be physically healthy and free from all physical deformities or sickness.',
  },
  {
    title: 'Educational Qualification',
    icon: GraduationCap,
    text: 'The candidate must have completed matriculation.',
  },
  {
    title: 'Attitudinal Qualification',
    icon: ClipboardCheck,
    text: 'The candidate should have a positive attitude in the ministry and towards the local church and her leadership.',
  },
  {
    title: 'Spiritual Qualification',
    icon: Heart,
    text: 'The candidate must be steady in his/her Christian Walk and be constantly growing and must have consistent and strong devotional life; must display spiritual maturity, moral purity and humility to comply with the rules and regulations of the College.',
  },
];

const calendar = [
  { event: 'Entrance Test & Interview', date: 'Second last week of May' },
  { event: 'Pre-Theology Class', date: 'Last week of May' },
  { event: 'Regular Class Begin', date: 'First week of June' },
  { event: "Fresher's Night", date: 'Second week of June' },
  { event: 'Foundation Day', date: 'July 20' },
  { event: 'I Semester Mid-Term Exams', date: 'Last Week of July' },
  { event: 'Spiritual Emphasis Week', date: 'First Week of August' },
  { event: 'Independence Day', date: 'August 15' },
  { event: "Teacher's Day", date: 'September 5' },
  { event: 'First Semester Final Exams', date: 'Last week of September' },
  { event: 'Sports Week', date: 'Second Week of October' },
  { event: 'II Semester Mid-Term Exams', date: 'Second Week of December' },
  { event: 'Christmas Vacation', date: 'Second Week of December' },
  { event: 'Class Re-open', date: 'Second Week of January' },
  { event: 'Republic Day', date: 'January 26' },
  { event: 'State Day', date: 'February 20' },
  { event: 'Graduation Day', date: 'First Sunday of March' },
];

export default function AcademicInfo() {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="bg-navy-950 py-8 md:py-14">
        <div className="page-container text-center">
          <BookOpen className="w-8 h-8 md:w-9 md:h-9 text-gold-400 mx-auto mb-2 md:mb-3" />
          <h1 className="text-xl md:text-3xl font-serif font-bold text-white mb-1 md:mb-2">Academic Information</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-xs md:text-sm">
            Application procedures, admission requirements, and the academic calendar.
          </p>
        </div>
      </section>

      {/* Application Procedure */}
      <section className="py-16 md:py-20 bg-white">
        <div className="page-container max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-12 bg-gold-400 rounded-full" />
            <h2 className="text-2xl font-serif font-bold text-navy-900">Application for Admission Procedure</h2>
          </div>

          <p className="text-slate-600 leading-relaxed text-base mb-6">
            All correspondence concerning application should be addressed to:
          </p>

          <div className="bg-navy-50 border border-navy-100 rounded-2xl p-6 md:p-8 text-center mb-8">
            <p className="font-semibold text-navy-900 text-lg mb-1">The Academic Dean</p>
            <p className="font-medium text-navy-700">Aizawl Bible College</p>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              Post Box – 115, Tuikual North 'D' Mual,<br />
              Aizawl, Mizoram, Pin – 796001
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-gold-600">
              <Mail className="w-4 h-4" />
              <a href="mailto:aizawlbiblecollege24@gmail.com" className="text-sm font-medium hover:underline">
                aizawlbiblecollege24@gmail.com
              </a>
            </div>
          </div>

          {/* Required documents */}
          <div className="mb-8">
            <h3 className="font-semibold text-navy-900 text-lg mb-4">Required Documents</h3>
            <p className="text-slate-600 text-sm mb-4">
              The following documents should be submitted to the Academic office at least <strong className="text-navy-800">five days before the entrance examination</strong>:
            </p>
            <div className="space-y-3">
              {documents.map((doc, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 text-sm leading-relaxed">{doc}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm leading-relaxed">
                <strong>Important:</strong> Application will be rejected if there is any discrepancy in the stated documents. Incomplete application will not be considered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Admission Requirements */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="page-container max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-12 bg-gold-400 rounded-full" />
            <h2 className="text-2xl font-serif font-bold text-navy-900">Admission Requirements</h2>
          </div>

          {/* BTh Requirements */}
          <div className="card p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gold-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-gold-600" />
              </div>
              <h3 className="font-serif font-bold text-navy-900 text-lg">1. Bachelor of Theology</h3>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm mb-4">
              Candidates should have successfully completed the pre-university course or its equivalent. Students who are awaiting results may apply. Such candidates will have to produce the grades of the previous course completed. If admitted they should produce completion certificate before the end of the first semester.
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg">
              <p className="text-amber-800 text-sm">
                <strong>Note:</strong> At the time of admission, original certificates should be shown to the office.
              </p>
            </div>
          </div>

          {/* Entrance Exam */}
          <div className="card p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-serif font-bold text-navy-900 text-lg">2. Entrance Examination</h3>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              All applicants for admission to the B.Th are required to pass an entrance examination covering three one-hour papers: <strong className="text-navy-800">Bible Knowledge, English and General Knowledge</strong>.
            </p>
          </div>

          {/* Qualifications */}
          <div className="card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-navy-100 rounded-xl flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-navy-600" />
              </div>
              <h3 className="font-serif font-bold text-navy-900 text-lg">3. Qualifications</h3>
            </div>

            <div className="space-y-4">
              {qualifications.map((q) => (
                <div key={q.title} className="p-4 bg-slate-50 rounded-xl hover:bg-navy-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <q.icon className="w-4 h-4 text-navy-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900 text-sm mb-1">{q.title}</p>
                      <p className="text-slate-600 text-sm leading-relaxed">{q.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Academic Calendar */}
      <section className="py-16 md:py-20 bg-white">
        <div className="page-container max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-12 bg-gold-400 rounded-full" />
            <h2 className="text-2xl font-serif font-bold text-navy-900">Academic Calendar</h2>
          </div>

          <div className="card overflow-hidden">
            <div className="divide-y divide-slate-100">
              {calendar.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gold-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-gold-600" />
                    </div>
                    <span className="text-navy-900 text-sm font-medium">{item.event}</span>
                  </div>
                  <span className="text-slate-500 text-xs whitespace-nowrap">{item.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/apply" className="btn-primary text-base px-8 py-3">
              Apply for Admission <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
