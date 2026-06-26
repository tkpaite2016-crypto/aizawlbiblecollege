import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User, RealtimeChannel } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  profileError: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  profileLoading: false,
  profileError: null,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const profileChannelRef = useRef<RealtimeChannel | null>(null);

  async function fetchProfile(userId: string) {
    setProfileLoading(true);
    setProfileError(null);

    // Check that the client has an active session before querying
    const { data: { session: currentSession } } = await supabase.auth.getSession();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      const msg = `DB error: ${error.message} (code: ${error.code}) — session uid: ${currentSession?.user?.id ?? 'none'}`;
      console.error('[fetchProfile]', msg);
      setProfileError(msg);
    } else if (!data) {
      // Row not found — try by email as a fallback
      const email = currentSession?.user?.email;
      if (email) {
        const { data: byEmail, error: emailErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        if (byEmail && !emailErr) {
          setProfile(byEmail);
          setProfileLoading(false);
          return;
        }
      }
      setProfileError(`No profile row found for user ID: ${userId}`);
      console.warn('[fetchProfile] No profile found for', userId);
    } else {
      setProfile(data);
    }

    setProfileLoading(false);
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id);
  }

  // Set up realtime subscription for profile changes
  useEffect(() => {
    if (user?.id && !profileChannelRef.current) {
      profileChannelRef.current = supabase
        .channel(`profile-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            setProfile(payload.new as Profile);
          }
        )
        .subscribe();
    }

    return () => {
      if (profileChannelRef.current) {
        supabase.removeChannel(profileChannelRef.current);
        profileChannelRef.current = null;
      }
    };
  }, [user?.id]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
        setLoading(false);
      })();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setProfileError(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, profileLoading, profileError, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
