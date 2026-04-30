// lib/features/simulados/presentation/quiz_page.dart
// Tela de execução do simulado com timer, navegação e suporte offline.

import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import '../data/simulados_repository.dart';
import '../../../core/api/api_client.dart';
import '../../../core/database/local_db.dart';
import '../../../core/sync/sync_service.dart';
import '../../results/presentation/results_page.dart';

class QuizPage extends ConsumerStatefulWidget {
  final String simuladoId;
  const QuizPage({super.key, required this.simuladoId});

  @override
  ConsumerState<QuizPage> createState() => _QuizPageState();
}

class _QuizPageState extends ConsumerState<QuizPage> {
  Map<String, dynamic>? _simulado;
  List<dynamic> _questions  = [];
  Map<String, String> _answers = {};
  int    _currentIdx  = 0;
  int    _timeTaken   = 0;
  int    _timeLeft    = 0;
  bool   _loading     = true;
  bool   _finishing   = false;
  Timer? _timer;
  String? _attemptId;
  late final String _startedAt;

  @override
  void initState() {
    super.initState();
    _startedAt = DateTime.now().toIso8601String();
    _load();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final data = await ref.read(simuladosRepositoryProvider).getSimulado(widget.simuladoId);
      final online = await ref.read(syncServiceProvider).isOnline();

      // Inicia tentativa no backend se online
      if (online) {
        try {
          final res = await ref.read(apiClientProvider).post(
            '/resultados/start/', data: {'simulado_id': widget.simuladoId},
          );
          _attemptId = res.data['attempt_id'] as String;
        } catch (_) {}
      }

      setState(() {
        _simulado  = data;
        _questions = data['questions'] as List? ?? [];
        _timeLeft  = (data['time_limit'] as int? ?? 30) * 60;
        _loading   = false;
      });

      _startTimer();
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao carregar simulado: $e')),
        );
      }
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() {
        _timeTaken++;
        if (_timeLeft > 0) {
          _timeLeft--;
        } else {
          _timer?.cancel();
          _finish(timeUp: true);
        }
      });
    });
  }

  Future<void> _finish({bool timeUp = false}) async {
    if (_finishing) return;

    final unanswered = _questions.length - _answers.length;
    if (!timeUp && unanswered > 0) {
      final ok = await showDialog<bool>(
        context: context,
        builder: (_) => AlertDialog(
          backgroundColor: const Color(0xFF141720),
          title: const Text('Finalizar simulado?'),
          content: Text('Você tem $unanswered questão(ões) sem resposta.'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Voltar')),
            ElevatedButton(onPressed: () => Navigator.pop(context, true), child: const Text('Finalizar')),
          ],
        ),
      );
      if (ok != true) return;
    }

    setState(() => _finishing = true);
    _timer?.cancel();

    final online = await ref.read(syncServiceProvider).isOnline();
    final completedAt = DateTime.now().toIso8601String();

    // ── Online: finaliza via API ──────────────────────────────────────────────
    if (online && _attemptId != null) {
      try {
        final res = await ref.read(apiClientProvider).post(
          '/resultados/$_attemptId/finish/',
          data: {'answers': _answers, 'time_taken': _timeTaken},
        );

        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => ResultsPage(
                attemptId: _attemptId!,
                resultData: res.data as Map<String, dynamic>,
              ),
            ),
          );
        }
        return;
      } catch (_) {}
    }

    // ── Offline: salva localmente e exibe resultado calculado localmente ──────
    final localId = const Uuid().v4();
    await LocalDatabase.instance.savePendingAttempt({
      'id':          localId,
      'simulado_id': widget.simuladoId,
      'answers':     json.encode(_answers),
      'time_taken':  _timeTaken,
      'started_at':  _startedAt,
      'completed_at': completedAt,
    });

    // Calcula score localmente
    int score = 0;
    for (final q in _questions) {
      final id     = q['id'].toString();
      final chosen = _answers[id];
      if (chosen == q['correct_option']) score++;
    }

    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => ResultsPage(
            attemptId: localId,
            resultData: {
              'score':     score,
              'total':     _questions.length,
              'percentage': _questions.isEmpty ? 0 : (score / _questions.length * 100).round(),
              'time_taken': _timeTaken,
              'simulado_title': _simulado?['title'] ?? '',
              'answers':   _questions.map((q) {
                final id = q['id'].toString();
                return {
                  'question_id':    id,
                  'statement':      q['statement'],
                  'option_a':       q['option_a'],
                  'option_b':       q['option_b'],
                  'option_c':       q['option_c'],
                  'option_d':       q['option_d'],
                  'chosen_option':  _answers[id],
                  'correct_option': q['correct_option'],
                  'explanation':    q['explanation'] ?? '',
                  'is_correct':     _answers[id] == q['correct_option'],
                };
              }).toList(),
              'offline': true,
            },
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    if (_questions.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Simulado')),
        body: const Center(child: Text('Nenhuma questão encontrada.', style: TextStyle(color: Colors.white54))),
      );
    }

    final q        = _questions[_currentIdx] as Map<String, dynamic>;
    final qId      = q['id'].toString();
    final selected = _answers[qId];
    final isLast   = _currentIdx == _questions.length - 1;
    final pct      = _timeLeft / ((_simulado?['time_limit'] as int? ?? 30) * 60);
    final isWarn   = pct < 0.2;

    return Scaffold(
      appBar: AppBar(
        title: Text(_simulado?['title'] ?? 'Simulado'),
        actions: [
          // Timer compacto
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: isWarn ? Colors.red.withOpacity(.15) : Colors.white.withOpacity(.08),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${(_timeLeft ~/ 60).toString().padLeft(2, '0')}:${(_timeLeft % 60).toString().padLeft(2, '0')}',
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize:   13,
                    fontWeight: FontWeight.w600,
                    color:      isWarn ? const Color(0xFFF87171) : const Color(0xFFC8922A),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Barra de progresso
          LinearProgressIndicator(
            value:            (_currentIdx + 1) / _questions.length,
            backgroundColor:  Colors.white.withOpacity(.05),
            color:            const Color(0xFFC8922A),
            minHeight:        3,
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Número da questão
                  Text(
                    'QUESTÃO ${(_currentIdx + 1).toString().padLeft(2, '0')} DE ${_questions.length}',
                    style: const TextStyle(fontSize: 11, letterSpacing: 2, color: Color(0xFFC8922A)),
                  ),
                  const SizedBox(height: 12),

                  // Enunciado
                  Text(q['statement'] as String? ?? '',
                      style: const TextStyle(fontSize: 15, height: 1.6, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 20),

                  // Alternativas
                  ...['a','b','c','d'].map((key) {
                    final text = q['option_$key'] as String? ?? '';
                    final isSel = selected == key;
                    return GestureDetector(
                      onTap: () => setState(() => _answers[qId] = key),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
                        decoration: BoxDecoration(
                          color: isSel ? const Color(0xFFC8922A).withOpacity(.1) : Colors.white.withOpacity(.03),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isSel
                                ? const Color(0xFFC8922A)
                                : Colors.white.withOpacity(.07),
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 26, height: 26,
                              decoration: BoxDecoration(
                                color: isSel ? const Color(0xFFC8922A) : Colors.white.withOpacity(.08),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Center(
                                child: Text(key.toUpperCase(),
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: isSel ? Colors.black : Colors.white54,
                                    )),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(child: Text(text, style: const TextStyle(fontSize: 14))),
                          ],
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
          ),

          // Navegação
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  if (_currentIdx > 0)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => setState(() => _currentIdx--),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: Colors.white.withOpacity(.15)),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        child: const Text('← Anterior', style: TextStyle(color: Colors.white70)),
                      ),
                    ),
                  if (_currentIdx > 0) const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _finishing ? null : (isLast ? _finish : () => setState(() => _currentIdx++)),
                      child: _finishing
                          ? const SizedBox(width: 18, height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                          : Text(isLast ? '✓ Finalizar' : 'Próxima →'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
