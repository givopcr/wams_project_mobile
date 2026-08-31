import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants.dart';

class ApiService {
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  Map<String, String> _headers(String? token) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // --- AUTH SERVICES ---
  Future<Map<String, dynamic>> login(String login, String password) async {
    final response = await http.post(
      Uri.parse(ApiConstants.login),
      headers: _headers(null),
      body: jsonEncode({'login': login, 'password': password}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      final token = data['data']['token'];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', token);
      return data;
    } else {
      throw Exception(data['message'] ?? 'Login gagal. Periksa data Anda.');
    }
  }

  Future<Map<String, dynamic>> register({
    required String nama,
    required String email,
    String? nip,
    required String password,
    required String passwordConfirmation,
  }) async {
    final response = await http.post(
      Uri.parse(ApiConstants.register),
      headers: _headers(null),
      body: jsonEncode({
        'nama': nama,
        'email': email,
        'nip': nip,
        'password': password,
        'password_confirmation': passwordConfirmation,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 201 && data['success'] == true) {
      final token = data['data']['token'];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', token);
      return data;
    } else {
      throw Exception(data['message'] ?? 'Registrasi gagal.');
    }
  }

  Future<void> logout() async {
    final token = await _getToken();
    try {
      await http.post(
        Uri.parse(ApiConstants.logout),
        headers: _headers(token),
      );
    } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  // --- PROFILE ---
  Future<Map<String, dynamic>> getProfile() async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse(ApiConstants.profile),
      headers: _headers(token),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return data['data'];
    } else {
      throw Exception(data['message'] ?? 'Gagal memuat profil');
    }
  }

  Future<void> updateProfile({
    required String nama,
    String? nip,
    String? currentPassword,
    String? newPassword,
    String? newPasswordConfirmation,
  }) async {
    final token = await _getToken();
    final response = await http.put(
      Uri.parse(ApiConstants.profile),
      headers: _headers(token),
      body: jsonEncode({
        'nama': nama,
        'nip': nip,
        if (currentPassword != null && currentPassword.isNotEmpty)
          'current_password': currentPassword,
        if (newPassword != null && newPassword.isNotEmpty)
          'new_password': newPassword,
        if (newPasswordConfirmation != null && newPasswordConfirmation.isNotEmpty)
          'new_password_confirmation': newPasswordConfirmation,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode != 200 || data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal memperbarui profil');
    }
  }

  // --- KATEGORI & BARANG ---
  Future<List<dynamic>> getKategori() async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse(ApiConstants.kategori),
      headers: _headers(token),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return data['data'];
    } else {
      throw Exception(data['message'] ?? 'Gagal memuat kategori');
    }
  }

  Future<Map<String, dynamic>> getBarangByKategori(int kategoriId, {String? query}) async {
    final token = await _getToken();
    var url = '${ApiConstants.kategori}/$kategoriId/barang';
    if (query != null && query.isNotEmpty) {
      url += '?q=${Uri.encodeComponent(query)}';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: _headers(token),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Gagal memuat barang kategori');
    }
  }

  Future<Map<String, dynamic>> getDetailBarang(int id) async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('${ApiConstants.barang}/$id'),
      headers: _headers(token),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return data['data'];
    } else {
      throw Exception(data['message'] ?? 'Gagal memuat detail barang');
    }
  }

  Future<List<dynamic>> getBarangUnits(int barangId) async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('${ApiConstants.barang}/$barangId/units'),
      headers: _headers(token),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return data['data'] ?? [];
    } else {
      throw Exception(data['message'] ?? 'Gagal memuat daftar unit');
    }
  }

  // --- TRANSAKSI (PINJAM & PENGEMBALIAN) ---
  Future<Map<String, dynamic>> pinjamBarang(int barangId, {int? unitId}) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse(ApiConstants.peminjaman),
      headers: _headers(token),
      body: jsonEncode({
        'barang_id': barangId,
        ...?unitId != null ? {'barang_unit_id': unitId} : null,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 201 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Gagal meminjam barang.');
    }
  }

  Future<Map<String, dynamic>> kembalikanBarang({
    required int logbookId,
    required String kondisiKembali, // 'baik' | 'rusak'
  }) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse(ApiConstants.pengembalian),
      headers: _headers(token),
      body: jsonEncode({
        'logbook_id': logbookId,
        'kondisi_kembali': kondisiKembali,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Gagal memproses pengembalian.');
    }
  }

  Future<List<dynamic>> getRiwayat({String? status, String? query}) async {
    final token = await _getToken();
    var uri = Uri.parse(ApiConstants.riwayat).replace(queryParameters: {
      if (status != null && status.isNotEmpty) 'status': status,
      if (query != null && query.isNotEmpty) 'q': query,
    });

    final response = await http.get(
      uri,
      headers: _headers(token),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      return data['data']['data'] ?? [];
    } else {
      throw Exception(data['message'] ?? 'Gagal memuat riwayat');
    }
  }
}
