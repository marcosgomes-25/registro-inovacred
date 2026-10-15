let profilesMap = {};
let cartoriosMap = {};
let allProcessos = [];
let abaAtual = "andamento"; // "andamento" | "concluidos"

const CABECALHO = {
  andamento: ["Identificação", "Tipo", "Cartório", "Banco", "Matrícula", "Responsável", "Prazo atual", "Situação"],
  concluidos: ["Identificação", "Tipo", "Cartório", "Banco", "Matrícula", "Responsável", "Data do registro", "Nº do registro/averbação"],
};

async function init() {
  const auth = await requireAuth();
  if (!auth) return;

  // Lembra a aba escolhida (assim, ao voltar do detalhe, continua na mesma aba)
  if (window.location.hash === "#concluidos") abaAtual = "concluidos";

  try {
    const [profiles, cartorios, processos] = await Promise.all([
      fetchProfiles(),
      fetchCartorios(),
      fetchProcessos(),
    ]);

    profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
    cartoriosMap = Object.fromEntries(cartorios.map((c) => [c.id, c]));
    allProcessos = processos;

    const sel = document.getElementById("filtroResponsavel");
    profiles.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.nome;
      sel.appendChild(opt);
    });

    render();
  } catch (err) {
    showAlert("Erro ao carregar processos: " + err.message);
  }
}

function trocarAba(aba) {
  abaAtual = aba;
  document.getElementById("filtroSituacao").value = "";
  history.replaceState(null, "", aba === "concluidos" ? "#concluidos" : window.location.pathname);
  render();
}

function render() {
  const busca = document.getElementById("filtroBusca").value.trim().toLowerCase();
  const situacaoFiltro = document.getElementById("filtroSituacao").value;
  const responsavelFiltro = document.getElementById("filtroResponsavel").value;

  const emAndamento = allProcessos.filter((p) => !p.registro_concluido);
  const concluidos = allProcessos.filter((p) => p.registro_concluido);

  // Cards de resumo
  document.getElementById("resumoTotal").textContent = emAndamento.length;
  document.getElementById("resumoVencidos").textContent = emAndamento.filter(
    (p) => statusPrazo(p) === "vencido"
  ).length;
  document.getElementById("resumoProximos").textContent = emAndamento.filter(
    (p) => statusPrazo(p) === "proximo"
  ).length;
  document.getElementById("resumoConcluidos").textContent = concluidos.length;

  // Abas
  document.getElementById("contAndamento").textContent = emAndamento.length;
  document.getElementById("contConcluidos").textContent = concluidos.length;
  document.getElementById("abaAndamento").classList.toggle("active", abaAtual === "andamento");
  document.getElementById("abaConcluidos").classList.toggle("active", abaAtual === "concluidos");

  // O filtro de situação só faz sentido em "Em andamento"
  document.getElementById("colFiltroSituacao").classList.toggle("d-none", abaAtual === "concluidos");

  // Cabeçalho da tabela
  document.getElementById("cabecalhoTabela").innerHTML = CABECALHO[abaAtual]
    .map((titulo) => `<th>${titulo}</th>`)
    .join("");

  const base = abaAtual === "concluidos" ? concluidos : emAndamento;
  const lista = base.filter((p) => {
    if (busca) {
      const alvo = [p.identificacao, p.cliente, p.matricula, p.numero_protocolo, p.banco]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!alvo.includes(busca)) return false;
    }
    if (abaAtual === "andamento" && situacaoFiltro && situacao(p) !== situacaoFiltro) return false;
    if (responsavelFiltro && p.responsavel_acompanhamento_id !== responsavelFiltro) return false;
    return true;
  });

  const tbody = document.getElementById("tabelaProcessos");
  tbody.innerHTML = "";

  if (!lista.length) {
    const msg =
      abaAtual === "concluidos"
        ? "Nenhum processo concluído encontrado."
        : "Nenhum processo em andamento encontrado.";
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">${msg}</td></tr>`;
    return;
  }

  lista.forEach((p) => {
    const cartorio = cartoriosMap[p.cartorio_id];
    const responsavel = profilesMap[p.responsavel_acompanhamento_id];

    let colunasFinais;
    if (abaAtual === "concluidos") {
      colunasFinais = `
        <td>${formatDate(p.data_registro)}</td>
        <td>${escapeHtml(p.numero_registro_averbacao || "-")}</td>
      `;
    } else {
      const prazo = prazoAtual(p);
      const status = statusPrazo(p);
      const statusLabel = { vencido: "Vencido", proximo: "Próximo", em_dia: "Em dia" }[status] || "";
      colunasFinais = `
        <td>${
          prazo
            ? formatDate(prazo) + (status ? ` <span class="badge badge-${status}">${statusLabel}</span>` : "")
            : "-"
        }</td>
        <td><span class="badge text-bg-secondary">${situacao(p)}</span></td>
      `;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="fw-semibold">${escapeHtml(p.identificacao)}</div>
        ${p.cliente ? `<div class="text-muted small">${escapeHtml(p.cliente)}</div>` : ""}
      </td>
      <td>${escapeHtml(p.tipo)}</td>
      <td>${cartorio ? escapeHtml(cartorio.nome) : "-"}</td>
      <td>${escapeHtml(p.banco || "-")}</td>
      <td>${escapeHtml(p.matricula || "-")}</td>
      <td>${responsavel ? escapeHtml(responsavel.nome) : "-"}</td>
      ${colunasFinais}
    `;
    tr.addEventListener("click", () => {
      window.location.href = `processo-detalhe.html?id=${p.id}`;
    });
    tbody.appendChild(tr);
  });
}

document.getElementById("filtroForm").addEventListener("submit", (e) => {
  e.preventDefault();
  render();
});

document.getElementById("btnLimpar").addEventListener("click", () => {
  document.getElementById("filtroBusca").value = "";
  document.getElementById("filtroSituacao").value = "";
  document.getElementById("filtroResponsavel").value = "";
  render();
});

document.querySelectorAll("#abasProcessos [data-aba]").forEach((btn) => {
  btn.addEventListener("click", () => trocarAba(btn.dataset.aba));
});

init();
