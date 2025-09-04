export default async function handler(req,res){
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE;
  const table = 'beneficios';

  // Ativos e sem amarração a grupo/ID/CPF, e não expirados
  const hoje = new Date().toISOString().split('T')[0];
  const formula = `AND(
    LOWER({ativo})='sim',
    OR({grupo}='', {grupo}=BLANK()),
    OR({idPublico}='', {idPublico}=BLANK()),
    OR({cpf}='', {cpf}=BLANK()),
    OR({dataFim}='', {dataFim}=BLANK(), {dataFim}>='${hoje}')
  )`;

  const url = `https://api.airtable.com/v0/${baseId}/${table}?filterByFormula=${encodeURIComponent(formula)}`;
  const r = await fetch(url, { headers:{ Authorization:`Bearer ${token}` } });
  const j = await r.json();
  res.status(200).json(j);
}
