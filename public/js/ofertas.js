/* =========================================================
   PLATAFORMA APROVEITAI
   RENDERIZADOR OFICIAL DE BENEFÍCIOS E PROMOÇÕES
========================================================= */

window.AproveitAIOfertas = (() => {

  /* =====================================================
     UTILITÁRIOS
  ===================================================== */

  function texto(v) {
    return String(v ?? "").trim();
  }


  function escaparHTML(v) {

    return texto(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function dataBR(valor) {

    if (!valor) return "";

    const s = texto(valor);

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

    const formas =
      formasPagamento(oferta);

    if (!formas.length) {
      return "";
    }

    const titulo =
      formas.length === 1
        ? "Forma de pagamento"
        : "Formas de pagamento";

    return `
      <div class="oferta-pagamento">

        <strong>
          💳 ${titulo}:
        </strong>

        ${formas.map(escaparHTML).join(" • ")}

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

          ${escaparHTML(dataBR(inicio))}
          até
          ${escaparHTML(dataBR(fim))}

        </div>
      `;
    }


    if (inicio) {

      return `
        <div class="oferta-vigencia">

          📅 <strong>Válido a partir de:</strong>

          ${escaparHTML(dataBR(inicio))}

        </div>
      `;
    }


    if (fim) {

      return `
        <div class="oferta-vigencia">

          📅 <strong>Válido até:</strong>

          ${escaparHTML(dataBR(fim))}

        </div>
      `;
    }


    return "";
  }

  /* =====================================================
     SITUAÇÃO / VIGÊNCIA DA PROMOÇÃO
  ===================================================== */

  function converterData(valor) {

    if (!valor) {
      return null;
    }

    if (valor instanceof Date) {

      const d =
        new Date(valor.getTime());

      return isNaN(d.getTime())
        ? null
        : d;
    }


    const s =
      texto(valor);


    /*
     * DD/MM/AAAA
     */

    const br =
      s.match(
        /^(\d{2})\/(\d{2})\/(\d{4})$/
      );


    if (br) {

      const d =
        new Date(
          Number(br[3]),
          Number(br[2]) - 1,
          Number(br[1])
        );

      return isNaN(d.getTime())
        ? null
        : d;
    }


    /*
     * Demais formatos recebidos do GAS
     */

    const d =
      new Date(valor);


    return isNaN(d.getTime())
      ? null
      : d;
  }


  function promocaoEncerrada(oferta) {

    const fim =
      oferta.dataFim ??
      oferta.data_fim ??
      "";

    if (!fim) {
      return false;
    }


    const dataFim =
      converterData(fim);


    if (!dataFim) {
      return false;
    }


    dataFim.setHours(
      23,
      59,
      59,
      999
    );


    return new Date() > dataFim;
  }


  function promocaoFutura(oferta) {

    const inicio =
      oferta.dataInicio ??
      oferta.data_inicio ??
      "";

    if (!inicio) {
      return false;
    }


    const dataInicio =
      converterData(inicio);


    if (!dataInicio) {
      return false;
    }


    dataInicio.setHours(
      0,
      0,
      0,
      0
    );


    const hoje =
      new Date();


    hoje.setHours(
      0,
      0,
      0,
      0
    );


    return hoje < dataInicio;
  }

  /* =====================================================
     EXCLUSIVIDADE
  ===================================================== */

  function ehExclusivo(oferta) {

    const grupo =
      texto(oferta.grupo)
        .toUpperCase();


    const possuiGrupoExclusivo =
      grupo !== "" &&
      grupo !== "GERAL";


    const possuiClienteEspecifico =
      Boolean(

        texto(oferta.idPublico) ||

        texto(oferta.id_publico) ||

        texto(oferta.cpf)

      );


    return (
      possuiGrupoExclusivo ||
      possuiClienteEspecifico
    );
  }


  function htmlExclusivo(oferta) {

    if (!ehExclusivo(oferta)) {
      return "";
    }

    return `
      <div class="oferta-exclusivo">
        ⭐ EXCLUSIVO
      </div>
    `;
  }


  /* =====================================================
     PARCEIRO
  ===================================================== */

  function htmlParceiro(oferta) {

    const nome =
      texto(
        oferta.parceiro ||
        oferta.nomeFantasia
      );


    const ramo =
      texto(oferta.ramo);


    const logo =
      texto(
        oferta.logoURL ||
        oferta.logo_url ||
        oferta.logo
      );


    if (!nome && !logo) {
      return "";
    }


    return `
      <div class="oferta-parceiro">

        ${
          logo
            ? `
              <div class="oferta-parceiro-logo">

                <img
                  src="${escaparHTML(logo)}"
                  alt="${escaparHTML(nome || "Parceiro AproveitAI")}"
                  loading="lazy"
                >

              </div>
            `
            : ""
        }


        <div class="oferta-parceiro-info">

          <div class="oferta-parceiro-label">
            🏪 PARCEIRO APROVEITAI
          </div>

          ${
            nome
              ? `
                <div class="oferta-parceiro-nome">
                  ${escaparHTML(nome)}
                </div>
              `
              : ""
          }

          ${
            ramo
              ? `
                <div class="oferta-parceiro-ramo">
                  ${escaparHTML(ramo)}
                </div>
              `
              : ""
          }

        </div>

      </div>
    `;
  }


  /* =====================================================
     LINKS DO PARCEIRO
  ===================================================== */

  function somenteNumeros(v) {
    return texto(v).replace(/\D/g, "");
  }


  function linkWhatsApp(oferta) {

    let numero =
      somenteNumeros(
        oferta.whatsapp ||
        oferta.telefone
      );


    if (!numero) {
      return "";
    }


    /*
     * Se o telefone possuir DDD + número,
     * acrescenta o código do Brasil.
     */

    if (
      numero.length >= 10 &&
      numero.length <= 11
    ) {
      numero = "55" + numero;
    }


    return (
      "https://wa.me/" +
      encodeURIComponent(numero)
    );
  }


  function linkInstagram(oferta) {

    let instagram =
      texto(oferta.instagram);

    if (!instagram) {
      return "";
    }


    if (
      /^https?:\/\//i.test(instagram)
    ) {
      return instagram;
    }


    instagram =
      instagram
        .replace(/^@/, "")
        .replace(/^instagram\.com\//i, "")
        .replace(/^www\.instagram\.com\//i, "")
        .replace(/\/+$/, "");


    return (
      "https://www.instagram.com/" +
      encodeURIComponent(instagram)
    );
  }


  function linkMaps(oferta) {

    const link =
      texto(
        oferta.link_maps ||
        oferta.linkMaps
      );


    if (link) {
      return link;
    }


    const partes = [

      oferta.endereco,
      oferta.numero,
      oferta.complemento,
      oferta.bairro,
      oferta.cidade,
      oferta.uf

    ]
      .map(texto)
      .filter(Boolean);


    if (!partes.length) {
      return "";
    }


    return (
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(
        partes.join(", ")
      )
    );
  }


  function htmlContatos(oferta) {

    const whatsapp =
      linkWhatsApp(oferta);

    const instagram =
      linkInstagram(oferta);

    const maps =
      linkMaps(oferta);


    if (
      !whatsapp &&
      !instagram &&
      !maps
    ) {
      return "";
    }


    return `
      <div class="oferta-contatos">

        ${
          whatsapp
            ? `
              <a
                href="${escaparHTML(whatsapp)}"
                target="_blank"
                rel="noopener noreferrer"
                class="oferta-btn oferta-btn-whatsapp"
              >
                📲 WhatsApp
              </a>
            `
            : ""
        }


        ${
          instagram
            ? `
              <a
                href="${escaparHTML(instagram)}"
                target="_blank"
                rel="noopener noreferrer"
                class="oferta-btn oferta-btn-instagram"
              >
                📸 Instagram
              </a>
            `
            : ""
        }


        ${
          maps
            ? `
              <a
                href="${escaparHTML(maps)}"
                target="_blank"
                rel="noopener noreferrer"
                class="oferta-btn oferta-btn-maps"
              >
                📍 Como chegar
              </a>
            `
            : ""
        }

      </div>
    `;
  }


  /* =====================================================
     CONDIÇÕES
  ===================================================== */

  function condicoes(oferta) {

    return texto(
      oferta.observacoes ??
      oferta.condicoes ??
      oferta.regras ??
      ""
    );
  }


  function htmlCondicoes(
    oferta,
    tipo
  ) {

    const c =
      condicoes(oferta);


    const ehPromocao =
      tipo === "promocao";


    const titulo =
      ehPromocao
        ? "CONDIÇÕES DA PROMOÇÃO"
        : "CONDIÇÕES DE UTILIZAÇÃO";


    const nomeOferta =
      ehPromocao
        ? "A promoção"
        : "O benefício";


    return `
      <div class="oferta-condicoes">

        <div class="oferta-condicoes-titulo">
          ℹ️ ${titulo}
        </div>


        ${
          c
            ? `
              <div class="oferta-condicoes-texto">
                ${escaparHTML(c)}
              </div>
            `
            : ""
        }


        <div class="oferta-validacao">

          🛡️
          <strong>
            Validação obrigatória:
          </strong>

          apresente e valide seu
          Cartão AproveitAI antes da
          conclusão da compra.

          ${nomeOferta} está sujeito às
          condições definidas pelo parceiro.

        </div>

      </div>
    `;
  }


  /* =====================================================
     RENDERIZAÇÃO
  ===================================================== */

  function render(
    oferta,
    opcoes = {}
  ) {

    oferta =
      oferta || {};


    const tipo =
      opcoes.tipo === "promocao"
        ? "promocao"
        : "beneficio";


    const compacto =
      opcoes.compacto === true;


    /*
     * Permite ocultar cabeçalho e contatos
     * em telas onde o parceiro já está
     * identificado externamente.
     */

    const mostrarParceiro =
      opcoes.mostrarParceiro !== false;


    const mostrarContatos =
      opcoes.mostrarContatos !== false;


    const titulo =
      texto(oferta.titulo) ||
      (
        tipo === "promocao"
          ? "Promoção"
          : "Benefício"
      );


    const descricao =
      texto(oferta.descricao);


    const categoria =
      texto(oferta.categoria);


    const rotulo =
      tipo === "promocao"
        ? "🎯 PROMOÇÃO"
        : "🎁 BENEFÍCIO";


    return `

      <div
        class="
          oferta-card
          ${compacto ? "oferta-compacta" : ""}
        "
      >

        ${
          mostrarParceiro
            ? htmlParceiro(oferta)
            : ""
        }


        ${htmlExclusivo(oferta)}


        <div class="oferta-principal">

          <div class="oferta-tipo">
            ${rotulo}
          </div>


          <h3 class="oferta-titulo">
            ${escaparHTML(titulo)}
          </h3>


          ${
            categoria
              ? `
                <div class="oferta-categoria">
                  ${escaparHTML(categoria)}
                </div>
              `
              : ""
          }


          ${
            descricao
              ? `
                <div class="oferta-descricao">
                  ${escaparHTML(descricao)}
                </div>
              `
              : ""
          }

        </div>


        ${htmlVigencia(oferta)}


        ${htmlPagamento(oferta)}


        ${
          mostrarContatos
            ? htmlContatos(oferta)
            : ""
        }


        ${htmlCondicoes(oferta, tipo)}

      </div>

    `;
  }


  /* =====================================================
     BENEFÍCIO
  ===================================================== */

  function beneficio(
    oferta,
    opcoes = {}
  ) {

    return render(
      oferta,
      {
        ...opcoes,
        tipo: "beneficio"
      }
    );
  }


  /* =====================================================
     PROMOÇÃO
  ===================================================== */

  function promocao(
    oferta,
    opcoes = {}
  ) {

    return render(
      oferta,
      {
        ...opcoes,
        tipo: "promocao"
      }
    );
  }


  /* =====================================================
     API PÚBLICA DO COMPONENTE
  ===================================================== */

    return {

    render,

    beneficio,

    promocao,

    dataBR,

    formasPagamento,

    ehExclusivo,

    promocaoEncerrada,

    promocaoFutura,

    linkWhatsApp,

    linkInstagram,

    linkMaps

  };

})();