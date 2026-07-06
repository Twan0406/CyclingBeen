import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loadRiders, setFriends, type Rider } from '../lib/riders';
import { seedClimbs } from '../data/climbs';
import { formatDuration } from '../lib/strava';
import { Mountain, Star, Trophy, LogIn, ChevronLeft, Clock } from 'lucide-react';

export default function Friends() {
  const { user, signIn } = useAuth();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'friends'>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [myFriends, setMyFriends] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    loadRiders()
      .then((rs) => {
        setRiders(rs);
        setMyFriends(rs.find((r) => r.uid === user.uid)?.friends ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const me = useMemo(() => riders.find((r) => r.uid === user?.uid) ?? null, [riders, user]);

  const toggleFriend = (uid: string) => {
    if (!user) return;
    const next = myFriends.includes(uid)
      ? myFriends.filter((f) => f !== uid)
      : [...myFriends, uid];
    setMyFriends(next);
    setFriends(user.uid, next).catch(() => {});
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/15 flex items-center justify-center mx-auto mb-5">
          <Trophy className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Friends &amp; leaderboard</h1>
        <p className="text-slate-400 mb-6">Sign in to compare your climbs and times with other riders.</p>
        <button
          onClick={() => signIn()}
          className="inline-flex items-center gap-2 bg-white text-[#0a0f1c] font-semibold px-5 py-2.5 rounded-full hover:bg-slate-200 transition"
        >
          <LogIn className="w-4 h-4" /> Sign in with Google
        </button>
      </div>
    );
  }

  // Comparison view
  if (selected && me) {
    const other = riders.find((r) => r.uid === selected);
    if (other) return <Compare me={me} other={other} onBack={() => setSelected(null)} />;
  }

  const list = (tab === 'friends' ? riders.filter((r) => myFriends.includes(r.uid) || r.uid === user.uid) : riders)
    .slice()
    .sort((a, b) => b.completed.length - a.completed.length);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80 mb-2">Compete</p>
      <h1 className="text-4xl font-bold text-white tracking-tight mb-6">Leaderboard</h1>

      <div className="flex gap-2 mb-6">
        {(['all', 'friends'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              tab === t ? 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {t === 'all' ? 'All riders' : 'My friends'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="text-slate-500 text-center py-12">
          {tab === 'friends' ? 'No friends yet — tap the star on a rider to add them.' : 'No riders yet.'}
        </p>
      ) : (
        <div className="space-y-2">
          {list.map((r, i) => {
            const isMe = r.uid === user.uid;
            return (
              <div
                key={r.uid}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 transition ${
                  isMe ? 'bg-amber-400/10 ring-amber-400/30' : 'bg-[#111827] ring-white/8'
                }`}
              >
                <span className="w-6 text-center font-bold text-slate-500">{i + 1}</span>
                {r.photoURL ? (
                  <img src={r.photoURL} alt="" className="w-9 h-9 rounded-full ring-1 ring-white/15" />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
                    {(r.displayName || '?').charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white truncate">
                    {r.displayName || 'Rider'} {isMe && <span className="text-amber-300 text-xs">(you)</span>}
                  </p>
                  <p className="text-xs text-slate-500">{r.completed.length} conquered</p>
                </div>
                {!isMe && (
                  <>
                    <button
                      onClick={() => toggleFriend(r.uid)}
                      title={myFriends.includes(r.uid) ? 'Remove friend' : 'Add friend'}
                      className="p-2 rounded-full hover:bg-white/5 transition"
                    >
                      <Star
                        className={`w-4 h-4 ${myFriends.includes(r.uid) ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`}
                      />
                    </button>
                    <button
                      onClick={() => setSelected(r.uid)}
                      className="text-xs font-semibold text-amber-300 hover:underline px-2"
                    >
                      Compare
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Compare({ me, other, onBack }: { me: Rider; other: Rider; onBack: () => void }) {
  const mine = new Set(me.completed);
  const theirs = new Set(other.completed);
  const shared = seedClimbs.filter((c) => mine.has(c.id) && theirs.has(c.id));
  const theyHave = seedClimbs.filter((c) => theirs.has(c.id) && !mine.has(c.id));
  const youHave = seedClimbs.filter((c) => mine.has(c.id) && !theirs.has(c.id));

  const headToHead = shared.filter((c) => me.climbTimes[c.id] && other.climbTimes[c.id]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-white mb-6 text-sm">
        <ChevronLeft className="w-4 h-4" /> Back to leaderboard
      </button>

      <div className="flex items-center justify-center gap-6 mb-8">
        <RiderBadge name={me.displayName} photo={me.photoURL} count={me.completed.length} label="You" />
        <span className="text-slate-600 font-bold">vs</span>
        <RiderBadge name={other.displayName} photo={other.photoURL} count={other.completed.length} label={other.displayName || 'Rider'} />
      </div>

      {headToHead.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Head-to-head times
          </h2>
          <div className="rounded-2xl ring-1 ring-white/8 overflow-hidden">
            {headToHead.map((c, i) => {
              const a = me.climbTimes[c.id].seconds;
              const b = other.climbTimes[c.id].seconds;
              return (
                <div key={c.id} className={`grid grid-cols-3 items-center px-4 py-3 text-sm ${i % 2 ? 'bg-[#0d1424]' : 'bg-[#111827]'}`}>
                  <span className={`font-semibold ${a <= b ? 'text-amber-300' : 'text-slate-400'}`}>{formatDuration(a)}</span>
                  <span className="text-center text-slate-300 text-xs">{c.name}</span>
                  <span className={`text-right font-semibold ${b <= a ? 'text-amber-300' : 'text-slate-400'}`}>{formatDuration(b)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        <ClimbList title={`${other.displayName || 'They'} did — you didn't`} climbs={theyHave} accent="rose" />
        <ClimbList title="You did — they didn't" climbs={youHave} accent="emerald" />
      </div>

      <p className="text-xs text-slate-600 mt-6">{shared.length} climbs conquered by both of you.</p>
    </div>
  );
}

function RiderBadge({ name, photo, count, label }: { name: string | null; photo: string | null; count: number; label: string }) {
  return (
    <div className="text-center">
      {photo ? (
        <img src={photo} alt="" className="w-16 h-16 rounded-full ring-2 ring-white/15 mx-auto" />
      ) : (
        <span className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold text-white mx-auto">
          {(name || '?').charAt(0).toUpperCase()}
        </span>
      )}
      <p className="mt-2 font-semibold text-white text-sm truncate max-w-[120px]">{label}</p>
      <p className="text-amber-300 text-2xl font-bold">{count}</p>
      <p className="text-xs text-slate-500">conquered</p>
    </div>
  );
}

function ClimbList({ title, climbs, accent }: { title: string; climbs: typeof seedClimbs; accent: 'rose' | 'emerald' }) {
  const color = accent === 'rose' ? 'text-rose-300' : 'text-emerald-300';
  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
      {climbs.length === 0 ? (
        <p className="text-xs text-slate-600">Nothing here.</p>
      ) : (
        <ul className="space-y-1">
          {climbs.map((c) => (
            <li key={c.id} className="flex items-center gap-2 text-sm text-slate-300">
              <Mountain className={`w-3.5 h-3.5 ${color}`} />
              {c.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
