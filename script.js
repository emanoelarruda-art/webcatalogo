// 1. CONFIGURAÇÃO DO BANCO DE DADOS
const supabaseUrl = "https://jrrnycfwdiclebqrdxbi.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impycm55Y2Z3ZGljbGVicXJkeGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzM5MjUsImV4cCI6MjA4OTg0OTkyNX0.fk9vv0A4otYkPeCLuoNaVsI49P3L_7s19zr9_z5Chik";

// Inicia a conexão
const banco = window.supabase.createClient(supabaseUrl, supabaseKey);
let produtosCache = [];

function escapeHtml(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fecharModalDetalhes() {
  const modal = document.getElementById("modal-detalhes");
  if (modal) {
    modal.remove();
  }
}

function abrirModalDetalhes(produto) {
  fecharModalDetalhes();

  const precoFormatado = formatarPreco(produto.preco);
  const categoria = produto.categoria || "Sem categoria";
  const imagem = produto.imagem_url || "img/placeholder.png";
  const descricao = produto.descricao || "Produto sem descricao adicional.";

  const modal = document.createElement("div");
  modal.id = "modal-detalhes";
  modal.className = "popup-overlay";

  modal.innerHTML = `
    <div class="popup-card popup-detalhes" role="dialog" aria-modal="true" aria-labelledby="titulo-modal-detalhes">
      <button class="popup-close" type="button" onclick="fecharModalDetalhes()" aria-label="Fechar detalhes">x</button>
      <div class="popup-image-wrap">
        <img src="${escapeHtml(imagem)}" alt="${escapeHtml(
    produto.nome
  )}" onerror="this.src='img/placeholder.png'" />
      </div>
      <div class="popup-content">
        <p class="popup-chip">${escapeHtml(categoria)}</p>
        <h3 id="titulo-modal-detalhes">${escapeHtml(produto.nome)}</h3>
        <p class="popup-price">${precoFormatado}</p>
        <p class="popup-text">${escapeHtml(descricao)}</p>
      </div>
    </div>
  `;

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      fecharModalDetalhes();
    }
  });

  document.body.appendChild(modal);
}

// 2. FUNÇÃO PARA BUSCAR E DESENHAR OS PRODUTOS
async function carregarCatalogo() {
  const vitrine = document.getElementById("vitrine");
  const contador = document.getElementById("contador-produtos");

  // Mostra estado de carregamento
  vitrine.innerHTML = `
    <div class="carregando">
      <div class="spinner"></div>
      <p>Buscando produtos na nuvem...</p>
    </div>
  `;

  try {
    // Faz um SELECT * na tabela produtos
    let { data: produtos, error } = await banco
      .from("produtos")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    produtosCache = produtos || [];

    // Atualiza contador
    if (contador) {
      contador.textContent = produtos.length;
    }

    if (!produtos || produtos.length === 0) {
      vitrine.innerHTML = `
        <div class="sem-produtos">
          <h3>📭 Nenhum produto encontrado</h3>
          <p>Cadastre produtos através do <a href="admin.html">painel administrativo</a>.</p>
        </div>
      `;
      return;
    }

    // Limpa a vitrine
    vitrine.innerHTML = "";

    // Desenha cada produto na tela
    produtos.forEach((item) => {
      const precoFormatado = formatarPreco(item.preco);
      const categoria = item.categoria || "Sem categoria";
      const imagem = item.imagem_url || "img/placeholder.png";

      const div = document.createElement("article");
      div.className = "card-produto";
      div.dataset.categoria = categoria.toLowerCase().replace(/\s+/g, "-");

      div.innerHTML = `
        <div class="card-imagem-container">
          <img src="${imagem}" alt="${item.nome}" loading="lazy" 
               onerror="this.src='img/placeholder.png'">
          <span class="card-categoria">${categoria}</span>
          ${
            item.descricao
              ? `<div class="card-descricao">${item.descricao}</div>`
              : ""
          }
        </div>
        <div class="card-conteudo">
          <h3 class="card-titulo">${item.nome}</h3>
          <div class="card-info">
            <p class="card-preco">${precoFormatado}</p>
            <button class="card-botao" onclick="verDetalhes(${item.id})">
              <span class="botao-texto">Ver detalhes</span>
              <span class="botao-icone">→</span>
            </button>
          </div>
        </div>
      `;

      vitrine.appendChild(div);
    });

    // Adiciona mensagem de sucesso
    const mensagem = document.createElement("div");
    mensagem.className = "vitrine-mensagem";
    mensagem.innerHTML = `<p>🎉 ${produtos.length} produtos carregados do banco de dados!</p>`;
    vitrine.appendChild(mensagem);
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    vitrine.innerHTML = `
      <div class="erro-carregamento">
        <h3>⚠️ Erro ao carregar produtos</h3>
        <p>${error.message}</p>
        <button onclick="carregarCatalogo()" class="botao-tentar-novamente">
          Tentar novamente
        </button>
      </div>
    `;
  }
}

// 3. FUNÇÃO PARA FORMATAR PREÇO (MOEDA BRASILEIRA)
function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// 4. FUNÇÃO PARA VER DETALHES
function verDetalhes(idProduto) {
  const produto = produtosCache.find((item) => item.id === idProduto);

  if (!produto) {
    return;
  }

  abrirModalDetalhes(produto);
}

// 5. FUNÇÃO PARA FILTRAR POR CATEGORIA (EXTRA)
function filtrarPorCategoria(categoria) {
  const cards = document.querySelectorAll(".card-produto");
  cards.forEach((card) => {
    if (
      categoria === "todos" ||
      card.dataset.categoria === categoria.toLowerCase().replace(/\s+/g, "-")
    ) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

// 6. Roda a função assim que o site abrir
document.addEventListener("DOMContentLoaded", function () {
  carregarCatalogo();

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      fecharModalDetalhes();
    }
  });

  // Adiciona funcionalidade de busca (simples)
  const buscaInput = document.getElementById("busca-produtos");
  if (buscaInput) {
    buscaInput.addEventListener("input", function (e) {
      const termo = e.target.value.toLowerCase();
      const cards = document.querySelectorAll(".card-produto");

      cards.forEach((card) => {
        const titulo = card
          .querySelector(".card-titulo")
          .textContent.toLowerCase();
        const categoria = card
          .querySelector(".card-categoria")
          .textContent.toLowerCase();

        if (titulo.includes(termo) || categoria.includes(termo)) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  }

  // Atualiza ano no rodapé
  const anoRodape = document.getElementById("ano-atual");
  if (anoRodape) {
    anoRodape.textContent = new Date().getFullYear();
  }
});
