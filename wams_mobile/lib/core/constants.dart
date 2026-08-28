class ApiConstants {
  // Untuk emulator Android gunakan 10.0.2.2, untuk device fisik/PC lokal gunakan IP LAN/localhost
  // Default emulator Android: http://10.0.2.2:8000
  // Default localhost (Windows desktop / Chrome): http://localhost:8000
  static const String baseUrl = 'http://10.0.2.2:8000/api';
  static const String storageBaseUrl = 'http://10.0.2.2:8000/storage';

  // Auth endpoints
  static const String login = '$baseUrl/login';
  static const String register = '$baseUrl/register';
  static const String logout = '$baseUrl/logout';
  static const String me = '$baseUrl/me';
  static const String profile = '$baseUrl/profile';

  // Asset endpoints
  static const String kategori = '$baseUrl/kategori';
  static const String barang = '$baseUrl/barang';

  // Transaction endpoints
  static const String peminjaman = '$baseUrl/peminjaman';
  static const String pengembalian = '$baseUrl/pengembalian';
  static const String riwayat = '$baseUrl/riwayat';
}
