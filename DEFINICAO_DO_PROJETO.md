# ShapeScan — Definição do Projeto

> Documento criado em: 15/05/2026  
> Nome oficial definido em: 15/05/2026  
> Status: Rascunho inicial — sujeito a atualizações conforme o projeto evolui

---

## 1. Visão Geral e Conceito

### O que é o app?
Um aplicativo web (e futuramente nativo para iOS) que analisa o biotipo e o shape corporal do usuário usando Inteligência Artificial. Com base nas informações fornecidas, o app entrega recomendações totalmente personalizadas de dieta, treino e acompanhamento de evolução física.

### Por que ele existe?
A maioria das pessoas que quer mudar o corpo não sabe por onde começar. Nutricionistas e personal trainers têm custo alto. O app democratiza o acesso a orientações personalizadas, como se o usuário tivesse um consultor particular no bolso — disponível 24h, acessível e fácil de usar.

### Como funciona em resumo?
1. O usuário faz um cadastro rápido
2. Preenche dados corporais (obrigatório): peso, altura, medidas e objetivo
3. Opcionalmente, envia uma foto do corpo (frente e/ou lado)
4. A IA analisa o biotipo e gera um relatório personalizado
5. O usuário recebe: análise de biotipo, plano alimentar e plano de treinos
6. Pode acompanhar sua evolução ao longo do tempo

---

## 2. Público-Alvo

**Perfil principal:** Adultos (18–45 anos) que querem iniciar ou evoluir na academia, emagrecer, ganhar massa muscular ou simplesmente mudar o corpo e não sabem como começar.

**Características do usuário:**
- Motivado a mudar, mas sem orientação profissional
- Usa o celular como principal ferramenta do dia a dia
- Valoriza praticidade e resultados rápidos
- Pode ou não ter experiência com academia

**Proposta de valor:**
> "Descubra seu biotipo e receba um plano feito para o seu corpo em minutos — sem precisar de nutricionista ou personal."

---

## 3. Sugestões de Nome

Escolher um nome forte é essencial para a Apple Store e para a identidade da marca. Aqui estão opções com diferentes estilos:

| Nome | Estilo | Por que funciona |
|---|---|---|
| **ShapeScan** | Direto, técnico | Transmite a ideia de "escanear o shape" — claro e memorável |
| **BioFit** | ~~Amigável, fitness~~ | ~~Unite biotipo + fitness~~ — **NOME OCUPADO** (3 apps na App Store: BioFit Studios, BioFit Performance, BioFit Online) — evitar |
| **FitType** | Simples, internacional | Remete a tipo físico + fitness, funciona globalmente |
| **CorpoIA** | Brasileiro, moderno | "Corpo" + "IA" (Inteligência Artificial) — identidade clara |
| **ShapeAI** | Tech, moderno | Direto ao ponto, boa presença na App Store |
| **Morphe** | Premium, sofisticado | Do grego "forma/shape" — soa exclusivo |
| **ScanShape** | Descritivo | Variação de ShapeScan — porém já existe app 3D com esse nome (diferente proposta) |

> **Verificado em maio/2026:** `ShapeScan` não tem concorrente direto na App Store. `BioFit` está OCUPADO por múltiplos apps — não usar.

**Recomendação:** `ShapeScan` — nome livre, claro, memorável e funciona em PT-BR e inglês.

---

## 4. Funcionalidades

### MVP — Versão 1 (lançar o mais rápido possível)
O MVP foca em fazer a experiência core funcionar bem, sem distrações.

- [ ] **Tela de boas-vindas** — apresentação do app e proposta de valor
- [ ] **Cadastro/Login** — nome, e-mail, senha
- [ ] **Onboarding** — questionário inicial com dados obrigatórios:
  - Sexo biológico
  - Idade
  - Peso atual
  - Altura
  - Nível de atividade física (sedentário, leve, moderado, intenso)
  - Objetivo principal (emagrecer / ganhar massa / definir / saúde geral)
