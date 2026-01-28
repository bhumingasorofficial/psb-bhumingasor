
import React, { useMemo, useState, useEffect } from 'react';
import { FormData, FormErrors, Gender, SchoolLevel } from '../../types';
import Input from '../Input';
import Select from '../Select';

interface Props {
    formData: FormData;
    errors: FormErrors;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

// Interfaces for API Data
interface Region {
    id: string;
    name: string;
}

const StudentDataSection: React.FC<Props> = ({ formData, errors, handleChange, handleBlur }) => {
    
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
                setProvinces(data);
            } catch (error) {
                console.error("Gagal mengambil data provinsi", error);
            } finally {
                setLoadingProv(false);
            }
        };
        fetchProvinces();
    }, []);

    // Helper to manually trigger change in parent Form
    const updateField = (name: string, value: string) => {
        handleChange({
            target: { name, value, type: 'text' }
        } as any);
    };

    // HANDLE PROVINCE CHANGE
    const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedName = e.target.value;
        updateField('province', selectedName);
        
        // Reset Child Fields
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
                setCities(data);
            } finally { setLoadingCity(false); }
        }
    };

    // HANDLE CITY CHANGE
    const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedName = e.target.value;
        updateField('city', selectedName);

        // Reset Child Fields
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
                setDistricts(data);
            } finally { setLoadingDist(false); }
        }
    };

    // HANDLE DISTRICT CHANGE
    const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedName = e.target.value;
        updateField('district', selectedName);

        // Reset Child Fields
        updateField('village', '');
        setVillages([]);

        const selectedDist = districts.find(d => d.name === selectedName);
        if (selectedDist) {
            setLoadingVill(true);
            try {
                const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedDist.id}.json`);
                const data = await res.json();
                setVillages(data);
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
                
                {/* Pilihan Jenjang - Highlighted */}
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
                </div>
                
                <div className="sm:col-span-3">
                    <Input label="Tempat Lahir" id="birthPlace" name="birthPlace" type="text" value={formData.birthPlace} onChange={handleChange} onBlur={handleBlur} error={errors.birthPlace} required placeholder="Contoh: Jakarta" />
                </div>
                
                {/* IMPROVED DATE INPUT (Split into 3 Selects) */}
                <div className="sm:col-span-3">
                    <label className="block text-sm font-bold text-stone-600 mb-2 ml-1">
                        Tanggal Lahir <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="relative">
                            <select 
                                value={day} 
                                onChange={(e) => handleDatePartChange('day', e.target.value)}
                                className="block w-full px-3 py-3.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-800 font-medium appearance-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                            >
                                <option value="" disabled>Tgl</option>
                                {dates.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="relative">
                            <select 
                                value={month} 
                                onChange={(e) => handleDatePartChange('month', e.target.value)}
                                className="block w-full px-3 py-3.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-800 font-medium appearance-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                            >
                                <option value="" disabled>Bln</option>
                                {months.map(m => <option key={m.value} value={m.value}>{m.label.substring(0, 3)}</option>)}
                            </select>
                        </div>
                        <div className="relative">
                            <select 
                                value={year} 
                                onChange={(e) => handleDatePartChange('year', e.target.value)}
                                className="block w-full px-3 py-3.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-800 font-medium appearance-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                            >
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
                            <a 
                                href="https://nisn.data.kemdikbud.go.id/index.php/Cindex/formcaribynama/" 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[10px] font-bold text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1 transition-colors"
                            >
                                Cek NISN Online
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                        }
                    />
                </div>

                <div className="sm:col-span-6">
                    <Input label="Asal Sekolah (SD/MI/SMP/MTs)" id="previousSchool" name="previousSchool" type="text" value={formData.previousSchool} onChange={handleChange} onBlur={handleBlur} error={errors.previousSchool} required placeholder="Nama sekolah sebelumnya" />
                </div>
                
                {/* ALAMAT API WILAYAH */}
                <div className="sm:col-span-6 border-t border-stone-200 pt-6 mt-2">
                    <h4 className="text-sm font-bold text-stone-700 mb-4">Alamat Tempat Tinggal (Sesuai KK)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-x-6 gap-y-4">
                        
                        <div className="sm:col-span-3">
                            <Select 
                                label="Provinsi" 
                                id="province" 
                                name="province" 
                                value={formData.province} 
                                onChange={handleProvinceChange}
                                onBlur={handleBlur}
                                error={errors.province} 
                                required
                            >
                                <option value="">Pilih Provinsi</option>
                                {loadingProv && <option disabled>Memuat Data...</option>}
                                {provinces.map(p => (
                                    <option key={p.id} value={p.name}>{p.name}</option>
                                ))}
                            </Select>
                        </div>
                        
                        <div className="sm:col-span-3">
                            <Select 
                                label="Kabupaten / Kota" 
                                id="city" 
                                name="city" 
                                value={formData.city} 
                                onChange={handleCityChange}
                                onBlur={handleBlur}
                                error={errors.city} 
                                required
                                disabled={!formData.province || cities.length === 0}
                            >
                                <option value="">Pilih Kab/Kota</option>
                                {loadingCity && <option disabled>Memuat Data...</option>}
                                {!formData.province && <option disabled>Pilih Provinsi Terlebih Dahulu</option>}
                                {cities.map(c => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                            </Select>
                        </div>
                        
                        <div className="sm:col-span-3">
                             <Select 
                                label="Kecamatan" 
                                id="district" 
                                name="district" 
                                value={formData.district} 
                                onChange={handleDistrictChange}
                                onBlur={handleBlur}
                                error={errors.district} 
                                required
                                disabled={!formData.city || districts.length === 0}
                            >
                                <option value="">Pilih Kecamatan</option>
                                {loadingDist && <option disabled>Memuat Data...</option>}
                                {!formData.city && <option disabled>Pilih Kab/Kota Terlebih Dahulu</option>}
                                {districts.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </Select>
                        </div>
                        
                        <div className="sm:col-span-3">
                             <Select 
                                label="Desa / Kelurahan" 
                                id="village" 
                                name="village" 
                                value={formData.village} 
                                onChange={(e) => updateField('village', e.target.value)}
                                onBlur={handleBlur}
                                error={errors.village} 
                                required
                                disabled={!formData.district || villages.length === 0}
                            >
                                <option value="">Pilih Desa/Kelurahan</option>
                                {loadingVill && <option disabled>Memuat Data...</option>}
                                {!formData.district && <option disabled>Pilih Kecamatan Terlebih Dahulu</option>}
                                {villages.map(v => (
                                    <option key={v.id} value={v.name}>{v.name}</option>
                                ))}
                            </Select>
                        </div>

                        {/* Detail Jalan */}
                        <div className="sm:col-span-6">
                             <Input label="Detail Jalan / Dusun" id="specificAddress" name="specificAddress" type="text" value={formData.specificAddress} onChange={handleChange} onBlur={handleBlur} error={errors.specificAddress} required placeholder="Jl. Mawar No. 12 / Dusun A" />
                        </div>

                        {/* RT RW Kode Pos */}
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
