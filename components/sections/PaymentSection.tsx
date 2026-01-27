
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
            <div className="overflow-hidden rounded-xl border border-stone-200 shadow-sm">
                <div className="bg-emerald-600 px-4 py-3 text-white text-center">
                    <h4 className="font-bold text-lg uppercase tracking-wider">BIAYA PENDAFTARAN SANTRI BARU</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-stone-50 text-stone-700 font-bold uppercase text-xs border-b border-stone-200">
                            <tr>
                                <th className="px-4 py-3 text-center border-r border-stone-200 whitespace-nowrap">Rincian Biaya</th>
                                <th className="px-4 py-3 text-center border-r border-stone-200 bg-emerald-50 text-emerald-800 whitespace-nowrap">
                                    Gelombang 1<br/><span className="text-[10px] font-normal normal-case opacity-75">Januari - Maret</span>
                                </th>
                                <th className="px-4 py-3 text-center border-r border-stone-200 whitespace-nowrap">
                                    Gelombang 2<br/><span className="text-[10px] font-normal normal-case text-stone-500">April - Mei</span>
                                </th>
                                <th className="px-4 py-3 text-center whitespace-nowrap">
                                    Gelombang 3<br/><span className="text-[10px] font-normal normal-case text-stone-500">Juni - Juli</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 text-stone-800 font-medium">
                            <tr>
                                <td className="px-4 py-3 font-bold bg-stone-50 border-r border-stone-200 whitespace-nowrap">Pendaftaran</td>
                                <td className="px-4 py-3 text-center border-r border-stone-200 bg-emerald-50/50 whitespace-nowrap">Rp. 150.000</td>
                                <td className="px-4 py-3 text-center border-r border-stone-200 whitespace-nowrap">Rp. 250.000</td>
                                <td className="px-4 py-3 text-center whitespace-nowrap">Rp. 350.000</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-bold bg-stone-50 border-r border-stone-200 whitespace-nowrap">Almari</td>
                                <td className="px-4 py-3 text-center border-r border-stone-200 bg-emerald-50/50 whitespace-nowrap">Rp. 350.000</td>
                                <td className="px-4 py-3 text-center border-r border-stone-200 whitespace-nowrap">Rp. 350.000</td>
                                <td className="px-4 py-3 text-center whitespace-nowrap">Rp. 350.000</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-bold bg-stone-50 border-r border-stone-200 whitespace-nowrap">Kitab</td>
                                <td className="px-4 py-3 text-center border-r border-stone-200 bg-emerald-50/50 whitespace-nowrap">Rp. 200.000</td>
                                <td className="px-4 py-3 text-center border-r border-stone-200 whitespace-nowrap">Rp. 200.000</td>
                                <td className="px-4 py-3 text-center whitespace-nowrap">Rp. 200.000</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-bold bg-stone-50 border-r border-stone-200 whitespace-nowrap">Seragam</td>
                                <td className="px-4 py-3 text-center border-r border-stone-200 bg-emerald-50/50 whitespace-nowrap">Rp. 300.000</td>
                                <td className="px-4 py-3 text-center border-r border-stone-200 whitespace-nowrap">Rp. 300.000</td>
                                <td className="px-4 py-3 text-center whitespace-nowrap">Rp. 300.000</td>
                            </tr>
                            <tr className="bg-emerald-50 text-emerald-900 font-bold border-t-2 border-emerald-200">
                                <td className="px-4 py-3 text-center border-r border-emerald-200 whitespace-nowrap">TOTAL</td>
                                <td className="px-4 py-3 text-center border-r border-emerald-200 bg-emerald-100 whitespace-nowrap">Rp. 1.000.000</td>
                                <td className="px-4 py-3 text-center border-r border-emerald-200 whitespace-nowrap">Rp. 1.100.000</td>
                                <td className="px-4 py-3 text-center whitespace-nowrap">Rp. 1.200.000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="bg-stone-800 text-white p-4 flex flex-col sm:flex-row justify-between items-center gap-2">
                    <span className="text-xs uppercase tracking-widest font-bold text-stone-400">Biaya Lainnya</span>
                    <div className="flex items-center gap-2">
                         <span className="font-serif italic text-stone-300 text-sm">Uang Makan / Bulan :</span>
                         <span className="text-xl font-bold text-emerald-400">Rp. 400.000</span>
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
