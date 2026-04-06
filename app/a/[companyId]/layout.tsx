'use client';

import { WholesaleCartProvider } from '@/app/context/WholesaleCartContext';
import WholesaleCartDrawer from '@/app/components/WholesaleCartDrawer';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';

export default function WholesaleLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const companyId = params?.companyId as string | undefined;
    const [profile, setProfile] = useState<{ id: string, whatsapp: string } | null>(null);

    useEffect(() => {
        if (companyId) {
            const supabase = createClient();
            supabase.from('profiles').select('id, whatsapp').eq('slug', companyId).maybeSingle().then(({ data }) => {
                if (data) setProfile(data as any);
            });
        }
    }, [companyId]);

    return (
        <WholesaleCartProvider>
            {children}
            <WholesaleCartDrawer profileId={profile?.id} whatsapp={profile?.whatsapp} />
        </WholesaleCartProvider>
    );
}
