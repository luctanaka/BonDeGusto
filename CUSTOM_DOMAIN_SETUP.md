# Configuração do Domínio Personalizado bondegusto.com.br

## Pré-requisitos

- Projeto já deployado no Vercel
- Domínio bondegusto.com.br registrado e sob seu controle
- Acesso ao painel de DNS do seu provedor de domínio

## Passo a Passo

### 1. Adicionar Domínio no Vercel

1. **Acesse o dashboard do Vercel:**
   - Vá para https://vercel.com/dashboard
   - Selecione seu projeto BonDeGusto

2. **Adicionar domínio:**
   - Clique na aba "Settings"
   - No menu lateral, clique em "Domains"
   - Clique no botão "Add"
   - Digite: `bondegusto.com.br`
   - Clique em "Add"

3. **Adicionar subdomínio www (opcional):**
   - Repita o processo para `www.bondegusto.com.br`
   - Isso permitirá que ambos funcionem

### 2. Configurar DNS

**IMPORTANTE:** As configurações de DNS devem ser feitas no painel do seu provedor de domínio (onde você registrou bondegusto.com.br).

#### Registros DNS Necessários:

**Para o domínio principal (bondegusto.com.br):**
```
Tipo: A
Nome: @ (ou deixe em branco)
Valor/Destino: 76.76.19.61
TTL: 3600 (ou 1 hora)
```

**Para o subdomínio www (www.bondegusto.com.br):**
```
Tipo: CNAME
Nome: www
Valor/Destino: cname.vercel-dns.com
TTL: 3600 (ou 1 hora)
```

#### Provedores Comuns:

**Registro.br:**
1. Acesse https://registro.br
2. Faça login na sua conta
3. Vá em "Meus Domínios"
4. Clique em bondegusto.com.br
5. Vá na aba "DNS"
6. Adicione os registros acima

**GoDaddy:**
1. Acesse https://godaddy.com
2. Faça login e vá em "Meus Produtos"
3. Clique em "DNS" ao lado do domínio
4. Adicione os registros acima

**Cloudflare:**
1. Acesse https://cloudflare.com
2. Selecione o domínio bondegusto.com.br
3. Vá na aba "DNS"
4. Adicione os registros acima

### 3. Verificação e Teste

1. **Aguardar propagação:**
   - A propagação DNS pode levar de 15 minutos a 48 horas
   - Normalmente funciona em 1-2 horas

2. **Verificar no Vercel:**
   - Volte ao dashboard do Vercel
   - Em "Settings" > "Domains"
   - Você verá o status "Valid Configuration" quando estiver funcionando

3. **Testar o domínio:**
   - Acesse https://bondegusto.com.br
   - Verifique se o site carrega corretamente
   - Teste as funcionalidades (cardápio, avaliações, etc.)

### 4. Configurações Adicionais

#### Redirecionamento (Opcional)

**Para redirecionar www para o domínio principal:**
1. No Vercel, vá em "Settings" > "Domains"
2. Clique nos três pontos ao lado de www.bondegusto.com.br
3. Selecione "Redirect to bondegusto.com.br"

#### HTTPS/SSL

- O Vercel automaticamente configura SSL/TLS
- Seu site será acessível via HTTPS
- Redirecionamento automático de HTTP para HTTPS

### 5. Atualizar Variáveis de Ambiente

Se ainda não foi feito:

1. **No Vercel:**
   - Vá em "Settings" > "Environment Variables"
   - Atualize `REACT_APP_API_URL` para: `https://bondegusto.com.br/api`

2. **Fazer redeploy:**
   - Vá na aba "Deployments"
   - Clique nos três pontos do último deployment
   - Selecione "Redeploy"

## Troubleshooting

### Domínio não funciona

1. **Verificar DNS:**
   ```bash
   nslookup bondegusto.com.br
   ```
   Deve retornar: 76.76.19.61

2. **Verificar CNAME:**
   ```bash
   nslookup www.bondegusto.com.br
   ```
   Deve retornar: cname.vercel-dns.com

3. **Aguardar mais tempo:**
   - DNS pode levar até 48 horas para propagar

### Erro de SSL

- Aguarde alguns minutos após a configuração
- O Vercel precisa gerar o certificado SSL
- Normalmente resolve automaticamente

### Site carrega mas API não funciona

1. Verifique se `REACT_APP_API_URL` está correto
2. Faça um redeploy após alterar variáveis de ambiente
3. Verifique se o backend está funcionando

## Ferramentas Úteis

- **Verificar propagação DNS:** https://dnschecker.org
- **Teste de SSL:** https://www.ssllabs.com/ssltest/
- **Verificar domínio:** https://whois.net

## Contatos de Suporte

- **Vercel:** https://vercel.com/support
- **Registro.br:** https://registro.br/ajuda/
- **Documentação Vercel:** https://vercel.com/docs/concepts/projects/custom-domains