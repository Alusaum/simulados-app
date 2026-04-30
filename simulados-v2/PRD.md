# PRD — SimulaAí: Plataforma de Simulados Online

**Versão:** 1.0  
**Data:** 2025  
**Status:** Em desenvolvimento  

---

## 1. Visão Geral

### 1.1 Problema
Candidatos a concursos públicos e vestibulares enfrentam dificuldade em encontrar uma plataforma de simulados que combine qualidade de questões, feedback imediato, acompanhamento de desempenho e experiência mobile — tudo num único lugar acessível.

### 1.2 Solução
O **SimulaAí** é uma plataforma educacional SaaS que permite ao usuário realizar simulados cronometrados, receber gabarito comentado, acompanhar sua evolução ao longo do tempo e competir em um ranking com outros candidatos — disponível na web e como app mobile com suporte offline.

### 1.3 Proposta de Valor
> "Simulados que realmente aprovam" — prática deliberada, feedback imediato e acompanhamento contínuo de evolução.

---

## 2. Objetivos do Produto

| Objetivo | Métrica de Sucesso |
|---|---|
| Engajamento diário | ≥ 3 sessões/semana por usuário ativo |
| Retenção | Taxa de retorno D7 ≥ 40% |
| Conversão Freemium → Pro | ≥ 8% dos usuários gratuitos |
| Satisfação (NPS) | ≥ 50 |
| Performance técnica | API p95 < 300ms |

---

## 3. Usuários-Alvo (Personas)

### Persona 1 — O Concurseiro Dedicado
- **Perfil:** 22–35 anos, estuda 4–6h/dia, faz concurso há 1–3 anos
- **Dor:** Quer simular condições reais de prova e entender onde erra
- **Ganho:** Timer real, gabarito comentado, histórico de evolução

### Persona 2 — O Estudante de Vestibular
- **Perfil:** 16–19 anos, ENEM/vestibulares, estuda no celular
- **Dor:** Plataformas são caras ou têm experiência mobile ruim
- **Ganho:** App offline, gratuito para começar, ranking motivador

### Persona 3 — O Professor/Cursinho
- **Perfil:** Prepara turmas para concursos específicos
- **Dor:** Não tem ferramenta para monitorar desempenho da turma
- **Ganho:** Painel de turma, simulados customizados, relatórios

---

## 4. Funcionalidades

### 4.1 MVP (v1.0)

#### Autenticação
- [ ] Cadastro com nome, e-mail e senha (hash bcrypt)
- [ ] Login com JWT (access token 15min + refresh token 7d)
- [ ] Recuperação de senha por e-mail

#### Simulados
- [ ] Listagem com filtros (disciplina, banca, dificuldade)
- [ ] Execução com timer regressivo configurável
- [ ] Navegação livre entre questões
- [ ] Salvar progresso e retomar depois

#### Questões
- [ ] 4 alternativas com 1 correta
- [ ] Gabarito comentado pós-finalização
- [ ] Feedback visual (verde/vermelho)

#### Resultados
- [ ] Pontuação e percentual
- [ ] Revisão questão a questão
- [ ] Histórico de todas as tentativas
- [ ] Ranking global

#### Mobile (Flutter)
- [ ] Funcionalidade offline-first com SQLite local
- [ ] Sincronização automática ao reconectar
- [ ] Notificações de lembretes de estudo

### 4.2 Pós-MVP (v1.x)

- [ ] Simulados por banca/cargo específico
- [ ] IA para recomendar disciplinas a estudar
- [ ] Painel do professor com gestão de turmas
- [ ] Geração de relatório PDF
- [ ] Integração com calendário (Google/Apple)
- [ ] Flashcards com repetição espaçada

---

## 5. Requisitos Não-Funcionais

| Requisito | Especificação |
|---|---|
| Performance | API p95 < 300ms, Lighthouse ≥ 90 |
| Disponibilidade | 99.5% uptime |
| Segurança | HTTPS, JWT, rate limiting, OWASP top 10 |
| Escalabilidade | Suporte a 10k usuários simultâneos |
| Acessibilidade | WCAG 2.1 nível AA |
| SEO | Core Web Vitals "Good" em todas as páginas |

---

## 6. Fluxos Principais

### Fluxo de Execução de Simulado
```
Login → Listagem → Seleciona simulado → Inicia (timer começa)
→ Responde questões → Navega livremente → Finaliza
→ Vê resultado + revisão → Salvo no histórico
```

### Fluxo de Sincronização Mobile
```
App abre → Verifica conexão → [online] sincroniza com API
→ [offline] carrega banco local → Realiza simulado
→ Salva localmente → [reconecta] envia para API automaticamente
```

---

## 7. Fora do Escopo (v1.0)

- Videoaulas ou conteúdo em vídeo
- Chat entre usuários
- Pagamento via PIX/cartão (integração Stripe/Pagar.me)
- Suporte a questões dissertativas
- Gamificação avançada (badges, missões)

---

## 8. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Banco de questões insuficiente | Média | Alto | Seed robusto + painel admin para inserção |
| Churn por falta de conteúdo novo | Alta | Alto | Roadmap claro de adição de simulados |
| Performance mobile ruim | Baixa | Médio | Testes em dispositivos reais + SQLite local |
| Segurança de dados de usuários | Baixa | Alto | HTTPS, bcrypt, JWT, rate limiting |
