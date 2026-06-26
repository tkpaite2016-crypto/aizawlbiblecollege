import { useEffect, useState } from 'react';
import { MapPin, Briefcase, Award, BookOpen, User, Mail, Phone, Users } from 'lucide-react';
import { supabase, Profile, Teacher } from '../lib/supabase';

type FilterType = 'current' | 'former' | 'board';

type FacultyMember = {
  id: string;
  full_name: string;
  qualification: string | null;
  subject_in_charge: string | null;
  address: string | null;
  bio: string | null;
  photo_url: string | null;
  left_at?: string | null;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  source: 'profile' | 'teacher';
};

type BoardMember = {
  id: string;
  name: string;
  designation: string | null;
  photo_url: string | null;
  display_order: number;
};

export default function Teachers() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [formerTeachers, setFormerTeachers] = useState<FacultyMember[]>([]);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [filter, setFilter] = useState<FilterType>('current');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [profilesRes, teachersRes, boardRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, qualification, subject_in_charge, address, bio, avatar_url, email, phone, position')
        .eq('role', 'faculty')
        .order('full_name'),
      supabase.from('teachers').select('*').eq('is_current', false).order('display_order'),
      supabase.from('board_members').select('*').order('display_order'),
    ]);

    const currentFaculty: FacultyMember[] = (profilesRes.data ?? []).map((p) => ({
      id: p.id,
      full_name: p.full_name ?? 'Faculty Member',
      qualification: p.qualification,
      subject_in_charge: p.subject_in_charge,
      address: p.address,
      bio: p.bio,
      photo_url: p.avatar_url,
      email: p.email,
      phone: p.phone,
      position: p.position,
      source: 'profile' as const,
    }));

    const formerFaculty: FacultyMember[] = (teachersRes.data ?? []).map((t) => ({
      id: t.id,
      full_name: t.full_name,
      qualification: t.qualification,
      subject_in_charge: t.subject_in_charge,
      address: t.address,
      bio: t.bio,
      photo_url: t.photo_url,
      left_at: t.left_at,
      source: 'teacher' as const,
    }));

    setFaculty(currentFaculty);
    setFormerTeachers(formerFaculty);
    setBoardMembers(boardRes.data ?? []);
    setLoading(false);
  }

  const filtered = filter === 'current' ? faculty : filter === 'former' ? formerTeachers : [];

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="bg-navy-950 py-8 md:py-14">
        <div className="page-container text-center">
          <BookOpen className="w-8 h-8 md:w-9 md:h-9 text-gold-400 mx-auto mb-2 md:mb-3" />
          <h1 className="text-xl md:text-3xl font-serif font-bold text-white mb-1 md:mb-2">Our Faculty & Management</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-xs md:text-sm">
            Meet the theologians, scholars, and board members shaping the next generation of ministry leaders.
          </p>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="bg-white border-b border-slate-200 sticky top-[68px] z-30">
        <div className="page-container">
          <div className="flex items-center gap-1 py-3 overflow-x-auto hide-scrollbar">
            {([
              { id: 'current', label: 'Current Faculty', count: faculty.length },
              { id: 'former', label: 'Former Teachers', count: formerTeachers.length },
              { id: 'board', label: 'Board of Management', count: boardMembers.length },
            ] as { id: FilterType; label: string; count: number }[]).map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`px-5 py-2.5 text-sm font-semibold rounded-full transition-all whitespace-nowrap ${
                  filter === id
                    ? 'bg-navy-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-navy-800 hover:bg-slate-100'
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === id ? 'bg-white/20' : 'bg-slate-200 text-slate-600'}`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Board of Management */}
      {filter === 'board' && (
        <section className="py-12 md:py-16 bg-slate-50">
          <div className="page-container">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-navy-200 border-t-navy-800 rounded-full animate-spin" />
              </div>
            ) : boardMembers.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-500">No board members listed</h3>
                <p className="text-slate-400 text-sm mt-1">Board members will appear here once they are added by an administrator.</p>
              </div>
            ) : (
              <div>
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-serif font-bold text-navy-900">Board of Management</h2>
                  <p className="text-slate-500 text-sm mt-2">The governing board of Aizawl Bible College</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {boardMembers.map((member) => (
                    <div key={member.id} className="flex flex-col items-center text-center group">
                      <div className="relative w-28 h-28 mb-4">
                        {/* Decorative ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-gold-400 group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-1.5 rounded-full overflow-hidden bg-slate-100">
                          {member.photo_url ? (
                            <img
                              src={member.photo_url}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-100 to-navy-200">
                              <User className="w-10 h-10 text-navy-400" />
                            </div>
                          )}
                        </div>
                      </div>
                      <h3 className="font-semibold text-navy-900 text-sm leading-snug">{member.name}</h3>
                      {member.designation && (
                        <p className="text-gold-600 text-xs mt-1 font-medium">{member.designation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Faculty / Former list */}
      {filter !== 'board' && (
        <section className="py-12 md:py-16 bg-slate-50">
          <div className="page-container">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-navy-200 border-t-navy-800 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-500">
                  No {filter === 'current' ? 'current faculty' : 'former teachers'} found
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  {filter === 'current'
                    ? 'Faculty members will appear here once they are assigned.'
                    : 'Check back later or switch the filter.'}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {filtered.map((member, index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <div key={member.id} className="card hover:shadow-lg transition-all duration-300 overflow-visible">
                      <div className={`flex flex-col md:flex-row ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-stretch`}>
                        {/* Decorative accent */}
                        <div className={`absolute top-0 ${isEven ? 'left-0' : 'right-0'} w-1.5 h-full bg-gold-400 rounded-l-xl hidden md:block`} />

                        {/* Text side */}
                        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative">
                          <div className={`absolute top-4 ${isEven ? 'left-4' : 'right-4'} w-10 h-10 border-2 border-navy-200 rounded-lg opacity-30`} />

                          <div className="mb-1">
                            <p className="text-xs font-semibold text-gold-600 uppercase tracking-widest mb-1">
                              {filter === 'current' ? 'Current Faculty' : 'Former Faculty'}
                            </p>
                            <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">{member.full_name}</h2>
                            {member.position && (
                              <span className="inline-flex items-center mt-2 px-3 py-1 bg-navy-100 text-navy-700 text-xs font-semibold rounded-full">
                                {member.position}
                              </span>
                            )}
                          </div>

                          {member.qualification && (
                            <div className="flex items-start gap-2 mt-3 text-slate-600 text-sm">
                              <Award className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                              <span>{member.qualification}</span>
                            </div>
                          )}

                          {member.subject_in_charge && (
                            <div className="flex items-start gap-2 mt-2 text-slate-600 text-sm">
                              <Briefcase className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                              <span>{member.subject_in_charge}</span>
                            </div>
                          )}

                          {member.address && (
                            <div className="flex items-start gap-2 mt-2 text-slate-600 text-sm">
                              <MapPin className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                              <span>{member.address}</span>
                            </div>
                          )}

                          {member.source === 'profile' && (member.email || member.phone) && (
                            <div className="flex flex-wrap gap-4 mt-3">
                              {member.email && (
                                <a href={`mailto:${member.email}`} className="flex items-center gap-1.5 text-sm text-navy-600 hover:text-gold-600 transition-colors">
                                  <Mail className="w-3.5 h-3.5" /> {member.email}
                                </a>
                              )}
                              {member.phone && (
                                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                                  <Phone className="w-3.5 h-3.5" /> {member.phone}
                                </span>
                              )}
                            </div>
                          )}

                          {member.bio && (
                            <p className="text-slate-500 text-sm mt-4 leading-relaxed line-clamp-3">{member.bio}</p>
                          )}

                          {member.left_at && filter === 'former' && (
                            <p className="text-xs text-slate-400 mt-3">
                              Served until {new Date(member.left_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                            </p>
                          )}
                        </div>

                        {/* Photo side */}
                        <div className="w-full md:w-56 lg:w-72 flex-shrink-0 bg-slate-100 relative overflow-hidden min-h-[200px] md:min-h-0 rounded-t-xl md:rounded-none">
                          {member.photo_url ? (
                            <img
                              src={member.photo_url}
                              alt={member.full_name}
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
      )}
    </div>
  );
}