- [ ] **Upload de foto** — opcional, com aviso claro de privacidade
- [ ] **Tela de perfil** — resumo dos dados do usuário
- [ ] **Análise de biotipo** — resultado gerado por IA (ectomorfo / mesomorfo / endomorfo + variações)
- [ ] **Design responsivo** — funciona em qualquer tamanho de tela (celular, tablet, desktop)

### Versão 2 — Funcionalidades Core
- [ ] **Plano alimentar personalizado** — gerado por IA com base no biotipo e objetivo
- [ ] **Plano de treinos personalizado** — frequência, grupos musculares, exercícios
- [ ] **Relatório completo em PDF** — exportável para salvar ou compartilhar

### Versão 3 — Evolução e Engajamento
- [ ] **Acompanhamento de progresso** — registro de peso e medidas ao longo do tempo com gráficos
- [ ] **Comparação de fotos** — antes e depois (opcional)
- [ ] **Notificações** — lembretes de treino, hidratação e refeições
- [ ] **Banco de receitas** — receitas saudáveis filtradas pelo plano alimentar

### Versão 4 — Monetização Avançada (Premium)
- [ ] **Reavaliação mensal** — nova análise com IA ao registrar progresso
- [ ] **Planos ainda mais detalhados** — semana a semana, com variações
- [ ] **Modo sem anúncios**
- [ ] **Suporte por chat** — assistente IA para tirar dúvidas sobre dieta e treino

### Futuro (pós-Apple Store)
- [ ] **App nativo iOS** — publicação na Apple Store
- [ ] **Suporte a múltiplos idiomas** — inglês, espanhol
- [ ] **Integração com Apple Health / Google Fit**
- [ ] **Marketplace de profissionais** — nutricionistas e personal trainers parceiros (opcional)

---

## 5. Modelo de Negócio — Freemium

### Gratuito (free)
- Cadastro e onboarding
- Análise de biotipo básica
- Plano alimentar simplificado
- Plano de treinos básico (semanal)

### Premium (assinatura mensal)
- Análise completa com IA avançada
- Plano alimentar detalhado com receitas
- Plano de treinos completo (com vídeos futuramente)
- Acompanhamento de progresso com gráficos
- Exportação de planos em PDF
- Reavaliações mensais
- Sem anúncios

**Preço sugerido para pesquisa de mercado:** R$ 19,90 a R$ 39,90/mês

---

## 6. Plataforma e Requisitos

### Fase 1 — Web App (browser)
- Funcionar em qualquer navegador moderno (Chrome, Safari, Firefox)
- Design responsivo: mobile-first (celular em primeiro lugar)
- Não precisa de instalação
- Acessível via link

### Fase 2 — Apple Store (futuro)
- App nativo para iOS (iPhone e iPad)
- Publicação na App Store (exige conta Apple Developer: ~US$ 99/ano)
- Seguir as diretrizes da Apple (especialmente para apps de saúde)

### Requisitos não-funcionais
- Carregamento rápido (menos de 3 segundos)
- Interface simples e intuitiva (o usuário não pode precisar de tutorial)
- Privacidade rigorosa: fotos não devem ser armazenadas permanentemente sem consentimento explícito
- LGPD compliant (Lei Geral de Proteção de Dados — Brasil)

---

## 7. Stack Tecnológico Recomendado

> Esta seção é para orientar desenvolvedores ou para uso com Claude Code.

### Por que essa stack?
Escolhida para ser moderna, amplamente documentada, com boa comunidade e fácil transição para mobile no futuro.

| Camada | Tecnologia | Por quê |
|---|---|---|
| **Frontend (telas)** | Next.js (React) | Roda no browser, responsivo, fácil de escalar para app mobile |
| **Estilo/Design** | Tailwind CSS | Rápido de escrever, responsivo por padrão |
| **Backend (servidor)** | Next.js API Routes | Tudo em um só projeto no início, mais simples |
| **Banco de dados** | Supabase (PostgreSQL) | Gratuito para começar, autenticação pronta, armazenamento de fotos |
| **Inteligência Artificial** | Claude API (Anthropic) | IA poderosa para análise de biotipo, dieta e treinos |
| **Análise de imagem** | Claude Vision API | Analisa foto do usuário para identificar biotipo |
| **Autenticação** | Supabase Auth | Login com e-mail, Google — pronto para usar |
| **Hospedagem** | Vercel | Deploy gratuito, fácil, integrado com Next.js |
| **Pagamentos (futuro)** | Stripe | Padrão de mercado para assinaturas |

