// lib/core/sync/sync_service.dart
// Serviço de sincronização offline → online.
// Detecta conectividade e envia tentativas pendentes para a API.

import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../database/local_db.dart';
import '../api/api_client.dart';

final syncServiceProvider = Provider<SyncService>((ref) {
  return SyncService(ref.read(apiClientProvider));
});

class SyncService {
  final ApiClient _api;

  SyncService(this._api) {
    // Escuta mudanças de conectividade e sincroniza automaticamente
    Connectivity().onConnectivityChanged.listen((results) {
      final connected = results.any((r) => r != ConnectivityResult.none);
      if (connected) syncPendingAttempts();
    });
  }

  /// Verifica se há conexão com a internet
  Future<bool> isOnline() async {
    final results = await Connectivity().checkConnectivity();
    return results.any((r) => r != ConnectivityResult.none);
  }

  /// Envia todas as tentativas offline pendentes para o backend
  Future<void> syncPendingAttempts() async {
    final pending = await LocalDatabase.instance.getPendingAttempts();
    if (pending.isEmpty) return;

    try {
      // Monta o payload para o endpoint /api/resultados/sync/
      final payload = pending.map((a) => {
        'simulado_id': a['simulado_id'],
        'answers':     json.decode(a['answers'] as String),
        'time_taken':  a['time_taken'],
        'started_at':  a['started_at'],
        'completed_at': a['completed_at'],
      }).toList();

      await _api.post('/resultados/sync/', data: {'attempts': payload});

      // Marca como sincronizadas
      for (final attempt in pending) {
        await LocalDatabase.instance.markAttemptSynced(attempt['id'] as String);
      }

      print('✅ ${pending.length} tentativa(s) sincronizada(s) com sucesso.');
    } catch (e) {
      print('⚠️ Falha na sincronização: $e. Será tentado novamente.');
    }
  }
}
