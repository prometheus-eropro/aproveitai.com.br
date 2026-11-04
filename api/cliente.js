
/*
 * PLATAFORMA APROVEITAI
 * API DE CONSULTA DO CLIENTE
 *
 * Rota: POST /api/cliente
 * Consulta o Google Apps Script sem alterar cadastros.
 */

export default async function handler(req, res) {

  res.setHeader(
    "Cache-Control",
    "private, no-store, max-age=0"
  );

  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      ok: false,
      mensagem: "Método não permitido"
    });
  }

  // Permite chamadas do domínio oficial.
  const origem = req.headers.origin;

  if (origem) {
    try {
      const u = new URL(origem);

      if (
        u.protocol !== "https:" ||
        ![
          "aproveitai.com.br",
          "www.aproveitai.com.br"
        ].includes(u.hostname)
      ) {
        return res.status(403).json({
          ok: false,
          mensagem: "Origem não autorizada"
        });
      }

    } catch (erro) {
      return res.status(403).json({
        ok: false,
        mensagem: "Origem inválida"
      });
    }
  }

  // Recebe os dados do formulário.
  const body =
    req.body && typeof req.body === "object"
      ? req.body
      : {};

  const cpf = String(body.cpf || "")
    .replace(/\D/g, "");

  const nascimento = String(
    body.nascimento || ""
  ).trim();

  const parceiroId = String(
    body.parceiro_id || ""
  ).trim().toUpperCase();

  // Validação dos dados recebidos.
  if (
    !/^\d{11}$/.test(cpf) ||
    !/^\d{2}\/\d{2}\/\d{4}$/.test(nascimento) ||
    !/^[A-Z0-9_-]{1,40}$/.test(parceiroId)
  ) {
    return res.status(400).json({
      ok: false,
      mensagem: "Dados de consulta inválidos"
    });
  }

  // URL do Apps Script configurada na Vercel.
  const gas = process.env.APROVEITAI_GAS_URL;

  let url;

  try {
    url = new URL(gas);

    if (
      url.protocol !== "https:" ||
      url.hostname !== "script.google.com" ||
      !/^\/macros\/s\/[^/]+\/exec$/.test(
        url.pathname
      )
    ) {
      throw new Error("GAS_URL");
    }

  } catch (erro) {
    return res.status(503).json({
      ok: false,
      mensagem: "Consulta temporariamente indisponível"
    });
  }

  // Mantém a ação utilizada pelo CORE.
  const callback = "aproveitaiClienteCallback";

  url.searchParams.set(
    "acao",
    "buscarClienteCPF"
  );

  url.searchParams.set("cpf", cpf);
  url.searchParams.set("nascimento", nascimento);
  url.searchParams.set("p", parceiroId);
  url.searchParams.set("parceiro_id", parceiroId);
  url.searchParams.set("callback", callback);

  // Controle de tempo da comunicação.
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    12000
  );

  try {

    const response = await fetch(
      url.toString(),
      {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          Accept:
            "text/javascript, application/json, text/plain"
        }
      }
    );

    if (!response.ok) {
      throw new Error("HTTP_ORIGEM");
    }

    const raw = (
      await response.text()
    ).trim();

    // Aceita JSONP ou JSON puro.
    const match = raw.match(
      /^aproveitaiClienteCallback\s*\(\s*([\s\S]*?)\s*\)\s*;?\s*$/
    );

    const dados = JSON.parse(
      match ? match[1] : raw
    );

    if (
      !dados ||
      typeof dados !== "object" ||
      Array.isArray(dados)
    ) {
      throw new Error("FORMATO");
    }

    return res.status(200).json(dados);

  } catch (erro) {

    console.error(
      "APROVEITAI_CLIENTE_API:",
      erro.name === "AbortError"
        ? "TIMEOUT"
        : "FALHA_COMUNICACAO"
    );

    return res.status(502).json({
      ok: false,
      mensagem:
        erro.name === "AbortError"
          ? "Tempo limite na consulta ao servidor"
          : "Falha na comunicação com o servidor"
    });

  } finally {
    clearTimeout(timeout);
  }
}