### Custo estimado para começar (MVP)
- Supabase: grátis (até certo limite de usuários)
- Vercel: grátis
- Claude API: pago por uso (~US$ 0,003 por análise estimada)
- Domínio: ~R$ 40/ano
- **Total inicial: quase zero até ter usuários reais**

---

## 8. Análise de IA — Como vai funcionar

### Fluxo da análise
1. Usuário envia dados (obrigatório) + foto (opcional)
2. O app envia esses dados para a Claude API
3. A IA analisa e retorna:
   - **Biotipo**: ectomorfo, mesomorfo, endomorfo (ou combinações)
   - **Diagnóstico**: pontos fortes e desafios do biotipo
   - **Plano alimentar**: calorias estimadas, macros (proteína, carb, gordura), dicas
   - **Plano de treinos**: tipo de treino recomendado, frequência, foco muscular
4. O app formata e exibe as informações de forma visual e clara

### Biotipos explicados
| Biotipo | Características | Desafio comum |
|---|---|---|
| **Ectomorfo** | Corpo magro, dificuldade de ganhar massa | Ganhar músculo e peso |
| **Mesomorfo** | Corpo atlético, ganha massa e perde gordura com facilidade | Manutenção |
| **Endomorfo** | Tendência a acumular gordura, estrutura mais larga | Perda de gordura |

---

## 9. Considerações Legais e Éticas

> Esta seção é crítica. Apps de saúde têm responsabilidades legais importantes.

### Avisos obrigatórios
- O app **não substitui** acompanhamento médico, nutricional ou de educação física
- Todo plano gerado é uma **sugestão baseada em IA**, não uma prescrição profissional
- Usuários com condições de saúde (diabetes, hipertensão, etc.) devem consultar um médico antes de seguir qualquer plano

### Privacidade das fotos
- Fotos são **opcionais** — nunca forçar o upload
- Informar claramente o que é feito com as fotos (processadas pela IA, não armazenadas permanentemente sem consentimento)
- Permitir exclusão dos dados a qualquer momento (direito LGPD)

### Termos de Uso e Política de Privacidade
- Criar esses documentos antes do lançamento público
- Exigir aceite explícito no cadastro

### Apple Store
- Apps de saúde têm revisão mais rigorosa na App Store
- Evitar claims médicos sem embasamento científico
- Classificar como "saúde e fitness", não como "médico"

---

## 10. Próximos Passos

### ETAPA 0 — Cadastros e Contas (fazer ANTES de escrever qualquer código)

> Faça na ordem abaixo. Cada conta será usada na seguinte.

---

#### 1. GitHub — Controle de versão do código
**O que é:** Onde o código do ShapeScan fica guardado e versionado. É como um "histórico" de tudo que foi feito no projeto — permite voltar no tempo se algo der errado.  
**Por que primeiro:** Vercel e Supabase se conectam ao GitHub automaticamente.

- Acesse: https://github.com
- Clique em **Sign up** e crie uma conta gratuita
- Após criar a conta, crie um repositório chamado `shapescan`
  - Visibilidade: **Private** (privado)
  - Marque: "Add a README file"
- Guarde o link do repositório (ex: `github.com/seu-usuario/shapescan`)

---

#### 2. Supabase — Banco de dados e autenticação
**O que é:** Onde os dados dos usuários ficam guardados (perfil, peso, altura, progresso). Também cuida do login/cadastro. Gratuito para começar.  
**Por que segundo:** O projeto precisa do banco configurado antes de conectar ao servidor (Vercel).

