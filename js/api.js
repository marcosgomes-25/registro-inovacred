// ==========================================================
// Funções de acesso aos dados no Supabase.
// ==========================================================

async function fetchProfiles() {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, nome, email, is_admin, ativo")
    .order("nome");
  if (error) throw error;
  return data;
}

async function fetchCartorios(onlyAtivos = false) {
  let q = supabaseClient.from("cartorios").select("*").order("nome");
  if (onlyAtivos) q = q.eq("ativo", true);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

async function fetchCartorio(id) {
  const { data, error } = await supabaseClient
    .from("cartorios")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

async function saveCartorio(cartorio) {
  if (cartorio.id) {
    const { error } = await supabaseClient
      .from("cartorios")
      .update({ nome: cartorio.nome, ativo: cartorio.ativo })
      .eq("id", cartorio.id);
    if (error) throw error;
  } else {
    const { error } = await supabaseClient
      .from("cartorios")
      .insert({ nome: cartorio.nome, ativo: cartorio.ativo });
    if (error) throw error;
  }
}

async function fetchProcessos() {
  const { data, error } = await supabaseClient
    .from("processos")
    .select("*, exigencias(*)")
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data;
}

async function fetchProcesso(id) {
  const { data, error } = await supabaseClient
    .from("processos")
    .select("*, exigencias(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

async function saveProcesso(p, userId) {
  const payload = {
    identificacao: p.identificacao,
    tipo: p.tipo,
    cliente: p.cliente || null,
    imovel: p.imovel || null,
    observacoes: p.observacoes || null,
    data_protocolo: p.data_protocolo || null,
    numero_protocolo: p.numero_protocolo || null,
    cartorio_id: p.cartorio_id || null,
    matricula: p.matricula || null,
    data_limite: p.data_limite || null,
    responsavel_acompanhamento_id: p.responsavel_acompanhamento_id || null,
    em_analise: !!p.em_analise,
  };

  if (p.id) {
    const { error } = await supabaseClient.from("processos").update(payload).eq("id", p.id);
    if (error) throw error;
    return p.id;
  } else {
    payload.criado_por_id = userId;
    const { data, error } = await supabaseClient.from("processos").insert(payload).select("id").single();
    if (error) throw error;
    return data.id;
  }
}

async function salvarConclusao(processoId, conclusao) {
  const { error } = await supabaseClient
    .from("processos")
    .update({
      registro_concluido: !!conclusao.registro_concluido,
      data_registro: conclusao.data_registro || null,
      numero_registro_averbacao: conclusao.numero_registro_averbacao || null,
      matricula_atualizada_recebida: !!conclusao.matricula_atualizada_recebida,
      contrato_registrado_recebido: !!conclusao.contrato_registrado_recebido,
      documento_enviado_caixa: !!conclusao.documento_enviado_caixa,
    })
    .eq("id", processoId);
  if (error) throw error;
}

async function excluirProcesso(id) {
  const { error } = await supabaseClient.from("processos").delete().eq("id", id);
  if (error) throw error;
}

async function fetchExigencia(id) {
  const { data, error } = await supabaseClient.from("exigencias").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

async function saveExigencia(e) {
  const payload = {
    processo_id: e.processo_id,
    data_exigencia: e.data_exigencia || null,
    descricao: e.descricao,
    responsavel_solucao_id: e.responsavel_solucao_id || null,
    documento_necessario: e.documento_necessario || null,
    data_envio_solucao: e.data_envio_solucao || null,
    cumprida: !!e.cumprida,
    novo_prazo: e.novo_prazo || null,
  };
  if (e.id) {
    const { error } = await supabaseClient.from("exigencias").update(payload).eq("id", e.id);
    if (error) throw error;
  } else {
    const { error } = await supabaseClient.from("exigencias").insert(payload);
    if (error) throw error;
  }
}

async function excluirExigencia(id) {
  const { error } = await supabaseClient.from("exigencias").delete().eq("id", id);
  if (error) throw error;
}

async function updateProfile(id, dados) {
  const { error } = await supabaseClient
    .from("profiles")
    .update({ nome: dados.nome, is_admin: !!dados.is_admin, ativo: !!dados.ativo })
    .eq("id", id);
  if (error) throw error;
}
