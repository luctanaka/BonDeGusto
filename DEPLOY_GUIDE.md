# Guia de Deploy no Vercel

## Pré-requisitos

1. Conta no GitHub
2. Conta no Vercel (https://vercel.com)
3. Conta no MongoDB Atlas (para o banco de dados)

## Passos para Deploy

### 1. Preparar o Repositório GitHub

1. **Criar repositório no GitHub:**
   - Acesse https://github.com
   - Clique em "New repository"
   - Nome: `bondegusto-restaurant`
   - Deixe como público ou privado (sua escolha)
   - NÃO inicialize com README (já temos arquivos)

2. **Subir o código para o GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Bondegusto Restaurant"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/bondegusto-restaurant.git
   git push -u origin main
   ```

### 2. Configurar MongoDB Atlas

1. **Criar cluster no MongoDB Atlas:**
   - Acesse https://cloud.mongodb.com
   - Crie uma conta gratuita
   - Crie um novo cluster (M0 - Free)
   - Configure o usuário do banco
   - Adicione seu IP à whitelist (ou 0.0.0.0/0 para acesso global)

2. **Obter string de conexão:**
   - Clique em "Connect" no seu cluster
   - Escolha "Connect your application"
   - Copie a string de conexão
   - Exemplo: `mongodb+srv://usuario:senha@cluster.mongodb.net/`

### 3. Deploy no Vercel

1. **Conectar GitHub ao Vercel:**
   - Acesse https://vercel.com
   - Faça login com GitHub
   - Clique em "New Project"
   - Selecione seu repositório `bondegusto-restaurant`

2. **Configurar variáveis de ambiente no Vercel:**
   - Na página do projeto, vá em "Settings" > "Environment Variables"
   - Adicione as seguintes variáveis:

   **Para o Frontend:**
   ```
   REACT_APP_API_URL = https://bondegusto.com.br/api
   REACT_APP_API_TIMEOUT = 15000
   REACT_APP_NAME = Bondegusto Restaurant
   REACT_APP_VERSION = 1.0.0
   REACT_APP_ENVIRONMENT = production
   REACT_APP_ENABLE_REVIEWS = true
   REACT_APP_ENABLE_RESERVATIONS = true
   REACT_APP_ENABLE_ANALYTICS = true
   REACT_APP_ENABLE_HTTPS = true
   REACT_APP_CORS_ENABLED = true
   ```

   **Para o Backend:**
   ```
   NODE_ENV = production
   MONGODB_URI = sua_string_de_conexao_mongodb_atlas
   JWT_SECRET = sua_chave_secreta_jwt_muito_segura
   PORT = 3000
   ```

3. **Configurações de Build:**
   - Framework Preset: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

4. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build completar
   - Seu site estará disponível em `https://SEU_PROJETO.vercel.app`

### 4. Configurações Pós-Deploy

1. **Configurar domínio personalizado:**
   - Após o primeiro deploy, configure o domínio bondegusto.com.br
   - A variável `REACT_APP_API_URL` já está configurada para `https://bondegusto.com.br/api`
   - Siga as instruções da seção "Configurar Domínio Personalizado" abaixo

2. **Testar funcionalidades:**
   - Acesse o site
   - Teste o cardápio
   - Teste o sistema de avaliações
   - Verifique o painel administrativo

### 5. Configurar Domínio Personalizado (bondegusto.com.br)

1. **Adicionar domínio no Vercel:**
   - No dashboard do Vercel, vá em "Settings" > "Domains"
   - Clique em "Add Domain"
   - Digite: `bondegusto.com.br`
   - Clique em "Add"

2. **Configurar DNS no seu provedor de domínio:**
   - Acesse o painel do seu provedor de domínio (onde você registrou bondegusto.com.br)
   - Vá para as configurações de DNS
   - Adicione os seguintes registros:

   **Para o domínio principal (bondegusto.com.br):**
   ```
   Tipo: A
   Nome: @
   Valor: 76.76.19.61
   TTL: 3600
   ```

   **Para www (www.bondegusto.com.br):**
   ```
   Tipo: CNAME
   Nome: www
   Valor: cname.vercel-dns.com
   TTL: 3600
   ```

3. **Verificar configuração:**
   - Aguarde a propagação DNS (pode levar até 48 horas)
   - No Vercel, você verá um status "Valid Configuration" quando estiver funcionando
   - Teste acessando https://bondegusto.com.br

4. **Configurar redirecionamento (opcional):**
   - Configure www.bondegusto.com.br para redirecionar para bondegusto.com.br
   - Ou vice-versa, conforme sua preferência

## Estrutura de Arquivos Criada

- `vercel.json` - Configuração do Vercel para fullstack
- `.env.production` - Variáveis de ambiente para produção
- `.gitignore` - Arquivos a serem ignorados pelo Git
- `DEPLOY_GUIDE.md` - Este guia

## Comandos Úteis

```bash
# Instalar dependências
npm install

# Rodar localmente
npm start

# Build para produção
npm run build

# Rodar backend localmente
cd backend
npm run dev
```

## Troubleshooting

### Erro de CORS
- Verifique se `REACT_APP_API_URL` está correto
- Confirme as configurações de CORS no backend

### Erro de Banco de Dados
- Verifique a string de conexão MongoDB
- Confirme se o IP está na whitelist do MongoDB Atlas

### Build Falha
- Verifique se todas as dependências estão no `package.json`
- Confirme se não há erros de sintaxe no código

## Suporte

Se encontrar problemas:
1. Verifique os logs no Vercel Dashboard
2. Teste localmente primeiro
3. Confirme todas as variáveis de ambiente