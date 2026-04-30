// lib/main.dart
// Ponto de entrada do app Flutter — configura Riverpod e o router.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'core/database/local_db.dart';
import 'core/sync/sync_service.dart';
import 'shared/theme/app_theme.dart';
import 'features/auth/presentation/login_page.dart';
import 'features/simulados/presentation/simulados_page.dart';
import 'features/auth/data/auth_repository.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inicializa banco SQLite local
  await LocalDatabase.instance.init();

  runApp(
    const ProviderScope(child: SimulaAiApp()),
  );
}

class SimulaAiApp extends ConsumerWidget {
  const SimulaAiApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLoggedIn = ref.watch(isLoggedInProvider);

    return MaterialApp(
      title:          'SimulaAí',
      debugShowCheckedModeBanner: false,
      theme:          AppTheme.dark,
      home:           isLoggedIn ? const SimuladosPage() : const LoginPage(),
    );
  }
}
