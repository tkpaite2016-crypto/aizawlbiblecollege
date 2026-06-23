import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'abc_greeting_seen';

export default function PrincipalGreetingModal() {
  const [visible, setVisible] = useState(false);
  const [principalName, setPrincipalName] = useState('Rev. Dr. C.S. Muanga');
  const [principalTitle, setPrincipalTitle] = useState('Principal, Aizawl Bible College');
  const [greetingImage, setGreetingImage] = useState('/images/PrincipalsGreets.jpg');

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen) return;

    supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['principal_greeting_enabled', 'principal_greeting_name', 'principal_greeting_title', 'principal_greeting_image'])
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        data.forEach((s) => { map[s.setting_key] = s.setting_value; });

        if (map['principal_greeting_enabled'] === 'true') {
          if (map['principal_greeting_name']) setPrincipalName(map['principal_greeting_name']);
          if (map['principal_greeting_title']) setPrincipalTitle(map['principal_greeting_title']);
          if (map['principal_greeting_image']) setGreetingImage(map['principal_greeting_image']);
          setTimeout(() => setVisible(true), 800);
        }
      });
  }, []);

  function close() {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-serif font-bold text-navy-900">Principal Writes...</h2>
            <p className="text-xs text-slate-400">A message to first-time visitors</p>
          </div>
          <button
            onClick={close}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Principal's Greeting Image */}
        <div className="px-6 pt-5 pb-2">
          <img
            src={greetingImage}
            alt="Principal's Greetings"
            className="w-full rounded-xl border border-slate-200 shadow-sm"
          />
        </div>

        {/* Principal info footer */}
        <div className="px-6 py-5 bg-slate-50 rounded-b-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0 border-2 border-gold-300">
            <span className="text-navy-700 font-bold text-lg">{principalName[0]}</span>
          </div>
          <div>
            <p className="font-semibold text-navy-900 text-sm">{principalName}</p>
            <p className="text-slate-500 text-xs">{principalTitle}</p>
          </div>
          <button
            onClick={close}
            className="ml-auto px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Continue to Site
          </button>
        </div>
      </div>
    </div>
  );
}
