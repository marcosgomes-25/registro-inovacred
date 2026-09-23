# Controle de Processos — versão HTML + Supabase (sem custo)

Reescrita do sistema original (que era em Flask/Python) usando apenas HTML, CSS e
JavaScript puro no navegador, conectando direto no Supabase (banco de dados +
autenticação). Sem servidor Python, sem Docker, sem Railway — hospedagem 100%
gratuita no GitHub Pages.

## 1. Criar um projeto Supabase NOVO e separado

Para não mexer em nenhum banco que você já tem, crie um projeto **novo** e
isolado só para este sistema (o plano gratuito permite até 2 projetos):

1. Em supabase.com, clique em **New Project**.
2. Dê um nome diferente do seu outro projeto (ex.: `cartorio-producao`) e
   escolha uma senha de banco nova.
3. Espere o projeto terminar de ser criado.

Como esse banco nasce vazio, não é preciso apagar nada. Confirme, no canto
superior do painel, que você está dentro do projeto **novo** — não do antigo —
e então abra **SQL Editor → New query**, copie todo o conteúdo do arquivo
**`schema.sql`** (nesta pasta) e rode. Isso cria as tabelas
(`profiles`, `cartorios`, `processos`, `exigencias`) já com as regras de
segurança (RLS) configuradas. Nenhum comando aqui toca em outro projeto seu.

## 2. Criar o primeiro usuário (administrador)

1. No painel do Supabase: **Authentication → Users → Add user**.
2. Preencha e-mail e senha, e marque **"Auto Confirm User"** (assim ele já pode
   logar sem precisar confirmar e-mail).
3. Volte no **SQL Editor** e rode (trocando pelo e-mail que você usou):
   ```sql
   update public.profiles set is_admin = true where email = 'seu@email.com';
   ```

Usuários seguintes podem ser criados do mesmo jeito (Authentication → Add user) e
depois ajustados na tela "Usuários" do próprio sistema (nome, admin, ativo).

## 3. Conectar o site ao seu projeto Supabase

No painel do Supabase: **Project Settings → API**. Copie:
- **Project URL**
- **anon public key** (não a `service_role`, essa nunca deve aparecer no site)

Abra `js/supabaseClient.js` e cole nos lugares indicados:

```js
const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
const SUPABASE_ANON_KEY = "sua-anon-key-aqui";
```

## 4. Testar localmente antes de publicar

Navegadores bloqueiam alguns recursos ao abrir arquivos HTML direto
(`file://...`). Rode um servidor local simples dentro da pasta do projeto:

```bash
python3 -m http.server 8080
```

Depois acesse **http://localhost:8080** e faça login com o usuário que você criou.

## 5. Subir para o GitHub

```bash
git init
git add -A
git commit -m "Versão HTML + Supabase"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

(Se for usar o mesmo repositório do projeto Flask antigo, crie uma branch nova
para não misturar os dois projetos, ou crie um repositório separado.)

## 6. Publicar no GitHub Pages (gratuito)

1. No repositório no GitHub: **Settings → Pages**.
2. Em "Source", escolha **Deploy from a branch**.
3. Branch: `main`, pasta: `/ (root)`. Salvar.
4. Em alguns minutos o GitHub mostra o link do site, algo como:
   `https://seu-usuario.github.io/seu-repositorio/`

Pronto — o site fica no ar de graça, e o banco de dados é o Supabase (também
gratuito no plano básico). Qualquer `git push` atualiza o site automaticamente.

## Estrutura do projeto

```
index.html              → redireciona pro login ou pra lista de processos
login.html               → tela de login
processos.html            → lista de processos + filtros + resumo
processo-form.html        → novo/editar processo
processo-detalhe.html     → detalhe do processo, exigências e conclusão
exigencia-form.html       → nova/editar exigência
cartorios.html             → lista de cartórios
cartorio-form.html         → novo/editar cartório
usuarios.html              → lista de usuários (admin)
usuario-form.html          → editar usuário (admin)
js/supabaseClient.js       → configuração da conexão (preencher URL/chave)
js/helpers.js              → cálculo de prazo/situação do processo
js/api.js                  → funções de leitura/gravação no Supabase
js/auth.js                 → login, sessão e menu de navegação
schema.sql                 → script para criar as tabelas no Supabase
```

## Observações importantes

- A chave usada no `supabaseClient.js` é a **anon public key**, que é segura de
  expor no front-end — ela só permite o que as regras de RLS liberarem (por
  isso o `schema.sql` já vem com essas regras configuradas).
- Criar/excluir logins (e-mail e senha) é feito no painel do Supabase, não no
  site. O site só edita nome, permissão de admin e se o usuário está ativo.
- Se quiser trocar o limite de "prazo próximo do vencimento" (hoje 5 dias),
  edite a constante `DIAS_ALERTA_PRAZO` em `js/helpers.js`.
