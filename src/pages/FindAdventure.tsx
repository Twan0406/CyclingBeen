import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, RotateCcw, Check, AlertTriangle } from 'lucide-react';
import { useClimbs } from '../context/ClimbsContext';
import { allDestinations } from '../data/allDestinations';
import { usePageMeta } from '../hooks/usePageMeta';
import { monthName } from '../lib/season';
import {
  recommend,
  toCandidates,
  type Preferences,
  type Suggestion,
} from '../lib/matchAdventure';

/** One question, and the answers it accepts. */
interface Step<K extends keyof Preferences> {
  key: K;
  question: string;
  hint: string;
  options: Array<{ value: Preferences[K]; label: string; note: string }>;
}

const steps = [
  {
    key: 'length',
    question: 'How long have you got?',
    hint: 'This decides more than anything else what fits.',
    options: [
      { value: 'day', label: 'A day', note: 'Out and back before dark' },
      { value: 'weekend', label: 'A weekend', note: 'Two or three days' },
      { value: 'week', label: 'A week', note: 'A proper trip' },
      { value: 'longer', label: 'Longer', note: 'Two weeks or more' },
    ],
  } as Step<'length'>,
  {
    key: 'reach',
    question: 'How far do you want to go?',
    hint: 'Measured from the middle of the Netherlands.',
    options: [
      { value: 'home', label: 'Close to home', note: 'Netherlands and Belgium' },
      { value: 'nearby', label: 'A drive away', note: 'Reachable by car or train' },
      { value: 'europe', label: 'Anywhere', note: 'Flying is fine' },
    ],
  } as Step<'reach'>,
  {
    key: 'bike',
    question: 'Which bike are you taking?',
    hint: 'Nothing will be suggested that your bike cannot ride.',
    options: [
      { value: 'road', label: 'Road bike', note: 'Tarmac and cobbles' },
      { value: 'gravel', label: 'Gravel bike', note: 'Tracks, trails and back roads' },
      { value: 'mtb', label: 'Mountain bike', note: 'Singletrack and descents' },
      { value: 'any', label: 'Whatever suits', note: "I'll pick the bike to match" },
    ],
  } as Step<'bike'>,
  {
    key: 'craving',
    question: 'What are you after?',
    hint: 'The feeling you want, not the place.',
    options: [
      { value: 'mountains', label: 'Mountains', note: 'A big climb to the top' },
      { value: 'quiet', label: 'Quiet and open', note: 'Big skies, empty roads' },
      { value: 'punchy', label: 'Short and steep', note: 'Hills that hurt' },
      { value: 'trails', label: 'Off the tarmac', note: 'Gravel and trails' },
      { value: 'goal', label: 'Something to train for', note: 'A date in the calendar' },
      { value: 'surprise', label: 'Surprise me', note: 'No strong feelings' },
    ],
  } as Step<'craving'>,
  {
    key: 'effort',
    question: 'How hard do you want it?',
    hint: 'Be honest — this is a holiday, not a contract.',
    options: [
      { value: 'easy', label: 'Gentle', note: 'Riding to enjoy the view' },
      { value: 'steady', label: 'Steady', note: 'Tired at dinner, fine by morning' },
      { value: 'brutal', label: 'As hard as it gets', note: 'The suffering is the point' },
    ],
  } as Step<'effort'>,
] as const;

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function FindAdventure() {
  const { climbs } = useClimbs();
  const [answers, setAnswers] = useState<Partial<Preferences>>({});
  const [step, setStep] = useState(0);

  usePageMeta({
    title: 'Find your next cycling adventure | Ridewild',
    description:
      'Answer a handful of questions — how long you have, how far you will go, which bike, what you are after — and get a cycling trip that actually fits.',
  });

  const candidates = useMemo(() => toCandidates(allDestinations, climbs), [climbs]);

  const done = step >= steps.length + 1;
  const results: Suggestion[] = useMemo(
    () => (done ? recommend(answers as Preferences, candidates) : []),
    [done, answers, candidates],
  );

  function choose<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setAnswers((a) => ({ ...a, [key]: value }));
    setStep((s) => s + 1);
  }

  function restart() {
    setAnswers({});
    setStep(0);
  }

  const total = steps.length + 1;

  return (
    <div className="max-w-[760px] mx-auto px-6 py-10 pb-24">
      <p className="font-mono-dc text-[11px] tracking-[0.22em] uppercase text-[#7a7066] mb-3">
        Find your adventure
      </p>

      {!done ? (
        <>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-[3px] flex-1 bg-[#2a241e] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#dfa04a] transition-all duration-300"
                style={{ width: `${(step / total) * 100}%` }}
              />
            </div>
            <span className="font-mono-dc text-[11px] text-[#7a7066] shrink-0">
              {step + 1} / {total}
            </span>
          </div>

          {step < steps.length ? (
            <Question
              step={steps[step]}
              onChoose={(v) => choose(steps[step].key, v as never)}
            />
          ) : (
            <>
              <h1 className="text-[clamp(24px,3.6vw,34px)] font-semibold text-[#f4efe7] leading-tight">
                When are you going?
              </h1>
              <p className="text-[15px] text-[#a1968a] mt-2">
                Half the best places are shut by snow or unbearable by heat for part of the year.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-7">
                {MONTHS.map((m) => (
                  <button
                    key={m}
                    onClick={() => choose('month', m)}
                    className="border border-[#3a322a] hover:border-[#dfa04a] hover:bg-[#dfa04a]/10 rounded-xl px-3 py-3 text-[14px] text-[#f4efe7] font-medium transition-colors"
                  >
                    {monthName(m).slice(0, 3)}
                  </button>
                ))}
              </div>
              <button
                onClick={() => choose('month', null)}
                className="mt-4 text-[14px] text-[#a1968a] hover:text-[#f4efe7] underline transition-colors"
              >
                No month in mind yet
              </button>
            </>
          )}

          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="mt-9 inline-flex items-center gap-2 text-[14px] text-[#7a7066] hover:text-[#f4efe7] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
        </>
      ) : (
        <>
          <h1 className="text-[clamp(26px,4vw,38px)] font-semibold text-[#f4efe7] leading-tight">
            {results.length > 0 ? 'Go here' : 'Nothing fits that yet'}
          </h1>
          <p className="text-[15px] text-[#a1968a] mt-2">
            {summarise(answers as Preferences)}
          </p>

          <div className="space-y-4 mt-8">
            {results.map((s, i) => (
              <Result key={s.id} suggestion={s} rank={i} />
            ))}
          </div>

          <button
            onClick={restart}
            className="mt-9 inline-flex items-center gap-2 border border-[#4a4038] hover:border-[#6b6157] text-[#f4efe7] text-[14px] font-semibold rounded-full px-5 py-2.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Start again
          </button>
        </>
      )}
    </div>
  );
}

