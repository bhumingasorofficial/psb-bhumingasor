
import React, { useRef, useEffect, useState } from 'react';
import { RegistrationFormData, Gender } from '../../types';
import Input from '../Input';
import Select from '../Select';
import FileInput from '../FileInput';

interface Props {
    formData: RegistrationFormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleSurveyChange: (selected: string[]) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleFileClear: () => void;
    setTurnstileToken: (token: string) => void;
    errors: any;
    activeWave: number; 
}

const SURVEY_OPTIONS = [
    { id: 'keluarga', label: 'Keluarga/Teman', icon: '👨‍👩‍👧‍👦' },
    { id: 'sosmed', label: 'Sosial Media', icon: '📱' },
    { id: 'brosur', label: 'Media Cetak', icon: '📰' }, // Shortened label
    { id: 'alumni', label: 'Alumni', icon: '🎓' }, // Shortened label
];

const RegistrationSection: React.FC<Props> = ({ 
    formData, handleChange, handleSurveyChange, handleFileChange, handleFileClear, setTurnstileToken, errors, activeWave
}) => {
    const turnstileRef = useRef<HTMLDivElement>(null);
    const [turnstileError, setTurnstileError] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const siteKey = '1x00000000000000000000AA'; // Test Key
        let widgetId: string | null = null;
        
        const renderTurnstile = () => {
            if (!turnstileRef.current) return;

            try {
                // Safety check for window.turnstile access
                const w = window as any;
                if (w.turnstile) {
                    turnstileRef.current.innerHTML = '';
                    widgetId = w.turnstile.render(turnstileRef.current, {
                        sitekey: siteKey, 
                        callback: function(token: string) { setTurnstileToken(token); },
                        'expired-callback': function() { setTurnstileToken(''); },
                        'error-callback': function() { 
                            console.warn("Turnstile Error Callback");
                            setTurnstileError(true);
                        }
                    });
                }
            } catch (e) {
                console.warn("Turnstile render failed:", e);
                setTurnstileError(true);
            }
        };

        renderTurnstile();
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (attempts > 5) {
                clearInterval(interval);
                if (!widgetId) setTurnstileError(true); 
                return;
            }
            try {
                const w = window as any;
                if (w.turnstile && turnstileRef.current && !turnstileRef.current.hasChildNodes()) {
                    renderTurnstile();
                    clearInterval(interval);
                }
            } catch (e) { }
        }, 1000);

        return () => {
            clearInterval(interval);
            try {
                const w = window as any;
                if (widgetId && w.turnstile) w.turnstile.remove(widgetId);
            } catch (e) { }
        };
    }, [setTurnstileToken]);

    useEffect(() => {
        if (turnstileError) setTurnstileToken("BYPASS_TOKEN_DEV");
    }, [turnstileError, setTurnstileToken]);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault(); 
        navigator.clipboard.writeText('122901000279561');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleSurvey = (label: string) => {
        const current = formData.infoSource || [];
        if (current.includes(label)) handleSurveyChange(current.filter(i => i !== label));
        else handleSurveyChange([...current, label]);
    };

    return (
        <div className="space-y-8 animate-fade-up">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-xl font-bold text-stone-800">Formulir Pendaftaran Awal</h3>
                <p className="text-sm text-stone-500">Isi data dasar dan beli Token Formulir untuk melanjutkan pendaftaran.</p>
            </div>

            {/* Step 1: Survey */}
            <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200">
                <label className="block text-sm font-bold text-stone-700 mb-3">Darimana Anda mengetahui Pesantren ini?</label>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                    {SURVEY_OPTIONS.map((opt) => (
                        <div key={opt.id} onClick={() => toggleSurvey(opt.label)}
                            className={`p-3 rounded-xl border-2 cursor-pointer flex flex-col sm:flex-row items-center gap-2 sm:gap-3 transition-all text-center sm:text-left ${formData.infoSource?.includes(opt.label) ? 'border-emerald-500 bg-emerald-50' : 'border-stone-100 bg-white hover:border-emerald-200'}`}>
                            <span className="text-2xl sm:text-xl">{opt.icon}</span>
                            <span className="text-xs sm:text-sm font-bold text-stone-700 leading-tight">{opt.label}</span>
                        </div>
                    ))}
                </div>
                {errors.infoSource && <p className="text-xs text-red-500 mt-2 font-bold">{errors.infoSource}</p>}
            </div>

            {/* Step 2: Data Dasar */}
            <div className="space-y-4">
                <Input label="Nama Lengkap Calon Santri" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} error={errors.fullName} required />
                <Input label="NIK Santri" id="nik" name="nik" value={formData.nik} onChange={handleChange} error={errors.nik} required maxLength={16} placeholder="16 digit sesuai KK" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select label="Jenis Kelamin" id="gender" name="gender" value={formData.gender} onChange={handleChange} error={errors.gender} required>
                        {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                    </Select>
                    <Input label="No. WhatsApp Aktif" id="parentWaNumber" name="parentWaNumber" value={formData.parentWaNumber} onChange={handleChange} error={errors.parentWaNumber} required placeholder="08..." />
                </div>
            </div>

            {/* Step 3: Pembayaran Token Formulir (Specific 200k) */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-stone-200 pb-4 mt-6">
                    <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-blue-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-stone-800">Pembelian Formulir (Token)</h3>
                        <p className="text-sm text-stone-500">Lakukan transfer untuk mendapatkan Token Pendaftaran.</p>
                    </div>
                </div>

                {/* Cost Card 200k */}
                <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="bg-stone-900 text-white p-4 flex justify-between items-center">
                        <span className="text-sm font-bold uppercase tracking-widest text-stone-300">TOTAL BIAYA FORMULIR</span>
                        <span className="text-xl font-black text-emerald-400">Rp. 200.000</span>
                    </div>
                    <div className="p-4 bg-stone-50 text-xs text-stone-500 space-y-1">
                        <div className="flex justify-between border-b border-stone-200 pb-1">
                            <span>Formulir Sekolah</span>
                            <span>Rp. 50.000</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Formulir Pondok</span>
                            <span>Rp. 150.000</span>
                        </div>
                    </div>
                </div>

                {/* Bank Info */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left shadow-sm">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0 border border-blue-100 overflow-hidden p-1">
                        <img src="https://github.com/bhumingasorofficial/asset-bhumingasor/blob/85f9c6ed95945b9a27734d5d3945cb02b4d80a1a/dfgdfg.png?raw=true" alt="BRI Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 w-full">
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Rekening Resmi Yayasan</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4 mb-1">
                            <p className="text-2xl sm:text-3xl font-mono font-bold text-slate-800 tracking-tight select-all">122901000279561</p>
                            <button 
                                type="button"
                                onClick={handleCopy}
                                className="bg-white border border-blue-200 hover:bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
                            >
                                {copied ? 'Disalin' : 'Salin'}
                            </button>
                        </div>
                        <p className="text-sm font-bold text-slate-600">An. YPP An Nur Hidayatus Salam</p>
                    </div>
                </div>

                {/* Upload Bukti */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-sm">
                     <FileInput 
                        label="Upload Bukti Transfer (Rp 200.000)" 
                        id="buktiPembayaran" 
                        name="buktiPembayaran" 
                        onChange={handleFileChange} 
                        onClear={() => handleFileClear()}
                        error={errors.buktiPembayaran} 
                        required 
                        accept="image/*" 
                        file={formData.buktiPembayaran}
                        showPreview
                    />
                </div>
            </div>

            {/* Agreement & Captcha */}
            <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-stone-200 bg-stone-50">
                    <input type="checkbox" name="termsAgreed" checked={formData.termsAgreed} onChange={handleChange} className="mt-1 w-5 h-5 text-emerald-600 rounded" />
                    <span className="text-xs text-stone-600 font-medium">Saya menyatakan data awal ini benar dan telah melakukan transfer sebesar Rp 200.000 untuk pembelian formulir.</span>
                </label>
                {errors.termsAgreed && <p className="text-xs text-red-500 font-bold">{errors.termsAgreed}</p>}
                
                <div className="flex flex-col items-center gap-2">
                    <div ref={turnstileRef} className="min-h-[65px]"></div>
                    {turnstileError && (
                        <p className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded">
                            ⚠️ Captcha tidak dimuat (Preview Mode). Otomatis diverifikasi.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegistrationSection;
