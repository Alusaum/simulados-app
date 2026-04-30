// lib/features/results/presentation/results_page.dart

import 'package:flutter/material.dart';
import '../../simulados/presentation/simulados_page.dart';

class ResultsPage extends StatefulWidget {
  final String attemptId;
  final Map<String, dynamic> resultData;
  const ResultsPage({super.key, required this.attemptId, required this.resultData});

  @override
  State<ResultsPage> createState() => _ResultsPageState();
}

class _ResultsPageState extends State<ResultsPage> {
  int? _openIdx;

  @override
  Widget build(BuildContext context) {
    final data       = widget.resultData;
    final score      = data['score'] as int? ?? 0;
    final total      = data['total'] as int? ?? 0;
    final pct        = data['percentage'] as int? ?? 0;
    final timeTaken  = data['time_taken'] as int? ?? 0;
    final isOffline  = data['offline'] == true;
    final answers    = (data['answers'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final title      = data['simulado_title'] as String? ?? 'Simulado';

    final ringColor = pct >= 70
        ? const Color(0xFF34D399)
        : pct >= 50
        ? const Color(0xFFC8922A)
        : const Color(0xFFF87171);

    final min = timeTaken ~/ 60;
    final sec = timeTaken % 60;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Resultado'),
        automaticallyImplyLeading: false,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Aviso offline
          if (isOffline)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.amber.withOpacity(.1),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.amber.withOpacity(.25)),
              ),
              child: const Row(children: [
                Icon(Icons.wifi_off, color: Colors.amber, size: 16),
                SizedBox(width: 8),
                Expanded(
                  child: Text('Resultado salvo offline. Será sincronizado quando você reconectar.',
                    style: TextStyle(color: Colors.amber, fontSize: 12)),
                ),
              ]),
            ),

