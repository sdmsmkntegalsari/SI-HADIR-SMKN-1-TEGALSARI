import { 
  Pegawai, 
  PermintaanIzin, 
  StatusKehadiranHarian, 
  MainCategory, 
  SubCategory 
} from '../types/attendance';
import { INITIAL_PEGAWAI, INITIAL_IZIN } from '../data/mockData';

const STORAGE_KEYS = {
  PEGAWAI: 'smkn1_tegalsari_pegawai',
  IZIN: 'smkn1_tegalsari_izin',
  OVERRIDES: 'smkn1_tegalsari_overrides',
  CURRENT_USER: 'smkn1_tegalsari_current_user',
  PASSWORDS: 'smkn1_tegalsari_passwords', // Mapping NIP -> password
};

// Inisialisasi data pegawai
export const getStoredPegawai = (): Pegawai[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PEGAWAI);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PEGAWAI, JSON.stringify(INITIAL_PEGAWAI));
      return INITIAL_PEGAWAI;
    }
    const parsed: Pegawai[] = JSON.parse(raw);
    // Ensure roles for key leadership (Kepala Sekolah, Wakasek) are updated to pimpinan if they had legacy role
    let hasChanges = false;
    const updated = parsed.map(p => {
      if (p.id === 'peg-02' && p.role !== 'pimpinan') {
        hasChanges = true;
        return { ...p, role: 'pimpinan' as const };
      }
      if (p.id === 'peg-03' && p.role !== 'pimpinan') {
        hasChanges = true;
        return { ...p, role: 'pimpinan' as const };
      }
      return p;
    });
    if (hasChanges) {
      localStorage.setItem(STORAGE_KEYS.PEGAWAI, JSON.stringify(updated));
      return updated;
    }
    return parsed;
  } catch (e) {
    console.error('Error reading pegawai from localStorage', e);
    return INITIAL_PEGAWAI;
  }
};

export const savePegawaiList = (list: Pegawai[]): void => {
  localStorage.setItem(STORAGE_KEYS.PEGAWAI, JSON.stringify(list));
};

// Buat akun baru khusus untuk Admin, Pimpinan, atau Guru/Pegawai
export const registerAccount = (data: {
  nip: string;
  nama: string;
  gelarDepan?: string;
  gelarBelakang?: string;
  jabatan: string;
  unitKerja?: string;
  tipe?: 'guru' | 'pegawai';
  pangkatGolongan?: string;
  email?: string;
  noHp?: string;
  jenisKelamin?: 'L' | 'P';
  role: 'admin' | 'pimpinan' | 'guru' | 'pegawai';
  password?: string;
}): Pegawai => {
  const currentList = getStoredPegawai();
  const cleanedNip = data.nip.trim().replace(/\s+/g, '');
  
  // Cek apakah NIP sudah ada
  const existingIdx = currentList.findIndex(p => p.nip.replace(/\s+/g, '') === cleanedNip);

  const newPegawai: Pegawai = {
    id: existingIdx >= 0 ? currentList[existingIdx].id : `peg-${Date.now()}`,
    nip: cleanedNip,
    nama: data.nama.trim(),
    gelarDepan: data.gelarDepan?.trim() || undefined,
    gelarBelakang: data.gelarBelakang?.trim() || undefined,
    jabatan: data.jabatan.trim(),
    unitKerja: data.unitKerja?.trim() || (data.role === 'pimpinan' ? 'Pimpinan Sekolah' : 'SMKN 1 Tegalsari'),
    tipe: data.tipe || (data.role === 'pimpinan' ? 'guru' : 'pegawai'),
    pangkatGolongan: data.pangkatGolongan?.trim() || 'Pembina / IV/a',
    email: data.email?.trim() || `${cleanedNip}@smkn1tegalsari.sch.id`,
    noHp: data.noHp?.trim() || '081234567890',
    jenisKelamin: data.jenisKelamin || 'L',
    role: data.role,
    statusAktif: true,
  };

  if (existingIdx >= 0) {
    currentList[existingIdx] = newPegawai;
  } else {
    currentList.push(newPegawai);
  }

  savePegawaiList(currentList);

  // Simpan password khusus jika diberikan, default = NIP
  if (data.password && data.password.trim()) {
    changeUserPassword(cleanedNip, data.password.trim());
  } else {
    changeUserPassword(cleanedNip, cleanedNip);
  }

  return newPegawai;
};

