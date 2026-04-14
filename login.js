// 1. CONFIGURAÇÃO DO BANCO
const supabaseUrl = "https://jrrnycfwdiclebqrdxbi.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impycm55Y2Z3ZGljbGVicXJkeGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzM5MjUsImV4cCI6MjA4OTg0OTkyNX0.fk9vv0A4otYkPeCLuoNaVsI49P3L_7s19zr9_z5Chik";
const banco = window.supabase.createClient(supabaseUrl, supabaseKey);

// 2. Verifica se já está logado ao carregar a página
async function verificarSessaoExistente() {
  const {
    data: { user },
  } = await banco.auth.getUser();

  if (user) {
    // Se já estiver logado, redireciona para admin
    window.location.href = "admin.html";
  }
}

// 3. Alterna entre texto escondido e visível
function mostrarSenha() {
  let inputSenha = document.getElementById("password");
  let btnOlho = document.getElementById("btn-olho");

  if (inputSenha.type === "password") {
    inputSenha.type = "text";
    btnOlho.innerText = "🙈";
  } else {
    inputSenha.type = "password";
    btnOlho.innerText = "👁️";
  }
}

// 4. Event Listener para tecla Enter
document.addEventListener("DOMContentLoaded", function () {
  const inputSenha = document.getElementById("password");
  const inputEmail = document.getElementById("email");

  inputSenha.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      fazerLogin();
    }
  });

  inputEmail.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      inputSenha.focus();
    }
  });

  // Verifica se já está logado
  verificarSessaoExistente();
});

// 5. Função de Login
async function fazerLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("mensagem");
  const btn = document.getElementById("btn-entrar");

  // Validação básica
  if (!email || !password) {
    msg.innerText = "Preencha todos os campos!";
    msg.style.color = "#dc2626";
    return;
  }

  // Efeito de carregamento
  btn.innerText = "Verificando...";
  btn.disabled = true;
  msg.innerText = "";

  // Comando que tenta logar no Supabase
  const { data, error } = await banco.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    msg.innerText = "Acesso Negado: " + error.message;
    msg.style.color = "#dc2626";
    btn.innerText = "Entrar no Painel";
    btn.disabled = false;
  } else {
    msg.innerText = "Acesso concedido! Redirecionando...";
    msg.style.color = "#16a34a";
    setTimeout(() => {
      window.location.href = "admin.html";
    }, 1000);
  }
}
