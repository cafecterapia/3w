interface ChipProps {
  children: React.ReactNode;
  onClick: () => void;
}

export function Chip({ children, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-3 py-1 text-xs text-gray-900 hover:bg-gray-50"
    >
      {children}
    </button>
  );
}

export function SkeletonMonth() {
  return (
    <div className="grid grid-cols-7">
      {Array.from({ length: 42 }).map((_, i) => (
        <div key={i} className="min-h-[112px] border-r border-b p-2">
          <div className="h-4 w-6 rounded bg-gray-100" />
          <div className="mt-3 space-y-1">
            <div className="h-3 w-16 rounded bg-gray-100" />
            <div className="h-3 w-12 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
