class ApiConstants {
  // Untuk Android Emulator bawaan Android Studio: http://10.0.2.2:8000
  // Untuk device fisik via USB (adb reverse) & Windows desktop: http://127.0.0.1:8000
  // Untuk device fisik via Wi-Fi LAN: http://192.168.0.109:8000
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
