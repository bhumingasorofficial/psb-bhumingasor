
import React, { useState, useCallback, useEffect } from 'react';
import { FormData, formSchema, baseFormSchema, FormErrors, Gender, ParentOccupation, SchoolLevel } from './types';
import { validateStep } from './utils/validation';
import StudentDataSection from './components/sections/StudentDataSection';
import ParentDataSection from './components/sections/ParentDataSection';
import DocumentUploadSection from './components/sections/DocumentUploadSection';
import PaymentSection from './components/sections/PaymentSection';
import ReviewSection from './components/sections/ReviewSection';
import SurveySection from './components/sections/SurveySection';
import Stepper from './components/Stepper';
import Toast, { ToastMessage, ToastType } from './components/Toast';

// UPDATE: Menambahkan langkah 'Pembayaran'
const STEPS = ['Survey', 'Siswa', 'Orang Tua', 'Berkas', 'Pembayaran', 'Selesai'];

const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyZJDWxfVViSiCQpF2iPd_WQW0AWtd_WM30MUuTT28D4ERpzp1Ml_oh_yN-nQGoB7e0dg/exec'; 
const LOGO_URL = 'https://github.com/bhumingasorofficial/asset-bhumingasor/blob/bb73c4a939d695cbe48e58d7ea869977bdc57acd/Logo%20Yayasan%20Pondok%20Pesantren%20Bhumi%20Ngasor.png?raw=true';

// WA NUMBERS CONFIGURATION
const WA_NUMBER_MALE = '6281333123600';   // Admin Putra
const WA_NUMBER_FEMALE = '6282231314199'; // Admin Putri
const WA_NUMBER_HELP = '6281333123600';   // Admin Bantuan (Umum)

const STORAGE_KEY = 'psb_pesantren_draft_v1';

// --- STATIC UI COMPONENTS (Moved Outside App for Better Performance) ---

const BrandHeader = () => (
    <div className="flex flex-col items-center justify-center mb-6 sm:mb-8 animate-fade-up text-center px-4">
        <div className="bg-white p-2 sm:p-3 rounded-2xl shadow-sm mb-3 sm:mb-4">
            <img src={LOGO_URL} alt="Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
        </div>
        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans leading-tight max-w-3xl">
            Penerimaan Santri Baru<br className="hidden sm:block" /> Pondok Pesantren Bhumi Ngasor
        </h1>
        <span className="mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] sm:text-[11px] font-bold tracking-[0.2em] rounded-full uppercase border border-emerald-100">
            Tahun Ajaran 2026/2027
        </span>
    </div>
);

