import { Link } from 'react-router-dom';
import { BookOpen, MapPin, Mail, Facebook, Youtube, Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white">
      <div className="page-container py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-serif font-bold text-base">Aizawl Bible College</p>
                <p className="text-gold-400 text-xs">Est. 1998</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              A theological Institution of Assemblies of God Mizoram District. Equipping servants of God for ministry.
            </p>
            <p className="text-slate-500 text-xs">
              Accredited by Pentecostal Association for Theological Accreditation (PATA) and Member of Evangelical Theological College Association (NEI) 
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gold-400 mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', path: '/about' },
                { label: 'Our Faculty', path: '/teachers' },
                { label: 'Notice Board', path: '/notices' },
                { label: 'Photo Gallery', path: '/gallery' },
                { label: 'Downloads', path: '/downloads' },
                { label: 'Apply Now', path: '/apply' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-slate-400 hover:text-gold-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Academics */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gold-400 mb-4">Academics</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Prologue', path: '/prologue' },
                { label: 'Our Doctrine', path: '/doctrine' },
                { label: 'Academic Info', path: '/academics' },
                { label: 'Forum', path: '/forum' },
                { label: 'Contact Us', path: '/contact' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-slate-400 hover:text-gold-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gold-400 mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400 text-sm">
                  Post Box - 115, Tuikual North 'D' Mual,<br />Aizawl - 796001, Mizoram, India
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-500 flex-shrink-0" />
                <a href="mailto:aizawlbiblecollege24@gmail.com" className="text-slate-400 hover:text-gold-400 text-sm transition-colors">
                  aizawlbiblecollege24@gmail.com
                </a>
              </li>
            </ul>

            {/* Socials */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://www.facebook.com/people/Aizawl-Bible-College/100072019050045/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@AizawlBibleCollege"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-600 flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/@AizawlBibleCollege"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-pink-600 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-green-600 flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="page-container py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Aizawl Bible College. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/terms" className="text-slate-500 hover:text-gold-400 transition-colors">Terms</Link>
            <Link to="/privacy" className="text-slate-500 hover:text-gold-400 transition-colors">Privacy</Link>
            <Link to="/refunds" className="text-slate-500 hover:text-gold-400 transition-colors">Refunds</Link>
            <Link to="/shipping" className="text-slate-500 hover:text-gold-400 transition-colors">Shipping</Link>
          </div>
          <p className="text-slate-600 text-xs">
            Assemblies of God Mizoram District
          </p>
        </div>
      </div>
    </footer>
  );
}
