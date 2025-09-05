async function enviarMensagemWhatsApp(numero, mensagem) {
  const token = '8CF8F35C074397F23974255E'; // substitua pelo token da sua instância
  const instancia = '3E4BDE1F4BB9A18492F89E6774402775'; // substitua pelo ID da instância

  const url = `https://api.z-api.io/instances/${instancia}/token/${token}/send-text`;

  const body = {
    phone: numero,
    message: mensagem,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("Resposta do WhatsApp:", data);
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
  }
}
