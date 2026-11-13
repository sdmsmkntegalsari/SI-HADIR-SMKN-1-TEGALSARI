import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  KeyRound, 
  Edit, 
  Trash2, 
  CheckCircle, 
  ShieldCheck, 
  Building, 
  X,
  Phone,
  Mail,
  Crown,
  ChevronDown
} from 'lucide-react';
import { Pegawai, Role, EmployeeType } from '../types/attendance';
import { savePegawaiList, changeUserPassword, updatePegawaiRole } from '../utils/storage';

interface KelolaPegawaiViewProps {
  currentUser: Pegawai;
  allPegawai: Pegawai[];
  onRefreshData: () => void;
  onOpenCreateAccount: (initialRole?: Role) => void;
}

export const KelolaPegawaiView: React.FC<KelolaPegawaiViewProps> = ({
  currentUser,
  allPegawai,
  onRefreshData,
  onOpenCreateAccount,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'pimpinan' | 'guru' | 'pegawai'>('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null);
  
  // Form State
  const [nama, setNama] = useState<string>('');
  const [gelarDepan, setGelarDepan] = useState<string>('');
  const [gelarBelakang, setGelarBelakang] = useState<string>('');
  const [nip, setNip] = useState<string>('');
  const [jabatan, setJabatan] = useState<string>('');
  const [unitKerja, setUnitKerja] = useState<string>('');
  const [pangkatGolongan, setPangkatGolongan] = useState<string>('');
  const [tipe, setTipe] = useState<EmployeeType>('guru');
  const [email, setEmail] = useState<string>('');
  const [noHp, setNoHp] = useState<string>('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');

  // Success message toast
  const [successToast, setSuccessToast] = useState<string>('');

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleOpenAdd = () => {
    setEditingPegawai(null);
    setNama('');
    setGelarDepan('');
    setGelarBelakang('');
    setNip('');
    setJabatan('');
    setUnitKerja('');
    setPangkatGolongan('Penata Muda / III/a');
    setTipe('guru');
    setEmail('');
    setNoHp('');
    setJenisKelamin('L');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Pegawai) => {
    setEditingPegawai(p);
    setNama(p.nama);
    setGelarDepan(p.gelarDepan || '');
    setGelarBelakang(p.gelarBelakang || '');
    setNip(p.nip);
    setJabatan(p.jabatan);
    setUnitKerja(p.unitKerja);
    setPangkatGolongan(p.pangkatGolongan);
    setTipe(p.tipe);
    setEmail(p.email);
    setNoHp(p.noHp);
    setJenisKelamin(p.jenisKelamin);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !nip.trim() || !jabatan.trim()) {
      alert('Nama, NIP, dan Jabatan wajib diisi.');
      return;
    }

    const currentList = [...allPegawai];

    if (editingPegawai) {
      // Edit existing
      const updatedList = currentList.map(p => {
        if (p.id === editingPegawai.id) {
          return {
            ...p,
            nama: nama.trim(),
            gelarDepan: gelarDepan.trim() || undefined,
            gelarBelakang: gelarBelakang.trim() || undefined,
            nip: nip.trim(),
            jabatan: jabatan.trim(),
            unitKerja: unitKerja.trim() || 'SMKN 1 Tegalsari',
            pangkatGolongan: pangkatGolongan.trim(),
            tipe,
            email: email.trim() || `${nip.trim()}@smkn1tegalsari.sch.id`,
            noHp: noHp.trim() || '081234567890',
            jenisKelamin,
          };
        }
        return p;
      });
      savePegawaiList(updatedList);
      showNotification(`Data pegawai ${nama} berhasil diperbarui.`);
    } else {
      // Create new
      const newP: Pegawai = {
        id: `peg-${Date.now()}`,
        nip: nip.trim(),
        nama: nama.trim(),
        gelarDepan: gelarDepan.trim() || undefined,
        gelarBelakang: gelarBelakang.trim() || undefined,
        jabatan: jabatan.trim(),
        unitKerja: unitKerja.trim() || 'SMKN 1 Tegalsari',
        pangkatGolongan: pangkatGolongan.trim(),
        tipe,
        email: email.trim() || `${nip.trim()}@smkn1tegalsari.sch.id`,
        noHp: noHp.trim() || '081234567890',
        jenisKelamin,
        role: 'guru',
        statusAktif: true,
      };
      savePegawaiList([...currentList, newP]);
      showNotification(`Guru/Pegawai baru ${nama} berhasil didaftarkan.`);
    }

    setIsModalOpen(false);
    onRefreshData();
  };

  const handleResetPassword = (p: Pegawai) => {
    if (window.confirm(`Reset password ${p.nama} kembali ke NIP (${p.nip})?`)) {
      changeUserPassword(p.nip, p.nip);
      showNotification(`Password untuk NIP ${p.nip} telah direset sama dengan NIP.`);
    }
  };

  const handleChangeRole = (pegawaiId: string, newRole: Role) => {
    updatePegawaiRole(pegawaiId, newRole);
    onRefreshData();
    showNotification('Hak akses peran akun berhasil diperbarui.');
  };

  const filteredPegawai = useMemo(() => {
    return allPegawai.filter(p => {
      if (filterRole !== 'all' && p.role !== filterRole) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.nama.toLowerCase().includes(q);
        const matchesNip = p.nip.includes(q);
        const matchesJabatan = p.jabatan.toLowerCase().includes(q);
        const matchesUnit = p.unitKerja.toLowerCase().includes(q);
        if (!matchesName && !matchesNip && !matchesJabatan && !matchesUnit) return false;
      }
      return true;
    });
  }, [allPegawai, filterRole, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toast */}
      {successToast && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-slate-900 text-white rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Manajemen Akun & Pegawai SMKN 1 Tegalsari
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola hak akses pengguna (Admin SDM, Pimpinan Sekolah, Guru, Pegawai) dan kredensial NIP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Button Buat Akun Admin & Pimpinan */}
          <button
            onClick={() => onOpenCreateAccount('admin')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>+ Buat Akun Admin / Pimpinan</span>
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4 text-slate-500" />
              <span>Tambah Pegawai</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Role Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterRole === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Semua ({allPegawai.length})
          </button>
          <button
            onClick={() => setFilterRole('admin')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterRole === 'admin' ? 'bg-white text-blue-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Admin SDM ({allPegawai.filter(p => p.role === 'admin').length})
          </button>
          <button
            onClick={() => setFilterRole('pimpinan')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterRole === 'pimpinan' ? 'bg-white text-amber-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Pimpinan ({allPegawai.filter(p => p.role === 'pimpinan').length})
          </button>
          <button
            onClick={() => setFilterRole('guru')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterRole === 'guru' ? 'bg-white text-purple-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Guru ({allPegawai.filter(p => p.role === 'guru').length})
          </button>
          <button
            onClick={() => setFilterRole('pegawai')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterRole === 'pegawai' ? 'bg-white text-emerald-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Tendik ({allPegawai.filter(p => p.role === 'pegawai').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NIP, atau mata pelajaran..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Grid of Pegawai Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPegawai.map((p) => {
          const fullName = `${p.gelarDepan ? p.gelarDepan + ' ' : ''}${p.nama}${p.gelarBelakang ? ', ' + p.gelarBelakang : ''}`;

          return (
            <div 
              key={p.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 ${
                      p.tipe === 'guru' ? 'bg-blue-900' : 'bg-slate-700'
                    }`}>
                      {p.nama.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs leading-snug">
                        {fullName}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        NIP. {p.nip}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                      p.role === 'admin' 
                        ? 'bg-blue-100 text-blue-900 border-blue-200' 
                        : p.role === 'pimpinan'
                        ? 'bg-amber-100 text-amber-900 border-amber-200'
                        : p.role === 'guru'
                        ? 'bg-purple-50 text-purple-800 border-purple-200' 
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {p.role === 'admin' ? 'Admin SDM' : p.role === 'pimpinan' ? 'Pimpinan' : p.role === 'guru' ? 'Guru' : 'Tendik'}
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-start justify-between">
                    <span className="text-slate-400 text-[11px]">Jabatan:</span>
                    <span className="font-medium text-slate-800 text-right text-xs truncate max-w-[200px]">
                      {p.jabatan}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Golongan:</span>
                    <span className="font-medium text-slate-800 text-xs font-mono">
                      {p.pangkatGolongan}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Unit:</span>
                    <span className="text-slate-700 text-[11px] truncate max-w-[200px]">
                      {p.unitKerja}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[10px] text-slate-400 font-mono">
                  Login: NIP
                </div>

                <div className="flex items-center gap-1.5">
                  {currentUser.role === 'admin' && (
                    <select
                      value={p.role}
                      onChange={(e) => handleChangeRole(p.id, e.target.value as Role)}
                      className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                      title="Ubah Hak Akses Akun"
                    >
                      <option value="admin">Admin</option>
                      <option value="pimpinan">Pimpinan</option>
                      <option value="guru">Guru</option>
                      <option value="pegawai">Tendik</option>
                    </select>
                  )}

                  <button
                    onClick={() => handleResetPassword(p)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
                    title="Reset Password ke NIP"
                  >
                    <KeyRound className="w-3 h-3 text-slate-500" />
                    <span>Reset Pass</span>
                  </button>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Pegawai Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingPegawai ? 'Perbarui Data Guru / Pegawai' : 'Pendaftaran Guru / Pegawai Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gelar Depan
                  </label>
                  <input
                    type="text"
                    value={gelarDepan}
                    onChange={(e) => setGelarDepan(e.target.value)}
                    placeholder="Drs. / Dra. / H."
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                    placeholder="Nama lengkap tanpa gelar"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gelar Belakang
                  </label>
                  <input
                    type="text"
                    value={gelarBelakang}
                    onChange={(e) => setGelarBelakang(e.target.value)}
                    placeholder="S.Pd., M.Pd. / S.Kom."
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP Pegawai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    required
                    placeholder="198001012005011001"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipe Kepegawaian
                  </label>
                  <select
                    value={tipe}
                    onChange={(e) => setTipe(e.target.value as EmployeeType)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="guru">Guru (Tenaga Pendidik)</option>
                    <option value="pegawai">Tenaga Kependidikan / Tata Usaha</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pangkat & Golongan
                  </label>
                  <input
                    type="text"
                    value={pangkatGolongan}
                    onChange={(e) => setPangkatGolongan(e.target.value)}
                    placeholder="Pembina / IV/a atau Penata / III/c"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jabatan / Mata Pelajaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  required
                  placeholder="Contoh: Guru Produktif RPL / Waka Kurikulum"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit Kerja
                  </label>
                  <input
                    type="text"
                    value={unitKerja}
                    onChange={(e) => setUnitKerja(e.target.value)}
                    placeholder="Program Keahlian RPL / Tata Usaha"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value as 'L' | 'P')}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="L">Laki-Laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Password akun awal adalah NIP guru/pegawai.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs"
                  >
                    Simpan Data
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
