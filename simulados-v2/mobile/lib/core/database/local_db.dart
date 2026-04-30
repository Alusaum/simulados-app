// lib/core/database/local_db.dart
// Banco SQLite local para funcionamento offline-first.
// Armazena simulados e tentativas pendentes de sincronização.

import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class LocalDatabase {
  static final LocalDatabase instance = LocalDatabase._();
  LocalDatabase._();

  Database? _db;

  Future<Database> get db async {
    _db ??= await _open();
    return _db!;
  }

  Future<void> init() async {
    _db = await _open();
  }

  Future<Database> _open() async {
    final dbPath = join(await getDatabasesPath(), 'simulaai.db');
    return openDatabase(
      dbPath,
      version: 1,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    // Simulados cacheados localmente
    await db.execute('''
      CREATE TABLE simulados (
        id          TEXT PRIMARY KEY,
        title       TEXT NOT NULL,
        description TEXT,
        subject     TEXT,
        difficulty  TEXT,
        time_limit  INTEGER,
        questions   TEXT,        -- JSON string
        cached_at   INTEGER
      )
    ''');

    // Tentativas realizadas offline (pendentes de sync)
    await db.execute('''
      CREATE TABLE pending_attempts (
        id           TEXT PRIMARY KEY,
        simulado_id  TEXT NOT NULL,
        answers      TEXT NOT NULL,  -- JSON string
        time_taken   INTEGER,
        started_at   TEXT,
        completed_at TEXT,
        synced       INTEGER DEFAULT 0
      )
    ''');
  }

  // ── Simulados ─────────────────────────────────────────────────────────────

  Future<void> cacheSimulados(List<Map<String, dynamic>> simulados) async {
    final database = await db;
    final batch = database.batch();
    for (final s in simulados) {
      batch.insert(
        'simulados', s,
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> getCachedSimulados() async {
    final database = await db;
    return database.query('simulados', orderBy: 'cached_at DESC');
  }

  Future<Map<String, dynamic>?> getCachedSimulado(String id) async {
    final database = await db;
    final rows = await database.query('simulados', where: 'id = ?', whereArgs: [id]);
    return rows.isEmpty ? null : rows.first;
  }

  // ── Tentativas pendentes ──────────────────────────────────────────────────

  Future<void> savePendingAttempt(Map<String, dynamic> attempt) async {
    final database = await db;
    await database.insert(
      'pending_attempts', attempt,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<Map<String, dynamic>>> getPendingAttempts() async {
    final database = await db;
    return database.query('pending_attempts', where: 'synced = 0');
  }

  Future<void> markAttemptSynced(String id) async {
    final database = await db;
    await database.update(
      'pending_attempts',
      {'synced': 1},
      where: 'id = ?',
      whereArgs: [id],
    );
  }
}
