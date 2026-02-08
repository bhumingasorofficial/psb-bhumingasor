
import React, { useState, useCallback, useEffect } from 'react';
import { 
    FormData, registrationSchema, RegistrationFormData, 
    FormErrors, Gender, SchoolLevel, ParentEducation, ParentIncome, ParentOccupation, baseFormSchema
} from './types';
import { validateStep } from './utils/validation';
import RegistrationSection from './components/sections/RegistrationSection';
import LoginSection from './components/sections/LoginSection';
import StudentDataSection from './components/sections/StudentDataSection';
import ParentDataSection from './components/sections/ParentDataSection';
import DocumentUploadSection from './components/sections/DocumentUploadSection';
import ReviewSection from './components/sections/ReviewSection';
import SurveySection from './components/sections/SurveySection';
import PaymentSection from './components/sections/PaymentSection';
import Stepper from './components/Stepper';
import Toast, { ToastMessage, ToastType } from './components/Toast';

// --- CONFIG ---
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyZJDWxfVViSiCQpF2iPd_WQW0AWtd_WM30MUuTT28D4ERpzp1Ml_oh_yN-nQGoB7e0dg/exec'; 
const LOGO_URL = 'https://github.com/bhumingasorofficial/asset-bhumingasor/blob/bb73c4a939d695cbe48e58d7ea869977bdc57acd/Logo%20Yayasan%20Pondok%20Pesantren%20Bhumi%20Ngasor.png?raw=true';
const WA_NUMBER_HELP = '6281333123600';   

// --- STEPS FOR FULL FORM ---
const FULL_FORM_STEPS = ['Data Siswa', 'Orang Tua', 'Berkas', 'Konfirmasi'];
const AUTOSAVE_KEY = 'psb_autosave_v2';

const BrandHeader = () => (
    <div className="flex flex-col items-center justify-center mb-6 sm:mb-10 animate-fade-up text-center px-4 no-print w-full max-w-4xl mx-auto">
        <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-sm mb-4 sm:mb-6 transform hover:scale-105 transition-transform duration-500">
            <img src={LOGO_URL} alt="Logo" className="w-16 h-16 sm:w-24 sm:h-24 object-contain" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans leading-tight drop-shadow-sm">
            Penerimaan Santri Baru<br /> <span className="text-emerald-700">Pondok Pesantren Bhumi Ngasor</span>
        </h1>
        <span className="mt-3 sm:mt-4 px-4 sm:px-6 py-1.5 sm:py-2 bg-emerald-50 text-emerald-700 text-[10px] sm:text-sm font-bold tracking-[0.2em] rounded-full uppercase border border-emerald-100 shadow-sm">
            Tahun Ajaran 2026/2027
        </span>
    </div>
);

