// lib/features/auth/data/auth_repository.dart
// Repositório de autenticação — login, registro e persistência de token.

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/api/api_client.dart';

// Provider que indica se o usuário está logado
final isLoggedInProvider = StateProvider<bool>((ref) {
  // Verificação síncrona inicial — será atualizada no boot
  return false;
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.read(apiClientProvider), ref);
});

class AuthRepository {
  final ApiClient _api;
  final Ref _ref;
  final _storage = const FlutterSecureStorage();

  AuthRepository(this._api, this._ref);

  /// Verifica se há token salvo e atualiza o estado
  Future<void> checkSession() async {
    final token = await _storage.read(key: 'access_token');
    _ref.read(isLoggedInProvider.notifier).state = token != null;
  }

  /// Registro de novo usuário
  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final res = await _api.post('/auth/register/', data: {
      'name':     name,
      'email':    email,
      'password': password,
    });
    await _saveTokens(res.data);
    return res.data;
  }

  /// Login com e-mail e senha
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final res = await _api.post('/auth/login/', data: {
      'email':    email,
      'password': password,
    });
    await _saveTokens(res.data);
    return res.data;
  }

  /// Logout — remove tokens e atualiza estado
  Future<void> logout() async {
    await _storage.deleteAll();
    _ref.read(isLoggedInProvider.notifier).state = false;
  }

  Future<void> _saveTokens(Map<String, dynamic> data) async {
    await _storage.write(key: 'access_token',  value: data['access']  as String);
    await _storage.write(key: 'refresh_token', value: data['refresh'] as String);
    await _storage.write(key: 'user_name',     value: data['user']['name'] as String);
    _ref.read(isLoggedInProvider.notifier).state = true;
  }
}
