# Catálogo em Nuvem - Fase 1 e 2

Um catálogo de produtos completo que se conecta ao Supabase para gerenciamento em tempo real.

## 🚀 Como Usar

### 1. Configuração do Supabase
1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá para **Table Editor** e crie uma tabela `produtos` com as colunas:
   - `id` (bigint, auto increment, primary key)
   - `nome` (text)
   - `preco` (numeric)
   - `imagem_url` (text)
   - `categoria` (text)
   - `descricao` (text, opcional)
4. Anote sua **URL** e **anon key** (Settings > API)

### 2. Configuração do Código
Nos arquivos `script.js` e `admin.js`, substitua:
- `COLE_SUA_URL_AQUI` pela sua URL do Supabase
- `COLE_SUA_CHAVE_AQUI` pela sua anon key

### 3. Estrutura de Arquivos
```
├── index.html          # Vitrine principal
├── admin.html          # Painel administrativo
├── script.js           # Lógica da vitrine
├── admin.js            # Lógica do painel admin
├── styles.css          # Estilos completos
└── img/                # Pasta para imagens dos produtos
```

## 📁 Arquivos Prontos

### 1. `index.html`
- Vitrine principal com produtos
- Barra de busca e filtros por categoria
- Link para o painel administrativo
- Rodapé com navegação

### 2. `admin.html`
- Formulário completo para cadastro de produtos
- Validação em tempo real
- Status de conexão com o banco
- Instruções de uso

### 3. `script.js`
- Carrega produtos do Supabase
- Formata preços em moeda brasileira (R$)
- Filtragem por categoria e busca
- Tratamento de erros e estados de carregamento

### 4. `admin.js`
- Cadastra novos produtos no Supabase
- Verificação de conexão
- Limpeza de formulário
- Formatação de preços

### 5. `styles.css`
- Design moderno e responsivo
- Animações e efeitos hover
- Layout grid para produtos
- Design diferenciado para o painel admin

## 🎨 Recursos Implementados

### Vitrine (index.html)
✅ Formatação de preço em Real brasileiro  
✅ Filtro por categorias  
✅ Busca em tempo real  
✅ Efeitos hover nos cards  
✅ Responsividade total  
✅ Contador de produtos  
✅ Tratamento de erros  

### Painel Admin (admin.html)
✅ Formulário com validação  
✅ Máscara para preço  
✅ Status de conexão  
✅ Mensagens de feedback  
✅ Limpeza automática após cadastro  
✅ Design moderno centralizado  

### Desafios Implementados
✅ **Desafio 1**: Categoria dos produtos  
✅ **Desafio 2**: CSS profissional com Google Fonts, shadows e hover effects  
✅ **Desafio 3**: Navegação entre páginas (Área do Lojista)  

## 📝 Como Testar

1. **Cadastre produtos** via `admin.html`
2. **Verifique a vitrine** em `index.html`
3. **Teste os filtros** e busca
4. **Verifique a responsividade** em diferentes telas

## 🔧 Personalização

- Altere as cores no `:root` do `styles.css`
- Adicione novas categorias no `admin.html`
- Modifique o layout do grid no `styles.css`
- Adicione mais campos no formulário conforme necessário

## 📱 Responsividade
- Desktop: Grid de produtos com 3-4 colunas
- Tablet: 2 colunas
- Mobile: 1 coluna
- Painel admin se adapta a todas as telas

---

**Próximos passos:** Cadastre 15 produtos usando o painel administrativo para completar o Desafio 2 da Fase 2!