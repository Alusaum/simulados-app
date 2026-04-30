// lib/features/auth/presentation/register_page.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../data/auth_repository.dart';
import '../../simulados/presentation/simulados_page.dart';

class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _nameCtrl     = TextEditingController();
  final _emailCtrl    = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _register() async {
    if (_nameCtrl.text.trim().length < 2) {
      setState(() => _error = 'Nome deve ter ao menos 2 caracteres.');
      return;
    }
    if (_passwordCtrl.text.length < 6) {
      setState(() => _error = 'Senha deve ter ao menos 6 caracteres.');
      return;
    }

    setState(() { _loading = true; _error = null; });

    try {
      await ref.read(authRepositoryProvider).register(
        name:     _nameCtrl.text.trim(),
        email:    _emailCtrl.text.trim(),
        password: _passwordCtrl.text,
      );

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const SimuladosPage()),
        );
      }
    } catch (e) {
      setState(() { _error = 'Erro ao criar conta. E-mail pode já estar cadastrado.'; });
    } finally {
      setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Criar conta')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFF141720),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(.07)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Criar conta grátis',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                const SizedBox(height: 20),

                if (_error != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red.withOpacity(.2)),
                    ),
                    child: Text(_error!, style: const TextStyle(color: Color(0xFFF87171), fontSize: 13)),
                  ),
                  const SizedBox(height: 16),
                ],

                const Text('Nome completo', style: TextStyle(color: Colors.white54, fontSize: 13)),
                const SizedBox(height: 6),
                TextField(
                  controller: _nameCtrl,
                  decoration: const InputDecoration(hintText: 'Seu nome'),
                  style: const TextStyle(color: Colors.white),
                ),
                const SizedBox(height: 14),

                const Text('E-mail', style: TextStyle(color: Colors.white54, fontSize: 13)),
                const SizedBox(height: 6),
                TextField(
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(hintText: 'seu@email.com'),
                  style: const TextStyle(color: Colors.white),
                ),
                const SizedBox(height: 14),

                const Text('Senha', style: TextStyle(color: Colors.white54, fontSize: 13)),
                const SizedBox(height: 6),
                TextField(
                  controller: _passwordCtrl,
                  obscureText: true,
                  decoration: const InputDecoration(hintText: 'Mín. 6 caracteres'),
                  style: const TextStyle(color: Colors.white),
                ),
                const SizedBox(height: 24),

                ElevatedButton(
                  onPressed: _loading ? null : _register,
                  child: _loading
                      ? const SizedBox(
                          width: 20, height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                        )
                      : const Text('Criar conta →'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
