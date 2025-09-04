document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-cliente');

  if (!form) {
    console.error("Formulário não encontrado!");
    return;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    // Aqui você pode colocar o que quiser que o zap.js faça no envio do formulário
    console.log('Formulário enviado!');
  });
});
