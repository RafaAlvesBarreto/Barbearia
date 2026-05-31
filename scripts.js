
function carregarPagina(busca){
  let localDaPagina = document.querySelector("#paginas");

  let requisicao = new XMLHttpRequest();

  requisicao.onreadystatechange = () => {
    if(requisicao.readyState == 4){
      console.log("STATUS:", requisicao.status);

      if(requisicao.status == 200){
        localDaPagina.innerHTML = requisicao.responseText;
      } else {
        localDaPagina.innerHTML = `<p>Erro ${requisicao.status} ao carregar</p>`;
      }
    }
  }

  requisicao.open('GET', `${busca}.html`);
  requisicao.send();
}

/*=========== Index===========*/
  document.addEventListener("DOMContentLoaded", () => {

  const cards = document.querySelectorAll('.custom-card');

  const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
  if (entry.isIntersecting) {
  entry.target.classList.add("show");
}
});
}, { threshold: 0.2 });

  cards.forEach(card => observer.observe(card));

});

  /*======================Galeria===============*/
  let corteSelecionado = "";
  let valorSelecionado = "";

  function abrirModal(botao) {
  const card = botao.closest(".card");

  corteSelecionado = card.querySelector(".card-title").innerText;
  valorSelecionado = card.querySelector("li").innerText;

  document.getElementById("modal").style.display = "flex";
}

  function fecharModal() {
  document.getElementById("modal").style.display = "none";
}

  function fecharSucesso() {
  document.getElementById("sucesso").style.display = "none";
}

  /* horários */
  function mostrarHorarios() {
  const container = document.getElementById("horarios");
  container.innerHTML = "<p>Horários disponíveis:</p>";

  const horarios = ["09:00", "10:00", "14:00", "15:00"];

  horarios.forEach(h => {
  let btn = document.createElement("button");
  btn.innerText = h;
  btn.onclick = function () {
  selecionarHorario(h, this);
};
  container.appendChild(btn);
});
}

  let horarioSelecionado = null;

  /* validação */
  document.querySelectorAll("input").forEach(input => {
  input.addEventListener("input", validar);
});

  function validar() {
  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;
  const email = document.getElementById("email").value;

  const botao = document.getElementById("confirmar");
  const data = document.getElementById("data").value;


  if (nome && telefone && email && horarioSelecionado) {
  botao.disabled = false;
  botao.classList.add("ativo");
} else {
  botao.disabled = true;
  botao.classList.remove("ativo");
}
}

  /* confirmação */
  function confirmar() {
  const data = document.getElementById("data").value;

  salvarAgendamento(data, horarioSelecionado);

  fecharModal();
  document.getElementById("sucesso").style.display = "flex";

  console.log("Agendamento salvo");
}
  function selecionarHorario(h, elemento) {
  horarioSelecionado = h;

  const botoes = document.querySelectorAll(".horarios button");

  botoes.forEach(btn => {
  btn.classList.remove("selecionado");
  btn.classList.add("desativado");
});

  // ativa só o clicado
  elemento.classList.remove("desativado");
  elemento.classList.add("selecionado");

  validar();
}
  let agendamentos = [];

  /* salvar agendamento (chame isso no confirmar) */
  function salvarAgendamento(data, hora) {
  agendamentos.push({
    data: data,
    hora: hora,
    valor: valorSelecionado,
    corte: corteSelecionado
  });
}

  /* abrir modal */
  function abrirAgendamentos() {
  document.getElementById("modalAgendamentos").style.display = "flex";
  renderizarAgendamentos();
}

  /* fechar */
  function fecharAgendamentos() {
  document.getElementById("modalAgendamentos").style.display = "none";
}

  /* renderizar cards */
  function renderizarAgendamentos() {
  const lista = document.getElementById("listaAgendamentos");
  lista.innerHTML = "";

  agendamentos.forEach(a => {
  let card = document.createElement("div");
  card.className = "card-agendamento";

  card.innerHTML = `
  <div>
    <strong>${a.corte}</strong><br>
    ${a.data} - ${a.hora}
  </div>
  <div>${a.valor}</div>
`;

  lista.appendChild(card);
});
}

/*==============Sobre=============*/


