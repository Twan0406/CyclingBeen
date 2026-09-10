import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadRiders, setFriends, type Rider } from '../lib/riders';
import { seedClimbs } from '../data/climbs';
import { allDestinations } from '../data/allDestinations';
import { categories } from '../types/destination';
import { formatDuration } from '../lib/strava';
import { usePageMeta } from '../hooks/usePageMeta';
import { Star, Trophy, LogIn, ChevronLeft, Clock, Bookmark, MapPin, Mountain } from 'lucide-react';

/** Everything a rider can have done, keyed by id, for lookups in comparisons. */
const climbById = new Map(seedClimbs.map((c) => [c.id, c]));
const placeById = new Map(allDestinations.map((d) => [d.id, d]));

function nameOf(id: string): string {
  return climbById.get(id)?.name ?? placeById.get(id)?.name ?? id;
}

function categoryOf(id: string): string {
  if (climbById.has(id)) return 'climbs';
  return placeById.get(id)?.category ?? 'climbs';
}

/** A rider's total: climbs conquered plus places ridden. */
function scoreOf(r: Rider): number {
  return r.completed.length + r.visited.length;
}

export default function Friends() {
  const { user, signIn } = useAuth();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'friends'>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [myFriends, setMyFriends] = useState<string[]>([]);

  usePageMeta({ title: 'Friends & leaderboard | Ridewild' });

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
        <div className="w-16 h-16 rounded-2xl bg-[#dfa04a]/15 flex items-center justify-center mx-auto mb-5">
          <Trophy className="w-8 h-8 text-[#dfa04a]" />
        </div>
        <h1 className="text-2xl font-semibold text-white mb-2">Friends &amp; leaderboard</h1>
        <p className="text-[#a1968a] mb-6">
          Sign in to see what other riders have conquered, and settle it head to head.
        </p>
        <button
          onClick={() => signIn()}
          className="inline-flex items-center gap-2 bg-white text-[#14120f] font-semibold px-5 py-2.5 rounded-full hover:bg-[#e8e0d4] transition"
        >
          <LogIn className="w-4 h-4" /> Sign in with Google
        </button>
      </div>
    );
  }

  if (selected && me) {
    const other = riders.find((r) => r.uid === selected);
    if (other) return <Compare me={me} other={other} onBack={() => setSelected(null)} />;
  }

  const list = (
    tab === 'friends'
      ? riders.filter((r) => myFriends.includes(r.uid) || r.uid === user.uid)
      : riders
  )
    .slice()
    .sort((a, b) => scoreOf(b) - scoreOf(a));

  return (
    <div className="max-w-[900px] mx-auto px-6 md:px-12 py-10 pb-24">
      <p className="font-mono-dc text-[11px] tracking-[0.22em] uppercase text-[#7a7066] mb-3">Compete</p>
      <h1 className="text-[clamp(30px,4.5vw,46px)] font-semibold text-[#f4efe7]">Leaderboard</h1>
      <p className="text-[16px] text-[#a1968a] mt-2 max-w-[60ch]">
        Ranked on everything ridden — climbs conquered plus places explored.
      </p>

      <div className="flex gap-2.5 mt-8 mb-6">
        {(['all', 'friends'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-[14px] px-5 py-[9px] rounded-full transition-colors border ${
              tab === t
                ? 'bg-[#dfa04a] text-[#1a1206] font-semibold border-transparent'
                : 'bg-transparent border-[#3a322a] text-[#d6cec2] font-medium hover:border-[#6b6157]'
            }`}
          >
            {t === 'all' ? 'All riders' : 'My friends'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[68px] bg-[#1c1915] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="text-[#7a7066] text-center py-12">
          {tab === 'friends'
            ? 'No friends yet — tap the star on a rider to add them.'
            : 'No riders yet.'}
        </p>
      ) : (
        <div className="space-y-2">
          {list.map((r, i) => {
            const isMe = r.uid === user.uid;
            return (
              <div
                key={r.uid}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 border transition ${
                  isMe ? 'bg-[#dfa04a]/8 border-[#dfa04a]/30' : 'bg-[#1c1915] border-[#322b24]'
                }`}
              >
                <span className="w-6 text-center font-mono-dc text-[13px] text-[#7a7066]">{i + 1}</span>
                <Avatar name={r.displayName} photo={r.photoURL} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#f4efe7] truncate">
                    {r.displayName || 'Rider'}{' '}
                    {isMe && <span className="text-[#dfa04a] text-xs">(you)</span>}
                  </p>
                  <p className="font-mono-dc text-[11px] text-[#7a7066] mt-0.5">
                    {r.completed.length} climbs · {r.visited.length} places
                    {r.wishlist.length > 0 ? ` · ${r.wishlist.length} on the list` : ''}
                  </p>
                </div>
                <span className="text-[22px] font-semibold text-[#dfa04a] font-display">
                  {scoreOf(r)}
                </span>
                {!isMe && (
                  <>
                    <button
                      onClick={() => toggleFriend(r.uid)}
                      title={myFriends.includes(r.uid) ? 'Remove friend' : 'Add friend'}
                      className="p-2 rounded-full hover:bg-white/5 transition"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          myFriends.includes(r.uid)
                            ? 'fill-[#dfa04a] text-[#dfa04a]'
                            : 'text-[#6b6157]'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => setSelected(r.uid)}
                      className="text-xs font-semibold text-[#dfa04a] hover:underline px-2"
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
  const myDone = new Set([...me.completed, ...me.visited]);
  const theirDone = new Set([...other.completed, ...other.visited]);

  const both = [...myDone].filter((id) => theirDone.has(id));
  const onlyThem = [...theirDone].filter((id) => !myDone.has(id));
  const onlyMe = [...myDone].filter((id) => !theirDone.has(id));

  // The nicest social hook: things you both still want to do.
  const sharedGoals = me.wishlist.filter((id) => other.wishlist.includes(id));

  const headToHead = seedClimbs.filter(
    (c) => me.climbTimes[c.id] && other.climbTimes[c.id],
  );

  return (
    <div className="max-w-[900px] mx-auto px-6 md:px-12 py-10 pb-24">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[#a1968a] hover:text-white mb-8 text-sm"
      >
        <ChevronLeft className="w-4 h-4" /> Back to leaderboard
      </button>

      <div className="flex items-center justify-center gap-8 mb-10">
        <RiderBadge rider={me} label="You" />
        <span className="text-[#6b6157] font-display text-lg">vs</span>
        <RiderBadge rider={other} label={other.displayName || 'Rider'} />
      </div>

      {headToHead.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#dfa04a]" /> Head-to-head climb times
          </h2>
          <div className="rounded-2xl border border-[#322b24] overflow-hidden">
            {headToHead.map((c, i) => {
              const a = me.climbTimes[c.id].seconds;
              const b = other.climbTimes[c.id].seconds;
              return (
                <div
                  key={c.id}
                  className={`grid grid-cols-3 items-center px-4 py-3 text-sm ${
                    i % 2 ? 'bg-[#201c17]' : 'bg-[#1c1915]'
                  }`}
                >
                  <span className={`font-semibold ${a <= b ? 'text-[#dfa04a]' : 'text-[#7a7066]'}`}>
                    {formatDuration(a)}
                  </span>
                  <Link
                    to={`/climb/${c.id}`}
                    className="text-center text-[#d6cec2] text-xs hover:text-[#dfa04a] transition-colors"
                  >
                    {c.name}
                  </Link>
                  <span
                    className={`text-right font-semibold ${b <= a ? 'text-[#dfa04a]' : 'text-[#7a7066]'}`}
                  >
                    {formatDuration(b)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {sharedGoals.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#c4633a]" /> You both want to do
          </h2>
          <p className="text-[13px] text-[#a1968a] mb-3">Someone should book something.</p>
          <div className="flex flex-wrap gap-2">
            {sharedGoals.map((id) => (
              <IdChip key={id} id={id} />
            ))}
          </div>
        </section>
      )}

      <div className="grid sm:grid-cols-2 gap-8">
        <IdList
          title={`${other.displayName || 'They'} did — you didn't`}
          ids={onlyThem}
          accent="#c4633a"
        />
        <IdList title="You did — they didn't" ids={onlyMe} accent="#7f8f5f" />
      </div>

      <p className="font-mono-dc text-[11px] text-[#6b6157] mt-8 uppercase tracking-[0.1em]">
        {both.length} ridden by both of you
      </p>
    </div>
  );
}

function Avatar({
  name,
  photo,
  size,
}: {
  name: string | null;
  photo: string | null;
  size: number;
}) {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        style={{ width: size, height: size }}
        className="rounded-full ring-1 ring-white/15 shrink-0"
      />
    );
  }
  return (
    <span
      style={{ width: size, height: size }}
      className="rounded-full bg-[#3a322a] flex items-center justify-center font-semibold text-white shrink-0"
    >
      {(name || '?').charAt(0).toUpperCase()}
    </span>
  );
}

function RiderBadge({ rider, label }: { rider: Rider; label: string }) {
  return (
    <div className="text-center">
      <div className="flex justify-center">
        <Avatar name={rider.displayName} photo={rider.photoURL} size={64} />
      </div>
      <p className="mt-2 font-semibold text-[#f4efe7] text-sm truncate max-w-[130px]">{label}</p>
      <p className="text-[#dfa04a] text-[32px] font-semibold font-display leading-none mt-1">
        {scoreOf(rider)}
      </p>
      <p className="font-mono-dc text-[10px] text-[#7a7066] uppercase tracking-[0.1em] mt-1">
        {rider.completed.length} climbs · {rider.visited.length} places
      </p>
    </div>
  );
}

function IdChip({ id }: { id: string }) {
  const isClimb = climbById.has(id);
  const cat = categories.find((c) => c.id === categoryOf(id));
  return (
    <Link
      to={isClimb ? `/climb/${id}` : `/place/${id}`}
      className="inline-flex items-center gap-2 bg-[#1c1915] border border-[#322b24] hover:border-[#dfa04a]/40 rounded-full px-3.5 py-1.5 text-[13px] text-[#d6cec2] transition-colors"
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat?.color ?? '#dfa04a' }} />
      {nameOf(id)}
    </Link>
  );
}

function IdList({ title, ids, accent }: { title: string; ids: string[]; accent: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-3">{title}</h3>
      {ids.length === 0 ? (
        <p className="text-xs text-[#6b6157]">Nothing here.</p>
      ) : (
        <ul className="space-y-1.5">
          {ids.slice(0, 25).map((id) => {
            const isClimb = climbById.has(id);
            return (
              <li key={id}>
                <Link
                  to={isClimb ? `/climb/${id}` : `/place/${id}`}
                  className="flex items-center gap-2 text-sm text-[#d6cec2] hover:text-[#dfa04a] transition-colors"
                >
                  {isClimb ? (
                    <Mountain className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
                  )}
                  {nameOf(id)}
                </Link>
              </li>
            );
          })}
          {ids.length > 25 && (
            <li className="font-mono-dc text-[11px] text-[#6b6157]">+{ids.length - 25} more</li>
          )}
        </ul>
      )}
    </div>
  );
}
