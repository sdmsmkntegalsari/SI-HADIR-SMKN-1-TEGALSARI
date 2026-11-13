import React, { useState, useMemo } from 'react';
import {
  Pegawai,
  StatusKehadiranHarian,
  MainCategory,
} from '../types/attendance';
import { getDailyAttendanceForDate } from '../utils/storage';
import { BarChart3, PieChart, TrendingUp, Layers } from 'lucide-react';

interface DashboardChartsProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  allPegawai: Pegawai[];
  attendanceList: StatusKehadiranHarian[];
  activeCategoryFilter: string;
  onSelectCategoryFilter: (cat: string) => void;
  activeSubCategoryFilter: string;
  onSelectSubCategoryFilter: (subCat: string) => void;
}

interface SegmentInfo {
  key: MainCategory;
  label: string;
  shortLabel: string;
  count: number;
  color: string;
  trackColor: string;
  textClass: string;
}

const CATEGORY_META: Record<
  MainCategory,
  { label: string; shortLabel: string; color: string; trackColor: string; textClass: string }
> = {
  hadir: {
    label: 'Hadir (Terjadwal)',
    shortLabel: 'Hadir',
    color: '#16A34A',
    trackColor: '#DCFCE7',
    textClass: 'text-emerald-700',
  },
  dinas_luar: {
    label: 'Dinas Luar',
    shortLabel: 'Dinas',
    color: '#2563EB',
    trackColor: '#DBEAFE',
    textClass: 'text-blue-700',
  },
  cuti: {
    label: 'Cuti Pegawai',
    shortLabel: 'Cuti',
    color: '#D97706',
    trackColor: '#FEF3C7',
    textClass: 'text-amber-700',
  },
  pendidikan_pelatihan: {
    label: 'Diklat / Tugas Belajar',
    shortLabel: 'Diklat',
    color: '#7C3AED',
    trackColor: '#EDE9FE',
    textClass: 'text-purple-700',
  },
  tidak_hadir: {
    label: 'Tidak Hadir',
    shortLabel: 'Alpa',
    color: '#DC2626',
    trackColor: '#FEE2E2',
    textClass: 'text-rose-700',
  },
};

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  selectedDate,
  onSelectDate,
  allPegawai,
  attendanceList,
  activeCategoryFilter,
  onSelectCategoryFilter,
  activeSubCategoryFilter,
  onSelectSubCategoryFilter,
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<MainCategory | null>(null);
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // 1. Donut Chart Data
  const totalCount = attendanceList.length || 1;
  const segments: SegmentInfo[] = useMemo(() => {
    const keys: MainCategory[] = [
      'hadir',
      'dinas_luar',
      'cuti',
      'pendidikan_pelatihan',
      'tidak_hadir',
    ];
    return keys.map((key) => ({
      key,
      ...CATEGORY_META[key],
      count: attendanceList.filter((a) => a.status === key).length,
    }));
  }, [attendanceList]);

  const activeTotal = attendanceList.length;
  const hadirCount = segments.find((s) => s.key === 'hadir')?.count || 0;
  const dinasCount = segments.find((s) => s.key === 'dinas_luar')?.count || 0;
  const diklatCount = segments.find((s) => s.key === 'pendidikan_pelatihan')?.count || 0;
  const effectiveTaskRate = activeTotal > 0 ? Math.round(((hadirCount + dinasCount + diklatCount) / activeTotal) * 100) : 0;
  const physicalPresenceRate = activeTotal > 0 ? Math.round((hadirCount / activeTotal) * 100) : 0;

  // SVG Donut Geometry
  const radius = 64;
  const circumference = 2 * Math.PI * radius;

  const donutArcs = useMemo(() => {
    let accumulatedPercent = 0;
    return segments
      .filter((s) => s.count > 0)
      .map((seg) => {
        const fraction = seg.count / totalCount;
        const dashLength = fraction * circumference;
        const gapLength = circumference - dashLength;
        const offset = -accumulatedPercent * circumference;
        accumulatedPercent += fraction;
        return {
          ...seg,
          percent: Math.round(fraction * 1000) / 10,
          dashArray: `${dashLength} ${gapLength}`,
          dashOffset: offset,
        };
      });
  }, [segments, totalCount, circumference]);

  const hoveredInfo = hoveredSegment
    ? segments.find((s) => s.key === hoveredSegment) || null
    : null;

  // 2. 7-Day Trend Data (ending at selectedDate)
  const sevenDayTrend = useMemo(() => {
    const parts = selectedDate.split('-').map(Number);
    const baseDate = new Date(parts[0], parts[1] - 1, parts[2]);
    const days: {
      dateStr: string;
      dayLabel: string;
      dateShort: string;
      isWeekend: boolean;
      hadir: number;
      dinas: number;
      cuti: number;
      diklat: number;
      tidakHadir: number;
      total: number;
      rate: number;
    }[] = [];

    for (let offset = -6; offset <= 0; offset++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + offset);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayNum}`;
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const dayAtt = getDailyAttendanceForDate(dateStr);
      const h = dayAtt.filter((a) => a.status === 'hadir').length;
      const dl = dayAtt.filter((a) => a.status === 'dinas_luar').length;
      const c = dayAtt.filter((a) => a.status === 'cuti').length;
      const dk = dayAtt.filter((a) => a.status === 'pendidikan_pelatihan').length;
      const th = dayAtt.filter((a) => a.status === 'tidak_hadir').length;
      const tot = dayAtt.length || 1;

      days.push({
        dateStr,
        dayLabel: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        dateShort: `${dayNum}/${m}`,
        isWeekend,
        hadir: h,
        dinas: dl,
        cuti: c,
        diklat: dk,
        tidakHadir: th,
        total: dayAtt.length,
        rate: Math.round(((h + dl + dk) / tot) * 100),
      });
    }
    return days;
  }, [selectedDate, attendanceList]);

  // 3. Guru vs Pegawai Split & Sub-Category Breakdown
  const groupComparison = useMemo(() => {
    const buildGroup = (tipe: 'guru' | 'pegawai', label: string) => {
      const ids = new Set(allPegawai.filter((p) => p.tipe === tipe).map((p) => p.id));
      const rows = attendanceList.filter((a) => ids.has(a.pegawaiId));
      const tot = rows.length || 1;
      const h = rows.filter((r) => r.status === 'hadir').length;
      const dl = rows.filter((r) => r.status === 'dinas_luar').length;
      const c = rows.filter((r) => r.status === 'cuti').length;
      const dk = rows.filter((r) => r.status === 'pendidikan_pelatihan').length;
      const th = rows.filter((r) => r.status === 'tidak_hadir').length;
      return {
        label,
        total: rows.length,
        hadir: h,
        dinas: dl,
        cuti: c,
        diklat: dk,
        tidakHadir: th,
        pctHadir: Math.round((h / tot) * 100),
      };
    };

    return [
      buildGroup('guru', 'Guru (Tenaga Pendidik)'),
      buildGroup('pegawai', 'Pegawai (Tenaga Kependidikan)'),
    ];
  }, [allPegawai, attendanceList]);

  const subCategoryBreakdown = useMemo(() => {
    const subCats: {
      name: string;
      category: MainCategory;
      color: string;
      count: number;
    }[] = [
      { name: 'Perjalanan Dinas Dalam kota', category: 'dinas_luar', color: '#2563EB', count: 0 },
      { name: 'Perjalanan Dinas Luar Kota', category: 'dinas_luar', color: '#1D4ED8', count: 0 },
      { name: 'Cuti Alasan Penting', category: 'cuti', color: '#F59E0B', count: 0 },
      { name: 'Cuti Tahunan', category: 'cuti', color: '#D97706', count: 0 },
      { name: 'Cuti Melahirkan', category: 'cuti', color: '#B45309', count: 0 },
      { name: 'Cuti Sakit', category: 'cuti', color: '#EA580C', count: 0 },
      { name: 'Tugas Belajar', category: 'pendidikan_pelatihan', color: '#7C3AED', count: 0 },
      { name: 'Diklat', category: 'pendidikan_pelatihan', color: '#6D28D9', count: 0 },
      { name: 'Tanpa Keterangan / Alpa', category: 'tidak_hadir', color: '#DC2626', count: 0 },
    ];

    attendanceList.forEach((a) => {
      const target = subCats.find((sc) => sc.name === a.subKategori);
      if (target) target.count += 1;
    });

    const maxCount = Math.max(1, ...subCats.map((s) => s.count));
    return subCats.map((s) => ({
      ...s,
      barWidth: Math.round((s.count / maxCount) * 100),
    }));
  }, [attendanceList]);

  return (
    <section className="space-y-4" aria-label="Visualisasi Diagram dan Grafik Kehadiran">
      {/* Row 1: Donut Chart + 7-Day Trend Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Card A: Donut Chart Komposisi Kehadiran */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2 text-slate-800">
                <PieChart className="w-4 h-4 text-blue-800" />
                <h3 className="text-sm font-bold tracking-tight">
                  Diagram Komposisi Kehadiran
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Klik segmen atau legenda untuk menyaring tabel presensi
              </p>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-600 tabular-nums">
              {selectedDate}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 my-auto">
            {/* SVG Donut Ring */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90 overflow-visible">
                {/* Background Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="18"
                />
                {donutArcs.map((arc) => {
                  const isHovered = hoveredSegment === arc.key;
                  const isActiveFilter = activeCategoryFilter === arc.key;
                  return (
                    <circle
                      key={arc.key}
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke={arc.color}
                      strokeWidth={isHovered || isActiveFilter ? 22 : 18}
                      strokeDasharray={arc.dashArray}
                      strokeDashoffset={arc.dashOffset}
                      strokeLinecap="butt"
                      className="cursor-pointer transition-all duration-200"
                      style={{
                        opacity:
                          (hoveredSegment && !isHovered) ||
                          (activeCategoryFilter !== 'all' && !isActiveFilter)
                            ? 0.35
                            : 1,
                      }}
                      onMouseEnter={() => setHoveredSegment(arc.key)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      onClick={() => {
                        onSelectSubCategoryFilter('all');
                        onSelectCategoryFilter(
                          activeCategoryFilter === arc.key ? 'all' : arc.key
                        );
                      }}
                    />
                  );
                })}
              </svg>

              {/* Center Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                {hoveredInfo ? (
                  <>
                    <span className="text-[10px] font-semibold text-slate-500 leading-tight">
                      {hoveredInfo.shortLabel}
                    </span>
                    <span className={`text-2xl font-extrabold font-mono tabular-nums leading-tight ${hoveredInfo.textClass}`}>
                      {hoveredInfo.count}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                      {Math.round((hoveredInfo.count / totalCount) * 1000) / 10}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-semibold text-slate-500">
                      Hadir Sekolah
                    </span>
                    <span className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 leading-tight">
                      {physicalPresenceRate}%
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold tabular-nums">
                      {hadirCount}/{activeTotal} Org
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Interactive Legend */}
            <div className="flex-1 w-full space-y-1.5">
              {segments.map((seg) => {
                const pct = activeTotal > 0 ? Math.round((seg.count / activeTotal) * 1000) / 10 : 0;
                const isSelected = activeCategoryFilter === seg.key;
                return (
                  <button
                    key={seg.key}
                    type="button"
                    onMouseEnter={() => setHoveredSegment(seg.key)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    onClick={() => {
                      onSelectSubCategoryFilter('all');
                      onSelectCategoryFilter(isSelected ? 'all' : seg.key);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors border ${
                      isSelected
                        ? 'bg-slate-100 border-slate-300 font-bold'
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-xs shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-slate-700 truncate">{seg.label}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums shrink-0 ml-2">
                      <span className="font-bold text-slate-900">{seg.count}</span>
                      <span className="text-[11px] text-slate-400 w-10 text-right">
                        {pct}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Efektivitas Tugas (Hadir + Dinas + Diklat)</span>
            <span className="font-mono font-bold text-blue-900 tabular-nums">
              {effectiveTaskRate}% ({hadirCount + dinasCount + diklatCount}/{activeTotal})
            </span>
          </div>
        </div>

        {/* Card B: Grafik Tren Kehadiran 7 Hari Terakhir */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2 text-slate-800">
                <TrendingUp className="w-4 h-4 text-blue-800" />
                <h3 className="text-sm font-bold tracking-tight">
                  Grafik Tren Kehadiran 7 Hari Terakhir
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Distribusi harian otomatis & izin terdaftar · Klik batang grafik untuk melihat tanggal tersebut
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-500 shrink-0">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-emerald-600" /> Hadir
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-blue-600" /> Dinas
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-amber-600" /> Cuti
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-purple-600" /> Diklat
              </span>
            </div>
          </div>

          {/* Interactive Stacked Column Chart */}
          <div className="relative pt-6 pb-2">
            {/* Horizontal grid lines */}
            <div className="relative h-48 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-200">
              {/* Background reference lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[100, 75, 50, 25, 0].map((mark) => (
                  <div key={mark} className="w-full flex items-center">
                    <span className="text-[9px] font-mono text-slate-400 w-7 -ml-1 tabular-nums">
                      {mark}%
                    </span>
                    <div className="flex-1 border-t border-dashed border-slate-100" />
                  </div>
                ))}
              </div>

              {sevenDayTrend.map((day, idx) => {
                const tot = day.total || 1;
                const hPct = (day.hadir / tot) * 100;
                const dlPct = (day.dinas / tot) * 100;
                const cPct = (day.cuti / tot) * 100;
                const dkPct = (day.diklat / tot) * 100;
                const thPct = (day.tidakHadir / tot) * 100;
                const isSelected = day.dateStr === selectedDate;
                const isHovered = hoveredDayIndex === idx;

                return (
                  <div
                    key={day.dateStr}
                    className="relative flex-1 flex flex-col items-center h-full justify-end z-10 group cursor-pointer pl-4 sm:pl-5"
                    onMouseEnter={() => setHoveredDayIndex(idx)}
                    onMouseLeave={() => setHoveredDayIndex(null)}
                    onClick={() => onSelectDate(day.dateStr)}
                  >
                    {/* Hover Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full w-44 bg-slate-900 text-white rounded-lg p-2.5 shadow-xl text-[10px] z-30 pointer-events-none">
                        <div className="font-bold border-b border-slate-700 pb-1 mb-1 flex items-center justify-between">
                          <span>{day.dayLabel}, {day.dateShort}</span>
                          <span className="font-mono text-emerald-300">{day.rate}%</span>
                        </div>
                        <div className="space-y-0.5 font-mono tabular-nums">
                          <div className="flex justify-between">
                            <span className="text-emerald-300">Hadir:</span>
                            <span>{day.hadir}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-300">Dinas Luar:</span>
                            <span>{day.dinas}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-300">Cuti:</span>
                            <span>{day.cuti}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-300">Diklat/Tubel:</span>
                            <span>{day.diklat}</span>
                          </div>
                          {day.tidakHadir > 0 && (
                            <div className="flex justify-between">
                              <span className="text-rose-300">Alpa:</span>
                              <span>{day.tidakHadir}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stacked Bar Column */}
                    <div
                      className={`w-full max-w-[38px] h-full flex flex-col-reverse rounded-t-md overflow-hidden transition-transform duration-150 ${
                        isSelected
                          ? 'ring-2 ring-blue-900 ring-offset-2'
                          : isHovered
                          ? 'scale-[1.03]'
                          : ''
                      }`}
                    >
                      {hPct > 0 && (
                        <div
                          style={{ height: `${hPct}%`, backgroundColor: '#16A34A' }}
                          className="w-full transition-all duration-300"
                        />
                      )}
                      {dlPct > 0 && (
                        <div
                          style={{ height: `${dlPct}%`, backgroundColor: '#2563EB' }}
                          className="w-full transition-all duration-300"
                        />
                      )}
                      {dkPct > 0 && (
                        <div
                          style={{ height: `${dkPct}%`, backgroundColor: '#7C3AED' }}
                          className="w-full transition-all duration-300"
                        />
                      )}
                      {cPct > 0 && (
                        <div
                          style={{ height: `${cPct}%`, backgroundColor: '#D97706' }}
                          className="w-full transition-all duration-300"
                        />
                      )}
                      {thPct > 0 && (
                        <div
                          style={{ height: `${thPct}%`, backgroundColor: '#DC2626' }}
                          className="w-full transition-all duration-300"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Labels */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 px-2 mt-2">
              {sevenDayTrend.map((day) => {
                const isSelected = day.dateStr === selectedDate;
                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => onSelectDate(day.dateStr)}
                    className={`flex-1 pl-4 sm:pl-5 text-center transition-colors ${
                      isSelected ? 'text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span className="block text-[11px] leading-none">{day.dayLabel}</span>
                    <span className="block text-[10px] font-mono mt-0.5 tabular-nums">
                      {day.dateShort}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Perbandingan Guru vs Pegawai + Grafik Rincian Sub-Kategori Izin */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Card C: Perbandingan Guru vs Tenaga Kependidikan */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-slate-800">
              <Layers className="w-4 h-4 text-blue-800" />
              <h3 className="text-sm font-bold tracking-tight">
                Perbandingan Guru vs Pegawai
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Rasio kehadiran tenaga pendidik dan tenaga kependidikan
            </p>
          </div>

          <div className="space-y-5 my-auto">
            {groupComparison.map((grp) => {
              const tot = grp.total || 1;
              const wHadir = (grp.hadir / tot) * 100;
              const wDinas = (grp.dinas / tot) * 100;
              const wDiklat = (grp.diklat / tot) * 100;
              const wCuti = (grp.cuti / tot) * 100;
              const wAlpa = (grp.tidakHadir / tot) * 100;

              return (
                <div key={grp.label} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{grp.label}</span>
                    <span className="font-mono text-slate-600 tabular-nums">
                      <strong className="text-emerald-700">{grp.hadir}</strong> hadir / {grp.total} org ({grp.pctHadir}%)
                    </span>
                  </div>

                  {/* Horizontal Segmented Bar */}
                  <div className="w-full h-3.5 bg-slate-100 rounded-md overflow-hidden flex">
                    {wHadir > 0 && (
                      <div
                        style={{ width: `${wHadir}%`, backgroundColor: '#16A34A' }}
                        title={`Hadir: ${grp.hadir}`}
                        className="h-full transition-all duration-300"
                      />
                    )}
                    {wDinas > 0 && (
                      <div
                        style={{ width: `${wDinas}%`, backgroundColor: '#2563EB' }}
                        title={`Dinas Luar: ${grp.dinas}`}
                        className="h-full transition-all duration-300"
                      />
                    )}
                    {wDiklat > 0 && (
                      <div
                        style={{ width: `${wDiklat}%`, backgroundColor: '#7C3AED' }}
                        title={`Diklat/Tubel: ${grp.diklat}`}
                        className="h-full transition-all duration-300"
                      />
                    )}
                    {wCuti > 0 && (
                      <div
                        style={{ width: `${wCuti}%`, backgroundColor: '#D97706' }}
                        title={`Cuti: ${grp.cuti}`}
                        className="h-full transition-all duration-300"
                      />
                    )}
                    {wAlpa > 0 && (
                      <div
                        style={{ width: `${wAlpa}%`, backgroundColor: '#DC2626' }}
                        title={`Tidak Hadir: ${grp.tidakHadir}`}
                        className="h-full transition-all duration-300"
                      />
                    )}
                  </div>

                  {/* Mini breakdown text */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 font-mono tabular-nums">
                    <span>Hadir: {grp.hadir}</span>
                    <span aria-hidden="true">·</span>
                    <span>Dinas: {grp.dinas}</span>
                    <span aria-hidden="true">·</span>
                    <span>Cuti: {grp.cuti}</span>
                    <span aria-hidden="true">·</span>
                    <span>Diklat: {grp.diklat}</span>
                    {grp.tidakHadir > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-rose-600">Alpa: {grp.tidakHadir}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card D: Grafik Rincian Sub-Kategori Izin / Dinas / Cuti / Diklat */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2 text-slate-800">
                <BarChart3 className="w-4 h-4 text-blue-800" />
                <h3 className="text-sm font-bold tracking-tight">
                  Grafik Sub-Kategori Dinas Luar, Cuti & Diklat
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Klik salah satu sub-kategori untuk memfilter daftar guru & pegawai di bawah
              </p>
            </div>
            {activeSubCategoryFilter !== 'all' && (
              <button
                type="button"
                onClick={() => onSelectSubCategoryFilter('all')}
                className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 whitespace-nowrap"
              >
                Tampilkan Semua
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {subCategoryBreakdown.map((item) => {
              const isSelected = activeSubCategoryFilter === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    onSelectCategoryFilter('all');
                    onSelectSubCategoryFilter(isSelected ? 'all' : item.name);
                  }}
                  className={`text-left p-1.5 rounded-lg transition-colors border ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-200'
                      : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`truncate pr-2 ${item.count > 0 ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                      {item.name}
                    </span>
                    <span className={`font-mono font-bold tabular-nums shrink-0 ${item.count > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                      {item.count}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: item.count > 0 ? `${Math.max(8, item.barWidth)}%` : '0%',
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
