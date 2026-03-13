import { ReactNode } from 'react';

interface StatCardProps {
    icon: ReactNode;
    label: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
}

export default function StatCard({ icon, label, value, trend, trendUp }: StatCardProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-card border border-mint-dark flex-1">
            <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-lime/30 flex items-center justify-center">
                    {icon}
                </div>
                {trend && (
                    <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                            }`}
                    >
                        {trendUp ? '↑' : '↓'} {trend}
                    </span>
                )}
            </div>
            <p className="text-sm text-forest/60 font-medium mb-1">{label}</p>
            <p className="text-3xl font-bold text-forest">{value}</p>
        </div>
    );
}
