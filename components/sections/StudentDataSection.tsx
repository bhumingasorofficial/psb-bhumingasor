
import React, { useMemo, useState, useEffect } from 'react';
import { FormData, FormErrors, Gender, SchoolLevel } from '../../types';
import Input from '../Input';
import Select from '../Select';
import SearchableSelect from '../SearchableSelect';

interface Props {
    formData: FormData;
    errors: FormErrors;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    checkNikAvailability: (nik: string) => Promise<'available' | 'exists' | 'error'>; // NEW PROP
}

// Interfaces for API Data
interface Region {
    id: string;
    name: string;
}

// Helper: Convert Uppercase "JAWA TIMUR" to Title Case "Jawa Timur"
const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

const StudentDataSection: React.FC<Props> = ({ formData, errors, handleChange, handleBlur, checkNikAvailability }) => {
    
    // NIK Checking State
    const [nikStatus, setNikStatus] = useState<'idle' | 'loading' | 'available' | 'exists' | 'error'>('idle');
    const [nikMessage, setNikMessage] = useState('');

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

    // --- DROPDOWN DATE HELPERS ---
    const [year, month, day] = useMemo(() => {
        if (!formData.birthDate) return ['', '', ''];
        return formData.birthDate.split('-');
    }, [formData.birthDate]);

    const dates = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
    const months = [
        { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' }, { value: '03', label: 'Maret' },
        { value: '04', label: 'April' }, { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
        { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' }, { value: '09', label: 'September' },
        { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
    ];
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 20; 
    const endYear = currentYear - 8;
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => String(startYear + i));

    const handleDatePartChange = (part: 'year' | 'month' | 'day', value: string) => {
        let newYear = year || '2012';
        let newMonth = month || '01';
        let newDay = day || '01';

        if (part === 'year') newYear = value;
        if (part === 'month') newMonth = value;
        if (part === 'day') newDay = value;

        const newDateString = `${newYear}-${newMonth}-${newDay}`;
        
        handleChange({
            target: {
                name: 'birthDate',
                value: newDateString,
                type: 'date'
            }
        } as any);
    };

    // --- REGION API LOGIC ---
    const [provinces, setProvinces] = useState<Region[]>([]);
    const [cities, setCities] = useState<Region[]>([]);
    const [districts, setDistricts] = useState<Region[]>([]);
    const [villages, setVillages] = useState<Region[]>([]);

    const [loadingProv, setLoadingProv] = useState(false);
    const [loadingCity, setLoadingCity] = useState(false);
    const [loadingDist, setLoadingDist] = useState(false);
    const [loadingVill, setLoadingVill] = useState(false);

    // Initial Fetch Provinces
    useEffect(() => {
        const fetchProvinces = async () => {
            setLoadingProv(true);
            try {
                const response = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
                const data = await response.json();
                const formattedData = data.map((item: Region) => ({ ...item, name: toTitleCase(item.name) }));
                setProvinces(formattedData);
            } catch (error) {
                console.error("Gagal mengambil data provinsi", error);
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
                const data = await res.json();
                const formattedData = data.map((item: Region) => ({ ...item, name: toTitleCase(item.name) }));
                setCities(formattedData);
            } finally { setLoadingCity(false); }
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
                const data = await res.json();
                const formattedData = data.map((item: Region) => ({ ...item, name: toTitleCase(item.name) }));
                setDistricts(formattedData);
            } finally { setLoadingDist(false); }
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
                const data = await res.json();
                const formattedData = data.map((item: Region) => ({ ...item, name: toTitleCase(item.name) }));
                setVillages(formattedData);
            } finally { setLoadingVill(false); }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Section Header */}
            <div className="flex items-start sm:items-center gap-4 border-b border-stone-200 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 shrink-0 shadow-sm border border-primary-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-stone-800 font-serif">Biodata Santri</h3>
                    <p className="text-sm text-stone-500 mt-1">Isi data pribadi calon santri sesuai dengan dokumen resmi (Ijazah/Akta).</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 sm:gap-y-8 sm:gap-x-8 sm:grid-cols-6">
                
                <div className="sm:col-span-6">
                    <div className="bg-gradient-to-r from-primary-50 to-white p-6 rounded-2xl border border-primary-100 shadow-sm">
                        <Select label="Daftar Untuk Jenjang" id="schoolChoice" name="schoolChoice" value={formData.schoolChoice} onChange={handleChange} onBlur={handleBlur} error={errors.schoolChoice} required>
                            {Object.values(SchoolLevel).map(level => <option key={level} value={level}>{level}</option>)}
                        </Select>
                        <div className="mt-3 flex gap-2 items-start">
                            <svg className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-xs text-primary-700 font-medium leading-relaxed">
                                Mohon pastikan pilihan jenjang pendidikan (SMP/SMK) sudah benar.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="sm:col-span-6">
                    <Input label="Nama Lengkap" id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} error={errors.fullName} required autoComplete="name" placeholder="Masukkan nama sesuai Ijazah/Akta" />
                </div>

                <div className="sm:col-span-6">
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
                        {/* Check Button - DESKTOP ONLY (Absolute Position) */}
                        <div className="absolute top-[38px] right-2 hidden sm:block">
                            <button
                                type="button"
                                onClick={handleCheckNik}
                                disabled={nikStatus === 'loading'}
                                className={`
                                    text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm
                                    ${nikStatus === 'loading' ? 'bg-stone-200 text-stone-500 cursor-wait' : 'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200'}
                                    ${nikStatus === 'exists' ? 'bg-red-100 text-red-700 border-red-200' : ''}
                                    ${nikStatus === 'available' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}
                                `}
                            >
                                {nikStatus === 'loading' ? 'Mengecek...' : 'Cek Ketersediaan'}
                            </button>
                        </div>
                    </div>

                    {/* Check Button - MOBILE ONLY (Below Input) */}
                    <div className="mt-2 sm:hidden text-right">
                         <button
                            type="button"
                            onClick={handleCheckNik}
                            disabled={nikStatus === 'loading'}
                            className={`
                                w-full text-xs font-bold px-4 py-3 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2
                                ${nikStatus === 'loading' ? 'bg-stone-200 text-stone-500 cursor-wait' : 'bg-white border border-primary-200 text-primary-700 hover:bg-primary-50 active:scale-95'}
                                ${nikStatus === 'exists' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                ${nikStatus === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                            `}
                        >
                            {nikStatus === 'loading' && <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
                            {nikStatus === 'loading' ? 'Sedang Mengecek...' : 'Cek Ketersediaan NIK'}
                        </button>
                    </div>

                    {/* Status Message */}
                    {nikStatus !== 'idle' && (
                         <p className={`mt-2 ml-1 text-xs font-bold flex items-center gap-1
                            ${nikStatus === 'exists' ? 'text-red-600' : ''}
                            ${nikStatus === 'available' ? 'text-emerald-600' : ''}
                            ${nikStatus === 'error' ? 'text-amber-600' : ''}
                         `}>
                            {nikStatus === 'exists' && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                            {nikStatus === 'available' && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                            {nikMessage}
                         </p>
                    )}
                </div>
                
                <div className="sm:col-span-3">
                    <Input label="Tempat Lahir" id="birthPlace" name="birthPlace" type="text" value={formData.birthPlace} onChange={handleChange} onBlur={handleBlur} error={errors.birthPlace} required placeholder="Contoh: Jakarta" />
                </div>
                
                <div className="sm:col-span-3">
                    <label className="block text-sm font-bold text-stone-600 mb-2 ml-1">
                        Tanggal Lahir <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="relative">
                            <select value={day} onChange={(e) => handleDatePartChange('day', e.target.value)} className="block w-full px-3 py-3.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-800 font-medium appearance-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none">
                                <option value="" disabled>Tgl</option>
                                {dates.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="relative">
                            <select value={month} onChange={(e) => handleDatePartChange('month', e.target.value)} className="block w-full px-3 py-3.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-800 font-medium appearance-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none">
                                <option value="" disabled>Bln</option>
                                {months.map(m => <option key={m.value} value={m.value}>{m.label.substring(0, 3)}</option>)}
                            </select>
                        </div>
                        <div className="relative">
                            <select value={year} onChange={(e) => handleDatePartChange('year', e.target.value)} className="block w-full px-3 py-3.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-800 font-medium appearance-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none">
                                <option value="" disabled>Thn</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                    {errors.birthDate && <p className="mt-2 text-xs font-semibold text-red-600 ml-1">{errors.birthDate}</p>}
                </div>

                <div className="sm:col-span-3">
                    <Select label="Jenis Kelamin" id="gender" name="gender" value={formData.gender} onChange={handleChange} onBlur={handleBlur} error={errors.gender} required>
                        {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                    </Select>
                </div>

                <div className="sm:col-span-3">
                    <Input 
                        label="NISN" 
                        id="nisn" 
                        name="nisn" 
                        type="text" 
                        pattern="\d{10}" 
                        maxLength={10} 
                        value={formData.nisn} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        error={errors.nisn} 
                        required 
                        inputMode="numeric" 
                        placeholder="10 digit angka"
                        topRightLabel={
                            <a href="https://nisn.data.kemdikbud.go.id/index.php/Cindex/formcaribynama/" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1 transition-colors">
                                Cek NISN Online
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                        }
                    />
                </div>

                <div className="sm:col-span-6">
                    <Input label="Asal Sekolah (SD/MI/SMP/MTs)" id="previousSchool" name="previousSchool" type="text" value={formData.previousSchool} onChange={handleChange} onBlur={handleBlur} error={errors.previousSchool} required placeholder="Nama sekolah sebelumnya" />
                </div>
                
                <div className="sm:col-span-6 border-t border-stone-200 pt-6 mt-2">
                    <h4 className="text-sm font-bold text-stone-700 mb-4">Alamat Tempat Tinggal (Sesuai KK)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-x-6 gap-y-4">
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
                        <div className="sm:col-span-6">
                             <Input label="Detail Jalan / Dusun" id="specificAddress" name="specificAddress" type="text" value={formData.specificAddress} onChange={handleChange} onBlur={handleBlur} error={errors.specificAddress} required placeholder="Jl. Mawar No. 12 / Dusun A" />
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
            </div>
        </div>
    );
};

export default StudentDataSection;
