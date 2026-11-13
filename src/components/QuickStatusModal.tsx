import React, { useState } from 'react';
import { X, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { Pegawai, StatusKehadiranHarian, MainCategory, SubCategory } from '../types/attendance';
import { saveOverride, removeOverride } from '../utils/storage';

interface QuickStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  pegawai: Pegawai | null;
  currentAttendance: StatusKehadiranHarian | null;
  selectedDate: string;
  onStatusUpdated: () => void;
  onNavigateToIzin: () => void;
}

export const QuickStatusModal: React.FC<QuickStatusModalProps> = ({
  isOpen,
  onClose,
  pegawai,
  currentAttendance,
  selectedDate,
  onStatusUpdated,
  onNavigateToIzin,
}) => {
  if (!isOpen || !pegawai || !currentAttendance) return null;

  const [selectedStatus, setSelectedStatus] = useState<MainCategory>(currentAttendance.status);
  const [alasanInput, setAlasanInput] = useState<string>(currentAttendance.alasan || '');

  const handleSave = () => {
    let sub: SubCategory = 'Terjadwal Masuk';
    if (selectedStatus === 'tidak_hadir') {
      sub = 'Tanpa Keterangan / Alpa';
    } else if (selectedStatus === 'hadir') {
      sub = 'Terjadwal Masuk';
    }

    saveOverride({
      id: `override-${pegawai.id}-${selectedDate}`,
      tanggal: selectedDate,
      pegawaiId: pegawai.id,
      status: selectedStatus,
      subKategori: sub,
      alasan: alasanInput || (selectedStatus === 'tidak_hadir' ? 'Tanpa keterangan resmi' : 'Masuk terjadwal'),
      catatan: 'Diselaraskan oleh Admin SDM / Pimpinan',
    });

    onStatusUpdated();
    onClose();
  };

  const handleResetToAuto = () => {
    removeOverride(selectedDate, pegawai.id);
    onStatusUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ubah Status Kehadiran Cepat</h3>
            <p className="text-[11px] text-slate-500 font-mono">
              Tanggal: {selectedDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <p className="font-bold text-slate-900">{pegawai.nama}</p>
            <p className="text-slate-500 font-mono text-[11px]">NIP: {pegawai.nip}</p>
            <p className="text-slate-600 text-[11px] mt-0.5">{pegawai.jabatan}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih Status Kehadiran
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedStatus('hadir')}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-colors ${
                  selectedStatus === 'hadir'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Hadir (Masuk)
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('tidak_hadir')}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-colors ${
                  selectedStatus === 'tidak_hadir'
                    ? 'border-rose-600 bg-rose-50 text-rose-900 ring-1 ring-rose-600'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Tidak Hadir (Alpa)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan / Catatan
            </label>
            <input
              type="text"
              value={alasanInput}
              onChange={(e) => setAlasanInput(e.target.value)}
              placeholder="Keterangan tambahan..."
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
            />
          </div>

          <div className="pt-2 border-t border-slate-200">
            <p className="text-[11px] text-slate-500 mb-2">
              Untuk Dinas Luar, Cuti, atau Diklat dengan lampiran berkas resmi:
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToIzin();
              }}
              className="w-full flex items-center justify-between p-2.5 bg-blue-50 hover:bg-blue-100/80 text-blue-900 rounded-lg border border-blue-200 text-xs font-semibold transition-colors"
            >
              <span>Ajukan Surat Izin / Dinas / Cuti Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={handleResetToAuto}
            className="text-[11px] text-slate-500 hover:text-slate-800 underline underline-offset-2"
          >
            Reset Otomatis
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
