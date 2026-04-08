interface BadgeProps {
    status: 'em-estoque' | 'esgotado' | string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
    'em-estoque': {
        label: 'Em Estoque',
        className: 'bg-lime/60 text-forest font-semibold',
    },
    'esgotado': {
        label: 'Esgotado',
        className: 'bg-red-50 text-red-600',
    },
};

export default function Badge({ status }: BadgeProps) {
    const config = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
            {config.label}
        </span>
    );
}
