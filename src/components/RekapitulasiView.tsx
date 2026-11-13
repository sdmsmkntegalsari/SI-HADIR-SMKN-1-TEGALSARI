import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Printer, 
  Download, 
  Search, 
  FileText,
  Users,
  CheckCircle2,
  Briefcase,
  CalendarOff,
  GraduationCap
} from 'lucide-react';
import { Pegawai, StatusKehadiranHarian } from '../types/attendance';
import { getStoredIzin, getStoredOverrides } from '../utils/storage';
import { INFO_SEKOLAH } from '../data/mockData';

interface RekapitulasiViewProps {
  allPegawai: Pegawai[];
}

export const RekapitulasiView: React.FC<RekapitulasiViewProps> = ({ allPegawai }) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1); // 1-12
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'guru' | 'pegawai'>('all');

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Calculate days in month (assuming Monday-Friday are working days)
  const workingDaysInMonth = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    let workDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(selectedYear, selectedMonth - 1, day);
      const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++;
      }
    }
    return workDays || 22;
  }, [selectedYear, selectedMonth]);

  // Read stored data
  const izins = useMemo(() => getStoredIzin(), []);
  const overrides = useMemo(() => getStoredOverrides(), []);

  // Compute stats per employee for the selected month
  const monthlyData = useMemo(() => {
    const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

    return allPegawai.map(p => {
      // Find leaves covering any days in this month
      let dinasDays = 0;
      let cutiDays = 0;
      let diklatDays = 0;
      let tidakHadirDays = 0;

      // Check relevant approved leaves
      izins.forEach(iz => {
        if (iz.pegawaiId === p.id && iz.status === 'disetujui') {
          // Check overlap
          if (iz.tanggalMulai.startsWith(monthPrefix) || iz.tanggalSelesai.startsWith(monthPrefix)) {
            const count = Math.min(iz.jumlahHari, workingDaysInMonth);
            if (iz.kategori === 'dinas_luar') dinasDays += count;
            else if (iz.kategori === 'cuti') cutiDays += count;
            else if (iz.kategori === 'pendidikan_pelatihan') diklatDays += count;
            else if (iz.kategori === 'tidak_hadir') tidakHadirDays += count;
          }
        }
      });

      // Cap counts to working days
      const totalOff = dinasDays + cutiDays + diklatDays + tidakHadirDays;
      const hadirDays = Math.max(0, workingDaysInMonth - totalOff);
      
      // Attendance percentage: (Hadir + Dinas Luar + Diklat) / Working Days * 100%
      // Note: In Indonesian civil service / SMK rules, Dinas Luar and Diklat are considered performing state duties (Hadir)
      const effectivePresence = hadirDays + dinasDays + diklatDays;
      const percentage = Math.round((effectivePresence / workingDaysInMonth) * 100);

      return {
        pegawai: p,
        workingDays: workingDaysInMonth,
        hadir: hadirDays,
        dinasLuar: dinasDays,
        cuti: cutiDays,
        diklat: diklatDays,
        tidakHadir: tidakHadirDays,
        percentage,
      };
    });
  }, [allPegawai, izins, selectedYear, selectedMonth, workingDaysInMonth]);

  // Filtered rows
  const filteredData = useMemo(() => {
    return monthlyData.filter(item => {
      if (filterType !== 'all' && item.pegawai.tipe !== filterType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.pegawai.nama.toLowerCase().includes(q);
        const matchesNip = item.pegawai.nip.includes(q);
        const matchesJabatan = item.pegawai.jabatan.toLowerCase().includes(q);
        if (!matchesName && !matchesNip && !matchesJabatan) return false;
      }
      return true;
    });
  }, [monthlyData, filterType, searchQuery]);

  // Overall statistics for the month
  const overallStats = useMemo(() => {
    const totalTeachers = allPegawai.length;
    const avgPercentage = Math.round(
      monthlyData.reduce((acc, curr) => acc + curr.percentage, 0) / (totalTeachers || 1)
    );
    const totalDinas = monthlyData.reduce((acc, curr) => acc + curr.dinasLuar, 0);
    const totalCuti = monthlyData.reduce((acc, curr) => acc + curr.cuti, 0);
    const totalDiklat = monthlyData.reduce((acc, curr) => acc + curr.diklat, 0);

    return { totalTeachers, avgPercentage, totalDinas, totalCuti, totalDiklat };
  }, [allPegawai, monthlyData]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'No', 'Nama Lengkap', 'NIP', 'Golongan', 'Jabatan', 'Tipe', 
      'Hari Kerja', 'Hadir', 'Dinas Luar', 'Cuti', 'Diklat/Tubel', 'Tanpa Keterangan', 'Persentase Kehadiran'
    ];

    const rows = filteredData.map((d, idx) => [
      idx + 1,
      `"${(d.pegawai.gelarDepan ? d.pegawai.gelarDepan + ' ' : '') + d.pegawai.nama + (d.pegawai.gelarBelakang ? ', ' + d.pegawai.gelarBelakang : '')}"`,
      `'${d.pegawai.nip}`,
      `"${d.pegawai.pangkatGolongan}"`,
      `"${d.pegawai.jabatan}"`,
      d.pegawai.tipe === 'guru' ? 'Guru' : 'Pegawai',
      d.workingDays,
      d.hadir,
      d.dinasLuar,
      d.cuti,
      d.diklat,
      d.tidakHadir,
      `${d.percentage}%`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Presensi_SMKN1_Tegalsari_${monthNames[selectedMonth - 1]}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Rekapitulasi Bulanan Kehadiran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Laporan bulanan presensi kerja guru dan staf SMKN 1 Tegalsari Periode {monthNames[selectedMonth - 1]} {selectedYear}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Month Picker & Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Month & Year Select */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-center space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pilih Periode Laporan
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            >
              {monthNames.map((name, idx) => (
                <option key={idx} value={idx + 1}>{name}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 font-semibold font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Hari Kerja Efektif: {workingDaysInMonth} Hari
          </span>
        </div>

        {/* Avg Percentage */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Rata-Rata Kehadiran
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
              {overallStats.avgPercentage}%
            </div>
            <span className="text-[10px] text-emerald-600">Disiplin Tinggi</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Total Dinas & Diklat */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Tugas Dinas & Diklat
            </span>
            <div className="text-2xl font-bold font-mono text-blue-900 mt-1">
              {overallStats.totalDinas + overallStats.totalDiklat}
            </div>
            <span className="text-[10px] text-slate-400">Total Hari Penugasan</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Total Cuti */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Cuti Resmi Pegawai
            </span>
            <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
              {overallStats.totalCuti}
            </div>
            <span className="text-[10px] text-slate-400">Hari Cuti Disetujui</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <CalendarOff className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Type Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
            }`}
          >
            Semua ({monthlyData.length})
          </button>
          <button
            onClick={() => setFilterType('guru')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'guru' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
            }`}
          >
            Guru
          </button>
          <button
            onClick={() => setFilterType('pegawai')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'pegawai' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
            }`}
          >
            Tenaga Kependidikan
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari guru / pegawai..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Recap Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-3 min-w-[240px]">Nama Guru / Pegawai</th>
                <th className="py-3 px-3 min-w-[160px]">NIP & Golongan</th>
                <th className="py-3 px-2 text-center w-16">Hari Kerja</th>
                <th className="py-3 px-2 text-center w-14 bg-emerald-50/60 text-emerald-800">Hadir</th>
                <th className="py-3 px-2 text-center w-14 bg-blue-50/60 text-blue-800">Dinas</th>
                <th className="py-3 px-2 text-center w-14 bg-amber-50/60 text-amber-800">Cuti</th>
                <th className="py-3 px-2 text-center w-14 bg-purple-50/60 text-purple-800">Diklat</th>
                <th className="py-3 px-2 text-center w-14 bg-rose-50/60 text-rose-800">Alpa</th>
                <th className="py-3 px-3 text-center w-24">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredData.map((row, idx) => {
                const p = row.pegawai;
                const fullName = `${p.gelarDepan ? p.gelarDepan + ' ' : ''}${p.nama}${p.gelarBelakang ? ', ' + p.gelarBelakang : ''}`;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-900 leading-snug">{fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{p.jabatan}</p>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      <p className="text-slate-800 font-semibold">{p.nip}</p>
                      <p className="text-[10px] text-slate-500 font-sans">{p.pangkatGolongan}</p>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono text-slate-700">
                      {row.workingDays}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-emerald-700 bg-emerald-50/20">
                      {row.hadir}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-blue-700 bg-blue-50/20">
                      {row.dinasLuar}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-amber-700 bg-amber-50/20">
                      {row.cuti}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-purple-700 bg-purple-50/20">
                      {row.diklat}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-rose-700 bg-rose-50/20">
                      {row.tidakHadir}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        row.percentage >= 95 ? 'bg-emerald-100 text-emerald-800' :
                        row.percentage >= 85 ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {row.percentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
