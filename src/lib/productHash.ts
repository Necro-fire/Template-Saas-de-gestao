/**
 * Generates a deterministic hash string for a product based on its key attributes.
 * Used to detect duplicate products before insertion.
 */
export function generateProductHash(data: {
  referencia: string;
  categoriaIdade: string;
  genero: string;
  estilo: string;
  corArmacao: string;
  materialAro: string;
  materialHaste: string;
  lensSize: number;
  alturaLente: number;
  bridgeSize: number;
  templeSize: number;
  tipoLente: string;
  isAcessorio: boolean;
  subcategoriaAcessorio: string;
}): string {
  const ref = data.referencia || "NA";
  if (data.isAcessorio) {
    return `${ref}-ACC-${data.subcategoriaAcessorio || "NA"}`.toUpperCase();
  }
  return [
    ref,
    data.corArmacao || "NA",
    data.genero || "NA",
    data.estilo || "NA",
    data.materialAro || "NA",
    String(data.lensSize || 0),
    String(data.alturaLente || 0),
    String(data.bridgeSize || 0),
    String(data.templeSize || 0),
  ].join("-").toUpperCase();
}
