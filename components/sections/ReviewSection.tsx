
import React, { useEffect, useRef } from 'react';
import { FormData, FormErrors, SchoolLevel } from '../../types';

interface Props {
    formData: FormData;
    errors: FormErrors;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onEditStep: (step: number) => void;
    setTurnstileToken: (token: string) => void; 
}

const ReviewSection: React.FC<Props> = ({ formData, errors, handleChange, onEditStep, setTurnstileToken }) => {
    const turnstileRef = useRef<HTMLDivElement>(null);

    // Initialize Turnstile
    useEffect(() => {
        // Site Key Produksi dari Cloudflare
        const siteKey = '0x4AAAAAACU2RCccspWW1RvL';

        if (turnstileRef.current && (window as any).turnstile) {
            turnstileRef.current.innerHTML = '';
            
            try {
                (window as any).turnstile.render(turnstileRef.current, {
                    sitekey: siteKey, 
                    callback: function(token: string) {
                        setTurnstileToken(token);
                    },
                    'expired-callback': function() {
                        setTurnstileToken('');
                    },
                });
            } catch (e) {
                console.error("Turnstile render error:", e);
            }
        }
    }, [setTurnstileToken]);

    const DataRow = ({ label, value }: { label: string, value: string }) => (
        <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-stone-100 last:border-0 gap-1 sm:gap-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-stone-400 uppercase tracking-wider">{label}</span>
            <span className="text-sm font-semibold text-stone-800 break-words">{value || '-'}</span>
        </div>
    );

    const SectionHeader = ({ title, step }: { title: string, step: number }) => (
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-100">
            <h4 className="text-xs font-black text-primary-700 uppercase tracking-widest">{title}</h4>
            <button 
                type="button" 
                onClick={() => onEditStep(step)} 
                className="text-[10px] font-bold text-primary-600 hover:text-primary-800 uppercase bg-primary-50 px-2 py-1 rounded transition-colors"
            >
                Edit
            </button>
        </div>
    );

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-4 border-b border-stone-200 pb-4">
                <div className="w-10 h-10 rounded bg-accent-100 flex items-center justify-center text-accent-700 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
                <div>
                    <h3 className="text-lg sm:text-xl font-bold text-stone-800">Cek Data Santri</h3>
                    <p className="text-xs sm:text-sm text-stone-500">Pastikan seluruh data sudah benar sebelum dikirim.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Kolom Kiri: Ringkasan Data */}
                <div className="space-y-6">
                    
                    <div className="bg-stone-50 rounded-xl p-4 sm:p-5 border border-stone-200 shadow-sm">
                        <SectionHeader title="Biodata Santri" step={2} />
                        <div className="mb-3 bg-primary-50 p-2 rounded text-center border border-primary-100">
                            <span className="text-xs text-primary-600 font-bold uppercase block mb-1">Jenjang Pilihan</span>
                            <span className="text-base text-primary-800 font-bold">
                                {formData.schoolChoice} 
                                {formData.schoolChoice === SchoolLevel.SMK && <span className="block text-sm text-primary-600 font-medium">({formData.smkMajor})</span>}
                            </span>
                        </div>
                        <DataRow label="Nama Lengkap" value={formData.fullName} />
                        <DataRow label="NIK" value={formData.nik} />
                        <DataRow label="NISN" value={formData.nisn} />
                        <DataRow label="TTL" value={`${formData.birthPlace}, ${formData.birthDate}`} />
                        <DataRow label="Asal Sekolah" value={formData.previousSchool} />
                        <DataRow 
                            label="Alamat Lengkap" 
                            value={`${formData.specificAddress}, RT ${formData.rt} / RW ${formData.rw}, ${formData.village}, ${formData.district}, ${formData.city}, ${formData.province}, ${formData.postalCode}`} 
                        />
                        <DataRow label="Kontak HP Utama" value={formData.parentWaNumber} />
                    </div>

                     <div className="bg-stone-50 rounded-xl p-4 sm:p-5 border border-stone-200 shadow-sm">
                        <SectionHeader title="Data Periodik" step={2} />
                        <div className="grid grid-cols-2 gap-x-4">
                             <DataRow label="Tinggi" value={`${formData.height} cm`} />
                             <DataRow label="Berat" value={`${formData.weight} kg`} />
                             <DataRow label="Saudara" value={`${formData.siblingCount} org`} />
                             <DataRow label="Anak Ke" value={formData.childOrder} />
                        </div>
                    </div>

                    <div className="bg-stone-50 rounded-xl p-4 sm:p-5 border border-stone-200 shadow-sm">
                        <SectionHeader title="Data Ortu & Wali" step={3} />
                        <DataRow label="Nama Ayah" value={formData.fatherName} />
                        <DataRow label="Pekerjaan Ayah" value={formData.fatherOccupation} />
                        <DataRow label="Nama Ibu" value={formData.motherName} />
                        <DataRow label="Pekerjaan Ibu" value={formData.motherOccupation} />
                        {formData.hasGuardian && (
                             <div className="mt-2 pt-2 border-t border-stone-200">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Wali Murid</span>
                                <DataRow label="Nama" value={formData.guardianName || '-'} />
                                <DataRow label="Hubungan" value="Wali" />
                             </div>
                        )}
                    </div>
                </div>

                {/* Kolom Kanan: Dokumen & Persetujuan */}
                <div className="space-y-6">
                    <div className="bg-primary-50/50 rounded-xl p-4 sm:p-5 border border-primary-100">
                        <SectionHeader title="Berkas Dokumen" step={4} />
                        <ul className="space-y-3 mb-4">
                            {[
                                { name: 'Kartu Keluarga', file: formData.kartuKeluarga },
                                { name: 'Akta Kelahiran', file: formData.aktaKelahiran },
                                { name: 'KTP Orang Tua/Wali', file: formData.ktpWalimurid },
                                { name: 'Pas Foto Santri', file: formData.pasFoto },
                                { name: 'Ijazah Terakhir', file: formData.ijazah },
                            ].map((doc, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                                    {doc.file ? (
                                        <>
                                            <div className="w-6 h-6 rounded-full bg-primary-200 flex items-center justify-center shrink-0">
                                                <svg className="w-3 h-3 text-primary-800" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-primary-900 block">{doc.name}</span> 
                                                <span className="text-[10px] text-primary-600 truncate block">{doc.file.name}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                             <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                                <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-red-700">{doc.name}</span>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>

                        <div className="border-t border-primary-200 pt-3">
                            <SectionHeader title="Pembayaran" step={5} />
                            <div className="flex items-center gap-3 text-sm font-medium">
                                {formData.buktiPembayaran ? (
                                    <>
                                        <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center shrink-0">
                                            <svg className="w-3 h-3 text-emerald-800" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-emerald-900 block">Bukti Pembayaran</span> 
                                            <span className="text-[10px] text-emerald-600 truncate block">{formData.buktiPembayaran.name}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                            <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-red-700">Bukti Pembayaran</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${formData.termsAgreed ? 'bg-white border-accent-500 shadow-lg shadow-accent-100' : 'bg-stone-50 border-stone-200'}`}>
                        <label className="flex items-start gap-3 sm:gap-4 cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="termsAgreed"
                                checked={formData.termsAgreed}
                                onChange={(e) => handleChange(e as any)}
                                className="mt-1 h-5 w-5 rounded border-stone-300 text-accent-600 focus:ring-accent-500 transition-all cursor-pointer shrink-0"
                            />
                            <div className="flex-1">
                                <span className="block text-sm font-bold text-stone-800 mb-1">Ikrar Kebenaran Data</span>
                                <p className="text-xs text-stone-500 leading-relaxed text-justify">
                                    Bismillah. Saya menyatakan bahwa seluruh data calon santri yang saya inputkan adalah benar dan dapat dipertanggungjawabkan.
                                </p>
                                {errors.termsAgreed && <p className="mt-2 text-[10px] font-bold text-red-600 uppercase tracking-wider">{errors.termsAgreed}</p>}
                            </div>
                        </label>
                    </div>

                    {/* TURNSTILE WIDGET CONTAINER */}
                    <div className="flex justify-center">
                        <div ref={turnstileRef} className="min-h-[65px]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewSection;
