// lib/core/api/api_client.dart
// Cliente HTTP com Dio — injeta Bearer token e renova automaticamente.

import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

const _baseUrl = 'http://10.0.2.2:8000/api'; // 10.0.2.2 = localhost no emulador Android

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

class ApiClient {
  late final Dio _dio;
  final _storage = const FlutterSecureStorage();

  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl:        _baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
      headers:        {'Content-Type': 'application/json'},
    ));

    // ── Injeta Bearer token em todas as requisições ─────────────────────────
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'access_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },

      // ── Renova token automaticamente em caso de 401 ─────────────────────
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          final refreshToken = await _storage.read(key: 'refresh_token');
          if (refreshToken != null) {
            try {
              final res = await Dio().post('$_baseUrl/auth/refresh/', data: {'refresh': refreshToken});
              final newAccess = res.data['access'] as String;
              await _storage.write(key: 'access_token', value: newAccess);

              // Repete a requisição original com o novo token
              error.requestOptions.headers['Authorization'] = 'Bearer $newAccess';
              final retryRes = await _dio.fetch(error.requestOptions);
              handler.resolve(retryRes);
              return;
            } catch (_) {
              // Refresh falhou — limpa sessão
              await _storage.deleteAll();
            }
          }
        }
        handler.next(error);
      },
    ));
  }

  Future<Response> get(String path, {Map<String, dynamic>? params}) =>
      _dio.get(path, queryParameters: params);

  Future<Response> post(String path, {dynamic data}) =>
      _dio.post(path, data: data);

  Future<Response> patch(String path, {dynamic data}) =>
      _dio.patch(path, data: data);
}