const FloatingHelp = () => (
    <a 
        href={`https://wa.me/${WA_NUMBER_HELP}?text=Assalamu'alaikum Admin, saya mau tanya tentang Pendaftaran Santri Baru.`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-full shadow-lg transition-all hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-10 no-print"
    >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        <span className="font-bold hidden sm:block">Butuh Bantuan?</span>
    </a>
);

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
    const [showWelcome, setShowWelcome] = useState(true);
    const initialFormData: FormData = {
        botField: '',
        infoSource: [],
        schoolChoice: SchoolLevel.SMP,
        fullName: '',
        nik: '', 
        birthPlace: '',
        birthDate: '',
        province: '',
        city: '',
        district: '',
        village: '', // ADDED
        rt: '',      // ADDED
        rw: '',      // ADDED
        postalCode: '', // ADDED
        specificAddress: '',
        previousSchool: '',
        nisn: '',
        gender: Gender.LakiLaki,
        fatherName: '',
        fatherOccupation: ParentOccupation.WIRASWASTA,
        fatherOccupationOther: '',
        motherName: '',
        motherOccupation: ParentOccupation.IRT,
        motherOccupationOther: '',
        parentWaNumber: '',
        kartuKeluarga: null as any,
        aktaKelahiran: null as any,
        ktpWalimurid: null as any,
        pasFoto: null as any,
        ijazah: null as any,
        buktiPembayaran: null as any,
        termsAgreed: false,
    };

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    
    // UX Update: Loading State String instead of Boolean
    const [loadingStatus, setLoadingStatus] = useState<string>('');
    
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error' | 'server_error'>('idle');
    const [registrationId, setRegistrationId] = useState('');
    const [isDraftLoaded, setIsDraftLoaded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = (type: ToastType, title: string, message: string) => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, type, title, message }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // UX: Prevent Accidental Refresh
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (currentStep > 1 && submissionStatus === 'idle') {
                e.preventDefault();
                e.returnValue = ''; // Legacy browsers
                return '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [currentStep, submissionStatus]);

    useEffect(() => {
        const handleOnline = () => { setIsOnline(true); addToast('success', 'Kembali Online', 'Koneksi internet Anda telah pulih.'); };
        const handleOffline = () => { setIsOnline(false); addToast('error', 'Koneksi Terputus', 'Mohon periksa sambungan internet Anda.'); };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
    }, []);

    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setFormData(prev => ({ 
                    ...prev, 
                    ...parsed, 
                    // Reset files as they cannot be stored in localStorage
                    kartuKeluarga: null, 
                    aktaKelahiran: null, 
                    ktpWalimurid: null, 
                    pasFoto: null, 
                    ijazah: null,
                    buktiPembayaran: null,
                    termsAgreed: false 
                }));
                setIsDraftLoaded(true);
            } catch (e) { console.error("Gagal load draft", e); }
        }
    }, []);

    useEffect(() => {
        if (submissionStatus === 'idle') {
            setIsSaving(true);
            const timer = setTimeout(() => {
                const dataToSave = { ...formData };
                delete (dataToSave as any).kartuKeluarga;
                delete (dataToSave as any).aktaKelahiran;
                delete (dataToSave as any).ktpWalimurid;
                delete (dataToSave as any).pasFoto;
                delete (dataToSave as any).ijazah;
                delete (dataToSave as any).buktiPembayaran;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
                setIsSaving(false);
            }, 1000); 
            return () => clearTimeout(timer);
        }
    }, [formData, submissionStatus]);

    useEffect(() => {
        if (isDraftLoaded) {
            const timer = setTimeout(() => setIsDraftLoaded(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [isDraftLoaded]);

    // TECH RISK: Aggressive Compression (Max 800px, Quality 0.5)
    const compressImage = (file: File, maxWidth = 800, quality = 0.5): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    if (width > maxWidth) {
                        height = (maxWidth / width) * height;
                        width = maxWidth;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', quality));
                    } else { reject(new Error("Canvas context error")); }
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
        });
    };

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (name === 'nisn') {
            setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 10) }));
            return;
        }
        if (name === 'nik') {
            setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 16) }));
            return;
        }
        if (name === 'postalCode') {
            setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 5) }));
            return;
        }
        if (name === 'parentWaNumber') {
            setFormData(prev => ({ ...prev, [name]: value.replace(/[^0-9+]/g, '') }));
            return;
        }
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    }, []);

    const handleSurveyChange = useCallback((selected: string[]) => {
        setFormData(prev => ({ ...prev, infoSource: selected }));
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files?.[0]) {
            if (files[0].size > 2 * 1024 * 1024) {
                addToast('warning', 'Ukuran File Terlalu Besar', 'Maksimal ukuran file adalah 2MB.');
                e.target.value = '';
                return;
            }
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        }
    }, []);

    const handleFileClear = useCallback((fieldName: keyof FormData) => {
        setFormData(prev => ({ ...prev, [fieldName]: null }));
    }, []);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (typeof value === 'string') setFormData(prev => ({ ...prev, [name]: value.trim() }));
        if ((name === 'fatherOccupationOther' || name === 'motherOccupationOther') && !value) return;
        const fieldSchema = (baseFormSchema.shape as any)[name];
        if (fieldSchema) {
            const result = fieldSchema.safeParse(formData[name as keyof FormData]);
            if (!result.success) setErrors(prev => ({ ...prev, [name]: result.error.errors[0].message }));
            else setErrors(prev => { const newErrors = { ...prev }; delete newErrors[name as keyof FormErrors]; return newErrors; });
        }
    }, [formData]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isOnline) { addToast('error', 'Gagal Mengirim', 'Koneksi internet terputus.'); return; }
        if (formData.botField) { setSubmissionStatus('success'); return; }
        if (currentStep !== STEPS.length) { handleNext(); return; }

        const result = formSchema.safeParse(formData);
        if (!result.success) {
            setErrors(result.error.flatten().fieldErrors as FormErrors);
            const firstError = Object.keys(result.error.flatten().fieldErrors)[0];
            document.getElementById(firstError)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            addToast('warning', 'Data Belum Lengkap', 'Mohon lengkapi data yang ditandai merah.');
            return;
        }

        setLoadingStatus('Mempersiapkan Data...');
        
        try {
            const id = `PONPES-${Date.now().toString().slice(-6)}`;
            
            // CONCATENATE ADDRESS for Backend Compatibility
            // menggabungkan seluruh field alamat menjadi satu string lengkap
            const fullAddress = `${formData.specificAddress}, RT ${formData.rt} / RW ${formData.rw}, DS. ${formData.village}, KEC. ${formData.district}, ${formData.city}, ${formData.province}, ${formData.postalCode}`;

            const payload: any = {
                regId: id,
                infoSource: formData.infoSource.join(', '),
                schoolChoice: formData.schoolChoice,
                fullName: formData.fullName.trim(),
                nik: formData.nik.trim(), 
                nisn: formData.nisn.trim(),
                gender: formData.gender,
                birthPlace: formData.birthPlace.trim(),
                birthDate: formData.birthDate,
                previousSchool: formData.previousSchool.trim(),
                fatherName: formData.fatherName.trim(),
                fatherOccupation: formData.fatherOccupation === ParentOccupation.LAINNYA ? formData.fatherOccupationOther : formData.fatherOccupation,
                motherName: formData.motherName.trim(),
                motherOccupation: formData.motherOccupation === ParentOccupation.LAINNYA ? formData.motherOccupationOther : formData.motherOccupation,
                parentWaNumber: formData.parentWaNumber.trim(),
                address: fullAddress, // Send the combined address
            };

            const processFile = async (field: keyof FormData, base64Key: string, mimeKey: string, label: string) => {
                const file = formData[field] as File;
                if (file) {
                    setLoadingStatus(`Mengunggah ${label}...`);
                    let base64String = "";
                    if (file.type.startsWith('image/')) base64String = await compressImage(file);
                    else base64String = await fileToBase64(file);
                    const rawBase64 = base64String.includes('base64,') ? base64String.split('base64,')[1] : base64String;
                    payload[base64Key] = rawBase64;
                    payload[mimeKey] = file.type;
                } else { payload[base64Key] = ""; payload[mimeKey] = ""; }
            };

            await processFile('kartuKeluarga', 'kartuKeluargaBase64', 'kartuKeluargaMime', 'Kartu Keluarga');
            await processFile('aktaKelahiran', 'aktaKelahiranBase64', 'aktaKelahiranMime', 'Akta Kelahiran');
            await processFile('ktpWalimurid', 'ktpWalimuridBase64', 'ktpWalimuridMime', 'KTP Wali');
            await processFile('pasFoto', 'pasFotoBase64', 'pasFotoMime', 'Pas Foto');
            await processFile('ijazah', 'ijazahBase64', 'ijazahMime', 'Ijazah');
            await processFile('buktiPembayaran', 'buktiPembayaranBase64', 'buktiPembayaranMime', 'Bukti Bayar');

            setLoadingStatus('Mengirim ke Server...');
            await fetch(`${GOOGLE_SHEET_URL}?t=${Date.now()}`, {
                method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload)
            });

            await new Promise(r => setTimeout(r, 4000));
            localStorage.removeItem(STORAGE_KEY);
            setRegistrationId(id);
            setSubmissionStatus('success');
        } catch (err) { console.error(err); setSubmissionStatus('server_error'); } finally { setLoadingStatus(''); }
    };

    const handleNext = () => {
        const { success, errors: validationErrors } = validateStep(currentStep, formData);
        setErrors(validationErrors);
        if (success) { setCurrentStep(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } 
        else {
             document.getElementById(Object.keys(validationErrors)[0])?.scrollIntoView({ behavior: 'smooth', block: 'center' });
             if (currentStep === 1 && !formData.infoSource.length) window.scrollTo({ top: 0, behavior: 'smooth' }); 
             addToast('warning', 'Periksa Kembali', 'Terdapat isian yang belum lengkap.');
        }
    };

    const jumpToStep = (step: number) => {
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getWhatsAppLink = () => {
        // Tentukan nomor admin berdasarkan jenis kelamin santri
        // Jika Perempuan -> Admin Putri (WA_NUMBER_FEMALE)
        // Jika Laki-laki -> Admin Putra (WA_NUMBER_MALE)
        const targetNumber = formData.gender === Gender.Perempuan ? WA_NUMBER_FEMALE : WA_NUMBER_MALE;

        const message = `Assalamu'alaikum Admin, saya sudah mendaftar Santri Baru.\n\nNama: *${formData.fullName}*\nJenjang: *${formData.schoolChoice}*\nID: *${registrationId}*\n\nMohon dicek.`;
        return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
    };

    // --- LANDING PAGE MODE (RESTORED) ---
    if (showWelcome) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans no-print">
                <FloatingHelp />
                <div className="w-full max-w-lg bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] p-6 sm:p-10 relative overflow-hidden animate-fade-up">
                    <BrandHeader />
                    
                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 text-center">
                        <h2 className="text-lg font-bold text-emerald-900 mb-6">Alur Pendaftaran Online</h2>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {[
                                { step: 1, label: "Isi Survey Singkat" },
                                { step: 2, label: "Data Diri & Berkas" },
                                { step: 3, label: "Simpan Bukti" }
                            ].map((item) => (
                                <div key={item.step} className="bg-white rounded-2xl p-3 sm:p-4 flex flex-col items-center shadow-sm border border-emerald-100/50">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs sm:text-sm mb-2">
                                        {item.step}
                                    </div>
                                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-600 leading-tight">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowWelcome(false)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl text-lg shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                    >
                        MULAI PENDAFTARAN
                    </button>
                    
                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-8">
                        © 2026 PONDOK PESANTREN BHUMI NGASOR
                    </p>
                </div>
            </div>
        );
    }

    // --- SUCCESS PAGE MODE (WITH SEPARATE PRINT VIEW) ---
    if (submissionStatus === 'success') {
        const PrintRow = ({ label, value }: { label: string, value: string }) => (
            <tr className="border-b border-stone-200">
                <td className="py-2.5 font-bold text-stone-700 w-48 align-top text-xs uppercase tracking-wide">{label}</td>
                <td className="py-2.5 w-4 align-top text-stone-500 font-bold">:</td>
                <td className="py-2.5 text-stone-900 font-bold uppercase align-top leading-relaxed">{value}</td>
            </tr>
        );

        return (
            <>
                {/* --- SCREEN VIEW (HIDDEN ON PRINT) --- */}
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 no-print">
                    <FloatingHelp />
                    <div className="w-full max-w-lg bg-white rounded-[2rem] p-6 sm:p-10 shadow-xl text-center border border-slate-100">
                        {/* Header Part that seemed missing */}
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Pendaftaran Berhasil!</h2>
                        <p className="text-slate-500 mb-8">Data Anda telah berhasil disimpan.<br/>ID Pendaftaran: <span className="font-bold text-slate-800 select-all">{registrationId}</span></p>
                        
                        {/* WhatsApp Button */}
                        <a 
                            href={getWhatsAppLink()}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 mb-4 flex items-center justify-center gap-2"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            Konfirmasi WhatsApp
                        </a>

                        <div className="flex gap-3">
                            <button onClick={() => window.print()} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50">Cetak Bukti</button>
                            <button onClick={() => window.location.reload()} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50">Menu Utama</button>
                        </div>

                        {/* --- NEW: Mandatory Next Steps Instructions --- */}
                        <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4 text-left">
                            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                Langkah Selanjutnya (Wajib)
                            </h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
                                    <span className="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-[10px]">1</span>
                                    <span>
                                        Klik tombol <strong className="text-emerald-700">Konfirmasi WhatsApp</strong> di atas untuk melaporkan pendaftaran Anda kepada Admin agar segera diverifikasi.
                                    </span>
                                </li>
                                <li className="flex gap-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
                                    <span className="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-[10px]">2</span>
                                    <span>
                                        Klik <strong className="text-stone-800">Cetak Bukti</strong>, lalu simpan sebagai PDF atau cetak fisik. Bukti ini <strong>wajib dibawa</strong> saat melakukan daftar ulang di Pondok Pesantren Bhumi Ngasor.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* --- PRINT VIEW (VISIBLE ONLY ON PRINT) --- */}
                <div className="print-only bg-white p-12 text-black w-full h-full max-w-[210mm] mx-auto">
                    {/* Kop Surat Berwarna */}
                    <div className="flex items-center justify-between border-b-4 border-stone-800 pb-6 mb-8 relative">
                         {/* Green Line Accent */}
                         <div className="absolute -bottom-1 left-0 w-full h-1 bg-emerald-600"></div>

                        <div className="w-28 h-28 flex-shrink-0 mr-6">
                            <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 text-center">
                            <h2 className="text-xl font-bold uppercase tracking-wide mb-1 text-emerald-900 font-serif">YAYASAN PONDOK PESANTREN</h2>
                            <h1 className="text-3xl font-black uppercase mb-2 text-stone-900 font-serif tracking-tight">AN NUR HIDAYATUS SALAM BHUMI NGASOR</h1>
                            <p className="text-sm italic text-stone-600 font-medium">
                                Sekretariat: Jl. Pendhopo Kamulyan RT.02 RW.01 Dsn. Bakalan Kec. Bululawang Kab. Malang<br/>
                                Website: <span className="text-emerald-700">https://bhumingasor.com</span> | Email: <span className="text-emerald-700">smpbhumingasor@gmail.com</span>
                            </p>
                        </div>
                    </div>

                    {/* Judul Dokumen */}
                    <div className="text-center mb-10">
                        <h3 className="text-2xl font-black text-stone-900 underline decoration-4 decoration-emerald-500 underline-offset-8 mb-3 uppercase tracking-wider">TANDA BUKTI PENDAFTARAN</h3>
                        <p className="text-sm font-bold text-stone-500 uppercase tracking-[0.3em]">TAHUN AJARAN 2026/2027</p>
                    </div>

                    {/* ID Card Box Berwarna */}
                    <div className="border-2 border-emerald-500 bg-emerald-50/50 rounded-xl p-6 mb-10 flex justify-between items-center shadow-sm">
                        <div>
                            <p className="text-xs uppercase font-extrabold text-emerald-800 mb-1 tracking-wider">NOMOR REGISTRASI:</p>
                            <p className="text-4xl font-mono font-black tracking-widest text-stone-900">{registrationId}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-xs uppercase font-extrabold text-emerald-800 mb-1 tracking-wider">TANGGAL DAFTAR:</p>
                             <p className="text-xl font-bold text-stone-800">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'})}</p>
                        </div>
                    </div>

                    {/* Biodata Table Berwarna */}
                    <div className="mb-10">
                        <table className="w-full text-sm">
                            <tbody>
                                <PrintRow label="JENJANG PENDIDIKAN" value={formData.schoolChoice} />
                                <PrintRow label="NAMA LENGKAP" value={formData.fullName} />
                                <PrintRow label="NISN" value={formData.nisn} />
                                <PrintRow label="TEMPAT, TGL LAHIR" value={`${formData.birthPlace}, ${formData.birthDate}`} />
                                <PrintRow label="JENIS KELAMIN" value={formData.gender} />
                                <PrintRow 
                                    label="ALAMAT LENGKAP" 
                                    value={`${formData.specificAddress}, RT ${formData.rt} / RW ${formData.rw}, DS. ${formData.village}, KEC. ${formData.district}, ${formData.city}, ${formData.province}, ${formData.postalCode}`} 
                                />
                                <PrintRow label="NAMA ORANG TUA" value={`${formData.fatherName} / ${formData.motherName}`} />
                                <PrintRow label="NO. WHATSAPP" value={formData.parentWaNumber} />
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Info Box */}
                    <div className="bg-amber-50 p-5 border-l-4 border-amber-400 text-xs mb-16 rounded-r-lg">
                        <strong className="text-amber-900 uppercase tracking-wide block mb-2">CATATAN PENTING:</strong>
                        <ul className="list-disc pl-5 space-y-1.5 text-stone-700 font-medium">
                            <li>Kartu ini adalah bukti sah pendaftaran santri baru Pondok Pesantren Bhumi Ngasor.</li>
                            <li>Harap simpan kartu ini dan dibawa saat melakukan daftar ulang atau tes masuk.</li>
                            <li>Informasi lebih lanjut dapat menghubungi Panitia PSB melalui nomor WhatsApp yang tertera di website.</li>
                        </ul>
                    </div>

                    {/* Tanda Tangan */}
                    <div className="flex justify-between text-center mt-12 px-8">
                        <div className="w-64">
                            <p className="mb-24 font-bold text-stone-600">Panitia PSB,</p>
                            <div className="border-b-2 border-stone-800 w-full"></div>
                            <p className="mt-1 text-xs text-stone-400 font-bold">( Tanda Tangan & Stempel )</p>
                        </div>
                        <div className="w-64">
                            <p className="mb-24 font-bold text-stone-600">Orang Tua / Wali,</p>
                            <p className="font-bold text-stone-900 text-lg border-b-2 border-stone-800 uppercase pb-1 inline-block min-w-full">
                                ( {formData.fatherName} )
                            </p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (submissionStatus === 'server_error') {
         return (
             <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                 <FloatingHelp />
                 <div className="w-full max-w-md bg-white rounded-[2rem] p-10 shadow-xl text-center border border-slate-100">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Terjadi Kesalahan</h3>
                    <p className="text-slate-500 mb-8 text-sm">Gagal terhubung ke server. Mohon periksa koneksi Anda dan coba lagi.</p>
                    <button onClick={() => setSubmissionStatus('idle')} className="w-full py-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-600/20 text-sm">Coba Lagi</button>
                 </div>
             </div>
         );
    }

    // --- MAIN FORM MODE ---
    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center py-6 sm:py-12 px-3 sm:px-4 no-print">
            <Toast toasts={toasts} removeToast={removeToast} />
            
            {/* Loading Overlay with Feedback */}
            {loadingStatus && (
                <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
                    <p className="font-bold tracking-widest text-emerald-800 animate-pulse text-sm uppercase">{loadingStatus}</p>
                    <p className="text-xs text-slate-400 mt-2">Mohon jangan tutup halaman ini</p>
                </div>
            )}

            {isDraftLoaded && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-amber-100 text-amber-800 px-6 py-2 rounded-full shadow-sm text-xs font-bold flex items-center gap-2 animate-fade-up border border-amber-200">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span> Draft Loaded
                </div>
            )}

            <FloatingHelp />

            {/* BRAND HEADER - OUTSIDE CARD */}
            <BrandHeader />

            {/* MAIN CARD CONTAINER */}
            <div className="w-full max-w-4xl bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-5 sm:p-12 relative">
                
                {/* STEPPER INSIDE CARD */}
                <div className="mb-8 sm:mb-14">
                    <Stepper steps={STEPS} currentStep={currentStep} />
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="opacity-0 absolute h-0 w-0 overflow-hidden"><input type="text" name="botField" value={formData.botField} onChange={handleChange} tabIndex={-1} autoComplete="off" /></div>
                    
                    <div className="min-h-[300px]">
                        {currentStep === 1 && <SurveySection formData={formData} errors={errors} onSelectionChange={handleSurveyChange} />}
                        {currentStep === 2 && <StudentDataSection formData={formData} errors={errors} handleChange={handleChange} handleBlur={handleBlur} />}
                        {currentStep === 3 && <ParentDataSection formData={formData} errors={errors} handleChange={handleChange} handleBlur={handleBlur} />}
                        {currentStep === 4 && <DocumentUploadSection formData={formData} errors={errors} handleFileChange={handleFileChange} handleFileClear={handleFileClear} />}
                        {currentStep === 5 && <PaymentSection formData={formData} errors={errors} handleFileChange={handleFileChange} handleFileClear={handleFileClear} />}
                        {currentStep === 6 && <ReviewSection formData={formData} errors={errors} handleChange={handleChange} onEditStep={jumpToStep} />}
                    </div>

                    {/* NAVIGATION BUTTONS */}
                    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-between gap-4">
                        {currentStep > 1 ? (
                            <button 
                                type="button" 
                                onClick={() => { setCurrentStep(p => p - 1); window.scrollTo({top:0, behavior:'smooth'}); }} 
                                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all text-sm"
                            >
                                Kembali
                            </button>
                        ) : (
                            <div className="hidden sm:block"></div> 
                        )}
                        
                        <button 
                            type="submit" 
                            disabled={!!loadingStatus || (currentStep === 6 && !formData.termsAgreed)} 
                            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-emerald-600 text-white font-bold shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                        >
                            {currentStep < 6 ? 'Langkah Selanjutnya' : 'Kirim Formulir'}
                            {currentStep < 6 && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                        </button>
                    </div>
                </form>

            </div>
            
            <div className="mt-8 sm:mt-12 text-center text-slate-400 text-[10px] font-bold tracking-widest uppercase">
                © 2026 PONDOK PESANTREN BHUMI NGASOR
            </div>
        </div>
    );
};

export default App;
