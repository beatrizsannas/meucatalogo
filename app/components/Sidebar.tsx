'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    Settings,
    LogOut,
    BookOpen,
    Leaf,
    ReceiptText,
    Users,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const navItems = [
    { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { href: '/produtos', label: 'Meus Produtos', icon: ShoppingBag },
    { href: '/pedidos', label: 'Pedidos', icon: BookOpen },
    { href: '/clientes', label: 'Clientes', icon: Users },
    { href: '/pdv', label: 'PDV', icon: ReceiptText },
    { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <aside className="flex flex-col w-60 h-screen sticky top-0 bg-forest text-white flex-shrink-0">
            {/* Brand */}
            <div className="flex items-center gap-3 px-6 py-7 border-b border-white/10">
                <div className="w-9 h-9 rounded-xl bg-lime flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-forest font-bold text-xl" style={{ fontFamily: "Georgia, serif" }}>V</span>
                </div>
                <div>
                    <p className="font-bold text-sm leading-tight">Minha Vitrine</p>
                    <p className="text-white/50 text-xs">Gerenciador</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-lime text-forest shadow-sm'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-4 py-6 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                    <LogOut size={18} />
                    Sair
                </button>
            </div>
        </aside>
    );
}
