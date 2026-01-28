
import React, { useState, useRef, useEffect, useMemo } from 'react';

interface Option {
    id: string;
    name: string;
}

interface SearchableSelectProps {
    label: string;
    id: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    onBlur?: (e: any) => void;
    disabled?: boolean;
    loading?: boolean;
    placeholder?: string;
    error?: string | string[];
    required?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    label,
    id,
    value,
    options,
    onChange,
    disabled,
    loading,
    placeholder = "Pilih opsi...",
    error,
    required
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const errorMsg = Array.isArray(error) ? error[0] : error;

    // Filter options based on search
    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter(opt => 
            opt.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm(''); // Reset search
    };

    // Styles matching standard Input/Select components
    const baseStyle = "w-full px-5 py-3.5 rounded-xl border text-base transition-all duration-300 outline-none font-medium flex justify-between items-center cursor-pointer relative";
    const normalStyle = disabled 
        ? "bg-stone-200 border-stone-200 text-stone-400 cursor-not-allowed" 
        : "bg-stone-100 border-stone-200 text-stone-800 hover:border-stone-300 focus-within:bg-white focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100";
    const errorStyle = "border-red-300 bg-red-50 text-red-900";

    return (
        <div className="w-full group relative" ref={wrapperRef}>
            <label htmlFor={id} className="block text-sm font-bold text-stone-600 mb-2 transition-colors ml-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            
            {/* Trigger Area (Looks like Select) */}
            <div 
                className={`${baseStyle} ${errorMsg ? errorStyle : normalStyle}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={`truncate ${!value ? 'text-stone-400' : ''}`}>
                    {loading ? "Memuat data..." : value || placeholder}
                </span>
                
                {/* Arrow Icon */}
                <svg 
                    className={`w-4 h-4 text-stone-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Dropdown Menu */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {/* Search Input */}
                    <div className="p-2 border-b border-stone-100 bg-stone-50">
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                            placeholder="Cari..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Options List */}
                    <ul className="max-h-60 overflow-y-auto scroll-smooth">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <li 
                                    key={opt.id}
                                    onClick={() => handleSelect(opt.name)}
                                    className={`px-5 py-3 text-sm cursor-pointer hover:bg-primary-50 hover:text-primary-700 transition-colors ${value === opt.name ? 'bg-primary-50 text-primary-700 font-bold' : 'text-stone-700'}`}
                                >
                                    {opt.name}
                                </li>
                            ))
                        ) : (
                            <li className="px-5 py-4 text-sm text-stone-400 text-center italic">
                                Tidak ditemukan
                            </li>
                        )}
                    </ul>
                </div>
            )}

            {errorMsg && <p className="mt-2 text-xs font-semibold text-red-600 ml-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{errorMsg}</span>
            </p>}
        </div>
    );
};

export default SearchableSelect;