const FloatingHelp = () => (
    <a 
        href={`https://wa.me/${WA_NUMBER_HELP}?text=Assalamu'alaikum Admin, saya butuh bantuan terkait Pendaftaran.`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-lg transition-all hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-10 no-print group"
    >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 5.12 15.84 5.12 12C5.12 8.16 7.59 4 12 4C16.41 4 18.88 8.16 18.88 12C18.88 15.84 16.41 20 12 20ZM11 14H13V16H11V14ZM11 8H13V12H11V8Z"/></svg>
        <span className="font-bold hidden sm:block">Bantuan</span>
        <span className="font-bold sm:hidden text-xs max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">Bantuan</span>
    </a>
);

// --- PRINTABLE CARD COMPONENT (SURAT RESMI STYLE) ---
const PrintableCard = ({ data }: { data: FormData }) => {
    // Safety check if data is incomplete
    if (!data.regId) return null;

    const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Handle Address Display
    const displayAddress = (data.province && data.city) 
        ? `${data.specificAddress}, RT ${data.rt}/RW ${data.rw}, ${data.village}, ${data.district}, ${data.city}`
        : data.specificAddress; 

    return (
        <div className="print-only fixed inset-0 z-[9999] bg-white text-black font-serif p-0">
            <div className="max-w-[210mm] mx-auto p-12 h-full relative">
                
                {/* KOP SURAT */}
                <div className="flex items-center border-b-4 border-double border-black pb-4 mb-8">
                    <img src={LOGO_URL} alt="Logo" className="w-24 h-24 object-contain mr-6" />
                    <div className="text-center flex-1">
                        <h2 className="text-lg font-bold uppercase tracking-wide mb-1 text-black">Yayasan Pendidikan Pondok Pesantren</h2>
                        <h1 className="text-3xl font-black uppercase tracking-wider mb-2 text-black">BHUMI NGASOR AR-RIDHO</h1>
                        <p className="text-sm text-black">Jl. Pesantren No. 99, Dsn. Ngasor, Ds. Bendosari, Kec. Pujon, Kab. Malang</p>
                        <p className="text-sm font-bold text-black">Telp/WA: {WA_NUMBER_HELP} | Email: psb@bhumingasor.com</p>
                    </div>
                </div>

                {/* JUDUL */}
                <div className="text-center mb-8">
                    <h3 className="text-xl font-bold underline uppercase text-black">BUKTI PENDAFTARAN SANTRI BARU</h3>
                    <p className="text-sm font-bold mt-1 text-black">TAHUN AJARAN 2026/2027</p>
                </div>

                {/* ISI */}
                <div className="mb-6">
                    <p className="mb-4 text-justify leading-relaxed text-black">
                        Panitia Penerimaan Santri Baru (PSB) Pondok Pesantren Bhumi Ngasor menerangkan bahwa calon santri di bawah ini telah melakukan <strong>Pendaftaran Ulang</strong> dan melengkapi data administrasi:
                    </p>
                    
                    <table className="w-full border-collapse border border-black text-sm mt-4">
                        <tbody>
                            <tr>
                                <td className="p-3 border border-black font-bold w-48 bg-gray-100 text-black">NO. REGISTRASI</td>
                                <td className="p-3 border border-black font-bold text-lg text-black">{data.regId}</td>
                            </tr>
                            <tr>
                                <td className="p-3 border border-black font-bold text-black">NAMA LENGKAP</td>
                                <td className="p-3 border border-black uppercase font-bold text-black">{data.fullName}</td>
                            </tr>
                            <tr>
                                <td className="p-3 border border-black font-bold text-black">NISN</td>
                                <td className="p-3 border border-black text-black">{data.nisn || '-'}</td>
                            </tr>
                            <tr>
                                <td className="p-3 border border-black font-bold text-black">TEMPAT, TGL LAHIR</td>
                                <td className="p-3 border border-black text-black">{data.birthPlace}, {data.birthDate}</td>
                            </tr>
                            <tr>
                                <td className="p-3 border border-black font-bold text-black">JENJANG / JURUSAN</td>
                                <td className="p-3 border border-black text-black">{data.schoolChoice} {data.smkMajor ? `(${data.smkMajor})` : ''}</td>
                            </tr>
                            <tr>
                                <td className="p-3 border border-black font-bold text-black">ALAMAT LENGKAP</td>
                                <td className="p-3 border border-black text-black">{displayAddress}</td>
                            </tr>
                            <tr>
                                <td className="p-3 border border-black font-bold text-black">NAMA ORANG TUA</td>
                                <td className="p-3 border border-black text-black">Ayah: {data.fatherName} / Ibu: {data.motherName}</td>
                            </tr>
                             <tr>
                                <td className="p-3 border border-black font-bold text-black">NO. KONTAK</td>
                                <td className="p-3 border border-black text-black">{data.parentWaNumber}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mb-12">
                    <p className="text-sm mb-2 font-bold text-black">Catatan:</p>
                    <ul className="list-disc list-inside text-sm pl-2 space-y-1 text-black">
                        <li>Bukti pendaftaran ini adalah dokumen sah bahwa data santri telah terverifikasi di database kami.</li>
                        <li>Harap membawa bukti ini saat kedatangan santri ke pondok.</li>
                        <li>Simpan dokumen ini dengan baik.</li>
                    </ul>
                </div>

                {/* FOOTER TTD */}
                <div className="absolute bottom-20 right-12 w-64 text-center">
                    <p className="mb-1 text-black">Malang, {date}</p>
                    <p className="font-bold mb-20 text-black">Panitia PSB,</p>
                    <p className="font-bold border-b border-black inline-block min-w-[150px] text-black">( ....................................... )</p>
                </div>

                <div className="absolute bottom-4 left-0 w-full text-center text-xs text-gray-500 italic">
                    Dicetak otomatis oleh Sistem Informasi PSB Bhumi Ngasor pada {new Date().toLocaleString('id-ID')}
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP ---

const App: React.FC = () => {
    // VIEW STATE
    const [view, setView] = useState<'welcome' | 'register' | 'login' | 'full-form' | 'success'>('welcome');
    // SUCCESS TYPE STATE
    const [successType, setSuccessType] = useState<'registration' | 'full-form'>('registration');
    
    // SERVER CONFIG STATE (For Wave Logic)
    const [serverConfig, setServerConfig] = useState({ activeWave: 1 });
    
    // LOAD STATE
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Memproses Data...'); // Granular Feedback
    
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    
    // --- REGISTRATION STATE ---
    const initialRegData: RegistrationFormData = {
        botField: '',
        infoSource: [],
        fullName: '',
        nik: '',
        gender: Gender.LakiLaki,
        parentWaNumber: '',
        buktiPembayaran: null as any,
        termsAgreed: false
    };
    const [regData, setRegData] = useState<RegistrationFormData>(initialRegData);
    const [regErrors, setRegErrors] = useState<any>({});
    const [turnstileToken, setTurnstileToken] = useState('');
    const [regSuccessId, setRegSuccessId] = useState('');

    // --- LOGIN STATE ---
    const [loginCreds, setLoginCreds] = useState({ nik: '', token: '', wa: '' });
    const [loginError, setLoginError] = useState('');

    // --- FULL FORM STATE ---
    const initialFullData: FormData = {
        regId: '',
        infoSource: [],
        schoolChoice: SchoolLevel.SMP,
        smkMajor: '', 
        fullName: '', nik: '', gender: Gender.LakiLaki, 
        nisn: '', birthPlace: '', birthDate: '', previousSchool: '',
        province: '', city: '', district: '', village: '', specificAddress: '', rt: '', rw: '', postalCode: '',
        parentWaNumber: '',
        height: '', weight: '', siblingCount: '', childOrder: '',
        fatherName: '', fatherEducation: ParentEducation.SMA, fatherOccupation: ParentOccupation.WIRASWASTA, fatherIncome: ParentIncome.SATU_DUA_JT,
        motherName: '', motherEducation: ParentEducation.SMA, motherOccupation: ParentOccupation.IRT, motherIncome: ParentIncome.TIDAK_BERPENGHASILAN,
        hasGuardian: false,
        kartuKeluarga: null as any, aktaKelahiran: null as any, ktpWalimurid: null as any, pasFoto: null as any, ijazah: null as any,
        finalAgreement: false,
    };
    const [formData, setFormData] = useState<FormData>(initialFullData);
    const [currentStep, setCurrentStep] = useState(1);
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    // --- FETCH SERVER CONFIG ON MOUNT ---
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch(`${GOOGLE_SHEET_URL}?action=GET_CONFIG`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.result === 'success') {
                        setServerConfig(data.config);
                    }
                }
            } catch (e) {
                console.warn("Failed to fetch server config, using defaults.");
            }
        };
        fetchConfig();
    }, []);

    // --- AUTO SAVE EFFECT ---
    useEffect(() => {
        // Load on mount if in full-form mode
        if (view === 'full-form') {
            const saved = localStorage.getItem(AUTOSAVE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setFormData(prev => ({
                        ...prev,
                        ...parsed,
                        regId: prev.regId || parsed.regId,
                        nik: prev.nik || parsed.nik
                    }));
                    addToast('info', 'Auto-Save Dimuat', 'Data terakhir Anda telah dipulihkan.');
                } catch (e) {
                    console.error("Failed to load autosave");
                }
            }
        }
    }, [view]);

    // Save on change
    useEffect(() => {
        if (view === 'full-form') {
            const dataToSave = { ...formData };
            delete (dataToSave as any).kartuKeluarga;
            delete (dataToSave as any).aktaKelahiran;
            delete (dataToSave as any).ktpWalimurid;
            delete (dataToSave as any).pasFoto;
            delete (dataToSave as any).ijazah;
            
            const timer = setTimeout(() => {
                localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
            }, 1000); 
            return () => clearTimeout(timer);
        }
    }, [formData, view]);

    const addToast = (type: ToastType, title: string, message: string) => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, type, title, message }]);
    };

    const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

    // --- FILE HELPERS ---
    const compressImage = (file: File, maxWidth: number = 1200): Promise<string> => {
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
                        resolve(canvas.toDataURL('image/jpeg', 0.8));
                    } else reject(new Error("Canvas error"));
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

    // --- RESET HANDLER ---
    const handleReset = () => {
        setRegData(initialRegData);
        setFormData(initialFullData);
        setRegErrors({});
        setFormErrors({});
        setLoginCreds({ nik: '', token: '', wa: '' });
        setCurrentStep(1);
        setSuccessType('registration');
        setView('welcome');
        window.scrollTo(0, 0);
    };

    // --- REAL NIK CHECKER ---
    const checkNikReal = async (nik: string): Promise<'available' | 'exists' | 'error'> => {
        try {
            const response = await fetch(`${GOOGLE_SHEET_URL}?action=CHECK_NIK&nik=${nik}`);
            if (response.ok) {
                const data = await response.json();
                return data.result === 'exists' ? 'exists' : 'available';
            }
            return 'error';
        } catch (e) {
            return 'error';
        }
    };

    // --- HANDLERS: REGISTRATION ---
    const handleRegChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name === 'nik') {
             setRegData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 16) }));
             return;
        }
        if (name === 'parentWaNumber') {
            setRegData(prev => ({ ...prev, [name]: value.replace(/[^0-9+]/g, '') }));
            return;
        }
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setRegData(prev => ({ ...prev, [name]: val }));
    };

    const handleRegFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setRegData(prev => ({ ...prev, buktiPembayaran: e.target.files![0] }));
    };

    const submitRegistration = async () => {
        const result = registrationSchema.safeParse(regData);
        if (!result.success) {
            setRegErrors(result.error.flatten().fieldErrors);
            addToast('warning', 'Validasi Gagal', 'Mohon lengkapi data pendaftaran.');
            return;
        }
        if (!turnstileToken) {
            addToast('error', 'Keamanan', 'Selesaikan verifikasi captcha.');
            return;
        }

        setLoading(true);
        setLoadingMessage('Mengecek Ketersediaan NIK...');
        
        // Final NIK Check before submit
        const status = await checkNikReal(regData.nik);
        if (status === 'exists') {
            setLoading(false);
            addToast('error', 'Gagal', 'NIK sudah terdaftar. Silahkan Login.');
            return;
        }

        setLoadingMessage('Mengompresi Bukti Pembayaran...');
        try {
            let base64 = "";
            if (regData.buktiPembayaran) {
                base64 = await compressImage(regData.buktiPembayaran);
                base64 = base64.split(',')[1];
            }

            setLoadingMessage('Mengirim Data Pendaftaran...');
            const payload = {
                action: 'REGISTER',
                infoSource: regData.infoSource, 
                fullName: regData.fullName,
                nik: regData.nik,
                gender: regData.gender,
                parentWaNumber: regData.parentWaNumber,
                buktiPembayaranBase64: base64,
                buktiPembayaranMime: regData.buktiPembayaran.type,
                turnstileToken: turnstileToken
            };

            await fetch(GOOGLE_SHEET_URL, {
                method: 'POST', mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(payload)
            });

            await new Promise(r => setTimeout(r, 3000));
            setRegSuccessId(regData.nik);
            
            // SET SUCCESS TYPE TO REGISTRATION
            setSuccessType('registration');
            setView('success');
        } catch (e) {
            console.error(e);
            addToast('error', 'Server Error', 'Gagal menghubungi server.');
        } finally { setLoading(false); }
    };

    // --- HANDLERS: LOGIN ---
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setLoadingMessage('Memverifikasi Akun...');
        setLoginError('');
        try {
            const cleanNik = loginCreds.nik.trim();
            const cleanToken = loginCreds.token.trim();
            const cleanWa = loginCreds.wa.trim();

            const queryParams = new URLSearchParams({
                action: 'LOGIN',
                nik: cleanNik,
                token: cleanToken,
                wa: cleanWa // Security Param
            });

            const response = await fetch(`${GOOGLE_SHEET_URL}?${queryParams.toString()}`, {
                method: 'GET',
            });
            
            if (!response.ok) throw new Error("Network response was not ok");
            
            const result = await response.json();

            if (result.result === 'success') {
                if (result.status === 'complete') {
                    // USER ALREADY FULLY REGISTERED - LOAD DATA & SHOW SUCCESS
                    setFormData(prev => ({
                        ...prev,
                        ...result.data
                    }));
                    setSuccessType('full-form');
                    setView('success');
                } else {
                    // PARTIAL REGISTRATION - FILL FORM
                    setFormData(prev => ({
                        ...prev,
                        regId: result.data.regId,
                        fullName: result.data.fullName,
                        nik: result.data.nik,
                        gender: result.data.gender,
                        infoSource: result.data.infoSource.split(', '),
                        parentWaNumber: result.data.parentWaNumber
                    }));
                    setView('full-form');
                }
            } else {
                setLoginError(result.message || 'Login Gagal');
            }
        } catch (e) {
            console.error(e);
            setLoginError('Gagal terhubung. Cek koneksi atau Token Anda.');
        } finally { setLoading(false); }
    };

    // --- HANDLERS: FULL FORM ---
    const handleFullFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (['nisn', 'postalCode', 'height', 'weight', 'siblingCount', 'childOrder'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
            return;
        }
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (typeof value === 'string') setFormData(prev => ({ ...prev, [name]: value.trim() }));
        if (name.includes('OccupationOther') && !value) return;
        
        if (name in baseFormSchema.shape) {
            const fieldSchema = (baseFormSchema.shape as any)[name];
            if (fieldSchema) {
                const result = fieldSchema.safeParse(formData[name as keyof FormData]);
                if (!result.success) {
                    setFormErrors(prev => ({ ...prev, [name]: result.error.errors[0].message }));
                } else {
                    setFormErrors(prev => { 
                        const newErrors = { ...prev }; 
                        delete newErrors[name]; 
                        return newErrors; 
                    });
                }
            }
        }
    }, [formData]);

    const handleFullFormFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files?.[0]) setFormData(prev => ({ ...prev, [name]: files[0] }));
    };

    const handleNextStep = () => {
        const { success, errors } = validateStep(currentStep, formData);
        setFormErrors(errors);
        if (success) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            addToast('warning', 'Periksa Data', 'Masih ada data yang belum lengkap.');
            const firstError = Object.keys(errors)[0];
            const el = document.getElementById(firstError);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const submitFullForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: any = {
                action: 'SUBMIT_FULL',
                regId: formData.regId, 
                ...formData 
            };
            delete payload.kartuKeluarga;
            delete payload.aktaKelahiran;
            delete payload.ktpWalimurid;
            delete payload.pasFoto;
            delete payload.ijazah;

            // Granular Feedback simulation for better UX
            setLoadingMessage('Sedang Mengompresi & Menyiapkan Dokumen...');
            
            const fileFields = ['kartuKeluarga', 'aktaKelahiran', 'ktpWalimurid', 'pasFoto', 'ijazah'];
            for (const field of fileFields) {
                const file = (formData as any)[field];
                if (file) {
                    let b64 = await fileToBase64(file);
                    b64 = b64.split(',')[1];
                    payload[field + 'Base64'] = b64;
                    payload[field + 'Mime'] = file.type;
                }
            }

            setLoadingMessage('Mengirim Semua Data ke Server... (Mohon Tunggu 10-30 Detik)');

            await fetch(GOOGLE_SHEET_URL, {
                method: 'POST', mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(payload)
            });

            // Clear Autosave
            localStorage.removeItem(AUTOSAVE_KEY);
            
            setLoadingMessage('Menyimpan Data...');
            await new Promise(r => setTimeout(r, 4000));
            addToast('success', 'Berhasil', 'Data lengkap disimpan.');
            
            // SET SUCCESS TYPE TO FULL FORM
            setSuccessType('full-form');
            setView('success');
        } catch (e) {
            addToast('error', 'Gagal Menyimpan', 'Terjadi kesalahan jaringan.');
        } finally { setLoading(false); }
    };

    // --- VIEWS ---

    if (view === 'welcome') {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 no-print">
                <div className="w-full max-w-lg bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl p-6 sm:p-10 animate-fade-up text-center border border-stone-100">
                    <BrandHeader />
                    <div className="space-y-4 mt-6 sm:mt-8">
                        <button onClick={() => setView('register')} className="w-full py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-emerald-600/20 text-base sm:text-lg transition-all hover:-translate-y-1 active:scale-95">
                            Daftar Baru
                        </button>
                        <button onClick={() => setView('login')} className="w-full py-3.5 sm:py-4 bg-white border-2 border-stone-200 text-stone-700 font-bold rounded-xl sm:rounded-2xl hover:bg-stone-50 text-base sm:text-lg transition-all hover:-translate-y-1 active:scale-95">
                            Masuk / Lanjut Isi Data
                        </button>
                    </div>
                    <div className="mt-6 sm:mt-8 pt-6 border-t border-stone-100">
                        <p className="text-xs text-stone-400 font-medium">
                            Sudah mendaftar tapi belum dapat Token? <br/>
                            Hubungi Admin melalui tombol bantuan di bawah.
                        </p>
                    </div>
                </div>
                <FloatingHelp />
            </div>
        );
    }

    if (view === 'success') {
        // CASE 1: SUCCESS INITIAL REGISTRATION (TOKEN ONLY)
        if (successType === 'registration') {
            return (
                <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 no-print">
                    <div className="w-full max-w-lg bg-white rounded-3xl p-8 text-center shadow-lg animate-in zoom-in-95">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Pendaftaran Awal Berhasil!</h2>
                        <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                            Data pendaftaran awal Anda telah kami terima. Admin kami akan memverifikasi bukti pembayaran Anda.<br/><br/>
                            <strong>Token Pendaftaran</strong> akan dikirimkan ke WhatsApp: <br/>
                            <span className="font-bold text-emerald-600 text-lg">{regData.parentWaNumber}</span><br/>
                            <span className="text-xs text-stone-400">(Estimasi 1x24 Jam)</span>
                        </p>

                        <a 
                            href={`https://wa.me/${WA_NUMBER_HELP}?text=Assalamu'alaikum Admin. Saya sudah melakukan pendaftaran awal atas nama ${regData.fullName} (NIK: ${regData.nik}). Mohon verifikasi dan kirimkan Token Pendaftarannya.`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 text-sm shadow-md flex items-center justify-center gap-2 mb-3"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                            Hubungi Admin (Minta Token)
                        </a>

                        <button onClick={handleReset} className="w-full px-6 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 text-sm">
                            Kembali ke Menu Utama
                        </button>
                    </div>
                </div>
            );
        }

        // CASE 2: SUCCESS FULL FORM SUBMISSION (SURAT RESMI)
        return (
            <>
                <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 no-print">
                    <div className="w-full max-w-lg bg-white rounded-3xl p-8 text-center shadow-lg animate-in zoom-in-95">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Data Anda Sudah Lengkap!</h2>
                        <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                            Seluruh data administrasi santri atas nama <strong>{formData.fullName}</strong> telah berhasil disimpan secara permanen.
                            <br/><br/>
                            Silahkan cetak bukti pendaftaran di bawah ini untuk dibawa saat daftar ulang.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                             <button onClick={() => window.print()} className="w-full px-6 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 text-base shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                Cetak Bukti Pendaftaran (PDF)
                            </button>
                            
                            <a href={`https://wa.me/${WA_NUMBER_HELP}?text=Assalamu'alaikum Admin. Saya ${formData.fullName} (${formData.regId}) ingin mengajukan REVISI DATA karena ada kesalahan input. Mohon dibuka akses editnya.`} target="_blank" rel="noreferrer" className="w-full px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 text-sm shadow-md flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Ajukan Revisi Data (WA)
                            </a>
                            
                            <button onClick={handleReset} className="w-full px-6 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 text-sm mt-2">
                                Kembali ke Menu Utama
                            </button>
                        </div>
                    </div>
                </div>
                {/* Printable Section - Only rendered when FULL FORM success */}
                <PrintableCard data={formData} />
            </>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 font-sans flex flex-col items-center py-4 sm:py-12 px-2 sm:px-4">
            <Toast toasts={toasts} removeToast={removeToast} />
            <FloatingHelp />
            
            {loading && (
                <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center no-print">
                    <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
                    <p className="font-bold tracking-widest text-emerald-800 animate-pulse text-sm uppercase">{loadingMessage}</p>
                </div>
            )}

            <BrandHeader />

            <div className="w-full max-w-5xl bg-white rounded-xl sm:rounded-[2.5rem] shadow-sm sm:shadow-xl border border-stone-200 p-4 sm:p-12 relative min-h-[500px] no-print mx-auto">
                
                {/* Back Button if not in welcome */}
                <button onClick={() => setView('welcome')} className="absolute top-4 left-4 sm:top-10 sm:left-10 text-stone-400 hover:text-stone-600 flex items-center gap-1 text-sm font-bold transition-colors p-2 sm:p-0">
                    <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    <span className="hidden sm:inline">Menu Utama</span>
                </button>

                {view === 'register' && (
                    <>
                        <RegistrationSection 
                            formData={regData} 
                            handleChange={handleRegChange} 
                            handleSurveyChange={(s) => setRegData(p => ({...p, infoSource: s}))}
                            handleFileChange={handleRegFile}
                            handleFileClear={() => setRegData(p => ({...p, buktiPembayaran: null}))}
                            setTurnstileToken={setTurnstileToken}
                            errors={regErrors}
                            activeWave={serverConfig.activeWave}
                        />
                        <div className="mt-8 pt-6 border-t border-stone-100 flex justify-end">
                            <button onClick={submitRegistration} className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all hover:-translate-y-1 active:scale-95">
                                Kirim Pendaftaran
                            </button>
                        </div>
                    </>
                )}

                {view === 'login' && (
                    <LoginSection 
                        nik={loginCreds.nik} 
                        token={loginCreds.token} 
                        wa={loginCreds.wa}
                        onChange={(e) => setLoginCreds(p => ({...p, [e.target.name]: e.target.value}))}
                        onSubmit={handleLoginSubmit}
                        loading={loading}
                        error={loginError}
                    />
                )}

                {view === 'full-form' && (
                    <>
                        <div className="mb-6 sm:mb-10 text-center mt-8 sm:mt-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-stone-800">Lengkapi Data Santri</h2>
                            <p className="text-xs sm:text-sm text-emerald-600 font-bold bg-emerald-50 inline-block px-3 py-1 rounded-full mt-2">
                                Hai, {formData.fullName} ({formData.regId})
                            </p>
                        </div>

                        <Stepper steps={FULL_FORM_STEPS} currentStep={currentStep} />
                        
                        <div className="mt-8 min-h-[300px]">
                            {currentStep === 1 && (
                                <StudentDataSection 
                                    formData={formData} 
                                    errors={formErrors} 
                                    handleChange={handleFullFormChange} 
                                    handleBlur={handleBlur} 
                                    checkNikAvailability={checkNikReal}
                                />
                            )}
                            {currentStep === 2 && (
                                <ParentDataSection 
                                    formData={formData} 
                                    errors={formErrors} 
                                    handleChange={handleFullFormChange} 
                                    handleBlur={handleBlur} 
                                />
                            )}
                            {currentStep === 3 && (
                                <DocumentUploadSection 
                                    formData={formData} 
                                    errors={formErrors} 
                                    handleFileChange={handleFullFormFile} 
                                    handleFileClear={(n) => setFormData(p => ({...p, [n]: null}))}
                                    activeWave={serverConfig.activeWave} // Pass Config to Step 3
                                />
                            )}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    {/* REVIEW SECTION INCLUDED HERE */}
                                    <ReviewSection 
                                        formData={formData}
                                        errors={formErrors}
                                        handleChange={handleFullFormChange as any}
                                        onEditStep={(step) => setCurrentStep(step)}
                                        setTurnstileToken={() => {}} // Not needed in full form confirm
                                    />

                                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                                        <h4 className="font-bold text-emerald-800">Konfirmasi Akhir</h4>
                                        <p className="text-sm text-emerald-700 mb-4">Pastikan semua data sudah benar sebelum disimpan.</p>
                                        <label className="flex items-center justify-center gap-2 cursor-pointer p-2 hover:bg-emerald-100/50 rounded-lg transition-colors">
                                            <input type="checkbox" name="finalAgreement" checked={(formData as any).finalAgreement} onChange={handleFullFormChange} className="w-5 h-5 text-emerald-600 rounded" />
                                            <span className="text-sm font-bold">Ya, Saya menyatakan data ini benar.</span>
                                        </label>
                                        {formErrors.finalAgreement && <p className="text-xs text-red-500 font-bold mt-2">{formErrors.finalAgreement}</p>}
                                    </div>
                                    <button 
                                        onClick={submitFullForm}
                                        disabled={!(formData as any).finalAgreement}
                                        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                                    >
                                        SIMPAN PERMANEN
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-stone-100 flex justify-between gap-4">
                            {currentStep > 1 && (
                                <button onClick={() => setCurrentStep(p => p - 1)} className="px-6 py-3 text-stone-500 font-bold hover:bg-stone-50 rounded-xl transition-colors border border-stone-200">
                                    Kembali
                                </button>
                            )}
                            {currentStep < 4 && (
                                <button onClick={handleNextStep} className="ml-auto px-8 py-3 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-900 shadow-lg transition-all active:scale-95">
                                    Lanjut
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
            
            <div className="mt-8 sm:mt-12 text-center text-slate-400 text-[10px] font-bold tracking-widest uppercase no-print">
                © 2026 PONDOK PESANTREN BHUMI NGASOR
            </div>
        </div>
    );
};

export default App;