- Acesse: https://supabase.com
- Clique em **Start your project** e faça login com sua conta do GitHub (mais fácil)
- Crie um novo projeto:
  - Nome: `shapescan`
  - Senha do banco: crie uma senha forte e **anote em local seguro**
  - Região: `South America (São Paulo)` — mais rápido para usuários do Brasil
- Aguarde ~2 minutos para o projeto ser criado
- Guarde as informações de conexão (serão usadas no código):
  - **Project URL** (ex: `https://xxxx.supabase.co`)
  - **anon public key** (chave pública)

---

#### 3. Vercel — Hospedagem do app na internet
**O que é:** Onde o ShapeScan fica "no ar" para qualquer pessoa acessar pelo navegador. Gratuito para projetos pessoais e pequenos.  
**Por que terceiro:** Conecta ao GitHub para publicar automaticamente cada atualização do código.

- Acesse: https://vercel.com
- Clique em **Sign up** e entre com sua conta do GitHub
- Após entrar, clique em **Add New Project**
- Selecione o repositório `shapescan` que você criou no GitHub
- Clique em **Deploy** — a Vercel vai gerar uma URL pública para o projeto (ex: `shapescan.vercel.app`)

---

#### 4. Anthropic — Acesso à IA (Claude API)
**O que é:** A IA que vai analisar o biotipo, gerar a dieta e o plano de treinos dos usuários.  
**Por que último:** É o único que tem custo por uso — configure depois de ter o projeto estruturado.

- Acesse: https://console.anthropic.com
- Crie uma conta gratuita
- Vá em **API Keys** e clique em **Create Key**
- Nomeie como `shapescan-prod`
- **Guarde a chave gerada** (ela só aparece uma vez)
- Adicione créditos iniciais (US$ 5–10 já é suficiente para testar bastante)

---

#### Resumo dos cadastros

| Serviço | Site | Custo | Para que serve |
|---|---|---|---|
| GitHub | github.com | Grátis | Guardar e versionar o código |
| Supabase | supabase.com | Grátis | Banco de dados + autenticação |
| Vercel | vercel.com | Grátis | Hospedar o app na internet |
| Anthropic | console.anthropic.com | Pago por uso | IA para análise e planos |

---

### Imediato (após os cadastros)
1. ~~Definir o nome do app~~ ✅ **ShapeScan**
2. ~~Criar conta no GitHub~~ → ver Etapa 0
3. ~~Criar conta no Supabase~~ → ver Etapa 0
4. ~~Criar conta na Vercel~~ → ver Etapa 0
5. ~~Criar conta na Anthropic~~ → ver Etapa 0
6. Iniciar desenvolvimento do MVP com Claude Code

### Curto prazo (mês 1)
6. Desenvolver telas de onboarding e perfil (MVP)
7. Integrar análise de biotipo com Claude API
8. Testar com amigos e familiares
9. Ajustar com base no feedback

### Médio prazo (meses 2-3)
10. Adicionar plano alimentar e de treinos
11. Implementar sistema de autenticação
12. Preparar para beta público
13. Definir plano freemium e integrar pagamentos (Stripe)

### Longo prazo (6+ meses)
14. Lançar versão iOS na Apple Store
15. Adicionar suporte a inglês
16. Crescer base de usuários e monetizar

---

## 11. Glossário Rápido

| Termo | Significado |
|---|---|
| **MVP** | Minimum Viable Product — versão mínima funcional do app |
| **Freemium** | Modelo gratuito com opção paga |
| **IA / AI** | Inteligência Artificial |
| **Stack** | Conjunto de tecnologias usadas no desenvolvimento |
| **Frontend** | A parte visual do app (o que o usuário vê) |
| **Backend** | A parte "por trás" do app (servidor, banco de dados) |
| **API** | Interface que permite dois sistemas conversarem |
| **LGPD** | Lei Geral de Proteção de Dados (lei brasileira de privacidade) |
| **Responsivo** | Design que se adapta a qualquer tamanho de tela |
| **Deploy** | Publicar o app para que outros possam acessar |

---

*Este documento foi criado com base em entrevista realizada em 15/05/2026.*  
*Próxima revisão sugerida: após definição do nome e início do desenvolvimento.*
