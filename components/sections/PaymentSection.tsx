
import React, { useState } from 'react';

interface Props {
    activeWave: number;
}

const PaymentSection: React.FC<Props> = ({ activeWave }) => {
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
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex items-center gap-4 border-b border-stone-200 pb-4">
                <div className="w-10 h-10 rounded bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-stone-800">Informasi Biaya Administrasi</h3>
                    <p className="text-sm text-stone-500">Rincian total biaya pendaftaran ulang santri baru.</p>
                </div>
            </div>

            {/* --- DESKTOP VIEW (TABLE) --- */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-stone-200 shadow-sm relative">
                <div className="bg-emerald-800 px-4 py-3 text-white text-center">
                    <h4 className="font-bold text-lg uppercase tracking-wider">RINCIAN BIAYA PENDAFTARAN ULANG</h4>
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

            {/* --- MOBILE VIEW (SEGMENTED CONTROL + CARDS) --- */}
            <div className="block sm:hidden">
                {/* Segmented Control Tabs */}
                <div className="flex bg-stone-100 p-1 rounded-xl mb-6 shadow-inner overflow-hidden">
                    {[1, 2, 3].map(wave => (
                        <button
                            key={wave}
                            type="button" 
                            onClick={() => setActiveTab(wave)}
                            className={`flex-1 py-2.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all duration-300 relative ${
                                activeTab === wave 
                                ? 'bg-white text-emerald-700 shadow border border-stone-100' 
                                : 'text-stone-400 hover:text-stone-600'
                            }`}
                        >
                            <span className="block">Gel {wave}</span>
                             {activeWave === wave && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-sm"></span>}
                        </button>
                    ))}
                </div>

                {/* Card Content for Active Tab */}
                <div className="bg-white rounded-2xl border border-emerald-100 shadow-lg shadow-emerald-500/5 overflow-hidden relative">
                    <div className="bg-emerald-600 text-white px-5 py-4 text-center relative overflow-hidden">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                         <h4 className="font-black text-xl uppercase tracking-widest relative z-10">GELOMBANG {activeTab}</h4>
                         <p className="text-xs text-emerald-100 mt-1 font-medium relative z-10">
                            {activeTab === 1 ? 'Januari - Maret' : activeTab === 2 ? 'April - Mei' : 'Juni - Juli'}
                         </p>
                    </div>

                    <div className="p-5 space-y-3">
                        {costData.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center border-b border-dashed border-stone-200 pb-2 last:border-0 last:pb-0">
                                <span className="text-stone-500 font-bold text-sm">{item.name}</span>
                                <span className="text-stone-800 font-bold font-mono">
                                    Rp. {activeTab === 1 ? item.gel1 : activeTab === 2 ? item.gel2 : item.gel3}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-stone-50 p-5 flex justify-between items-center border-t border-stone-100">
                        <span className="text-xs font-black uppercase tracking-widest text-stone-400">TOTAL BIAYA</span>
                        <span className="text-xl font-black text-emerald-600">
                             Rp. {activeTab === 1 ? costData.totals.gel1 : activeTab === 2 ? costData.totals.gel2 : costData.totals.gel3}
                        </span>
                    </div>
                </div>

                 <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-xl mt-4 flex justify-between items-center shadow-sm">
                    <span className="text-xs uppercase tracking-widest font-bold text-blue-400">Makan / Bulan</span>
                    <span className="text-sm font-bold text-blue-800 bg-white px-3 py-1 rounded border border-blue-100 shadow-sm">Rp. 400.000</span>
                </div>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center shadow-sm">
                <p className="text-xs sm:text-sm font-medium text-amber-800 leading-relaxed">
                    <span className="font-bold">Catatan:</span> Biaya administrasi dapat diangsur sesuai kemampuan wali santri setelah diterima di pondok.
                </p>
            </div>
        </div>
    );
};

export default PaymentSection;
