/* ================================================================
   CONFIGURAÇÕES DO SITE — EDITE APENAS ESTE BLOCO
   Para atualizar o site, altere os valores abaixo.
   ================================================================ */
const CONFIG = {
  nome:      "DUNTER",
  slogan:    "Barbearia moderna • estilo e atitude",
  endereco:  "Joinville - SC",          // ← endereço
  telefone:  "(47) 99999-9999",         // ← telefone
  email:     "contato@dunter.com",      // ← e-mail
  instagram: "#",                       // ← link do Instagram
  facebook:  "#",                       // ← link do Facebook
  whatsapp:  "#",                       // ← link do WhatsApp
  horarios: [                           // ← horários disponíveis
    "09:00", "10:00", "11:00",
    "14:00", "15:00", "16:00"
  ],
};
/* ================================================================ */


/* ── CARREGAMENTO DE PÁGINAS ─────────────────────────────────── */

function carregarPagina(pagina) {
  const container = document.querySelector("#paginas");

  const req = new XMLHttpRequest();
  req.onreadystatechange = () => {
    if (req.readyState === 4) {
      if (req.status === 200) {
        container.innerHTML = req.responseText;
        aplicarConfig();
      } else {
        container.innerHTML =
          `<p style="color:white;padding:20px;text-align:center;">
             Erro ${req.status} ao carregar a página.
           </p>`;
      }
    }
  };
  req.open("GET", `${pagina}.html`);
  req.send();
}

/* Aplica CONFIG nos elementos que usam data-config="chave" */
function aplicarConfig() {
  document.querySelectorAll("[data-config]").forEach(el => {
    const chave = el.dataset.config;
    if (CONFIG[chave] === undefined) return;

    if (el.tagName === "A") {
      el.href = CONFIG[chave];
    } else {
      el.textContent = CONFIG[chave];
    }
  });
}

/* Carrega a home ao abrir o site */
document.addEventListener("DOMContentLoaded", () => {
  carregarPagina("home");
});


/* ── ANIMAÇÃO DE CARDS ───────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("show");
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".custom-card").forEach(c => observer.observe(c));
});


/* ── GALERIA — AGENDAMENTO ───────────────────────────────────── */

let corteSelecionado   = "";
let valorSelecionado   = "";
let horarioSelecionado = null;

/* Abre o modal de agendamento */
function abrirModal(botao) {
  const card = botao.closest(".card");
  corteSelecionado = card.querySelector(".card-title").innerText;
  valorSelecionado = card.querySelector(".preco").innerText;

  /* Resetar estado a cada abertura */
  horarioSelecionado = null;

  const campo = id => document.getElementById(id);
  campo("data").value     = "";
  campo("nome").value     = "";
  campo("telefone").value = "";
  campo("email").value    = "";
  campo("horarios").innerHTML = "";
  campo("confirmar").disabled = true;
  campo("confirmar").classList.remove("ativo");

  campo("modal").style.display = "flex";
}

function fecharModal() {
  document.getElementById("modal").style.display = "none";
}

function fecharSucesso() {
  document.getElementById("sucesso").style.display = "none";
}

/* Renderiza os horários a partir do CONFIG
   marcando como indisponíveis os já agendados no mesmo dia */
function mostrarHorarios() {
  const container = document.getElementById("horarios");
  if (!container) return;

  const data = document.getElementById("data").value;
  const ocupados = agendamentos
    .filter(a => a.data === data)
    .map(a => a.hora);

  container.innerHTML = "<p>Horários disponíveis:</p>";

  CONFIG.horarios.forEach(h => {
    const btn = document.createElement("button");
    btn.innerText = h;
    btn.type = "button";

    if (ocupados.includes(h)) {
      btn.disabled = true;
      btn.classList.add("desativado");
      btn.title = "Horário já agendado";
    } else {
      btn.onclick = () => selecionarHorario(h, btn);
    }

    container.appendChild(btn);
  });

  horarioSelecionado = null;
  validar();
}

function selecionarHorario(h, elemento) {
  horarioSelecionado = h;

  document.querySelectorAll(".horarios button").forEach(btn => {
    if (!btn.disabled) {
      btn.classList.remove("selecionado");
      btn.classList.add("desativado");
    }
  });

  elemento.classList.remove("desativado");
  elemento.classList.add("selecionado");

  validar();
}

/* Validação via event delegation — funciona mesmo com páginas carregadas dinamicamente */
document.addEventListener("input", e => {
  if (e.target.matches("#nome, #telefone, #email")) validar();
});

document.addEventListener("change", e => {
  if (e.target.id === "data") mostrarHorarios();
});

function validar() {
  const get = id => (document.getElementById(id)?.value || "").trim();
  const nome     = get("nome");
  const telefone = get("telefone");
  const email    = get("email");
  const data     = get("data");
  const botao    = document.getElementById("confirmar");

  if (!botao) return;

  if (nome && telefone && email && data && horarioSelecionado) {
    botao.disabled = false;
    botao.classList.add("ativo");
  } else {
    botao.disabled = true;
    botao.classList.remove("ativo");
  }
}

/* Confirma e salva o agendamento */
function confirmar() {
  const data = document.getElementById("data").value;
  salvarAgendamento(data, horarioSelecionado);
  fecharModal();
  document.getElementById("sucesso").style.display = "flex";
}


/* ── AGENDAMENTOS COM PERSISTÊNCIA (localStorage) ───────────── */

/* Carrega agendamentos salvos ao iniciar */
let agendamentos = (() => {
  try {
    return JSON.parse(localStorage.getItem("dunter_agendamentos") || "[]");
  } catch {
    return [];
  }
})();

function salvarAgendamento(data, hora) {
  agendamentos.push({
    id:    Date.now(),
    corte: corteSelecionado,
    valor: valorSelecionado,
    data,
    hora,
  });
  localStorage.setItem("dunter_agendamentos", JSON.stringify(agendamentos));
}

function cancelarAgendamento(id) {
  agendamentos = agendamentos.filter(a => a.id !== id);
  localStorage.setItem("dunter_agendamentos", JSON.stringify(agendamentos));
  renderizarAgendamentos();
}

function abrirAgendamentos() {
  document.getElementById("modalAgendamentos").style.display = "flex";
  renderizarAgendamentos();
}

function fecharAgendamentos() {
  document.getElementById("modalAgendamentos").style.display = "none";
}

function renderizarAgendamentos() {
  const lista = document.getElementById("listaAgendamentos");
  if (!lista) return;

  lista.innerHTML = "";

  if (agendamentos.length === 0) {
    lista.innerHTML = `<p class="sem-agendamentos">Nenhum agendamento encontrado.</p>`;
    return;
  }

  /* Ordena por data e hora */
  const sorted = [...agendamentos].sort((a, b) =>
    (a.data + a.hora).localeCompare(b.data + b.hora)
  );

  sorted.forEach(a => {
    const card = document.createElement("div");
    card.className = "card-agendamento";
    card.innerHTML = `
      <div class="agend-info">
        <strong>${a.corte}</strong>
        <small>${formatarData(a.data)} • ${a.hora}</small>
      </div>
      <div class="agend-acoes">
        <span class="agend-valor">${a.valor}</span>
        <button class="btn-cancelar" onclick="cancelarAgendamento(${a.id})" title="Cancelar agendamento">✕</button>
      </div>
    `;
    lista.appendChild(card);
  });
}

/* Formata data de YYYY-MM-DD para DD/MM/YYYY */
function formatarData(data) {
  if (!data) return "";
  const [y, m, d] = data.split("-");
  return `${d}/${m}/${y}`;
}
