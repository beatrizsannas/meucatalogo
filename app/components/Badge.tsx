interface BadgeProps {
    status: 'ativo' | 'inativo' | 'em-estoque' | 'baixo-estoque' | 'esgotado';
}

const statusConfig: Record<
    BadgeProps['status'],
    { label: string; className: string }
> = {
    'ativo': {
        label: 'Ativo',
        className: 'bg-green-100 text-green-800',
    },
    'inativo': {
        label: 'Inativo',
        className: 'bg-gray-100 text-gray-600',
    },
    'em-estoque': {
        label: 'Em Estoque',
        className: 'bg-lime/60 text-forest font-semibold',
    },
    'baixo-estoque': {
        label: 'Baixo Estoque',
        className: 'bg-yellow-100 text-yellow-800',
    },
    'esgotado': {
        label: 'Esgotado',
        className: 'bg-red-50 text-red-600',
    },
};

export default function Badge({ status }: BadgeProps) {
    const { label, className } = statusConfig[status];
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${className}`}>
            {label}
        </span>
    );
}
