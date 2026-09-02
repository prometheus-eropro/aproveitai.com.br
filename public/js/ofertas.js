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
    ★ EXCLUSIVO
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

/* =====================================================
   SITE
===================================================== */

function linkSite(oferta) {

  let site =
    texto(
      oferta.site ||
      oferta.website ||
      oferta.url_site ||
      oferta.link_site ||
      ""
    );

  if (!site) {
    return "";
  }

  /*
   * Remove espaços
   */
  site = site.trim();

  /*
   * Se já possuir protocolo,
   * mantém como está.
   */
  if (/^https?:\/\//i.test(site)) {
    return site;
  }

  /*
   * Evita endereço relativo.
   *
   * Exemplo:
   * www.aproveitai.com.br
   *
   * passa a ser:
   * https://www.aproveitai.com.br
   */
  return "https://" + site;
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

    const site =
      linkSite(oferta);

    const maps =
      linkMaps(oferta);


    if (
      !whatsapp &&
      !instagram &&
      !site &&
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
          site
            ? `
              <a
                href="${escaparHTML(site)}"
                target="_blank"
                rel="noopener noreferrer"
                class="oferta-btn oferta-btn-site"
              >
                🌐 Site
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
   ITENS DO BENEFÍCIO / PROMOÇÃO
===================================================== */

function htmlItensBeneficio(oferta) {

  const valor =
    texto(
      oferta.itens_beneficio ||
      oferta.itensBeneficio ||
      ""
    );

  if (!valor) {
    return "";
  }


  const itens =
    valor
      .split(/\r?\n/)
      .map(linha => linha.trim())
      .filter(Boolean);


  if (!itens.length) {
    return "";
  }


  const linhas =
    itens.map(linha => {

      const partes =
        linha.split("|");

      const item =
        texto(
          partes.shift()
        );

      const beneficio =
        texto(
          partes.join("|")
        );


      return `
        <div class="oferta-item-beneficio">

          <span class="oferta-item-nome">
            ${escaparHTML(item)}
          </span>

          ${
            beneficio
              ? `
                <span class="oferta-item-regra">
                  ${escaparHTML(beneficio)}
                </span>
              `
              : ""
          }

        </div>
      `;

    }).join("");


  return `
    <div class="oferta-itens">

      <div class="oferta-itens-titulo">
        🛍️ ITENS E BENEFÍCIOS
      </div>

      <div class="oferta-itens-lista">
        ${linhas}
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


          ${htmlItensBeneficio(oferta)}

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

  linkSite,

  linkMaps

};

})

();

/* =========================================================
   APROVEITAI
   ESTILO OFICIAL DOS CARDS DE OFERTAS
========================================================= */

