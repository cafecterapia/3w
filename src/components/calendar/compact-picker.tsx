import { addDays, startOfCalendar, addMonths, stripTime, isSameDay } from '@/lib/calendar-utils';

interface CompactPickerProps {
  month: Date;
  onPrev: () => void;
  onNext: () => void;
  selected: Date;
  onSelect: (d: Date) => void;
}

export function CompactPicker({ month, onPrev, onNext, selected, onSelect }: CompactPickerProps) {
  const gridStart = startOfCalendar(month);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(month);

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="text-sm font-medium text-gray-900">{label}</div>
        <div className="inline-flex overflow-hidden rounded-md border">
          <button onClick={onPrev} className="px-3 py-2 hover:bg-gray-50" aria-label="Anterior">
            <svg className="h-4 w-4 text-gray-900" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button onClick={onNext} className="border-l px-3 py-2 hover:bg-gray-50" aria-label="Próximo">
            <svg className="h-4 w-4 text-gray-900" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 p-3">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d) => (
          <div key={d} className="py-1 text-center text-[11px] text-gray-600">{d}</div>
        ))}
        {cells.map((d) => {
          const isCurrent = d.getMonth() === month.getMonth();
          const isSel = isSameDay(d, selected);
          const isTod = isSameDay(d, new Date());
          return (
            <button
              key={d.toISOString()}
              onClick={() => onSelect(stripTime(d))}
              className={[
                'rounded-md px-2 py-1 text-center text-sm',
                isSel ? 'bg-gray-900 text-white' : isTod ? 'border border-gray-900 text-gray-900' : 'text-gray-900',
                !isCurrent ? 'opacity-40' : '',
              ].join(' ')}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
