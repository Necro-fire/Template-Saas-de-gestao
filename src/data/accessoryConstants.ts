/**
 * Hierarchical accessory structure: Grupo → Subtipo → Variação → Cor
 * Some groups have Material and/or Tipos de Venda dimensions.
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
  /** Extra "material" dimension (e.g. Estojos, Suporte p/ Grau) */
  materiais?: string[];
  /** Allowed sale types for this group */
  tiposVenda: string[];
}

const SEM_COR = ["Nenhuma"] as const;

// Helper: generate numeric variations like 1.1, 1.2, …, 2.3
function genNumericVariations(from: number, to: number, step = 0.1): AccessoryVariation[] {
  const result: AccessoryVariation[] = [];
  for (let v = from; v <= to + 0.001; v += step) {
    result.push({ nome: v.toFixed(1), cores: [...SEM_COR] });
  }
  return result;
}

// Cores para travas
const CORES_TRAVA = [
  "Preto", "Prata", "Dourado", "Rose", "Azul", "Vermelho",
  "Verde", "Branco", "Marrom", "Cinza", "Roxo", "Laranja",
];

const CORES_PARAFUSO = ["Preto", "Prata", "Dourado", "Rose"];

const simpleTipo = (nome: string): AccessoryType => ({
  nome,
  variacoes: [{ nome: "Padrão", cores: [...SEM_COR] }],
});

