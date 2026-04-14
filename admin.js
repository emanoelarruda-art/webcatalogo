// 1. CONFIGURAÇÃO DO BANCO (Mesmo da vitrine)
const supabaseUrl = "https://jrrnycfwdiclebqrdxbi.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impycm55Y2Z3ZGljbGVicXJkeGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzM5MjUsImV4cCI6MjA4OTg0OTkyNX0.fk9vv0A4otYkPeCLuoNaVsI49P3L_7s19zr9_z5Chik";
const banco = window.supabase.createClient(supabaseUrl, supabaseKey);
let produtoEmEdicaoId = null;
let produtosPainelCache = [];

function escapeHtml(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function removerPopupCentral() {
  const popup = document.getElementById("popup-central");
  if (popup) {
    popup.remove();
  }
}

function mostrarPopupCentral({
  titulo,
  mensagem,
  textoConfirmar = "OK",
  textoCancelar,
}) {
  return new Promise((resolve) => {
    removerPopupCentral();

    const overlay = document.createElement("div");
    overlay.id = "popup-central";
    overlay.className = "popup-overlay";

    overlay.innerHTML = `
      <div class="popup-card" role="dialog" aria-modal="true" aria-labelledby="popup-titulo">
        <h3 id="popup-titulo">${escapeHtml(titulo)}</h3>
        <p class="popup-text">${escapeHtml(mensagem)}</p>
        <div class="popup-actions">
          ${
            textoCancelar
              ? `<button type="button" class="popup-btn popup-btn-secundario" id="popup-cancelar">${escapeHtml(
                  textoCancelar
                )}</button>`
              : ""
          }
          <button type="button" class="popup-btn popup-btn-principal" id="popup-confirmar">${escapeHtml(
            textoConfirmar
          )}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const confirmar = overlay.querySelector("#popup-confirmar");
    const cancelar = overlay.querySelector("#popup-cancelar");

    confirmar.addEventListener("click", () => {
      removerPopupCentral();
      resolve(true);
    });

    if (cancelar) {
      cancelar.addEventListener("click", () => {
        removerPopupCentral();
        resolve(false);
      });
    }

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay && cancelar) {
        removerPopupCentral();
        resolve(false);
      }
    });
  });
}

// 2. VERIFICAR ACESSO (Proteção da página admin)
async function verificarAcesso() {
  const {
    data: { user },
  } = await banco.auth.getUser();

  if (!user) {
    await mostrarPopupCentral({
      titulo: "Area restrita",
      mensagem: "Faca login para acessar o painel administrativo.",
      textoConfirmar: "Ir para login",
    });
    window.location.href = "login.html";
    return false;
  } else {
    document.getElementById("nome-usuario").innerText = user.email;
    return true;
  }
}

// 3. LOGOUT
async function sairDoSistema() {
  await banco.auth.signOut();
  window.location.href = "index.html";
}

// 4. VERIFICAR CONEXÃO COM O BANCO
async function verificarConexao() {
  const statusElement = document.getElementById("status-conexao");

  try {
    const { data, error } = await banco
      .from("produtos")
      .select("count", { count: "exact" })
      .limit(1);

    if (error) {
      statusElement.innerHTML =
        '<span class="erro">❌ Erro na conexão: ' + error.message + "</span>";
      statusElement.className = "erro";
    } else {
      statusElement.innerHTML =
        '<span class="sucesso">✅ Conectado com sucesso!</span>';
      statusElement.className = "sucesso";
    }
  } catch (err) {
    statusElement.innerHTML =
      '<span class="erro">❌ Falha na conexão: ' + err.message + "</span>";
    statusElement.className = "erro";
  }
}

// 5. FUNÇÃO DE CADASTRO / ATUALIZAÇÃO
async function cadastrarProduto() {
  // Captura os valores digitados no HTML
  const nomeProduto = document.getElementById("input-nome").value.trim();
  const precoProduto = parseFloat(document.getElementById("input-preco").value);
  const imagemProduto = document.getElementById("input-imagem").value.trim();
  const categoriaProduto = document.getElementById("input-categoria").value;
  const descricaoProduto = document
    .getElementById("input-descricao")
    .value.trim();
  const aviso = document.getElementById("mensagem-aviso");

  // Validação de segurança básica
  if (nomeProduto === "" || isNaN(precoProduto) || precoProduto <= 0) {
    aviso.innerText = "Preencha o nome e um preço válido!";
    aviso.className = "mensagem-status erro";
    return;
  }

  aviso.innerText = "Salvando produto na nuvem...";
  aviso.className = "mensagem-status processando";

  const payloadProduto = {
    nome: nomeProduto,
    preco: precoProduto,
    imagem_url: imagemProduto || "img/placeholder.png",
    categoria: categoriaProduto || null,
    descricao: descricaoProduto || null,
  };

  try {
    let data;
    let error;

    if (produtoEmEdicaoId) {
      ({ data, error } = await banco
        .from("produtos")
        .update(payloadProduto)
        .eq("id", produtoEmEdicaoId)
        .select());
    } else {
      ({ data, error } = await banco
        .from("produtos")
        .insert([payloadProduto])
        .select());
    }

    if (error) {
      throw error;
    }

    aviso.innerText = produtoEmEdicaoId
      ? "Produto atualizado com sucesso!"
      : "Produto cadastrado com sucesso! ID: " + data[0].id;
    aviso.className = "mensagem-status sucesso";

    limparFormulario();
    verificarConexao();
    carregarListaProdutosAdmin();
  } catch (error) {
    aviso.innerText = "Erro ao salvar: " + error.message;
    aviso.className = "mensagem-status erro";
    console.error("Erro detalhado:", error);
  }
}

// 6. FUNÇÃO PARA LIMPAR O FORMULÁRIO
function limparFormulario() {
  document.getElementById("input-nome").value = "";
  document.getElementById("input-preco").value = "";
  document.getElementById("input-imagem").value = "";
  document.getElementById("input-categoria").value = "";
  document.getElementById("input-descricao").value = "";

  produtoEmEdicaoId = null;
  document.querySelector(".botao-principal").innerHTML =
    '<span class="botao-icone">✓</span> Salvar no Banco';

  // Foca no primeiro campo
  document.getElementById("input-nome").focus();
}

async function carregarListaProdutosAdmin() {
  const lista = document.getElementById("lista-produtos-admin");
  const total = document.getElementById("total-produtos-admin");

  if (!lista) {
    return;
  }

  lista.innerHTML = '<p class="lista-carregando">Atualizando lista...</p>';

  const { data, error } = await banco
    .from("produtos")
    .select("id, nome, preco, categoria, imagem_url, descricao")
    .order("id", { ascending: false });

  if (error) {
    lista.innerHTML = `<p class="lista-erro">Erro ao carregar lista: ${escapeHtml(
      error.message
    )}</p>`;
    return;
  }

  produtosPainelCache = data || [];
  total.innerText = produtosPainelCache.length;

  if (produtosPainelCache.length === 0) {
    lista.innerHTML = "<p class='lista-carregando'>Nenhum produto cadastrado.</p>";
    return;
  }

  lista.innerHTML = produtosPainelCache
    .map(
      (produto) => `
      <article class="item-produto-admin">
        <div>
          <h4>${escapeHtml(produto.nome)}</h4>
          <p>${formatarPreco(produto.preco)} • ${escapeHtml(
        produto.categoria || "Sem categoria"
      )}</p>
        </div>
        <div class="acoes-produto-admin">
          <button type="button" class="btn-gerenciar btn-editar" onclick="editarProduto(${produto.id})">Editar</button>
          <button type="button" class="btn-gerenciar btn-excluir" onclick="removerProduto(${produto.id})">Remover</button>
        </div>
      </article>
    `
    )
    .join("");
}

function editarProduto(id) {
  const produto = produtosPainelCache.find((item) => item.id === id);

  if (!produto) {
    return;
  }

  produtoEmEdicaoId = id;

  document.getElementById("input-nome").value = produto.nome || "";
  document.getElementById("input-preco").value = produto.preco || "";
  document.getElementById("input-imagem").value = produto.imagem_url || "";
  document.getElementById("input-categoria").value = produto.categoria || "";
  document.getElementById("input-descricao").value = produto.descricao || "";

  document.querySelector(".botao-principal").innerHTML =
    '<span class="botao-icone">✎</span> Atualizar Produto';

  document.getElementById("mensagem-aviso").innerText =
    "Modo edicao ativado. Ajuste os campos e clique em Atualizar Produto.";
  document.getElementById("mensagem-aviso").className =
    "mensagem-status processando";

  document.getElementById("input-nome").focus();
}

async function removerProduto(id) {
  const confirmado = await mostrarPopupCentral({
    titulo: "Remover produto",
    mensagem: "Essa acao nao pode ser desfeita. Deseja continuar?",
    textoConfirmar: "Sim, remover",
    textoCancelar: "Cancelar",
  });

  if (!confirmado) {
    return;
  }

  const aviso = document.getElementById("mensagem-aviso");

  const { error } = await banco.from("produtos").delete().eq("id", id);

  if (error) {
    aviso.innerText = "Erro ao remover: " + error.message;
    aviso.className = "mensagem-status erro";
    return;
  }

  aviso.innerText = "Produto removido com sucesso.";
  aviso.className = "mensagem-status sucesso";

  if (produtoEmEdicaoId === id) {
    limparFormulario();
  }

  verificarConexao();
  carregarListaProdutosAdmin();
}

// 7. INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", async function () {
  const acessoLiberado = await verificarAcesso();

  if (!acessoLiberado) {
    return;
  }

  verificarConexao();
  carregarListaProdutosAdmin();

  // Adiciona máscara para o preço
  const inputPreco = document.getElementById("input-preco");
  inputPreco.addEventListener("input", function (e) {
    let value = e.target.value.replace(/[^\d.]/g, "");
    const parts = value.split(".");
    if (parts.length > 2) {
      value = parts[0] + "." + parts.slice(1).join("");
    }
    e.target.value = value;
  });

  // Adiciona validação em tempo real
  const form = document.getElementById("form-produto");
  form.addEventListener("submit", function (e) {
    if (!form.checkValidity()) {
      e.preventDefault();
      document.getElementById("mensagem-aviso").innerText =
        "Preencha os campos obrigatórios!";
      document.getElementById("mensagem-aviso").className =
        "mensagem-status erro";
    }
  });
});

// 8. FUNÇÃO AUXILIAR: FORMATAR PREÇO
function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
