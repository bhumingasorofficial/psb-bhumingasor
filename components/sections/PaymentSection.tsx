
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

    // LOGIKA GELOMBANG OTOMATIS
    const currentMonth = new Date().getMonth(); // 0 = Jan, 1 = Feb, ...
    
    // Tentukan Gelombang Aktif
    // Gel 1: Jan (0), Feb (1), Mar (2)
    // Gel 2: Apr (3), Mei (4)
    // Gel 3: Jun (5), Jul (6)
    // Default ke 1 jika diluar bulan tersebut (misal testing di Des)
    let activeWave = 1; 
    if (currentMonth >= 0 && currentMonth <= 2) activeWave = 1;
    else if (currentMonth >= 3 && currentMonth <= 4) activeWave = 2;
    else if (currentMonth >= 5 && currentMonth <= 6) activeWave = 3;
    
    // Helper function untuk style kolom
    const getColumnStyle = (wave: number) => {
        const isActive = wave === activeWave;
        if (isActive) {
            return "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500 ring-inset ring-opacity-50 relative z-10";
        }
        return "bg-stone-50 text-stone-400 opacity-60 grayscale-[0.5]";
    };

    const getHeaderStyle = (wave: number) => {
        const isActive = wave === activeWave;
        if (isActive) {
            return "bg-emerald-600 text-white shadow-md relative overflow-hidden";
        }
        return "bg-stone-100 text-stone-500";
    };

    const ActiveBadge = () => (
        <div className="absolute top-0 right-0 left-0 bg-yellow-400 text-yellow-900 text-[9px] font-black uppercase tracking-widest py-0.5 animate-pulse shadow-sm">
            Sedang Berlangsung
        </div>
    );

    const handleCopy = () => {
        navigator.clipboard.writeText('122901000279561');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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

            {/* Tabel Rincian Biaya */}
            <div className="overflow-hidden rounded-xl border border-stone-200 shadow-sm relative">
                <div className="bg-emerald-800 px-4 py-3 text-white text-center">
                    <h4 className="font-bold text-lg uppercase tracking-wider">BIAYA PENDAFTARAN SANTRI BARU</h4>
                </div>
                <div className="overflow-x-auto pb-2">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-xs border-b border-stone-200">
                            <tr>
                                <th className="px-4 py-4 text-center border-r border-stone-200 whitespace-nowrap bg-stone-50 text-stone-700 font-bold w-1/4">
                                    RINCIAN BIAYA
                                </th>
                                <th className={`px-4 py-4 text-center border-r border-stone-200 whitespace-nowrap transition-all ${getHeaderStyle(1)} w-1/4`}>
                                    {activeWave === 1 && <ActiveBadge />}
                                    <div className={activeWave === 1 ? "mt-2" : ""}>
                                        <span className="font-bold text-sm block">GELOMBANG 1</span>
                                        <span className="text-[10px] font-normal block opacity-90 mt-0.5">Januari - Maret</span>
                                    </div>
                                </th>
                                <th className={`px-4 py-4 text-center border-r border-stone-200 whitespace-nowrap transition-all ${getHeaderStyle(2)} w-1/4`}>
                                    {activeWave === 2 && <ActiveBadge />}
                                    <div className={activeWave === 2 ? "mt-2" : ""}>
                                        <span className="font-bold text-sm block">GELOMBANG 2</span>
                                        <span className="text-[10px] font-normal block opacity-90 mt-0.5">April - Mei</span>
                                    </div>
                                </th>
                                <th className={`px-4 py-4 text-center whitespace-nowrap transition-all ${getHeaderStyle(3)} w-1/4`}>
                                    {activeWave === 3 && <ActiveBadge />}
                                    <div className={activeWave === 3 ? "mt-2" : ""}>
                                        <span className="font-bold text-sm block">GELOMBANG 3</span>
                                        <span className="text-[10px] font-normal block opacity-90 mt-0.5">Juni - Juli</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 text-stone-800 font-medium">
                            {/* Baris Pendaftaran */}
                            <tr>
                                <td className="px-4 py-3 font-bold bg-stone-50 border-r border-stone-200 whitespace-nowrap">Pendaftaran</td>
                                <td className={`px-4 py-3 text-center border-r border-stone-200 whitespace-nowrap ${getColumnStyle(1)}`}>Rp. 150.000</td>
                                <td className={`px-4 py-3 text-center border-r border-stone-200 whitespace-nowrap ${getColumnStyle(2)}`}>Rp. 250.000</td>
                                <td className={`px-4 py-3 text-center whitespace-nowrap ${getColumnStyle(3)}`}>Rp. 350.000</td>
                            </tr>
                            {/* Baris Almari */}
                            <tr>
                                <td className="px-4 py-3 font-bold bg-stone-50 border-r border-stone-200 whitespace-nowrap">Almari</td>
                                <td className={`px-4 py-3 text-center border-r border-stone-200 whitespace-nowrap ${getColumnStyle(1)}`}>Rp. 350.000</td>
                                <td className={`px-4 py-3 text-center border-r border-stone-200 whitespace-nowrap ${getColumnStyle(2)}`}>Rp. 350.000</td>
                                <td className={`px-4 py-3 text-center whitespace-nowrap ${getColumnStyle(3)}`}>Rp. 350.000</td>
                            </tr>
                            {/* Baris Kitab */}
                            <tr>
                                <td className="px-4 py-3 font-bold bg-stone-50 border-r border-stone-200 whitespace-nowrap">Kitab</td>
                                <td className={`px-4 py-3 text-center border-r border-stone-200 whitespace-nowrap ${getColumnStyle(1)}`}>Rp. 200.000</td>
                                <td className={`px-4 py-3 text-center border-r border-stone-200 whitespace-nowrap ${getColumnStyle(2)}`}>Rp. 200.000</td>
                                <td className={`px-4 py-3 text-center whitespace-nowrap ${getColumnStyle(3)}`}>Rp. 200.000</td>
                            </tr>
                            {/* Baris Seragam */}
                            <tr>
                                <td className="px-4 py-3 font-bold bg-stone-50 border-r border-stone-200 whitespace-nowrap">Seragam</td>
                                <td className={`px-4 py-3 text-center border-r border-stone-200 whitespace-nowrap ${getColumnStyle(1)}`}>Rp. 300.000</td>
                                <td className={`px-4 py-3 text-center border-r border-stone-200 whitespace-nowrap ${getColumnStyle(2)}`}>Rp. 300.000</td>
                                <td className={`px-4 py-3 text-center whitespace-nowrap ${getColumnStyle(3)}`}>Rp. 300.000</td>
                            </tr>
                            {/* TOTAL ROW */}
                            <tr className="border-t-2 border-stone-300">
                                <td className="px-4 py-4 text-center border-r border-stone-200 whitespace-nowrap bg-stone-800 text-white font-bold">TOTAL</td>
                                <td className={`px-4 py-4 text-center border-r border-stone-200 whitespace-nowrap font-black text-lg ${activeWave === 1 ? 'bg-emerald-100 text-emerald-800 scale-105 shadow-inner' : 'bg-stone-100 text-stone-400'}`}>Rp. 1.000.000</td>
                                <td className={`px-4 py-4 text-center border-r border-stone-200 whitespace-nowrap font-black text-lg ${activeWave === 2 ? 'bg-emerald-100 text-emerald-800 scale-105 shadow-inner' : 'bg-stone-100 text-stone-400'}`}>Rp. 1.100.000</td>
                                <td className={`px-4 py-4 text-center whitespace-nowrap font-black text-lg ${activeWave === 3 ? 'bg-emerald-100 text-emerald-800 scale-105 shadow-inner' : 'bg-stone-100 text-stone-400'}`}>Rp. 1.200.000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="bg-stone-50 p-4 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-2">
                    <span className="text-xs uppercase tracking-widest font-bold text-stone-500">Biaya Lainnya</span>
                    <div className="flex items-center gap-2">
                         <span className="font-serif italic text-stone-600 text-sm">Uang Makan / Bulan :</span>
                         <span className="text-lg font-bold text-stone-800 bg-white px-3 py-1 rounded border border-stone-200 shadow-sm">Rp. 400.000</span>
                    </div>
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
