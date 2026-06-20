import { useEffect, useState } from 'react';
import { Bell, Filter, Calendar, AlertTriangle, BookOpen, DollarSign, Star, Info } from 'lucide-react';
import { supabase, Notice } from '../lib/supabase';

const categories = ['all', 'academic', 'event', 'general', 'urgent', 'financial'] as const;
type Category = typeof categories[number];

const categoryIcon: Record<string, React.ElementType> = {
  academic: BookOpen,
  event: Calendar,
  urgent: AlertTriangle,
  financial: DollarSign,
  general: Info,
};

const categoryColor: Record<string, string> = {
  academic: 'bg-purple-100 text-purple-700 border-purple-200',
  event: 'bg-orange-100 text-orange-700 border-orange-200',
  urgent: 'bg-red-100 text-red-700 border-red-200',
  financial: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  general: 'bg-slate-100 text-slate-700 border-slate-200',
};

const priorityBadge: Record<string, string> = {
  high: 'bg-red-500 text-white',
  medium: 'bg-blue-500 text-white',
  low: 'bg-green-500 text-white',
};

export default function NoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [category, setCategory] = useState<Category>('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Notice | null>(null);

  useEffect(() => {
    setLoading(true);
    let query = supabase
      .from('notices')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    if (category !== 'all') query = query.eq('category', category);
    query.then(({ data }) => {
      setNotices(data ?? []);
      setLoading(false);
    });
  }, [category]);

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="bg-navy-950 py-10 md:py-14">
        <div className="page-container text-center">
          <Bell className="w-9 h-9 text-gold-400 mx-auto mb-3" />
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">Notice Board</h1>
          <p className="text-slate-400 max-w-lg mx-auto text-sm">
            Official announcements, events, and updates from Aizawl Bible College.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="bg-white border-b border-slate-200 sticky top-[68px] z-30">
        <div className="page-container">
          <div className="flex items-center gap-2 py-3 overflow-x-auto hide-scrollbar">
            <Filter className="w-4 h-4 text-slate-500 flex-shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-navy-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Notices' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Notices grid */}
      <section className="py-12 bg-slate-50">
        <div className="page-container">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-navy-200 border-t-navy-800 rounded-full animate-spin" />
            </div>
          ) : notices.length === 0 ? (
            <div className="text-center py-20">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-500">No notices found</h3>
              <p className="text-slate-400 text-sm mt-1">Try a different category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {notices.map((notice) => {
                const CatIcon = categoryIcon[notice.category] ?? Info;
                return (
                  <button
                    key={notice.id}
                    onClick={() => setSelected(notice)}
                    className="card text-left hover:shadow-lg transition-all hover:-translate-y-0.5 p-5 flex flex-col"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${categoryColor[notice.category]}`}>
                        <CatIcon className="w-3 h-3" />
                        {notice.category.charAt(0).toUpperCase() + notice.category.slice(1)}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${priorityBadge[notice.priority]}`}>
                        <Star className="w-2.5 h-2.5" />
                        {notice.priority}
                      </span>
                    </div>
                    <h3 className="font-semibold text-navy-900 text-base leading-snug mb-2">{notice.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed flex-1 line-clamp-3">{notice.content}</p>
                    <p className="text-slate-400 text-xs mt-3 pt-3 border-t border-slate-100">
                      {new Date(notice.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${categoryColor[selected.category]}`}>
                {selected.category.charAt(0).toUpperCase() + selected.category.slice(1)}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityBadge[selected.priority]}`}>
                {selected.priority} priority
              </span>
            </div>
            <h2 className="text-xl font-serif font-bold text-navy-900 mb-3">{selected.title}</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
            <p className="text-slate-400 text-xs mt-4 pt-4 border-t border-slate-100">
              Posted: {new Date(selected.created_at).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <button onClick={() => setSelected(null)} className="btn-primary mt-4 w-full justify-center">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
