async function init() {
  const auth = await requireAuth();
  if (!auth) return;

  try {
    const cartorios = await fetchCartorios();
    const tbody = document.getElementById("tabelaCartorios");
    tbody.innerHTML = "";

    if (!cartorios.length) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted py-4">Nenhum cartório cadastrado.</td></tr>';
      return;
    }

    cartorios.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(c.nome)}</td>
        <td>${c.ativo ? '<span class="badge text-bg-success">Sim</span>' : '<span class="badge text-bg-secondary">Não</span>'}</td>
        <td class="text-end">
          <a href="cartorio-form.html?id=${c.id}" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-pencil"></i> Editar
          </a>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    showAlert("Erro ao carregar cartórios: " + err.message);
  }
}

init();
