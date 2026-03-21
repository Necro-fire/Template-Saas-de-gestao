// Fixed options for product registration form fields

export const CATEGORIAS_IDADE = ["Adulto", "Infantil"] as const;

export const GENEROS = ["Masculino", "Feminino", "Unissex"] as const;

export const ESTILOS = [
  "Gatinho", "Quadrado", "Aviador", "Redondo", "Retrô",
  "Esportivo", "Fio de Nylon", "Parafusada (Parafuso)", "Parafusada (Bucha)",
] as const;

export const CORES_SOLIDAS = [
  "Branco", "Cinza", "Preto", "Transparente", "Verde", "Vermelho",
  "Azul", "Marrom", "Rosa", "Bege", "Roxo", "Vinho", "Tartaruga", "Oncinha",
] as const;

export const CORES_DEGRADE = [
  "Degradê Preto", "Degradê Marrom", "Degradê Rosa",
  "Degradê Amarelo", "Degradê Cinza", "Degradê Verde", "Degradê Azul",
] as const;

export const TODAS_CORES = [...CORES_SOLIDAS, ...CORES_DEGRADE] as const;

export const MATERIAIS_ARO = [
  "TR90", "Acetato", "Nylon", "Titanium", "Alumínio", "Metal", "Silicone",
] as const;

export const MATERIAIS_HASTE = [
  "TR90", "Acetato", "Nylon", "Titanium", "Alumínio", "Metal", "Silicone", "Gliter",
] as const;

// Legacy alias
export const MATERIAIS = MATERIAIS_ARO;

export const TIPOS_LENTE = [
  "Receituário",
  "Preto Total",
  "Preto Degradê",
  "Marrom Total",
  "Marrom Degradê",
  "Night Drive (Amarela)",
  "Rosa",
  "Azul",
  "Espelhado Laranja",
  "Espelhado Amarelo",
  "Espelhado Azul",
  "Espelhado Prata",
  "G15 (Verde)",
  "G15 (Verde Degradê)",
  "Colorido",
] as const;

export const MEDIDAS_LENTE = { min: 40, max: 64 } as const;
export const MEDIDAS_ALTURA_LENTE = { min: 15, max: 60 } as const;
export const MEDIDAS_PONTE = { min: 12, max: 25 } as const;
export const MEDIDAS_HASTE = { min: 130, max: 148 } as const;

export const SUBCATEGORIAS_ACESSORIOS: Record<string, string[]> = {
  "Teste de Lente": [
    "Teste Polarizado Cartão", "Teste Polarizado Grande",
  ],
  "Parafusos e Fixação": [
    "Ponte de Parafuso", "Ponte de Bucha", "Arruela PVC", "Arruela Metal",
    "Porca 1.4", "Capacete Metal", "Capacete PVC 1.4", "Capacete PVC 1.2",
  ],
  "Plaquetas": [
    "Plaqueta Anatômica", "Plaqueta Rayban", "Plaqueta de Silicone",
    "Plaqueta de PVC", "Plaqueta de Ar",
  ],
  "Pontes": [
    "Ponte Anatômica Encaixe", "Ponte Anatômica 1 Furo", "Ponte Anatômica 2 Furo",
  ],
  "Parafusos": [
    "Parafuso 1.2 - 4.0", "Parafuso 1.4 - 3.0", "Parafuso 1.4 - 3.2",
    "Parafuso 1.4 - 3.6", "Parafuso 1.4 - 4.0", "Parafuso 1.4 - 5.0",
    "Parafuso 1.4 - 6.0", "Parafuso 1.6 - 3.6", "Parafuso Mini", "Parafuso Guia 1.4",
  ],
  "Limpeza": [
    "Kit Limpeza", "Flanela Microfibra", "Flanela Poliéster", "Flanela Mágica",
    "PCT 10 Flanela Poliéster", "Limpa Lentes PCT 10", "Limpa Lentes Unidade",
  ],
  "Cordões": [
    "Cordão Silicone Dúzia", "Cordão Tecido Dúzia", "Cordão Silicone Unidade", "Cordão Infantil",
  ],
  "Ferramentas": [
    "Chave Ponta Estrela", "Chave Ponta Allen", "Chave Ponta Fenda", "Chave Ponta Torx",
    "Chave Dourada Fenda", "Chave Dourada Estrela", "Kit Chave 4 Pontas", "Kit Chave 10 Pontas",
  ],
  "Outros Acessórios": [
    "Chaveiro", "Broche Óculos", "Meia", "Cirex", "Suporte Lente de Contato",
    "Suporte de Orelha", "Escala", "Porta O.S.",
  ],
  "Estojos": [
    "Estojo Liso Quadrado", "Estojo Liso Redondo", "Estojo Carteira EVA",
    "Estojo Receituário Zíper", "Estojo Solar Zíper", "Estojo Infantil Sapato",
    "Estojo Infantil Carro", "Estojo Texturizado Botão", "Estojo Liso Botão",
    "Estojo Tipo Caixa Imã", "Estojo Tipo Carteira",
  ],
  "Bolsas e Sacolas": [
    "Sacola de Papel", "Sacola TNT PCT c/10",
  ],
  "Outros": [
    "Porta Óculos", "Expositor 5 Lugares",
  ],
};

export const TODAS_SUBCATEGORIAS_ACESSORIOS = Object.values(SUBCATEGORIAS_ACESSORIOS).flat();
