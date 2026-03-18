/**
 * Hierarchical accessory structure: Categoria → Tipo → Variação → Cor
 * Estojos have an extra level: Material
 */

export interface AccessoryVariation {
  nome: string;
  cores: string[];
}

export interface AccessoryType {
  nome: string;
  variacoes: AccessoryVariation[];
}

export interface AccessoryCategory {
  nome: string;
  tipos: AccessoryType[];
  /** Estojos have an extra "material" dimension */
  materiais?: string[];
}

const SEM_COR = ["Nenhuma"] as const;

export const ACESSORIOS_CATEGORIAS: AccessoryCategory[] = [
  {
    nome: "Testes",
    tipos: [
      {
        nome: "Polarizado",
        variacoes: [
          { nome: "Cartão", cores: [...SEM_COR] },
          { nome: "Grande", cores: [...SEM_COR] },
        ],
      },
    ],
  },
  {
    nome: "Lentes",
    tipos: [
      {
        nome: "Degradê",
        variacoes: [
          { nome: "Marrom", cores: [...SEM_COR] },
          { nome: "Preto", cores: [...SEM_COR] },
        ],
      },
      {
        nome: "Total",
        variacoes: [
          { nome: "Marrom", cores: [...SEM_COR] },
          { nome: "Preto", cores: [...SEM_COR] },
          { nome: "G15", cores: [...SEM_COR] },
        ],
      },
    ],
  },
  {
    nome: "Ferragens",
    tipos: [
      {
        nome: "Parafuso",
        variacoes: [
          { nome: "1.2 - 4.0", cores: ["Prata", "Dourado", "Preto", "Nenhuma"] },
          { nome: "1.4 - 3.0", cores: ["Prata", "Dourado", "Preto", "Nenhuma"] },
          { nome: "1.4 - 3.2", cores: ["Prata", "Dourado", "Preto", "Nenhuma"] },
          { nome: "1.4 - 3.6", cores: ["Prata", "Dourado", "Preto", "Nenhuma"] },
          { nome: "1.4 - 4.0", cores: ["Prata", "Dourado", "Preto", "Nenhuma"] },
          { nome: "1.4 - 5.0", cores: ["Prata", "Dourado", "Preto", "Nenhuma"] },
          { nome: "1.4 - 6.0", cores: ["Prata", "Dourado", "Preto", "Nenhuma"] },
          { nome: "1.6 - 3.6", cores: ["Prata", "Dourado", "Preto", "Nenhuma"] },
          { nome: "Mini", cores: ["Prata", "Dourado", "Preto", "Nenhuma"] },
        ],
      },
      {
        nome: "Arruela",
        variacoes: [
          { nome: "PVC", cores: ["Prata", "Dourado", "Preto", "Nenhuma"] },
          { nome: "Metal", cores: ["Prata", "Dourado", "Preto", "Nenhuma"] },
        ],
      },
      {
        nome: "Porca",
        variacoes: [
          { nome: "1.4", cores: ["Prata", "Dourado", "Preto", "Nenhuma"] },
        ],
      },
      {
        nome: "Capacete",
        variacoes: [
          { nome: "Metal", cores: ["Prata", "Dourado", "Preto", "Nenhuma"] },
          { nome: "PVC 1.2", cores: ["Prata", "Dourado", "Preto", "Nenhuma"] },
          { nome: "PVC 1.4", cores: ["Prata", "Dourado", "Preto", "Nenhuma"] },
        ],
      },
      {
        nome: "Parafuso Guia",
        variacoes: [
          { nome: "1.4", cores: ["Prata", "Dourado", "Preto", "Nenhuma"] },
        ],
      },
    ],
  },
  {
    nome: "Pontes",
    tipos: [
      {
        nome: "Parafuso",
        variacoes: [
          { nome: "Encaixe", cores: ["Prata", "Dourado", "Nenhuma"] },
          { nome: "1 furo", cores: ["Prata", "Dourado", "Nenhuma"] },
          { nome: "2 furos", cores: ["Prata", "Dourado", "Nenhuma"] },
        ],
      },
      {
        nome: "Bucha",
        variacoes: [
          { nome: "Encaixe", cores: ["Prata", "Dourado", "Nenhuma"] },
          { nome: "1 furo", cores: ["Prata", "Dourado", "Nenhuma"] },
          { nome: "2 furos", cores: ["Prata", "Dourado", "Nenhuma"] },
        ],
      },
      {
        nome: "Anatômica",
        variacoes: [
          { nome: "Encaixe", cores: ["Prata", "Dourado", "Nenhuma"] },
          { nome: "1 furo", cores: ["Prata", "Dourado", "Nenhuma"] },
          { nome: "2 furos", cores: ["Prata", "Dourado", "Nenhuma"] },
        ],
      },
    ],
  },
  {
    nome: "Plaquetas",
    tipos: [
      {
        nome: "Anatômica",
        variacoes: [{ nome: "Padrão", cores: ["Transparente", "Branco", "Preto", "Nenhuma"] }],
      },
      {
        nome: "Rayban",
        variacoes: [{ nome: "Padrão", cores: ["Transparente", "Branco", "Preto", "Nenhuma"] }],
      },
      {
        nome: "Silicone",
        variacoes: [{ nome: "Padrão", cores: ["Transparente", "Branco", "Preto", "Nenhuma"] }],
      },
      {
        nome: "PVC",
        variacoes: [{ nome: "Padrão", cores: ["Transparente", "Branco", "Preto", "Nenhuma"] }],
      },
      {
        nome: "Ar",
        variacoes: [{ nome: "Padrão", cores: ["Transparente", "Branco", "Preto", "Nenhuma"] }],
      },
    ],
  },
  {
    nome: "Limpeza",
    tipos: [
      {
        nome: "Flanela",
        variacoes: [
          { nome: "Poliéster", cores: ["Nenhuma"] },
          { nome: "Microfibra", cores: ["Nenhuma"] },
          { nome: "Mágica", cores: ["Nenhuma"] },
        ],
      },
      {
        nome: "Limpa Lentes",
        variacoes: [
          { nome: "PCT 10", cores: ["Nenhuma"] },
          { nome: "Unidade", cores: ["Nenhuma"] },
        ],
      },
      {
        nome: "Kit Limpeza",
        variacoes: [{ nome: "Padrão", cores: ["Nenhuma"] }],
      },
    ],
  },
  {
    nome: "Cordões",
    tipos: [
      {
        nome: "Silicone",
        variacoes: [
          { nome: "Dúzia", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] },
          { nome: "Unidade", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] },
        ],
      },
      {
        nome: "Tecido",
        variacoes: [
          { nome: "Dúzia", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] },
          { nome: "Unidade", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] },
        ],
      },
      {
        nome: "Infantil",
        variacoes: [
          { nome: "Dúzia", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] },
          { nome: "Unidade", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] },
        ],
      },
    ],
  },
  {
    nome: "Ferramentas",
    tipos: [
      {
        nome: "Chave",
        variacoes: [
          { nome: "Estrela", cores: ["Prata", "Dourado", "Preto"] },
          { nome: "Allen", cores: ["Prata", "Dourado", "Preto"] },
          { nome: "Fenda", cores: ["Prata", "Dourado", "Preto"] },
          { nome: "Torx", cores: ["Prata", "Dourado", "Preto"] },
          { nome: "Dourada Fenda", cores: ["Prata", "Dourado", "Preto"] },
          { nome: "Dourada Estrela", cores: ["Prata", "Dourado", "Preto"] },
        ],
      },
      {
        nome: "Kit Chave",
        variacoes: [
          { nome: "4 pontas", cores: ["Prata", "Dourado", "Preto"] },
          { nome: "10 pontas", cores: ["Prata", "Dourado", "Preto"] },
        ],
      },
    ],
  },
  {
    nome: "Utilidades",
    tipos: [
      { nome: "Chaveiro", variacoes: [{ nome: "Padrão", cores: ["Variável", "Nenhuma"] }] },
      { nome: "Broche", variacoes: [{ nome: "Padrão", cores: ["Variável", "Nenhuma"] }] },
      { nome: "Meia", variacoes: [{ nome: "Padrão", cores: ["Variável", "Nenhuma"] }] },
      { nome: "Cirex", variacoes: [{ nome: "Padrão", cores: ["Variável", "Nenhuma"] }] },
      { nome: "Escala", variacoes: [{ nome: "Padrão", cores: ["Variável", "Nenhuma"] }] },
      { nome: "Porta O.S.", variacoes: [{ nome: "Padrão", cores: ["Variável", "Nenhuma"] }] },
    ],
  },
  {
    nome: "Suportes",
    tipos: [
      {
        nome: "Lente de contato",
        variacoes: [{ nome: "Padrão", cores: ["Branco", "Transparente", "Nenhuma"] }],
      },
      {
        nome: "Orelha",
        variacoes: [{ nome: "Padrão", cores: ["Branco", "Transparente", "Nenhuma"] }],
      },
    ],
  },
  {
    nome: "Sacolas",
    tipos: [
      {
        nome: "Papel",
        variacoes: [
          { nome: "Unidade", cores: ["Branco", "Preto", "Personalizado"] },
        ],
      },
      {
        nome: "TNT",
        variacoes: [
          { nome: "PCT c/10", cores: ["Branco", "Preto", "Personalizado"] },
        ],
      },
    ],
  },
  {
    nome: "Estojos",
    materiais: ["EVA", "Malha", "Plástico", "Couro", "Sintético"],
    tipos: [
      {
        nome: "Liso",
        variacoes: [
          { nome: "Quadrado", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] },
          { nome: "Redondo", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] },
          { nome: "Botão", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] },
        ],
      },
      {
        nome: "Carteira",
        variacoes: [
          { nome: "EVA", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] },
          { nome: "Tipo Carteira", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] },
        ],
      },
      {
        nome: "Solar",
        variacoes: [
          { nome: "Zíper", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] },
        ],
      },
      {
        nome: "Receituário",
        variacoes: [
          { nome: "Zíper", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] },
        ],
      },
      {
        nome: "Infantil",
        variacoes: [
          { nome: "Sapato", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] },
          { nome: "Carro", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] },
        ],
      },
      {
        nome: "Caixa Imã",
        variacoes: [
          { nome: "Imã", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] },
        ],
      },
      {
        nome: "Texturizado",
        variacoes: [
          { nome: "Botão", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] },
        ],
      },
    ],
  },
  {
    nome: "Porta Óculos",
    tipos: [
      {
        nome: "Padrão",
        variacoes: [{ nome: "Padrão", cores: ["Variável"] }],
      },
    ],
  },
  {
    nome: "Expositores",
    tipos: [
      {
        nome: "Óculos",
        variacoes: [{ nome: "5 lugares", cores: ["Nenhuma"] }],
      },
    ],
  },
];

// Helper functions
export function getCategoriaByName(nome: string): AccessoryCategory | undefined {
  return ACESSORIOS_CATEGORIAS.find(c => c.nome === nome);
}

export function getTiposByCategoria(categoriaNome: string): AccessoryType[] {
  return getCategoriaByName(categoriaNome)?.tipos ?? [];
}

export function getVariacoesByTipo(categoriaNome: string, tipoNome: string): AccessoryVariation[] {
  const cat = getCategoriaByName(categoriaNome);
  return cat?.tipos.find(t => t.nome === tipoNome)?.variacoes ?? [];
}

export function getCoresByVariacao(categoriaNome: string, tipoNome: string, variacaoNome: string): string[] {
  const variacoes = getVariacoesByTipo(categoriaNome, tipoNome);
  return variacoes.find(v => v.nome === variacaoNome)?.cores ?? [];
}

export function getMateriaisByCategoria(categoriaNome: string): string[] {
  return getCategoriaByName(categoriaNome)?.materiais ?? [];
}

export function isEstojo(categoriaNome: string): boolean {
  return categoriaNome === "Estojos";
}

/** All category names */
export const TODAS_CATEGORIAS_ACESSORIO = ACESSORIOS_CATEGORIAS.map(c => c.nome);
