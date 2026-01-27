
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
    SMP = 'SMP Bhumi Ngasor',
    SMK = 'SMK Bhumi Ngasor',
}

export enum Gender {
    LakiLaki = 'Laki-laki',
    Perempuan = 'Perempuan',
}

export enum ParentOccupation {
    PNS = 'PNS',
    TNI_POLRI = 'TNI/POLRI',
    WIRASWASTA = 'Wiraswasta',
    KARYAWAN_SWASTA = 'Karyawan Swasta',
    PETANI = 'Petani',
    NELAYAN = 'Nelayan',
    IRT = 'Ibu Rumah Tangga',
    TIDAK_BEKERJA = 'Tidak Bekerja',
    LAINNYA = 'Lainnya...',
}

// --- Zod Schema ---
export const baseFormSchema = z.object({
    // Security Field (Honeypot) - Should be empty
    botField: z.string().optional(),

    // Step 1: Survey (New)
    infoSource: z.array(z.string()).min(1, 'Mohon pilih setidaknya satu sumber informasi.'),

    // Step 2: Student Data
    schoolChoice: z.nativeEnum(SchoolLevel),
    fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
    nik: z.string().regex(/^\d{16}$/, 'NIK harus terdiri dari 16 digit angka'), // ADDED NIK
    birthPlace: z.string().min(1, 'Tempat lahir wajib diisi'),
    birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
    
    // Alamat Dipecah
    province: z.string().min(1, 'Provinsi wajib diisi'),
    city: z.string().min(1, 'Kabupaten/Kota wajib diisi'),
    district: z.string().min(1, 'Kecamatan wajib diisi'),
    village: z.string().min(1, 'Desa/Kelurahan wajib diisi'), // NEW
    rt: z.string().min(1, 'RT wajib diisi'), // NEW
    rw: z.string().min(1, 'RW wajib diisi'), // NEW
    postalCode: z.string().regex(/^\d{5}$/, 'Kode Pos harus 5 digit angka'), // NEW
    specificAddress: z.string().min(1, 'Detail Jalan/Dusun wajib diisi'),

    previousSchool: z.string().min(1, 'Asal sekolah wajib diisi'),
    nisn: z.string().regex(/^\d{10}$/, 'NISN harus terdiri dari 10 digit angka'),
    gender: z.nativeEnum(Gender),
    
    // Step 3: Parent Data
    fatherName: z.string().min(1, 'Nama ayah wajib diisi'),
    fatherOccupation: z.nativeEnum(ParentOccupation),
    fatherOccupationOther: z.string().optional(),
    motherName: z.string().min(1, 'Nama ibu wajib diisi'),
    motherOccupation: z.nativeEnum(ParentOccupation),
    motherOccupationOther: z.string().optional(),
    parentWaNumber: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{7,11}$/, 'No. WA tidak valid, contoh: 08123456789'),

    // Step 4: Document Upload
    kartuKeluarga: requiredFileSchema('File Kartu Keluarga wajib diunggah'),
    aktaKelahiran: requiredFileSchema('File Akta Kelahiran wajib diunggah'),
    ktpWalimurid: requiredFileSchema('File KTP Wali Murid wajib diunggah'),
    pasFoto: requiredImageSchema('Pas Foto wajib diunggah'),
    ijazah: requiredFileSchema('File Ijazah (SD/MI/SMP/Mts) wajib diunggah'),
    buktiPembayaran: requiredImageSchema('Bukti Pembayaran wajib diunggah'),

    // Step 5: Final Confirmation
    termsAgreed: z.boolean().refine(val => val === true, "Anda harus menyetujui pernyataan kebenaran data"),
});

// Refined schema for full validation
export const formSchema = baseFormSchema.superRefine((data, ctx) => {
    if (data.fatherOccupation === ParentOccupation.LAINNYA && !data.fatherOccupationOther?.trim()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['fatherOccupationOther'],
            message: 'Pekerjaan Ayah wajib diisi',
        });
    }
    if (data.motherOccupation === ParentOccupation.LAINNYA && !data.motherOccupationOther?.trim()) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['motherOccupationOther'],
            message: 'Pekerjaan Ibu wajib diisi',
        });
    }
});

// --- Inferred Types ---
export type FormData = z.infer<typeof formSchema>;

export type FormErrors = {
    [K in Extract<keyof FormData, string>]?: string | string[];
};
