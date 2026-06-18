interface Props {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, unit, icon }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
      {icon && <div className="text-[#1D9E75]">{icon}</div>}
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}{unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
