
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string | string[];
}

const Input: React.FC<InputProps> = ({ label, id, error, ...props }) => {
    const errorMsg = Array.isArray(error) ? error[0] : error;
    
    // Updated Styles for "Comfort":
    // 1. bg-stone-100: Warm gray, comfortable for eyes but distinct from white container.
    // 2. border-stone-200: Subtle border initially.
    // 3. focus:ring-4 focus:ring-primary-100: Big soft ring on focus for accessibility/clarity.
    // 4. rounded-xl: Softer corners.
    // 5. px-5 py-3.5: Enough clickable area.

    const baseStyle = "block w-full px-5 py-3.5 rounded-xl border border-stone-200 text-base transition-all duration-300 outline-none placeholder-stone-400 bg-stone-100 text-stone-800 font-medium";
    const normalStyle = "focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 hover:border-stone-300";
    const errorStyle = "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-100";

    return (
        <div className="w-full group">
            <label htmlFor={id} className="block text-sm font-bold text-stone-600 mb-2 transition-colors group-focus-within:text-primary-700 ml-1">
                {label} {props.required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    id={id}
                    {...props}
                    className={`${baseStyle} ${errorMsg ? errorStyle : normalStyle}`}
                    aria-invalid={!!errorMsg}
                />
            </div>
            {errorMsg && <p className="mt-2 text-xs font-semibold text-red-600 ml-1 flex items-center gap-1 animate-pulse">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{errorMsg}</span>
            </p>}
        </div>
    );
};

export default Input;
