import { useEffect, useState, useRef } from 'react';
import { BookOpen, Target, Eye, Heart, Award, Users, MapPin, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

function AnimatedCounter({ value, label, icon: Icon }: { value: number; label: string; icon: React.ElementType }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const duration = 1800;
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(tick);
            else setCount(value);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="card p-6 text-center hover:shadow-md transition-shadow">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-navy-100 rounded-xl mb-3">
        <Icon className="w-6 h-6 text-navy-700" />
      </div>
      <p className="text-4xl font-serif font-bold text-navy-900">{count}+</p>
      <p className="text-slate-600 text-sm mt-1">{label}</p>
    </div>
  );
}

export default function AboutUs() {
  const [stats, setStats] = useState({ first: 0, second: 0, final: 0 });
  const [siteImages, setSiteImages] = useState<Record<string, string>>({});

  // Default fallback images
  const defaultImages = {
    about_hero_image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1600',
    about_image_1: 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=600',
    about_image_2: 'https://images.pexels.com/photos/1708936/pexels-photo-1708936.jpeg?auto=compress&cs=tinysrgb&w=600',
    about_image_3: 'https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg?auto=compress&cs=tinysrgb&w=600',
    about_image_4: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=600',
  };

  useEffect(() => {
    supabase
      .from('profiles')
      .select('student_year')
      .eq('role', 'student')
      .then(({ data }) => {
        if (!data) return;
        setStats({
          first: data.filter((p) => p.student_year === '1st_year').length,
          second: data.filter((p) => p.student_year === '2nd_year').length,
          final: data.filter((p) => p.student_year === 'final_year').length,
        });
      });

    supabase
      .from('site_settings')
      .select('*')
      .like('setting_key', 'about_%')
      .then(({ data }) => {
        if (data) {
          const imgMap: Record<string, string> = {};
          data.forEach((s) => {
            imgMap[s.setting_key] = s.setting_value;
          });
          setSiteImages(imgMap);
        }
      });
  }, []);

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="bg-navy-950 py-8 md:py-14">
        <div className="page-container text-center">
          <BookOpen className="w-8 h-8 md:w-9 md:h-9 text-gold-400 mx-auto mb-2 md:mb-3" />
          <h1 className="text-xl md:text-3xl font-serif font-bold text-white mb-1 md:mb-2">About Aizawl Bible College</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-xs md:text-sm">
            A premier theological institution of the Assemblies of God, Mizoram District, committed to excellence in biblical education since 1998.
          </p>
        </div>
      </section>

      {/* History */}
      <section className="py-16 md:py-20 bg-white">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold text-gold-600 uppercase tracking-wide">Our Story</span>
              <h2 className="section-title mt-2 mb-5">A Legacy of Faith & Learning</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Founded in 1998 by the Assemblies of God Mizoram District, Aizawl Bible College was established with a
                singular vision: to equip young men and women with sound theological education for effective ministry
                in Northeast India and beyond.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                Over more than two decades, our college has grown into a respected institution known for its rigorous
                academic programs, vibrant spiritual life, and graduates who serve faithfully across Mizoram,
                Northeast India, and international mission fields.
              </p>
              <p className="text-slate-600 leading-relaxed">
                As an accredited institution by the Pentecostal Association for Theological Accreditation (PATA) and a member of the Evangelical Theological College Association (NEI), ABC maintains high standards of
                theological education while remaining deeply committed to Pentecostal faith and practice.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src={siteImages.about_image_1 || defaultImages.about_image_1}
                alt="College campus"
                className="rounded-xl h-48 w-full object-cover"
              />
              <img
                src={siteImages.about_image_2 || defaultImages.about_image_2}
                alt="Students studying"
                className="rounded-xl h-48 w-full object-cover mt-8"
              />
              <img
                src={siteImages.about_image_3 || defaultImages.about_image_3}
                alt="Chapel"
                className="rounded-xl h-48 w-full object-cover -mt-4"
              />
              <img
                src={siteImages.about_image_4 || defaultImages.about_image_4}
                alt="Library"
                className="rounded-xl h-48 w-full object-cover mt-4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: 'Biblical Authority', desc: 'The Holy Scriptures are the inspired Word of God and our supreme guide for faith and practice.' },
              { icon: Target, title: 'Academic Excellence', desc: 'We pursue rigorous scholarship and theological inquiry to equip students for thoughtful ministry.' },
              { icon: Heart, title: 'Spiritual Formation', desc: 'We cultivate a life of prayer, worship, and deep personal relationship with Jesus Christ.' },
              { icon: Users, title: 'Community', desc: 'We foster a family atmosphere of mutual love, accountability, and encouragement.' },
              { icon: Eye, title: 'Mission Focus', desc: 'Every graduate is prepared and motivated to participate in the Great Commission.' },
              { icon: Award, title: 'Integrity', desc: 'We model the highest ethical standards in all areas of college life and ministry.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-gold-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-gold-600" />
                </div>
                <h3 className="font-serif font-bold text-navy-900 text-lg mb-2">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live student stats */}
      <section className="py-16 md:py-20 bg-white">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="section-title">Student Enrollment</h2>
            <p className="text-slate-500 mt-2">Live statistics from our registered student community</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <AnimatedCounter value={stats.first} label="1st Year Students" icon={Users} />
            <AnimatedCounter value={stats.second} label="2nd Year Students" icon={Users} />
            <AnimatedCounter value={stats.final} label="Final Year Students" icon={Users} />
            <AnimatedCounter value={stats.first + stats.second + stats.final} label="Total Enrolled" icon={Award} />
          </div>
        </div>
      </section>

      {/* Info blocks */}
      <section className="py-16 bg-navy-950">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: MapPin, label: 'Address', value: "Post Box - 115, Tuikual North 'D' Mual, Aizawl - 796001, Mizoram, India" },
              { icon: Calendar, label: 'Established', value: '1998 — Over 25 years of ministry training' },
              { icon: Award, label: 'Affiliation', value: 'Pentecostal Association for Theological Accreditation (PATA)' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 p-5 bg-white/5 rounded-xl">
                <div className="w-10 h-10 bg-gold-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <p className="text-gold-400 text-xs font-semibold uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
