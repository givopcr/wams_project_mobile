import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/barang_model.dart';
import '../main_navigation.dart';

class PeminjamanBerhasilScreen extends StatelessWidget {
  final BarangModel barang;
  final String kodeUnit;
  final String tanggalPinjam;
  final String tanggalKembali;
  final String keperluan;

  const PeminjamanBerhasilScreen({
    super.key,
    required this.barang,
    required this.kodeUnit,
    required this.tanggalPinjam,
    required this.tanggalKembali,
    required this.keperluan,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgLight,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 20),

              // Celebration Icon with concentric soft background
              Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 110,
                    height: 110,
                    decoration: BoxDecoration(
                      color: AppTheme.success.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                  ),
                  Container(
                    width: 80,
                    height: 80,
                    decoration: const BoxDecoration(
                      color: AppTheme.success,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check,
                      color: Colors.white,
                      size: 48,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              const Text(
                'Peminjaman Berhasil!',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Barang siap digunakan.',
                style: TextStyle(
                  fontSize: 13,
                  color: AppTheme.textMuted,
                ),
              ),
              const SizedBox(height: 28),

              // Summary Card
              Container(
                width: double.infinity,
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
                    // Item row
                    Row(
                      children: [
                        Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.borderLight),
                          ),
                          child: const Center(
                            child: Icon(Icons.handyman, color: AppTheme.primary, size: 28),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                barang.namaBarang,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                kodeUnit,
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
                    const Divider(color: AppTheme.borderLight, height: 28),

                    // Details
                    _buildRow('Tanggal Pinjam', tanggalPinjam),
                    const SizedBox(height: 12),
                    _buildRow('Batas Kembali', tanggalKembali),
                    const SizedBox(height: 12),
                    _buildRow('Keperluan', keperluan),
                  ],
                ),
              ),
              const SizedBox(height: 36),

              // Lihat Peminjaman Saya button
              ElevatedButton(
                onPressed: () {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const MainNavigation(initialIndex: 2)),
                    (route) => false,
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  minimumSize: const Size.fromHeight(50),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text(
                  'Lihat Peminjaman Saya',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ),
              const SizedBox(height: 12),

              // Kembali ke Dashboard button
              OutlinedButton(
                onPressed: () {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const MainNavigation(initialIndex: 0)),
                    (route) => false,
                  );
                },
                style: OutlinedButton.styleFrom(
                  backgroundColor: AppTheme.cardLight,
                  side: const BorderSide(color: AppTheme.borderLight),
                  minimumSize: const Size.fromHeight(50),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text(
                  'Kembali ke Dashboard',
                  style: TextStyle(
                    color: AppTheme.textPrimary,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: AppTheme.textMuted)),
        Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppTheme.textPrimary,
          ),
        ),
      ],
    );
  }
}