(function(){

  if(document.getElementById("aproveitai-ofertas-css")){
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "aproveitai-ofertas-css";

  style.textContent = `

/* CARD */

.oferta-card{
    width:100%;
    max-width:520px;
    margin:0 auto 20px;
    padding:20px;

    box-sizing:border-box;

    background:#ffffff;

    border:1px solid #e3e3e3;
    border-radius:16px;

    box-shadow:
        0 6px 18px rgba(0,0,0,.08);

    color:#222;
    text-align:left;

    overflow:hidden;
}


/* ==========================================
   PARCEIRO
========================================== */

.oferta-parceiro{
    display:flex;
    align-items:center;

    gap:12px;

    padding-bottom:14px;
    margin-bottom:14px;

    border-bottom:1px solid #dddddd;
}


.oferta-parceiro-logo{
    width:68px;
    height:68px;
    min-width:68px;

    display:flex;
    align-items:center;
    justify-content:center;

    overflow:hidden;

    border-radius:10px;
}


.oferta-parceiro-logo img{
    display:block !important;

    width:auto !important;
    height:auto !important;

    max-width:68px !important;
    max-height:68px !important;

    object-fit:contain !important;

    margin:0 !important;
}


.oferta-parceiro-info{
    flex:1;
    min-width:0;
}


.oferta-parceiro-label{
    margin-bottom:3px;

    color:#087c2b;

    font-size:11px;
    font-weight:800;
}


.oferta-parceiro-nome{
    color:#222;

    font-size:18px;
    font-weight:800;
    line-height:1.25;

    overflow-wrap:anywhere;
}


.oferta-parceiro-ramo{
    margin-top:4px;

    color:#666;

    font-size:13px;
}


/* ==========================================
   EXCLUSIVO
========================================== */

.oferta-exclusivo{
    width:100%;

    margin:0 0 12px;
    padding:7px 10px;

    box-sizing:border-box;

    background:#ffcc00;
    color:#222;

    border-radius:7px;

    text-align:center;

    font-size:13px;
    font-weight:800;
}


/* ==========================================
   CONTEÚDO PRINCIPAL
========================================== */

.oferta-principal{
    width:100%;

    box-sizing:border-box;

    padding:15px;

    margin-bottom:14px;

    background:#f1faf4;

    border:2px solid #0b8a35;
    border-radius:10px;

    text-align:center;
}


.oferta-tipo{
    margin-bottom:8px;

    color:#087c2b;

    font-size:12px;
    font-weight:800;
}


.oferta-titulo{
    margin:0 0 10px !important;

    color:#222 !important;

    font-size:19px !important;
    font-weight:800 !important;
    line-height:1.3 !important;

    text-align:center !important;
}


.oferta-categoria{
    margin:5px 0;

    color:#555;

    font-size:12px;
    font-weight:700;

    text-align:center;
}


.oferta-descricao{
    margin-top:10px;

    color:#222;

    font-size:14px;
    line-height:1.55;

    text-align:left;

    white-space:pre-line;
    overflow-wrap:anywhere;
}


/* ==========================================
   VIGÊNCIA / PAGAMENTO
========================================== */

.oferta-vigencia,
.oferta-pagamento{
    margin:10px 0;

    color:#222;

    font-size:14px;
    line-height:1.5;
}


/* ==========================================
   CONTATOS
========================================== */

.oferta-contatos{
    display:flex;
    flex-wrap:wrap;

    gap:8px;

    margin:14px 0;
}


.oferta-btn{
    display:inline-flex !important;

    align-items:center;
    justify-content:center;

    width:auto !important;

    min-height:36px;

    padding:8px 12px !important;
    margin:0 !important;

    box-sizing:border-box;

    background:#087c2b !important;
    color:#ffffff !important;

    border:none !important;
    border-radius:7px !important;

    text-decoration:none !important;

    font-size:13px !important;
    font-weight:700 !important;

    line-height:1.2;
}


.oferta-btn:hover{
    background:#065e20 !important;
}


/* ==========================================
   CONDIÇÕES
========================================== */

.oferta-condicoes{
    width:100%;

    margin-top:16px;
    padding:16px;

    box-sizing:border-box;

    background:#eefaf0;

    border:2px solid #0b8a35;
    border-radius:10px;
}


.oferta-condicoes-titulo{
    margin-bottom:14px;

    color:#087c2b;

    text-align:center;

    font-size:16px;
    font-weight:800;
}


.oferta-condicoes-texto{
    color:#333;

    font-size:14px;
    line-height:1.65;

    text-align:left;

    white-space:pre-line;
    overflow-wrap:anywhere;
}


.oferta-validacao{
    margin-top:14px;
    padding-top:14px;

    border-top:1px solid #c9dfce;

    color:#333;

    font-size:14px;
    line-height:1.6;

    text-align:left;
}


/* ==========================================
   CELULAR
========================================== */

@media(max-width:600px){

    .oferta-card{
        max-width:100%;
        padding:15px;
        border-radius:12px;
    }


    .oferta-parceiro-logo{
        width:58px;
        height:58px;
        min-width:58px;
    }


    .oferta-parceiro-logo img{
        max-width:58px !important;
        max-height:58px !important;
    }


    .oferta-parceiro-nome{
        font-size:16px;
    }


    .oferta-titulo{
        font-size:17px !important;
    }


    .oferta-contatos{
        justify-content:center;
    }

}

  `;

  document.head.appendChild(style);

})();