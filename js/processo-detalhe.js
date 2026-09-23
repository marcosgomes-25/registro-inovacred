let processoId = null;
let processoAtual = null;
let profilesMap = {};
let cartoriosMap = {};

async function init() {
  const auth = await requireAuth();
  if (!auth) return;

  processoId = getQueryParam("id");
  if (!processoId) {
    window.location.href = "processos.html";
    return;
  }

  try {
    const [profiles, cartorios] = await Promise.all([fetchProfiles(), fetchCartorios()]);
    profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
    cartoriosMap = Object.fromEntries(cartorios.map((c) => [c.id, c]));

    processoAtual = await fetchProcesso(processoId);
    render();
  } catch (err) {
    showAlert("Erro ao carregar processo: " + err.message);
  }
}

function render() {
  const p = processoAtual;
  const cartorio = cartoriosMap[p.cartorio_id];
  const responsavel = profilesMap[p.responsavel_acompanhamento_id];

  document.getElementById("nomeProcesso").textContent = p.identificacao;
  document.getElementById("situacaoBadge").textContent = situacao(p);
  document.getElementById("subtituloProcesso").textContent = [p.tipo, p.cliente].filter(Boolean).join(" · ");
  document.getElementById("btnEditar").href = `processo-form.html?id=${p.id}`;
  document.getElementById("btnNovaExigencia").href = `exigencia-form.html?processoId=${p.id}`;

  document.getElementById("dlEntrada").innerHTML = `
    <dt class="col-sm-5">Data de protocolo</dt><dd class="col-sm-7">${formatDate(p.data_protocolo)}</dd>
    <dt class="col-sm-5">Nº do protocolo/prenotação</dt><dd class="col-sm-7">${p.numero_protocolo || "-"}</dd>
    <dt class="col-sm-5">Cartório</dt><dd class="col-sm-7">${cartorio ? escapeHtml(cartorio.nome) : "-"}</dd>
    <dt class="col-sm-5">Matrícula</dt><dd class="col-sm-7">${p.matricula || "-"}</dd>
    <dt class="col-sm-5">Data limite / próximo prazo</dt><dd class="col-sm-7">${formatDate(p.data_limite)}</dd>
    <dt class="col-sm-5">Responsável pelo acompanhamento</dt><dd class="col-sm-7">${responsavel ? escapeHtml(responsavel.nome) : "-"}</dd>
    <dt class="col-sm-5">Em análise</dt><dd class="col-sm-7">${p.em_analise ? '<span class="badge text-bg-info">Sim</span>' : "Não"}</dd>
  `;

  document.getElementById("observacoesBox").innerHTML = p.observacoes
    ? `<hr><div class="small text-muted">Observações</div><div>${escapeHtml(p.observacoes)}</div>`
    : "";

  document.getElementById("registro_concluido").checked = !!p.registro_concluido;
  document.getElementById("data_registro").value = p.data_registro || "";
  document.getElementById("numero_registro_averbacao").value = p.numero_registro_averbacao || "";
  document.getElementById("matricula_atualizada_recebida").checked = !!p.matricula_atualizada_recebida;
  document.getElementById("contrato_registrado_recebido").checked = !!p.contrato_registrado_recebido;
  document.getElementById("documento_enviado_caixa").checked = !!p.documento_enviado_caixa;

  const tbody = document.getElementById("tabelaExigencias");
  tbody.innerHTML = "";
  const exigencias = [...(p.exigencias || [])].sort((a, b) => (a.data_exigencia < b.data_exigencia ? 1 : -1));

  if (!exigencias.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">Nenhuma exigência registrada.</td></tr>';
    return;
  }

  exigencias.forEach((e) => {
    const resp = profilesMap[e.responsavel_solucao_id];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDate(e.data_exigencia)}</td>
      <td>${escapeHtml(e.descricao)}</td>
      <td>${resp ? escapeHtml(resp.nome) : "-"}</td>
      <td>${e.documento_necessario || "-"}</td>
      <td>${formatDate(e.data_envio_solucao)}</td>
      <td>${e.cumprida ? '<span class="badge text-bg-success">Sim</span>' : '<span class="badge text-bg-warning">Pendente</span>'}</td>
      <td>${formatDate(e.novo_prazo)}</td>
      <td class="text-end">
        <a href="exigencia-form.html?processoId=${p.id}&exigenciaId=${e.id}" class="btn btn-outline-primary btn-sm"><i class="bi bi-pencil"></i></a>
        <button class="btn btn-outline-danger btn-sm" data-exigencia-id="${e.id}"><i class="bi bi-trash"></i></button>
      </td>
    `;
    tr.querySelector("button[data-exigencia-id]").addEventListener("click", () => excluirExigenciaHandler(e.id));
    tbody.appendChild(tr);
  });
}

document.getElementById("conclusaoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await salvarConclusao(processoId, {
      registro_concluido: document.getElementById("registro_concluido").checked,
      data_registro: document.getElementById("data_registro").value,
      numero_registro_averbacao: document.getElementById("numero_registro_averbacao").value.trim(),
      matricula_atualizada_recebida: document.getElementById("matricula_atualizada_recebida").checked,
      contrato_registrado_recebido: document.getElementById("contrato_registrado_recebido").checked,
      documento_enviado_caixa: document.getElementById("documento_enviado_caixa").checked,
    });
    processoAtual = await fetchProcesso(processoId);
    render();
    showAlert("Conclusão salva com sucesso.", "success");
  } catch (err) {
    showAlert("Erro ao salvar conclusão: " + err.message);
  }
});

document.getElementById("btnExcluir").addEventListener("click", async () => {
  if (!confirm("Excluir este processo e todas as exigências? Esta ação não pode ser desfeita.")) return;
  try {
    await excluirProcesso(processoId);
    window.location.href = "processos.html";
  } catch (err) {
    showAlert("Erro ao excluir processo: " + err.message);
  }
});

async function excluirExigenciaHandler(id) {
  if (!confirm("Excluir esta exigência?")) return;
  try {
    await excluirExigencia(id);
    processoAtual = await fetchProcesso(processoId);
    render();
  } catch (err) {
    showAlert("Erro ao excluir exigência: " + err.message);
  }
}

init();
