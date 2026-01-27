
import React from 'react';
import { FormData, FormErrors } from '../../types';

interface Props {
    formData: FormData;
    errors: FormErrors;
    onSelectionChange: (selected: string[]) => void;
}

const SURVEY_OPTIONS = [
    { id: 'keluarga', label: 'Keluarga/Teman', icon: '👨‍👩‍👧‍👦' },
    { id: 'sosmed', label: 'Sosial Media', icon: '📱' },
    { id: 'brosur', label: 'Media Promosi Cetak', icon: '📰' },
    { id: 'alumni', label: 'Alumni Bhumi Ngasor', icon: '🎓' },
];

const SurveySection: React.FC<Props> = ({ formData, errors, onSelectionChange }) => {
    
    const handleToggle = (label: string) => {
        const current = formData.infoSource || [];
        if (current.includes(label)) {
            onSelectionChange(current.filter(item => item !== label));
        } else {
            onSelectionChange([...current, label]);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">Selamat Datang Calon Santri! 👋</h3>
            <p className="text-slate-500 text-sm max-w-lg mx-auto leading-relaxed mb-6 sm:mb-10">
                Sebelum mengisi biodata, kami ingin tahu dari mana Anda mendapatkan informasi tentang Pondok Pesantren Bhumi Ngasor?
                <br />
                <span className="inline-block mt-3 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Boleh Pilih Lebih Dari Satu
                </span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {SURVEY_OPTIONS.map((option) => {
                    const isSelected = formData.infoSource?.includes(option.label);
                    return (
                        <div 
                            key={option.id}
                            onClick={() => handleToggle(option.label)}
                            className={`
                                relative p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between group
                                ${isSelected 
                                    ? 'border-emerald-500 bg-emerald-50/10 shadow-sm' 
                                    : 'border-slate-100 bg-white hover:border-emerald-200 hover:shadow-md'
                                }
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-2xl filter drop-shadow-sm">{option.icon}</div>
                                <span className={`text-sm font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>
                                    {option.label}
                                </span>
                            </div>

                            {/* Custom Radio Circle */}
                            <div className={`
                                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-200 group-hover:border-emerald-300'}
                            `}>
                                {isSelected && (
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {errors.infoSource && (
                <div className="mt-6 animate-pulse">
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-full">
                        ⚠️ Harap pilih minimal satu sumber informasi
                    </span>
                </div>
            )}
        </div>
    );
};

export default SurveySection;
