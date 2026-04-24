/**
 * database.js
 * Configuração do banco de dados com NeDB (@seald-io/nedb).
 * NeDB é um banco embedded NoSQL (similar ao MongoDB) em JavaScript puro.
 * Os dados são persistidos em arquivos .db na pasta data/.
 */

const NeDB = require('@seald-io/nedb');
const path = require('path');
const fs   = require('fs');

// Garante que a pasta de dados existe
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// ─── Coleções (equivalente às tabelas do SQL) ────────────────────────────────
const db = {
  users:     new NeDB({ filename: path.join(dataDir, 'users.db'),     autoload: true }),
  simulados: new NeDB({ filename: path.join(dataDir, 'simulados.db'), autoload: true }),
  attempts:  new NeDB({ filename: path.join(dataDir, 'attempts.db'),  autoload: true }),
};

// Índice único no e-mail para evitar duplicatas
db.users.ensureIndex({ fieldName: 'email', unique: true });

// ─── Seed de Dados ───────────────────────────────────────────────────────────
async function seedDatabase() {
  const count = await db.simulados.countAsync({});
  if (count > 0) return; // Já populado, não repete

  console.log('🌱 Populando banco de dados com dados iniciais...');

  // ── Simulado 1: Fundamentos de JavaScript ──────────────────────────────────
  await db.simulados.insertAsync({
    title:       'Fundamentos de JavaScript',
    description: 'Teste seus conhecimentos nos conceitos essenciais do JavaScript moderno: tipos, funções, escopo, assincronismo e mais.',
    timeLimit:   30,
    questions: [
      { id: 'js1', statement: 'Qual a diferença entre `let` e `var` no JavaScript?', options: { a: 'Não há diferença alguma entre eles', b: '`let` tem escopo de bloco, enquanto `var` tem escopo de função', c: '`var` é mais moderno que `let`', d: '`let` não pode ser reatribuído' }, correctOption: 'b', explanation: '`let` foi introduzido no ES6 e possui escopo de bloco {}. `var` tem escopo de função e sofre hoisting de forma diferente.' },
      { id: 'js2', statement: 'O que o método `Array.prototype.map()` retorna?', options: { a: 'O mesmo array modificado in-place', b: 'Um booleano indicando se a operação foi bem-sucedida', c: 'Um novo array com os resultados da função aplicada a cada elemento', d: 'O índice do último elemento processado' }, correctOption: 'c', explanation: '`map()` sempre retorna um NOVO array sem modificar o original, aplicando a função de callback a cada elemento.' },
      { id: 'js3', statement: 'O que é uma Promise em JavaScript?', options: { a: 'Um tipo especial de variável imutável', b: 'Um objeto que representa o resultado eventual de uma operação assíncrona', c: 'Uma função que sempre executa de forma síncrona', d: 'Um método para importar módulos externos' }, correctOption: 'b', explanation: 'Promise representa a conclusão (ou falha) de uma operação assíncrona e seu valor resultante.' },
      { id: 'js4', statement: 'Qual é o output de: `console.log(typeof null)`?', options: { a: '"null"', b: '"undefined"', c: '"object"', d: '"boolean"' }, correctOption: 'c', explanation: 'Este é um bug histórico do JavaScript. `typeof null` retorna "object", e não "null" como seria esperado.' },
      { id: 'js5', statement: 'O que faz o operador `===` em JavaScript?', options: { a: 'Atribuição de valor', b: 'Comparação de valor apenas', c: 'Comparação de valor E tipo (estrita)', d: 'Comparação de referência de memória' }, correctOption: 'c', explanation: '`===` (igualdade estrita) verifica valor E tipo, sem coerção. `==` faz coerção de tipo antes de comparar.' },
      { id: 'js6', statement: 'Como se cria uma função arrow corretamente?', options: { a: 'function arrow() => {}', b: 'const fn = () => {}', c: 'arrow function() {}', d: 'const fn = function => {}' }, correctOption: 'b', explanation: 'Arrow functions usam a sintaxe `(parâmetros) => corpo`. Elas também herdam o `this` do escopo pai.' },
      { id: 'js7', statement: 'O que é o Event Loop no JavaScript?', options: { a: 'Um loop `for` especial para eventos do DOM', b: 'O mecanismo que permite ao JavaScript executar operações não-bloqueantes apesar de ser single-threaded', c: 'Uma API do Node.js para criar servidores', d: 'Um método para iterar sobre eventos de teclado' }, correctOption: 'b', explanation: 'O Event Loop monitora a Call Stack e a Callback Queue, movendo callbacks quando a stack está vazia.' },
      { id: 'js8', statement: 'O que retorna `[1,2,3].reduce((acc, curr) => acc + curr, 0)`?', options: { a: '0', b: '[1,2,3]', c: '6', d: 'undefined' }, correctOption: 'c', explanation: '`reduce` acumula valores. Começa com 0, soma 1→1, soma 2→3, soma 3. Resultado: 6.' },
      { id: 'js9', statement: 'O que é "hoisting" em JavaScript?', options: { a: 'Técnica para otimizar o tamanho do bundle', b: 'O comportamento de mover declarações para o topo do seu escopo antes da execução', c: 'Um método de ordenação de arrays', d: 'A capacidade de importar módulos dinamicamente' }, correctOption: 'b', explanation: 'Hoisting faz com que declarações de `var` e `function` sejam "elevadas" ao topo do escopo na compilação.' },
      { id: 'js10', statement: 'Qual método transforma um objeto JavaScript em JSON?', options: { a: 'JSON.parse()', b: 'JSON.stringify()', c: 'JSON.convert()', d: 'Object.toJSON()' }, correctOption: 'b', explanation: '`JSON.stringify()` serializa um objeto JS para string JSON. `JSON.parse()` faz o inverso.' },
    ],
    createdAt: new Date(),
  });

  // ── Simulado 2: HTML & CSS Moderno ─────────────────────────────────────────
  await db.simulados.insertAsync({
    title:       'HTML & CSS Moderno',
    description: 'Avalie seus conhecimentos em HTML semântico, Flexbox, Grid, responsividade e boas práticas de estilização.',
    timeLimit:   25,
    questions: [
      { id: 'css1', statement: 'Qual propriedade CSS cria um layout de grade bidimensional?', options: { a: 'display: flex', b: 'display: grid', c: 'display: table', d: 'display: block' }, correctOption: 'b', explanation: 'CSS Grid é o sistema de layout bidimensional (linhas E colunas). Flexbox é unidimensional.' },
      { id: 'css2', statement: 'O que significa HTML "semântico"?', options: { a: 'Usar apenas tags em minúsculas', b: 'Usar tags que descrevem o significado do conteúdo, como <article>, <nav>, <header>', c: 'Escrever HTML sem erros de sintaxe', d: 'Usar IDs em vez de classes' }, correctOption: 'b', explanation: 'HTML semântico usa elementos que descrevem seu propósito, melhorando acessibilidade e SEO.' },
      { id: 'css3', statement: 'Como centralizar um elemento com Flexbox?', options: { a: 'text-align: center; vertical-align: middle', b: 'margin: 0 auto', c: 'justify-content: center; align-items: center no container', d: 'position: absolute; top: 50%; left: 50%' }, correctOption: 'c', explanation: 'No container flex: `justify-content` alinha no eixo principal e `align-items` no eixo cruzado.' },
      { id: 'css4', statement: 'O que é o "Box Model" do CSS?', options: { a: 'Um framework para criar caixas de diálogo', b: 'O modelo que descreve como elementos são renderizados com content, padding, border e margin', c: 'Um sistema de grid de 12 colunas', d: 'A forma como o CSS calcula a especificidade dos seletores' }, correctOption: 'b', explanation: 'O Box Model define que todo elemento é uma caixa: content → padding → border → margin.' },
      { id: 'css5', statement: 'O que faz `box-sizing: border-box`?', options: { a: 'Adiciona uma borda visível ao elemento', b: 'Faz com que padding e border sejam incluídos no width/height declarado', c: 'Remove o box model padrão', d: 'Define o elemento como um flex container' }, correctOption: 'b', explanation: 'Com `border-box`, `width: 200px` inclui padding e border. No padrão `content-box`, eles são somados.' },
      { id: 'css6', statement: 'Qual a diferença entre `position: relative` e `position: absolute`?', options: { a: 'Não há diferença', b: '`relative` posiciona relativo ao viewport; `absolute` ao elemento pai', c: '`relative` desloca mantendo seu espaço; `absolute` remove do fluxo e posiciona relativo ao ancestral posicionado', d: '`absolute` substitui o `relative`' }, correctOption: 'c', explanation: '`relative` mantém o espaço no fluxo. `absolute` sai do fluxo e ancora no pai com `position ≠ static`.' },
      { id: 'css7', statement: 'O que é uma media query em CSS?', options: { a: 'Um seletor para elementos de mídia como <video>', b: 'Uma técnica para aplicar estilos condicionalmente com base em características do dispositivo', c: 'Um método de otimização de imagens', d: 'Um tipo especial de comentário CSS' }, correctOption: 'b', explanation: 'Media queries permitem CSS responsivo: `@media (max-width: 768px) { ... }` aplica estilos em telas até 768px.' },
      { id: 'css8', statement: 'Qual o valor padrão da propriedade `display` de um `<div>`?', options: { a: 'inline', b: 'flex', c: 'block', d: 'inline-block' }, correctOption: 'c', explanation: '`<div>` é um elemento de bloco por padrão, ocupando 100% da largura disponível.' },
    ],
    createdAt: new Date(),
  });

  // ── Simulado 3: Conhecimentos Gerais em TI ─────────────────────────────────
  await db.simulados.insertAsync({
    title:       'Conhecimentos Gerais em TI',
    description: 'Questões sobre redes, sistemas operacionais, bancos de dados, segurança e conceitos gerais de tecnologia.',
    timeLimit:   35,
    questions: [
      { id: 'ti1', statement: 'O que significa a sigla HTTP?', options: { a: 'HyperText Transfer Protocol', b: 'High Transfer Technology Protocol', c: 'HyperText Technology Program', d: 'Host Transfer Text Protocol' }, correctOption: 'a', explanation: 'HTTP é o protocolo de comunicação usado na web para transferência de dados entre cliente e servidor.' },
      { id: 'ti2', statement: 'O que é um banco de dados relacional?', options: { a: 'Um banco que armazena dados em formato XML', b: 'Um sistema que organiza dados em tabelas com linhas e colunas, relacionadas entre si por chaves', c: 'Um banco apenas na nuvem', d: 'Um tipo de banco que não usa SQL' }, correctOption: 'b', explanation: 'Bancos relacionais (MySQL, PostgreSQL, SQLite) organizam dados em tabelas relacionadas.' },
      { id: 'ti3', statement: 'O que é DNS?', options: { a: 'Dynamic Network System', b: 'Um protocolo para envio de e-mails', c: 'Domain Name System — traduz nomes de domínio em endereços IP', d: 'Um sistema de armazenamento distribuído' }, correctOption: 'c', explanation: 'DNS é o "catálogo telefônico" da internet — converte nomes legíveis em endereços IP.' },
      { id: 'ti4', statement: 'O que significa "API"?', options: { a: 'Application Programming Interface', b: 'Automated Program Integration', c: 'Advanced Protocol Interface', d: 'Application Process Interaction' }, correctOption: 'a', explanation: 'API define como sistemas se comunicam — um contrato que especifica as operações disponíveis.' },
      { id: 'ti5', statement: 'O que é Git?', options: { a: 'Uma linguagem de programação para scripting', b: 'Um sistema de controle de versão distribuído', c: 'Um editor de código-fonte da Microsoft', d: 'Um serviço de hospedagem de sites' }, correctOption: 'b', explanation: 'Git é um VCS distribuído criado por Linus Torvalds para rastrear mudanças no código.' },
      { id: 'ti6', statement: 'Qual a porta padrão do protocolo HTTPS?', options: { a: '80', b: '22', c: '443', d: '8080' }, correctOption: 'c', explanation: 'HTTPS usa a porta 443. HTTP usa 80. SSH usa 22.' },
      { id: 'ti7', statement: 'O que é um algoritmo de ordenação?', options: { a: 'Um método para criptografar dados', b: 'Um procedimento para organizar elementos em uma sequência definida', c: 'Uma técnica de compressão de arquivos', d: 'Um protocolo de comunicação entre servidores' }, correctOption: 'b', explanation: 'Algoritmos de ordenação (Bubble Sort, Quick Sort, Merge Sort) organizam coleções de dados.' },
      { id: 'ti8', statement: 'O que é a "nuvem" (cloud computing)?', options: { a: 'Um sistema operacional baseado em Linux', b: 'Um servidor físico em data centers próprios', c: 'O fornecimento de recursos computacionais pela internet sob demanda', d: 'Uma técnica de segurança para redes' }, correctOption: 'c', explanation: 'Cloud computing entrega recursos de TI via internet com pagamento por uso. Ex: AWS, Google Cloud.' },
      { id: 'ti9', statement: 'O que é SQL?', options: { a: 'Uma linguagem orientada a objetos', b: 'Structured Query Language — linguagem padrão para gerenciar bancos de dados relacionais', c: 'Um sistema de arquivos para Linux', d: 'Um protocolo de transferência de arquivos' }, correctOption: 'b', explanation: 'SQL é usada para criar, ler, atualizar e deletar dados em bancos relacionais.' },
      { id: 'ti10', statement: 'O que é encriptação de dados?', options: { a: 'O processo de compactar arquivos', b: 'Uma técnica de backup automático', c: 'O processo de converter dados em formato codificado ilegível para usuários não autorizados', d: 'Um método para acelerar transmissão de dados' }, correctOption: 'c', explanation: 'Criptografia transforma dados legíveis (plaintext) em codificados (ciphertext) usando algoritmos como AES.' },
    ],
    createdAt: new Date(),
  });

  console.log('✅ Banco de dados populado com sucesso!');
}

module.exports = { db, seedDatabase };
