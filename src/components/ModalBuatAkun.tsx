import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  ShieldCheck, 
  Crown, 
  GraduationCap, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Building,
  KeyRound,
  Info
} from 'lucide-react';
import { Pegawai, Role, EmployeeType } from '../types/attendance';
import { registerAccount } from '../utils/storage';

interface ModalBuatAkunProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: (newAccount: Pegawai) => void;
  initialRole?: Role;
}

export const ModalBuatAkun: React.FC<ModalBuatAkunProps> = ({
  isOpen,
  onClose,
  onAccountCreated,
  initialRole = 'admin',
}) => {
  if (!isOpen) return null;

  const [role, setRole] = useState<Role>(initialRole);
  const [nip, setNip] = useState<string>('');
  const [nama, setNama] = useState<string>('');
  const [gelarDepan, setGelarDepan] = useState<string>('');
  const [gelarBelakang, setGelarBelakang] = useState<string>('');
  const [jabatan, setJabatan] = useState<string>('');
  const [unitKerja, setUnitKerja] = useState<string>('');
  const [tipe, setTipe] = useState<EmployeeType>('guru');
  const [pangkatGolongan, setPangkatGolongan] = useState<string>('Pembina / IV/a');
  const [email, setEmail] = useState<string>('');
  const [noHp, setNoHp] = useState<string>('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Auto-fill template suggestions based on role
  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    if (selectedRole === 'admin') {
      setJabatan('Koordinator Kepegawaian & SDM');
      setUnitKerja('Bagian Kepegawaian & SDM');
      setPangkatGolongan('Pembina / IV/a');
      setTipe('guru');
    } else if (selectedRole === 'pimpinan') {
      setJabatan('Kepala Sekolah');
      setUnitKerja('Pimpinan Sekolah');
      setPangkatGolongan('Pembina Utama Muda / IV/c');
      setTipe('guru');
    } else if (selectedRole === 'guru') {
      setJabatan('Guru Mata Pelajaran');
      setUnitKerja('Program Keahlian');
      setPangkatGolongan('Penata / III/c');
      setTipe('guru');
    } else {
      setJabatan('Staf Tata Usaha');
      setUnitKerja('Bagian Tata Usaha');
      setPangkatGolongan('Pengatur / II/c');
      setTipe('pegawai');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nip.trim()) {
      setErrorMsg('NIP wajib diisi.');
      return;
    }
    if (!nama.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }
    if (!jabatan.trim()) {
      setErrorMsg('Jabatan / Tugas wajib diisi.');
      return;
    }

    if (password && password !== passwordConfirm) {
      setErrorMsg('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = registerAccount({
        nip: nip.trim(),
        nama: nama.trim(),
        gelarDepan: gelarDepan.trim() || undefined,
        gelarBelakang: gelarBelakang.trim() || undefined,
        jabatan: jabatan.trim(),
        unitKerja: unitKerja.trim() || undefined,
        tipe,
        pangkatGolongan: pangkatGolongan.trim(),
        email: email.trim() || `${nip.trim()}@smkn1tegalsari.sch.id`,
        noHp: noHp.trim() || '081234567890',
        jenisKelamin,
        role,
        password: password.trim() || nip.trim(),
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onAccountCreated(created);
        onClose();
      }, 1400);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Gagal membuat akun. Silakan coba kembali.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-blue-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/15">
              <ShieldCheck className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300 block">
                SI-HADIR · SMKN 1 TEGALSARI
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Menu Buat Akun Akses Web (Admin & Pimpinan)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5">
          {isSuccess ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Akun Berhasil Didaftarkan!
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Akun <strong>{nama}</strong> dengan peran <strong>{role.toUpperCase()}</strong> dan NIP <span className="font-mono font-bold text-slate-900">{nip}</span> kini siap digunakan untuk akses web.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Role Selection Tabs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Pilih Peran / Hak Akses Akun: <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Admin Role */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('admin')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === 'admin'
                        ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600 text-blue-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs mb-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Admin SDM</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Akses penuh manajemen presensi & izin
                    </p>
                  </button>

                  {/* Pimpinan Role */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('pimpinan')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === 'pimpinan'
                        ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-600 text-amber-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs mb-1">
                      <Crown className="w-4 h-4" />
                      <span>Pimpinan</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Kepala Sekolah, Wakasek, KTU
                    </p>
                  </button>

                  {/* Guru Role */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('guru')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === 'guru'
                        ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-600 text-purple-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-purple-800 font-bold text-xs mb-1">
                      <GraduationCap className="w-4 h-4" />
                      <span>Guru</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Tenaga Pendidik / Pengajar
                    </p>
                  </button>

                  {/* Pegawai Role */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('pegawai')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === 'pegawai'
                        ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600 text-emerald-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs mb-1">
                      <UserCheck className="w-4 h-4" />
                      <span>Pegawai / Tendik</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Staf TU, Teknisi, Satpam
                    </p>
                  </button>
                </div>
              </div>

              {/* Role Explanatory Callout */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  {role === 'admin' && (
                    <p>
                      <strong>Hak Akses Admin:</strong> Memiliki wewenang mengubah status kehadiran seluruh pegawai, menyetujui/menolak pengajuan izin, mendaftarkan akun baru, serta mengekspor dan mencetak laporan resmi kepegawaian.
                    </p>
                  )}
                  {role === 'pimpinan' && (
                    <p>
                      <strong>Hak Akses Pimpinan (Kepsek / Wakasek / KTU):</strong> Memiliki wewenang monitoring eksekutif terhadap kehadiran sekolah, memantau personil yang dinas luar/cuti/diklat, pengesahan laporan resmi, dan akses rekapitulasi lengkap.
                    </p>
                  )}
                  {role === 'guru' && (
                    <p>
                      <strong>Hak Akses Guru:</strong> Terjadwal otomatis hadir, dapat mengajukan surat tugas dinas luar, cuti, atau diklat beserta berkas lampiran, dan memantau riwayat presensi mandiri.
                    </p>
                  )}
                  {role === 'pegawai' && (
                    <p>
                      <strong>Hak Akses Pegawai / Tendik:</strong> Akses presensi kerja tenaga kependidikan, pengajuan cuti tahunan/sakit/alasan penting, dan rekapitulasi kehadiran.
                    </p>
                  )}
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gelar Depan
                    </label>
                    <input
                      type="text"
                      value={gelarDepan}
                      onChange={(e) => setGelarDepan(e.target.value)}
                      placeholder="Drs. / Dra. / H."
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
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
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
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
                      placeholder="S.Pd., M.Pd. / S.Kom. / M.M."
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nomor Induk Pegawai (NIP) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nip}
                      onChange={(e) => setNip(e.target.value)}
                      required
                      placeholder="Contoh: 197508122003121005"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jabatan / Posisi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jabatan}
                      onChange={(e) => setJabatan(e.target.value)}
                      required
                      placeholder={role === 'pimpinan' ? 'Kepala Sekolah / Waka Kurikulum' : 'Admin Kepegawaian'}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Unit Kerja / Bagian
                    </label>
                    <input
                      type="text"
                      value={unitKerja}
                      onChange={(e) => setUnitKerja(e.target.value)}
                      placeholder="Pimpinan Sekolah / Bagian SDM"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pangkat & Golongan Ruang
                    </label>
                    <input
                      type="text"
                      value={pangkatGolongan}
                      onChange={(e) => setPangkatGolongan(e.target.value)}
                      placeholder="Pembina Utama Muda / IV/c"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jenis Kelamin
                    </label>
                    <select
                      value={jenisKelamin}
                      onChange={(e) => setJenisKelamin(e.target.value as 'L' | 'P')}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    >
                      <option value="L">Laki-Laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Resmi (Opsional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@smkn1tegalsari.sch.id"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      No. WhatsApp / HP
                    </label>
                    <input
                      type="tel"
                      value={noHp}
                      onChange={(e) => setNoHp(e.target.value)}
                      placeholder="081234567890"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-blue-700" />
                    <span>Kata Sandi (Password Akun)</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Kosongkan jika ingin password sama dengan NIP
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Default = NIP Akun"
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Ulangi Password
                    </label>
                    <input
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="Konfirmasi password"
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 active:bg-blue-950 rounded-lg transition-colors shadow-sm disabled:opacity-60 flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Mendaftarkan Akun...' : 'Daftarkan Akun Akses Web'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
