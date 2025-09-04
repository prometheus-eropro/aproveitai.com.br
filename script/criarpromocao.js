document.addEventListener("DOMContentLoaded", () => {
    const parceiro = JSON.parse(localStorage.getItem("parceiro"));

    if (!parceiro) {
        alert("Erro: parceiro não identificado. Faça login novamente.");
        window.location.href = "areadoparceiro.html";
        return;
    }

    // Preenche dados se existirem (mas os campos continuam editáveis!)
    document.getElementById("whatsapp").value = parceiro.telefone || "";
    document.getElementById("instagram").value = parceiro.instagram || "";
    document.getElementById("nome-parceiro").value = parceiro.nome || "Parceiro sem nome";

    // Atualiza logos
    const logoEsquerda = document.querySelector(".logo-esquerda");
    const logoDireita = document.querySelector(".logo-direita");

    if (logoEsquerda) {
        logoEsquerda.src = parceiro.logoUrl || "logo-prometheus.png";
    }

    if (logoDireita) {
        logoDireita.src = "logo-aproveitai.png"; // SEMPRE essa
    }

    // Submit do formulário
    const form = document.getElementById("formPromocao");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const dados = {
            titulo: document.getElementById("titulo").value,
            descricao: document.getElementById("descricao").value,
            dataInicio: document.getElementById("dataInicio").value,
            dataFim: document.getElementById("dataFim").value,
            grupo: document.getElementById("grupo").value,
            whatsapp: document.getElementById("whatsapp").value,
            instagram: document.getElementById("instagram").value,
            parceiro: document.getElementById("nome-parceiro").value,
        };

        // Airtable config
        const airtableToken = 'Bearer patXmYwor3EFZGPte.628d2ecfcd251aab41181f5f8f0c601aa042c7195daad22f4178e2c5e0853c67'; // 🔥 troque por sua API Key real!
        const baseId = 'appMQwMQMQz7dLISZ';
        const tabelaPromocoes = 'promocoes';
        const url = `https://api.airtable.com/v0/${baseId}/${tabelaPromocoes}`;

        const payload = {
            records: [
                {
                    fields: {
                        titulo: dados.titulo,
                        descricao: dados.descricao,
                        dataInicio: dados.dataInicio,
                        dataFim: dados.dataFim,
                        grupo: dados.grupo,
                        whatsapp: dados.whatsapp,
                        instagram: dados.instagram,
                        parceiro: dados.parceiro,
                        ativo: "não"
                    }
                }
            ]
        };

        try {
            const resposta = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": airtableToken,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
            });

            if (resposta.ok) {
                alert("Promoção enviada com sucesso para o Airtable!");
                form.reset();
            } else {
                const err = await resposta.text();
                alert("Erro ao enviar promoção: " + err);
            }
        } catch (erro) {
            console.error("Erro de conexão com o Airtable:", erro);
            alert("Erro de conexão com o Airtable.");
        }
    });
});
