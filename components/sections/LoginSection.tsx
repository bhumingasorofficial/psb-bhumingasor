
import React from 'react';
import Input from '../Input';

interface Props {
    nik: string;
    token: string;
    wa: string; // New Prop
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    error?: string;
}

const LoginSection: React.FC<Props> = ({ nik, token, wa, onChange, onSubmit, loading, error }) => {
    return (
        <div className="animate-fade-up max-w-md mx-auto">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-stone-800">Masuk Aplikasi</h3>
                <p className="text-sm text-stone-500 mt-2">
                    Demi keamanan data, masukkan NIK, Token, dan Nomor WA yang terdaftar.
                </p>
            </div>

            <form onSubmit={onSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
                <Input 
                    label="NIK Santri" 
                    id="nik" 
                    name="nik" 
                    value={nik} 
                    onChange={onChange} 
                    placeholder="Masukkan 16 digit NIK" 
                    maxLength={16}
                    required 
                />
                
                <Input 
                    label="Token Akses" 
                    id="token" 
                    name="token" 
                    value={token} 
                    onChange={onChange} 
                    placeholder="6 digit kode" 
                    maxLength={6}
                    required 
                />

                <Input 
                    label="No. WA Terdaftar" 
                    id="wa" 
                    name="wa" 
                    value={wa} 
                    onChange={onChange} 
                    placeholder="Contoh: 08123456789"
                    type="tel"
                    required 
                    topRightLabel={<span className="text-[10px] text-stone-400">Verifikasi Keamanan</span>}
                />

                {error && (
                    <div className="bg-red-50 text-red-700 text-xs font-bold p-3 rounded-lg flex items-center gap-2 animate-pulse">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Memeriksa...' : 'Verifikasi & Masuk'}
                </button>
            </form>
        </div>
    );
};

export default LoginSection;
