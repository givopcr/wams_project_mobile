import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/riwayat_model.dart';
import '../riwayat/form_pengembalian_screen.dart';

class DetailPeminjamanScreen extends StatelessWidget {
  final RiwayatModel item;

  const DetailPeminjamanScreen({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
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
                  color: item.isDipinjam
                      ? const Color(0xFFFEF3C7) // soft amber
                      : const Color(0xFFD1FAE5), // soft green
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  item.isDipinjam ? '• Aktif' : '• Selesai',
                  style: TextStyle(
                    color: item.isDipinjam ? const Color(0xFFD97706) : AppTheme.success,
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
                  _buildRow('Tanggal Pinjam', _formatDate(item.tanggalPinjam)),
                  const Divider(color: AppTheme.borderLight, height: 24),
                  _buildRow('Batas Kembali', _formatDate(item.tanggalKembali ?? '02 Sep 2026')),
                  const Divider(color: AppTheme.borderLight, height: 24),
                  _buildRow('Keperluan', item.keperluan ?? 'Praktikum Workshop'),
                  const Divider(color: AppTheme.borderLight, height: 24),
                  _buildRow(
                    'Status',
                    item.isDipinjam ? 'Aktif' : 'Dikembalikan',
                    valueColor: item.isDipinjam ? const Color(0xFFD97706) : AppTheme.success,
                  ),
                  const Divider(color: AppTheme.borderLight, height: 24),
                  _buildRow('Catatan Admin', item.catatanAdmin ?? '-'),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Kembalikan Barang Button (if active)
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
                    backgroundColor: const Color(0xFFFFEAEA), // soft coral red bg
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
