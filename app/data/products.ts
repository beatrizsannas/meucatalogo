export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    status: 'ativo' | 'inativo' | 'em-estoque' | 'baixo-estoque' | 'esgotado';
    image: string;
    image_url?: string;
    description: string;
    whatsapp: string;
    tags: string[];
    wholesale_price?: number;
    wholesale_min_qty?: number;
    wholesale_label?: boolean;
    wholesale_label_price?: number;
}

export const products: Product[] = [
    {
        id: '1',
        name: 'Cadeira Ergonômica Office',
        price: 1200.0,
        category: 'Móveis',
        status: 'em-estoque',
        image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&q=80',
        description:
            'Conforto supremo para seu escritório com design moderno e regulagem completa de altura, apoio lombar e apoio de braços. Ideal para longas jornadas de trabalho com postura saudável.',
        whatsapp: '5511999999999',
        tags: ['Ergonômico', 'Escritório', 'Regulável'],
    },
    {
        id: '2',
        name: 'Mesa de Canto Industrial',
        price: 450.0,
        category: 'Móveis',
        status: 'baixo-estoque',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
        description:
            'Estilo industrial robusto com acabamento em madeira natural e estrutura em aço. Perfeita para complementar ambientes modernos com elegância e funcionalidade.',
        whatsapp: '5511999999999',
        tags: ['Industrial', 'Madeira', 'Design'],
    },
    {
        id: '3',
        name: 'Luminária Pendente',
        price: 180.0,
        category: 'Iluminação',
        status: 'em-estoque',
        image: 'https://images.unsplash.com/photo-1513506003901-1e6a35f5efea?w=600&q=80',
        description:
            'Iluminação suave e design minimalista para criar uma atmosfera aconchegante. Cúpula de metal com acabamento fosco disponível em diferentes cores.',
        whatsapp: '5511999999999',
        tags: ['Minimalista', 'Pendente', 'Metal'],
    },
    {
        id: '4',
        name: 'Tapete Geométrico',
        price: 320.0,
        category: 'Decoração',
        status: 'esgotado',
        image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80',
        description:
            'Padrões geométricos modernos em tons neutros, perfeito para salas e quartos. Confeccionado em algodão de alta qualidade com acabamento antiderrapante.',
        whatsapp: '5511999999999',
        tags: ['Geométrico', 'Algodão', 'Sala'],
    },
    {
        id: '5',
        name: 'Vaso Cerâmica',
        price: 89.9,
        category: 'Decoração',
        status: 'em-estoque',
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80',
        description:
            'Artesanal e único, ideal para plantas de interior ou como peça decorativa. Feito à mão por artesãos brasileiros com argila de alta qualidade.',
        whatsapp: '5511999999999',
        tags: ['Artesanal', 'Cerâmica', 'Plantar'],
    },
    {
        id: '6',
        name: 'Poltrona Velvet',
        price: 890.0,
        category: 'Móveis',
        status: 'ativo',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
        description:
            'Toque aveludado e design clássico reimaginado para o conforto contemporâneo. Estrutura em madeira maciça com pés dourados e espuma de alta densidade.',
        whatsapp: '5511999999999',
        tags: ['Veludo', 'Clássico', 'Sala'],
    },
    {
        id: '7',
        name: 'Abajur de Mesa',
        price: 210.0,
        category: 'Iluminação',
        status: 'ativo',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
        description:
            'Luz de leitura perfeita com braço articulado e base estável. Cúpula de tecido com difusor interno que distribui a luz uniformemente.',
        whatsapp: '5511999999999',
        tags: ['Leitura', 'Articulado', 'Tecido'],
    },
    {
        id: '8',
        name: 'Cachepot Grande',
        price: 150.0,
        category: 'Decoração',
        status: 'inativo',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
        description:
            'Ideal para grandes plantas ornamentais, feito em material resistente a intempéries. Design clean que combina com qualquer ambiente interno ou externo.',
        whatsapp: '5511999999999',
        tags: ['Plantas', 'Resistente', 'Externo'],
    },
];
