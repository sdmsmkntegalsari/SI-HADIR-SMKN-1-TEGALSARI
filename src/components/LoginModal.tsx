import React, { useState } from 'react';
import { X, Lock, KeyRound, User, AlertCircle, CheckCircle2, Shield, ArrowRight } from 'lucide-react';
import { Pegawai } from '../types/attendance';
import { authenticateUser } from '../utils/storage';
import { INFO_SEKOLAH } from '../data/mockData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  allPegawai: Pegawai[];
  onLoginSuccess: (user: Pegawai) => void;
  onOpenCreateAccount: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  allPegawai,
  onLoginSuccess,
  onOpenCreateAccount,
}) => {
  if (!isOpen) return null;

  const [nipInput, setNipInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nipInput.trim()) {
      setErrorMsg('Harap masukkan NIP Anda.');
      return;
    }

    if (!passwordInput.trim()) {
      setErrorMsg('Harap masukkan Password (default adalah NIP Anda).');
      return;
    }

    setIsLoggingIn(true);
    const user = authenticateUser(nipInput, passwordInput);
    setIsLoggingIn(false);

    if (user) {
      onLoginSuccess(user);
      onClose();
    } else {
      setErrorMsg('NIP atau Password salah. Pastikan memasukkan NIP yang terdaftar (Password default = NIP).');
    }
  };

  const handleQuickSelect = (account: Pegawai) => {
    setNipInput(account.nip);
    setPasswordInput(account.nip);
    setErrorMsg('');
  };

  const adminAcc = allPegawai.find(p => p.role === 'admin') || allPegawai[0];
  const kepsekAcc = allPegawai.find(p => p.jabatan.includes('Kepala Sekolah')) || allPegawai[1];
  const guruAcc = allPegawai.find(p => p.unitKerja.includes('RPL')) || allPegawai[6];
  const tendikAcc = allPegawai.find(p => p.tipe === 'pegawai') || allPegawai[22];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header with School Crest */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-lg font-black text-blue-200 border border-white/20">
              SMK
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300 block">
                SI-HADIR · SMKN 1 TEGALSARI
              </span>
              <h2 className="text-lg font-bold text-white leading-tight">
                Portal Presensi Guru & Pegawai
              </h2>
            </div>
          </div>
          <p className="text-xs text-blue-100/80 mt-1">
            Silakan login menggunakan NIP Anda. Password default akun adalah NIP masing-masing.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Induk Pegawai (NIP)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={nipInput}
                  onChange={(e) => setNipInput(e.target.value)}
                  placeholder="Contoh: 198001012005011001"
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password (NIP)
                </label>
                <span className="text-[11px] text-blue-700 font-medium">
                  Default = NIP Anda
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan Password / NIP"
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 active:bg-blue-950 rounded-lg transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              <span>{isLoggingIn ? 'Memverifikasi...' : 'Masuk Aplikasi Presensi'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Buat Akun Baru Menu Button */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-blue-950">Belum memiliki akun akses?</p>
              <p className="text-[11px] text-blue-800/80">Daftarkan akun baru sebagai Admin atau Pimpinan</p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCreateAccount();
              }}
              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              + Buat Akun
            </button>
          </div>

          {/* Quick Demo Selector */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Pilih Akun Uji Coba Cepat (Sekali Klik):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickSelect(adminAcc)}
                className="p-2 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-lg text-left transition-colors"
              >
                <p className="font-bold text-slate-900 text-[11px] truncate">{adminAcc.nama}</p>
                <p className="text-[10px] text-blue-700 font-semibold">Admin SDM (Akses Penuh)</p>
                <p className="text-[10px] text-slate-400 font-mono">NIP: {adminAcc.nip.slice(0, 10)}...</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect(kepsekAcc)}
                className="p-2 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 rounded-lg text-left transition-colors"
              >
                <p className="font-bold text-slate-900 text-[11px] truncate">{kepsekAcc.nama}</p>
                <p className="text-[10px] text-amber-800 font-semibold">Pimpinan (Kepala Sekolah)</p>
                <p className="text-[10px] text-slate-400 font-mono">NIP: {kepsekAcc.nip.slice(0, 10)}...</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect(guruAcc)}
                className="p-2 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-lg text-left transition-colors"
              >
                <p className="font-bold text-slate-900 text-[11px] truncate">{guruAcc.nama}</p>
                <p className="text-[10px] text-slate-600 font-semibold">Guru Produktif RPL</p>
                <p className="text-[10px] text-slate-400 font-mono">NIP: {guruAcc.nip.slice(0, 10)}...</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect(tendikAcc)}
                className="p-2 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-lg text-left transition-colors"
              >
                <p className="font-bold text-slate-900 text-[11px] truncate">{tendikAcc.nama}</p>
                <p className="text-[10px] text-slate-600 font-semibold">Staf Tata Usaha</p>
                <p className="text-[10px] text-slate-400 font-mono">NIP: {tendikAcc.nip.slice(0, 10)}...</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
