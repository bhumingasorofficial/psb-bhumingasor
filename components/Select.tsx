
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string | string[];
    children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, id, error, children, ...props }) => {
    const errorMsg = Array.isArray(error) ? error[0] : error;

    // Matching Input styling
    const baseStyle = "block w-full px-5 py-3.5 rounded-xl border border-stone-200 text-base transition-all duration-300 outline-none bg-stone-100 text-stone-800 font-medium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2378716c%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_1.5rem_center] bg-no-repeat cursor-pointer";
    const normalStyle = "focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 hover:border-stone-300";
    const errorStyle = "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-100";

    return (
        <div className="w-full group">
            <label htmlFor={id} className="block text-sm font-bold text-stone-600 mb-2 transition-colors group-focus-within:text-primary-700 ml-1">
                {label} {props.required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select id={id} {...props} className={`${baseStyle} ${errorMsg ? errorStyle : normalStyle}`}>
                    {children}
                </select>
            </div>
            {errorMsg && <p className="mt-2 text-xs font-semibold text-red-600 ml-1 flex items-center gap-1 animate-pulse">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{errorMsg}</span>
            </p>}
        </div>
    );
};

export default Select;
