import { BookOpen, ArrowRight, Globe, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const objectives = [
  'To build and strengthen Christian character and commitment by emphasizing personal and community spiritual disciplines essential to the education process.',
  'To motivate and train students to advance the growth and mission of the church by providing regular and meaningful ministerial opportunities.',
  'To train Christian ministers in the knowledge of the Word of God and in methods of effective ministry.',
  'To stimulate Christian zeal to spread the message of Jesus Christ in Mizoram, India, Myanmar and other neighboring countries.',
  'To serve as an instrument to perpetuate and strengthen the work of the Assemblies of God.',
];

export default function Prologue() {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="bg-navy-950 py-8 md:py-14">
        <div className="page-container text-center">
          <BookOpen className="w-8 h-8 md:w-9 md:h-9 text-gold-400 mx-auto mb-2 md:mb-3" />
          <h1 className="text-xl md:text-3xl font-serif font-bold text-white mb-1 md:mb-2">Prologue</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-xs md:text-sm">
            The story, mission, and vision of Aizawl Bible College.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="page-container max-w-3xl">

          {/* History and Vision */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-12 bg-gold-400 rounded-full" />
              <h2 className="text-2xl font-serif font-bold text-navy-900">History and Vision</h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-base mb-5">
              <strong className="text-navy-900">AIZAWL BIBLE COLLEGE</strong> is a Pentecostal and Charismatic Christian Biblical studies located at Tuikual North 'D' Mual, Aizawl, Mizoram. The Institution was established in the year <strong className="text-navy-800">1998</strong> by the Assemblies of God Mission Kolkata in memorial of <strong className="text-navy-800">Rev. Dr. (L). Mark Buntain</strong>, who was a missionary of Assemblies of God to India. ABC was run under the supervision of Assemblies of God of East India till 2022. From 2022 the college was placed under Assemblies of God, Mizoram District.
            </p>
            <p className="text-slate-600 leading-relaxed text-base mb-5">
              The Institution began as an Extension Bible School with a Certificate of Theology course. The Diploma in Theology was added in 2000 and the Bachelor of Theology in 2009. The Institution now offers the Bachelor of Theology programme. From an initial group of a few students and 3 faculty members, the Institution has grown to a student body of <strong className="text-navy-800">190 students</strong> with <strong className="text-navy-800">6 faculty members</strong>. The BMBC Programme is designed for personal and spiritual development as well as professional ministry preparation, enabling students to develop spiritual and character formation to combat the darkness of the world.
            </p>

            <div className="bg-gold-50 border-l-4 border-gold-400 p-5 rounded-r-xl my-8">
              <p className="text-navy-800 font-serif text-base md:text-lg italic font-medium leading-relaxed">
                "Our vision describes what we want to be and what we want to achieve together for the Kingdom of God. It inspires and enables us to guide our decisions."
              </p>
            </div>

            <p className="text-slate-600 leading-relaxed text-base">
              The Institution is a thriving, Christ-centered educational institution, promoting God's kingdom vision of transformation for the Church and world as reflected in Scripture, and developing Christ followers who truly sense the call of God — spiritually, academically and ethically inspired — and able to positively impact their careers, churches, communities and society.
            </p>
          </div>

          {/* Objectives */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-12 bg-gold-400 rounded-full" />
              <h2 className="text-2xl font-serif font-bold text-navy-900">Objectives</h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-base mb-5">
              To fulfill its mission, ABC has formulated the following objectives:
            </p>
            <div className="space-y-3">
              {objectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-navy-50 transition-colors">
                  <div className="w-7 h-7 bg-gold-400 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{obj}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 bg-navy-50 border border-navy-100 rounded-xl">
              <p className="text-navy-800 text-sm leading-relaxed italic">
                The ultimate goal for the College is to be positive Agents for change in both church and society, and to enable students to develop the spiritual and character formation to combat the darkness of the world.
              </p>
            </div>
          </div>

          {/* Mission, Organization, Accreditation */}
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-5 mb-10">

            {/* Our Mission */}
            <div className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-navy-900 text-lg mb-2">Our Mission</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    To extend the Kingdom of God through the ministries of Assemblies of God by training youngsters and to bring the gospel throughout <strong className="text-navy-800">Mizoram, North East India, and South Asia</strong> by any means.
                  </p>
                </div>
              </div>
            </div>

            {/* Organization */}
            <div className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-navy-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-navy-700" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-navy-900 text-lg mb-2">Organization</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    The Institution is governed by a Managing Board selected from Mizoram District Assemblies of God. The Chairman of Managing Board and Principal are responsible for overall administration. Students' affairs are administered by the Principal, Dean of Academic and Dean of Students.
                  </p>
                </div>
              </div>
            </div>

            {/* Accreditation */}
            <div className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-navy-900 text-lg mb-2">Accreditation</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Aizawl Bible College is an accredited Institution by the <strong className="text-navy-800"> Pentecostal Association for Theological Accreditation (PATA), Assemblies of God Association for Theological Education of South Asia (AGATESA) and a Member of Evangelical Theological Colleges Association(NEI)</strong>.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/doctrine" className="btn-primary">
              Our Doctrine <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/about" className="btn-secondary">About the College</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
