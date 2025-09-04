// /pages/api/consulta.js

  const { id } = req.query;
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE; // <— AJUSTE

  const url = `https://api.airtable.com/v0/${baseId}/clientes?filterByFormula=({idPublico}="${id}")`;
  const resposta = await fetch(url, { headers:{ Authorization:`Bearer ${token}` } });
  const dados = await resposta.json();
  res.status(200).json(dados);
}

const icones = {
  ativo: "✅",
  inativo: "⚠️",
  erro: "❌"
};

function renderizarConsulta(c) {
  const status = c.status?.toLowerCase() || "erro";
  const icone = icones[status] || "❔";

  return `
    <div class="consulta ${status}">
      <strong>${icone} ${c.nome || "Cliente desconhecido"}</strong><br>
      CPF: ${c.cpf || "Não informado"}<br>
      Data/Hora: ${c.dataHora || "-"}
    </div>
  `;
}

function abrirConsultasParceiro() {
  const win = window.open("/consultas-parceiro.html", "_blank");
  if (!win) alert("Permita pop-ups para ver a nova página.");
}

function exportarCSV() {
  const dados = window.consultas || [];
  if (!dados.length) return alert("Nenhuma consulta para exportar.");

  let csv = "Nome,CPF,Status,Data/Hora\n";
  dados.forEach(c => {
    csv += `"${c.nome}","${c.cpf}","${c.status}","${c.dataHora}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "consultas.csv";
  link.click();
}
function carregarConsultas() {
  fetch('/api/consultas')
    .then(r => r.json())
    .then(dados => {
      window.consultas = dados;
      document.getElementById('listaConsultas').innerHTML = dados.map(renderizarConsulta).join('');
    });
}
if (!sessionStorage.getItem('clienteId')) {
  document.getElementById('acessoNegado').style.display = 'block';
  // opcional: redirecionar depois de uns segundos
}
