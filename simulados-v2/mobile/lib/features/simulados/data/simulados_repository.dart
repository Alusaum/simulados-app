// lib/features/simulados/data/simulados_repository.dart
// Repositório de simulados — busca da API quando online, do cache quando offline.

import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/database/local_db.dart';
import '../../../core/sync/sync_service.dart';

final simuladosRepositoryProvider = Provider<SimuladosRepository>((ref) {
  return SimuladosRepository(
    ref.read(apiClientProvider),
    ref.read(syncServiceProvider),
  );
});

class SimuladosRepository {
  final ApiClient   _api;
  final SyncService _sync;

  SimuladosRepository(this._api, this._sync);

  /// Retorna lista de simulados — da API se online, do cache se offline
  Future<List<Map<String, dynamic>>> getSimulados() async {
    final online = await _sync.isOnline();

    if (online) {
      try {
        final res      = await _api.get('/simulados/');
        final simulados = List<Map<String, dynamic>>.from(res.data);

        // Salva no cache local
        await LocalDatabase.instance.cacheSimulados(
          simulados.map((s) => {
            ...s,
            'id':        s['id'].toString(),
            'questions': null, // questões são buscadas separadamente
            'cached_at': DateTime.now().millisecondsSinceEpoch,
          }).toList(),
        );

        return simulados;
      } catch (_) {
        // Fallback para cache em caso de erro
      }
    }

    // Offline: retorna do cache
    return LocalDatabase.instance.getCachedSimulados();
  }

  /// Retorna simulado com questões — com cache local
  Future<Map<String, dynamic>> getSimulado(String id) async {
    final online = await _sync.isOnline();

    if (online) {
      final res = await _api.get('/simulados/$id/');
      final data = res.data as Map<String, dynamic>;

      // Persiste as questões no cache
      await LocalDatabase.instance.cacheSimulados([{
        'id':        id,
        'title':     data['title'],
        'description': data['description'],
        'subject':   data['subject'],
        'difficulty': data['difficulty'],
        'time_limit': data['time_limit'],
        'questions': json.encode(data['questions']),
        'cached_at': DateTime.now().millisecondsSinceEpoch,
      }]);

      return data;
    }

    // Offline: busca do cache com questões
    final cached = await LocalDatabase.instance.getCachedSimulado(id);
    if (cached == null) throw Exception('Simulado não disponível offline.');

    final questions = cached['questions'] != null
        ? List<Map<String, dynamic>>.from(json.decode(cached['questions'] as String))
        : <Map<String, dynamic>>[];

    return {...cached, 'questions': questions};
  }
}
