import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../../core/theme.dart';
import '../../providers/asset_provider.dart';
import '../main_navigation.dart';

class DetailBarangScreen extends StatefulWidget {
  final int barangId;

  const DetailBarangScreen({super.key, required this.barangId});

  @override
  State<DetailBarangScreen> createState() => _DetailBarangScreenState();
}

class _DetailBarangScreenState extends State<DetailBarangScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<AssetProvider>().fetchDetailBarang(widget.barangId);
      }
    });
  }

  void _showBorrowConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        backgroundColor: AppTheme.cardDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Konfirmasi Peminjaman', style: TextStyle(color: Colors.white, fontSize: 16)),
        content: const Text(
          'Sistem akan otomatis memilih dan mengunci 1 unit fisik yang berstatus tersedia untuk Anda.',
          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('Batal', style: TextStyle(color: Color(0xFF64748B))),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(dialogCtx);
              final assetProvider = context.read<AssetProvider>();
              final messenger = ScaffoldMessenger.of(context);
              final nav = Navigator.of(context);
              final success = await assetProvider.pinjamBarang(widget.barangId);

              if (!mounted) return;
              if (success) {
                messenger.showSnackBar(
                  const SnackBar(
                    content: Text('Peminjaman unit alat berhasil dikonfirmasi!'),
                    backgroundColor: AppTheme.success,
                  ),
                );
                nav.pushAndRemoveUntil(
                  MaterialPageRoute(
                    builder: (_) => const MainNavigation(initialIndex: 2),
                  ),
                  (route) => false,
                );
              } else {
                messenger.showSnackBar(
                  SnackBar(
                    content: Text(assetProvider.errorMessage ?? 'Gagal meminjam barang.'),
                    backgroundColor: AppTheme.danger,
                  ),
                );
              }
            },
            child: const Text('Ya, Pinjam'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final assetProvider = Provider.of<AssetProvider>(context);
    final barang = assetProvider.detailBarang;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Master Alat'),
      ),
      body: assetProvider.isLoading
          ? const Center(
              child: SpinKitFadingCircle(color: AppTheme.primary, size: 36),
            )
          : barang == null
              ? const Center(child: Text('Data alat tidak ditemukan'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppTheme.cardDark,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppTheme.borderDark),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primary.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    barang.kodeBarang,
                                    style: const TextStyle(
                                      fontFamily: 'monospace',
                                      color: AppTheme.primary,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                                Text(
                                  barang.namaKategori ?? '',
                                  style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              barang.namaBarang,
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                const Icon(Icons.location_on_outlined, size: 14, color: Color(0xFF94A3B8)),
                                const SizedBox(width: 4),
                                Text(
                                  'Lokasi: ${barang.lokasi ?? "-"}',
                                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppTheme.cardDark,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.borderDark),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            Column(
                              children: [
                                const Text('Total Unit', style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                                const SizedBox(height: 4),
                                Text('${barang.totalUnit}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                              ],
                            ),
                            Container(width: 1, height: 30, color: AppTheme.borderDark),
                            Column(
                              children: [
                                const Text('Tersedia', style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                                const SizedBox(height: 4),
                                Text('${barang.tersedia}', style: const TextStyle(color: AppTheme.success, fontWeight: FontWeight.bold, fontSize: 16)),
                              ],
                            ),
                            Container(width: 1, height: 30, color: AppTheme.borderDark),
                            Column(
                              children: [
                                const Text('Dipinjam', style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                                const SizedBox(height: 4),
                                Text('${barang.dipinjam}', style: const TextStyle(color: AppTheme.warning, fontWeight: FontWeight.bold, fontSize: 16)),
                              ],
                            ),
                            Container(width: 1, height: 30, color: AppTheme.borderDark),
                            Column(
                              children: [
                                const Text('Maintenance', style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                                const SizedBox(height: 4),
                                Text('${barang.maintenance}', style: const TextStyle(color: AppTheme.danger, fontWeight: FontWeight.bold, fontSize: 16)),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        'Spesifikasi Teknis',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppTheme.cardDark,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.borderDark),
                        ),
                        child: Text(
                          barang.detailSpesifikasi ?? 'Tidak ada catatan spesifikasi tambahan.',
                          style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 13, height: 1.5),
                        ),
                      ),
                      const SizedBox(height: 32),
                      ElevatedButton.icon(
                        onPressed: (barang.canBorrow && !assetProvider.isLoading)
                            ? () => _showBorrowConfirmation(context)
                            : null,
                        icon: const Icon(Icons.check_circle_outline),
                        label: Text(
                          barang.canBorrow
                              ? 'PINJAM ALAT INI (${barang.tersedia} Unit Siap)'
                              : 'SEMUA UNIT SEDANG DIPINJAM / MAINTENANCE',
                          style: const TextStyle(fontSize: 13),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: barang.canBorrow ? AppTheme.primary : const Color(0xFF334155),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }
}