export const updatePegawaiRole = (pegawaiId: string, newRole: 'admin' | 'pimpinan' | 'guru' | 'pegawai'): void => {
  const list = getStoredPegawai();
  const updated = list.map(p => {
    if (p.id === pegawaiId) {
      return { ...p, role: newRole };
    }
    return p;
  });
  savePegawaiList(updated);

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === pegawaiId) {
    saveCurrentUser({ ...currentUser, role: newRole });
  }
};

// Inisialisasi daftar izin
export const getStoredIzin = (): PermintaanIzin[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IZIN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.IZIN, JSON.stringify(INITIAL_IZIN));
      return INITIAL_IZIN;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading izin from localStorage', e);
    return INITIAL_IZIN;
  }
};

export const saveIzinList = (list: PermintaanIzin[]): void => {
  localStorage.setItem(STORAGE_KEYS.IZIN, JSON.stringify(list));
};

// Custom Daily Overrides (e.g., admin/pimpinan marks someone manually as alpa / tidak hadir)
export interface ManualOverride {
  id: string;
  tanggal: string; // YYYY-MM-DD
  pegawaiId: string;
  status: MainCategory;
  subKategori: SubCategory;
  alasan?: string;
  catatan?: string;
}

export const getStoredOverrides = (): ManualOverride[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OVERRIDES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

export const saveOverride = (override: ManualOverride): void => {
  const current = getStoredOverrides();
  const existingIdx = current.findIndex(
    o => o.tanggal === override.tanggal && o.pegawaiId === override.pegawaiId
  );
  if (existingIdx >= 0) {
    current[existingIdx] = override;
  } else {
    current.push(override);
  }
  localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(current));
};

export const removeOverride = (tanggal: string, pegawaiId: string): void => {
  const current = getStoredOverrides();
  const filtered = current.filter(
    o => !(o.tanggal === tanggal && o.pegawaiId === pegawaiId)
  );
  localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(filtered));
};

// Hitung status kehadiran untuk tanggal tertentu
// Aturan:
// 1. Setiap harinya guru dan pegawai terjadwal masuk/hadir secara otomatis.
// 2. Pengajuan izin dari guru/pegawai harus diverifikasi & disetujui Admin/Pimpinan terlebih dahulu.
// 3. Setelah izin berstatus 'disetujui', status kehadiran otomatis berubah sesuai jenis izin.
export const getDailyAttendanceForDate = (dateStr: string): StatusKehadiranHarian[] => {
  const pegawais = getStoredPegawai();
  const izins = getStoredIzin();
  const overrides = getStoredOverrides();

  const results: StatusKehadiranHarian[] = [];

  for (const p of pegawais) {
    if (!p.statusAktif) continue;

    // 1. Cek apakah ada manual override dari Admin / Pimpinan
    const override = overrides.find(o => o.tanggal === dateStr && o.pegawaiId === p.id);
    if (override) {
      results.push({
        pegawaiId: p.id,
        tanggal: dateStr,
        status: override.status,
        subKategori: override.subKategori,
        alasan: override.alasan,
        isOtomatis: false,
        catatan: override.catatan || 'Diatur manual oleh Admin SDM / Pimpinan',
      });
      continue;
    }

    // 2. Cek apakah ada Izin/Dinas/Cuti/Diklat yang SUDAH DISETUJUI pada rentang tanggal ini
    const activeIzin = izins.find(iz => {
      if (iz.pegawaiId !== p.id) return false;
      if (iz.status !== 'disetujui') return false;
      return dateStr >= iz.tanggalMulai && dateStr <= iz.tanggalSelesai;
    });

    if (activeIzin) {
      results.push({
        pegawaiId: p.id,
        tanggal: dateStr,
        status: activeIzin.kategori,
        subKategori: activeIzin.subKategori,
        alasan: activeIzin.alasan,
        izinId: activeIzin.id,
        lampiranNama: activeIzin.berkasNama,
        lampiranUrl: activeIzin.berkasUrl,
        isOtomatis: false,
        catatan: activeIzin.diverifikasiOleh
          ? `Disetujui oleh ${activeIzin.diverifikasiOleh}`
          : `Surat/Izin: ${activeIzin.subKategori}`,
      });
      continue;
    }

    // 3. Cek apakah ada izin yang masih menunggu verifikasi (hanya untuk catatan info)
    const pendingIzin = izins.find(iz => {
      if (iz.pegawaiId !== p.id) return false;
      if (iz.status !== 'menunggu') return false;
      return dateStr >= iz.tanggalMulai && dateStr <= iz.tanggalSelesai;
    });

    // 4. DEFAULT: Terjadwal Hadir Otomatis!
    results.push({
      pegawaiId: p.id,
      tanggal: dateStr,
      status: 'hadir',
      subKategori: 'Terjadwal Masuk',
      alasan: 'Terjadwal otomatis masuk kerja di SMKN 1 Tegalsari',
      isOtomatis: true,
      catatan: pendingIzin
        ? `Ada pengajuan ${pendingIzin.subKategori} (Menunggu Verifikasi)`
        : 'Hadir Terjadwal Otomatis',
    });
  }

  return results;
};

