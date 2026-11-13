/**
 * Tipe data Presensi & Kepegawaian SMKN 1 Tegalsari
 */

export type Role = 'admin' | 'pimpinan' | 'guru' | 'pegawai';

export type EmployeeType = 'guru' | 'pegawai';

export type MainCategory = 
  | 'hadir'
  | 'tidak_hadir'
  | 'dinas_luar'
  | 'cuti'
  | 'pendidikan_pelatihan';

export type SubCategoryDinasLuar = 
  | 'Perjalanan Dinas Dalam kota'
  | 'Perjalanan Dinas Luar Kota';

export type SubCategoryCuti = 
  | 'Cuti Alasan Penting'
  | 'Cuti Tahunan'
  | 'Cuti Melahirkan'
  | 'Cuti Sakit';

export type SubCategoryDiklat = 
  | 'Tugas Belajar'
  | 'Diklat';

export type SubCategory = 
  | SubCategoryDinasLuar 
  | SubCategoryCuti 
  | SubCategoryDiklat 
  | 'Terjadwal Masuk'
  | 'Tanpa Keterangan / Alpa'
  | 'Izin Khusus';

export interface Pegawai {
  id: string;
  nip: string;
  nama: string;
  gelarDepan?: string;
  gelarBelakang?: string;
  jabatan: string;
  unitKerja: string; // e.g., 'Program Keahlian RPL', 'Tata Usaha', 'Waka Kurikulum'
  tipe: EmployeeType;
  pangkatGolongan: string; // e.g., 'Pembina / IV/a', 'Penata / III/c', 'PPPK', 'GTT'
  email: string;
  noHp: string;
  avatarUrl?: string;
  jenisKelamin: 'L' | 'P';
  role: Role;
  statusAktif: boolean;
}

export interface PermintaanIzin {
  id: string;
  pegawaiId: string;
  pegawaiNama: string;
  pegawaiNip: string;
  pegawaiJabatan: string;
  kategori: MainCategory;
  subKategori: SubCategory;
  tanggalMulai: string; // YYYY-MM-DD
  tanggalSelesai: string; // YYYY-MM-DD
  jumlahHari: number;
  alasan: string;
  nomorSurat?: string;
  tujuanLokasi?: string; // Khusus dinas luar
  berkasUrl?: string; // Data URL / Base64 / URL
  berkasNama?: string;
  berkasType?: string; // 'application/pdf', 'image/jpeg', 'image/png'
  berkasSize?: string;
  status: 'disetujui' | 'menunggu' | 'ditolak';
  tanggalPengajuan: string; // YYYY-MM-DD HH:mm
  catatanAdmin?: string;
  diverifikasiOleh?: string;
  tanggalVerifikasi?: string;
}

export interface StatusKehadiranHarian {
  pegawaiId: string;
  tanggal: string; // YYYY-MM-DD
  status: MainCategory;
  subKategori: SubCategory;
  alasan?: string;
  izinId?: string;
  lampiranNama?: string;
  lampiranUrl?: string;
  isOtomatis: boolean; // True jika hadir terjadwal secara otomatis
  catatan?: string;
}

export interface AttendanceFilterState {
  search: string;
  kategori: string; // 'all' | MainCategory
  tipe: 'all' | 'guru' | 'pegawai';
  tanggal: string; // YYYY-MM-DD
}
