// ==========================================================
// Funções auxiliares: datas, prazo do processo e situação.
// Equivalentes às @property do models.py do projeto original.
// ==========================================================

// Ajuste aqui se quiser mudar quantos dias antes do vencimento
// o prazo aparece como "próximo" (amarelo).
const DIAS_ALERTA_PRAZO = 5;

function parseDateOnly(d) {
  if (!d) return null;
  // "d" vem do Supabase como "YYYY-MM-DD"
  const [ano, mes, dia] = d.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function formatDate(d) {
  const dt = parseDateOnly(d);
  if (!dt) return "-";
  return dt.toLocaleDateString("pt-BR");
}

function exigenciaPendente(processo) {
  const lista = processo.exigencias || [];
  if (!lista.length) return null;
  // pega a exigência pendente mais recente (mesma lógica do backend: desc por data)
  const pendentes = lista
    .filter((e) => !e.cumprida)
    .sort((a, b) => (a.data_exigencia < b.data_exigencia ? 1 : -1));
  return pendentes[0] || null;
}

function prazoAtual(processo) {
  const pendente = exigenciaPendente(processo);
  if (pendente && pendente.novo_prazo) return pendente.novo_prazo;
  return processo.data_limite;
}

function statusPrazo(processo) {
  if (processo.registro_concluido) return null;
  const prazo = prazoAtual(processo);
  if (!prazo) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const prazoDate = parseDateOnly(prazo);
  const dias = Math.round((prazoDate - hoje) / (1000 * 60 * 60 * 24));
  if (dias < 0) return "vencido";
  if (dias <= DIAS_ALERTA_PRAZO) return "proximo";
  return "em_dia";
}

function situacao(processo) {
  if (processo.registro_concluido) return "Concluído";
  if (exigenciaPendente(processo)) return "Exigência pendente";
  if (processo.em_analise) return "Em análise";
  return "Protocolado";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
