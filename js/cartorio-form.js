let editandoId = null;

async function init() {
  const auth = await requireAuth();
  if (!auth) return;

  editandoId = getQueryParam("id");

  if (editandoId) {
    document.getElementById("tituloPagina").textContent = "Editar cartório";
    try {
      const c = await fetchCartorio(editandoId);
      document.getElementById("cartorioId").value = c.id;
      document.getElementById("nome").value = c.nome;
      document.getElementById("ativo").checked = !!c.ativo;
    } catch (err) {
      showAlert("Erro ao carregar cartório: " + err.message);
    }
  }
}

document.getElementById("cartorioForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("btnSalvar");
  btn.disabled = true;

  const nome = document.getElementById("nome").value.trim();
  if (!nome) {
    showAlert("Preencha o nome do cartório.");
    btn.disabled = false;
    return;
  }

  try {
    await saveCartorio({
      id: editandoId || null,
      nome,
      ativo: document.getElementById("ativo").checked,
    });
    window.location.href = "cartorios.html";
  } catch (err) {
    showAlert("Erro ao salvar cartório: " + err.message);
    btn.disabled = false;
  }
});

init();
