import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../../core/theme.dart';
import '../../providers/asset_provider.dart';
import 'pilih_unit_screen.dart';

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
        context.read<AssetProvider>().fetchBarangUnits(widget.barangId);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final assetProvider = Provider.of<AssetProvider>(context);
    final barang = assetProvider.detailBarang;
    final units = assetProvider.barangUnits;

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
          'Detail Barang',
          style: TextStyle(
            color: AppTheme.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      ),
      body: assetProvider.isLoading || barang == null
          ? const Center(
              child: SpinKitFadingCircle(color: AppTheme.primary, size: 36),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image Showcase Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: AppTheme.cardLight,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppTheme.borderLight),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Container(
                          width: 140,
                          height: 140,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF9FAFB),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Center(
                            child: Icon(
                              Icons.handyman,
                              size: 70,
                              color: AppTheme.primaryDark,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          barang.namaBarang,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: barang.canBorrow
                                ? const Color(0xFFD1FAE5)
                                : const Color(0xFFFEE2E2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            barang.canBorrow ? '• Tersedia' : '• Tidak Tersedia',
                            style: TextStyle(
                              color: barang.canBorrow ? AppTheme.success : AppTheme.danger,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Detail Specifications Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppTheme.cardLight,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.borderLight),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSpecRow('Kategori', barang.namaKategori ?? 'Workshop'),
                        const Divider(color: AppTheme.borderLight, height: 24),
                        _buildSpecRow('Kode Barang', barang.kodeBarang),
                        const Divider(color: AppTheme.borderLight, height: 24),
                        _buildSpecRow('Deskripsi', barang.detailSpesifikasi ?? 'Peralatan standar workshop mesin dan industri.'),
                        const Divider(color: AppTheme.borderLight, height: 24),
                        _buildSpecRow('Total Unit', '${barang.totalUnit} Unit'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Section Unit Tersedia
                  const Text(
                    'Unit Tersedia',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),

                  if (units.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.cardLight,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.borderLight),
                      ),
                      child: const Center(
                        child: Text(
                          'Memuat unit fisik alat...',
                          style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                        ),
                      ),
                    )
                  else
                    ...units.map((u) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10.0),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          decoration: BoxDecoration(
                            color: AppTheme.cardLight,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppTheme.borderLight),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF3F4F6),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Icon(Icons.qr_code, size: 18, color: AppTheme.textPrimary),
                                  ),
                                  const SizedBox(width: 12),
                                  Text(
                                    u.kodeUnit,
                                    style: const TextStyle(
                                      fontFamily: 'monospace',
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                      color: AppTheme.textPrimary,
                                    ),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: u.isTersedia
                                      ? const Color(0xFFD1FAE5)
                                      : const Color(0xFFFEF3C7),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  u.isTersedia ? 'Tersedia' : 'Dipinjam',
                                  style: TextStyle(
                                    color: u.isTersedia ? AppTheme.success : const Color(0xFFD97706),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 11,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),

                  const SizedBox(height: 32),

                  // Action Button "Pinjam Barang"
                  ElevatedButton(
                    onPressed: barang.canBorrow
                        ? () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => PilihUnitScreen(barang: barang),
                              ),
                            );
                          }
                        : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      minimumSize: const Size.fromHeight(52),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: Text(
                      barang.canBorrow ? 'Pinjam Barang' : 'Semua Unit Sedang Dipinjam',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
    );
  }

  Widget _buildSpecRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 13, color: AppTheme.textMuted),
        ),
        const SizedBox(width: 16),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimary,
            ),
          ),
        ),
      ],
    );
  }
}
