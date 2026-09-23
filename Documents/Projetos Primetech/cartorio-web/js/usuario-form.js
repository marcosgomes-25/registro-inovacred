let editandoId = null;

async function init() {
  const auth = await requireAuth();
  if (!auth) return;

  if (!auth.profile.is_admin) {
    document.querySelector(".container-fluid").innerHTML =
      '<div class="alert alert-danger mt-4">Você não tem permissão para acessar esta página.</div>';
    return;
  }

  editandoId = getQueryParam("id");
  if (!editandoId) {
    window.location.href = "usuarios.html";
    return;
  }

  try {
    const usuarios = await fetchProfiles();
    const u = usuarios.find((x) => x.id === editandoId);
    if (!u) {
      showAlert("Usuário não encontrado.");
      return;
    }
    document.getElementById("usuarioId").value = u.id;
    document.getElementById("nome").value = u.nome;
    document.getElementById("email").value = u.email || "";
    document.getElementById("is_admin").checked = !!u.is_admin;
    document.getElementById("ativo").checked = !!u.ativo;
  } catch (err) {
    showAlert("Erro ao carregar usuário: " + err.message);
  }
}

document.getElementById("usuarioForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("btnSalvar");
  btn.disabled = true;

  const nome = document.getElementById("nome").value.trim();
  if (!nome) {
    showAlert("Preencha o nome.");
    btn.disabled = false;
    return;
  }

  try {
    await updateProfile(editandoId, {
      nome,
      is_admin: document.getElementById("is_admin").checked,
      ativo: document.getElementById("ativo").checked,
    });
    window.location.href = "usuarios.html";
  } catch (err) {
    showAlert("Erro ao salvar usuário: " + err.message);
    btn.disabled = false;
  }
});

init();
