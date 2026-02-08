
import React, { useState } from 'react';
import { SchoolLevel, Gender } from '../../types';

interface Props {
    activeWave: number;
    schoolLevel: SchoolLevel;
    gender: Gender;
}

const PaymentSection: React.FC<Props> = ({ activeWave, schoolLevel, gender }) => {
    // MOBILE TABS STATE
    const [activeTab, setActiveTab] = useState(activeWave || 1);

    // Sync active tab with prop if it changes
    React.useEffect(() => {
        if(activeWave) setActiveTab(activeWave);
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

    // --- HELPER FORMAT CURRENCY ---
    const formatRp = (num: number) => new Intl.NumberFormat('id-ID').format(num);
    const parseRp = (str: string) => parseInt(str.replace(/\./g, ''), 10);

    // --- DATA BIAYA PONDOK (ALL LEVELS) ---
    const pondokCostData = {
        items: [
            { name: "Pendaftaran", gel1: "150.000", gel2: "250.000", gel3: "350.000" },
            { name: "Almari", gel1: "350.000", gel2: "350.000", gel3: "350.000" },
            { name: "Kitab", gel1: "200.000", gel2: "200.000", gel3: "200.000" },
            { name: "Seragam", gel1: "300.000", gel2: "300.000", gel3: "300.000" },
        ],
        totals: { gel1: "1.000.000", gel2: "1.100.000", gel3: "1.200.000" }
    };

    // --- DATA BIAYA SEKOLAH (SMP) ---
    const getSmpCostData = () => {
        const isMale = gender === Gender.LakiLaki;
        const uniformPriceNum = isMale ? 750000 : 776000;
        const bukuPriceNum = 130000;
        
        // REVISI: Hapus Pendaftaran (50k). Hanya Buku + Seragam.
        const grandTotalNum = bukuPriceNum + uniformPriceNum; 

        return {
            items: [
                // Item Pendaftaran DIHAPUS sesuai permintaan user
                { name: "Buku Pegangan Siswa", price: formatRp(bukuPriceNum) },
                { 
                    name: `Paket Seragam ${isMale ? 'Putra' : 'Putri'}`, 
                    price: formatRp(uniformPriceNum),
                    detail: isMale 
                        ? "(Biru Putih, Kopyah, Sabuk, Dasi, Batik+Celana, Seragam Coklat, Hasduk)" 
                        : "(Biru Putih, Hijab Putih, Sabuk, Dasi, Batik+Rok, Hijab Hitam, Seragam Coklat, Hasduk, Hijab Coklat)"
                }
            ],
            total: formatRp(grandTotalNum),
            totalNum: grandTotalNum
        };
    };

    const smpData = getSmpCostData();

    // Check school type
    const isMI = schoolLevel === SchoolLevel.MI;
    const isSMP = schoolLevel === SchoolLevel.SMP;
    const isSMK = schoolLevel === SchoolLevel.SMK;
    const showSchoolCost = [SchoolLevel.MI, SchoolLevel.SMP, SchoolLevel.SMK].includes(schoolLevel);

    // --- CALCULATE GRAND TOTAL (PONDOK + SEKOLAH) ---
    // 1. Get Pondok Cost based on current active wave (or active tab in mobile)
    //    We use 'activeWave' prop for the main logic, but for dynamic UI display we might check activeTab logic if needed.
    //    Ideally, calculation should be based on the *current active wave* of registration.
    const currentWave = activeWave || 1; 
    const pondokTotalStr = currentWave === 1 ? pondokCostData.totals.gel1 : currentWave === 2 ? pondokCostData.totals.gel2 : pondokCostData.totals.gel3;
    const pondokTotalNum = parseRp(pondokTotalStr);

    // 2. Get School Cost
    let schoolTotalNum = 0;
    if (isMI) schoolTotalNum = 300000;
    if (isSMP) schoolTotalNum = smpData.totalNum;
    // SMK is 0 (Info menyusul)

    // 3. Sum
    const grandTotalAll = pondokTotalNum + schoolTotalNum;


    return (
        <div className="space-y-10 animate-in fade-in duration-500">
             <div className="flex items-center gap-4 border-b border-stone-200 pb-4">
                <div className="w-10 h-10 rounded bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-stone-800">Rincian Biaya</h3>
                    <p className="text-sm text-stone-500">Estimasi total biaya yang perlu dipersiapkan.</p>
                </div>
            </div>

            {/* =================================================================================
                TABLE 1: RINCIAN BIAYA PONDOK PESANTREN (ALL LEVELS)
               ================================================================================= */}
            <div className="space-y-4">
                <div className="hidden sm:block overflow-hidden rounded-xl border border-stone-200 shadow-sm relative">
                    <div className="bg-emerald-800 px-4 py-3 text-white text-center">
                        <h4 className="font-bold text-lg uppercase tracking-wider">RINCIAN BIAYA PONDOK PESANTREN</h4>
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
                                {pondokCostData.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3 font-bold bg-stone-50 border-r border-stone-200 whitespace-nowrap">{item.name}</td>
                                        <td className={`px-4 py-3 text-center border-r border-stone-200 whitespace-nowrap ${getColumnStyle(1)}`}>Rp. {item.gel1}</td>
                                        <td className={`px-4 py-3 text-center border-r border-stone-200 whitespace-nowrap ${getColumnStyle(2)}`}>Rp. {item.gel2}</td>
                                        <td className={`px-4 py-3 text-center whitespace-nowrap ${getColumnStyle(3)}`}>Rp. {item.gel3}</td>
                                    </tr>
                                ))}
                                <tr className="border-t-2 border-stone-300">
                                    <td className="px-4 py-4 text-center border-r border-stone-200 whitespace-nowrap bg-stone-800 text-white font-bold">TOTAL PONDOK</td>
                                    <td className={`px-4 py-4 text-center border-r border-stone-200 whitespace-nowrap font-black text-lg ${activeWave === 1 ? 'bg-emerald-100 text-emerald-800 scale-105 shadow-inner' : 'bg-stone-100 text-stone-400'}`}>Rp. {pondokCostData.totals.gel1}</td>
                                    <td className={`px-4 py-4 text-center border-r border-stone-200 whitespace-nowrap font-black text-lg ${activeWave === 2 ? 'bg-emerald-100 text-emerald-800 scale-105 shadow-inner' : 'bg-stone-100 text-stone-400'}`}>Rp. {pondokCostData.totals.gel2}</td>
                                    <td className={`px-4 py-4 text-center whitespace-nowrap font-black text-lg ${activeWave === 3 ? 'bg-emerald-100 text-emerald-800 scale-105 shadow-inner' : 'bg-stone-100 text-stone-400'}`}>Rp. {pondokCostData.totals.gel3}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- MOBILE VIEW FOR PONDOK --- */}
                <div className="block sm:hidden">
                    <div className="bg-emerald-800 px-4 py-3 text-white text-center rounded-t-xl">
                        <h4 className="font-bold text-sm uppercase tracking-wider">RINCIAN BIAYA PONDOK</h4>
                    </div>
                    {/* Tabs */}
                    <div className="flex bg-stone-100 p-1 mb-4 overflow-x-auto scrollbar-hide border-x border-stone-200">
                        {[1, 2, 3].map(wave => (
                            <button
                                key={wave}
                                type="button" 
                                onClick={() => setActiveTab(wave)}
                                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg whitespace-nowrap transition-all duration-300 relative ${
                                    activeTab === wave 
                                    ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100' 
                                    : 'text-stone-400 hover:text-stone-600'
                                }`}
                            >
                                Gel {wave}
                                {activeWave === wave && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                            </button>
                        ))}
                    </div>

                    {/* Card Content for Active Tab */}
                    <div className="bg-white rounded-b-2xl border-x border-b border-emerald-500 shadow-sm overflow-hidden relative mb-4">
                        <div className="p-5 space-y-3">
                            {pondokCostData.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center border-b border-dashed border-stone-200 pb-2 last:border-0 last:pb-0">
                                    <span className="text-stone-600 font-bold text-sm">{item.name}</span>
                                    <span className="text-stone-800 font-bold">
                                        Rp. {activeTab === 1 ? item.gel1 : activeTab === 2 ? item.gel2 : item.gel3}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="bg-stone-900 text-white p-5 flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">TOTAL PONDOK</span>
                            <span className="text-xl font-black text-emerald-400">
                                 Rp. {activeTab === 1 ? pondokCostData.totals.gel1 : activeTab === 2 ? pondokCostData.totals.gel2 : pondokCostData.totals.gel3}
                            </span>
                        </div>
                    </div>
                     <div className="bg-stone-50 p-4 border border-stone-200 rounded-xl mt-4 flex justify-between items-center">
                        <span className="text-xs uppercase tracking-widest font-bold text-stone-500">Makan / Bulan</span>
                        <span className="text-sm font-bold text-stone-800 bg-white px-3 py-1 rounded border border-stone-200">Rp. 400.000</span>
                    </div>
                </div>
            </div>

            {/* =================================================================================
                TABLE 2: RINCIAN BIAYA SEKOLAH (MI / SMP / SMK ONLY)
               ================================================================================= */}
            {showSchoolCost && (
                <div className="space-y-4 animate-fade-up">
                     <div className="bg-indigo-900 px-4 py-3 text-white text-center rounded-t-xl shadow-sm">
                        <h4 className="font-bold text-lg uppercase tracking-wider">
                            RINCIAN BIAYA SEKOLAH ({schoolLevel === SchoolLevel.MI ? 'MI' : schoolLevel === SchoolLevel.SMP ? 'SMP' : 'SMK'})
                        </h4>
                    </div>

                    <div className="bg-white border-x border-b border-stone-200 rounded-b-xl shadow-sm overflow-hidden p-0">
                        {/* CASE MI */}
                        {isMI && (
                             <div className="p-6 text-center">
                                <div className="flex justify-between items-center border-b border-stone-100 pb-4 mb-4">
                                    <span className="text-stone-600 font-bold">Seragam Sekolah & Raport</span>
                                    <span className="text-xl font-bold text-indigo-700">Rp. 300.000</span>
                                </div>
                                <div className="bg-indigo-50 p-4 rounded-lg">
                                    <p className="font-bold text-indigo-900">Total Biaya Sekolah: Rp. 300.000</p>
                                </div>
                             </div>
                        )}

                        {/* CASE SMK */}
                        {isSMK && (
                             <div className="p-10 text-center">
                                <div className="inline-block p-4 bg-amber-50 rounded-full text-amber-500 mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h5 className="text-lg font-bold text-stone-700">Informasi Menyusul</h5>
                                <p className="text-sm text-stone-500">Rincian biaya untuk jenjang SMK akan diinformasikan lebih lanjut oleh panitia.</p>
                             </div>
                        )}

                        {/* CASE SMP */}
                        {isSMP && (
                            <div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                                            <tr>
                                                <th className="px-6 py-3 w-2/3">Item Pembayaran</th>
                                                <th className="px-6 py-3 text-right">Nominal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-100">
                                            {smpData.items.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-stone-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-stone-700">{item.name}</div>
                                                        {item.detail && <div className="text-xs text-stone-400 mt-1 leading-relaxed max-w-md">{item.detail}</div>}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium text-stone-800">Rp. {item.price}</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-indigo-50">
                                                <td className="px-6 py-4 font-bold text-indigo-900 uppercase">Total Biaya Sekolah</td>
                                                <td className="px-6 py-4 text-right font-black text-lg text-indigo-700">Rp. {smpData.total}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* --- GRAND TOTAL SECTION (PONDOK + SEKOLAH) --- */}
            {grandTotalAll > 0 && (
                <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-stone-700 flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-up">
                    <div className="text-center sm:text-left">
                        <h4 className="text-lg sm:text-xl font-black uppercase tracking-widest text-emerald-400 mb-1">
                            TOTAL KESELURUHAN
                        </h4>
                        <p className="text-stone-400 text-xs sm:text-sm">
                            Estimasi Biaya Pondok (Gelombang {currentWave}) + Biaya Sekolah
                        </p>
                    </div>
                    <div className="text-center sm:text-right">
                        <div className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-lg">
                            Rp. {formatRp(grandTotalAll)}
                        </div>
                        {isSMK && <p className="text-[10px] text-amber-400 mt-1">*Belum termasuk biaya SMK</p>}
                    </div>
                </div>
            )}

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
                <p className="text-sm font-medium text-amber-800">
                    <span className="font-bold">Catatan:</span> Biaya administrasi dapat diangsur sampai sebelum masuk di pondok pesantren.
                </p>
            </div>
        </div>
    );
};

export default PaymentSection;
