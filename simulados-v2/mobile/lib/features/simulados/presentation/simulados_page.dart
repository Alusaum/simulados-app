// lib/features/simulados/presentation/simulados_page.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../data/simulados_repository.dart';
import '../../../features/auth/presentation/login_page.dart';
import 'quiz_page.dart';

final simuladosProvider = FutureProvider<List<Map<String, dynamic>>>((ref) {
  return ref.read(simuladosRepositoryProvider).getSimulados();
});

class SimuladosPage extends ConsumerWidget {
  const SimuladosPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final simulados = ref.watch(simuladosProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('SimulaAí'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            onPressed: () async {
              await const FlutterSecureStorage().deleteAll();
              if (context.mounted) {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginPage()),
                );
              }
            },
          ),
        ],
      ),
      body: simulados.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.wifi_off, size: 48, color: Colors.white30),
                const SizedBox(height: 12),
                const Text('Sem conexão', style: TextStyle(color: Colors.white54)),
                const SizedBox(height: 8),
                const Text('Verifique sua internet ou use os simulados salvos offline.',
                    textAlign: TextAlign.center, style: TextStyle(color: Colors.white30, fontSize: 13)),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () => ref.invalidate(simuladosProvider),
                  child: const Text('Tentar novamente'),
                ),
              ],
            ),
          ),
        ),
        data: (list) => RefreshIndicator(
          onRefresh: () async => ref.invalidate(simuladosProvider),
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Header
              const Text('Olá! 👋', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700)),
              const SizedBox(height: 4),
              const Text('Escolha um simulado para praticar.',
                  style: TextStyle(color: Colors.white54, fontSize: 14)),
              const SizedBox(height: 20),

              const Text('SIMULADOS DISPONÍVEIS',
                  style: TextStyle(fontSize: 11, letterSpacing: 2, color: Colors.white30, fontWeight: FontWeight.w600)),
              const SizedBox(height: 12),

              ...list.map((s) => _SimuladoCard(simulado: s)),
            ],
          ),
        ),
      ),
    );
  }
}

class _SimuladoCard extends StatelessWidget {
  final Map<String, dynamic> simulado;
  const _SimuladoCard({required this.simulado});

  Color _diffColor(String diff) {
    return switch (diff) {
      'easy'   => const Color(0xFF34D399),
      'hard'   => const Color(0xFFF87171),
      _        => const Color(0xFFC8922A),
    };
  }

  String _diffLabel(String diff) {
    return switch (diff) {
      'easy'   => 'Fácil',
      'medium' => 'Médio',
      'hard'   => 'Difícil',
      _        => diff,
    };
  }

  @override
  Widget build(BuildContext context) {
    final diff  = simulado['difficulty'] as String? ?? 'medium';
    final color = _diffColor(diff);

    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => QuizPage(simuladoId: simulado['id'] as String)),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: const Color(0xFF141720),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withOpacity(.07)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Badge dificuldade
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: color.withOpacity(.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: color.withOpacity(.25)),
              ),
              child: Text(_diffLabel(diff),
                  style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
            ),
            const SizedBox(height: 10),

            Text(simulado['title'] as String? ?? '',
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
            const SizedBox(height: 4),
            Text(simulado['description'] as String? ?? '',
                style: const TextStyle(color: Colors.white54, fontSize: 13),
                maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 12),

            // Meta
            Row(
              children: [
                _Meta('${simulado['question_count'] ?? 0} questões', Icons.quiz_outlined),
                const SizedBox(width: 16),
                _Meta('${simulado['time_limit'] ?? 0} min', Icons.timer_outlined),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Meta extends StatelessWidget {
  final String text;
  final IconData icon;
  const _Meta(this.text, this.icon);

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Icon(icon, size: 13, color: Colors.white30),
      const SizedBox(width: 4),
      Text(text, style: const TextStyle(color: Colors.white30, fontSize: 12)),
    ]);
  }
}
