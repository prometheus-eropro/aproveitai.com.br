document.addEventListener("DOMContentLoaded", function () {
  const parceiro = JSON.parse(localStorage.getItem("parceiro"));
  if (!parceiro || !parceiro.idPublico) {
    alert("Parceiro não logado");
    window.location.href = "login.html";
    return;
  }

  const id = parceiro.idPublico;
  const nome = parceiro.nome;

  document.getElementById("nomeParceiro").innerText = nome;

  // Carrega promoções e benefícios do backend
  fetch(`/api/painel-cliente?id=${id}`)
    .then((res) => {
      if (!res.ok) throw new Error("Erro ao buscar dados");
      return res.json();
    })
    .then((dados) => {
      const { promocoes, beneficios } = dados;

      const promoContainer = document.getElementById("promocoes");
      if (promocoes.length === 0) {
        promoContainer.innerHTML = "<p>Nenhuma promoção ativa.</p>";
      } else {
        promocoes.forEach((promo) => {
          const card = document.createElement("div");
          card.classList.add("card");

          const titulo = promo.fields.titulo || "Sem título";
          const descricao = promo.fields.descricao || "";
          const dataFinal = promo.fields.dataFim
            ? new Date(promo.fields.dataFim).toLocaleDateString("pt-BR")
            : "";
          const grupo = promo.fields.grupo || "";
          const whatsapp = promo.fields.whatsapp || "";
          const instagram = promo.fields.instagram || "";

          card.innerHTML = `
            <h3>${titulo}</h3>
            <p>${descricao}</p>
            ${dataFinal ? `<p>Válido até ${dataFinal}</p>` : ""}
            ${grupo ? `<p><strong>Grupo:</strong> ${grupo}</p>` : ""}
            ${whatsapp ? `<a href="https://wa.me/${whatsapp}" target="_blank">WhatsApp</a>` : ""}
            ${instagram ? `<a href="${instagram}" target="_blank">Instagram</a>` : ""}
          `;

          promoContainer.appendChild(card);
        });
      }

      const beneficioContainer = document.getElementById("beneficios");
      if (beneficios.length === 0) {
        beneficioContainer.innerHTML = "<p>Nenhum benefício ativo.</p>";
      } else {
        beneficios.forEach((item) => {
          const div = document.createElement("div");
          div.classList.add("info");

          const nome = item.fields.nome || "Sem nome";
          const descricao = item.fields.descricao || "";

          div.innerHTML = `<h4>${nome}</h4><p>${descricao}</p>`;
          beneficioContainer.appendChild(div);
        });
      }
    })
    .catch((err) => {
      console.error("Erro:", err);
      alert("Erro ao carregar dados.");
    });
});

  <script>
    const idPublico = new URLSearchParams(window.location.search).get('id');
    const tabelaClientes = 'clientes';
    const tabelaBeneficios = 'beneficios';
    const tabelaPromocoes = 'promocoes';

    function norm(v) {
      return (v ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
    }

    function isAtivo(v) {
      const s = norm(v);
      return ['sim','yes','true','1','ativo'].includes(s);
    }

    function naoVenceu(fields) {
      const raw = fields.dataFim ?? fields.datafim;
      if (!raw) return true;
      const fim = new Date(raw);
      if (isNaN(fim)) return true;
      fim.setHours(23,59,59,999);
      return fim >= new Date();
    }

    function formatarData(dataString) {
      if (!dataString) return 'Indefinida';
      const data = new Date(dataString);
      if (isNaN(data)) return 'Indefinida';
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      return `${dia}/${mes}/${ano}`;
    }

    function mascararCPF(cpf) {
      return cpf ? cpf.replace(/(\d{3})\d{3}(\d{3})/, '$1.***.$2') : '';
    }

    function mascararCelular(celular) {
      return celular ? celular.replace(/(\d{2})\d{5}(\d{4})/, '($1) *****-$2') : '';
    }

    async function buscarCliente(id) {
      const url = `https://api.airtable.com/v0/${baseId}/${tabelaClientes}?filterByFormula=({idPublico}='${id}')`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${airtableToken}` },
      });
      const data = await response.json();
      if (!data.records || data.records.length === 0) throw new Error("Cliente não encontrado");
      return data.records[0];
    }

    async function buscarTodos(tabela) {
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tabela}`, {
        headers: { Authorization: `Bearer ${airtableToken}` },
      });
      const data = await response.json();
      return data.records || [];
    }

    function filtrarItens(itens, cliente, tipo) {
      const grupoCliente = norm(cliente.grupo);
      const idCliente = cliente.idPublico;

      return itens.filter((item) => {
        const f = item.fields;
        if (!isAtivo(f.ativo)) return false;
        if (!naoVenceu(f)) return false;

        const grupoItem = norm(f.grupo || '');
        const idPubItem = f.idPublico || '';

        const exclusivo = (grupoItem && grupoItem === grupoCliente) || (idPubItem && idPubItem === idCliente);
        const geral = grupoItem === 'todos' || (!grupoItem && !idPubItem);

        return tipo === 'geral' ? geral : exclusivo;
      });
    }

