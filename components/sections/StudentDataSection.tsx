
import React from 'react';
import { FormData, FormErrors, Gender, SchoolLevel } from '../../types';
import Input from '../Input';
import Select from '../Select';
import TextArea from '../TextArea';

interface Props {
    formData: FormData;
    errors: FormErrors;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const StudentDataSection: React.FC<Props> = ({ formData, errors, handleChange, handleBlur }) => {
    // Hitung tahun maksimal (misal: minimal umur 10 tahun untuk masuk Ponpes/SMP)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 9);
    const maxDateString = maxDate.toISOString().split('T')[0];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Section Header */}
            <div className="flex items-start sm:items-center gap-4 border-b border-stone-200 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 shrink-0 shadow-sm border border-primary-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-stone-800 font-serif">Biodata Santri</h3>
                    <p className="text-sm text-stone-500 mt-1">Isi data pribadi calon santri sesuai dengan dokumen resmi (Ijazah/Akta).</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 sm:gap-y-8 sm:gap-x-8 sm:grid-cols-6">
                
                {/* Pilihan Jenjang - Highlighted */}
                <div className="sm:col-span-6">
                    <div className="bg-gradient-to-r from-primary-50 to-white p-6 rounded-2xl border border-primary-100 shadow-sm">
                        <Select label="Daftar Untuk Jenjang" id="schoolChoice" name="schoolChoice" value={formData.schoolChoice} onChange={handleChange} onBlur={handleBlur} error={errors.schoolChoice} required>
                            {Object.values(SchoolLevel).map(level => <option key={level} value={level}>{level}</option>)}
                        </Select>
                        <div className="mt-3 flex gap-2 items-start">
                            <svg className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-xs text-primary-700 font-medium leading-relaxed">
                                Mohon pastikan pilihan jenjang pendidikan (SMP/SMK) sudah benar.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="sm:col-span-6">
                    <Input label="Nama Lengkap" id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} error={errors.fullName} required autoComplete="name" placeholder="Masukkan nama sesuai Ijazah/Akta" />
                </div>
                
                <div className="sm:col-span-3">
                    <Input label="Tempat Lahir" id="birthPlace" name="birthPlace" type="text" value={formData.birthPlace} onChange={handleChange} onBlur={handleBlur} error={errors.birthPlace} required placeholder="Contoh: Jakarta" />
                </div>
                
                <div className="sm:col-span-3">
                    <Input 
                        label="Tanggal Lahir" 
                        id="birthDate" 
                        name="birthDate" 
                        type="date" 
                        max={maxDateString}
                        value={formData.birthDate} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        error={errors.birthDate} 
                        required 
                    />
                </div>

                <div className="sm:col-span-3">
                    <Select label="Jenis Kelamin" id="gender" name="gender" value={formData.gender} onChange={handleChange} onBlur={handleBlur} error={errors.gender} required>
                        {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                    </Select>
                </div>

                <div className="sm:col-span-3">
                    <Input 
                        label="NISN" 
                        id="nisn" 
                        name="nisn" 
                        type="text" 
                        pattern="\d{10}" 
                        maxLength={10} 
                        value={formData.nisn} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        error={errors.nisn} 
                        required 
                        inputMode="numeric" 
                        placeholder="10 digit angka"
                        topRightLabel={
                            <a 
                                href="https://nisn.data.kemdikbud.go.id/index.php/Cindex/formcaribynama/" 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[10px] font-bold text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1 transition-colors"
                            >
                                Cek NISN Online
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                        }
                    />
                </div>

                <div className="sm:col-span-6">
                    <Input label="Asal Sekolah (SD/MI/SMP/MTs)" id="previousSchool" name="previousSchool" type="text" value={formData.previousSchool} onChange={handleChange} onBlur={handleBlur} error={errors.previousSchool} required placeholder="Nama sekolah sebelumnya" />
                </div>
                
                {/* ALAMAT DIPECAH */}
                <div className="sm:col-span-6 border-t border-stone-200 pt-6 mt-2">
                    <h4 className="text-sm font-bold text-stone-700 mb-4">Alamat Tempat Tinggal</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-x-6 gap-y-4">
                        <div className="sm:col-span-3">
                             <Input label="Provinsi" id="province" name="province" type="text" value={formData.province} onChange={handleChange} onBlur={handleBlur} error={errors.province} required placeholder="Jawa Timur" />
                        </div>
                        <div className="sm:col-span-3">
                             <Input label="Kabupaten / Kota" id="city" name="city" type="text" value={formData.city} onChange={handleChange} onBlur={handleBlur} error={errors.city} required placeholder="Surabaya" />
                        </div>
                        <div className="sm:col-span-2">
                             <Input label="Kecamatan" id="district" name="district" type="text" value={formData.district} onChange={handleChange} onBlur={handleBlur} error={errors.district} required placeholder="Tegalsari" />
                        </div>
                        <div className="sm:col-span-4">
                             <Input label="Detail Jalan / RT / RW" id="specificAddress" name="specificAddress" type="text" value={formData.specificAddress} onChange={handleChange} onBlur={handleBlur} error={errors.specificAddress} required placeholder="Jl. Mawar No. 12, RT 01 RW 02, Dusun A" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDataSection;
