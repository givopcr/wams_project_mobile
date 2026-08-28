class BarangModel {
  final int id;
  final int kategoriId;
  final String? namaKategori;
  final String namaBarang;
  final String kodeBarang;
  final String? detailSpesifikasi;
  final String? lokasi;
  final String? gambarUrl;
  final int totalUnit;
  final int tersedia;
  final int dipinjam;
  final int maintenance;
  final bool canBorrow;

  BarangModel({
    required this.id,
    required this.kategoriId,
    this.namaKategori,
    required this.namaBarang,
    required this.kodeBarang,
    this.detailSpesifikasi,
    this.lokasi,
    this.gambarUrl,
    this.totalUnit = 0,
    this.tersedia = 0,
    this.dipinjam = 0,
    this.maintenance = 0,
    this.canBorrow = false,
  });

  factory BarangModel.fromJson(Map<String, dynamic> json) {
    final int tersediaCount = json['tersedia'] ?? 0;
    return BarangModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      kategoriId: json['kategori_id'] is int ? json['kategori_id'] : int.parse(json['kategori_id'].toString()),
      namaKategori: json['nama_kategori'],
      namaBarang: json['nama_barang'] ?? '',
      kodeBarang: json['kode_barang'] ?? '',
      detailSpesifikasi: json['detail_spesifikasi'],
      lokasi: json['lokasi'],
      gambarUrl: json['gambar_url'],
      totalUnit: json['total_unit'] ?? 0,
      tersedia: tersediaCount,
      dipinjam: json['dipinjam'] ?? 0,
      maintenance: json['maintenance'] ?? 0,
      canBorrow: json['can_borrow'] ?? (tersediaCount > 0),
    );
  }
}
