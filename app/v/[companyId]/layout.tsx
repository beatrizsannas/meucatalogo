import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

type Props = {
    params: Promise<{ companyId: string }>;
    children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { companyId } = await params;

    const supabase = await createClient();
    const { data: profile } = await supabase
        .from('profiles')
        .select('store_name, description, logo_url')
        .eq('slug', companyId)
        .single();

    const storeName = profile?.store_name ?? 'Catálogo';
    const description =
        profile?.description ||
        `Confira os produtos de ${storeName} e faça seu pedido online com facilidade.`;
    const logo = profile?.logo_url ?? null;
    const url = `https://vitrinedaslojas.com.br/v/${companyId}`;

    return {
        title: `${storeName} — Catálogo Varejo`,
        description,
        openGraph: {
            title: `${storeName} — Catálogo Varejo`,
            description,
            url,
            siteName: 'A vitrine do seu negócio',
            type: 'website',
            ...(logo ? { images: [{ url: logo, width: 800, height: 800, alt: storeName }] } : {}),
        },
        twitter: {
            card: logo ? 'summary_large_image' : 'summary',
            title: `${storeName} — Catálogo Varejo`,
            description,
            ...(logo ? { images: [logo] } : {}),
        },
        metadataBase: new URL('https://vitrinedaslojas.com.br'),
    };
}

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
