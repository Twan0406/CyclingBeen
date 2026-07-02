interface Props {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, unit, icon }: Props) {
  return (
    <div className="bg-[#0d1412] rounded-2xl border border-[#1D9E75]/20 p-4 flex items-center gap-3 shadow-[0_0_20px_rgba(29,158,117,0.08)]">
      {icon && (
        <div className="w-11 h-11 rounded-xl bg-[#1D9E75]/12 border border-[#1D9E75]/30 flex items-center justify-center text-[#2fd6a0]">
          {icon}
        </div>
      )}
      <div>
        <p className="text-2xl font-bold text-white">{value}{unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}</p>
        <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}
