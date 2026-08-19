/* =========================================================
   PLATAFORMA APROVEITAI
   RENDERIZADOR OFICIAL DE BENEFÍCIOS E PROMOÇÕES
========================================================= */

window.AproveitAIOfertas = (() => {

  function texto(v) {
    return String(v ?? "").trim();
  }


  function dataBR(valor) {

    if (!valor) return "";

    const s = texto(valor);

    // já está DD/MM/AAAA
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
      return s;
    }

    const d = new Date(valor);

    if (isNaN(d.getTime())) {
      return s;
    }

    return d.toLocaleDateString("pt-BR");
  }


  /* =====================================================
     FORMAS DE PAGAMENTO
  ===================================================== */

  function normalizarFormas(valor) {

    if (!valor) return [];

    if (Array.isArray(valor)) {
      return valor
        .map(texto)
        .filter(Boolean);
    }

    return texto(valor)
      .split(/[,;|]+/)
      .map(v => v.trim())
      .filter(Boolean);
  }


  function formasPagamento(oferta) {

    const valor =
      oferta.forma_pagamento ??
      oferta.formaPagamento ??
      oferta.formas_pagamento ??
      oferta.formasPagamento ??
      "";

    return normalizarFormas(valor);
  }


  function htmlPagamento(oferta) {

    const formas = formasPagamento(oferta);

    if (!formas.length) {
      return "";
    }

    const titulo =
      formas.length === 1
        ? "Forma de pagamento"
        : "Formas de pagamento";

    return `
      <div class="oferta-pagamento">
        <strong>💳 ${titulo}:</strong>
        ${formas.join(" • ")}
      </div>
    `;
  }


  /* =====================================================
     VIGÊNCIA
  ===================================================== */

  function htmlVigencia(oferta) {

    const inicio =
      oferta.dataInicio ??
      oferta.data_inicio ??
      "";

    const fim =
      oferta.dataFim ??
      oferta.data_fim ??
      "";

    if (inicio && fim) {
      return `
        <div class="oferta-vigencia">
          📅 <strong>Vigência:</strong>
          ${dataBR(inicio)} até ${dataBR(fim)}
        </div>
      `;
    }

    if (inicio) {
      return `
        <div class="oferta-vigencia">
          📅 <strong>Válido a partir de:</strong>
          ${dataBR(inicio)}
        </div>
      `;
    }

    if (fim) {
      return `
        <div class="oferta-vigencia">
          📅 <strong>Válido até:</strong>
          ${dataBR(fim)}
        </div>
      `;
    }

    return "";
  }


  /* =====================================================
     EXCLUSIVIDADE
  ===================================================== */

  function ehExclusivo(oferta) {

    return Boolean(
      texto(oferta.grupo) ||
      texto(oferta.idPublico) ||
      texto(oferta.id_publico) ||
      texto(oferta.cpf)
    );
  }


  function htmlExclusivo(oferta) {

    if (!ehExclusivo(oferta)) {
      return "";
    }

    return `
      <div class="oferta-exclusivo">
        ☆ EXCLUSIVO
      </div>
    `;
  }


  /* =====================================================
     CONDIÇÕES CADASTRADAS PELO PARCEIRO
  ===================================================== */

  function condicoes(oferta) {

    return texto(
      oferta.observacoes ??
      oferta.condicoes ??
      oferta.regras ??
      ""
    );
  }


  function htmlCondicoes(oferta, tipo) {

    const c = condicoes(oferta);

    const titulo =
      tipo === "promocao"
        ? "CONDIÇÕES DA PROMOÇÃO"
        : "CONDIÇÕES DE UTILIZAÇÃO";

    return `
      <div class="oferta-condicoes">

        <div class="oferta-condicoes-titulo">
          ℹ️ ${titulo}
        </div>

        ${
          c
            ? `<div class="oferta-condicoes-texto">${c}</div>`
            : ""
        }

        <div class="oferta-validacao">
          🛡️ <strong>Validação obrigatória:</strong>
          apresente e valide seu Cartão AproveitAI antes da
          conclusão da compra. O benefício ou promoção está
          sujeito às condições definidas pelo parceiro.
        </div>

      </div>
    `;
  }


  /* =====================================================
     CARD OFICIAL
  ===================================================== */

  function render(oferta, opcoes = {}) {

    const tipo =
      opcoes.tipo === "promocao"
        ? "promocao"
        : "beneficio";

    const compacto =
      opcoes.compacto === true;

    const titulo =
      texto(oferta.titulo) ||
      (tipo === "promocao" ? "Promoção" : "Benefício");

    const descricao =
      texto(oferta.descricao);

    const categoria =
      texto(oferta.categoria);

    const rotulo =
      tipo === "promocao"
        ? "🎯 PROMOÇÃO"
        : "🎁 BENEFÍCIO";


    return `

      <div class="oferta-card ${compacto ? "oferta-compacta" : ""}">

        ${htmlExclusivo(oferta)}

        <div class="oferta-principal">

          <div class="oferta-tipo">
            ${rotulo}
          </div>

          <h3 class="oferta-titulo">
            ${titulo}
          </h3>

          ${
            categoria
              ? `<div class="oferta-categoria">${categoria}</div>`
              : ""
          }

          ${
            descricao
              ? `<div class="oferta-descricao">${descricao}</div>`
              : ""
          }

        </div>

        ${htmlVigencia(oferta)}

        ${htmlPagamento(oferta)}

        ${htmlCondicoes(oferta, tipo)}

      </div>

    `;
  }


  function beneficio(oferta, opcoes = {}) {

    return render(
      oferta,
      {
        ...opcoes,
        tipo: "beneficio"
      }
    );
  }


  function promocao(oferta, opcoes = {}) {

    return render(
      oferta,
      {
        ...opcoes,
        tipo: "promocao"
      }
    );
  }


  return {
    render,
    beneficio,
    promocao,
    dataBR,
    formasPagamento
  };

})();