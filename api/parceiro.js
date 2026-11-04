
/*
 * APROVEITAI — API PÚBLICA DE IDENTIFICAÇÃO DO PARCEIRO
 * Rota: /api/parceiro?parceiro_id=GER0001
 * Não altera dados nem executa validação de benefícios.
 */

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      ok: false,
      erro: "Método não permitido"
    });
  }

  const parceiroId = String(
    req.query.parceiro_id || ""
  ).trim().toUpperCase();

  if (!/^[A-Z0-9_-]{1,40}$/.test(parceiroId)) {
    return res.status(400).json({
      ok: false,
      erro: "Identificador de parceiro inválido"
    });
  }

  const gasUrl = process.env.APROVEITAI_GAS_URL;

  if (!gasUrl) {
    return res.status(503).json({
      ok: false,
      erro: "APROVEITAI_GAS_URL não configurada"
    });
  }

  let urlBase;

  try {
    urlBase = new URL(gasUrl);

    if (
      urlBase.protocol !== "https:" ||
      urlBase.hostname !== "script.google.com" ||
      !/^\/macros\/s\/[^/]+\/exec$/.test(urlBase.pathname)
    ) {
      throw new Error("URL inválida");
    }
  } catch (_) {
    return res.status(503).json({
      ok: false,
      erro: "Configuração inválida do Apps Script"
    });
  }

  const callback = "aproveitaiParceiroCallback";
  urlBase.searchParams.set("acao", "dadosEmpresa");
  urlBase.searchParams.set("parceiro_id", parceiroId);
  urlBase.searchParams.set("callback", callback);

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    12000
  );

  try {
    const resposta = await fetch(urlBase.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "text/javascript, application/json, text/plain"
      }
    });

    if (!resposta.ok) {
      return res.status(502).json({
        ok: false,
        erro: "Falha HTTP na consulta ao Apps Script",
        status_origem: resposta.status
      });
    }

    const texto = (await resposta.text()).trim();

    let dados;
    const prefixo = callback + "(";

    if (texto.startsWith(prefixo)) {
      const fim = texto.lastIndexOf(")");

      if (fim < prefixo.length) {
        throw new Error("Resposta JSONP incompleta");
      }

      const conteudo = texto
        .slice(prefixo.length, fim)
        .trim();

      if (!/^;*\s*$/.test(texto.slice(fim + 1))) {
        throw new Error("Resposta JSONP inesperada");
      }

      dados = JSON.parse(conteudo);
    } else {
      dados = JSON.parse(texto);
    }

    if (!dados || dados.ok !== true) {
      return res.status(404).json({
        ok: false,
        erro: "Parceiro não localizado ou resposta negativa"
      });
    }

    return res.status(200).json({
      ok: true,
      parceiro_id: parceiroId,
      nomeFantasia: String(
        dados.nomeFantasia || dados.nome || ""
      ),
      logoURL: String(
        dados.logoURL || dados.logo || ""
      )
    });

  } catch (erro) {
    return res.status(502).json({
      ok: false,
      erro: erro.name === "AbortError"
        ? "Tempo limite de comunicação com Apps Script"
        : "Resposta inválida ou falha de comunicação"
    });
  } finally {
    clearTimeout(timeout);
  }
}
