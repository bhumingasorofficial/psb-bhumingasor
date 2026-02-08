
import { z } from 'zod';

// --- Constants for Validation ---
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf'];

// Helper function for required file validation
const requiredFileSchema = (message: string) => z.instanceof(File, { message })
    .refine(file => file && file.size > 0, message)
    .refine(file => !file || file.size <= MAX_FILE_SIZE, `Ukuran file maksimal 2MB.`)
    .refine(file => !file || ALLOWED_DOCUMENT_TYPES.includes(file.type), 'Format file harus PDF, JPG, atau PNG.');

const requiredImageSchema = (message: string) => z.instanceof(File, { message })
    .refine(file => file && file.size > 0, message)
    .refine(file => !file || file.size <= MAX_FILE_SIZE, `Ukuran file maksimal 2MB.`)
    .refine(file => !file || ALLOWED_IMAGE_TYPES.includes(file.type), 'Format foto harus JPG, PNG, atau WEBP.');


// --- Enums ---
export enum SchoolLevel {
    MI = 'MI Bhumi Ngasor',
    SMP = 'SMP Bhumi Ngasor',
    SMK = 'SMK Bhumi Ngasor',
    KULIAH = 'Perguruan Tinggi (Kuliah)',
    MONDOK = 'Lainnya (Mondok Saja)',
}

export enum SmkMajor {
    DKV = 'Desain Komunikasi Visual (DKV)',
    TKR = 'Teknik Kendaraan Ringan (TKR)',
    AKUNTANSI = 'Akuntansi',
    EMPTY = '', // Untuk SMP/MI/Lainnya
}

export enum Gender {
    LakiLaki = 'Laki-laki',
    Perempuan = 'Perempuan',
}

export enum ParentEducation {
    TIDAK_SEKOLAH = 'Tidak Sekolah',
    SD = 'SD / Sederajat',
    SMP = 'SMP / Sederajat',
    SMA = 'SMA / Sederajat',
    D1 = 'D1',
    D2 = 'D2',
    D3 = 'D3',
    S1 = 'S1 / D4',
    S2 = 'S2',
    S3 = 'S3',
}

export enum ParentIncome {
    KURANG_1JT = 'Kurang dari Rp 1.000.000',
    SATU_DUA_JT = 'Rp 1.000.000 - Rp 2.000.000',
    DUA_LIMA_JT = 'Rp 2.000.000 - Rp 5.000.000',
    LIMA_SEPULUH_JT = 'Rp 5.000.000 - Rp 20.000.000',
    LEBIH_20JT = 'Lebih dari Rp 20.000.000',
    TIDAK_BERPENGHASILAN = 'Tidak Berpenghasilan',
}

export enum ParentOccupation {
    PNS = 'PNS',
    TNI_POLRI = 'TNI/POLRI',
    WIRASWASTA = 'Wiraswasta',
    KARYAWAN_SWASTA = 'Karyawan Swasta',
    PETANI = 'Petani',
    NELAYAN = 'Nelayan',
    BURUH = 'Buruh',
    IRT = 'Ibu Rumah Tangga',
    PENSIUNAN = 'Pensiunan',
    ALMARHUM = 'Sudah Meninggal',
    LAINNYA = 'Lainnya...',
}

