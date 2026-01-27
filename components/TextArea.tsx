
import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string | string[];
}

const TextArea: React.FC<TextAreaProps> = ({ label, id, error, ...props }) => {
    const errorMsg = Array.isArray(error) ? error[0] : error;
    
    // Consistent Stone Theme
    const baseStyle = "block w-full px-5 py-3.5 rounded-xl border border-stone-200 text-base transition-all duration-300 outline-none placeholder-stone-400 bg-stone-100 text-stone-800 font-medium resize-y min-h-[120px]";
    const errorStyle = "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-100";
    const normalStyle = "focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 hover:border-stone-300";

    return (
        <div className="w-full group">
            <label htmlFor={id} className="block text-sm font-bold text-stone-600 mb-2 transition-colors group-focus-within:text-primary-800 tracking-tight ml-1">
                {label} {props.required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <textarea
                    id={id}
                    rows={4}
                    {...props}
                    className={`${baseStyle} ${errorMsg ? errorStyle : normalStyle}`}
                    aria-invalid={!!errorMsg}
                    aria-describedby={errorMsg ? `${id}-error` : undefined}
                />
            </div>
            {errorMsg && <p className="mt-2 text-xs font-semibold text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1 ml-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span id={`${id}-error`}>{errorMsg}</span>
            </p>}
        </div>
    );
};

export default TextArea;
