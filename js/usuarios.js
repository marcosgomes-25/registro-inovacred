async function init() {
  const auth = await requireAuth();
  if (!auth) return;

  if (!auth.profile.is_admin) {
    document.querySelector(".container-fluid").innerHTML =
      '<div class="alert alert-danger mt-4">Você não tem permissão para acessar esta página.</div>';
    return;
  }

  try {
    const usuarios = await fetchProfiles();
    const tbody = document.getElementById("tabelaUsuarios");
    tbody.innerHTML = "";

    usuarios.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(u.nome)}</td>
        <td>${escapeHtml(u.email || "-")}</td>
        <td>${u.is_admin ? '<span class="badge text-bg-primary">Sim</span>' : "Não"}</td>
        <td>${u.ativo ? '<span class="badge text-bg-success">Sim</span>' : '<span class="badge text-bg-secondary">Não</span>'}</td>
        <td class="text-end">
          <a href="usuario-form.html?id=${u.id}" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-pencil"></i> Editar
          </a>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    showAlert("Erro ao carregar usuários: " + err.message);
  }
}

init();
