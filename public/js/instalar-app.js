/* =====================================================
   APROVEITAI — INSTALAÇÃO DO APP / PWA
   Arquivo: js/instalar-app.js
===================================================== */

(function () {

  let eventoInstalacao = null;


  /* =====================================================
     ELEMENTOS DA PÁGINA
  ===================================================== */

  function elementos() {

    return {
      botao:
        document.getElementById("btnInstalarApp"),

      orientacao:
        document.getElementById("orientacaoInstalacao")
    };

  }


  /* =====================================================
     VERIFICA SE JÁ ESTÁ RODANDO COMO APP
  ===================================================== */

  function appJaInstalado() {

    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );

  }


  /* =====================================================
     IDENTIFICA IPHONE / IPAD
  ===================================================== */

  function dispositivoApple() {

    return /iphone|ipad|ipod/i.test(
      navigator.userAgent
    );

  }


  /* =====================================================
     MOSTRAR BOTÃO
  ===================================================== */

  function mostrarBotao() {

    const { botao } = elementos();

    if (!botao) {
      return;
    }

    if (appJaInstalado()) {

      botao.style.display = "none";

      return;
    }

    botao.style.display = "";

  }


  /* =====================================================
     ESCONDER BOTÃO
  ===================================================== */

  function esconderBotao() {

    const { botao } = elementos();

    if (botao) {
      botao.style.display = "none";
    }

  }


  /* =====================================================
     MENSAGEM AUXILIAR
  ===================================================== */

  function mostrarOrientacao(html) {

    const { orientacao } = elementos();

    if (!orientacao) {
      return;
    }

    orientacao.innerHTML = html;
    orientacao.style.display = "block";

  }


  function esconderOrientacao() {

    const { orientacao } = elementos();

    if (!orientacao) {
      return;
    }

    orientacao.style.display = "none";
    orientacao.innerHTML = "";

  }


  /* =====================================================
     NAVEGADOR LIBEROU INSTALAÇÃO PWA
  ===================================================== */

  window.addEventListener(
    "beforeinstallprompt",
    function (evento) {

      evento.preventDefault();

      eventoInstalacao = evento;

      mostrarBotao();

    }
  );


  /* =====================================================
     CLIQUE EM INSTALAR
  ===================================================== */

  async function instalarAproveitai() {

    esconderOrientacao();


    /* ==========================================
       JÁ ESTÁ INSTALADO
    ========================================== */

    if (appJaInstalado()) {

      esconderBotao();

      return;
    }


    /* ==========================================
       IPHONE / IPAD
    ========================================== */

    if (dispositivoApple()) {

      mostrarOrientacao(`
        <strong>📱 Instalar AproveitAI no iPhone/iPad</strong>

        <br><br>

        1. Abra esta página pelo
        <strong>Safari</strong>.

        <br><br>

        2. Toque no botão
        <strong>Compartilhar</strong>.

        <br><br>

        3. Escolha
        <strong>Adicionar à Tela de Início</strong>.

        <br><br>

        4. Toque em
        <strong>Adicionar</strong>.
      `);

      return;
    }


    /* ==========================================
       ANDROID / CHROME / EDGE COMPATÍVEL
    ========================================== */

    if (eventoInstalacao) {

      try {

        eventoInstalacao.prompt();

        const resultado =
          await eventoInstalacao.userChoice;

        eventoInstalacao = null;


        if (
          resultado &&
          resultado.outcome === "accepted"
        ) {

          esconderBotao();
          esconderOrientacao();

        }

      } catch (erro) {

        console.error(
          "Erro ao solicitar instalação:",
          erro
        );

      }

      return;
    }


    /* ==========================================
       NAVEGADOR NÃO LIBEROU PROMPT AUTOMÁTICO
    ========================================== */

    mostrarOrientacao(`
      <strong>📲 Instalar AproveitAI</strong>

      <br><br>

      Abra o menu do navegador
      <strong>⋮</strong>
      e procure por:

      <br><br>

      <strong>Instalar aplicativo</strong>

      <br>

      ou

      <br>

      <strong>Adicionar à tela inicial</strong>.
    `);

  }


  /* =====================================================
     INSTALAÇÃO CONCLUÍDA
  ===================================================== */

  window.addEventListener(
    "appinstalled",
    function () {

      eventoInstalacao = null;

      esconderBotao();
      esconderOrientacao();

    }
  );


  /* =====================================================
     INICIALIZAÇÃO
  ===================================================== */

  function iniciar() {

    const { botao } = elementos();

    if (!botao) {
      return;
    }


    botao.addEventListener(
      "click",
      instalarAproveitai
    );


    if (appJaInstalado()) {

      esconderBotao();

      return;
    }


    /*
      No iPhone mostramos o botão para
      apresentar as instruções manuais.
    */

    if (dispositivoApple()) {

      mostrarBotao();

      return;
    }


    /*
      Nos demais navegadores o botão também
      permanece disponível.

      Se o navegador liberar beforeinstallprompt,
      teremos instalação automática.

      Caso contrário, mostramos as instruções
      pelo menu do navegador.
    */

    mostrarBotao();

  }


  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      iniciar
    );

  } else {

    iniciar();

  }

})();