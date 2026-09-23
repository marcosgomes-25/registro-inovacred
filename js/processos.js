let profilesMap = {};
let cartoriosMap = {};
let allProcessos = [];

async function init() {
  const auth = await requireAuth();
  if (!auth) return;

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

function render() {
  const busca = document.getElementById("filtroBusca").value.trim().toLowerCase();
  const situacaoFiltro = document.getElementById("filtroSituacao").value;
  const responsavelFiltro = document.getElementById("filtroResponsavel").value;

  const lista = allProcessos.filter((p) => {
    if (busca) {
      const alvo = [p.identificacao, p.cliente, p.matricula, p.numero_protocolo]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!alvo.includes(busca)) return false;
    }
    if (situacaoFiltro && situacao(p) !== situacaoFiltro) return false;
    if (responsavelFiltro && p.responsavel_acompanhamento_id !== responsavelFiltro) return false;
    return true;
  });

  document.getElementById("resumoTotal").textContent = allProcessos.length;
  document.getElementById("resumoVencidos").textContent = allProcessos.filter(
    (p) => statusPrazo(p) === "vencido"
  ).length;
  document.getElementById("resumoProximos").textContent = allProcessos.filter(
    (p) => statusPrazo(p) === "proximo"
  ).length;
  document.getElementById("resumoConcluidos").textContent = allProcessos.filter(
    (p) => p.registro_concluido
  ).length;

  const tbody = document.getElementById("tabelaProcessos");
  tbody.innerHTML = "";

  if (!lista.length) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center text-muted py-4">Nenhum processo encontrado.</td></tr>';
    return;
  }

  lista.forEach((p) => {
    const cartorio = cartoriosMap[p.cartorio_id];
    const responsavel = profilesMap[p.responsavel_acompanhamento_id];
    const prazo = prazoAtual(p);
    const status = statusPrazo(p);
    const statusLabel = { vencido: "Vencido", proximo: "Próximo", em_dia: "Em dia" }[status] || "";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="fw-semibold">${escapeHtml(p.identificacao)}</div>
        ${p.cliente ? `<div class="text-muted small">${escapeHtml(p.cliente)}</div>` : ""}
      </td>
      <td>${escapeHtml(p.tipo)}</td>
      <td>${cartorio ? escapeHtml(cartorio.nome) : "-"}</td>
      <td>${p.matricula || "-"}</td>
      <td>${responsavel ? escapeHtml(responsavel.nome) : "-"}</td>
      <td>${
        prazo
          ? formatDate(prazo) + (status ? ` <span class="badge badge-${status}">${statusLabel}</span>` : "")
          : "-"
      }</td>
      <td><span class="badge text-bg-secondary">${situacao(p)}</span></td>
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

init();
