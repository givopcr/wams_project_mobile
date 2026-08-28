class KategoriModel {
  final int id;
  final String namaKategori;
  final String? qrCode;
  final int totalBarang;
  final int totalUnit;
  final int tersedia;
  final int dipinjam;
  final int maintenance;

  KategoriModel({
    required this.id,
    required this.namaKategori,
    this.qrCode,
    this.totalBarang = 0,
    this.totalUnit = 0,
    this.tersedia = 0,
    this.dipinjam = 0,
    this.maintenance = 0,
  });

  factory KategoriModel.fromJson(Map<String, dynamic> json) {
    return KategoriModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      namaKategori: json['nama_kategori'] ?? '',
      qrCode: json['qr_code'],
      totalBarang: json['total_barang'] ?? 0,
      totalUnit: json['total_unit'] ?? 0,
      tersedia: json['tersedia'] ?? 0,
      dipinjam: json['dipinjam'] ?? 0,
      maintenance: json['maintenance'] ?? 0,
    );
  }
}
