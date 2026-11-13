import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Paperclip, 
  Trash2, 
  ExternalLink,
  Plus,
  Building,
  User
} from 'lucide-react';
import { PermintaanIzin, Pegawai, MainCategory } from '../types/attendance';
import { getStoredIzin, updateStatusIzin, deleteIzin } from '../utils/storage';
import { FilePreviewModal } from './FilePreviewModal';

interface RiwayatIzinViewProps {
  currentUser: Pegawai;
  allPegawai: Pegawai[];
  onNavigateToIzin: () => void;
  onRefreshData: () => void;
}

export const RiwayatIzinView: React.FC<RiwayatIzinViewProps> = ({
  currentUser,
  allPegawai,
  onNavigateToIzin,
  onRefreshData,
}) => {
  const [izins, setIzins] = useState<PermintaanIzin[]>(() => getStoredIzin());
  const [filterKategori, setFilterKategori] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // File preview modal
  const [previewIzin, setPreviewIzin] = useState<PermintaanIzin | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const isApprover = currentUser.role === 'admin' || currentUser.role === 'pimpinan';
  const verifikatorLabel = `${currentUser.nama} (${currentUser.role === 'pimpinan' ? 'Pimpinan' : 'Admin SDM'})`;

  const refreshList = () => {
    const list = getStoredIzin();
    setIzins(list);
    onRefreshData();
  };

  const handleApprove = (id: string) => {
    updateStatusIzin(id, 'disetujui', `Diverifikasi & disetujui oleh ${currentUser.nama}`, verifikatorLabel);
    refreshList();
  };

  const handleReject = (id: string) => {
    updateStatusIzin(id, 'ditolak', `Ditolak oleh ${currentUser.nama}`, verifikatorLabel);
    refreshList();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus arsip pengajuan izin ini?')) {
      deleteIzin(id);
      refreshList();
    }
  };

  const filteredIzins = useMemo(() => {
    return izins.filter(item => {
      // If regular teacher/staff (not admin or pimpinan), show only own leaves
      if (!isApprover && item.pegawaiId !== currentUser.id) {
        return false;
      }

      if (filterKategori !== 'all' && item.kategori !== filterKategori) {
        return false;
      }

      if (filterStatus !== 'all' && item.status !== filterStatus) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.pegawaiNama.toLowerCase().includes(q);
        const matchesNip = item.pegawaiNip.includes(q);
        const matchesAlasan = item.alasan.toLowerCase().includes(q);
        const matchesSub = item.subKategori.toLowerCase().includes(q);
        if (!matchesName && !matchesNip && !matchesAlasan && !matchesSub) {
          return false;
        }
      }

      return true;
    });
  }, [izins, currentUser, isApprover, filterKategori, filterStatus, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Riwayat Permintaan Izin, Cuti & Dinas Luar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Arsip seluruh dokumen pengajuan kehadiran dan berkas lampiran resmi SMKN 1 Tegalsari.
          </p>
        </div>

        <button
          onClick={onNavigateToIzin}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajukan Permintaan Izin Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setFilterKategori('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filterKategori === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Kategori
            </button>
            <button
              onClick={() => setFilterKategori('dinas_luar')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filterKategori === 'dinas_luar' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dinas Luar
            </button>
            <button
              onClick={() => setFilterKategori('cuti')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filterKategori === 'cuti' ? 'bg-white text-amber-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cuti Pegawai
            </button>
            <button
              onClick={() => setFilterKategori('pendidikan_pelatihan')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filterKategori === 'pendidikan_pelatihan' ? 'bg-white text-purple-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Diklat & Tubel
            </button>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="disetujui">Disetujui (Aktif)</option>
              <option value="menunggu">Menunggu Verifikasi</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, NIP, alasan izin, atau sub-kategori..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Table of Permits */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Daftar Dokumen Permohonan Izin
            </span>
            <span className="text-xs text-slate-500">
              ({filteredIzins.length} berkas tercatat)
            </span>
          </div>
        </div>

        {filteredIzins.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Belum ada riwayat izin yang ditemukan.</p>
            <p className="text-xs text-slate-500 mt-1">Gunakan tombol "Ajukan Permintaan Izin Baru" untuk menambahkan izin.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-3.5 w-12 text-center">No</th>
                  <th className="py-3 px-3.5 min-w-[220px]">Pegawai Pemohon</th>
                  <th className="py-3 px-3.5 min-w-[190px]">Kategori & Sub-Kategori</th>
                  <th className="py-3 px-3.5 min-w-[170px]">Periode Tanggal</th>
                  <th className="py-3 px-3.5 min-w-[250px]">Alasan Permintaan Izin</th>
                  <th className="py-3 px-3.5 text-center w-28">Berkas Lampiran</th>
                  <th className="py-3 px-3.5 text-center w-28">Status</th>
                  <th className="py-3 px-3.5 text-center w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredIzins.map((item, index) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* No */}
                      <td className="py-3 px-3.5 text-center font-mono text-slate-500 text-[11px]">
                        {index + 1}
                      </td>

                      {/* Pemohon */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 leading-tight">
                          {item.pegawaiNama}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          NIP. {item.pegawaiNip}
                        </div>
                        <div className="text-[11px] text-slate-600 truncate max-w-[220px]">
                          {item.pegawaiJabatan}
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="py-3 px-3.5">
                        <span className="font-bold text-slate-900 block">
                          {item.subKategori}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                          {item.kategori.replace('_', ' ')}
                        </span>
                        {item.tujuanLokasi && (
                          <div className="text-[11px] text-blue-700 mt-0.5 flex items-center gap-1">
                            <span className="truncate max-w-[170px]">{item.tujuanLokasi}</span>
                          </div>
                        )}
                      </td>

                      {/* Periode */}
                      <td className="py-3 px-3.5 font-mono text-slate-800">
                        <div className="font-semibold text-xs text-slate-900">
                          {item.tanggalMulai}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          s/d {item.tanggalSelesai}
                        </div>
                        <div className="text-[11px] font-sans font-medium text-blue-900 mt-0.5">
                          {item.jumlahHari} Hari Kerja
                        </div>
                      </td>

                      {/* Alasan */}
                      <td className="py-3 px-3.5">
                        <p className="text-slate-800 leading-relaxed text-xs max-w-[260px]">
                          {item.alasan}
                        </p>
                        {item.nomorSurat && (
                          <span className="text-[10px] text-slate-500 font-mono block mt-1">
                            No. SK: {item.nomorSurat}
                          </span>
                        )}
                        {item.catatanAdmin && (
                          <span className={`text-[10px] block mt-0.5 italic ${
                            item.status === 'ditolak' ? 'text-rose-700' : 'text-emerald-700'
                          }`}>
                            Catatan: {item.catatanAdmin}
                          </span>
                        )}
                        {item.diverifikasiOleh && (
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            Verifikator: {item.diverifikasiOleh}
                            {item.tanggalVerifikasi ? ` · ${item.tanggalVerifikasi}` : ''}
                          </span>
                        )}
                      </td>

                      {/* Berkas */}
                      <td className="py-3 px-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewIzin(item);
                            setIsPreviewOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors shadow-2xs whitespace-nowrap"
                          title="Buka Dokumen Resmi"
                        >
                          <Paperclip className="w-3 h-3 text-blue-700" />
                          <span>Lihat Berkas</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 text-center">
                        {item.status === 'disetujui' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                            <CheckCircle className="w-3 h-3" />
                            <span>Disetujui</span>
                          </span>
                        )}
                        {item.status === 'menunggu' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                            <Clock className="w-3 h-3" />
                            <span>Menunggu</span>
                          </span>
                        )}
                        {item.status === 'ditolak' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200 whitespace-nowrap">
                            <XCircle className="w-3 h-3" />
                            <span>Ditolak</span>
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isApprover && item.status === 'menunggu' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(item.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors whitespace-nowrap"
                                title="Setujui Pengajuan Izin"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Setujui</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(item.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-md transition-colors whitespace-nowrap"
                                title="Tolak Pengajuan Izin"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Tolak</span>
                              </button>
                            </>
                          )}
                          {isApprover && (
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                              title="Hapus Pengajuan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {!isApprover && (
                            <span className="text-[11px] text-slate-400">
                              {item.status === 'menunggu' ? 'Menunggu' : 'Selesai'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        izin={previewIzin}
      />
    </div>
  );
};
