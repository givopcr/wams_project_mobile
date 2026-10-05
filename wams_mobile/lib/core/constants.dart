import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiConstants {
  // Default fallback host
  static String _host = defaultTargetPlatform == TargetPlatform.android
      ? 'http://10.0.2.2:8000'
      : 'http://127.0.0.1:8000';

  static String get host => _host;
  static String get baseUrl => '$_host/api';
  static String get storageBaseUrl => '$_host/storage';

  // Auth endpoints
  static String get login => '$baseUrl/login';
  static String get register => '$baseUrl/register';
  static String get authGoogle => '$baseUrl/auth/google';
  static String get logout => '$baseUrl/logout';
  static String get me => '$baseUrl/me';
  static String get profile => '$baseUrl/profile';

  // Google OAuth Server Client ID (Web Client ID dari Google Cloud Console)
  static const String googleServerClientId =
      '790986978514-sftg4a1fp0mpn5pf66e1ckab42bvnboe.apps.googleusercontent.com';

  // Asset endpoints
  static String get kategori => '$baseUrl/kategori';
  static String get barang => '$baseUrl/barang';

  // Transaction endpoints
  static String get peminjaman => '$baseUrl/peminjaman';
  static String get pengembalian => '$baseUrl/pengembalian';
  static String get riwayat => '$baseUrl/riwayat';
  static String get transaksiStokPakai => '$baseUrl/transaksi-stok/pakai';

  /// Resolve full image URL, fixing localhost / 127.0.0.1 to current active mobile host
  static String? resolveImageUrl(String? url) {
    if (url == null || url.trim().isEmpty) return null;
    final trimmed = url.trim();

    // If it's a relative storage path (e.g. /storage/... or storage/...)
    if (trimmed.startsWith('/storage/')) {
      return '$storageBaseUrl${trimmed.substring(8)}';
    } else if (trimmed.startsWith('storage/')) {
      return '$storageBaseUrl${trimmed.substring(7)}';
    }

    final uri = Uri.tryParse(trimmed);
    if (uri != null && (uri.host == 'localhost' || uri.host == '127.0.0.1')) {
      final activeUri = Uri.tryParse(_host);
      if (activeUri != null && activeUri.host.isNotEmpty) {
        return uri.replace(
          scheme: activeUri.scheme,
          host: activeUri.host,
          port: activeUri.port,
        ).toString();
      }
    }

    return trimmed;
  }

  /// Manual override if needed
  static Future<void> setHost(String host) async {
    _host = host.trim().replaceAll(RegExp(r'/+$'), '');
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('active_api_host', _host);
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
    if (cached != null && await testHost(cached)) {
      _host = cached;
      debugPrint('[ApiConstants] Using verified cached host: $_host');
      return _host;
    }

    // 2. Candidate hosts in priority order:
    // - 10.0.2.2: Android Studio Emulator loopback
    // - 127.0.0.1: Physical device via USB adb reverse or Desktop
    // - 10.21.243.167: Current local Wi-Fi LAN
    final candidates = [
      if (defaultTargetPlatform == TargetPlatform.android) ...[
        'http://10.0.2.2:8000',
        'http://127.0.0.1:8000',
      ] else ...[
        'http://127.0.0.1:8000',
        'http://10.0.2.2:8000',
      ],
      'http://10.21.243.167:8000',
      'http://10.21.243.101:8000',
    ];

    for (final candidate in candidates) {
      if (await testHost(candidate)) {
        _host = candidate;
        await prefs.setString('active_api_host', candidate);
        debugPrint('[ApiConstants] Auto-detected active host: $_host');
        return _host;
      }
    }

    debugPrint('[ApiConstants] All candidates unreachable, fallback to: $_host');
    return _host;
  }

  static Future<bool> testHost(String candidateHost) async {
    try {
      final client = http.Client();
      final url = candidateHost.trim().replaceAll(RegExp(r'/+$'), '');
      final response = await client
          .get(Uri.parse('$url/api/kategori'))
          .timeout(const Duration(milliseconds: 1500));
      client.close();
      return response.statusCode >= 200 && response.statusCode < 500;
    } catch (_) {
      return false;
    }
  }
}
