import { BookOpen, Star, Zap, AlertTriangle, Heart, Droplets, Flame, Mic, Shield, Globe, Users, Plus, ArrowUp, Award, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const beliefs = [
  {
    icon: BookOpen,
    title: 'The Inspired Scriptures',
    text: 'We believe the Scriptures are inspired by God.',
  },
  {
    icon: Star,
    title: 'One True God',
    text: 'We believe there is One True God revealed in three persons.',
  },
  {
    icon: Zap,
    title: 'The Deity of Christ',
    text: 'We believe in the deity of the Lord Jesus Christ.',
  },
  {
    icon: AlertTriangle,
    title: 'The Fall of Man',
    text: 'We believe man willingly fell into sin — ushering in evil and death, both physical and spiritual, into the world.',
  },
  {
    icon: Heart,
    title: 'Salvation',
    text: 'We believe every person can be restored to fellowship with God through accepting Christ\'s offer of forgiveness and salvation.',
  },
  {
    icon: Droplets,
    title: 'Baptism & Communion',
    text: 'We believe in Water Baptism by immersion after salvation and Holy Communion as a symbolic remembrance of Christ\'s suffering and death for our salvation.',
  },
  {
    icon: Flame,
    title: 'Baptism in the Holy Spirit',
    text: 'We believe the Baptism in the Holy Spirit is a special experience following salvation that empowers believers for witnessing and effective service.',
  },
  {
    icon: Mic,
    title: 'Evidence of the Spirit',
    text: 'We believe the initial evidence of the Baptism in the Holy Spirit is speaking in tongues as experienced on the Day of Pentecost.',
  },
  {
    icon: Shield,
    title: 'Sanctification',
    text: 'We believe sanctification initially occurs at Salvation but is also a progressive lifelong process.',
  },
  {
    icon: Globe,
    title: 'Mission of the Church',
    text: 'We believe the church has a mission to seek and save all who are lost in sin.',
  },
  {
    icon: Users,
    title: 'Ordained Leadership',
    text: 'We believe a divinely called and biblically ordained leadership ministry serves the church.',
  },
  {
    icon: Plus,
    title: 'Divine Healing',
    text: 'We believe divine healing of the sick is a privilege for Christians today and is provided for in Christ\'s atonement.',
  },
  {
    icon: ArrowUp,
    title: 'The Blessed Hope',
    text: 'We believe in the Blessed Hope — when Jesus raptures his church prior to his return to Earth.',
  },
  {
    icon: Award,
    title: 'The Millennial Reign',
    text: 'We believe in the millennial reign of Christ when Jesus returns with his saints at his second coming and begins his rule over earth for 1,000 years.',
  },
  {
    icon: AlertCircle,
    title: 'Final Judgment',
    text: 'We believe in a final judgment for those who have rejected Christ.',
  },
  {
    icon: Sparkles,
    title: 'New Heavens & New Earth',
    text: 'We believe in a new heavens and a new earth that Christ is preparing for all people who have accepted Him.',
  },
];

export default function Doctrine() {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="bg-navy-950 py-8 md:py-14">
        <div className="page-container text-center">
          <BookOpen className="w-8 h-8 md:w-9 md:h-9 text-gold-400 mx-auto mb-2 md:mb-3" />
          <h1 className="text-xl md:text-3xl font-serif font-bold text-white mb-1 md:mb-2">Statement of Faith</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-xs md:text-sm">
            The foundational doctrines of Aizawl Bible College, rooted in Scripture and the Assemblies of God tradition.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 bg-white">
        <div className="page-container max-w-3xl text-center">
          <div className="bg-gold-50 border border-gold-200 rounded-2xl p-6 md:p-8 mb-10">
            <p className="text-slate-700 leading-relaxed text-base md:text-lg">
              Aizawl Bible College holds firmly to the fundamental truths of the Christian faith as affirmed by the
              Assemblies of God. We believe in the full inspiration of the Scriptures, salvation through Jesus Christ,
              the baptism in the Holy Spirit with the evidence of speaking in tongues, divine healing, and the soon
              return of our Lord Jesus Christ.
            </p>
          </div>
        </div>
      </section>

      {/* Beliefs */}
      <section className="py-4 pb-16 bg-slate-50">
        <div className="page-container max-w-4xl">
          <div className="space-y-4">
            {beliefs.map((belief, i) => (
              <div key={belief.title} className="card p-5 md:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-navy-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <belief.icon className="w-5 h-5 text-navy-700" />
                  </div>
                  <div className="flex-1 flex items-start gap-3">
                    <span className="w-6 h-6 bg-gold-400 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-serif font-bold text-navy-900 text-base mb-1">{belief.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{belief.text}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/academics" className="btn-primary">
              Academic Programs <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/apply" className="btn-gold">Apply Now</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