export const ACESSORIOS_CATEGORIAS: AccessoryCategory[] = [
  // ── GRUPO B — ALICATES ──
  {
    nome: "Alicates",
    tiposVenda: ["Unidade"],
    tipos: [
      "Corte", "Bico Fino", "Bico Redondo", "Meia-Cana",
      "Nylon (Proteção)", "Plaqueta", "Abrir Aro", "Charneira",
    ].map(simpleTipo),
  },

  // ── GRUPO D — PONTAS DE ALICATE ──
  {
    nome: "Pontas de Alicate",
    tiposVenda: ["Unidade"],
    tipos: Array.from({ length: 10 }, (_, i) =>
      simpleTipo(`Nylon ${String(i + 1).padStart(2, "0")}`)
    ),
  },

  // ── GRUPO F — CHAVES ──
  {
    nome: "Chaves",
    tiposVenda: ["Unidade"],
    tipos: [
      "4 Pontas", "Dourada Fenda", "Dourada Porca", "Dourada Estrela",
      "Fenda", "Porca", "Estrela", "Ponta Fenda", "Ponta Porca", "Ponta Estrela",
      "Chaveirinho", "Kit 10 Pontas", "Kit Grande", "Kit Extra", "Extra",
    ].map(simpleTipo),
  },

  // ── GRUPO H — PINÇAS ──
  {
    nome: "Pinças",
    tiposVenda: ["Unidade"],
    tipos: ["Reta", "Curva", "Comum"].map(simpleTipo),
  },

  // ── GRUPO R — SUPORTE PARA GRAU ──
  {
    nome: "Suporte para Grau",
    tiposVenda: ["Unidade"],
    materiais: ["Metal", "Acetato", "Nylon", "TR"],
    tipos: [simpleTipo("Padrão")],
  },

  // ── GRUPO T — FLANELAS ──
  {
    nome: "Flanelas",
    tiposVenda: ["Unidade", "Pacote 10 und", "Pacote 50 und", "Pacote 80 und", "Pacote 100 und"],
    tipos: ["Microfibra", "Camurça", "Mágica", "Anti-Embaçante", "Poliéster"].map(n => ({
      nome: n,
      variacoes: [
        { nome: "Pequena", cores: [...SEM_COR] },
        { nome: "Grande", cores: [...SEM_COR] },
      ],
    })),
  },

  // ── GRUPO V — LIMPA LENTE ──
  {
    nome: "Limpa Lente",
    tiposVenda: ["Unidade", "Pacote 10 unidades"],
    tipos: [{
      nome: "Padrão",
      variacoes: ["25ml", "30ml", "50ml", "100ml"].map(v => ({ nome: v, cores: [...SEM_COR] })),
    }],
  },

  // ── GRUPO X — PLAQUETAS ──
  {
    nome: "Plaquetas",
    tiposVenda: ["Unidade", "Pacote 2", "Pacote 5", "Pacote 10", "Pacote 50", "Pacote 100", "Pacote 200"],
    materiais: ["Silicone", "PVC", "Anatômica", "Ray-Ban", "Especial", "Adesiva", "AR"],
    tipos: [simpleTipo("Padrão")],
  },

  // ── GRUPO Z — MOLAS ──
  {
    nome: "Molas",
    tiposVenda: ["Unidade", "Par", "Pacote com 10"],
    tipos: [
      simpleTipo("Mola com Caixa"),
      simpleTipo("Mola sem Caixa"),
    ],
  },

  // ── GRUPO AB — CHARNEIRA ──
  {
    nome: "Charneira",
    tiposVenda: ["Unidade", "Pacote 10"],
    tipos: [
      simpleTipo("Dupla"),
      simpleTipo("Simples"),
    ],
  },

  // ── GRUPO AD — TRAVA ──
  {
    nome: "Travas",
    tiposVenda: ["Pacote 10", "Pacote 25", "Pacote 50"],
    tipos: ["Pino Duplo", "Simples", "Colorida", "Bucha Curta", "Longa"].map(n => ({
      nome: n,
      variacoes: genNumericVariations(1.1, 2.3).map(v => ({
        ...v,
        cores: [...CORES_TRAVA],
      })),
    })),
  },

  // ── GRUPO AF — PARAFUSOS ──
  {
    nome: "Parafusos",
    tiposVenda: ["Pacote 10", "Pacote 50", "Pacote 100"],
    tipos: ["Guia", "Soberba", "Fenda", "Estrela", "Metade", "Cabeça Maior"].map(n => ({
      nome: n,
      variacoes: genNumericVariations(1.1, 2.3).map(v => ({
        ...v,
        cores: [...CORES_PARAFUSO],
      })),
    })),
  },

  // ── GRUPO AH — PORCAS ──
  {
    nome: "Porcas",
    tiposVenda: ["Pacote 10", "Pacote 50", "Pacote 100"],
    materiais: ["Metal", "Alumínio", "Plástico"],
    tipos: [{
      nome: "Padrão",
      variacoes: genNumericVariations(1.1, 2.0),
    }],
  },

  // ── GRUPO AJ — ARRUELAS ──
  {
    nome: "Arruelas",
    tiposVenda: ["Pacote 10", "Pacote 50", "Pacote 100"],
    materiais: ["Metal", "Alumínio", "Plástico"],
    tipos: [{
      nome: "Padrão",
      variacoes: genNumericVariations(1.1, 2.0),
    }],
  },

  // ── GRUPO AL — CAPACETES ──
  {
    nome: "Capacetes",
    tiposVenda: ["Pacote 10", "Pacote 50", "Pacote 100"],
    materiais: ["Metal", "Alumínio", "Plástico"],
    tipos: [{
      nome: "Padrão",
      variacoes: genNumericVariations(1.1, 2.0),
    }],
  },

  // ── Grupos existentes mantidos ──

  {
    nome: "Testes",
    tiposVenda: ["Unidade"],
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
    tiposVenda: ["Unidade", "Par"],
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
    nome: "Pontes",
    tiposVenda: ["Unidade"],
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
    nome: "Cordões",
    tiposVenda: ["Unidade", "Dúzia"],
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
    nome: "Utilidades",
    tiposVenda: ["Unidade"],
    tipos: [
      simpleTipo("Chaveiro"),
      simpleTipo("Broche"),
      simpleTipo("Meia"),
      simpleTipo("Cirex"),
      simpleTipo("Escala"),
      simpleTipo("Porta O.S."),
    ],
  },
  {
    nome: "Sacolas",
    tiposVenda: ["Unidade", "Pacote 10"],
    tipos: [
      {
        nome: "Papel",
        variacoes: [{ nome: "Unidade", cores: ["Branco", "Preto", "Personalizado"] }],
      },
      {
        nome: "TNT",
        variacoes: [{ nome: "PCT c/10", cores: ["Branco", "Preto", "Personalizado"] }],
      },
    ],
  },
  {
    nome: "Estojos",
    tiposVenda: ["Unidade"],
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
        variacoes: [{ nome: "Zíper", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] }],
      },
      {
        nome: "Receituário",
        variacoes: [{ nome: "Zíper", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] }],
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
        variacoes: [{ nome: "Imã", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] }],
      },
      {
        nome: "Texturizado",
        variacoes: [{ nome: "Botão", cores: ["Azul", "Preto", "Vermelho", "Rosa", "Variado"] }],
      },
    ],
  },
  {
    nome: "Porta Óculos",
    tiposVenda: ["Unidade"],
    tipos: [simpleTipo("Padrão")],
  },
  {
    nome: "Expositores",
    tiposVenda: ["Unidade"],
    tipos: [{
      nome: "Óculos",
      variacoes: [{ nome: "5 lugares", cores: ["Nenhuma"] }],
    }],
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

export function getTiposVendaByCategoria(categoriaNome: string): string[] {
  return getCategoriaByName(categoriaNome)?.tiposVenda ?? [];
}

export function isEstojo(categoriaNome: string): boolean {
  return categoriaNome === "Estojos";
}

export function hasMaterial(categoriaNome: string): boolean {
  const cat = getCategoriaByName(categoriaNome);
  return !!cat?.materiais && cat.materiais.length > 0;
}

/** All category names */
export const TODAS_CATEGORIAS_ACESSORIO = ACESSORIOS_CATEGORIAS.map(c => c.nome);
