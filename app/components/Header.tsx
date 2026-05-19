'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] px-4 sm:px-6 py-4 flex flex-col justify-center bg-white/70 backdrop-blur-md border-b border-white/20 transition-all duration-300">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between relative">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-forest flex items-center justify-center shadow-sm group-hover:bg-forest/90 transition-colors">
                        <span className="text-lime font-black text-lg sm:text-xl uppercase tracking-tighter">V</span>
                    </div>
                    <span className="font-bold text-forest text-base sm:text-lg tracking-tight hidden sm:block">
                        Minha Vitrine
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-4">
                    <Link href="/" className="px-4 py-2 text-forest/70 font-semibold text-sm hover:text-forest transition-colors">
                        Início
                    </Link>
                    <Link href="/parceiros" className="px-4 py-2 text-forest/70 font-semibold text-sm hover:text-forest transition-colors">
                        Nossos Parceiros
                    </Link>
                    <Link href="/login" className="px-4 py-2 text-forest font-semibold text-sm hover:text-forest/70 transition-colors">
                        Entrar
                    </Link>
                    <Link href="/cadastro" className="px-5 py-2.5 bg-forest text-white rounded-full font-semibold text-sm shadow-md shadow-forest/20 hover:bg-forest/90 hover:-translate-y-0.5 transition-all">
                        Criar Vitrine Grátis
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <div className="flex items-center gap-2 sm:gap-3 lg:hidden">
                    <Link href="/cadastro" className="px-4 py-2 bg-forest text-white rounded-full font-semibold text-xs sm:text-sm shadow-md shadow-forest/20 whitespace-nowrap">
                        Criar Vitrine
                    </Link>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-forest bg-mint/50 rounded-lg hover:bg-mint transition-colors">
                        {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Content */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-[100%] left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-mint-dark/50 shadow-2xl py-6 px-6 flex flex-col gap-6 animate-in slide-in-from-top-2">
                    <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-forest font-bold text-xl flex items-center justify-between border-b border-mint/50 pb-4">
                        Início
                    </Link>
                    <Link href="/parceiros" onClick={() => setIsMenuOpen(false)} className="text-forest font-bold text-xl flex items-center justify-between border-b border-mint/50 pb-4">
                        Nossos Parceiros
                    </Link>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-forest font-bold text-xl flex items-center justify-between pb-2">
                        Entrar na minha conta
                    </Link>
                </div>
            )}
        </header>
    );
}