// Tambah pengajuan izin baru
export const submitPermintaanIzin = (izin: Omit<PermintaanIzin, 'id' | 'tanggalPengajuan'>): PermintaanIzin => {
  const current = getStoredIzin();
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5);

  const newIzin: PermintaanIzin = {
    ...izin,
    id: `izin-${Date.now()}`,
    tanggalPengajuan: `${dateStr} ${timeStr}`,
    status: izin.status || 'menunggu',
  };

  const updated = [newIzin, ...current];
  saveIzinList(updated);
  return newIzin;
};

// Update status izin (verifikasi oleh Admin atau Pimpinan)
export const updateStatusIzin = (
  izinId: string, 
  status: 'disetujui' | 'menunggu' | 'ditolak',
  catatanAdmin?: string,
  verifikator?: string
): void => {
  const current = getStoredIzin();
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5);

  const updated = current.map(item => {
    if (item.id === izinId) {
      return {
        ...item,
        status,
        catatanAdmin: catatanAdmin !== undefined ? catatanAdmin : item.catatanAdmin,
        diverifikasiOleh: verifikator || item.diverifikasiOleh,
        tanggalVerifikasi: status !== 'menunggu' ? `${dateStr} ${timeStr}` : undefined,
      };
    }
    return item;
  });
  saveIzinList(updated);
};

// Hapus izin
export const deleteIzin = (izinId: string): void => {
  const current = getStoredIzin();
  const filtered = current.filter(item => item.id !== izinId);
  saveIzinList(filtered);
};

// Autentikasi: Login menggunakan NIP dan Password NIP
export const authenticateUser = (nip: string, passwordInput: string): Pegawai | null => {
  const pegawais = getStoredPegawai();
  const cleanedNip = nip.trim().replace(/\s+/g, '');
  
  const user = pegawais.find(p => p.nip.replace(/\s+/g, '') === cleanedNip);
  if (!user) return null;

  // Cek custom password jika pernah diganti, default = NIP itu sendiri
  let storedPasswords: Record<string, string> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PASSWORDS);
    if (raw) storedPasswords = JSON.parse(raw);
  } catch (e) {
    storedPasswords = {};
  }

  const expectedPassword = storedPasswords[cleanedNip] || cleanedNip;
  const cleanedPassword = passwordInput.trim().replace(/\s+/g, '');

  if (cleanedPassword === expectedPassword || cleanedPassword === cleanedNip) {
    saveCurrentUser(user);
    return user;
  }

  return null;
};

export const getCurrentUser = (): Pegawai | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      // Default: login as Admin SDM initially so all features are immediately testable
      const admin = INITIAL_PEGAWAI[0];
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(admin));
      return admin;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_PEGAWAI[0];
  }
};

export const saveCurrentUser = (user: Pegawai | null): void => {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }
};

export const changeUserPassword = (nip: string, newPass: string): void => {
  const cleanedNip = nip.trim().replace(/\s+/g, '');
  let stored: Record<string, string> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PASSWORDS);
    if (raw) stored = JSON.parse(raw);
  } catch (e) {
    stored = {};
  }
  stored[cleanedNip] = newPass.trim();
  localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(stored));
};

// Reset database ke default jika diinginkan pengguna
export const resetToDefaultData = (): void => {
  localStorage.setItem(STORAGE_KEYS.PEGAWAI, JSON.stringify(INITIAL_PEGAWAI));
  localStorage.setItem(STORAGE_KEYS.IZIN, JSON.stringify(INITIAL_IZIN));
  localStorage.removeItem(STORAGE_KEYS.OVERRIDES);
  localStorage.removeItem(STORAGE_KEYS.PASSWORDS);
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_PEGAWAI[0]));
};
