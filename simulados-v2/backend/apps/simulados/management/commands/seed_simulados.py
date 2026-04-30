"""
apps/simulados/management/commands/seed_simulados.py
Comando Django para popular o banco com dados iniciais de simulados e questões.
Execute com: python manage.py seed_simulados
"""

from django.core.management.base import BaseCommand
from apps.simulados.models import Simulado, Question


class Command(BaseCommand):
    help = 'Popula o banco com simulados e questões de exemplo'

    def handle(self, *args, **options):
        if Simulado.objects.exists():
            self.stdout.write(self.style.WARNING('Banco já populado. Use --force para recriar.'))
            if '--force' not in args:
                return

        self.stdout.write('🌱 Populando simulados...')
        self._seed()
        self.stdout.write(self.style.SUCCESS('✅ Seed concluído com sucesso!'))

    def _seed(self):
        # ── Simulado 1: JavaScript ────────────────────────────────────────────
        s1 = Simulado.objects.create(
            title       = 'Fundamentos de JavaScript',
            description = 'Conceitos essenciais do JavaScript moderno: tipos, funções, escopo e assincronismo.',
            subject     = 'Programação',
            difficulty  = 'medium',
            time_limit  = 30,
        )

        js_questions = [
            ('Qual a diferença entre `let` e `var`?',
             'Não há diferença', '`let` tem escopo de bloco, `var` tem escopo de função',
             '`var` é mais moderno', '`let` não pode ser reatribuído', 'b',
             '`let` possui escopo de bloco {}. `var` tem escopo de função e sofre hoisting diferente.'),
            ('O que `Array.prototype.map()` retorna?',
             'O mesmo array modificado', 'Um booleano',
             'Um novo array com os resultados da função', 'O índice do último elemento', 'c',
             '`map()` sempre retorna um NOVO array sem modificar o original.'),
            ('O que é uma Promise?',
             'Uma variável imutável',
             'Um objeto que representa o resultado eventual de uma operação assíncrona',
             'Uma função síncrona', 'Um método de importação', 'b',
             'Promise representa a conclusão (ou falha) de uma operação assíncrona.'),
            ('Qual o output de `typeof null`?',
             '"null"', '"undefined"', '"object"', '"boolean"', 'c',
             'Bug histórico do JS: `typeof null` retorna "object".'),
            ('O que faz `===`?',
             'Atribuição', 'Comparação de valor apenas',
             'Comparação de valor E tipo (estrita)', 'Comparação de memória', 'c',
             '`===` verifica valor E tipo sem coerção. `==` faz coerção antes de comparar.'),
            ('Como criar uma arrow function corretamente?',
             'function arrow() => {}', 'const fn = () => {}',
             'arrow function() {}', 'const fn = function => {}', 'b',
             'Arrow functions: `(params) => corpo`. Herdam o `this` do escopo pai.'),
            ('O que é o Event Loop?',
             'Loop especial para DOM',
             'Mecanismo que permite operações não-bloqueantes em uma thread',
             'API do Node.js', 'Método de iteração de eventos', 'b',
             'Event Loop monitora Call Stack e Callback Queue, permitindo assincronismo.'),
            ('O que retorna `[1,2,3].reduce((acc, curr) => acc + curr, 0)`?',
             '0', '[1,2,3]', '6', 'undefined', 'c',
             'reduce acumula: 0+1=1, 1+2=3, 3+3=6.'),
            ('O que é hoisting?',
             'Otimização de bundle',
             'Mover declarações ao topo do escopo antes da execução',
             'Ordenação de arrays', 'Importação dinâmica', 'b',
             'Hoisting "eleva" declarações de `var` e `function` ao topo do escopo na compilação.'),
            ('Qual método transforma objeto em JSON?',
             'JSON.parse()', 'JSON.stringify()', 'JSON.convert()', 'Object.toJSON()', 'b',
             '`JSON.stringify()` → objeto para string. `JSON.parse()` → string para objeto.'),
        ]

        for i, q in enumerate(js_questions, 1):
            Question.objects.create(
                simulado=s1, order=i,
                statement=q[0], option_a=q[1], option_b=q[2],
                option_c=q[3], option_d=q[4],
                correct_option=q[5], explanation=q[6],
            )

        # ── Simulado 2: HTML & CSS ────────────────────────────────────────────
        s2 = Simulado.objects.create(
            title       = 'HTML & CSS Moderno',
            description = 'HTML semântico, Flexbox, Grid, responsividade e boas práticas de estilização.',
            subject     = 'Web Design',
            difficulty  = 'easy',
            time_limit  = 25,
        )

        css_questions = [
            ('Qual propriedade CSS cria layout de grade bidimensional?',
             'display: flex', 'display: grid', 'display: table', 'display: block', 'b',
             'CSS Grid é bidimensional (linhas E colunas). Flexbox é unidimensional.'),
            ('O que é HTML semântico?',
             'Usar tags em minúsculas',
             'Usar tags que descrevem o significado do conteúdo (<article>, <nav>)',
             'HTML sem erros de sintaxe', 'Usar IDs em vez de classes', 'b',
             'HTML semântico usa elementos que descrevem propósito, melhorando acessibilidade e SEO.'),
            ('Como centralizar com Flexbox?',
             'text-align: center; vertical-align: middle', 'margin: 0 auto',
             'justify-content: center; align-items: center no container',
             'position: absolute; top: 50%; left: 50%', 'c',
             '`justify-content` alinha no eixo principal; `align-items` no cruzado.'),
            ('O que é o Box Model?',
             'Framework para caixas de diálogo',
             'Modelo que descreve elementos com content, padding, border e margin',
             'Sistema de grid de 12 colunas', 'Cálculo de especificidade', 'b',
             'Box Model: content → padding → border → margin, de dentro para fora.'),
            ('O que faz `box-sizing: border-box`?',
             'Adiciona borda visível', 'Inclui padding e border no width/height declarado',
             'Remove o box model', 'Define flex container', 'b',
             'Com `border-box`, width inclui padding e border. Padrão `content-box` soma por fora.'),
            ('Diferença entre `relative` e `absolute`?',
             'Não há diferença',
             '`relative` posiciona relativo ao viewport; `absolute` ao pai',
             '`relative` mantém espaço no fluxo; `absolute` sai do fluxo e ancora ao ancestral posicionado',
             '`absolute` substitui `relative`', 'c',
             '`relative` mantém espaço. `absolute` sai do fluxo e ancora no pai com position ≠ static.'),
            ('O que é media query?',
             'Seletor para elementos de mídia',
             'Técnica para estilos condicionais baseados em características do dispositivo',
             'Método de otimização de imagens', 'Tipo de comentário CSS', 'b',
             '@media (max-width: 768px) aplica estilos em telas até 768px.'),
            ('Valor padrão de `display` de um `<div>`?',
             'inline', 'flex', 'block', 'inline-block', 'c',
             '`<div>` é block por padrão, ocupando 100% da largura disponível.'),
        ]

        for i, q in enumerate(css_questions, 1):
            Question.objects.create(
                simulado=s2, order=i,
                statement=q[0], option_a=q[1], option_b=q[2],
                option_c=q[3], option_d=q[4],
                correct_option=q[5], explanation=q[6],
            )

        # ── Simulado 3: TI Geral ──────────────────────────────────────────────
        s3 = Simulado.objects.create(
            title       = 'Conhecimentos Gerais em TI',
            description = 'Redes, bancos de dados, segurança e conceitos gerais de tecnologia.',
            subject     = 'Tecnologia da Informação',
            difficulty  = 'medium',
            time_limit  = 35,
        )

        ti_questions = [
            ('O que significa HTTP?',
             'HyperText Transfer Protocol', 'High Transfer Technology Protocol',
             'HyperText Technology Program', 'Host Transfer Text Protocol', 'a',
             'HTTP é o protocolo de comunicação da web para transferência de dados.'),
            ('O que é banco de dados relacional?',
             'Banco em formato XML',
             'Sistema que organiza dados em tabelas relacionadas por chaves',
             'Banco apenas na nuvem', 'Banco sem SQL', 'b',
             'Bancos relacionais (MySQL, PostgreSQL) organizam dados em tabelas.'),
            ('O que é DNS?',
             'Dynamic Network System', 'Protocolo para e-mails',
             'Domain Name System — traduz domínios em IPs', 'Armazenamento distribuído', 'c',
             'DNS converte nomes legíveis (google.com) em endereços IP.'),
            ('O que é API?',
             'Application Programming Interface', 'Automated Program Integration',
             'Advanced Protocol Interface', 'Application Process Interaction', 'a',
             'API define como sistemas se comunicam — contrato de operações disponíveis.'),
            ('O que é Git?',
             'Linguagem de scripting', 'Sistema de controle de versão distribuído',
             'Editor da Microsoft', 'Serviço de hospedagem', 'b',
             'Git rastreia mudanças no código, criado por Linus Torvalds.'),
            ('Porta padrão do HTTPS?',
             '80', '22', '443', '8080', 'c',
             'HTTPS usa porta 443. HTTP usa 80. SSH usa 22.'),
            ('O que é um algoritmo de ordenação?',
             'Método de criptografia',
             'Procedimento para organizar elementos em sequência definida',
             'Técnica de compressão', 'Protocolo entre servidores', 'b',
             'Exemplos: Bubble Sort, Quick Sort, Merge Sort.'),
            ('O que é cloud computing?',
             'Sistema operacional Linux',
             'Servidor físico próprio',
             'Fornecimento de recursos computacionais pela internet sob demanda',
             'Técnica de segurança', 'c',
             'Cloud entrega TI via internet com pagamento por uso. Ex: AWS, GCP, Azure.'),
            ('O que é SQL?',
             'Linguagem orientada a objetos',
             'Structured Query Language — linguagem para bancos relacionais',
             'Sistema de arquivos Linux', 'Protocolo de transferência', 'b',
             'SQL: SELECT, INSERT, UPDATE, DELETE — operações fundamentais em bancos relacionais.'),
            ('O que é criptografia?',
             'Compactação de arquivos', 'Técnica de backup',
             'Converter dados em formato codificado ilegível para não autorizados',
             'Acelerar transmissão', 'c',
             'Criptografia usa algoritmos como AES e RSA para proteger dados.'),
        ]

        for i, q in enumerate(ti_questions, 1):
            Question.objects.create(
                simulado=s3, order=i,
                statement=q[0], option_a=q[1], option_b=q[2],
                option_c=q[3], option_d=q[4],
                correct_option=q[5], explanation=q[6],
            )

        self.stdout.write(f'  ✓ {s1.title} — {s1.question_count} questões')
        self.stdout.write(f'  ✓ {s2.title} — {s2.question_count} questões')
        self.stdout.write(f'  ✓ {s3.title} — {s3.question_count} questões')
