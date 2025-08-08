'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  stripTime,
  addDays,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfCalendar,
  startOfWeek,
  isSameDay,
  key,
  fmtTime,
  filterSlots,
  durationLabel,
} from '@/lib/calendar-utils';
import {
  WeekView,
  DayView,
  CompactPicker,
  Chip,
  SkeletonMonth,
} from '@/components/calendar';
import type { View, Slot, CreditPack } from '@/types/calendar';

export default function CalendarPage() {
  const [view, setView] = useState<View>('month');
  const [cursor, setCursor] = useState<Date>(stripTime(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(stripTime(new Date()));
  const [slots, setSlots] = useState<Record<string, Slot[]>>({});
  const [credits, setCredits] = useState<CreditPack>({ total: 12, used: 3 });
  const [selectedSlots, setSelectedSlots] = useState<Record<string, Slot>>({});
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<[number, number]>([7, 22]);
  const [duration, setDuration] = useState<number>(60);
  const [isLoading, setIsLoading] = useState(false);

  const remaining = useMemo(
    () =>
      Math.max(
        credits.total - credits.used - Object.keys(selectedSlots).length,
        0
      ),
    [credits, selectedSlots]
  );

  // Generate mock slots (replace with API)
  useEffect(() => {
    setIsLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      const map: Record<string, Slot[]> = {};
      const start = startOfMonth(view === 'month' ? cursor : selectedDate);
      const end = endOfMonth(view === 'month' ? cursor : selectedDate);
      let d = new Date(start);
      while (d <= end) {
        const dayKey = key(d);
        const list: Slot[] = [];
        const baseHours = [8, 10, 12, 14, 16, 18, 20];
        baseHours.forEach((h) => {
          const st = new Date(d);
          st.setHours(h, 0, 0, 0);
          const ed = new Date(st);
          ed.setMinutes(ed.getMinutes() + duration);
          if (h >= timeRange[0] && h <= timeRange[1]) {
            list.push({
              id: `${dayKey}-${h}`,
              start: st,
              end: ed,
              taken: Math.random() < 0.09,
            });
          }
        });
        map[dayKey] = list;
        d.setDate(d.getDate() + 1);
      }
      if (!controller.signal.aborted) {
        setSlots(map);
        setIsLoading(false);
      }
    }, 350);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [cursor, selectedDate, duration, timeRange, view]);

  const daysInGrid = useMemo(() => {
    const start = startOfCalendar(cursor);
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [cursor]);

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(cursor);
  }, [cursor]);

  const selectedCount = Object.keys(selectedSlots).length;

  const handleSelectSlot = (s: Slot) => {
    if (remaining <= 0 && !selectedSlots[s.id]) return;
    setSelectedSlots((prev) => {
      const next = { ...prev };
      if (next[s.id]) delete next[s.id];
      else next[s.id] = s;
      return next;
    });
  };

  const clearSelection = () => setSelectedSlots({});
  const commitSelection = () => {
    // Mock commit – integrate with API
    setCredits((c) => ({
      ...c,
      used: c.used + Object.keys(selectedSlots).length,
    }));
    setSelectedSlots({});
  };

  const goPrev = () => {
    if (view === 'month') setCursor(addMonths(cursor, -1));
    if (view === 'week') setCursor(addDays(cursor, -7));
    if (view === 'day') setCursor(addDays(cursor, -1));
  };
  const goNext = () => {
    if (view === 'month') setCursor(addMonths(cursor, 1));
    if (view === 'week') setCursor(addDays(cursor, 7));
    if (view === 'day') setCursor(addDays(cursor, 1));
  };
  const goToday = () => setCursor(stripTime(new Date()));

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Agendar aulas
          </h1>
          <p className="text-sm text-gray-600">
            Use seus créditos para reservar horários de aula
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-md border px-3 py-2">
            <svg
              className="h-4 w-4 text-gray-900"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 6v12M6 12h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="text-xs">
              <div className="font-medium text-gray-900">Créditos</div>
              <div className="text-gray-600">{remaining} restantes</div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-md border px-3 py-2">
            <svg
              className="h-4 w-4 text-gray-900"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M3 5h18M3 10h18M3 15h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <select
              value={view}
              onChange={(e) => setView(e.target.value as View)}
              className="bg-transparent text-sm text-gray-900 outline-none"
            >
              <option value="month">Mês</option>
              <option value="week">Semana</option>
              <option value="day">Dia</option>
            </select>
          </div>
          <div className="inline-flex overflow-hidden rounded-md border">
            <button
              onClick={goPrev}
              className="px-3 py-2 hover:bg-gray-50"
              aria-label="Anterior"
            >
              <svg
                className="h-4 w-4 text-gray-900"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M15 6l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="px-4 py-2 text-sm text-gray-900">{monthLabel}</div>
            <button
              onClick={goNext}
              className="px-3 py-2 hover:bg-gray-50"
              aria-label="Próximo"
            >
              <svg
                className="h-4 w-4 text-gray-900"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={goToday}
              className="border-l px-3 py-2 text-sm hover:bg-gray-50"
            >
              Hoje
            </button>
          </div>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            <svg
              className="h-4 w-4 text-gray-900"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 6h16M6 12h12M10 18h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Filtros
          </button>
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-900"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M20 20l-3-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar dia/horário"
              className="w-48 rounded-md border bg-background px-8 py-2 text-sm outline-none focus:border-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      {filtersOpen && (
        <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg border p-4 sm:grid-cols-3">
          <div>
            <div className="mb-1 text-xs text-gray-600">Janela de horário</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={23}
                value={timeRange[0]}
                onChange={(e) => setTimeRange([+e.target.value, timeRange[1]])}
                className="w-20 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
              <span className="text-xs text-gray-600">às</span>
              <input
                type="number"
                min={0}
                max={23}
                value={timeRange[1]}
                onChange={(e) => setTimeRange([timeRange[0], +e.target.value])}
                className="w-20 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
              <span className="text-xs text-gray-600">h</span>
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs text-gray-600">Duração (minutos)</div>
            <select
              value={duration}
              onChange={(e) => setDuration(+e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-gray-900"
            >
              <option value={45}>45</option>
              <option value={60}>60</option>
              <option value={90}>90</option>
            </select>
          </div>
          <div>
            <div className="mb-1 text-xs text-gray-600">Rápido</div>
            <div className="flex flex-wrap gap-2">
              <Chip onClick={() => setTimeRange([7, 12])}>Manhã</Chip>
              <Chip onClick={() => setTimeRange([12, 18])}>Tarde</Chip>
              <Chip onClick={() => setTimeRange([18, 22])}>Noite</Chip>
              <Chip onClick={() => setTimeRange([7, 22])}>Todo</Chip>
            </div>
          </div>
        </div>
      )}

      {/* Main surface */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-2">
          {/* Month grid */}
          {view === 'month' && (
            <div className="rounded-lg border">
              <div className="grid grid-cols-7 border-b bg-gray-50 text-center text-xs text-gray-600">
                {weekDays.map((d) => (
                  <div key={d} className="px-2 py-2">
                    {d}
                  </div>
                ))}
              </div>
              {isLoading ? (
                <SkeletonMonth />
              ) : (
                <div className="grid grid-cols-7">
                  {daysInGrid.map((d) => {
                    const isToday = isSameDay(d, new Date());
                    const isCurrentMonth = d.getMonth() === cursor.getMonth();
                    const k = key(d);
                    const daySlots = (slots[k] || []).filter((s) => !s.taken);
                    const filtered = filterSlots(daySlots, search);
                    return (
                      <button
                        key={k}
                        onClick={() => {
                          setSelectedDate(stripTime(d));
                          setView('day');
                        }}
                        className={[
                          'min-h-[112px] border-r border-b px-2 py-2 text-left transition-colors',
                          isCurrentMonth ? 'bg-white' : 'bg-gray-50',
                          'hover:bg-gray-50 focus:outline-none',
                        ].join(' ')}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span
                            className={[
                              'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                              isToday
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-900',
                            ].join(' ')}
                          >
                            {d.getDate()}
                          </span>
                          {filtered.length > 0 && (
                            <span className="text-[10px] text-gray-500">
                              {filtered.length} horários
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {filtered.slice(0, 3).map((s) => (
                            <div key={s.id} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-gray-900" />
                              <span className="text-xs text-gray-900">
                                {fmtTime(s.start)}
                              </span>
                            </div>
                          ))}
                          {filtered.length > 3 && (
                            <div className="text-[10px] text-gray-500">
                              +{filtered.length - 3}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Week view */}
          {view === 'week' && (
            <WeekView
              cursor={cursor}
              slots={slots}
              search={search}
              onSelectDate={(d) => {
                setSelectedDate(stripTime(d));
                setView('day');
              }}
            />
          )}

          {/* Day view */}
          {view === 'day' && (
            <DayView
              date={selectedDate}
              slots={(slots[key(selectedDate)] || []).filter((s) => !s.taken)}
              search={search}
              selectedSlots={selectedSlots}
              onSelect={handleSelectSlot}
            />
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-6">
          {/* Date picker compact */}
          <CompactPicker
            month={cursor}
            onPrev={() => setCursor(addMonths(cursor, -1))}
            onNext={() => setCursor(addMonths(cursor, 1))}
            selected={selectedDate}
            onSelect={(d) => {
              setSelectedDate(d);
              setCursor(startOfMonth(d));
              setView('day');
            }}
          />

          {/* Selection summary */}
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-gray-900"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M20 7L9 18l-5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3 className="text-sm font-medium text-gray-900">
                  Sua seleção
                </h3>
              </div>
              <span className="rounded-full border px-2.5 py-1 text-xs text-gray-900">
                {selectedCount} aula(s)
              </span>
            </div>
            {selectedCount === 0 ? (
              <p className="text-sm text-gray-600">
                Escolha horários no calendário.
              </p>
            ) : (
              <div className="space-y-2">
                {Object.values(selectedSlots)
                  .sort((a, b) => a.start.getTime() - b.start.getTime())
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <div className="text-xs">
                        <div className="font-medium text-gray-900">
                          {new Intl.DateTimeFormat('pt-BR', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                          }).format(s.start)}
                        </div>
                        <div className="text-gray-600">
                          {fmtTime(s.start)} — {fmtTime(s.end)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectSlot(s)}
                        className="text-xs text-gray-900 hover:opacity-80"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
              </div>
            )}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-gray-600">
                {remaining} créditos restantes
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearSelection}
                  className="rounded-md border px-3 py-2 text-xs hover:bg-gray-50"
                >
                  Limpar
                </button>
                <button
                  disabled={selectedCount === 0}
                  onClick={commitSelection}
                  className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-secondary disabled:opacity-50 hover:opacity-90"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>

          {/* Legend and tips */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
              <svg
                className="h-4 w-4 text-gray-900"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 18h.01M12 6v8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              Dicas
            </h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>Clique em um dia para ver horários disponíveis.</li>
              <li>Use filtros para ajustar janela de horários e duração.</li>
              <li>Selecione até o limite de créditos disponíveis.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
