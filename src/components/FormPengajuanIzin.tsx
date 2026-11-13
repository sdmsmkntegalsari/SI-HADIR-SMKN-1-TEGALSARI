import React, { useState } from 'react';
import { 
  Send, 
  UploadCloud, 
  FileCheck, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  Building, 
  MapPin, 
  Info,
  Clock
} from 'lucide-react';
import { 
  Pegawai, 
  MainCategory, 
  SubCategory, 
  SubCategoryDinasLuar, 
  SubCategoryCuti, 
  SubCategoryDiklat 
} from '../types/attendance';
import { submitPermintaanIzin } from '../utils/storage';
import { getFormattedDate } from '../data/mockData';

interface FormPengajuanIzinProps {
  currentUser: Pegawai;
  allPegawai: Pegawai[];
  onSuccessSubmit: () => void;
}

export const FormPengajuanIzin: React.FC<FormPengajuanIzinProps> = ({
  currentUser,
  allPegawai,
  onSuccessSubmit,
}) => {
  // If admin, can submit for any employee or self; if teacher, submits for self
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<string>(currentUser.id);
  
  // Categories
  const [kategori, setKategori] = useState<MainCategory>('dinas_luar');
  const [subKategori, setSubKategori] = useState<SubCategory>('Perjalanan Dinas Dalam kota');
  
  // Dates
  const [tanggalMulai, setTanggalMulai] = useState<string>(getFormattedDate(0));
  const [tanggalSelesai, setTanggalSelesai] = useState<string>(getFormattedDate(0));
  
  // Details
  const [alasan, setAlasan] = useState<string>('');
  const [tujuanLokasi, setTujuanLokasi] = useState<string>('');
  const [nomorSurat, setNomorSurat] = useState<string>('');

  // File upload state
  const [fileObject, setFileObject] = useState<{
    nama: string;
    type: string;
    size: string;
    url?: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submittedStatus, setSubmittedStatus] = useState<'disetujui' | 'menunggu'>('menunggu');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const isApprover = currentUser.role === 'admin' || currentUser.role === 'pimpinan';
  const [directApprove, setDirectApprove] = useState<boolean>(isApprover);

  // Hitung jumlah hari kerja
  const calculateDays = () => {
    if (!tanggalMulai || !tanggalSelesai) return 1;
    const start = new Date(tanggalMulai);
    const end = new Date(tanggalSelesai);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const daysCount = calculateDays();

  // Update sub-kategori when main category changes
  const handleCategoryChange = (newCat: MainCategory) => {
    setKategori(newCat);
    if (newCat === 'dinas_luar') {
      setSubKategori('Perjalanan Dinas Dalam kota');
    } else if (newCat === 'cuti') {
      setSubKategori('Cuti Sakit');
    } else if (newCat === 'pendidikan_pelatihan') {
      setSubKategori('Diklat');
    } else {
      setSubKategori('Tanpa Keterangan / Alpa');
    }
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeKb = (file.size / 1024).toFixed(1);
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${sizeKb} KB`;

      // Read as DataURL for persistence/preview
      const reader = new FileReader();
      reader.onload = () => {
        setFileObject({
          nama: file.name,
          type: file.type || 'application/pdf',
          size: sizeStr,
          url: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick helper to attach a standardized official sample document
  const handleAttachTemplate = () => {
    let docTitle = 'Surat_Tugas_Resmi_SMKN1Tegalsari.pdf';
    if (kategori === 'cuti') {
      docTitle = subKategori === 'Cuti Sakit' 
        ? 'Surat_Keterangan_Sakit_Dokter.pdf' 
        : 'Formulir_Permohonan_Cuti_Pegawai.pdf';
    } else if (kategori === 'pendidikan_pelatihan') {
      docTitle = 'Surat_Pemanggilan_Diklat_Pelatihan.pdf';
    }
    
    setFileObject({
      nama: docTitle,
      type: 'application/pdf',
      size: '1.4 MB',
      url: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!alasan.trim()) {
      setErrorMessage('Alasan permintaan izin wajib diisi secara rinci.');
      return;
    }

    if (daysCount <= 0) {
      setErrorMessage('Tanggal selesai tidak boleh lebih awal dari tanggal mulai izin.');
      return;
    }

    if (!fileObject) {
      setErrorMessage('Harap unggah berkas pendukung (Surat Tugas, Surat Cuti, atau Surat Keterangan Sakit). Anda juga dapat klik tombol "Gunakan Dokumen Contoh Resmi" di bawah kolom upload.');
      return;
    }

    const targetPegawai = allPegawai.find(p => p.id === selectedPegawaiId) || currentUser;
    const finalStatus: 'disetujui' | 'menunggu' = isApprover && directApprove ? 'disetujui' : 'menunggu';

    setIsSubmitting(true);

    try {
      submitPermintaanIzin({
        pegawaiId: targetPegawai.id,
        pegawaiNama: `${targetPegawai.gelarDepan ? targetPegawai.gelarDepan + ' ' : ''}${targetPegawai.nama}${targetPegawai.gelarBelakang ? ', ' + targetPegawai.gelarBelakang : ''}`,
        pegawaiNip: targetPegawai.nip,
        pegawaiJabatan: targetPegawai.jabatan,
        kategori,
        subKategori,
        tanggalMulai,
        tanggalSelesai,
        jumlahHari: daysCount,
        alasan: alasan.trim(),
        nomorSurat: nomorSurat.trim() || undefined,
        tujuanLokasi: tujuanLokasi.trim() || undefined,
        berkasNama: fileObject.nama,
        berkasType: fileObject.type,
        berkasSize: fileObject.size,
        berkasUrl: fileObject.url,
        status: finalStatus,
        diverifikasiOleh: finalStatus === 'disetujui' ? `${currentUser.nama} (${currentUser.role === 'pimpinan' ? 'Pimpinan' : 'Admin SDM'})` : undefined,
        catatanAdmin: finalStatus === 'disetujui' ? `Disetujui langsung oleh ${currentUser.nama}` : undefined,
      });

      setSubmittedStatus(finalStatus);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        onSuccessSubmit();
      }, 1800);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Terjadi kesalahan saat menyimpan pengajuan izin. Silakan coba kembali.');
    }
  };

  const selectedTarget = allPegawai.find(p => p.id === selectedPegawaiId) || currentUser;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Formulir Pengajuan Permintaan Izin / Dinas / Cuti
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Pengajuan izin resmi Guru & Pegawai SMKN 1 Tegalsari. Status kehadiran otomatis berubah setelah diverifikasi dan disetujui oleh Admin SDM atau Pimpinan Sekolah.
        </p>
      </div>

      {submitSuccess ? (
        <div className="bg-white border border-emerald-200 rounded-xl p-8 text-center shadow-xs">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
            submittedStatus === 'disetujui' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
          }`}>
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {submittedStatus === 'disetujui'
              ? 'Permintaan Izin Disetujui & Aktif!'
              : 'Permintaan Izin Terkirim (Menunggu Verifikasi)'}
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            {submittedStatus === 'disetujui' ? (
              <>
                Status kehadiran <strong>{selectedTarget.nama}</strong> pada tanggal{' '}
                <span className="font-mono font-bold text-slate-900">{tanggalMulai}</span> s/d{' '}
                <span className="font-mono font-bold text-slate-900">{tanggalSelesai}</span> secara otomatis telah diperbarui menjadi <strong>{subKategori}</strong>.
              </>
            ) : (
              <>
                Pengajuan <strong>{subKategori}</strong> untuk <strong>{selectedTarget.nama}</strong> pada tanggal{' '}
                <span className="font-mono font-bold text-slate-900">{tanggalMulai}</span> s/d{' '}
                <span className="font-mono font-bold text-slate-900">{tanggalSelesai}</span> telah dikirim dan menunggu persetujuan <strong>Admin SDM / Pimpinan Sekolah</strong>.
              </>
            )}
          </p>
          <p className="text-xs text-slate-500 mt-4">
            Mengalihkan ke Dashboard Presensi...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Informational Guidance */}
          <div className="p-4 sm:p-5 bg-blue-50/70 border-b border-blue-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <span className="font-semibold block text-blue-950">
                Alur Persetujuan & Otomasi Presensi SMKN 1 Tegalsari:
              </span>
              Setiap harinya seluruh guru dan pegawai terjadwal hadir otomatis. Pengajuan izin dari guru/pegawai yang telah dilengkapi berkas akan masuk ke antrean verifikasi dan <strong>otomatis mengubah status kehadiran</strong> setelah diverifikasi/disetujui oleh <strong>Admin SDM atau Pimpinan</strong>.
            </div>
          </div>

          <div className="p-5 sm:p-8 space-y-6">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Bagian 1: Data Pegawai Pemohon */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                <span>Data Guru / Pegawai</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Pegawai / Pemohon
                  </label>
                  {isApprover ? (
                    <select
                      value={selectedPegawaiId}
                      onChange={(e) => setSelectedPegawaiId(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    >
                      {allPegawai.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nama} ({p.nip}) - {p.jabatan}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium">
                      {currentUser.gelarDepan ? `${currentUser.gelarDepan} ` : ''}
                      {currentUser.nama}
                      {currentUser.gelarBelakang ? `, ${currentUser.gelarBelakang}` : ''}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP Pegawai
                  </label>
                  <div className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono">
                    {selectedTarget.nip}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jabatan / Tugas
                  </label>
                  <div className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-800">
                    {selectedTarget.jabatan}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pangkat / Golongan
                  </label>
                  <div className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-800">
                    {selectedTarget.pangkatGolongan} · {selectedTarget.tipe === 'guru' ? 'Tenaga Pendidik' : 'Tenaga Kependidikan'}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Bagian 2: Kategori & Sub-Kategori Izin */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">2</span>
                <span>Kategori & Jenis Izin</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleCategoryChange('dinas_luar')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    kategori === 'dinas_luar'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">Dinas Luar</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Tugas dalam / luar kota
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange('cuti')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    kategori === 'cuti'
                      ? 'border-amber-600 bg-amber-50/70 text-amber-900 ring-1 ring-amber-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">Cuti Pegawai</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Alasan penting, tahunan, melahirkan, sakit
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange('pendidikan_pelatihan')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    kategori === 'pendidikan_pelatihan'
                      ? 'border-purple-600 bg-purple-50/70 text-purple-900 ring-1 ring-purple-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">Pendidikan & Pelatihan</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Tugas belajar & Diklat
                  </div>
                </button>
              </div>

              {/* Sub-kategori Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sub-Kategori Spesifik <span className="text-rose-500">*</span>
                </label>
                <select
                  value={subKategori}
                  onChange={(e) => setSubKategori(e.target.value as SubCategory)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
                >
                  {kategori === 'dinas_luar' && (
                    <>
                      <option value="Perjalanan Dinas Dalam kota">Perjalanan Dinas Dalam kota</option>
                      <option value="Perjalanan Dinas Luar Kota">Perjalanan Dinas Luar Kota</option>
                    </>
                  )}
                  {kategori === 'cuti' && (
                    <>
                      <option value="Cuti Alasan Penting">Cuti Alasan Penting</option>
                      <option value="Cuti Tahunan">Cuti Tahunan</option>
                      <option value="Cuti Melahirkan">Cuti Melahirkan</option>
                      <option value="Cuti Sakit">Cuti Sakit</option>
                    </>
                  )}
                  {kategori === 'pendidikan_pelatihan' && (
                    <>
                      <option value="Tugas Belajar">Tugas Belajar</option>
                      <option value="Diklat">Diklat</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Bagian 3: Tanggal Izin & Alasan */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">3</span>
                <span>Periode Tanggal & Uraian Alasan</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Izin Mulai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    required
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Izin Selesai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    required
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Durasi
                  </label>
                  <div className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold flex items-center justify-between">
                    <span>{daysCount > 0 ? `${daysCount} Hari Kalender` : 'Tanggal tidak valid'}</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Lokasi / Instansi & Nomor Surat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lokasi / Instansi Tujuan {kategori === 'dinas_luar' ? '(Wajib untuk Dinas)' : '(Opsional)'}
                  </label>
                  <input
                    type="text"
                    value={tujuanLokasi}
                    onChange={(e) => setTujuanLokasi(e.target.value)}
                    placeholder="Contoh: Kantor Cabdin Banyuwangi / BBPPMPV Malang"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Surat / SK Referensi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={nomorSurat}
                    onChange={(e) => setNomorSurat(e.target.value)}
                    placeholder="Contoh: 090/421.5/SMKN1TGS/2026"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Alasan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan Permintaan Izin <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  required
                  placeholder="Tuliskan alasan keperluan izin secara jelas dan formal (contoh: Mengikuti Rapat Koordinasi Kurikulum SMK, Sakit rawat inap RSUD Genteng, dsb.)"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Bagian 4: Menu Upload Berkas dan Kirim */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">4</span>
                  <span>Menu Upload Berkas Pendukung</span>
                </h2>
                <span className="text-xs text-rose-500 font-semibold">* Wajib Melampirkan Berkas</span>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors text-center">
                <input
                  type="file"
                  id="berkasInput"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                
                {fileObject ? (
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full mb-2">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-900">{fileObject.nama}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Ukuran: {fileObject.size} · Tipe: {fileObject.type}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <label
                        htmlFor="berkasInput"
                        className="cursor-pointer px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Ganti File
                      </label>
                      <button
                        type="button"
                        onClick={() => setFileObject(null)}
                        className="px-3 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      Tarik & lepas file surat tugas / dokter / form cuti di sini, atau
                    </p>
                    <label
                      htmlFor="berkasInput"
                      className="mt-2 cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Pilih Berkas Dari Komputer</span>
                    </label>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Format yang didukung: PDF, JPG, PNG (Maksimal 5MB)
                    </p>

                    {/* Quick attach template button */}
                    <div className="mt-4 pt-4 border-t border-slate-200 w-full max-w-sm">
                      <p className="text-[11px] text-slate-500 mb-2">
                        Belum memiliki dokumen di perangkat?
                      </p>
                      <button
                        type="button"
                        onClick={handleAttachTemplate}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Gunakan Dokumen Contoh Resmi SMKN 1 Tegalsari</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Opsi Verifikasi Langsung khusus Admin & Pimpinan */}
            {isApprover && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Verifikasi & Persetujuan Langsung ({currentUser.role === 'pimpinan' ? 'Pimpinan' : 'Admin SDM'})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Aktifkan agar izin langsung disetujui dan mengubah status kehadiran secara otomatis.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={directApprove}
                    onChange={(e) => setDirectApprove(e.target.checked)}
                    className="w-4 h-4 accent-blue-900 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-800">Langsung Setujui</span>
                </label>
              </div>
            )}

            {/* Tombol Kirim */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                {isApprover && directApprove
                  ? 'Izin akan langsung disetujui dan memperbarui status kehadiran.'
                  : 'Pengajuan akan dikirim ke Admin SDM & Pimpinan untuk diverifikasi terlebih dahulu.'}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 active:bg-blue-950 rounded-lg transition-colors shadow-sm disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Memproses Pengajuan...' : 'Kirim Permintaan Izin'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
