// api/zapi-webhook.js  (Vercel)
const memory = new Map(); // phone -> { token, cnpj, parceiro, ts }

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ ok: false });

    const body = req.body || {};
    const phone = pickPhone(body);
    const text = pickText(body);

    if (!phone || !text) return res.status(200).json({ ok: true });

    const GAS_URL = process.env.GAS_URL; // sua /exec
    const ZAPI_BASE_URL = process.env.ZAPI_BASE_URL; // base do Z-API (do painel)
    const ADMIN_PHONE = normalizePhone(process.env.ADMIN_PHONE || "");

    const sendText = async (to, message) => {
      // muitos painéis Z-API já entregam a base pronta: https://api.z-api.io/instances/{id}/token/{token}
      const url = `${ZAPI_BASE_URL}/send-text`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: to, message })
      });
    };

    const callGS = async (params) => {
      const usp = new URLSearchParams(params);
      const url = `${GAS_URL}?${usp.toString()}`;
      const r = await fetch(url);
      return await r.json();
    };

    const up = text.trim().toUpperCase();

    // MENU
    if (["MENU", "OI", "AJUDA"].includes(up)) {
      await sendText(phone,
`📌 *Aproveitai*
Parceiro:
- LOGIN <CNPJ> <TOKEN>
- VALIDAR <CPF ou ID>   (depois do login)

Cliente:
- MEU CPF <CPF>
- MEU ID <APV-XXXX>

Admin:
- ADMIN STATUS`);
      return res.status(200).json({ ok: true });
    }

    // ADMIN
    if (up.startsWith("ADMIN")) {
      if (ADMIN_PHONE && phone !== ADMIN_PHONE) {
        await sendText(phone, "❌ Acesso admin negado.");
        return res.status(200).json({ ok: true });
      }
      if (up === "ADMIN STATUS") {
        await sendText(phone, "✅ Admin online. Z-API + GS OK.");
        return res.status(200).json({ ok: true });
      }
      await sendText(phone, "Comando admin não reconhecido. Use: ADMIN STATUS");
      return res.status(200).json({ ok: true });
    }

    // LOGIN <CNPJ> <TOKEN>
    if (up.startsWith("LOGIN")) {
      const parts = text.split(/\s+/);
      const cnpj = (parts[1] || "").replace(/\D/g, "");
      const token = (parts[2] || "").trim();

      if (!cnpj || !token) {
        await sendText(phone, "Uso: LOGIN <CNPJ> <TOKEN>");
        return res.status(200).json({ ok: true });
      }

      const r = await callGS({ parceiroCNPJ: cnpj, token });

      if (!r.ok) {
        await sendText(phone, "❌ Login negado. Verifique CNPJ, TOKEN e se está ATIVO.");
        return res.status(200).json({ ok: true });
      }

      memory.set(phone, { token, cnpj: r.cnpj, parceiro: r.parceiro, ts: Date.now() });

      await sendText(phone,
`✅ *Login OK*
Parceiro: *${r.parceiro}*
Agora você pode validar sem token:
- VALIDAR <CPF>
- VALIDAR <IDPUBLICO>
- (ou enviar o QR do cliente e copiar o ID)`);
      return res.status(200).json({ ok: true });
    }

    // VALIDAR <CPF/ID>  (usa token salvo do login)
    if (up.startsWith("VALIDAR")) {
      const parts = text.split(/\s+/);
      const valor = (parts[1] || "").trim();

      const sess = memory.get(phone);
      if (!sess || !sess.token) {
        await sendText(phone, "⚠️ Você precisa logar primeiro: LOGIN <CNPJ> <TOKEN>");
        return res.status(200).json({ ok: true });
      }
      if (!valor) {
        await sendText(phone, "Uso: VALIDAR <CPF ou IDPUBLICO>");
        return res.status(200).json({ ok: true });
      }

      const onlyNum = valor.replace(/\D/g, "");
      const params = { modo: "parceiro", token: sess.token };

      if (onlyNum.length === 11) params.cpf = onlyNum;
      else params.idPublico = valor;

      const r = await callGS(params);

      if (r.erro) {
        const msg = (r.erro === "CLIENTE_NAO_ENCONTRADO")
          ? "⚪ *NÃO CADASTRADO*\nCliente não encontrado."
          : `❌ ${r.erro}`;
        await sendText(phone, msg);
        return res.status(200).json({ ok: true });
      }

      const ativo = String(r.ativo || "").toUpperCase() === "SIM";
      const status = ativo ? "🟢 *ATIVO*" : "🔴 *INATIVO*";
      const ero = ativo && r.codigoERO ? `\nAutorização: *${r.codigoERO}*` : "";
      await sendText(
  phone,
  `${status}
Cliente: *${r.nome || "-"}*
Grupo: *${r.grupo || "-"}*
${ero ? "Autorização: *" + r.codigoERO + "*" : ""}`
);

// 🔔 Notifica o cliente (sem expor ERO)
if (r.celular) {
  await sendText(
    normalizePhone(r.celular),
`🛍️ Seu Cartão AproveitAI foi utilizado!

Parceiro: *${sess.parceiro}*
Status: ${ativo ? "ATIVO ✅" : "INATIVO ❌"}

👉 Agora queremos sua opinião 😊

Responda com:
- *Nota do PARCEIRO*: número de *1 a 4*
- *Nota do CARTÃO*: número de *5 a 8*

Exemplo:
3
7`
  );
}

      return res.status(200).json({ ok: true });
    }

    // CLIENTE: MEU CPF
    if (up.startsWith("MEU CPF")) {
      const cpf = text.replace(/MEU CPF/i, "").trim().replace(/\D/g, "");
      if (cpf.length !== 11) {
        await sendText(phone, "Uso: MEU CPF <CPF>");
        return res.status(200).json({ ok: true });
      }
      const r = await callGS({ cpf, modo: "web" });
      if (r.erro) {
        await sendText(phone, `❌ ${r.erro}`);
        return res.status(200).json({ ok: true });
      }
      await sendText(phone, `📌 Nome: *${r.nome}*\nAtivo: *${r.ativo}*`);
      return res.status(200).json({ ok: true });
    }

    // CLIENTE: MEU ID
    if (up.startsWith("MEU ID")) {
      const id = text.replace(/MEU ID/i, "").trim();
      if (!id) {
        await sendText(phone, "Uso: MEU ID <APV-XXXX>");
        return res.status(200).json({ ok: true });
      }
      const r = await callGS({ idPublico: id, modo: "web" });
      if (r.erro) {
        await sendText(phone, `❌ ${r.erro}`);
        return res.status(200).json({ ok: true });
      }
      await sendText(phone, `📌 Nome: *${r.nome}*\nAtivo: *${r.ativo}*`);
      return res.status(200).json({ ok: true });
    }
