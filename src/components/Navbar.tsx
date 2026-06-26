import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, CreditCard, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  {
    label: 'College',
    children: [
      { label: 'Prologue', path: '/prologue' },
      { label: 'Doctrine', path: '/doctrine' },
      { label: 'Academic Info', path: '/academics' },
      { label: 'Our Faculty', path: '/teachers' },
      { label: 'Board of Management', path: '/board' },
    ],
  },
  { label: 'Notices', path: '/notices' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Downloads', path: '/downloads' },
  { label: 'Forum', path: '/forum' },
  { label: 'Apply', path: '/apply' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setOpen(false);
    setDropdown('');
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Load unread contact messages count for admin
  useEffect(() => {
    if (profile?.role === 'admin') {
      loadUnreadCount();
    }
  }, [profile?.role]);

  async function loadUnreadCount() {
    const { count } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);
    setUnreadMessages(count ?? 0);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setDropdown('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleDropdown(label: string) {
    setDropdown((prev) => (prev === label ? '' : label));
  }

  return (
    <header
      ref={navRef}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-navy-950 shadow-lg' : 'bg-navy-950'
      }`}
    >
      {/* Top bar */}
      <div className="bg-gold-500 py-1 px-4 text-center overflow-hidden">
        <p className="text-navy-950 text-xs font-medium truncate">
          Accredited by Pentecostal Association for Theological Accreditation (PATA) | Member of Evangelical Theological Colleges Association – NEI | Estd. 1998
        </p>
      </div>

      <nav className="w-full max-w-screen-xl mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between h-16 gap-2 min-w-0">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/logo.png"
              alt="Aizawl Bible College"
              className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-gold-400"
            />
            <div className="hidden lg:block">
              <p className="text-white font-serif font-bold text-sm leading-tight">Aizawl Bible College</p>
              <p className="text-gold-300 text-xs leading-tight">Assemblies of God, Mizoram</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center flex-1 min-w-0 gap-0.5 px-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative flex-shrink-0"
                  onMouseEnter={() => setDropdown(link.label)}
                  onMouseLeave={() => setDropdown('')}
                >
                  <button
                    onClick={() => setDropdown(link.label)}
                    className="flex items-center gap-0.5 px-1.5 py-1.5 lg:px-2.5 text-slate-200 hover:text-white text-xs lg:text-sm font-medium rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap"
                  >
                    {link.label}
                    <ChevronDown className={`w-3 h-3 transition-transform ${dropdown === link.label ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdown === link.label && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-[60]">
                      {link.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) =>
                            `block px-4 py-2.5 text-sm transition-colors ${
                              isActive ? 'text-navy-800 bg-navy-50 font-medium' : 'text-slate-700 hover:bg-slate-50 hover:text-navy-800'
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={link.path}
                  to={link.path!}
                  className={({ isActive }) =>
                    `flex-shrink-0 px-1.5 py-1.5 lg:px-2.5 text-xs lg:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-gold-400 bg-white/10'
                        : 'text-slate-200 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}
          </div>

          {/* Auth buttons / user menu */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            {user ? (
              <>
                {/* Admin notification bell - smaller and responsive */}
                {profile?.role === 'admin' && (
                  <Link
                    to="/admin?tab=messages"
                    className="relative p-1.5 text-white hover:bg-white/10 rounded-lg transition-colors"
                    title={`${unreadMessages} unread message${unreadMessages !== 1 ? 's' : ''}`}
                  >
                    <Bell className="w-4 h-4" />
                    {unreadMessages > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('user')}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                  <div className="w-7 h-7 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <span className="text-white text-xs font-bold">
                        {(profile?.full_name ?? profile?.email ?? 'U')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-white text-xs font-medium max-w-[80px] truncate hidden lg:block">
                    {profile?.full_name ?? 'Account'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-white" />
                </button>
                {dropdown === 'user' && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-navy-900">{profile?.full_name}</p>
                      <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    {profile?.role === 'admin' && (
                      <>
                        <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                        </Link>
                        <Link to="/admin?tab=messages" className="flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                          <span className="flex items-center gap-2">
                            <Bell className="w-4 h-4" /> Messages
                          </span>
                          {unreadMessages > 0 && (
                            <span className="min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full px-1.5">
                              {unreadMessages}
                            </span>
                          )}
                        </Link>
                      </>
                    )}
                    {profile?.role === 'finance' && (
                      <Link to="/transactions" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                        <CreditCard className="w-4 h-4" /> Transactions
                      </Link>
                    )}
                    {profile?.role === 'student' && (
                      <Link to="/transactions" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                        <CreditCard className="w-4 h-4" /> My Payments
                      </Link>
                    )}
                    <button
                      onClick={signOut}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
            ) : (
              <>
                <Link to="/login" className="px-2.5 py-1.5 text-xs lg:text-sm text-white font-medium hover:text-gold-400 transition-colors whitespace-nowrap">
                  Sign In
                </Link>
                <Link to="/register" className="px-2.5 py-1.5 bg-gold-500 hover:bg-gold-600 text-white text-xs lg:text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg flex-shrink-0"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 border-t border-white/10 mt-1 pt-3">
            <div className="flex flex-col gap-0.5">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label}>
                    <button
                      onClick={() => toggleDropdown(link.label)}
                      className="flex items-center justify-between w-full px-4 py-2.5 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium"
                    >
                      {link.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${dropdown === link.label ? 'rotate-180' : ''}`} />
                    </button>
                    {dropdown === link.label && (
                      <div className="ml-4 mt-0.5 flex flex-col gap-0.5">
                        {link.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            className={({ isActive }) =>
                              `px-4 py-2 text-sm rounded-lg transition-colors ${
                                isActive ? 'text-gold-400 bg-white/10 font-medium' : 'text-slate-300 hover:text-white hover:bg-white/10'
                              }`
                            }
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    key={link.path}
                    to={link.path!}
                    className={({ isActive }) =>
                      `px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        isActive ? 'text-gold-400 bg-white/10' : 'text-slate-200 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                )
              )}
              <div className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1.5">
                {user ? (
                  <>
                    <div className="px-4 py-2">
                      <p className="text-white font-medium text-sm">{profile?.full_name}</p>
                      <p className="text-slate-400 text-xs capitalize">{profile?.role}</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10 rounded-lg">
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    {profile?.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10 rounded-lg">
                        <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    {profile?.role === 'finance' && (
                      <Link to="/transactions" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10 rounded-lg">
                        <CreditCard className="w-4 h-4" /> Transactions
                      </Link>
                    )}
                    {profile?.role === 'student' && (
                      <Link to="/transactions" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10 rounded-lg">
                        <CreditCard className="w-4 h-4" /> My Payments
                      </Link>
                    )}
                    <button
                      onClick={signOut}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10 rounded-lg font-medium">
                      Sign In
                    </Link>
                    <Link to="/register" className="mx-4 py-2.5 text-sm bg-gold-500 hover:bg-gold-600 text-white text-center rounded-lg font-medium transition-colors">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
