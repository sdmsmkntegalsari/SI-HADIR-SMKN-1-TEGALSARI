import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Pegawai, StatusKehadiranHarian } from '../types/attendance';
import { INFO_SEKOLAH } from '../data/mockData';

interface CetakLaporanModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  pegawaiList: Pegawai[];
  attendanceList: StatusKehadiranHarian[];
}

export const CetakLaporanModal: React.FC<CetakLaporanModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  pegawaiList,
  attendanceList,
}) => {
  if (!isOpen) return null;

  // Format date to Indonesian prose
  const formatDateIndo = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Stats calculation
  const total = attendanceList.length;
  const hadir = attendanceList.filter(a => a.status === 'hadir').length;
  const dinas = attendanceList.filter(a => a.status === 'dinas_luar').length;
  const cuti = attendanceList.filter(a => a.status === 'cuti').length;
  const diklat = attendanceList.filter(a => a.status === 'pendidikan_pelatihan').length;
  const alpa = attendanceList.filter(a => a.status === 'tidak_hadir').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        {/* Header toolbar */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Pratinjau Cetak Laporan Presensi Resmi SMKN 1 Tegalsari
            </h3>
            <p className="text-xs text-slate-500">
              Format standar Cabang Dinas Pendidikan Wilayah Banyuwangi
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200">
          <div className="bg-white p-8 sm:p-12 shadow-md rounded-lg max-w-4xl mx-auto text-slate-900 font-sans text-xs">
            {/* Kop Surat Resmi */}
            <div className="text-center border-b-[3px] border-double border-slate-900 pb-3 mb-6">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                Pemerintah Provinsi Jawa Timur · Dinas Pendidikan
              </h4>
              <h3 className="text-xs font-bold uppercase text-slate-900">
                {INFO_SEKOLAH.cabangDinas}
              </h3>
              <h2 className="text-lg font-black uppercase tracking-tight text-blue-950 mt-0.5">
                {INFO_SEKOLAH.nama}
              </h2>
              <p className="text-[10px] text-slate-600 mt-0.5">
                NPSN: {INFO_SEKOLAH.npsn} · {INFO_SEKOLAH.alamat}
              </p>
              <p className="text-[10px] text-slate-600">
                Telp: {INFO_SEKOLAH.telepon} · Pos-el: {INFO_SEKOLAH.email} · Website: {INFO_SEKOLAH.website}
              </p>
            </div>

            {/* Title */}
            <div className="text-center mb-5">
              <h3 className="text-sm font-bold uppercase tracking-wide underline underline-offset-2">
                DAFTAR REKAPITULASI PRESENSI HARIAN GURU & PEGAWAI
              </h3>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                Hari / Tanggal: {formatDateIndo(selectedDate)}
              </p>
            </div>

            {/* Ringkasan Kehadiran */}
            <div className="grid grid-cols-6 gap-2 mb-4 p-2.5 bg-slate-50 border border-slate-200 text-center text-[10px]">
              <div>
                <span className="text-slate-500 block">Total Pegawai</span>
                <span className="font-bold text-xs">{total}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Hadir</span>
                <span className="font-bold text-xs text-emerald-700">{hadir}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Dinas Luar</span>
                <span className="font-bold text-xs text-blue-700">{dinas}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Cuti</span>
                <span className="font-bold text-xs text-amber-700">{cuti}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Diklat/Tubel</span>
                <span className="font-bold text-xs text-purple-700">{diklat}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tidak Hadir</span>
                <span className="font-bold text-xs text-rose-700">{alpa}</span>
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-300 rounded-xs overflow-hidden">
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase">
                    <th className="py-2 px-2 border-r border-slate-300 text-center w-8">No</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-left">Nama & NIP</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-left w-36">Jabatan / Gol.</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-center w-28">Status Kehadiran</th>
                    <th className="py-2 px-2 text-left">Keterangan / Alasan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {pegawaiList.map((p, index) => {
                    const att = attendanceList.find(a => a.pegawaiId === p.id);
                    const statusStr = att ? att.subKategori : 'Terjadwal Masuk';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center font-mono">{index + 1}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300">
                          <p className="font-bold text-slate-900 leading-tight">
                            {p.gelarDepan ? `${p.gelarDepan} ` : ''}
                            {p.nama}
                            {p.gelarBelakang ? `, ${p.gelarBelakang}` : ''}
                          </p>
                          <p className="font-mono text-slate-500 text-[9px] mt-0.5">NIP. {p.nip}</p>
                        </td>
                        <td className="py-1.5 px-2 border-r border-slate-300">
                          <p className="truncate leading-tight">{p.jabatan}</p>
                          <p className="text-slate-500 text-[9px] mt-0.5">{p.pangkatGolongan}</p>
                        </td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center font-medium">
                          {statusStr}
                        </td>
                        <td className="py-1.5 px-2 text-slate-600">
                          {att?.alasan || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tanda Tangan */}
            <div className="mt-8 pt-4 flex justify-between items-end text-xs">
              <div>
                <p className="text-slate-600">Koordinator Kepegawaian & SDM,</p>
                <p className="font-bold text-slate-900 mt-14 underline">{INFO_SEKOLAH.koordinatorSdm}</p>
                <p className="text-slate-500 font-mono text-[10px]">NIP. {INFO_SEKOLAH.nipKoordinatorSdm}</p>
              </div>

              <div className="text-right">
                <p className="text-slate-600">Tegalsari, {formatDateIndo(selectedDate)}</p>
                <p className="text-slate-600">Kepala SMKN 1 Tegalsari,</p>
                <p className="font-bold text-slate-900 mt-14 underline">{INFO_SEKOLAH.kepalaSekolah}</p>
                <p className="text-slate-500 font-mono text-[10px]">NIP. {INFO_SEKOLAH.nipKepalaSekolah}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
