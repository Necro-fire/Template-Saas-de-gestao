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
  filialId: string;
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
  filialId: string;
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
  filialId: string;
}

export interface SaleItem {
  productId: string;
  productCode: string;
  productModel: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: "active" | "inactive";
  filialId: string;
}

export interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  regimeTributario: string;
  cnae: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  serieNF: string;
  ambiente: "producao" | "homologacao";
  codigoMunicipio: string;
  codigoIBGE: string;
}

export interface NotaFiscal {
  id: string;
  numero: number;
  chave: string;
  saleId: string;
  clientName: string;
  clientCnpj: string;
  dataEmissao: string;
  valorTotal: number;
  status: "autorizada" | "cancelada" | "pendente" | "rejeitada";
  xmlUrl?: string;
  danfeUrl?: string;
}

export const mockProducts: Product[] = [
  {
    id: "1", code: "VF-001", model: "Aurora", color: "Preto Fosco", material: "Acetato",
    lensSize: 54, bridgeSize: 18, templeSize: 145, category: "Solar",
    description: "Armação solar estilo aviador", retailPrice: 48, wholesalePrice: 38,
    wholesaleMinQty: 5, stock: 25, minStock: 5, status: "active", imageUrl: "", filialId: "1",
  },
  {
    id: "2", code: "VF-002", model: "Eclipse", color: "Tartaruga", material: "Acetato",
    lensSize: 52, bridgeSize: 20, templeSize: 140, category: "Grau",
    description: "Armação de grau clássica", retailPrice: 48, wholesalePrice: 38,
    wholesaleMinQty: 5, stock: 18, minStock: 5, status: "active", imageUrl: "", filialId: "1",
  },
  {
    id: "3", code: "VF-003", model: "Zenith", color: "Dourado", material: "Metal",
    lensSize: 56, bridgeSize: 16, templeSize: 150, category: "Solar",
    description: "Armação metálica premium", retailPrice: 48, wholesalePrice: 38,
    wholesaleMinQty: 5, stock: 3, minStock: 5, status: "active", imageUrl: "", filialId: "2",
  },
  {
    id: "4", code: "VF-004", model: "Horizon", color: "Azul Cristal", material: "TR90",
    lensSize: 50, bridgeSize: 19, templeSize: 142, category: "Grau",
    description: "Armação leve e flexível", retailPrice: 48, wholesalePrice: 38,
    wholesaleMinQty: 5, stock: 42, minStock: 5, status: "active", imageUrl: "", filialId: "2",
  },
  {
    id: "5", code: "VF-005", model: "Nebula", color: "Rosa Transparente", material: "Acetato",
    lensSize: 48, bridgeSize: 17, templeSize: 138, category: "Solar",
    description: "Armação feminina delicada", retailPrice: 48, wholesalePrice: 38,
    wholesaleMinQty: 5, stock: 0, minStock: 5, status: "active", imageUrl: "", filialId: "3",
  },
  {
    id: "6", code: "VF-006", model: "Vortex", color: "Grafite", material: "Metal",
    lensSize: 55, bridgeSize: 18, templeSize: 145, category: "Grau",
    description: "Armação masculina elegante", retailPrice: 48, wholesalePrice: 38,
    wholesaleMinQty: 5, stock: 15, minStock: 5, status: "active", imageUrl: "", filialId: "3",
  },
  {
    id: "7", code: "VF-007", model: "Pulse", color: "Vermelho", material: "TR90",
    lensSize: 53, bridgeSize: 20, templeSize: 140, category: "Solar",
    description: "Armação esportiva", retailPrice: 48, wholesalePrice: 38,
    wholesaleMinQty: 5, stock: 8, minStock: 5, status: "active", imageUrl: "", filialId: "1",
  },
  {
    id: "8", code: "VF-008", model: "Stellar", color: "Havana", material: "Acetato",
    lensSize: 51, bridgeSize: 19, templeSize: 143, category: "Grau",
    description: "Armação vintage premium", retailPrice: 48, wholesalePrice: 38,
    wholesaleMinQty: 5, stock: 22, minStock: 5, status: "inactive", imageUrl: "", filialId: "2",
  },
];

