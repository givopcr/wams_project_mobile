class BarangUnitModel {
  final int id;
  final int barangId;
  final String kodeUnit;
  final String status; // 'tersedia' | 'dipinjam' | 'maintenance'
  final String kondisi; // 'baik' | 'rusak'

  BarangUnitModel({
    required this.id,
    required this.barangId,
    required this.kodeUnit,
    required this.status,
    required this.kondisi,
  });

  factory BarangUnitModel.fromJson(Map<String, dynamic> json) {
    return BarangUnitModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      barangId: json['barang_id'] is int ? json['barang_id'] : int.parse(json['barang_id'].toString()),
      kodeUnit: json['kode_unit'] ?? '',
      status: json['status'] ?? 'tersedia',
      kondisi: json['kondisi'] ?? 'baik',
    );
  }

  bool get isTersedia => status == 'tersedia';
  bool get isDipinjam => status == 'dipinjam';
  bool get isMaintenance => status == 'maintenance';
}
