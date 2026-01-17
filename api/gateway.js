// quando receber mensagem do cliente
const texto = message.text?.trim();

// só aceita números de 1 a 8
if (/^[1-8]$/.test(texto)) {
  const nota = texto;

  const urlGAS = "https://script.google.com/macros/s/AKfycbzhwXhtWdsDSuABRneoz6QAD1SxpnMq3vc8e1FhtknlB7_1j6qLjYIbPA0qPJS7ck7y/exec";

  await fetch(`${urlGAS}?acao=salvarFeedback&nota=${nota}&origem=whatsapp`, {
    method: "GET"
  });

  // resposta automática ao cliente
  await sendText({
    phone: from,
    message: "Obrigado! Sua avaliação foi registrada com sucesso 🙌"
  });

  return;
}
