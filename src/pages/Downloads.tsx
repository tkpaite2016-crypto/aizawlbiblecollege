import { useEffect, useState } from 'react';
import { Download as DownloadIcon, FileText, Calendar, BookOpen, FileCheck, Info, Filter } from 'lucide-react';
import { supabase, Download } from '../lib/supabase';

const categories = ['all', 'academic_calendar', 'syllabus', 'application_form', 'result', 'general', 'policy'] as const;
type Cat = typeof categories[number];

const catLabel: Record<string, string> = {
  all: 'All Files',
  academic_calendar: 'Academic Calendar',
  syllabus: 'Syllabus',
  application_form: 'Application Form',
  result: 'Results',
  general: 'General',
  policy: 'Policy',
};

const catIcon: Record<string, React.ElementType> = {
  academic_calendar: Calendar,
  syllabus: BookOpen,
  application_form: FileCheck,
  result: FileText,
  general: Info,
  policy: FileText,
};

const catColor: Record<string, string> = {
  academic_calendar: 'bg-blue-100 text-blue-700',
  syllabus: 'bg-purple-100 text-purple-700',
  application_form: 'bg-green-100 text-green-700',
  result: 'bg-orange-100 text-orange-700',
  general: 'bg-slate-100 text-slate-700',
  policy: 'bg-red-100 text-red-700',
};

export default function Downloads() {
  const [files, setFiles] = useState<Download[]>([]);
  const [category, setCategory] = useState<Cat>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let q = supabase.from('downloads').select('*').eq('is_active', true).order('created_at', { ascending: false });
    if (category !== 'all') q = q.eq('category', category);
    q.then(({ data }) => { setFiles(data ?? []); setLoading(false); });
  }, [category]);

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="bg-navy-950 py-8 md:py-14">
        <div className="page-container text-center">
          <DownloadIcon className="w-8 h-8 md:w-9 md:h-9 text-gold-400 mx-auto mb-2 md:mb-3" />
          <h1 className="text-xl md:text-3xl font-serif font-bold text-white mb-1 md:mb-2">Downloads</h1>
          <p className="text-slate-400 max-w-lg mx-auto text-xs md:text-sm">
            Academic calendars, syllabi, application forms, and more.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="bg-white border-b border-slate-200 sticky top-[68px] z-30">
        <div className="page-container">
          <div className="flex items-center gap-2 py-3 overflow-x-auto">
            <Filter className="w-4 h-4 text-slate-500 flex-shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                  category === cat ? 'bg-navy-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {catLabel[cat]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Files */}
      <section className="py-12 bg-slate-50">
        <div className="page-container">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-navy-200 border-t-navy-800 rounded-full animate-spin" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No files available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => {
                const CatIcon = catIcon[file.category] ?? FileText;
                return (
                  <div key={file.id} className="card hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${catColor[file.category]}`}>
                        <CatIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-navy-900 text-sm leading-snug">{file.title}</h3>
                        {file.semester && <p className="text-xs text-slate-500 mt-0.5">{file.semester}</p>}
                      </div>
                    </div>

                    {file.description && (
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{file.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catColor[file.category]}`}>
                        {catLabel[file.category]}
                      </span>
                      {file.file_size_kb && (
                        <span className="text-xs text-slate-400">{(file.file_size_kb / 1024).toFixed(1)} MB</span>
                      )}
                    </div>

                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full justify-center text-sm py-2"
                    >
                      <DownloadIcon className="w-3.5 h-3.5" />
                      Download PDF
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