export const mockClients: Client[] = [
  {
    id: "1", responsibleName: "Carlos Silva", storeName: "Ótica Visual Center",
    cnpj: "12.345.678/0001-90", city: "São Paulo", state: "SP",
    phone: "(11) 3456-7890", whatsapp: "(11) 98765-4321",
    email: "carlos@visualcenter.com.br", creditLimit: 5000, status: "active", filialId: "1",
  },
  {
    id: "2", responsibleName: "Maria Santos", storeName: "Ótica Olhar Digital",
    cnpj: "98.765.432/0001-10", city: "Campinas", state: "SP",
    phone: "(19) 3456-7890", whatsapp: "(19) 98765-4321",
    email: "maria@olhardigital.com.br", creditLimit: 8000, status: "active", filialId: "2",
  },
  {
    id: "3", responsibleName: "João Oliveira", storeName: "Ótica Nova Visão",
    cnpj: "11.222.333/0001-44", city: "Ribeirão Preto", state: "SP",
    phone: "(16) 3456-7890", whatsapp: "(16) 98765-4321",
    email: "joao@novavisao.com.br", creditLimit: 3000, status: "active", filialId: "3",
  },
];

export const mockEmployees: Employee[] = [
  { id: "1", name: "Pedro Vendas", role: "Vendedor", phone: "(11) 91234-5678", email: "pedro@visionflow.com.br", status: "active", filialId: "1" },
  { id: "2", name: "Ana Representante", role: "Representante", phone: "(11) 92345-6789", email: "ana@visionflow.com.br", status: "active", filialId: "2" },
  { id: "3", name: "Lucas Gerente", role: "Gerente", phone: "(11) 93456-7890", email: "lucas@visionflow.com.br", status: "active", filialId: "1" },
  { id: "4", name: "Juliana Caixa", role: "Caixa", phone: "(19) 94567-8901", email: "juliana@visionflow.com.br", status: "active", filialId: "3" },
  { id: "5", name: "Roberto Estoque", role: "Estoquista", phone: "(16) 95678-9012", email: "roberto@visionflow.com.br", status: "inactive", filialId: "2" },
];

export const mockSales: Sale[] = [
  {
    id: "1", number: 1001, clientId: "1", clientName: "Ótica Visual Center",
    sellerId: "1", sellerName: "Pedro Vendas",
    items: [
      { productId: "1", productCode: "VF-001", productModel: "Aurora", quantity: 3, unitPrice: 48, total: 144 },
      { productId: "2", productCode: "VF-002", productModel: "Eclipse", quantity: 2, unitPrice: 48, total: 96 },
    ],
    total: 190, discount: 50, paymentMethod: "Pix", date: "2026-03-15", origin: "stock", filialId: "1",
  },
  {
    id: "2", number: 1002, clientId: "2", clientName: "Ótica Olhar Digital",
    sellerId: "2", sellerName: "Ana Representante",
    items: [
      { productId: "4", productCode: "VF-004", productModel: "Horizon", quantity: 6, unitPrice: 38, total: 228 },
    ],
    total: 228, discount: 0, paymentMethod: "Cartão", date: "2026-03-15", origin: "bag", filialId: "2",
  },
  {
    id: "3", number: 1003, clientId: "3", clientName: "Ótica Nova Visão",
    sellerId: "4", sellerName: "Juliana Caixa",
    items: [
      { productId: "6", productCode: "VF-006", productModel: "Vortex", quantity: 4, unitPrice: 48, total: 192 },
    ],
    total: 192, discount: 0, paymentMethod: "Dinheiro", date: "2026-03-16", origin: "stock", filialId: "3",
  },
];

export const mockEmpresa: Empresa = {
  id: "1",
  razaoSocial: "VisionFlow Óptica LTDA",
  nomeFantasia: "VisionFlow",
  cnpj: "12.345.678/0001-90",
  inscricaoEstadual: "123.456.789.000",
  regimeTributario: "Simples Nacional",
  cnae: "4774-1/00",
  endereco: "Rua das Lentes, 123",
  cidade: "São Paulo",
  estado: "SP",
  cep: "01234-567",
  telefone: "(11) 3456-7890",
  email: "fiscal@visionflow.com.br",
  serieNF: "1",
  ambiente: "homologacao",
  codigoMunicipio: "3550308",
  codigoIBGE: "3550308",
};

export const mockNotasFiscais: NotaFiscal[] = [
  {
    id: "1", numero: 1, chave: "35260312345678000190550010000000011234567890",
    saleId: "1", clientName: "Ótica Visual Center", clientCnpj: "12.345.678/0001-90",
    dataEmissao: "2026-03-15", valorTotal: 190, status: "autorizada",
  },
  {
    id: "2", numero: 2, chave: "35260398765432000110550010000000021234567891",
    saleId: "2", clientName: "Ótica Olhar Digital", clientCnpj: "98.765.432/0001-10",
    dataEmissao: "2026-03-15", valorTotal: 228, status: "pendente",
  },
];
