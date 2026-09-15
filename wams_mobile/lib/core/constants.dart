import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiConstants {
  // Default fallback host
  static String _host = 'http://127.0.0.1:8000';

  static String get host => _host;
  static String get baseUrl => '$_host/api';
  static String get storageBaseUrl => '$_host/storage';

  // Auth endpoints
  static String get login => '$baseUrl/login';
  static String get register => '$baseUrl/register';
  static String get logout => '$baseUrl/logout';
  static String get me => '$baseUrl/me';
  static String get profile => '$baseUrl/profile';

  // Asset endpoints
  static String get kategori => '$baseUrl/kategori';
  static String get barang => '$baseUrl/barang';

  // Transaction endpoints
  static String get peminjaman => '$baseUrl/peminjaman';
  static String get pengembalian => '$baseUrl/pengembalian';
  static String get riwayat => '$baseUrl/riwayat';

  /// Manual override if needed
  static void setHost(String host) {
    _host = host;
  }

  /// Initialize host detection from cache or probe network
  static Future<String> init() async {
    final prefs = await SharedPreferences.getInstance();
    final cached = prefs.getString('active_api_host');
    if (cached != null && cached.isNotEmpty) {
      _host = cached;
    }
    return detectBestHost();
  }

  /// Auto-probe candidate hosts and select the active responsive one
  static Future<String> detectBestHost() async {
    final prefs = await SharedPreferences.getInstance();

    // 1. If cached host still responds quickly, keep using it
    final cached = prefs.getString('active_api_host');
    if (cached != null && await _testHost(cached)) {
      _host = cached;
      debugPrint('[ApiConstants] Using verified cached host: $_host');
      return _host;
    }

    // 2. Candidate hosts in priority order:
    // - 127.0.0.1: Physical device via USB adb reverse or Desktop
    // - 10.0.2.2: Android Studio Emulator loopback
    // - 10.21.243.101: Current local Wi-Fi LAN
    final candidates = [
      'http://127.0.0.1:8000',
      'http://10.0.2.2:8000',
      'http://10.21.243.101:8000',
    ];

    for (final candidate in candidates) {
      if (await _testHost(candidate)) {
        _host = candidate;
        await prefs.setString('active_api_host', candidate);
        debugPrint('[ApiConstants] Auto-detected active host: $_host');
        return _host;
      }
    }

    debugPrint('[ApiConstants] All candidates unreachable, fallback to: $_host');
    return _host;
  }

  static Future<bool> _testHost(String candidateHost) async {
    try {
      final client = http.Client();
      final response = await client
          .get(Uri.parse('$candidateHost/api/kategori'))
          .timeout(const Duration(milliseconds: 650));
      client.close();
      return response.statusCode >= 200 && response.statusCode < 500;
    } catch (_) {
      return false;
    }
  }
}
