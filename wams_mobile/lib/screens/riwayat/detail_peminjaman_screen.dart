import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../models/riwayat_model.dart';
import '../../providers/asset_provider.dart';
import '../../providers/transaction_provider.dart';
import '../riwayat/form_pengembalian_screen.dart';

class DetailPeminjamanScreen extends StatelessWidget {
  final RiwayatModel item;

  const DetailPeminjamanScreen({super.key, required this.item});

  void _confirmCancel(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Batalkan Pengajuan?',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        content: const Text(
          'Apakah Anda yakin ingin membatalkan pengajuan peminjaman barang ini? Unit fisik akan otomatis dikembalikan ke status tersedia.',
          style: TextStyle(fontSize: 13, color: AppTheme.textMuted),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('Tutup', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(dialogCtx);
              final assetProvider = context.read<AssetProvider>();
              final txProvider = context.read<TransactionProvider>();
              final messenger = ScaffoldMessenger.of(context);
              final nav = Navigator.of(context);

              final ok = await assetProvider.batalkanPeminjaman(item.id);
              if (ok) {
                txProvider.fetchRiwayat();
                messenger.showSnackBar(
                  const SnackBar(
                    content: Text('Pengajuan peminjaman berhasil dibatalkan.'),
                    backgroundColor: AppTheme.success,
                  ),
                );
                nav.pop();
              } else {
                messenger.showSnackBar(
                  SnackBar(
                    content: Text(assetProvider.errorMessage ?? 'Gagal membatalkan peminjaman.'),
                    backgroundColor: AppTheme.danger,
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.danger,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Ya, Batalkan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = item.isMenungguApproval
        ? const Color(0xFFD97706)
        : item.isDitolak
        ? const Color(0xFFDC2626)
        : item.isDibatalkan
        ? const Color(0xFF6B7280)
        : item.isDipinjam
        ? const Color(0xFFD97706)
        : AppTheme.success;

    final statusBgColor = item.isMenungguApproval
        ? const Color(0xFFFEF3C7)
        : item.isDitolak
        ? const Color(0xFFFEE2E2)
        : item.isDibatalkan
        ? const Color(0xFFF3F4F6)
        : item.isDipinjam
        ? const Color(0xFFFEF3C7)
        : const Color(0xFFD1FAE5);

    final statusText = item.isMenungguApproval
        ? '• Menunggu Izin'
        : item.isDitolak
        ? '• Ditolak'
        : item.isDibatalkan
        ? '• Dibatalkan'
        : item.isDipinjam
        ? '• Aktif'
        : '• Selesai';

    return Scaffold(
      backgroundColor: AppTheme.bgLight,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Detail Peminjaman',
          style: TextStyle(
            color: AppTheme.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusBgColor,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  statusText,
                  style: TextStyle(
                    color: statusColor,
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            // Status Announcement Banner if Pending Approval or Rejected
            if (item.isMenungguApproval) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFFCD34D)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.hourglass_top_rounded, color: Color(0xFFD97706), size: 22),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            'Menunggu Persetujuan Admin',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              color: Color(0xFF92400E),
                            ),
                          ),
                          SizedBox(height: 3),
                          Text(
                            'Pengajuan ini sedang ditinjau oleh Admin Workshop. Anda dapat mengambil unit setelah izin disetujui.',
                            style: TextStyle(
                              fontSize: 11.5,
                              color: Color(0xFFB45309),
                              height: 1.35,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ] else if (item.isDitolak) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFFCA5A5)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.cancel_outlined, color: Color(0xFFDC2626), size: 22),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Permohonan Peminjaman Ditolak',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              color: Color(0xFF991B1B),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Alasan: ${item.alasanPenolakan ?? 'Tidak memenuhi persyaratan operasional workshop.'}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFFB91C1C),
                              height: 1.35,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Preview Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.cardLight,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderLight),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.02),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.borderLight),
                    ),
                    child: Center(
                      child: Icon(
                        Icons.handyman,
                        size: 42,
                        color: AppTheme.primaryDark,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.namaBarang,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item.kodeUnit,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppTheme.textMuted,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Metadata Detail Table
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.cardLight,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderLight),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.02),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                children: [
                  _buildRow('Tanggal Pengajuan', _formatDate(item.tanggalPinjam)),
                  const Divider(color: AppTheme.borderLight, height: 24),
                  _buildRow('Batas Waktu Kembali', _formatDate(item.batasKembali ?? item.tanggalKembali)),
                  const Divider(color: AppTheme.borderLight, height: 24),
                  _buildRow('Keperluan', item.keperluan ?? 'Praktikum Workshop'),
                  const Divider(color: AppTheme.borderLight, height: 24),
                  _buildRow(
                    'Status Transaksi',
                    item.isMenungguApproval
                        ? 'Menunggu Persetujuan Admin'
                        : item.isDitolak
                        ? 'Ditolak Admin'
                        : item.isDibatalkan
                        ? 'Dibatalkan User'
                        : item.isDipinjam
                        ? 'Sedang Dipinjam'
                        : 'Sudah Dikembalikan',
                    valueColor: statusColor,
                  ),
                  if (item.namaApprover != null) ...[
                    const Divider(color: AppTheme.borderLight, height: 24),
                    _buildRow('Ditinjau Oleh', item.namaApprover!),
                  ],
                  if (item.alasanPenolakan != null) ...[
                    const Divider(color: AppTheme.borderLight, height: 24),
                    _buildRow('Catatan / Alasan', item.alasanPenolakan!, valueColor: const Color(0xFFDC2626)),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Actions:
            // 1. If Menunggu Approval -> Batalkan Pengajuan Button
            if (item.isMenungguApproval)
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => _confirmCancel(context),
                  icon: const Icon(Icons.close_rounded, size: 18, color: AppTheme.danger),
                  label: const Text(
                    'Batalkan Pengajuan Peminjaman',
                    style: TextStyle(
                      color: AppTheme.danger,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFFCA5A5)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),

            // 2. If Dipinjam -> Kembalikan Barang Button
            if (item.isDipinjam)
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => FormPengembalianScreen(item: item),
                      ),
                    );
                  },
                  style: TextButton.styleFrom(
                    backgroundColor: const Color(0xFFFFEAEA),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                      side: const BorderSide(color: Color(0xFFFCA5A5)),
                    ),
                  ),
                  child: const Text(
                    'Kembalikan Barang',
                    style: TextStyle(
                      color: AppTheme.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value, {Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            color: AppTheme.textMuted,
          ),
        ),
        const SizedBox(width: 16),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: valueColor ?? AppTheme.textPrimary,
            ),
          ),
        ),
      ],
    );
  }

  String _formatDate(String? raw) {
    if (raw == null || raw.isEmpty) return '-';
    try {
      final dt = DateTime.parse(raw);
      final months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
      ];
      return '${dt.day.toString().padLeft(2, '0')} ${months[dt.month - 1]} ${dt.year}';
    } catch (_) {
      return raw;
    }
  }
}
