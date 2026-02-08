
import React from 'react';
import { FormData, FormErrors, ParentEducation, ParentIncome, ParentOccupation } from '../../types';
import Input from '../Input';
import Select from '../Select';

interface Props {
    formData: FormData;
    errors: FormErrors;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const ParentDataSection: React.FC<Props> = ({ formData, errors, handleChange, handleBlur }) => {
    return (
        <div className="space-y-8 animate-fade-up">
             <div className="flex items-center gap-4 border-b border-stone-200 pb-4">
                <div className="w-10 h-10 rounded bg-indigo-100 flex items-center justify-center text-indigo-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-stone-800 font-serif">E. Data Orang Tua / Wali</h3>
                    <p className="text-sm text-stone-500">Lengkapi data orang tua kandung atau wali murid.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
                
                {/* AYAH */}
                <div className="sm:col-span-6 bg-stone-50 p-4 rounded-xl border border-stone-200">
                    <h4 className="text-lg font-bold text-stone-700 mb-4 border-b border-stone-200 pb-2">Data Ayah Kandung</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Nama Lengkap Ayah" id="fatherName" name="fatherName" type="text" value={formData.fatherName} onChange={handleChange} onBlur={handleBlur} error={errors.fatherName} required />
                        <Select label="Pendidikan Terakhir" id="fatherEducation" name="fatherEducation" value={formData.fatherEducation} onChange={handleChange} onBlur={handleBlur} error={errors.fatherEducation} required>
                            {Object.values(ParentEducation).map(e => <option key={e} value={e}>{e}</option>)}
                        </Select>
                        <Select label="Pekerjaan Utama" id="fatherOccupation" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} onBlur={handleBlur} error={errors.fatherOccupation} required>
                            {Object.values(ParentOccupation).map(job => <option key={job} value={job}>{job}</option>)}
                        </Select>
                         <Select label="Penghasilan Bulanan" id="fatherIncome" name="fatherIncome" value={formData.fatherIncome} onChange={handleChange} onBlur={handleBlur} error={errors.fatherIncome} required>
                            {Object.values(ParentIncome).map(inc => <option key={inc} value={inc}>{inc}</option>)}
                        </Select>
                        {formData.fatherOccupation === ParentOccupation.LAINNYA && (
                            <div className="sm:col-span-2">
                                <Input label="Detail Pekerjaan Ayah" id="fatherOccupationOther" name="fatherOccupationOther" type="text" value={formData.fatherOccupationOther} onChange={handleChange} onBlur={handleBlur} error={errors.fatherOccupationOther} required placeholder="Sebutkan spesifik pekerjaan ayah" />
                            </div>
                        )}
                    </div>
                </div>

                {/* IBU */}
                <div className="sm:col-span-6 bg-stone-50 p-4 rounded-xl border border-stone-200">
                    <h4 className="text-lg font-bold text-stone-700 mb-4 border-b border-stone-200 pb-2">Data Ibu Kandung</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Nama Lengkap Ibu" id="motherName" name="motherName" type="text" value={formData.motherName} onChange={handleChange} onBlur={handleBlur} error={errors.motherName} required />
                        <Select label="Pendidikan Terakhir" id="motherEducation" name="motherEducation" value={formData.motherEducation} onChange={handleChange} onBlur={handleBlur} error={errors.motherEducation} required>
                             {Object.values(ParentEducation).map(e => <option key={e} value={e}>{e}</option>)}
                        </Select>
                        <Select label="Pekerjaan Utama" id="motherOccupation" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} onBlur={handleBlur} error={errors.motherOccupation} required>
                            {Object.values(ParentOccupation).map(job => <option key={job} value={job}>{job}</option>)}
                        </Select>
                         <Select label="Penghasilan Bulanan" id="motherIncome" name="motherIncome" value={formData.motherIncome} onChange={handleChange} onBlur={handleBlur} error={errors.motherIncome} required>
                             {Object.values(ParentIncome).map(inc => <option key={inc} value={inc}>{inc}</option>)}
                        </Select>
                        {formData.motherOccupation === ParentOccupation.LAINNYA && (
                            <div className="sm:col-span-2">
                                <Input label="Detail Pekerjaan Ibu" id="motherOccupationOther" name="motherOccupationOther" type="text" value={formData.motherOccupationOther} onChange={handleChange} onBlur={handleBlur} error={errors.motherOccupationOther} required placeholder="Sebutkan spesifik pekerjaan ibu" />
                            </div>
                        )}
                    </div>
                </div>

                {/* WALI (TOGGLE) */}
                 <div className="sm:col-span-6">
                    <div className="flex items-center gap-3 mb-4">
                        <input 
                            type="checkbox" 
                            id="hasGuardian" 
                            name="hasGuardian" 
                            checked={formData.hasGuardian} 
                            onChange={(e) => handleChange(e as any)}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                        />
                        <label htmlFor="hasGuardian" className="text-sm font-bold text-stone-700 select-none cursor-pointer">
                            Isi Data Wali? (Jika siswa tinggal bersama Wali)
                        </label>
                    </div>

                    {formData.hasGuardian && (
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 animate-fade-up">
                            <h4 className="text-lg font-bold text-indigo-800 mb-4 border-b border-indigo-200 pb-2">Data Wali Murid</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="Nama Lengkap Wali" id="guardianName" name="guardianName" type="text" value={formData.guardianName} onChange={handleChange} onBlur={handleBlur} error={errors.guardianName} required />
                                <Select label="Pendidikan Wali" id="guardianEducation" name="guardianEducation" value={formData.guardianEducation} onChange={handleChange} onBlur={handleBlur} error={errors.guardianEducation} required>
                                    <option value="" disabled>Pilih Pendidikan</option>
                                    {Object.values(ParentEducation).map(e => <option key={e} value={e}>{e}</option>)}
                                </Select>
                                <Select label="Pekerjaan Wali" id="guardianOccupation" name="guardianOccupation" value={formData.guardianOccupation} onChange={handleChange} onBlur={handleBlur} error={errors.guardianOccupation} required>
                                    <option value="" disabled>Pilih Pekerjaan</option>
                                    {Object.values(ParentOccupation).map(job => <option key={job} value={job}>{job}</option>)}
                                </Select>
                                <Select label="Penghasilan Wali" id="guardianIncome" name="guardianIncome" value={formData.guardianIncome} onChange={handleChange} onBlur={handleBlur} error={errors.guardianIncome} required>
                                    <option value="" disabled>Pilih Penghasilan</option>
                                    {Object.values(ParentIncome).map(inc => <option key={inc} value={inc}>{inc}</option>)}
                                </Select>
                                {formData.guardianOccupation === ParentOccupation.LAINNYA && (
                                    <div className="sm:col-span-2">
                                        <Input label="Detail Pekerjaan Wali" id="guardianOccupationOther" name="guardianOccupationOther" type="text" value={formData.guardianOccupationOther} onChange={handleChange} onBlur={handleBlur} error={errors.guardianOccupationOther} required />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ParentDataSection;
