import React from 'react';
import { X, Download, Printer, FileText, CheckCircle, Building, Calendar, User } from 'lucide-react';
import { PermintaanIzin } from '../types/attendance';
import { INFO_SEKOLAH } from '../data/mockData';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  izin: PermintaanIzin | null;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, onClose, izin }) => {
  if (!isOpen || !izin) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Lampiran Berkas Permintaan Izin
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {izin.berkasNama || 'Dokumen_Lampiran_Resmi.pdf'} · {izin.berkasSize || '1.4 MB'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Berkas</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Document Viewer with Official SMKN 1 Tegalsari Letterhead */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 max-w-2xl mx-auto font-sans text-slate-900">
            {/* Kop Surat Resmi */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pemerintah Provinsi Jawa Timur · Dinas Pendidikan
              </h4>
              <h3 className="text-sm font-bold uppercase text-slate-800">
                {INFO_SEKOLAH.cabangDinas}
              </h3>
              <h2 className="text-xl font-extrabold uppercase text-blue-950 tracking-tight mt-1">
                {INFO_SEKOLAH.nama}
              </h2>
              <p className="text-[11px] text-slate-600 mt-1">
                {INFO_SEKOLAH.alamat}
              </p>
              <p className="text-[11px] text-slate-600">
                Telp: {INFO_SEKOLAH.telepon} · Pos-el: {INFO_SEKOLAH.email} · Laman: {INFO_SEKOLAH.website}
              </p>
            </div>

            {/* Document Title */}
            <div className="text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                SURAT KETERANGAN / LAMPIRAN RESMI
              </span>
              <h3 className="text-base font-bold text-slate-900 underline underline-offset-4 mt-0.5">
                {izin.subKategori.toUpperCase()}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Nomor: {izin.nomorSurat || `800/IZN-${izin.id.slice(-6)}/SMKN1TGS/2026`}
              </p>
            </div>

            {/* Content Details */}
            <div className="text-xs space-y-3 leading-relaxed text-slate-800">
              <p>
                Yang bertanda tangan di bawah ini menerangkan bahwa Pegawai SMKN 1 Tegalsari berikut:
              </p>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Nama Lengkap</span>
                  <span className="col-span-2 font-bold text-slate-900">: {izin.pegawaiNama}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">NIP</span>
                  <span className="col-span-2 font-mono text-slate-800">: {izin.pegawaiNip}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Jabatan / Tugas</span>
                  <span className="col-span-2 text-slate-800">: {izin.pegawaiJabatan}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Unit Organisasi</span>
                  <span className="col-span-2 text-slate-800">: {INFO_SEKOLAH.nama}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p>
                  Telah diberikan persetujuan izin kehadiran dengan rincian sebagai berikut:
                </p>
                <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Kategori Izin:</span>
                      <span className="font-semibold text-slate-900 text-xs">{izin.subKategori}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Status: Disetujui
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Tanggal Izin:</span>
                      <span className="font-medium text-slate-900 font-mono text-xs">
                        {izin.tanggalMulai} s/d {izin.tanggalSelesai}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Durasi Waktu:</span>
                      <span className="font-medium text-slate-900 text-xs">{izin.jumlahHari} Hari Kerja</span>
                    </div>
                  </div>
                  {izin.tujuanLokasi && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500 block">Lokasi / Instansi Tujuan:</span>
                      <span className="font-medium text-slate-900 text-xs">{izin.tujuanLokasi}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500 block">Uraian Alasan / Keperluan:</span>
                    <p className="text-slate-800 italic bg-slate-50 p-2.5 rounded text-xs mt-1 border border-slate-100">
                      "{izin.alasan}"
                    </p>
                  </div>
                </div>
              </div>

              {izin.catatanAdmin && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px]">
                  <strong>Catatan Verifikasi SDM:</strong> {izin.catatanAdmin}
                </div>
              )}

              {/* Tanda Tangan */}
              <div className="mt-8 pt-4 flex justify-between items-end text-xs">
                <div>
                  <p className="text-slate-500 text-[11px]">Diajukan oleh:</p>
                  <p className="font-semibold text-slate-900 mt-12">{izin.pegawaiNama}</p>
                  <p className="text-slate-500 font-mono text-[11px]">NIP. {izin.pegawaiNip}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-600">Tegalsari, {izin.tanggalPengajuan.slice(0, 10)}</p>
                  <p className="text-slate-600 font-medium">Mengetahui, Kepala Sekolah</p>
                  <p className="font-bold text-slate-900 mt-12 underline">{INFO_SEKOLAH.kepalaSekolah}</p>
                  <p className="text-slate-500 font-mono text-[11px]">NIP. {INFO_SEKOLAH.nipKepalaSekolah}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-white">
          <div className="text-xs text-slate-500">
            Terverifikasi Sistem Presensi Terpadu SI-HADIR SMKN 1 Tegalsari
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
};
