
import React, { useState, useCallback, useEffect } from 'react';
import { FormData, formSchema, baseFormSchema, FormErrors, Gender, ParentOccupation, SchoolLevel, ParentEducation, ParentIncome } from './types';
import { validateStep } from './utils/validation';
import StudentDataSection from './components/sections/StudentDataSection';
import ParentDataSection from './components/sections/ParentDataSection';
import DocumentUploadSection from './components/sections/DocumentUploadSection';
import PaymentSection from './components/sections/PaymentSection';
import ReviewSection from './components/sections/ReviewSection';
import SurveySection from './components/sections/SurveySection';
import Stepper from './components/Stepper';
import Toast, { ToastMessage, ToastType } from './components/Toast';

const STEPS = ['Survey', 'Siswa', 'Orang Tua', 'Berkas', 'Pembayaran', 'Selesai'];

// URL Web App GAS (Pastikan ini sesuai dengan deployment terbaru Anda)
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyZJDWxfVViSiCQpF2iPd_WQW0AWtd_WM30MUuTT28D4ERpzp1Ml_oh_yN-nQGoB7e0dg/exec'; 
const LOGO_URL = 'https://github.com/bhumingasorofficial/asset-bhumingasor/blob/bb73c4a939d695cbe48e58d7ea869977bdc57acd/Logo%20Yayasan%20Pondok%20Pesantren%20Bhumi%20Ngasor.png?raw=true';

// WA NUMBERS CONFIGURATION
const WA_NUMBER_MALE = '6281333123600';   
const WA_NUMBER_FEMALE = '6282231314199'; 
const WA_NUMBER_HELP = '6281333123600';   

const STORAGE_KEY = 'psb_pesantren_draft_v2'; 

