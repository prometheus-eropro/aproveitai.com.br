// /api/parceiros.js

export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tabela = process.env.AIRTABLE_TABELA_PARCEIROS;

  try {
    const url = `https://api.airtable.com/v0/${baseId}/${tabela}`;
    const response = await fetch(url, {
      headers: {
        Authorization: token
      }
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const data = await response.json();

    const parceiros = data.records.map(record => {
      const f = record.fields;
      const ativo = f.ativo === 1 || f.ativo === true || String(f.ativo || '').toLowerCase() === 'sim';
      if (!ativo) return null;
      return {
        nome: f.nomeFantasia || "",
        logo: f.logoURL || "",
        cidade: f.cidade || "",
        ramo: f.ramo || "",
        whatsapp: f.whatsapp || "",
        instagram: f.instagram || "",
        site: f.site || "",
        beneficios: f.beneficios || ""
      };
    }).filter(p => p !== null);

    res.status(200).json(parceiros);
  } catch (error) {
    console.error("Erro ao carregar parceiros:", error.message);
    res.status(500).json({ erro: "Erro ao carregar parceiros", detalhes: error.message });
  }
}
