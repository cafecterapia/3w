import { filterSlots, fmtTime, durationLabel } from '@/lib/calendar-utils';
import type { Slot } from '@/types/calendar';

interface DayViewProps {
  date: Date;
  slots: Slot[];
  search: string;
  selectedSlots: Record<string, Slot>;
  onSelect: (s: Slot) => void;
}

export function DayView({
  date,
  slots,
  search,
  selectedSlots,
  onSelect,
}: DayViewProps) {
  const filtered = filterSlots(slots, search);

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="text-sm font-medium text-gray-900">
          {new Intl.DateTimeFormat('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }).format(date)}
        </div>
        <div className="text-xs text-gray-600">{filtered.length} horários</div>
      </div>
      {filtered.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-600">
          Sem horários disponíveis
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((s) => {
            const active = !!selectedSlots[s.id];
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                className={[
                  'rounded-md border px-3 py-2 text-left transition-colors hover:bg-gray-50',
                  active ? 'border-gray-900' : '',
                ].join(' ')}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="font-medium text-gray-900">
                    {fmtTime(s.start)}
                  </div>
                  <span className="text-gray-600">{durationLabel(s)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
