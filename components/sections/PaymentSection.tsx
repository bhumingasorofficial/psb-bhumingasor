
import React, { useState } from 'react';
import { FormData, FormErrors } from '../../types';
import FileInput from '../FileInput';

interface Props {
    formData: FormData;
    errors: FormErrors;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleFileClear: (name: keyof FormData) => void;
}

const PaymentSection: React.FC<Props> = ({ formData, errors, handleFileChange, handleFileClear }) => {
    const [copied, setCopied] = useState(false);

    // MOBILE TABS STATE
    const [activeTab, setActiveTab] = useState(1);

    // LOGIKA GELOMBANG OTOMATIS
    const currentMonth = new Date().getMonth(); // 0 = Jan
    let activeWave = 1; 
    if (currentMonth >= 0 && currentMonth <= 2) activeWave = 1;
    else if (currentMonth >= 3 && currentMonth <= 4) activeWave = 2;
    else if (currentMonth >= 5 && currentMonth <= 6) activeWave = 3;
    
    // Set default active tab to current wave
    React.useEffect(() => {
        setActiveTab(activeWave);
    }, [activeWave]);

    // Helper Styles
    const getColumnStyle = (wave: number) => {
        if (wave === activeWave) return "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500 ring-inset ring-opacity-50 relative z-10";
        return "bg-stone-50 text-stone-400 opacity-60 grayscale-[0.5]";
    };

    const getHeaderStyle = (wave: number) => {
        if (wave === activeWave) return "bg-emerald-600 text-white shadow-md relative overflow-hidden";
        return "bg-stone-100 text-stone-500";
    };

    const ActiveBadge = () => (
        <div className="absolute top-0 right-0 left-0 bg-yellow-400 text-yellow-900 text-[9px] font-black uppercase tracking-widest py-0.5 animate-pulse shadow-sm">
            Sedang Berlangsung
        </div>
    );

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent accidental form submit
        navigator.clipboard.writeText('122901000279561');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Data Biaya
    const costData = {
        items: [
            { name: "Pendaftaran", gel1: "150.000", gel2: "250.000", gel3: "350.000" },
            { name: "Almari", gel1: "350.000", gel2: "350.000", gel3: "350.000" },
            { name: "Kitab", gel1: "200.000", gel2: "200.000", gel3: "200.000" },
            { name: "Seragam", gel1: "300.000", gel2: "300.000", gel3: "300.000" },
            { name: "Administrasi", gel1: "50.000", gel2: "50.000", gel3: "50.000" },
        ],
        totals: { gel1: "1.050.000", gel2: "1.150.000", gel3: "1.250.000" }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex items-center gap-4 border-b border-stone-200 pb-4">
                <div className="w-10 h-10 rounded bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-stone-800">Pembayaran Administrasi</h3>
                    <p className="text-sm text-stone-500">Rincian biaya pendaftaran santri baru Tahun Ajaran 2026/2027.</p>
                </div>
            </div>

            {/* --- DESKTOP VIEW (TABLE) --- */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-stone-200 shadow-sm relative">
                <div className="bg-emerald-800 px-4 py-3 text-white text-center">
                    <h4 className="font-bold text-lg uppercase tracking-wider">RINCIAN BIAYA PENDAFTARAN</h4>
                </div>
                <div className="overflow-x-auto pb-2">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-xs border-b border-stone-200">
                            <tr>
                                <th className="px-4 py-4 text-center border-r border-stone-200 whitespace-nowrap bg-stone-50 text-stone-700 font-bold w-1/4">RINCIAN BIAYA</th>
                                {[1, 2, 3].map(wave => (
                                    <th key={wave} className={`px-4 py-4 text-center border-r border-stone-200 whitespace-nowrap transition-all ${getHeaderStyle(wave)} w-1/4`}>
                                        {activeWave === wave && <ActiveBadge />}
                                        <div className={activeWave === wave ? "mt-2" : ""}>
                                            <span className="font-bold text-sm block">GELOMBANG {wave}</span>
                                            <span className="text-[10px] font-normal block opacity-90 mt-0.5">
                                                {wave === 1 ? 'Januari - Maret' : wave === 2 ? 'April - Mei' : 'Juni - Juli'}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 text-stone-800 font-medium">
                            {costData.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="px-4 py-3 font-bold bg-stone-50 border-r border-stone-200 whitespace-nowrap">{item.name}</td>
                                    <td className={`px-4 py-3 text-center border-r border-stone-200 whitespace-nowrap ${getColumnStyle(1)}`}>Rp. {item.gel1}</td>
                                    <td className={`px-4 py-3 text-center border-r border-stone-200 whitespace-nowrap ${getColumnStyle(2)}`}>Rp. {item.gel2}</td>
                                    <td className={`px-4 py-3 text-center whitespace-nowrap ${getColumnStyle(3)}`}>Rp. {item.gel3}</td>
                                </tr>
                            ))}
                            <tr className="border-t-2 border-stone-300">
                                <td className="px-4 py-4 text-center border-r border-stone-200 whitespace-nowrap bg-stone-800 text-white font-bold">TOTAL</td>
                                <td className={`px-4 py-4 text-center border-r border-stone-200 whitespace-nowrap font-black text-lg ${activeWave === 1 ? 'bg-emerald-100 text-emerald-800 scale-105 shadow-inner' : 'bg-stone-100 text-stone-400'}`}>Rp. {costData.totals.gel1}</td>
                                <td className={`px-4 py-4 text-center border-r border-stone-200 whitespace-nowrap font-black text-lg ${activeWave === 2 ? 'bg-emerald-100 text-emerald-800 scale-105 shadow-inner' : 'bg-stone-100 text-stone-400'}`}>Rp. {costData.totals.gel2}</td>
                                <td className={`px-4 py-4 text-center whitespace-nowrap font-black text-lg ${activeWave === 3 ? 'bg-emerald-100 text-emerald-800 scale-105 shadow-inner' : 'bg-stone-100 text-stone-400'}`}>Rp. {costData.totals.gel3}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MOBILE VIEW (TABS + CARDS) --- */}
            <div className="block sm:hidden">
                {/* Tabs */}
                <div className="flex bg-stone-100 p-1 rounded-xl mb-4 overflow-x-auto scrollbar-hide">
                    {[1, 2, 3].map(wave => (
                        <button
                            key={wave}
                            type="button" // FIX: Prevent form submission/validation scroll
                            onClick={() => setActiveTab(wave)}
                            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg whitespace-nowrap transition-all duration-300 relative ${
                                activeTab === wave 
                                ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100' 
                                : 'text-stone-400 hover:text-stone-600'
                            }`}
                        >
                            Gelombang {wave}
                            {activeWave === wave && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        </button>
                    ))}
                </div>

                {/* Card Content for Active Tab */}
                <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-sm overflow-hidden relative">
                    <div className="bg-emerald-500 text-white px-5 py-4 text-center">
                         <h4 className="font-black text-xl uppercase tracking-widest">GELOMBANG {activeTab}</h4>
                         <p className="text-xs opacity-90 mt-1 font-medium">
                            {activeTab === 1 ? 'Januari - Maret' : activeTab === 2 ? 'April - Mei' : 'Juni - Juli'}
                         </p>
                    </div>

                    <div className="p-5 space-y-3">
                        {costData.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center border-b border-dashed border-stone-200 pb-2 last:border-0 last:pb-0">
                                <span className="text-stone-600 font-bold text-sm">{item.name}</span>
                                <span className="text-stone-800 font-bold">
                                    Rp. {activeTab === 1 ? item.gel1 : activeTab === 2 ? item.gel2 : item.gel3}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-stone-900 text-white p-5 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">TOTAL BIAYA</span>
                        <span className="text-2xl font-black text-emerald-400">
                             Rp. {activeTab === 1 ? costData.totals.gel1 : activeTab === 2 ? costData.totals.gel2 : costData.totals.gel3}
                        </span>
                    </div>
                </div>

                {/* Uang Makan Mobile */}
                 <div className="bg-stone-50 p-4 border border-stone-200 rounded-xl mt-4 flex justify-between items-center">
                    <span className="text-xs uppercase tracking-widest font-bold text-stone-500">Uang Makan / Bln</span>
                    <span className="text-base font-bold text-stone-800 bg-white px-3 py-1 rounded border border-stone-200">Rp. 400.000</span>
                </div>
            </div>

            {/* Informasi Rekening */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left shadow-sm">
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
                            {copied ? (
                                <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    Disalin
                                </>
                            ) : (
                                <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                    Salin
                                </>
                            )}
                        </button>
                    </div>
                    <p className="text-sm font-bold text-slate-600 break-words">An. YPP An Nur Hidayatus Salam Bhumi Ngasor</p>
                </div>
            </div>

            {/* Upload Bukti Pembayaran */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div className="mb-6">
                    <h4 className="font-bold text-lg text-stone-800 mb-2">Upload Bukti Pembayaran</h4>
                    <p className="text-sm text-stone-500 leading-relaxed">
                        Silahkan lakukan pembayaran sesuai gelombang pendaftaran ke rekening di atas, kemudian unggah foto/scan nota atau bukti transfer di bawah ini.
                    </p>
                </div>
                
                <div className="group">
                    <FileInput 
                        label="Bukti Pembayaran / Nota" 
                        id="buktiPembayaran" 
                        name="buktiPembayaran" 
                        onChange={handleFileChange} 
                        onClear={() => handleFileClear('buktiPembayaran')}
                        error={errors.buktiPembayaran} 
                        required 
                        accept="image/*" 
                        file={formData.buktiPembayaran}
                        showPreview
                    />
                </div>
            </div>
        </div>
    );
};

export default PaymentSection;
