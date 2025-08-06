import { addDays, startOfWeek, key, filterSlots, fmtTime } from '@/lib/calendar-utils';
import type { Slot } from '@/types/calendar';

interface WeekViewProps {
  cursor: Date;
  slots: Record<string, Slot[]>;
  search: string;
  onSelectDate: (d: Date) => void;
}

export function WeekView({ cursor, slots, search, onSelectDate }: WeekViewProps) {
  const start = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const hours = Array.from({ length: 14 }, (_, i) => i + 7);

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-8 border-b bg-gray-50 text-xs text-gray-600">
        <div className="px-2 py-2">Hora</div>
        {days.map((d) => (
          <button
            key={d.toISOString()}
            onClick={() => onSelectDate(d)}
            className="px-2 py-2 text-left hover:bg-gray-100"
          >
            <div className="font-medium text-gray-900">
              {new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(d)}
            </div>
            <div>{d.getDate()}/{d.getMonth() + 1}</div>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-8">
        <div className="col-span-1">
          {hours.map((h) => (
            <div key={h} className="h-14 border-b px-2 py-2 text-xs text-gray-600">
              {String(h).padStart(2, '0')}:00
            </div>
          ))}
        </div>
        {days.map((d) => {
          const daySlots = (slots[key(d)] || []).filter((s) => !s.taken);
          const filtered = filterSlots(daySlots, search);
          return (
            <div key={d.toISOString()} className="col-span-1">
              {hours.map((h) => {
                const has = filtered.some((s) => s.start.getHours() === h);
                return (
                  <div key={h} className="h-14 border-l border-b px-2 py-2">
                    {has && <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-900" />}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
