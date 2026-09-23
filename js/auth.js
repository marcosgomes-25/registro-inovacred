// ==========================================================
// Autenticação e navbar compartilhados entre as páginas internas.
// Toda página protegida deve chamar requireAuth() ao carregar.
// ==========================================================

let currentUser = null; // sessão do Supabase Auth
let currentProfile = null; // linha correspondente em profiles

async function requireAuth() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
    return null;
  }

  currentUser = session.user;

  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error || !profile) {
    currentProfile = { id: session.user.id, nome: session.user.email, is_admin: false, ativo: true };
  } else {
    currentProfile = profile;
  }

  renderNavbar();
  return { user: currentUser, profile: currentProfile };
}

function renderNavbar() {
  const el = document.getElementById("navbar");
  if (!el) return;

  el.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div class="container-fluid">
        <a class="navbar-brand" href="processos.html">
          <i class="bi bi-building-check"></i> Controle de Processos
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav me-auto">
            <li class="nav-item"><a class="nav-link" href="processos.html">Processos</a></li>
            <li class="nav-item"><a class="nav-link" href="processo-form.html">Novo processo</a></li>
            <li class="nav-item"><a class="nav-link" href="cartorios.html">Cartórios</a></li>
            ${currentProfile.is_admin ? '<li class="nav-item"><a class="nav-link" href="usuarios.html">Usuários</a></li>' : ""}
          </ul>
          <span class="navbar-text me-3">${escapeHtml(currentProfile.nome)}</span>
          <button class="btn btn-outline-light btn-sm" id="btnLogout">Sair</button>
        </div>
      </div>
    </nav>
  `;

  document.getElementById("btnLogout").addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
  });
}

function showAlert(message, type = "danger") {
  const box = document.getElementById("alertBox");
  if (!box) {
    alert(message);
    return;
  }
  box.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${escapeHtml(message)}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}
