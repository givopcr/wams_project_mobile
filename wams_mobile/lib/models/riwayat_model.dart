class RiwayatModel {
  final int id;
  final int? barangId;
  final int? unitId;
  final String namaBarang;
  final String kodeBarang;
  final String namaKategori;
  final String kodeUnit;
  final String? tanggalPinjam;
  final String? tanggalKembali;
  final String? kondisiKembali;
  final String statusTransaksi; // 'dipinjam' | 'dikembalikan'
  final String? gambarUrl;
  final String? keperluan;
  final String? catatanAdmin;

  RiwayatModel({
    required this.id,
    this.barangId,
    this.unitId,
    required this.namaBarang,
    required this.kodeBarang,
    required this.namaKategori,
    required this.kodeUnit,
    this.tanggalPinjam,
    this.tanggalKembali,
    this.kondisiKembali,
    required this.statusTransaksi,
    this.gambarUrl,
    this.keperluan,
    this.catatanAdmin,
  });

  factory RiwayatModel.fromJson(Map<String, dynamic> json) {
    return RiwayatModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      barangId: json['barang_id'] != null ? int.tryParse(json['barang_id'].toString()) : null,
      unitId: json['unit_id'] != null ? int.tryParse(json['unit_id'].toString()) : null,
      namaBarang: json['nama_barang'] ?? '',
      kodeBarang: json['kode_barang'] ?? '',
      namaKategori: json['nama_kategori'] ?? '',
      kodeUnit: json['kode_unit'] ?? '',
      tanggalPinjam: json['tanggal_pinjam'],
      tanggalKembali: json['tanggal_kembali'],
      kondisiKembali: json['kondisi_kembali'],
      statusTransaksi: json['status_transaksi'] ?? 'dipinjam',
      gambarUrl: json['gambar_url'],
      keperluan: json['keperluan'] ?? 'Praktikum & Workshop',
      catatanAdmin: json['catatan_admin'],
    );
  }

  bool get isDipinjam => statusTransaksi == 'dipinjam';
}

