/* =====================================================
   APROVEITAI — INSTALAÇÃO DO PWA
===================================================== */

(function () {

  let eventoInstalacao = null;


  function instalado() {

    return (
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches ||
      window.navigator.standalone === true
    );

  }


  function isIOS() {

    return (
      /iphone|ipad|ipod/i.test(
        navigator.userAgent
      ) ||
      (
        navigator.platform === "MacIntel" &&
        navigator.maxTouchPoints > 1
      )
    );

  }


  function pegarBotao() {

    return (
      document.querySelector(
        "[data-instalar-aproveitai]"
      ) ||
      document.getElementById(
        "btnInstalarApp"
      )
    );

  }


  function pegarMensagem() {

    return (
      document.querySelector(
        "[data-instalacao-msg]"
      ) ||
      document.getElementById(
        "orientacaoInstalacao"
      )
    );

  }


  function mostrarBotao() {

    const botao =
      pegarBotao();

    if (!botao) return;

    botao.style.display =
      "inline-flex";

  }


  function esconderBotao() {

    const botao =
      pegarBotao();

    if (!botao) return;

    botao.style.display =
      "none";

  }


  function mostrarMensagem(html) {

    const box =
      pegarMensagem();

    if (!box) return;

    box.hidden = false;
    box.style.display = "block";
    box.innerHTML = html;

  }


  /* ==================================================
     NAVEGADOR DISPONIBILIZOU INSTALAÇÃO
  ================================================== */

  window.addEventListener(
    "beforeinstallprompt",
    function (evento) {

      evento.preventDefault();

      eventoInstalacao =
        evento;

      console.log(
        "AproveitAI: instalação disponível."
      );

      mostrarBotao();

    }
  );


  /* ==================================================
     CLIQUE NO BOTÃO
  ================================================== */

  async function instalar() {

    if (instalado()) {

      esconderBotao();

      return;

    }


    /* ================================================
       ANDROID / EDGE / CHROME
    ================================================ */

    if (eventoInstalacao) {

      try {

        await eventoInstalacao.prompt();

        const escolha =
          await eventoInstalacao.userChoice;

        console.log(
          "AproveitAI instalação:",
          escolha.outcome
        );


        eventoInstalacao = null;


        if (
          escolha.outcome ===
          "accepted"
        ) {

          esconderBotao();

        }

        return;


      } catch (erro) {

        console.error(
          "Erro ao instalar AproveitAI:",
          erro
        );

      }

    }


    /* ================================================
       IPHONE / IPAD
    ================================================ */

    if (isIOS()) {

      mostrarMensagem(`

        <strong>
          📲 Instalar AproveitAI
        </strong>

        <br><br>

        No Safari, toque em

        <strong>Compartilhar</strong>

        e depois em

        <strong>
          Adicionar à Tela de Início
        </strong>.

      `);

      return;

    }


    /* ================================================
       FALLBACK
    ================================================ */

    mostrarMensagem(`

      <strong>
        📲 Instalar AproveitAI
      </strong>

      <br><br>

      Abra o menu do navegador

      <strong>⋮</strong>

      e escolha

      <strong>
        Instalar aplicativo
      </strong>

      ou

      <strong>
        Adicionar à tela inicial
      </strong>.

    `);

  }


  /* ==================================================
     PREPARA BOTÃO
  ================================================== */

  function iniciar() {

    const botao =
      pegarBotao();

    if (!botao) {

      return;

    }


    if (instalado()) {

      esconderBotao();

      return;

    }


    mostrarBotao();


    botao.addEventListener(
      "click",
      instalar
    );

  }


  /* ==================================================
     INSTALAÇÃO CONCLUÍDA
  ================================================== */

  window.addEventListener(
    "appinstalled",
    function () {

      console.log(
        "AproveitAI instalado."
      );

      eventoInstalacao = null;

      esconderBotao();

    }
  );


  /* ==================================================
     INICIALIZAÇÃO
  ================================================== */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      iniciar
    );

  } else {

    iniciar();

  }

})();