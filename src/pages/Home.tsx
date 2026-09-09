import { Link } from 'react-router-dom';
import { ArrowRight, Mountain, Trophy, Route } from 'lucide-react';
import { useClimbs } from '../context/ClimbsContext';
import { useAuth } from '../context/AuthContext';
import { destinations } from '../data/destinations';
import { categories } from '../types/destination';
import ClimbPhoto from '../components/ClimbPhoto';
import DestinationCard from '../components/DestinationCard';
import { usePageMeta } from '../hooks/usePageMeta';

export default function Home() {
  const { climbs } = useClimbs();
  const { user } = useAuth();

  const hero = climbs.find((c) => c.id === 'mont-ventoux') ?? climbs[0];
  const featured = [
    destinations.find((d) => d.id === 'crete-senesi'),
    destinations.find((d) => d.id === 'zuid-limburg'),
    destinations.find((d) => d.id === 'finale-ligure'),
  ].filter(Boolean) as typeof destinations;

  const total = climbs.length + destinations.length;
  const conquered = climbs.filter((c) => c.completed).length;

  usePageMeta({
    title: 'Cycling adventures — mountains, gravel, hills and trails',
    description: `Find your next ride: ${climbs.length} legendary climbs and hand-picked gravel, hill, coastal and mountain bike destinations, with practical guides for each. Track what you've ridden and compare with friends.`,
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[68vh] min-h-[440px] max-h-[640px]">
        {hero && (
          <ClimbPhoto subject={hero} size={1600} className="absolute inset-0 w-full h-full" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,18,15,0.55)_0%,rgba(20,18,15,0.35)_40%,rgba(20,18,15,0.97)_100%)]" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-[1240px] mx-auto w-full px-6 md:px-12 pb-14">
            <p className="font-mono-dc text-[11px] tracking-[0.22em] uppercase text-[#dfa04a] mb-4">
              Your next ride starts here
            </p>
            <h1 className="text-[clamp(38px,6vw,68px)] leading-[1.02] font-semibold text-[#f8f4ec] max-w-[16ch]">
              Every road is an adventure
            </h1>
            <p className="mt-5 text-[17px] md:text-[19px] text-[#d6cec2] max-w-[54ch] leading-relaxed">
              Legendary mountain passes, white gravel roads, sea dikes with endless
              horizons and singletrack that ends at the beach. Find where to ride —
              then keep a record of everything you've conquered.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/rides"
                className="inline-flex items-center gap-2 bg-[#c4633a] hover:bg-[#d4703f] text-[#fdf6ec] font-semibold px-6 py-3 rounded-full transition-colors"
              >
                Explore destinations <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={user ? '/my-climbs' : '/rides/climbs'}
                className="inline-flex items-center gap-2 border border-[#4a4038] hover:border-[#6b6157] text-[#f4efe7] font-medium px-6 py-3 rounded-full transition-colors"
              >
                {user ? 'My achievements' : 'See the legendary climbs'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1240px] mx-auto px-6 md:px-12 pb-24">
        {/* Categories */}
        <section className="-mt-2">
          <SectionHead
            eyebrow="What kind of riding?"
            title="Pick your terrain"
            sub={`${total} destinations across five kinds of riding, each with a practical guide.`}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const count =
                cat.id === 'climbs'
                  ? climbs.length
                  : destinations.filter((d) => d.category === cat.id).length;
              return (
                <Link
                  key={cat.id}
                  to={`/rides/${cat.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-[#322b24] hover:border-[#4a4038] bg-[#1c1915] p-6 transition-colors"
                >
                  <span
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ background: cat.color }}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[22px] font-semibold text-[#f4efe7]">{cat.label}</h3>
                      <p className="text-[14px] text-[#a1968a] mt-1">{cat.tagline}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#6b6157] group-hover:text-[#dfa04a] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </div>
                  <p className="font-mono-dc text-[11px] uppercase tracking-[0.12em] text-[#6b6157] mt-5">
                    {count} destinations
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured */}
        <section className="mt-20">
          <SectionHead
            eyebrow="Where to go next"
            title="Hand-picked places"
            sub="A few favourites to start with — each one comes with a full ride guide."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((d) => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
        </section>

        {/* Tracking teaser */}
        <section className="mt-20">
          <div className="rounded-3xl border border-[#322b24] bg-[#1a1712] overflow-hidden">
            <div className="p-8 md:p-12">
              <p className="font-mono-dc text-[11px] tracking-[0.22em] uppercase text-[#dfa04a] mb-4">
                Keep the record
              </p>
              <h2 className="text-[clamp(26px,3.5vw,38px)] font-semibold text-[#f4efe7] max-w-[20ch] leading-tight">
                Your rides, collected
              </h2>
              <p className="mt-4 text-[16px] text-[#a1968a] max-w-[58ch] leading-relaxed">
                Connect Strava and the climbs you've ridden are found automatically —
                with your real time on each ascent, not just the whole ride. See them
                on a globe, and settle it with your friends.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-8">
                <Feature
                  icon={<Mountain className="w-4 h-4" />}
                  title="Auto-detected"
                  body="Your rides are matched to climbs by GPS — nothing to tick off by hand."
                />
                <Feature
                  icon={<Route className="w-4 h-4" />}
                  title="Real climb times"
                  body="Measured from the foot of the climb to the summit, repeats counted separately."
                />
                <Feature
                  icon={<Trophy className="w-4 h-4" />}
                  title="Head to head"
                  body="Compare times per climb with friends and see who's missing what."
                />
              </div>
              <Link
                to={user ? '/my-climbs' : '/rides/climbs'}
                className="mt-8 inline-flex items-center gap-2 bg-[#dfa04a] hover:bg-[#e8b463] text-[#1a1206] font-semibold px-6 py-3 rounded-full transition-colors"
              >
                {user ? `See your ${conquered} conquered` : 'Start your collection'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div className="mb-7 pt-14">
      <p className="font-mono-dc text-[11px] tracking-[0.22em] uppercase text-[#7a7066] mb-3">{eyebrow}</p>
      <h2 className="text-[clamp(26px,3.5vw,36px)] font-semibold text-[#f4efe7]">{title}</h2>
      <p className="text-[15px] text-[#a1968a] mt-2 max-w-[60ch]">{sub}</p>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="border-t border-[#322b24] pt-4">
      <span className="text-[#dfa04a] inline-flex mb-2">{icon}</span>
      <h3 className="text-[15px] font-semibold text-[#f4efe7]">{title}</h3>
      <p className="text-[13px] text-[#a1968a] mt-1 leading-relaxed">{body}</p>
    </div>
  );
}
