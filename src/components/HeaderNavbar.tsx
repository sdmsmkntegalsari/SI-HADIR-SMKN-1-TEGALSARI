import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  FileCheck2, 
  CalendarDays, 
  UserCheck, 
  Send 
} from 'lucide-react';
import { Pegawai } from '../types/attendance';

interface HeaderNavbarProps {
  currentUser: Pegawai | null;
  allPegawai: Pegawai[];
  activeTab: 'dashboard' | 'izin' | 'riwayat' | 'rekap' | 'pegawai';
  onSelectTab: (tab: 'dashboard' | 'izin' | 'riwayat' | 'rekap' | 'pegawai') => void;
  onSwitchUser: (user: Pegawai) => void;
  onLogout: () => void;
  onOpenLogin: () => void;
  onOpenCreateAccount: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentUser,
  allPegawai,
  activeTab,
  onSelectTab,
  onSwitchUser,
  onLogout,
  onOpenLogin,
  onOpenCreateAccount,
}) => {
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);

  // Group quick accounts for quick switcher
  const adminAccount = allPegawai.find(p => p.role === 'admin') || allPegawai[0];
  const kepsekAccount = allPegawai.find(p => p.role === 'pimpinan' || p.jabatan.includes('Kepala Sekolah')) || allPegawai[1];
  const wakaKurikulum = allPegawai.find(p => p.jabatan.includes('Kurikulum')) || allPegawai[2];
  const guruRpl = allPegawai.find(p => p.unitKerja.includes('RPL')) || allPegawai[6];
  const stafTU = allPegawai.find(p => p.tipe === 'pegawai') || allPegawai[21];

  const quickAccounts = [adminAccount, kepsekAccount, wakaKurikulum, guruRpl, stafTU].filter(Boolean);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single element brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold shadow-xs">
              <span className="text-sm font-extrabold tracking-tighter">SMK</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap leading-none">
                SI-HADIR SMKN 1 TEGALSARI
              </span>
              <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap leading-none mt-1">
                Sistem Presensi Guru & Pegawai
              </span>
            </div>
          </div>

          {/* Zone 2: 4-5 Clean single-line navigation links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => onSelectTab('izin')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                activeTab === 'izin'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ajukan Izin</span>
            </button>

            <button
              onClick={() => onSelectTab('riwayat')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'riwayat'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Riwayat Berkas
            </button>

            <button
              onClick={() => onSelectTab('rekap')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'rekap'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Rekapitulasi
            </button>

            <button
              onClick={() => onSelectTab('pegawai')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'pegawai'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Pegawai & Akun
            </button>
          </nav>

          {/* Zone 3: 1 primary action / Account menu with quick test switch */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Direct Buat Akun button for Admin & Pimpinan */}
            <button
              onClick={onOpenCreateAccount}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap"
              title="Buat Akun Akses Web untuk Admin atau Pimpinan"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-800" />
              <span>+ Buat Akun</span>
            </button>

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
                  className="flex items-center gap-2.5 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 transition-colors text-left"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white ${
                    currentUser.role === 'admin' ? 'bg-blue-900' : currentUser.role === 'pimpinan' ? 'bg-amber-800' : 'bg-slate-700'
                  }`}>
                    {currentUser.nama.charAt(0)}
                  </div>
                  <div className="hidden sm:block leading-tight">
                    <p className="font-semibold text-slate-900 truncate max-w-[130px]">
                      {currentUser.nama}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      NIP: {currentUser.nip.slice(0, 8)}...
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Account Switcher Dropdown */}
                {showSwitchDropdown && (
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1"
                    onMouseLeave={() => setShowSwitchDropdown(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Akun Saat Ini
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          currentUser.role === 'admin' 
                            ? 'bg-blue-100 text-blue-800' 
                            : currentUser.role === 'pimpinan'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {currentUser.role === 'admin' 
                            ? 'ADMIN SDM' 
                            : currentUser.role === 'pimpinan'
                            ? 'PIMPINAN'
                            : currentUser.tipe.toUpperCase()}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-xs mt-1">
                        {currentUser.gelarDepan ? `${currentUser.gelarDepan} ` : ''}
                        {currentUser.nama}
                        {currentUser.gelarBelakang ? `, ${currentUser.gelarBelakang}` : ''}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">NIP: {currentUser.nip}</p>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">{currentUser.jabatan}</p>
                    </div>

                    <div className="p-2 border-b border-slate-100">
                      <button
                        onClick={() => {
                          setShowSwitchDropdown(false);
                          onOpenCreateAccount();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-800" />
                        <span>+ Buat Akun Admin / Pimpinan</span>
                      </button>
                    </div>

                    <div className="py-1">
                      <div className="px-3.5 py-1 text-[11px] font-semibold text-slate-400 uppercase">
                        Ganti Akun Cepat (NIP):
                      </div>
                      {quickAccounts.map(account => (
                        <button
                          key={account.id}
                          onClick={() => {
                            onSwitchUser(account);
                            setShowSwitchDropdown(false);
                          }}
                          className={`w-full text-left px-3.5 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between transition-colors ${
                            account.id === currentUser.id ? 'bg-blue-50/70 text-blue-900 font-semibold' : 'text-slate-700'
                          }`}
                        >
                          <div className="truncate mr-2">
                            <span className="block truncate font-medium">{account.nama}</span>
                            <span className="text-[10px] text-slate-500 font-mono">NIP. {account.nip}</span>
                          </div>
                          <span className={`text-[10px] font-medium shrink-0 px-1 rounded ${
                            account.role === 'admin' 
                              ? 'bg-blue-100 text-blue-800' 
                              : account.role === 'pimpinan'
                              ? 'bg-amber-100 text-amber-800'
                              : 'text-slate-500'
                          }`}>
                            {account.role === 'admin' ? 'Admin' : account.role === 'pimpinan' ? 'Pimpinan' : account.tipe}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-1.5 mt-1 border-t border-slate-100 px-2">
                      <button
                        onClick={() => {
                          setShowSwitchDropdown(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar Akun (Ganti NIP)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 shadow-xs"
              >
                Masuk NIP
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Subnav */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-slate-50 px-2 py-1.5 text-xs">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`px-2.5 py-1 rounded font-medium ${
            activeTab === 'dashboard' ? 'bg-blue-100 text-blue-900 font-bold' : 'text-slate-600'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('izin')}
          className={`px-2.5 py-1 rounded font-medium ${
            activeTab === 'izin' ? 'bg-blue-100 text-blue-900 font-bold' : 'text-slate-600'
          }`}
        >
          Ajukan Izin
        </button>
        <button
          onClick={() => onSelectTab('riwayat')}
          className={`px-2.5 py-1 rounded font-medium ${
            activeTab === 'riwayat' ? 'bg-blue-100 text-blue-900 font-bold' : 'text-slate-600'
          }`}
        >
          Riwayat
        </button>
        <button
          onClick={() => onSelectTab('rekap')}
          className={`px-2.5 py-1 rounded font-medium ${
            activeTab === 'rekap' ? 'bg-blue-100 text-blue-900 font-bold' : 'text-slate-600'
          }`}
        >
          Rekap
        </button>
        <button
          onClick={() => onSelectTab('pegawai')}
          className={`px-2.5 py-1 rounded font-medium ${
            activeTab === 'pegawai' ? 'bg-blue-100 text-blue-900 font-bold' : 'text-slate-600'
          }`}
        >
          Pegawai
        </button>
      </div>
    </header>
  );
};
