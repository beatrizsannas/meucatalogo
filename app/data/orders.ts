export interface OrderItem {
    id: string;
    productName: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string; // e.g. PED-A3F9
    date: string; // ISO or formatted date
    customerName: string;
    customerPhone: string;
    items: OrderItem[];
    total: number;
    status: 'pendente' | 'confirmado' | 'em-preparacao' | 'enviado' | 'cancelado';
}

export const orders: Order[] = [
    {
        id: 'PED-A3F9',
        date: '2023-10-25T14:30:00Z',
        customerName: 'João Silva',
        customerPhone: '11999999999',
        items: [
            { id: '1', productName: 'Cadeira Ergonômica Office', quantity: 1, price: 1200 },
            { id: '2', productName: 'Luminária Pendente', quantity: 2, price: 180 }
        ],
        total: 1560,
        status: 'pendente'
    },
    {
        id: 'PED-B9K2',
        date: '2023-10-24T10:15:00Z',
        customerName: 'Maria Oliveira',
        customerPhone: '11988888888',
        items: [
            { id: '3', productName: 'Mesa de Canto Industrial', quantity: 1, price: 450 }
        ],
        total: 450,
        status: 'confirmado'
    },
    {
        id: 'PED-C1L5',
        date: '2023-10-23T16:45:00Z',
        customerName: 'Carlos Souza',
        customerPhone: '11977777777',
        items: [
            { id: '4', productName: 'Tapete Geométrico', quantity: 1, price: 320 },
            { id: '5', productName: 'Vaso Cerâmica', quantity: 3, price: 89.9 }
        ],
        total: 589.7,
        status: 'enviado'
    },
    {
        id: 'PED-D8M1',
        date: '2023-10-22T09:00:00Z',
        customerName: 'Ana Clara',
        customerPhone: '11966666666',
        items: [
            { id: '6', productName: 'Quadro Decorativo', quantity: 2, price: 150 }
        ],
        total: 300,
        status: 'cancelado'
    },
    {
        id: 'PED-E2N4',
        date: '2023-10-21T11:20:00Z',
        customerName: 'Pedro Santos',
        customerPhone: '11955555555',
        items: [
            { id: '1', productName: 'Cadeira Ergonômica Office', quantity: 2, price: 1200 }
        ],
        total: 2400,
        status: 'em-preparacao'
    }
];