function montarLista(destino, lista, isPromocao = false) {
  destino.innerHTML = '';
  lista.forEach(item => {
    const f = item.fields;
    const li = document.createElement('li');

    const titulo = f.titulo || '[Sem título]';
    const parceiro = f.parceiro || '';
    const descricao = f.descricao || '';
    const inicioRaw = f.dataInicio || f.datainicio;
    const inicio = isPromocao ? formatarData(inicioRaw) : null;
    const fim = formatarData(f.dataFim || f.datafim);
    const validade = isPromocao ? `(Válido: ${inicio} até ${fim})` : `(Válido até: ${fim})`;

    const whatsapp = (f.whatsapp || '').replace(/\D/g, '');
    const insta = (f.instagram || f.insta || '').trim();

    let extra = '';
    if (whatsapp) {
      extra += `<br>📱 WhatsApp: <a href="https://wa.me/55${whatsapp}" target="_blank">clique aqui</a>`;
    }
    if (insta) {
      const ig = insta.replace('@', '');
      extra += `<br>📸 Instagram: <a href="https://instagram.com/${ig}" target="_blank">@${ig}</a>`;
    }

    li.innerHTML = `<strong>${titulo}</strong> - ${parceiro}<br>${descricao}<br>${validade}${extra}`;
    destino.appendChild(li);

const hr = document.createElement('hr');
hr.style.border = 'none';
hr.style.borderTop = '1px dashed #aaa';
hr.style.margin = '20px 0';
destino.appendChild(hr);

  });
}
    async function montarPainel() {
      try {
        const clienteObj = await buscarCliente(idPublico);
        const cliente = clienteObj.fields;

        document.getElementById('nome').textContent = cliente.nome;
        document.getElementById('cidade').textContent = cliente.cidade;
        document.getElementById('grupo').textContent = cliente.grupo;
        document.getElementById('idPublico').textContent = cliente.idPublico;
        document.getElementById('dataCadastro').textContent = formatarData(cliente.dataCadastro);
        document.getElementById('cpf').textContent = mascararCPF(cliente.cpf);
        document.getElementById('celular').textContent = mascararCelular(cliente.celular);

        const beneficios = await buscarTodos(tabelaBeneficios);
        const promocoes = await buscarTodos(tabelaPromocoes);

        montarLista(document.getElementById('beneficiosGerais'), filtrarItens(beneficios, cliente, 'geral'));
        montarLista(document.getElementById('beneficiosExclusivos'), filtrarItens(beneficios, cliente, 'exclusivo'));
        montarLista(document.getElementById('promocoesGerais'), filtrarItens(promocoes, cliente, 'geral'), true);
        montarLista(document.getElementById('promocoesExclusivas'), filtrarItens(promocoes, cliente, 'exclusivo'), true);
      } catch (e) {
        alert('Erro ao montar painel: ' + e.message);
      }
    }

    function verCartao() {
      const id = new URLSearchParams(window.location.search).get("id");
      if (!id) return alert("ID não encontrado!");
      window.location.href = `cartao.html?id=${encodeURIComponent(id)}`;
    }

    function enviarWhatsapp() {
      const nome = document.getElementById("nome").textContent;
      const id = document.getElementById("idPublico").textContent;
      const texto = `Olá, gostaria de solicitar alteração nos meus dados:\nNome: ${nome}\nID: ${id}`;
      const numero = "5528999692303";
      window.open(`https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(texto)}`, '_blank');
    }
</script>
    montarPainel();
</script>
const res = await fetch(`/api/cliente?id=${idPublico}`);
