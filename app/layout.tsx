import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
    title: 'A vitrine do seu negócio',
    description: 'Gerencie e compartilhe seu catálogo de produtos com facilidade.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body className="font-jakarta bg-mint text-forest antialiased">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
