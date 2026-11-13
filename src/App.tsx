import React, { useState, useEffect } from 'react';
import { 
  getCurrentUser, 
  saveCurrentUser, 
  getStoredPegawai 
} from './utils/storage';
import { Pegawai, Role } from './types/attendance';
import { HeaderNavbar } from './components/HeaderNavbar';
import { DashboardView } from './components/DashboardView';
import { FormPengajuanIzin } from './components/FormPengajuanIzin';
import { RiwayatIzinView } from './components/RiwayatIzinView';
import { RekapitulasiView } from './components/RekapitulasiView';
import { KelolaPegawaiView } from './components/KelolaPegawaiView';
import { LoginModal } from './components/LoginModal';
import { ModalBuatAkun } from './components/ModalBuatAkun';
import { INFO_SEKOLAH } from './data/mockData';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Pegawai | null>(() => getCurrentUser());
  const [allPegawai, setAllPegawai] = useState<Pegawai[]>(() => getStoredPegawai());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'izin' | 'riwayat' | 'rekap' | 'pegawai'>('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState<boolean>(false);
  const [createAccountInitialRole, setCreateAccountInitialRole] = useState<Role>('admin');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Refresh pegawai list whenever updated
  const refreshAllData = () => {
    setAllPegawai(getStoredPegawai());
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSwitchUser = (user: Pegawai) => {
    saveCurrentUser(user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    saveCurrentUser(null);
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (user: Pegawai) => {
    setCurrentUser(user);
  };

  const handleOpenCreateAccount = (role: Role = 'admin') => {
    setCreateAccountInitialRole(role);
    setIsCreateAccountModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
      {/* Header Navigation Bar */}
      <HeaderNavbar
        currentUser={currentUser}
        allPegawai={allPegawai}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenCreateAccount={() => handleOpenCreateAccount('admin')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser || allPegawai[0]}
            allPegawai={allPegawai}
            onNavigateToIzin={() => setActiveTab('izin')}
          />
        )}

        {activeTab === 'izin' && (
          <FormPengajuanIzin
            currentUser={currentUser || allPegawai[0]}
            allPegawai={allPegawai}
            onSuccessSubmit={() => {
              refreshAllData();
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'riwayat' && (
          <RiwayatIzinView
            currentUser={currentUser || allPegawai[0]}
            allPegawai={allPegawai}
            onNavigateToIzin={() => setActiveTab('izin')}
            onRefreshData={refreshAllData}
          />
        )}

        {activeTab === 'rekap' && (
          <RekapitulasiView
            allPegawai={allPegawai}
          />
        )}

        {activeTab === 'pegawai' && (
          <KelolaPegawaiView
            currentUser={currentUser || allPegawai[0]}
            allPegawai={allPegawai}
            onRefreshData={refreshAllData}
            onOpenCreateAccount={handleOpenCreateAccount}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-1">
          <p className="text-slate-600 font-medium text-xs">
            © 2026 {INFO_SEKOLAH.namaLengkap}. Hak Cipta Dilindungi.
          </p>
          <p className="text-[11px] text-slate-500">
            {INFO_SEKOLAH.alamat} | NPSN: {INFO_SEKOLAH.npsn}
          </p>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        allPegawai={allPegawai}
        onLoginSuccess={handleLoginSuccess}
        onOpenCreateAccount={() => handleOpenCreateAccount('admin')}
      />

      {/* Modal Buat Akun Khusus Admin & Pimpinan */}
      <ModalBuatAkun
        isOpen={isCreateAccountModalOpen}
        onClose={() => setIsCreateAccountModalOpen(false)}
        onAccountCreated={(newAcc) => {
          refreshAllData();
          if (!currentUser) {
            setCurrentUser(newAcc);
          }
        }}
        initialRole={createAccountInitialRole}
      />
    </div>
  );
}