const BrandHeader = () => (
    <div className="flex flex-col items-center justify-center mb-8 sm:mb-10 animate-fade-up text-center px-4">
        <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-sm mb-4 sm:mb-6">
            <img src={LOGO_URL} alt="Logo" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans leading-tight max-w-3xl">
            Penerimaan Santri Baru<br /> <span className="text-emerald-700">Pondok Pesantren Bhumi Ngasor</span>
        </h1>
        <span className="mt-3 sm:mt-4 px-4 sm:px-5 py-2 bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-bold tracking-[0.2em] rounded-full uppercase border border-emerald-100">
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
    
    // --- UPDATED INITIAL STATE MATCHING NEW FORM ---
    const initialFormData: FormData = {
        botField: '',
        infoSource: [],
        
        // Sekolah
        schoolChoice: SchoolLevel.SMP,
        smkMajor: '', 

        // Identitas
        fullName: '',
        gender: Gender.LakiLaki,
        nik: '', 
        nisn: '',
        birthPlace: '',
        birthDate: '',
        previousSchool: '',
        
        // Alamat
        province: '',
        city: '',
        district: '',
        village: '', 
        specificAddress: '',
        rt: '',      
        rw: '',      
        postalCode: '', 

        // Kontak 
        parentWaNumber: '',

        // Data Periodik (New)
        height: '',
        weight: '',
        siblingCount: '',
        childOrder: '',

        // Ayah
        fatherName: '',
        fatherEducation: ParentEducation.SMA,
        fatherOccupation: ParentOccupation.WIRASWASTA,
        fatherOccupationOther: '',
        fatherIncome: ParentIncome.SATU_DUA_JT,

        // Ibu
        motherName: '',
        motherEducation: ParentEducation.SMA,
        motherOccupation: ParentOccupation.IRT,
        motherOccupationOther: '',
        motherIncome: ParentIncome.TIDAK_BERPENGHASILAN,

        // Wali (Optional)
        hasGuardian: false,
        guardianName: '',
        guardianEducation: '',
        guardianOccupation: '',
        guardianOccupationOther: '',
        guardianIncome: '',

        // Files
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
    
    const [turnstileToken, setTurnstileToken] = useState<string>('');
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
                e.returnValue = ''; 
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

    const compressImage = (file: File, maxWidth: number, quality: number): Promise<string> => {
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
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
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

    const checkNikAvailability = async (nik: string): Promise<'available' | 'exists' | 'error'> => {
        try {
            const response = await fetch(`${GOOGLE_SHEET_URL}?t=${Date.now()}`, {
                method: 'POST',
                mode: 'no-cors', 
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'CHECK_NIK', nik: nik })
            });
            // Karena no-cors, kita asumsikan available di frontend
            return 'available'; 
        } catch (error) {
            console.error("NIK Check Failed", error);
            return 'error';
        }
    };

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (['nisn', 'postalCode', 'height', 'weight', 'siblingCount', 'childOrder'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
            return;
        }
        if (name === 'nik') {
             setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 16) }));
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
        if (name.includes('OccupationOther') && !value) return;
        
        const fieldSchema = (baseFormSchema.shape as any)[name];
        if (fieldSchema) {
            const result = fieldSchema.safeParse(formData[name as keyof FormData]);
            if (!result.success) setErrors(prev => ({ ...prev, [name]: result.error.errors[0].message }));
            else setErrors(prev => { const newErrors = { ...prev }; delete newErrors[name as keyof FormErrors]; return newErrors; });
        }
    }, [formData]);

    const scrollToError = (errorKey: string) => {
        const element = document.getElementById(errorKey);
        if (element) {
            const offset = 120; 
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isOnline) { addToast('error', 'Gagal Mengirim', 'Koneksi internet terputus.'); return; }
        if (formData.botField) { setSubmissionStatus('success'); return; }
        if (currentStep !== STEPS.length) { handleNext(); return; }

        const result = formSchema.safeParse(formData);
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            setErrors(errors as FormErrors);
            const firstError = Object.keys(errors)[0];
            if (firstError) scrollToError(String(firstError));
            addToast('warning', 'Data Belum Lengkap', 'Mohon lengkapi data yang ditandai merah.');
            return;
        }

        if (!turnstileToken) {
            addToast('error', 'Verifikasi Keamanan Diperlukan', 'Mohon selesaikan verifikasi "Saya bukan robot" di bawah formulir.');
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            return;
        }

        setLoadingStatus('Mempersiapkan Data...');
        
        try {
            const id = `PONPES-${Date.now().toString().slice(-6)}`;
            
            const fullAddress = `${formData.specificAddress}, RT ${formData.rt} / RW ${formData.rw}, ${formData.village}, ${formData.district}, ${formData.city}, ${formData.province}, ${formData.postalCode}`;

            const payload: any = {
                regId: id,
                infoSource: formData.infoSource.join(', '),
                
                schoolChoice: formData.schoolChoice,
                smkMajor: formData.schoolChoice === SchoolLevel.SMK ? formData.smkMajor : '-',

                fullName: formData.fullName.trim(),
                gender: formData.gender,
                nik: formData.nik.trim(), 
                nisn: formData.nisn.trim(),
                birthPlace: formData.birthPlace.trim(),
                birthDate: formData.birthDate,
                previousSchool: formData.previousSchool.trim(),
                
                address: fullAddress, 

                // --- DATA BARU ---
                height: formData.height,
                weight: formData.weight,
                siblingCount: formData.siblingCount,
                childOrder: formData.childOrder,
                
                parentWaNumber: formData.parentWaNumber.trim(),
                
                // AYAH
                fatherName: formData.fatherName.trim(),
                fatherEducation: formData.fatherEducation,
                fatherOccupation: formData.fatherOccupation === ParentOccupation.LAINNYA ? formData.fatherOccupationOther : formData.fatherOccupation,
                fatherIncome: formData.fatherIncome,

                // IBU
                motherName: formData.motherName.trim(),
                motherEducation: formData.motherEducation,
                motherOccupation: formData.motherOccupation === ParentOccupation.LAINNYA ? formData.motherOccupationOther : formData.motherOccupation,
                motherIncome: formData.motherIncome,

                // WALI
                hasGuardian: formData.hasGuardian,
                guardianName: formData.hasGuardian ? formData.guardianName : '-',
                guardianEducation: formData.hasGuardian ? formData.guardianEducation : '-',
                guardianOccupation: formData.hasGuardian ? (formData.guardianOccupation === ParentOccupation.LAINNYA ? formData.guardianOccupationOther : formData.guardianOccupation) : '-',
                guardianIncome: formData.hasGuardian ? formData.guardianIncome : '-',

                turnstileToken: turnstileToken
            };

            const processFile = async (field: keyof FormData, base64Key: string, mimeKey: string, label: string) => {
                const file = formData[field] as File;
                if (file) {
                    setLoadingStatus(`Mengunggah ${label}...`);
                    let base64String = "";
                    if (file.type.startsWith('image/')) {
                        const isHighResNeeded = ['kartuKeluarga', 'aktaKelahiran', 'ktpWalimurid', 'ijazah'].includes(field);
                        const maxWidth = isHighResNeeded ? 2048 : 1200; 
                        const quality = isHighResNeeded ? 0.9 : 0.85;   
                        base64String = await compressImage(file, maxWidth, quality);
                    } else {
                        base64String = await fileToBase64(file);
                    }
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

            const fetchWithRetry = async (url: string, options: any, retries = 3) => {
                try {
                    return await fetch(url, options);
                } catch (err) {
                    if (retries > 0) {
                        setLoadingStatus(`Koneksi tidak stabil, mencoba lagi... (${retries})`);
                        await new Promise(r => setTimeout(r, 2000)); 
                        return fetchWithRetry(url, options, retries - 1);
                    }
                    throw err;
                }
            };

            await fetchWithRetry(`${GOOGLE_SHEET_URL}?t=${Date.now()}`, {
                method: 'POST', 
                mode: 'no-cors', 
                headers: { 'Content-Type': 'text/plain' }, 
                body: JSON.stringify(payload)
            });

            await new Promise(r => setTimeout(r, 4000));
            
            localStorage.removeItem(STORAGE_KEY);
            setRegistrationId(id);
            setSubmissionStatus('success');
        } catch (err) { 
            console.error(err); 
            addToast('error', 'Gagal Terkirim', 'Terjadi kesalahan jaringan. Mohon coba lagi saat sinyal lebih stabil.');
            setSubmissionStatus('error'); 
        } finally { setLoadingStatus(''); }
    };

    const handleNext = () => {
        const { success, errors: validationErrors } = validateStep(currentStep, formData);
        setErrors(validationErrors);
        if (success) { setCurrentStep(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } 
        else {
             const firstError = Object.keys(validationErrors)[0];
             if (firstError) scrollToError(String(firstError));
             if (currentStep === 1 && !formData.infoSource.length) window.scrollTo({ top: 0, behavior: 'smooth' }); 
             addToast('warning', 'Periksa Kembali', 'Terdapat isian yang belum lengkap.');
        }
    };

    const jumpToStep = (step: number) => {
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getWhatsAppLink = () => {
        const targetNumber = formData.gender === Gender.Perempuan ? WA_NUMBER_FEMALE : WA_NUMBER_MALE;
        const message = `Assalamu'alaikum Admin, saya sudah mendaftar Santri Baru.\n\nNama: *${formData.fullName}*\nJenjang: *${formData.schoolChoice}*\nID: *${registrationId}*\n\nMohon dicek.`;
        return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
    };

    if (showWelcome) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans no-print">
                <FloatingHelp />
                <div className="w-full max-w-lg bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] p-6 sm:p-10 relative overflow-hidden animate-fade-up">
                    <BrandHeader />
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6 text-left shadow-sm">
                        <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                             <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                             Persiapan Sebelum Mendaftar
                        </h3>
                        <p className="text-sm sm:text-base text-amber-800/80 mb-4 leading-relaxed border-b border-amber-200/60 pb-3 font-medium">
                            Agar proses pendaftaran berjalan lancar, mohon persiapkan data dan dokumen (Foto/Scan) berikut ini:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-widest text-amber-900 mb-3 flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    Data Penting
                                </h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2 text-sm text-amber-900 font-medium"><div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0"></div>NIK Calon Santri</li>
                                    <li className="flex items-start gap-2 text-sm text-amber-900 font-medium"><div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0"></div>NISN</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-widest text-amber-900 mb-3 flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Dokumen (Foto/Scan)
                                </h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2 text-sm text-amber-900 font-medium"><div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0"></div>KK, Akta & KTP Ortu</li>
                                    <li className="flex items-start gap-2 text-sm text-amber-900 font-medium"><div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0"></div>Ijazah/SKL & Pas Foto</li>
                                </ul>
                            </div>
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

    if (submissionStatus === 'success') {
        const PrintRow = ({ label, value }: { label: string, value: string }) => (
            <tr className="border-b border-stone-100/60">
                <td className="py-1.5 font-bold text-stone-700 w-48 align-top text-xs uppercase tracking-wide">{label}</td>
                <td className="py-1.5 w-4 align-top text-stone-500 font-bold">:</td>
                <td className="py-1.5 text-stone-900 font-bold uppercase align-top leading-relaxed text-xs">{value}</td>
            </tr>
        );

        return (
            <>
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 no-print">
                    <FloatingHelp />
                    <div className="w-full max-w-lg bg-white rounded-[2rem] p-6 sm:p-10 shadow-xl text-center border border-slate-100">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Pendaftaran Berhasil!</h2>
                        <p className="text-slate-500 mb-8">Data Anda telah berhasil disimpan.<br/>ID Pendaftaran: <span className="font-bold text-slate-800 select-all">{registrationId}</span></p>
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
                    </div>
                </div>

                <div className="print-only bg-white p-8 text-black w-full max-w-[210mm] mx-auto min-h-screen relative box-border">
                    <div className="flex items-center justify-between border-b-[3px] border-emerald-800 pb-4 mb-6 relative">
                         <div className="absolute -bottom-1.5 left-0 w-full h-[1.5px] bg-emerald-500"></div>
                        <div className="w-24 h-24 flex-shrink-0 mr-4">
                            <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 text-center">
                            <h3 className="text-lg font-bold uppercase tracking-widest text-emerald-900 font-serif mb-1">YAYASAN PONDOK PESANTREN</h3>
                            <h1 className="text-3xl font-black uppercase mb-1 text-stone-900 font-serif tracking-tight leading-none scale-y-110">AN-NUR HIDAYATUS SALAM</h1>
                            <h1 className="text-3xl font-black uppercase mb-3 text-emerald-700 font-serif tracking-[0.2em] leading-none">BHUMI NGASOR</h1>
                            <p className="text-[10px] italic text-stone-600 font-medium leading-tight">
                                Sekretariat: Jl. Pendhopo Kamulyan RT.02 RW.01 Dsn. Bakalan Kec. Bululawang Kab. Malang<br/>
                                Email: <span className="text-emerald-700">bhumingasorofficial@gmail.com</span>
                            </p>
                        </div>
                    </div>

                    <div className="text-center mb-6">
                        <h3 className="text-xl font-black text-stone-900 underline decoration-2 decoration-emerald-500 underline-offset-4 mb-1 uppercase tracking-wider">TANDA BUKTI PENDAFTARAN</h3>
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-[0.3em]">TAHUN AJARAN 2026/2027</p>
                    </div>

                    <div className="border-l-4 border-emerald-500 bg-emerald-50/50 rounded-r-lg p-4 mb-6 flex justify-between items-center shadow-sm">
                        <div>
                            <p className="text-[10px] uppercase font-extrabold text-emerald-800 mb-0.5 tracking-wider">NOMOR REGISTRASI:</p>
                            <p className="text-3xl font-mono font-black tracking-widest text-stone-900 leading-none">{registrationId}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] uppercase font-extrabold text-emerald-800 mb-0.5 tracking-wider">TANGGAL DAFTAR:</p>
                             <p className="text-lg font-bold text-stone-800 leading-none">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'})}</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <table className="w-full text-xs">
                            <tbody>
                                <PrintRow label="JENJANG PENDIDIKAN" value={formData.schoolChoice + (formData.schoolChoice === SchoolLevel.SMK ? ` (${formData.smkMajor})` : '')} />
                                <PrintRow label="NAMA LENGKAP" value={formData.fullName} />
                                <PrintRow label="NISN" value={formData.nisn} />
                                <PrintRow label="TEMPAT, TGL LAHIR" value={`${formData.birthPlace}, ${formData.birthDate}`} />
                                <PrintRow label="JENIS KELAMIN" value={formData.gender} />
                                <PrintRow 
                                    label="ALAMAT LENGKAP" 
                                    value={`${formData.specificAddress}, RT ${formData.rt} / RW ${formData.rw}, ${formData.village}, ${formData.district}, ${formData.city}, ${formData.province}, ${formData.postalCode}`} 
                                />
                                <PrintRow label="NAMA ORANG TUA" value={`${formData.fatherName} / ${formData.motherName}`} />
                                <PrintRow label="NO. WHATSAPP" value={formData.parentWaNumber} />
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-amber-50 p-3 border-l-4 border-amber-400 text-[10px] mb-8 rounded-r-lg">
                        <strong className="text-amber-900 uppercase tracking-wide block mb-1">CATATAN PENTING:</strong>
                        <ul className="list-disc pl-4 space-y-0.5 text-stone-700 font-medium">
                            <li>Kartu ini adalah bukti sah pendaftaran santri baru Pondok Pesantren Bhumi Ngasor.</li>
                            <li>Harap simpan kartu ini dan dibawa saat melakukan daftar ulang atau tes masuk.</li>
                        </ul>
                    </div>

                    <div className="flex justify-between items-end px-4 mt-auto">
                        <div className="text-center w-48">
                            <p className="mb-16 text-xs font-bold text-stone-600">Panitia PSB,</p>
                            <div className="border-b border-stone-800 w-full mb-1"></div>
                            <p className="text-[10px] text-stone-400 font-bold">( Tanda Tangan & Stempel )</p>
                        </div>
                        <div className="text-center w-48">
                            <p className="mb-16 text-xs font-bold text-stone-600">Orang Tua / Wali,</p>
                            <p className="text-sm font-bold text-stone-900 border-b border-stone-800 uppercase pb-1 mb-1">
                                ( {formData.fatherName} )
                            </p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center py-6 sm:py-12 px-3 sm:px-4 no-print">
            <Toast toasts={toasts} removeToast={removeToast} />
            <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${isSaving ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                <div className="bg-white/80 backdrop-blur-sm border border-stone-200 text-stone-500 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    Menyimpan...
                </div>
            </div>

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
            <BrandHeader />

            <div className="w-full max-w-4xl bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-5 sm:p-12 relative">
                <div className="mb-8 sm:mb-14">
                    <Stepper steps={STEPS} currentStep={currentStep} />
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="opacity-0 absolute h-0 w-0 overflow-hidden"><input type="text" name="botField" value={formData.botField} onChange={handleChange} tabIndex={-1} autoComplete="off" /></div>
                    
                    <div className="min-h-[300px]">
                        {currentStep === 1 && <SurveySection formData={formData} errors={errors} onSelectionChange={handleSurveyChange} />}
                        {currentStep === 2 && <StudentDataSection formData={formData} errors={errors} handleChange={handleChange} handleBlur={handleBlur} checkNikAvailability={checkNikAvailability} />}
                        {currentStep === 3 && <ParentDataSection formData={formData} errors={errors} handleChange={handleChange} handleBlur={handleBlur} />}
                        {currentStep === 4 && <DocumentUploadSection formData={formData} errors={errors} handleFileChange={handleFileChange} handleFileClear={handleFileClear} />}
                        {currentStep === 5 && <PaymentSection formData={formData} errors={errors} handleFileChange={handleFileChange} handleFileClear={handleFileClear} />}
                        {currentStep === 6 && <ReviewSection formData={formData} errors={errors} handleChange={handleChange} onEditStep={jumpToStep} setTurnstileToken={setTurnstileToken} />}
                    </div>

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
