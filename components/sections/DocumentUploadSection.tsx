
import React from 'react';
import { FormData, FormErrors } from '../../types';
import FileInput from '../FileInput';

interface Props {
    formData: FormData;
    errors: FormErrors;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleFileClear: (name: keyof FormData) => void;
}

const DocumentUploadSection: React.FC<Props> = ({ formData, errors, handleFileChange, handleFileClear }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex items-center gap-4 border-b border-stone-200 pb-4">
                <div className="w-10 h-10 rounded bg-primary-100 flex items-center justify-center text-primary-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-stone-800">Unggah Dokumen</h3>
                    <p className="text-sm text-stone-500">Lampirkan scan dokumen asli untuk verifikasi data santri.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="group">
                    <FileInput 
                        label="Kartu Keluarga" 
                        id="kartuKeluarga" 
                        name="kartuKeluarga" 
                        onChange={handleFileChange} 
                        onClear={() => handleFileClear('kartuKeluarga')}
                        error={errors.kartuKeluarga} 
                        required 
                        accept="image/*,.pdf" 
                        file={formData.kartuKeluarga} 
                    />
                </div>
                <div className="group">
                    <FileInput 
                        label="Akta Kelahiran" 
                        id="aktaKelahiran" 
                        name="aktaKelahiran" 
                        onChange={handleFileChange} 
                        onClear={() => handleFileClear('aktaKelahiran')}
                        error={errors.aktaKelahiran} 
                        required 
                        accept="image/*,.pdf" 
                        file={formData.aktaKelahiran} 
                    />
                </div>
                <div className="group">
                    <FileInput 
                        label="KTP Orang Tua / Wali" 
                        id="ktpWalimurid" 
                        name="ktpWalimurid" 
                        onChange={handleFileChange} 
                        onClear={() => handleFileClear('ktpWalimurid')}
                        error={errors.ktpWalimurid} 
                        required 
                        accept="image/*,.pdf" 
                        file={formData.ktpWalimurid} 
                    />
                </div>
                <div className="group sm:col-span-2">
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-2">
                         <FileInput 
                            label="Pas Foto Santri (3x4)" 
                            id="pasFoto" 
                            name="pasFoto" 
                            onChange={handleFileChange} 
                            onClear={() => handleFileClear('pasFoto')}
                            error={errors.pasFoto} 
                            required 
                            accept="image/*" 
                            file={formData.pasFoto} 
                            showPreview 
                        />
                         <p className="text-xs text-blue-600 font-semibold mt-2 text-center">
                            *Ketentuan: Baju Putih, Kopyah Hitam dan Background Biru
                        </p>
                    </div>
                </div>
                <div className="group sm:col-span-2">
                    <FileInput 
                        label="Ijazah Terakhir (SD/MI/SMP/MTs)" 
                        id="ijazah" 
                        name="ijazah" 
                        onChange={handleFileChange} 
                        onClear={() => handleFileClear('ijazah')}
                        error={errors.ijazah} 
                        required 
                        accept="image/*,.pdf" 
                        file={formData.ijazah} 
                    />
                </div>
            </div>
            
            <div className="bg-accent-50 border border-accent-100 p-4 rounded-xl flex gap-4 items-start">
                <div className="bg-accent-100 p-2 rounded text-accent-700 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-xs text-accent-800 leading-relaxed font-medium">
                    Pastikan dokumen terbaca jelas. Format yang diterima: <strong>JPG, PNG, atau PDF</strong> dengan ukuran maksimal 2MB per file.
                </p>
            </div>
        </div>
    );
};

export default DocumentUploadSection;
