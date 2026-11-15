const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwMMQ2FR2JBpo7xvWVazw4dAV6t_t90UxTASLcGfo1t7fA-beDqJDC-4z-Y7DL9vRunVg/exec";

const CALLBACK = "receberCalculadoraServidor";

export default async function handler(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false });
  }

  const consulta = new URL(APPS_SCRIPT_URL);
  consulta.searchParams.set("action", "listarDadosCalculadora");
  consulta.searchParams.set("callback", CALLBACK);

  try {
    const resposta = await fetch(consulta, {
      signal: AbortSignal.timeout(15000)
    });

    if (!resposta.ok) {
      throw new Error("Apps Script retornou HTTP " + resposta.status);
    }

    const texto = (await resposta.text()).trim();
    const prefixo = CALLBACK + "(";
    const conteudo = texto.endsWith(";")
      ? texto.slice(0, -1).trimEnd()
      : texto;

    if (!conteudo.startsWith(prefixo) || !conteudo.endsWith(")")) {
      throw new Error("Resposta fora do formato esperado");
    }

    const dados = JSON.parse(conteudo.slice(prefixo.length, -1));
    if (dados?.ok !== true || !dados.dados) {
      throw new Error("Consulta da calculadora recusada pelo Apps Script");
    }

    return res.status(200).json(dados);
  } catch (erro) {
    console.error("Consulta da calculadora:", erro.message);
    const status = erro.name === "TimeoutError" ? 504 : 502;
    return res.status(status).json({ ok: false });
  }
}
