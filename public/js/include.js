/* ============================
   CARREGAR HEADER
============================ */

const header = document.getElementById("header");

if (header) {

    fetch("includes/header.html")
        .then(r => r.text())
        .then(html => {

            header.innerHTML = html;

        });

}

/* ============================
   CARREGAR FOOTER
============================ */

const footer = document.getElementById("footer");

if (footer) {

    fetch("includes/footer.html")
        .then(r => r.text())
        .then(html => {

            footer.innerHTML = html;

            if (typeof CONFIG !== "undefined") {

                const v = document.getElementById("versaoSistema");

                if (v) {

                    v.innerHTML = CONFIG.versao;

                }

            }

        })
        .catch(err => console.error(err));

}

const css = document.getElementById("cssMain");

if (css && typeof CONFIG !== "undefined") {

    css.href = "style.css?v=" + CONFIG.versao;

}