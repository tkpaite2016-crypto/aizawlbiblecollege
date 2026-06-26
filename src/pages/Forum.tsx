import { useEffect, useState } from 'react';
import { MessageSquare, Send, Plus, X, Star, Pin, Lock, ChevronDown, ChevronUp, Ban } from 'lucide-react';
import { supabase, ForumPost, ForumReply, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function RoleBadge({ profile }: { profile: Profile | undefined }) {
  if (!profile) return null;
  if (profile.role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
        <Star className="w-2.5 h-2.5" /> Admin
      </span>
    );
  }
  if (profile.role === 'faculty') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-navy-100 text-navy-700 text-xs font-semibold rounded-full">
        <Star className="w-2.5 h-2.5" /> Professional Teacher
      </span>
    );
  }
  if (profile.role === 'student' && profile.student_year) {
    const yearLabel: Record<string, string> = {
      '1st_year': '1st Year Student',
      '2nd_year': '2nd Year Student',
      'final_year': 'Final Year Student',
    };
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-100 text-gold-700 text-xs font-semibold rounded-full">
        <Star className="w-2.5 h-2.5" /> {yearLabel[profile.student_year] ?? 'Student'}
      </span>
    );
  }
  return null;
}

function Avatar({ profile }: { profile: Profile | undefined }) {
  const initials = (profile?.full_name ?? profile?.email ?? 'U')[0].toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-navy-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="text-navy-700 text-sm font-bold">{initials}</span>
      )}
    </div>
  );
}

type PostWithProfile = ForumPost & { author: Profile | undefined };
type ReplyWithProfile = ForumReply & { author: Profile | undefined };

function PostCard({ post, profileMap, currentProfile }: {
  post: PostWithProfile;
  profileMap: Record<string, Profile>;
  currentProfile: Profile | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState<ReplyWithProfile[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);

  async function loadReplies() {
    if (replies.length > 0) return;
    setLoadingReplies(true);
    const { data } = await supabase
      .from('forum_replies')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });
    setReplies((data ?? []).map((r) => ({ ...r, author: profileMap[r.author_id] })));
    setLoadingReplies(false);
  }

  async function toggleExpand() {
    if (!expanded) await loadReplies();
    setExpanded(!expanded);
  }

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !currentProfile || currentProfile.is_banned) return;
    setSending(true);
    const { data, error } = await supabase.from('forum_replies').insert({
      post_id: post.id,
      content: replyText.trim(),
    }).select().single();
    if (!error && data) {
      setReplies((r) => [...r, { ...data, author: currentProfile }]);
      setReplyText('');
    }
    setSending(false);
  }

  return (
    <div className="card overflow-visible">
      <div className="p-5">
        {/* Post header */}
        <div className="flex items-start gap-3">
          <Avatar profile={post.author} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
              <span className="font-semibold text-navy-900 text-sm">{post.author?.full_name ?? 'Unknown'}</span>
              <RoleBadge profile={post.author} />
              {post.is_pinned && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                  <Pin className="w-2.5 h-2.5" /> Pinned
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          {post.is_locked && <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        </div>

        <h3 className="font-serif font-bold text-navy-900 text-base mt-3 mb-1">{post.title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed">{post.content}</p>

        <button
          onClick={toggleExpand}
          className="mt-3 flex items-center gap-1.5 text-xs text-navy-600 hover:text-navy-800 font-medium transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {post.reply_count} {post.reply_count === 1 ? 'Reply' : 'Replies'}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
          {loadingReplies ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-navy-200 border-t-navy-800 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-2.5">
                  <Avatar profile={reply.author} />
                  <div className="flex-1 bg-white rounded-xl p-3 shadow-sm">
                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                      <span className="font-semibold text-navy-900 text-xs">{reply.author?.full_name ?? 'Unknown'}</span>
                      <RoleBadge profile={reply.author} />
                    </div>
                    <p className="text-slate-600 text-sm">{reply.content}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(reply.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}

              {!post.is_locked && currentProfile && !currentProfile.is_banned && (
                <form onSubmit={submitReply} className="flex items-start gap-2.5 mt-3 pt-3 border-t border-slate-200">
                  <Avatar profile={currentProfile} />
                  <div className="flex-1 flex gap-2">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="input-field flex-1 text-sm py-2"
                      placeholder="Write a reply..."
                      required
                    />
                    <button type="submit" disabled={sending} className="btn-primary px-3 py-2 flex-shrink-0">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
              {!post.is_locked && currentProfile?.is_banned && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                    <Ban className="w-4 h-4" />
                    <span>Your account is banned. You cannot reply to posts.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Forum() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    const { data: postsData } = await supabase
      .from('forum_posts')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (!postsData) { setLoading(false); return; }

    const authorIds = [...new Set(postsData.map((p) => p.author_id))];
    const { data: profilesData } = await supabase.from('profiles').select('*').in('id', authorIds);
    const map: Record<string, Profile> = {};
    (profilesData ?? []).forEach((p) => (map[p.id] = p));
    setProfileMap(map);
    setPosts(postsData.map((p) => ({ ...p, author: map[p.author_id] })));
    setLoading(false);
  }

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !profile || profile.is_banned) return;
    setCreating(true);
    const { data, error } = await supabase.from('forum_posts').insert({
      title: newTitle.trim(),
      content: newContent.trim(),
    }).select().single();
    if (!error && data) {
      setPosts((prev) => [{ ...data, author: profile }, ...prev]);
      setNewTitle('');
      setNewContent('');
      setShowNew(false);
    }
    setCreating(false);
  }

  const isBanned = profile?.is_banned ?? false;

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="bg-navy-950 py-8 md:py-14">
        <div className="page-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <MessageSquare className="w-8 h-8 md:w-9 md:h-9 text-gold-400 mx-auto sm:mx-0 mb-2 md:mb-3" />
            <h1 className="text-xl md:text-3xl font-serif font-bold text-white mb-1">Discussion Forum</h1>
            <p className="text-slate-400 text-xs md:text-sm">Connect, ask questions, and grow together.</p>
          </div>
          {profile && !isBanned && (
            <button onClick={() => setShowNew(true)} className="btn-gold flex-shrink-0 text-xs md:text-sm">
              <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> New Post
            </button>
          )}
          {profile && isBanned && (
            <div className="px-4 py-2 bg-red-900/50 border border-red-600 rounded-lg text-white text-xs md:text-sm flex items-center gap-2">
              <Ban className="w-4 h-4" />
              <span>Your account is banned from posting</span>
            </div>
          )}
        </div>
      </section>

      {/* Posts */}
      <section className="py-12 bg-slate-50">
        <div className="page-container max-w-3xl">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-navy-200 border-t-navy-800 rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No posts yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} profileMap={profileMap} currentProfile={profile} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New post modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-serif font-bold text-navy-900">New Discussion Post</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createPost} className="space-y-4">
              <div>
                <label className="label">Title *</label>
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="input-field" placeholder="What's on your mind?" required />
              </div>
              <div>
                <label className="label">Content *</label>
                <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={5} className="input-field resize-none" placeholder="Share your thoughts, questions, or insights..." required />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowNew(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary">
                  {creating ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
