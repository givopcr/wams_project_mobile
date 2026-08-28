class UserModel {
  final int id;
  final String nama;
  final String email;
  final String? nip;
  final String role;

  UserModel({
    required this.id,
    required this.nama,
    required this.email,
    this.nip,
    required this.role,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      nama: json['nama'] ?? '',
      email: json['email'] ?? '',
      nip: json['nip'],
      role: json['role'] ?? 'user',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nama': nama,
      'email': email,
      'nip': nip,
      'role': role,
    };
  }
}

class UserProfileModel {
  final int id;
  final String nama;
  final String email;
  final String? nip;
  final String role;
  final int activeBorrows;
  final int totalHistory;

  UserProfileModel({
    required this.id,
    required this.nama,
    required this.email,
    this.nip,
    required this.role,
    required this.activeBorrows,
    required this.totalHistory,
  });

  factory UserProfileModel.fromJson(Map<String, dynamic> json) {
    final stats = json['stats'] ?? {};
    return UserProfileModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      nama: json['nama'] ?? '',
      email: json['email'] ?? '',
      nip: json['nip'],
      role: json['role'] ?? 'user',
      activeBorrows: stats['active_borrows'] ?? 0,
      totalHistory: stats['total_history'] ?? 0,
    );
  }
}
