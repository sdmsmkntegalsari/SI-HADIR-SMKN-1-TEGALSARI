import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Search, 
  Filter, 
  FileText, 
  Printer, 
  Download, 
  Plus, 
  Users, 
  CheckCircle2, 
  Briefcase, 
  CalendarOff, 
  GraduationCap, 
  AlertOctagon, 
  Paperclip,
  Check,
  Edit2,
  BarChart2,
  XCircle,
  ShieldCheck
} from 'lucide-react';
import { DashboardCharts } from './DashboardCharts';
import { 
  Pegawai, 
  StatusKehadiranHarian, 
  PermintaanIzin, 
  MainCategory, 
  SubCategory 
} from '../types/attendance';
import { getDailyAttendanceForDate, getStoredIzin, updateStatusIzin } from '../utils/storage';
import { getFormattedDate } from '../data/mockData';
import { FilePreviewModal } from './FilePreviewModal';
import { QuickStatusModal } from './QuickStatusModal';
import { CetakLaporanModal } from './CetakLaporanModal';

interface DashboardViewProps {
  currentUser: Pegawai;
  allPegawai: Pegawai[];
  onNavigateToIzin: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  allPegawai,
  onNavigateToIzin,
}) => {
  // Current chosen date
  const [selectedDate, setSelectedDate] = useState<string>(getFormattedDate(0));
  
  // Realtime clock
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter states
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSubCategory, setFilterSubCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'guru' | 'pegawai'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Daily attendance data
  const [attendanceList, setAttendanceList] = useState<StatusKehadiranHarian[]>([]);
  const [izinList, setIzinList] = useState<PermintaanIzin[]>([]);

  // Modals state
  const [previewIzin, setPreviewIzin] = useState<PermintaanIzin | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  
  const [quickStatusPegawai, setQuickStatusPegawai] = useState<Pegawai | null>(null);
  const [isQuickStatusOpen, setIsQuickStatusOpen] = useState<boolean>(false);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [showCharts, setShowCharts] = useState<boolean>(true);

  // Load attendance data whenever selected date changes
  const loadData = () => {
    const att = getDailyAttendanceForDate(selectedDate);
    const izins = getStoredIzin();
    setAttendanceList(att);
    setIzinList(izins);
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const isApprover = currentUser.role === 'admin' || currentUser.role === 'pimpinan';

  const pendingIzins = useMemo(() => {
    return izinList.filter(iz => iz.status === 'menunggu');
  }, [izinList]);

  const userPendingIzins = useMemo(() => {
    return pendingIzins.filter(iz => iz.pegawaiId === currentUser.id);
  }, [pendingIzins, currentUser.id]);

  const handleVerifyIzin = (izinId: string, decision: 'disetujui' | 'ditolak') => {
    const verifikatorLabel = `${currentUser.nama} (${currentUser.role === 'pimpinan' ? 'Pimpinan' : 'Admin SDM'})`;
    const catatan = decision === 'disetujui'
      ? `Diverifikasi & disetujui oleh ${currentUser.nama}`
      : `Ditolak oleh ${currentUser.nama}`;
    updateStatusIzin(izinId, decision, catatan, verifikatorLabel);
    loadData();
  };

  // Date shifting
  const handleShiftDate = (days: number) => {
    const parts = selectedDate.split('-');
    const cur = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    cur.setDate(cur.getDate() + days);
    const year = cur.getFullYear();
    const month = String(cur.getMonth() + 1).padStart(2, '0');
    const day = String(cur.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  const handleSetToday = () => {
    setSelectedDate(getFormattedDate(0));
  };

  // Indonesian date formatter
  const formattedDateProse = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      return selectedDate;
    }
  }, [selectedDate]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const total = attendanceList.length;
    const hadir = attendanceList.filter(a => a.status === 'hadir').length;
    const dinas = attendanceList.filter(a => a.status === 'dinas_luar').length;
    const cuti = attendanceList.filter(a => a.status === 'cuti').length;
    const diklat = attendanceList.filter(a => a.status === 'pendidikan_pelatihan').length;
    const tidakHadir = attendanceList.filter(a => a.status === 'tidak_hadir').length;

    return { total, hadir, dinas, cuti, diklat, tidakHadir };
  }, [attendanceList]);

  // Filtered attendance list
  const filteredRows = useMemo(() => {
    return attendanceList.filter(item => {
      const pegawai = allPegawai.find(p => p.id === item.pegawaiId);
      if (!pegawai) return false;

      // Filter category
      if (filterCategory !== 'all' && item.status !== filterCategory) {
        return false;
      }

      // Filter sub category
      if (filterSubCategory !== 'all' && item.subKategori !== filterSubCategory) {
        return false;
      }

      // Filter type (guru / pegawai)
      if (filterType !== 'all' && pegawai.tipe !== filterType) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = pegawai.nama.toLowerCase().includes(q);
        const matchesNip = pegawai.nip.includes(q);
        const matchesJabatan = pegawai.jabatan.toLowerCase().includes(q);
        const matchesAlasan = (item.alasan || '').toLowerCase().includes(q);
        if (!matchesName && !matchesNip && !matchesJabatan && !matchesAlasan) {
          return false;
        }
      }

      return true;
    });
  }, [attendanceList, allPegawai, filterCategory, filterSubCategory, filterType, searchQuery]);

  // Handle open document preview
  const handleViewDocument = (izinId?: string) => {
    if (!izinId) return;
    const found = izinList.find(i => i.id === izinId);
    if (found) {
      setPreviewIzin(found);
      setIsPreviewOpen(true);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['No', 'Nama Lengkap', 'NIP', 'Jabatan', 'Golongan', 'Tipe', 'Status', 'Sub Kategori', 'Keterangan/Alasan'];
    const rows = filteredRows.map((item, idx) => {
      const p = allPegawai.find(peg => peg.id === item.pegawaiId);
      return [
        idx + 1,
        `"${p ? (p.gelarDepan ? p.gelarDepan + ' ' : '') + p.nama + (p.gelarBelakang ? ', ' + p.gelarBelakang : '') : ''}"`,
        `'${p?.nip || ''}`,
        `"${p?.jabatan || ''}"`,
        `"${p?.pangkatGolongan || ''}"`,
        p?.tipe === 'guru' ? 'Guru' : 'Pegawai',
        item.status,
        `"${item.subKategori}"`,
        `"${(item.alasan || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Presensi_SMKN1_Tegalsari_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / Date Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
              Presensi Harian
            </span>
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentTimeStr || '07:00:00 WIB'}</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Dashboard Kehadiran Guru & Pegawai
          </h1>
          <p className="text-xs text-slate-500">
            Jadwal presensi otomatis SMKN 1 Tegalsari · {formattedDateProse}
          </p>
        </div>

        {/* Date Selector & Primary Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Navigator */}
          <div className="inline-flex items-center bg-white border border-slate-300 rounded-lg shadow-2xs overflow-hidden">
            <button
              onClick={() => handleShiftDate(-1)}
              className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2 py-1.5 text-xs font-semibold text-slate-900 bg-transparent border-0 focus:outline-none font-mono cursor-pointer"
            />
            <button
              onClick={() => handleShiftDate(1)}
              className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSetToday}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              selectedDate === getFormattedDate(0)
                ? 'bg-blue-900 text-white border-blue-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Hari Ini
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak Presensi</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>

          <button
            onClick={() => setShowCharts(prev => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors shadow-2xs ${
              showCharts
                ? 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showCharts ? 'Sembunyikan Grafik' : 'Tampilkan Grafik'}</span>
          </button>

          <button
            onClick={onNavigateToIzin}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ajukan Izin</span>
          </button>
        </div>
      </div>

      {/* Notice Banner: Presensi Terjadwal Otomatis */}
      <div className="p-3.5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Otomasi Presensi Harian & Verifikasi Berjenjang
            </h4>
            <p className="text-xs text-blue-50/90 leading-tight mt-0.5">
              Seluruh guru & pegawai terjadwal otomatis <strong>Hadir/Masuk</strong> setiap harinya. Pengajuan izin oleh guru/pegawai harus <strong>diverifikasi dan disetujui Admin SDM atau Pimpinan</strong> sebelum status kehadiran otomatis berubah.
            </p>
          </div>
        </div>
        <div className="hidden lg:block text-right shrink-0">
          <span className="text-[11px] text-blue-200 block">Status Terjadwal:</span>
          <span className="text-xs font-mono font-bold text-white tabular-nums">{stats.total} Pegawai Siap Tugas</span>
        </div>
      </div>

      {/* Antrean Verifikasi Izin (Admin & Pimpinan) */}
      {isApprover && pendingIzins.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 bg-amber-50/70 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Antrean Verifikasi Pengajuan Izin
              </h3>
              <span className="text-xs font-mono font-bold text-amber-800 tabular-nums">
                · {pendingIzins.length} menunggu persetujuan
              </span>
            </div>
            <span className="text-[11px] text-amber-800">
              Setujui untuk mengaktifkan perubahan status kehadiran otomatis
            </span>
          </div>

          <div className="divide-y divide-slate-200">
            {pendingIzins.map((iz) => (
              <div
                key={iz.id}
                className="px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                    <span className="font-bold text-slate-900">{iz.pegawaiNama}</span>
                    <span className="text-slate-400" aria-hidden="true">·</span>
                    <span className="font-mono text-[11px] text-slate-500">NIP. {iz.pegawaiNip}</span>
                    <span className="text-slate-400" aria-hidden="true">·</span>
                    <span className="font-semibold text-blue-900">{iz.subKategori}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-600">
                    <span className="font-mono font-medium text-slate-800">
                      {iz.tanggalMulai} s/d {iz.tanggalSelesai} ({iz.jumlahHari} hari)
                    </span>
                    <span className="text-slate-400" aria-hidden="true">·</span>
                    <span className="truncate max-w-xl text-slate-600">{iz.alasan}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewIzin(iz);
                      setIsPreviewOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Paperclip className="w-3 h-3 text-slate-500" />
                    <span>Berkas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyIzin(iz.id, 'ditolak')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors whitespace-nowrap shrink-0"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyIzin(iz.id, 'disetujui')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Setujui</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Pending untuk Guru/Pegawai yang sedang login */}
      {!isApprover && userPendingIzins.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start sm:items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
            <div className="text-xs text-amber-950">
              <span className="font-bold">Pengajuan Izin Anda Sedang Diverifikasi:</span>{' '}
              <span>
                {userPendingIzins.map(u => `${u.subKategori} (${u.tanggalMulai} s/d ${u.tanggalSelesai})`).join(', ')}. Status presensi Anda tetap terjadwal Hadir hingga disetujui Admin SDM atau Pimpinan.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Pegawai */}
        <div 
          onClick={() => { setFilterCategory('all'); setFilterSubCategory('all'); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white ${
            filterCategory === 'all' ? 'border-slate-400 ring-1 ring-slate-400 shadow-xs' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Pegawai</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {stats.total}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Guru & Tendik</p>
        </div>

        {/* Hadir */}
        <div 
          onClick={() => { setFilterCategory('hadir'); setFilterSubCategory('all'); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white ${
            filterCategory === 'hadir' ? 'border-emerald-600 ring-1 ring-emerald-600 bg-emerald-50/20 shadow-xs' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Hadir</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
            {stats.hadir}
          </div>
          <p className="text-[10px] text-emerald-600/80 mt-1">Masuk Terjadwal</p>
        </div>

        {/* Dinas Luar */}
        <div 
          onClick={() => { setFilterCategory('dinas_luar'); setFilterSubCategory('all'); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white ${
            filterCategory === 'dinas_luar' ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50/20 shadow-xs' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Dinas Luar</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-800">
            {stats.dinas}
          </div>
          <p className="text-[10px] text-blue-600/80 mt-1">Dalam / Luar Kota</p>
        </div>

        {/* Cuti */}
        <div 
          onClick={() => { setFilterCategory('cuti'); setFilterSubCategory('all'); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white ${
            filterCategory === 'cuti' ? 'border-amber-600 ring-1 ring-amber-600 bg-amber-50/20 shadow-xs' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Cuti</span>
            <CalendarOff className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-700">
            {stats.cuti}
          </div>
          <p className="text-[10px] text-amber-600/80 mt-1">Penting, Thn, Melahirkan, Sakit</p>
        </div>

        {/* Pendidikan & Pelatihan */}
        <div 
          onClick={() => { setFilterCategory('pendidikan_pelatihan'); setFilterSubCategory('all'); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white ${
            filterCategory === 'pendidikan_pelatihan' ? 'border-purple-600 ring-1 ring-purple-600 bg-purple-50/20 shadow-xs' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-purple-700 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Diklat / Tubel</span>
            <GraduationCap className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-purple-800">
            {stats.diklat}
          </div>
          <p className="text-[10px] text-purple-600/80 mt-1">Tugas Belajar & Diklat</p>
        </div>

        {/* Tidak Hadir */}
        <div 
          onClick={() => { setFilterCategory('tidak_hadir'); setFilterSubCategory('all'); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white ${
            filterCategory === 'tidak_hadir' ? 'border-rose-600 ring-1 ring-rose-600 bg-rose-50/20 shadow-xs' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Tidak Hadir</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-700">
            {stats.tidakHadir}
          </div>
          <p className="text-[10px] text-rose-600/80 mt-1">Tanpa Keterangan</p>
        </div>
      </div>

      {/* Interactive Diagrams & Charts Section */}
      {showCharts && (
        <DashboardCharts
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          allPegawai={allPegawai}
          attendanceList={attendanceList}
          activeCategoryFilter={filterCategory}
          onSelectCategoryFilter={setFilterCategory}
          activeSubCategoryFilter={filterSubCategory}
          onSelectSubCategoryFilter={setFilterSubCategory}
        />
      )}

      {/* Interactive Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => { setFilterCategory('all'); setFilterSubCategory('all'); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                filterCategory === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              onClick={() => { setFilterCategory('hadir'); setFilterSubCategory('all'); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                filterCategory === 'hadir'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hadir ({stats.hadir})
            </button>
            <button
              onClick={() => { setFilterCategory('dinas_luar'); setFilterSubCategory('all'); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                filterCategory === 'dinas_luar'
                  ? 'bg-white text-blue-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dinas Luar ({stats.dinas})
            </button>
            <button
              onClick={() => { setFilterCategory('cuti'); setFilterSubCategory('all'); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                filterCategory === 'cuti'
                  ? 'bg-white text-amber-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cuti ({stats.cuti})
            </button>
            <button
              onClick={() => { setFilterCategory('pendidikan_pelatihan'); setFilterSubCategory('all'); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                filterCategory === 'pendidikan_pelatihan'
                  ? 'bg-white text-purple-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Diklat ({stats.diklat})
            </button>
            <button
              onClick={() => { setFilterCategory('tidak_hadir'); setFilterSubCategory('all'); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                filterCategory === 'tidak_hadir'
                  ? 'bg-white text-rose-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tidak Hadir ({stats.tidakHadir})
            </button>
          </div>

          {/* Type Segments */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Semua Pegawai
            </button>
            <button
              onClick={() => setFilterType('guru')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filterType === 'guru' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Guru (Pendidik)
            </button>
            <button
              onClick={() => setFilterType('pegawai')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filterType === 'pegawai' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Tenaga Kependidikan
            </button>
          </div>
        </div>

        {/* Sub-Filters and Live Search Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          {/* Sub-Kategori Filter Dropdown */}
          <div className="w-full sm:w-64">
            <select
              value={filterSubCategory}
              onChange={(e) => setFilterSubCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            >
              <option value="all">-- Semua Sub-Kategori --</option>
              <optgroup label="Dinas Luar">
                <option value="Perjalanan Dinas Dalam kota">Perjalanan Dinas Dalam kota</option>
                <option value="Perjalanan Dinas Luar Kota">Perjalanan Dinas Luar Kota</option>
              </optgroup>
              <optgroup label="Cuti">
                <option value="Cuti Alasan Penting">Cuti Alasan Penting</option>
                <option value="Cuti Tahunan">Cuti Tahunan</option>
                <option value="Cuti Melahirkan">Cuti Melahirkan</option>
                <option value="Cuti Sakit">Cuti Sakit</option>
              </optgroup>
              <optgroup label="Pendidikan & Pelatihan">
                <option value="Tugas Belajar">Tugas Belajar</option>
                <option value="Diklat">Diklat</option>
              </optgroup>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama guru/pegawai, NIP, atau mata pelajaran/jabatan..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          {(filterCategory !== 'all' || filterSubCategory !== 'all' || filterType !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setFilterCategory('all');
                setFilterSubCategory('all');
                setFilterType('all');
                setSearchQuery('');
              }}
              className="text-xs text-blue-700 hover:text-blue-900 font-medium whitespace-nowrap"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              Data Kehadiran Guru & Pegawai
            </span>
            <span className="text-xs text-slate-500">
              ({filteredRows.length} dari {allPegawai.length} personil)
            </span>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {selectedDate}
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-slate-700">Tidak ada data pegawai yang sesuai dengan filter.</p>
            <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau reset kategori.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-3.5 text-center w-12">No</th>
                  <th className="py-3 px-3.5 min-w-[260px]">Pegawai & Jabatan</th>
                  <th className="py-3 px-3.5 min-w-[190px]">Status Kehadiran</th>
                  <th className="py-3 px-3.5 min-w-[260px]">Keterangan / Alasan Izin</th>
                  <th className="py-3 px-3.5 text-center w-28">Berkas Izin</th>
                  {isApprover && (
                    <th className="py-3 px-3.5 text-center w-28">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRows.map((item, index) => {
                  const pegawai = allPegawai.find(p => p.id === item.pegawaiId);
                  if (!pegawai) return null;

                  const fullName = `${pegawai.gelarDepan ? pegawai.gelarDepan + ' ' : ''}${pegawai.nama}${pegawai.gelarBelakang ? ', ' + pegawai.gelarBelakang : ''}`;

                  // Badge styles based on category
                  let badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  let statusTitle = 'Hadir';

                  if (item.status === 'dinas_luar') {
                    badgeClass = 'bg-blue-50 text-blue-900 border-blue-200';
                    statusTitle = 'Dinas Luar';
                  } else if (item.status === 'cuti') {
                    badgeClass = 'bg-amber-50 text-amber-900 border-amber-200';
                    statusTitle = 'Cuti Pegawai';
                  } else if (item.status === 'pendidikan_pelatihan') {
                    badgeClass = 'bg-purple-50 text-purple-900 border-purple-200';
                    statusTitle = 'Diklat / Tubel';
                  } else if (item.status === 'tidak_hadir') {
                    badgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
                    statusTitle = 'Tidak Hadir';
                  }

                  return (
                    <tr key={item.pegawaiId} className="hover:bg-slate-50/70 transition-colors">
                      {/* No */}
                      <td className="py-3 px-3.5 text-center font-mono text-slate-500 text-[11px]">
                        {index + 1}
                      </td>

                      {/* Pegawai Info */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                            pegawai.tipe === 'guru' ? 'bg-blue-900' : 'bg-slate-700'
                          }`}>
                            {pegawai.nama.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-snug">
                              {fullName}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                              <span>NIP. {pegawai.nip}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-sans text-slate-600">{pegawai.pangkatGolongan}</span>
                            </div>
                            <div className="text-[11px] text-slate-600 truncate max-w-[280px]">
                              {pegawai.jabatan}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Kehadiran */}
                      <td className="py-3 px-3.5">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold border ${badgeClass}`}>
                            <span>{statusTitle}</span>
                          </span>
                          <div className="text-[11px] font-semibold text-slate-800">
                            {item.subKategori}
                          </div>
                          {item.isOtomatis && (
                            <span className="text-[10px] text-emerald-700 block">
                              Terjadwal Otomatis
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Keterangan / Alasan */}
                      <td className="py-3 px-3.5">
                        <div className="max-w-[340px]">
                          {item.alasan ? (
                            <p className="text-slate-800 leading-relaxed text-xs">
                              {item.alasan}
                            </p>
                          ) : (
                            <span className="text-slate-400 text-xs italic">
                              Masuk terjadwal rutin SMKN 1 Tegalsari
                            </span>
                          )}
                          {item.catatan && (
                            <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                              {item.catatan}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Berkas / Lampiran */}
                      <td className="py-3 px-3.5 text-center">
                        {item.izinId ? (
                          <button
                            type="button"
                            onClick={() => handleViewDocument(item.izinId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors shadow-2xs whitespace-nowrap"
                            title="Buka & Pratinjau Berkas Izin"
                          >
                            <Paperclip className="w-3 h-3 text-blue-700" />
                            <span>Lihat Berkas</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Tidak Ada</span>
                        )}
                      </td>

                      {/* Aksi */}
                      {isApprover && (
                        <td className="py-3 px-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setQuickStatusPegawai(pegawai);
                              setIsQuickStatusOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap"
                            title="Ubah Status Presensi Hari Ini"
                          >
                            <Edit2 className="w-3 h-3 text-slate-500" />
                            <span>Ubah</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        izin={previewIzin}
      />

      <QuickStatusModal
        isOpen={isQuickStatusOpen}
        onClose={() => setIsQuickStatusOpen(false)}
        pegawai={quickStatusPegawai}
        currentAttendance={attendanceList.find(a => a.pegawaiId === quickStatusPegawai?.id) || null}
        selectedDate={selectedDate}
        onStatusUpdated={loadData}
        onNavigateToIzin={onNavigateToIzin}
      />

      <CetakLaporanModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        selectedDate={selectedDate}
        pegawaiList={allPegawai}
        attendanceList={attendanceList}
      />
    </div>
  );
};