          // Score card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFF141720),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(.07)),
            ),
            child: Column(children: [
              // Anel de score
              SizedBox(
                width: 110, height: 110,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    CircularProgressIndicator(
                      value:           pct / 100,
                      strokeWidth:     8,
                      backgroundColor: Colors.white.withOpacity(.08),
                      valueColor:      AlwaysStoppedAnimation(ringColor),
                      strokeCap:       StrokeCap.round,
                    ),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('$pct%', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: ringColor)),
                        Text('$score/$total', style: const TextStyle(fontSize: 11, color: Colors.white38)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Text(_emoji(pct), style: const TextStyle(fontSize: 28)),
              const SizedBox(height: 4),
              Text(_msg(pct), style: const TextStyle(color: Colors.white54, fontSize: 13)),
            ]),
          ),
          const SizedBox(height: 12),

          // Stats
          Row(children: [
            _Stat('Acertos', '$score', const Color(0xFF34D399)),
            const SizedBox(width: 8),
            _Stat('Erros', '${total - score}', const Color(0xFFF87171)),
            const SizedBox(width: 8),
            _Stat('Tempo', '${min}m ${sec.toString().padLeft(2,'0')}s', const Color(0xFF60A5FA)),
          ]),
          const SizedBox(height: 16),

          // Actions
          ElevatedButton(
            onPressed: () => Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (_) => const SimuladosPage()),
              (_) => false,
            ),
            child: const Text('← Voltar ao início'),
          ),
          const SizedBox(height: 24),

          // Revisão
          const Text('REVISÃO DAS QUESTÕES',
              style: TextStyle(fontSize: 11, letterSpacing: 2, color: Colors.white30, fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),

          ...answers.asMap().entries.map((entry) {
            final i      = entry.key;
            final a      = entry.value;
            final isCorr = a['is_correct'] == true;
            final isOpen = _openIdx == i;

            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF141720),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withOpacity(.07)),
              ),
              child: Column(
                children: [
                  // Header
                  ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                    leading: Icon(
                      isCorr ? Icons.check_circle : Icons.cancel,
                      color: isCorr ? const Color(0xFF34D399) : const Color(0xFFF87171),
                      size: 22,
                    ),
                    title: Text('Questão ${i + 1}',
                        style: const TextStyle(fontSize: 12, color: Colors.white54)),
                    subtitle: Text(a['statement'] as String? ?? '',
                        maxLines: 2, overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 13, color: Colors.white)),
                    trailing: Icon(
                      isOpen ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                      color: Colors.white30,
                    ),
                    onTap: () => setState(() => _openIdx = isOpen ? null : i),
                  ),

                  // Body expandido
                  if (isOpen) ...[
                    const Divider(color: Colors.white10, height: 1),
                    Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        children: [
                          ...['a','b','c','d'].map((k) {
                            final text       = a['option_$k'] as String? ?? '';
                            final isCorrect  = k == a['correct_option'];
                            final isChosen   = k == a['chosen_option'];
                            return Container(
                              margin: const EdgeInsets.only(bottom: 6),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              decoration: BoxDecoration(
                                color: isCorrect
                                    ? const Color(0xFF34D399).withOpacity(.1)
                                    : isChosen
                                    ? const Color(0xFFF87171).withOpacity(.1)
                                    : Colors.white.withOpacity(.03),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: isCorrect
                                      ? const Color(0xFF34D399).withOpacity(.3)
                                      : isChosen
                                      ? const Color(0xFFF87171).withOpacity(.3)
                                      : Colors.white.withOpacity(.06),
                                ),
                              ),
                              child: Row(children: [
                                Container(
                                  width: 22, height: 22,
                                  decoration: BoxDecoration(
                                    color: isCorrect
                                        ? const Color(0xFF34D399)
                                        : isChosen
                                        ? const Color(0xFFF87171)
                                        : Colors.white.withOpacity(.1),
                                    borderRadius: BorderRadius.circular(5),
                                  ),
                                  child: Center(
                                    child: Text(k.toUpperCase(),
                                        style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                            color: (isCorrect || isChosen) ? Colors.black : Colors.white38)),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(text,
                                      style: TextStyle(
                                          fontSize: 13,
                                          color: isCorrect
                                              ? const Color(0xFF34D399)
                                              : isChosen
                                              ? const Color(0xFFF87171)
                                              : Colors.white54)),
                                ),
                              ]),
                            );
                          }),

                          // Explicação
                          if ((a['explanation'] as String? ?? '').isNotEmpty)
                            Container(
                              margin: const EdgeInsets.only(top: 8),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(.03),
                                borderRadius: BorderRadius.circular(8),
                                border: Border(left: BorderSide(color: const Color(0xFFC8922A), width: 2)),
                              ),
                              child: Text('💡 ${a['explanation']}',
                                  style: const TextStyle(color: Colors.white54, fontSize: 12, height: 1.6)),
                            ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            );
          }),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  String _emoji(int pct) =>
      pct >= 90 ? '🌟' : pct >= 70 ? '🎯' : pct >= 50 ? '📚' : '💪';

  String _msg(int pct) =>
      pct >= 90 ? 'Excelente! Desempenho extraordinário!'
      : pct >= 70 ? 'Muito bom! Continue assim!'
      : pct >= 50 ? 'Bom esforço! Ainda há espaço para melhorar.'
      : 'Continue estudando! Você vai se superar.';
}

class _Stat extends StatelessWidget {
  final String label, value;
  final Color color;
  const _Stat(this.label, this.value, this.color);

  @override
  Widget build(BuildContext context) => Expanded(
    child: Container(
      padding: const EdgeInsets.symmetric(vertical: 14),
      decoration: BoxDecoration(
        color: const Color(0xFF141720),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withOpacity(.07)),
      ),
      child: Column(children: [
        Text(value, style: TextStyle(fontWeight: FontWeight.w700, fontSize: 20, color: color)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 11)),
      ]),
    ),
  );
}
