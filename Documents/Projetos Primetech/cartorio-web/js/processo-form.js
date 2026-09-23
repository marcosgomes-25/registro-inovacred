let editandoId = null;

async function init() {
  const auth = await requireAuth();
  if (!auth) return;

  editandoId = getQueryParam("id");

  try {
    const [cartorios, profiles] = await Promise.all([fetchCartorios(true), fetchProfiles()]);

    const selCartorio = document.getElementById("cartorio_id");
    cartorios.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.nome;
      selCartorio.appendChild(opt);
    });

    const selResp = document.getElementById("responsavel_acompanhamento_id");
    profiles
      .filter((p) => p.ativo)
      .forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.nome;
        selResp.appendChild(opt);
      });

    if (editandoId) {
      document.getElementById("tituloPagina").textContent = "Editar processo";
      const p = await fetchProcesso(editandoId);
      document.getElementById("processoId").value = p.id;
      document.getElementById("identificacao").value = p.identificacao || "";
      document.getElementById("tipo").value = p.tipo || "Registro";
      document.getElementById("responsavel_acompanhamento_id").value = p.responsavel_acompanhamento_id || "";
      document.getElementById("cliente").value = p.cliente || "";
      document.getElementById("imovel").value = p.imovel || "";
      document.getElementById("data_protocolo").value = p.data_protocolo || "";
      document.getElementById("numero_protocolo").value = p.numero_protocolo || "";
      document.getElementById("cartorio_id").value = p.cartorio_id || "";
      document.getElementById("matricula").value = p.matricula || "";
      document.getElementById("banco").value = p.banco || "";
      document.getElementById("data_limite").value = p.data_limite || "";
      document.getElementById("em_analise").checked = !!p.em_analise;
      document.getElementById("observacoes").value = p.observacoes || "";
    }
  } catch (err) {
    showAlert("Erro ao carregar dados do formulário: " + err.message);
  }
}

document.getElementById("processoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("btnSalvar");
  btn.disabled = true;

  const identificacao = document.getElementById("identificacao").value.trim();
  if (!identificacao) {
    showAlert("Preencha a identificação do processo.");
    btn.disabled = false;
    return;
  }

  const payload = {
    id: editandoId || null,
    identificacao,
    tipo: document.getElementById("tipo").value,
    responsavel_acompanhamento_id: document.getElementById("responsavel_acompanhamento_id").value || null,
    cliente: document.getElementById("cliente").value.trim(),
    imovel: document.getElementById("imovel").value.trim(),
    data_protocolo: document.getElementById("data_protocolo").value || null,
    numero_protocolo: document.getElementById("numero_protocolo").value.trim(),
    cartorio_id: document.getElementById("cartorio_id").value || null,
    matricula: document.getElementById("matricula").value.trim(),
    banco: document.getElementById("banco").value.trim(),
    data_limite: document.getElementById("data_limite").value || null,
    em_analise: document.getElementById("em_analise").checked,
    observacoes: document.getElementById("observacoes").value.trim(),
  };

  try {
    const id = await saveProcesso(payload, currentUser.id);
    window.location.href = `processo-detalhe.html?id=${editandoId || id}`;
  } catch (err) {
    showAlert("Erro ao salvar processo: " + err.message);
    btn.disabled = false;
  }
});

init();
