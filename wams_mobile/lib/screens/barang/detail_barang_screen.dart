import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme.dart';
import '../../core/constants.dart';
import '../../providers/asset_provider.dart';
import '../../widgets/skeleton_loader.dart';
import '../../widgets/tool_thumbnail.dart';
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
          ? const WamsSkeletonDetail()
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
                        GestureDetector(
                          onTap: barang.gambarUrl != null && barang.gambarUrl!.isNotEmpty
                              ? () => _showImagePreviewDialog(
                                    context,
                                    barang.gambarUrl,
                                    barang.kodeBarang,
                                    barang.namaBarang,
                                  )
                              : null,
                          child: ToolThumbnail(
                            imageUrl: barang.gambarUrl,
                            toolName: barang.namaBarang,
                            size: 140,
                            borderRadius: 20,
                            heroTag: 'tool_img_${barang.id}',
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
                  ).animate().fadeIn(duration: 350.ms).scale(begin: const Offset(0.96, 0.96), end: const Offset(1, 1), curve: Curves.easeOutCubic),
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
                        _buildSpecRow('Lokasi Rak', barang.lokasi ?? 'Workshop Mesin / Lab Utama'),
                      ],
                    ),
                  ).animate(delay: 100.ms).fadeIn(duration: 350.ms).slideY(begin: 0.08, end: 0),
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
                      final unitImg = u.unitGambarUrl ?? u.gambarUrl ?? barang.gambarUrl;
                      final hasImg = unitImg != null && unitImg.isNotEmpty;

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10.0),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          decoration: BoxDecoration(
                            color: AppTheme.cardLight,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppTheme.borderLight),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.015),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              // Tool Image Thumbnail (tappable for full preview)
                              GestureDetector(
                                onTap: hasImg
                                    ? () => _showImagePreviewDialog(
                                          context,
                                          unitImg,
                                          u.kodeUnit,
                                          barang.namaBarang,
                                        )
                                    : null,
                                child: Stack(
                                  children: [
                                    ToolThumbnail(
                                      imageUrl: unitImg,
                                      toolName: barang.namaBarang,
                                      size: 46,
                                      borderRadius: 10,
                                    ),
                                    if (hasImg)
                                      Positioned(
                                        right: 2,
                                        bottom: 2,
                                        child: Container(
                                          padding: const EdgeInsets.all(2),
                                          decoration: BoxDecoration(
                                            color: Colors.black.withValues(alpha: 0.55),
                                            borderRadius: BorderRadius.circular(4),
                                          ),
                                          child: const Icon(
                                            Icons.visibility,
                                            size: 10,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),

                              // Info Unit (Wrapped in Expanded with ellipsis to prevent RenderFlex overflow)
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      u.kodeUnit,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                        color: AppTheme.textPrimary,
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    Row(
                                      children: [
                                        Icon(
                                          u.kondisi == 'baik'
                                              ? Icons.check_circle_outline
                                              : Icons.warning_amber_rounded,
                                          size: 12,
                                          color: u.kondisi == 'baik'
                                              ? AppTheme.success
                                              : const Color(0xFFD97706),
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          'Kondisi: ${u.kondisi == "baik" ? "Baik" : "Perlu Cek"}',
                                          style: const TextStyle(
                                            fontSize: 11,
                                            color: AppTheme.textMuted,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),

                              // Status Badge
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
                                    color: u.isTersedia
                                        ? AppTheme.success
                                        : const Color(0xFFD97706),
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
                  ).animate(delay: 200.ms).fadeIn(duration: 350.ms).slideY(begin: 0.1, end: 0),
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

  void _showImagePreviewDialog(
    BuildContext context,
    String? imageUrl,
    String kodeUnit,
    String namaBarang,
  ) {
    if (imageUrl == null || imageUrl.isEmpty) return;

    final resolvedUrl = ApiConstants.resolveImageUrl(imageUrl);

    showDialog(
      context: context,
      barrierColor: Colors.black87,
      builder: (dialogCtx) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header Card
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: const BoxDecoration(
                  color: AppTheme.cardLight,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            namaBarang,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            kodeUnit,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppTheme.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: AppTheme.textPrimary, size: 20),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      onPressed: () => Navigator.pop(dialogCtx),
                    ),
                  ],
                ),
              ),

              // Interactive Image Body with Zoom
              Container(
                constraints: const BoxConstraints(maxHeight: 400),
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(bottom: Radius.circular(16)),
                ),
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(bottom: Radius.circular(16)),
                  child: InteractiveViewer(
                    panEnabled: true,
                    minScale: 0.8,
                    maxScale: 3.5,
                    child: CachedNetworkImage(
                      imageUrl: resolvedUrl ?? imageUrl,
                      fit: BoxFit.contain,
                      placeholder: (context, url) => const Center(
                        child: Padding(
                          padding: EdgeInsets.all(40.0),
                          child: CircularProgressIndicator(color: AppTheme.primary),
                        ),
                      ),
                      errorWidget: (context, url, error) => const Center(
                        child: Padding(
                          padding: EdgeInsets.all(32.0),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.broken_image_outlined, size: 48, color: AppTheme.textMuted),
                              SizedBox(height: 8),
                              Text('Gagal memuat gambar', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
