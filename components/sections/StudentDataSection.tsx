
import React, { useMemo, useState, useEffect } from 'react';
import { FormData, FormErrors, Gender, SchoolLevel, SmkMajor } from '../../types';
import Input from '../Input';
import Select from '../Select';
import SearchableSelect from '../SearchableSelect';

interface Props {
    formData: FormData;
    errors: FormErrors;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    checkNikAvailability: (nik: string) => Promise<'available' | 'exists' | 'error'>;
}

// Interfaces for API Data
interface Region {
    id: string;
    name: string;
}

const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

const StudentDataSection: React.FC<Props> = ({ formData, errors, handleChange, handleBlur, checkNikAvailability }) => {
    
    // NIK Checking State
    const [nikStatus, setNikStatus] = useState<'idle' | 'loading' | 'available' | 'exists' | 'error'>('idle');
    const [nikMessage, setNikMessage] = useState('');

    // Determine if NISN should be hidden
    const isNisnHidden = [SchoolLevel.MI, SchoolLevel.MONDOK].includes(formData.schoolChoice);

    const handleCheckNik = async () => {
        if (!formData.nik || formData.nik.length !== 16) {
            setNikStatus('error');
            setNikMessage('Masukkan 16 digit NIK terlebih dahulu.');
            return;
        }

        setNikStatus('loading');
        try {
            const status = await checkNikAvailability(formData.nik);
            setNikStatus(status);
            if (status === 'available') setNikMessage('NIK Tersedia (Belum terdaftar).');
            else if (status === 'exists') setNikMessage('NIK ini sudah terdaftar sebelumnya!');
            else setNikMessage('Gagal mengecek. Lanjutkan pengisian.');
        } catch (e) {
            setNikStatus('error');
            setNikMessage('Gagal koneksi. Silahkan lanjut.');
        }
    };

    // Reset NIK status on change
    useEffect(() => {
        if (nikStatus !== 'idle') {
            setNikStatus('idle');
            setNikMessage('');
        }
    }, [formData.nik]);

    // --- SMART DATE LOGIC ---
    const [year, month, day] = useMemo(() => {
        if (!formData.birthDate) return ['', '', ''];
        const parts = formData.birthDate.split('-');
        return [parts[0] || '', parts[1] || '', parts[2] || ''];
    }, [formData.birthDate]);

    // Generate Dates Dynamically
    const daysInMonth = useMemo(() => {
        if (!year || !month) return 31;
        return new Date(parseInt(year), parseInt(month), 0).getDate();
    }, [year, month]);

    const dates = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));
    
    const months = [
        { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' }, { value: '03', label: 'Maret' },
        { value: '04', label: 'April' }, { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
        { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' }, { value: '09', label: 'September' },
        { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
    ];
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 20; 
    const endYear = currentYear - 5; // Adjusted to allow younger kids (MI)
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => String(startYear + i));

    const handleDatePartChange = (part: 'year' | 'month' | 'day', value: string) => {
        let newYear = year || '2015'; // Default year adapted
        let newMonth = month || '01';
        let newDay = day || '01';

        if (part === 'year') newYear = value;
        if (part === 'month') newMonth = value;
        if (part === 'day') newDay = value;

        // Auto-correct day if invalid for new month (e.g., 31 to 28)
        const maxDays = new Date(parseInt(newYear), parseInt(newMonth), 0).getDate();
        if (parseInt(newDay) > maxDays) {
            newDay = String(maxDays).padStart(2, '0');
        }

        const newDateString = `${newYear}-${newMonth}-${newDay}`;
        
        handleChange({
            target: {
                name: 'birthDate',
                value: newDateString,
                type: 'date'
            }
        } as any);
    };

    // --- REGION API LOGIC & FALLBACK ---
    const [provinces, setProvinces] = useState<Region[]>([]);
    const [cities, setCities] = useState<Region[]>([]);
    const [districts, setDistricts] = useState<Region[]>([]);
    const [villages, setVillages] = useState<Region[]>([]);
    
    const [apiError, setApiError] = useState(false); // New Fallback State

    const [loadingProv, setLoadingProv] = useState(false);
    const [loadingCity, setLoadingCity] = useState(false);
    const [loadingDist, setLoadingDist] = useState(false);
    const [loadingVill, setLoadingVill] = useState(false);

    useEffect(() => {
        const fetchProvinces = async () => {
            setLoadingProv(true);
            try {
                const response = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
                if (!response.ok) throw new Error("API Error");
                const data = await response.json();
                const formattedData = data.map((item: Region) => ({ ...item, name: toTitleCase(item.name) }));
                setProvinces(formattedData);
                setApiError(false);
            } catch (error) {
                console.warn("Region API Failed, switching to manual input.");
                setApiError(true);
            } finally {
                setLoadingProv(false);
            }
        };
        fetchProvinces();
    }, []);

    const updateField = (name: string, value: string) => {
        handleChange({
            target: { name, value, type: 'text' }
        } as any);
    };

    const handleProvinceChange = async (selectedName: string) => {
        updateField('province', selectedName);
        updateField('city', '');
        updateField('district', '');
        updateField('village', '');
        setCities([]);
        setDistricts([]);
        setVillages([]);

        const selectedProv = provinces.find(p => p.name === selectedName);
        if (selectedProv) {
            setLoadingCity(true);
            try {
                const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProv.id}.json`);
                if (!res.ok) throw new Error("API Error");
                const data = await res.json();
                const formattedData = data.map((item: Region) => ({ ...item, name: toTitleCase(item.name) }));
                setCities(formattedData);
            } catch(e) { setApiError(true); } finally { setLoadingCity(false); }
        }
    };

    const handleCityChange = async (selectedName: string) => {
        updateField('city', selectedName);
        updateField('district', '');
        updateField('village', '');
        setDistricts([]);
        setVillages([]);

        const selectedCity = cities.find(c => c.name === selectedName);
        if (selectedCity) {
            setLoadingDist(true);
            try {
                const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedCity.id}.json`);
                if (!res.ok) throw new Error("API Error");
                const data = await res.json();
                const formattedData = data.map((item: Region) => ({ ...item, name: toTitleCase(item.name) }));
                setDistricts(formattedData);
            } catch(e) { setApiError(true); } finally { setLoadingDist(false); }
        }
    };

    const handleDistrictChange = async (selectedName: string) => {
        updateField('district', selectedName);
        updateField('village', '');
        setVillages([]);

        const selectedDist = districts.find(d => d.name === selectedName);
        if (selectedDist) {
            setLoadingVill(true);
            try {
                const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedDist.id}.json`);
                if (!res.ok) throw new Error("API Error");
                const data = await res.json();
                const formattedData = data.map((item: Region) => ({ ...item, name: toTitleCase(item.name) }));
                setVillages(formattedData);
            } catch(e) { setApiError(true); } finally { setLoadingVill(false); }
        }
    };

    return (
        <div className="space-y-8 animate-fade-up">
            {/* Header */}
            <div className="flex items-start sm:items-center gap-4 border-b border-stone-200 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 shrink-0 shadow-sm border border-primary-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-stone-800 font-serif">A. Identitas Peserta Didik</h3>
                    <p className="text-sm text-stone-500 mt-1">Isi data pribadi calon santri sesuai dengan dokumen resmi (Ijazah/Akta).</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 sm:gap-y-8 sm:gap-x-8 sm:grid-cols-6">
                
                {/* School Choice Box */}
                <div className="sm:col-span-6">
                    <div className="bg-gradient-to-r from-primary-50 to-white p-6 rounded-2xl border border-primary-100 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <Select label="Daftar Untuk Jenjang" id="schoolChoice" name="schoolChoice" value={formData.schoolChoice} onChange={handleChange} onBlur={handleBlur} error={errors.schoolChoice} required>
                                    {Object.values(SchoolLevel).map(level => <option key={level} value={level}>{level}</option>)}
                                </Select>
                            </div>
                            {formData.schoolChoice === SchoolLevel.SMK && (
                                <div className="animate-fade-up">
                                     <Select label="Pilih Jurusan SMK" id="smkMajor" name="smkMajor" value={formData.smkMajor || ''} onChange={handleChange} onBlur={handleBlur} error={errors.smkMajor} required>
                                        <option value="" disabled>-- Pilih Jurusan --</option>
                                        <option value={SmkMajor.DKV}>{SmkMajor.DKV}</option>
                                        <option value={SmkMajor.TKR}>{SmkMajor.TKR}</option>
                                        <option value={SmkMajor.AKUNTANSI}>{SmkMajor.AKUNTANSI}</option>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="sm:col-span-6">
                    <Input label="Nama Lengkap" id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} error={errors.fullName} required autoComplete="name" placeholder="Masukkan nama sesuai Ijazah/Akta" />
                </div>
                
                 <div className="sm:col-span-3">
                    <Select label="Jenis Kelamin" id="gender" name="gender" value={formData.gender} onChange={handleChange} onBlur={handleBlur} error={errors.gender} required>
                        {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                    </Select>
                </div>

                <div className="sm:col-span-3">
                    <div className="relative">
                        <Input 
                            label="NIK (Nomor Induk Kependudukan)" 
                            id="nik" 
                            name="nik" 
                            type="text" 
                            pattern="\d{16}" 
                            maxLength={16} 
                            value={formData.nik} 
                            onChange={handleChange} 
                            onBlur={handleBlur} 
                            error={errors.nik} 
                            required 
                            inputMode="numeric" 
                            placeholder="16 digit angka sesuai KK/Akta" 
                        />
                        <div className="absolute top-[38px] right-2 hidden sm:block">
                            <button
                                type="button"
                                onClick={handleCheckNik}
                                disabled={nikStatus === 'loading'}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm ${nikStatus === 'loading' ? 'bg-stone-200 text-stone-500 cursor-wait' : 'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200'} ${nikStatus === 'exists' ? 'bg-red-100 text-red-700 border-red-200' : ''} ${nikStatus === 'available' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}`}
                            >
                                {nikStatus === 'loading' ? 'Mengecek...' : 'Cek Ketersediaan'}
                            </button>
                        </div>
                    </div>
                    {/* Mobile Button Check */}
                    <div className="mt-2 sm:hidden">
                         <button 
                            type="button" 
                            onClick={handleCheckNik} 
                            disabled={nikStatus === 'loading'} 
                            className={`w-full py-3 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${nikStatus === 'loading' ? 'bg-stone-100 text-stone-400' : 'bg-white border border-primary-200 text-primary-700 hover:bg-primary-50'}`}
                        >
                            {nikStatus === 'loading' ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-stone-300 border-t-primary-600 rounded-full animate-spin"></div>
                                    Sedang Mengecek...
                                </>
                            ) : 'Cek Ketersediaan NIK'}
                        </button>
                    </div>
                    {nikStatus !== 'idle' && (
                         <p className={`mt-2 ml-1 text-xs font-bold flex items-center gap-1 ${nikStatus === 'exists' ? 'text-red-600' : ''} ${nikStatus === 'available' ? 'text-emerald-600' : ''} ${nikStatus === 'error' ? 'text-amber-600' : ''}`}>
                            {nikMessage}
                         </p>
                    )}
                </div>

                {/* NISN FIELD - CONDITIONAL RENDER */}
                {!isNisnHidden && (
                    <div className="sm:col-span-3 animate-fade-up">
                        <Input 
                            label="NISN" 
                            id="nisn" 
                            name="nisn" 
                            type="text" 
                            pattern="\d{10}" 
                            maxLength={10} 
                            value={formData.nisn || ''} 
                            onChange={handleChange} 
                            onBlur={handleBlur} 
                            error={errors.nisn} 
                            required 
                            inputMode="numeric" 
                            placeholder="10 digit angka"
                            topRightLabel={
                                <a href="https://nisn.data.kemdikbud.go.id/index.php/Cindex/formcaribynama/" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1 transition-colors">
                                    Cek NISN Online
                                </a>
                            }
                        />
                    </div>
                )}
                
                {/* Adjust column span if NISN is hidden to maintain layout balance, or just let auto-flow */}
                <div className={`${isNisnHidden ? 'sm:col-span-6' : 'sm:col-span-3'}`}>
                    <Input label="Tempat Lahir" id="birthPlace" name="birthPlace" type="text" value={formData.birthPlace} onChange={handleChange} onBlur={handleBlur} error={errors.birthPlace} required placeholder="Contoh: Jakarta" />
                </div>
                
                <div className="sm:col-span-6">
                    <label className="block text-sm font-bold text-stone-600 mb-2 ml-1">
                        Tanggal Lahir <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        <div className="relative">
                            <select value={day || ''} onChange={(e) => handleDatePartChange('day', e.target.value)} className="block w-full px-2 sm:px-4 py-3.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-800 font-medium appearance-none outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 text-center"><option value="" disabled>Tgl</option>{dates.map(d => <option key={d} value={d}>{d}</option>)}</select>
                        </div>
                        <div className="relative">
                            <select value={month || ''} onChange={(e) => handleDatePartChange('month', e.target.value)} className="block w-full px-2 sm:px-4 py-3.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-800 font-medium appearance-none outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 text-center"><option value="" disabled>Bln</option>{months.map(m => <option key={m.value} value={m.value}>{m.label.substring(0, 3)}</option>)}</select>
                        </div>
                        <div className="relative">
                            <select value={year || ''} onChange={(e) => handleDatePartChange('year', e.target.value)} className="block w-full px-2 sm:px-4 py-3.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-800 font-medium appearance-none outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 text-center"><option value="" disabled>Thn</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                        </div>
                    </div>
                    {errors.birthDate && <p className="mt-2 text-xs font-semibold text-red-600 ml-1">{errors.birthDate}</p>}
                </div>

                <div className="sm:col-span-6">
                    <Input label="Asal Sekolah (TK/SD/MI/SMP/MTs/SMA)" id="previousSchool" name="previousSchool" type="text" value={formData.previousSchool} onChange={handleChange} onBlur={handleBlur} error={errors.previousSchool} required placeholder="Nama sekolah sebelumnya" />
                </div>

                 {/* --- SECTION B: ALAMAT --- */}
                <div className="sm:col-span-6 border-t border-stone-200 pt-6 mt-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-stone-800 font-serif">B. Alamat Tempat Tinggal</h3>
                        {apiError && (
                             <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Mode Manual</span>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-x-6 gap-y-4">
                        {/* Fallback to Manual Input if API Error */}
                        {!apiError ? (
                            <>
                                <div className="sm:col-span-3">
                                    <SearchableSelect label="Provinsi" id="province" value={formData.province} options={provinces} onChange={handleProvinceChange} loading={loadingProv} error={errors.province} required placeholder="Pilih Provinsi" />
                                </div>
                                <div className="sm:col-span-3">
                                    <SearchableSelect label="Kabupaten / Kota" id="city" value={formData.city} options={cities} onChange={handleCityChange} loading={loadingCity} disabled={!formData.province || cities.length === 0} error={errors.city} required placeholder={!formData.province ? "Pilih Provinsi Dulu" : "Pilih Kab/Kota"} />
                                </div>
                                <div className="sm:col-span-3">
                                    <SearchableSelect label="Kecamatan" id="district" value={formData.district} options={districts} onChange={handleDistrictChange} loading={loadingDist} disabled={!formData.city || districts.length === 0} error={errors.district} required placeholder={!formData.city ? "Pilih Kab/Kota Dulu" : "Pilih Kecamatan"} />
                                </div>
                                <div className="sm:col-span-3">
                                    <SearchableSelect label="Desa / Kelurahan" id="village" value={formData.village} options={villages} onChange={(val) => updateField('village', val)} loading={loadingVill} disabled={!formData.district || villages.length === 0} error={errors.village} required placeholder={!formData.district ? "Pilih Kecamatan Dulu" : "Pilih Desa/Kelurahan"} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="sm:col-span-3">
                                    <Input label="Provinsi" id="province" name="province" value={formData.province} onChange={handleChange} onBlur={handleBlur} error={errors.province} required />
                                </div>
                                <div className="sm:col-span-3">
                                    <Input label="Kabupaten / Kota" id="city" name="city" value={formData.city} onChange={handleChange} onBlur={handleBlur} error={errors.city} required />
                                </div>
                                <div className="sm:col-span-3">
                                    <Input label="Kecamatan" id="district" name="district" value={formData.district} onChange={handleChange} onBlur={handleBlur} error={errors.district} required />
                                </div>
                                <div className="sm:col-span-3">
                                    <Input label="Desa / Kelurahan" id="village" name="village" value={formData.village} onChange={handleChange} onBlur={handleBlur} error={errors.village} required />
                                </div>
                            </>
                        )}

                        <div className="sm:col-span-6">
                             <Input label="Jalan / Dusun / No. Rumah" id="specificAddress" name="specificAddress" type="text" value={formData.specificAddress} onChange={handleChange} onBlur={handleBlur} error={errors.specificAddress} required placeholder="Contoh: Jl. Merdeka No. 10" />
                        </div>
                        <div className="sm:col-span-2">
                             <Input label="RT" id="rt" name="rt" type="text" inputMode="numeric" value={formData.rt} onChange={handleChange} onBlur={handleBlur} error={errors.rt} required placeholder="001" />
                        </div>
                        <div className="sm:col-span-2">
                             <Input label="RW" id="rw" name="rw" type="text" inputMode="numeric" value={formData.rw} onChange={handleChange} onBlur={handleBlur} error={errors.rw} required placeholder="005" />
                        </div>
                        <div className="sm:col-span-2">
                             <Input label="Kode Pos" id="postalCode" name="postalCode" type="text" inputMode="numeric" maxLength={5} value={formData.postalCode} onChange={handleChange} onBlur={handleBlur} error={errors.postalCode} required placeholder="651xx" />
                        </div>
                    </div>
                </div>

                {/* --- SECTION C: KONTAK --- */}
                 <div className="sm:col-span-6 border-t border-stone-200 pt-6 mt-2">
                    <h3 className="text-lg font-bold text-stone-800 font-serif mb-4">C. Kontak</h3>
                    <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
                        <Input 
                            label="No. HP Utama (WhatsApp)" 
                            id="parentWaNumber" 
                            name="parentWaNumber" 
                            type="tel" 
                            value={formData.parentWaNumber} 
                            onChange={handleChange} 
                            onBlur={handleBlur} 
                            error={errors.parentWaNumber} 
                            placeholder="081234567890" 
                            required 
                            inputMode="tel" 
                        />
                        <p className="mt-2 text-[10px] text-primary-600 font-medium">*Nomor ini akan digunakan untuk informasi kelulusan & administrasi.</p>
                    </div>
                </div>

                {/* --- SECTION F: DATA PERIODIK --- */}
                <div className="sm:col-span-6 border-t border-stone-200 pt-6 mt-2">
                    <h3 className="text-lg font-bold text-stone-800 font-serif mb-4">F. Data Periodik</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Input label="Tinggi Badan (cm)" id="height" name="height" type="text" inputMode="numeric" value={formData.height} onChange={handleChange} onBlur={handleBlur} error={errors.height} required placeholder="150" />
                        <Input label="Berat Badan (kg)" id="weight" name="weight" type="text" inputMode="numeric" value={formData.weight} onChange={handleChange} onBlur={handleBlur} error={errors.weight} required placeholder="45" />
                        <Input label="Jml Saudara Kandung" id="siblingCount" name="siblingCount" type="text" inputMode="numeric" value={formData.siblingCount} onChange={handleChange} onBlur={handleBlur} error={errors.siblingCount} required placeholder="2" />
                        <Input label="Anak Ke-" id="childOrder" name="childOrder" type="text" inputMode="numeric" value={formData.childOrder} onChange={handleChange} onBlur={handleBlur} error={errors.childOrder} required placeholder="1" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDataSection;