// --- SCHEMA 1: REGISTRASI AWAL ---
export const registrationSchema = z.object({
    botField: z.string().optional(),
    infoSource: z.array(z.string()).min(1, 'Pilih minimal satu sumber informasi.'),
    fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
    nik: z.string().regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
    gender: z.nativeEnum(Gender),
    parentWaNumber: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{7,11}$/, 'No. WA tidak valid'),
    buktiPembayaran: requiredImageSchema('Bukti Pembayaran wajib diunggah'),
    termsAgreed: z.boolean().refine(val => val === true, "Wajib menyetujui"),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

// --- SCHEMA 2: LOGIN ---
export const loginSchema = z.object({
    nik: z.string().regex(/^\d{16}$/, 'NIK harus 16 digit'),
    token: z.string().min(6, 'Token tidak valid'),
});

// --- SCHEMA 3: DATA LENGKAP (FULL FORM) ---
export const baseFormSchema = z.object({
    // Basic fields inherited/readonly
    regId: z.string().optional(),
    fullName: z.string(),
    nik: z.string(),
    gender: z.nativeEnum(Gender),
    infoSource: z.array(z.string()).optional(),

    // Step 2: Student Data
    schoolChoice: z.nativeEnum(SchoolLevel),
    smkMajor: z.string().optional(), 
    nisn: z.string().optional(), // Base is optional, refined later
    birthPlace: z.string().min(1, 'Tempat lahir wajib diisi'),
    birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
    previousSchool: z.string().min(1, 'Asal sekolah wajib diisi'),

    // B. Alamat
    province: z.string().min(1, 'Provinsi wajib diisi'),
    city: z.string().min(1, 'Kabupaten/Kota wajib diisi'),
    district: z.string().min(1, 'Kecamatan wajib diisi'),
    village: z.string().min(1, 'Desa/Kelurahan wajib diisi'),
    specificAddress: z.string().min(1, 'Jalan/Dusun/No wajib diisi'),
    rt: z.string().min(1, 'RT wajib diisi'),
    rw: z.string().min(1, 'RW wajib diisi'),
    postalCode: z.string().regex(/^\d{5}$/, 'Kode Pos harus 5 digit angka'),

    // C. Kontak (Pre-filled but editable logic handled in UI)
    parentWaNumber: z.string(),

    // F. Data Periodik
    height: z.string().min(1, 'Tinggi badan wajib diisi'),
    weight: z.string().min(1, 'Berat badan wajib diisi'),
    siblingCount: z.string().min(1, 'Jumlah saudara kandung wajib diisi'),
    childOrder: z.string().min(1, 'Anak ke- wajib diisi'),

    // E. Orang Tua / Wali
    fatherName: z.string().min(1, 'Nama ayah wajib diisi'),
    fatherEducation: z.nativeEnum(ParentEducation),
    fatherOccupation: z.nativeEnum(ParentOccupation),
    fatherOccupationOther: z.string().optional(),
    fatherIncome: z.nativeEnum(ParentIncome),
    
    motherName: z.string().min(1, 'Nama ibu wajib diisi'),
    motherEducation: z.nativeEnum(ParentEducation),
    motherOccupation: z.nativeEnum(ParentOccupation),
    motherOccupationOther: z.string().optional(),
    motherIncome: z.nativeEnum(ParentIncome),

    hasGuardian: z.boolean(),
    guardianName: z.string().optional(),
    guardianEducation: z.string().optional(), 
    guardianOccupation: z.string().optional(),
    guardianOccupationOther: z.string().optional(),
    guardianIncome: z.string().optional(),

    // Step 4: Document Upload
    kartuKeluarga: requiredFileSchema('File Kartu Keluarga wajib diunggah'),
    aktaKelahiran: requiredFileSchema('File Akta Kelahiran wajib diunggah'),
    ktpWalimurid: requiredFileSchema('File KTP Orang Tua/Wali wajib diunggah'),
    pasFoto: requiredImageSchema('Pas Foto wajib diunggah'),
    ijazah: requiredFileSchema('File Ijazah/SKL wajib diunggah'),
    
    // Final Confirmation
    finalAgreement: z.boolean().refine(val => val === true, "Anda harus menyetujui pernyataan kebenaran data"),
});

// Refined schema for custom logic validation
export const formSchema = baseFormSchema.superRefine((data, ctx) => {
    // 1. Validasi Jurusan SMK
    if (data.schoolChoice === SchoolLevel.SMK && (!data.smkMajor || data.smkMajor === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['smkMajor'],
            message: 'Jurusan wajib dipilih untuk SMK',
        });
    }

    // 2. Validasi NISN (Wajib untuk SMP, SMK, Kuliah. Tidak Wajib untuk MI & Mondok Saja)
    const levelsRequiringNisn = [SchoolLevel.SMP, SchoolLevel.SMK, SchoolLevel.KULIAH];
    if (levelsRequiringNisn.includes(data.schoolChoice)) {
        if (!data.nisn || !/^\d{10}$/.test(data.nisn)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['nisn'],
                message: 'NISN harus terdiri dari 10 digit angka',
            });
        }
    }

    // 3. Validasi Pekerjaan Lainnya
    if (data.fatherOccupation === ParentOccupation.LAINNYA && !data.fatherOccupationOther?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fatherOccupationOther'], message: 'Detail pekerjaan Ayah wajib diisi' });
    }
    if (data.motherOccupation === ParentOccupation.LAINNYA && !data.motherOccupationOther?.trim()) {
         ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['motherOccupationOther'], message: 'Detail pekerjaan Ibu wajib diisi' });
    }

    // 4. Validasi Wali
    if (data.hasGuardian) {
        if (!data.guardianName) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardianName'], message: 'Nama Wali wajib diisi' });
        if (!data.guardianEducation) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardianEducation'], message: 'Pendidikan Wali wajib diisi' });
        if (!data.guardianOccupation) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardianOccupation'], message: 'Pekerjaan Wali wajib diisi' });
        if (!data.guardianIncome) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardianIncome'], message: 'Penghasilan Wali wajib diisi' });
        
        if (data.guardianOccupation === ParentOccupation.LAINNYA && !data.guardianOccupationOther?.trim()) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardianOccupationOther'], message: 'Detail pekerjaan Wali wajib diisi' });
        }
    }
});

// --- Inferred Types ---
export type FormData = z.infer<typeof formSchema>;

export type FormErrors = {
    [key: string]: string | string[];
};
