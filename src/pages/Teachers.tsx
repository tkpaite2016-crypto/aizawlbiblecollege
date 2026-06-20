import { useEffect, useState } from 'react';
import { MapPin, Briefcase, Award, BookOpen, User } from 'lucide-react';
import { supabase, Teacher } from '../lib/supabase';

type FilterType = 'current' | 'former';

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filter, setFilter] = useState<FilterType>('current');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('teachers')
      .select('*')
      .eq('is_current', filter === 'current')
      .order('display_order', { ascending: true })
      .then(({ data }) => {
        setTeachers(data ?? []);
        setLoading(false);
      });
  }, [filter]);

  const filtered = teachers;

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="bg-navy-950 py-10 md:py-14">
        <div className="page-container text-center">
          <BookOpen className="w-9 h-9 text-gold-400 mx-auto mb-3" />
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">Our Dedicated Faculty</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Meet the theologians and scholars shaping the next generation of ministry leaders.
          </p>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="bg-white border-b border-slate-200 sticky top-[68px] z-30">
        <div className="page-container">
          <div className="flex items-center gap-0 py-3">
            <button
              onClick={() => setFilter('current')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all ${
                filter === 'current'
                  ? 'bg-navy-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-800 hover:bg-slate-100'
              }`}
            >
              Current Faculty
            </button>
            <button
              onClick={() => setFilter('former')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all ${
                filter === 'former'
                  ? 'bg-navy-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-800 hover:bg-slate-100'
              }`}
            >
              Former Teachers
            </button>
          </div>
        </div>
      </section>

      {/* Teachers zigzag list */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="page-container">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-navy-200 border-t-navy-800 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-500">No {filter} faculty found</h3>
              <p className="text-slate-400 text-sm mt-1">Check back later or switch the filter.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filtered.map((teacher, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div
                    key={teacher.id}
                    className="card hover:shadow-lg transition-all duration-300 overflow-visible"
                  >
                    <div className={`flex flex-col md:flex-row ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-stretch`}>
                      {/* Decorative accent */}
                      <div className={`absolute top-0 ${isEven ? 'left-0' : 'right-0'} w-1.5 h-full bg-gold-400 rounded-l-xl hidden md:block`} />

                      {/* Text side */}
                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative">
                        {/* Corner decoration */}
                        <div className={`absolute top-4 ${isEven ? 'left-4' : 'right-4'} w-10 h-10 border-2 border-navy-200 rounded-lg opacity-30`} />

                        <div className="mb-1">
                          <p className="text-xs font-semibold text-gold-600 uppercase tracking-widest mb-1">
                            {filter === 'current' ? 'Current Faculty' : 'Former Faculty'}
                          </p>
                          <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">{teacher.full_name}</h2>
                        </div>

                        {teacher.qualification && (
                          <div className="flex items-start gap-2 mt-3 text-slate-600 text-sm">
                            <Award className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                            <span>{teacher.qualification}</span>
                          </div>
                        )}

                        {teacher.address && (
                          <div className="flex items-start gap-2 mt-2 text-slate-600 text-sm">
                            <MapPin className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                            <span>{teacher.address}</span>
                          </div>
                        )}

                        {teacher.subject_in_charge && (
                          <div className="flex items-start gap-2 mt-2 text-slate-600 text-sm">
                            <Briefcase className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                            <span>{teacher.subject_in_charge}</span>
                          </div>
                        )}

                        {teacher.bio && (
                          <p className="text-slate-500 text-sm mt-4 leading-relaxed line-clamp-3">{teacher.bio}</p>
                        )}

                        {teacher.left_at && filter === 'former' && (
                          <p className="text-xs text-slate-400 mt-3">
                            Served until {new Date(teacher.left_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                          </p>
                        )}
                      </div>

                      {/* Photo side */}
                      <div className="w-full md:w-56 lg:w-72 flex-shrink-0 bg-slate-100 relative overflow-hidden min-h-[200px] md:min-h-0 rounded-t-xl md:rounded-none">
                        {teacher.photo_url ? (
                          <img
                            src={teacher.photo_url}
                            alt={teacher.full_name}
                            className="w-full h-full object-cover"
                            style={{ minHeight: '220px' }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full min-h-[220px] bg-gradient-to-br from-slate-100 to-slate-200">
                            <div className="w-16 h-16 bg-slate-300 rounded-lg flex items-center justify-center">
                              <User className="w-8 h-8 text-slate-500" />
                            </div>
                            <p className="text-slate-400 text-xs mt-2">Photo not available</p>
                          </div>
                        )}
                        {/* Gold corner accents matching the image */}
                        <div className={`absolute top-3 ${isEven ? 'right-3' : 'left-3'} w-5 h-5 border-t-2 border-r-2 border-gold-400 opacity-60`} />
                        <div className={`absolute bottom-3 ${isEven ? 'left-3' : 'right-3'} w-5 h-5 border-b-2 border-l-2 border-navy-400 opacity-60`} />
                      </div>
                    </div>
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
