export interface Product {
  id: string;
  code: string;
  model: string;
  color: string;
  material: string;
  lensSize: number;
  bridgeSize: number;
  templeSize: number;
  category: string;
  description: string;
  retailPrice: number;
  wholesalePrice: number;
  wholesaleMinQty: number;
  stock: number;
  minStock: number;
  status: "active" | "inactive";
  imageUrl: string;
}

export interface Client {
  id: string;
  responsibleName: string;
  storeName: string;
  cnpj: string;
  city: string;
  state: string;
  phone: string;
  whatsapp: string;
  email: string;
  creditLimit: number;
  status: "active" | "inactive";
}

export interface Sale {
  id: string;
  number: number;
  clientId: string;
  clientName: string;
  sellerId: string;
  sellerName: string;
  items: SaleItem[];
  total: number;
  discount: number;
  paymentMethod: string;
  date: string;
  origin: "stock" | "bag";
}

export interface SaleItem {
  productId: string;
  productCode: string;
  productModel: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export const mockProducts: Product[] = [
  {
    id: "1", code: "VF-001", model: "Aurora", color: "Preto Fosco", material: "Acetato",
    lensSize: 54, bridgeSize: 18, templeSize: 145, category: "Solar",
    description: "Armação solar estilo aviador", retailPrice: 48, wholesalePrice: 38,
    wholesaleMinQty: 5, stock: 25, minStock: 5, status: "active",
    imageUrl: "",
  },
  {
    id: "2", code: "VF-002", model: "Eclipse", color: "Tartaruga", material: "Acetato",
    lensSize: 52, bridgeSize: 20, templeSize: 140, category: "Grau",
    description: "Armação de grau clássica", retailPrice: 48, wholesalePrice: 38,
    wholesaleMinQty: 5, stock: 18, minStock: 5, status: "active",
    imageUrl: "",
  },
  {
    id: "3", code: "VF-003", model: "Zenith", color: "Dourado", material: "Metal",
    lensSize: 56, bridgeSize: 16, templeSize: 150, category: "Solar",
    description: "Armação metálica premium", retailPrice: 48, wholesalePrice: 38,
    wholesaleMinQty: 5, stock: 3, minStock: 5, status: "active",
    imageUrl: "",
  },
  {
    id: "4", code: "VF-004", model: "Horizon", color: "Azul Cristal", material: "TR90",
    lensSize: 50, bridgeSize: 19, templeSize: 142, category: "Grau",
    description: "Armação leve e flexível", retailPrice: 48, wholesalePrice: 38,
    wholesaleMinQty: 5, stock: 42, minStock: 5, status: "active",
    imageUrl: "",
  },
  {
    id: "5", code: "VF-005", model: "Nebula", color: "Rosa Transparente", material: "Acetato",
    lensSize: 48, bridgeSize: 17, templeSize: 138, category: "Solar",
    description: "Armação feminina delicada", retailPrice: 48, wholesalePrice: 38,
    wholesaleMinQty: 5, stock: 0, minStock: 5, status: "active",
    imageUrl: "",
  },
  {
    id: "6", code: "VF-006", model: "Vortex", color: "Grafite", material: "Metal",
    lensSize: 55, bridgeSize: 18, templeSize: 145, category: "Grau",
    description: "Armação masculina elegante", retailPrice: 48, wholesalePrice: 38,
    wholesaleMinQty: 5, stock: 15, minStock: 5, status: "active",
    imageUrl: "",
  },
  {
    id: "7", code: "VF-007", model: "Pulse", color: "Vermelho", material: "TR90",
    lensSize: 53, bridgeSize: 20, templeSize: 140, category: "Solar",
    description: "Armação esportiva", retailPrice: 48, wholesalePrice: 38,
    wholesaleMinQty: 5, stock: 8, minStock: 5, status: "active",
    imageUrl: "",
  },
  {
    id: "8", code: "VF-008", model: "Stellar", color: "Havana", material: "Acetato",
    lensSize: 51, bridgeSize: 19, templeSize: 143, category: "Grau",
    description: "Armação vintage premium", retailPrice: 48, wholesalePrice: 38,
    wholesaleMinQty: 5, stock: 22, minStock: 5, status: "inactive",
    imageUrl: "",
  },
];

export const mockClients: Client[] = [
  {
    id: "1", responsibleName: "Carlos Silva", storeName: "Ótica Visual Center",
    cnpj: "12.345.678/0001-90", city: "São Paulo", state: "SP",
    phone: "(11) 3456-7890", whatsapp: "(11) 98765-4321",
    email: "carlos@visualcenter.com.br", creditLimit: 5000, status: "active",
  },
  {
    id: "2", responsibleName: "Maria Santos", storeName: "Ótica Olhar Digital",
    cnpj: "98.765.432/0001-10", city: "Campinas", state: "SP",
    phone: "(19) 3456-7890", whatsapp: "(19) 98765-4321",
    email: "maria@olhardigital.com.br", creditLimit: 8000, status: "active",
  },
  {
    id: "3", responsibleName: "João Oliveira", storeName: "Ótica Nova Visão",
    cnpj: "11.222.333/0001-44", city: "Ribeirão Preto", state: "SP",
    phone: "(16) 3456-7890", whatsapp: "(16) 98765-4321",
    email: "joao@novavisao.com.br", creditLimit: 3000, status: "active",
  },
];

export const mockSales: Sale[] = [
  {
    id: "1", number: 1001, clientId: "1", clientName: "Ótica Visual Center",
    sellerId: "1", sellerName: "Pedro Vendas",
    items: [
      { productId: "1", productCode: "VF-001", productModel: "Aurora", quantity: 3, unitPrice: 48, total: 144 },
      { productId: "2", productCode: "VF-002", productModel: "Eclipse", quantity: 2, unitPrice: 48, total: 96 },
    ],
    total: 190, discount: 50, paymentMethod: "Pix", date: "2026-03-15", origin: "stock",
  },
  {
    id: "2", number: 1002, clientId: "2", clientName: "Ótica Olhar Digital",
    sellerId: "1", sellerName: "Pedro Vendas",
    items: [
      { productId: "4", productCode: "VF-004", productModel: "Horizon", quantity: 6, unitPrice: 38, total: 228 },
    ],
    total: 228, discount: 0, paymentMethod: "Cartão", date: "2026-03-15", origin: "bag",
  },
];