function Question<K extends keyof Preferences>({
  step,
  onChoose,
}: {
  step: Step<K>;
  onChoose: (value: Preferences[K]) => void;
}) {
  return (
    <>
      <h1 className="text-[clamp(24px,3.6vw,34px)] font-semibold text-[#f4efe7] leading-tight">
        {step.question}
      </h1>
      <p className="text-[15px] text-[#a1968a] mt-2">{step.hint}</p>
      <div className="grid sm:grid-cols-2 gap-3 mt-7">
        {step.options.map((o) => (
          <button
            key={String(o.value)}
            onClick={() => onChoose(o.value)}
            className="text-left border border-[#3a322a] hover:border-[#dfa04a] hover:bg-[#dfa04a]/8 rounded-2xl px-5 py-4 transition-colors"
          >
            <p className="text-[17px] font-semibold text-[#f4efe7]">{o.label}</p>
            <p className="text-[13px] text-[#a1968a] mt-0.5">{o.note}</p>
          </button>
        ))}
      </div>
    </>
  );
}

function Result({ suggestion: s, rank }: { suggestion: Suggestion; rank: number }) {
  return (
    <Link
      to={s.href}
      className="block bg-[#1c1915] ring-1 ring-[#322b24] hover:ring-[#4a4038] rounded-2xl px-6 py-5 transition-colors"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          {rank === 0 && (
            <p className="font-mono-dc text-[10px] uppercase tracking-[0.16em] text-[#dfa04a] mb-1.5">
              Best match
            </p>
          )}
          <h2 className="text-[21px] font-semibold text-[#f4efe7]">{s.name}</h2>
          <p className="text-[13px] text-[#a1968a] mt-0.5">{s.where}</p>
        </div>
        <span
          className="font-mono-dc text-[10px] uppercase tracking-[0.08em] px-3 py-1 rounded-full shrink-0"
          style={{ background: s.color, color: '#1a1206' }}
        >
          {s.categoryLabel}
        </span>
      </div>

      <p className="text-[15px] text-[#d6cec2] mt-3 leading-relaxed">{s.summary}</p>

      <ul className="mt-4 space-y-1.5">
        {s.reasons.map((r) => (
          <li key={r} className="flex gap-2 text-[14px] text-[#d6cec2]">
            <Check className="w-4 h-4 text-[#7f8f5f] shrink-0 mt-0.5" strokeWidth={2.5} />
            {r}
          </li>
        ))}
        {s.caveats.map((r) => (
          <li key={r} className="flex gap-2 text-[14px] text-[#a1968a]">
            <AlertTriangle className="w-4 h-4 text-[#c4633a] shrink-0 mt-0.5" />
            {r}
          </li>
        ))}
      </ul>

      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#dfa04a] mt-4">
        <Compass className="w-4 h-4" /> Read the guide
      </span>
    </Link>
  );
}

function summarise(p: Preferences) {
  const length = { day: 'A day', weekend: 'A weekend', week: 'A week', longer: 'A long trip' }[p.length];
  const reach = { home: 'close to home', nearby: 'within driving distance', europe: 'anywhere' }[p.reach];
  const bike = { road: 'on the road bike', gravel: 'on the gravel bike', mtb: 'on the mountain bike', any: 'on whatever bike suits' }[p.bike];
  const when = p.month ? ` in ${monthName(p.month)}` : '';
  return `${length}, ${reach}, ${bike}${when}.`;
}