// ⭐ FEEDBACK (cliente responde só com números)
if (/^[1-8]$/.test(up)) {
  const nota = Number(up);

  // nota do parceiro (1 a 4)
  if (nota >= 1 && nota <= 4) {
    await callGS({
      acao: "feedback",
      tipo: "parceiro",
      nota,
      telefone: phone
    });

    await sendText(
      phone,
      "✅ Nota do parceiro registrada! Agora envie a *nota do Cartão* (5 a 8)."
    );
    return res.status(200).json({ ok: true });
  }

  // nota do cartão (5 a 8)
  if (nota >= 5 && nota <= 8) {
    await callGS({
      acao: "feedback",
      tipo: "cartao",
      nota,
      telefone: phone
    });

    await sendText(
      phone,
      "🙏 Obrigado! Sua avaliação foi registrada com sucesso."
    );
    return res.status(200).json({ ok: true });
  }
}

    await sendText(phone, "Não entendi. Envie MENU.");
    return res.status(200).json({ ok: true });

  } catch (err) {
    return res.status(200).json({ ok: true, erro: String(err.message || err) });
  }
}

function pickPhone(body) {
  const v =
    body.phone ||
    body.from ||
    body.senderPhone ||
    (body.sender && body.sender.phone) ||
    (body.data && body.data.phone) ||
    "";
  return normalizePhone(v);
}

function pickText(body) {
  return String(
    body.text ||
    body.message ||
    (body.message && body.message.text) ||
    (body.text && body.text.message) ||
    (body.data && body.data.text) ||
    ""
  ).trim();
}

function normalizePhone(v) {
  const n = String(v || "").replace(/\D/g, "");
  if (!n) return "";
  return n.startsWith("55") ? n : ("55" + n);
}
function salvarFeedback({ parceiro, cidade, nota, comentario }) {
  const url = "https://script.google.com/macros/s/AKfycbzhwXhtWdsDSuABRneoz6QAD1SxpnMq3vc8e1FhtknlB7_1j6qLjYIbPA0qPJS7ck7y/exec";

  const params = new URLSearchParams({
    acao: "salvarFeedback",
    parceiro: parceiro || "",
    cidade: cidade || "",
    nota: nota || "",
    comentario: comentario || "",
    origem: "whatsapp"
  });

  fetch(url + "?" + params.toString()).catch(() => {});
}
