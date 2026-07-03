interface Props {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, unit, icon }: Props) {
  return (
    <div className="bg-[#111827] rounded-2xl ring-1 ring-white/8 p-4 flex items-center gap-3">
      {icon && (
        <div className="w-11 h-11 rounded-xl bg-amber-400/12 flex items-center justify-center text-amber-400">
          {icon}
        </div>
      )}
      <div>
        <p className="text-2xl font-bold text-white">
          {value}
          {unit && <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}
