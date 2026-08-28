class RiwayatModel {
  final int id;
  final String namaBarang;
  final String kodeBarang;
  final String namaKategori;
  final String kodeUnit;
  final String? tanggalPinjam;
  final String? tanggalKembali;
  final String? kondisiKembali;
  final String statusTransaksi; // 'dipinjam' | 'dikembalikan'
  final String? gambarUrl;

  RiwayatModel({
    required this.id,
    required this.namaBarang,
    required this.kodeBarang,
    required this.namaKategori,
    required this.kodeUnit,
    this.tanggalPinjam,
    this.tanggalKembali,
    this.kondisiKembali,
    required this.statusTransaksi,
    this.gambarUrl,
  });

  factory RiwayatModel.fromJson(Map<String, dynamic> json) {
    return RiwayatModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      namaBarang: json['nama_barang'] ?? '',
      kodeBarang: json['kode_barang'] ?? '',
      namaKategori: json['nama_kategori'] ?? '',
      kodeUnit: json['kode_unit'] ?? '',
      tanggalPinjam: json['tanggal_pinjam'],
      tanggalKembali: json['tanggal_kembali'],
      kondisiKembali: json['kondisi_kembali'],
      statusTransaksi: json['status_transaksi'] ?? 'dipinjam',
      gambarUrl: json['gambar_url'],
    );
  }

  bool get isDipinjam => statusTransaksi == 'dipinjam';
}
