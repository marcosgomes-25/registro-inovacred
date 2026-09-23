let processoIdRef = null;
let exigenciaIdRef = null;

async function init() {
  const auth = await requireAuth();
  if (!auth) return;

  processoIdRef = getQueryParam("processoId");
  exigenciaIdRef = getQueryParam("exigenciaId");

  if (!processoIdRef) {
    window.location.href = "processos.html";
    return;
  }

  const voltarUrl = `processo-detalhe.html?id=${processoIdRef}`;
  document.getElementById("btnVoltar").href = voltarUrl;
  document.getElementById("btnCancelar").href = voltarUrl;

  try {
    const profiles = await fetchProfiles();
    const sel = document.getElementById("responsavel_solucao_id");
    profiles
      .filter((p) => p.ativo)
      .forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.nome;
        sel.appendChild(opt);
      });

    const processo = await fetchProcesso(processoIdRef);
    document.getElementById("tituloPagina").textContent =
      (exigenciaIdRef ? "Editar" : "Nova") + " exigência — " + processo.identificacao;

    if (exigenciaIdRef) {
      const e = await fetchExigencia(exigenciaIdRef);
      document.getElementById("exigenciaId").value = e.id;
      document.getElementById("data_exigencia").value = e.data_exigencia || "";
      document.getElementById("responsavel_solucao_id").value = e.responsavel_solucao_id || "";
      document.getElementById("documento_necessario").value = e.documento_necessario || "";
      document.getElementById("descricao").value = e.descricao || "";
      document.getElementById("data_envio_solucao").value = e.data_envio_solucao || "";
      document.getElementById("novo_prazo").value = e.novo_prazo || "";
      document.getElementById("cumprida").checked = !!e.cumprida;
    } else {
      document.getElementById("data_exigencia").value = new Date().toISOString().slice(0, 10);
    }
  } catch (err) {
    showAlert("Erro ao carregar dados: " + err.message);
  }
}

document.getElementById("exigenciaForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("btnSalvar");
  btn.disabled = true;

  const descricao = document.getElementById("descricao").value.trim();
  if (!descricao) {
    showAlert("Preencha a descrição da exigência.");
    btn.disabled = false;
    return;
  }

  const payload = {
    id: exigenciaIdRef || null,
    processo_id: processoIdRef,
    data_exigencia: document.getElementById("data_exigencia").value || null,
    responsavel_solucao_id: document.getElementById("responsavel_solucao_id").value || null,
    documento_necessario: document.getElementById("documento_necessario").value.trim(),
    descricao,
    data_envio_solucao: document.getElementById("data_envio_solucao").value || null,
    novo_prazo: document.getElementById("novo_prazo").value || null,
    cumprida: document.getElementById("cumprida").checked,
  };

  try {
    await saveExigencia(payload);
    window.location.href = `processo-detalhe.html?id=${processoIdRef}`;
  } catch (err) {
    showAlert("Erro ao salvar exigência: " + err.message);
    btn.disabled = false;
  }
});

init();
