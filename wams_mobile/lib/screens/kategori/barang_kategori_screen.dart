import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme.dart';
import '../../providers/asset_provider.dart';
import '../../services/api_service.dart';
import '../../models/barang_model.dart';
import '../../widgets/skeleton_loader.dart';
import '../../widgets/tool_thumbnail.dart';
import '../barang/detail_barang_screen.dart';

class BarangKategoriScreen extends StatefulWidget {
  final int kategoriId;
  final String namaKategori;

  const BarangKategoriScreen({
    super.key,
    required this.kategoriId,
    required this.namaKategori,
  });

  @override
  State<BarangKategoriScreen> createState() => _BarangKategoriScreenState();
}

class _BarangKategoriScreenState extends State<BarangKategoriScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<AssetProvider>().fetchBarangByKategori(widget.kategoriId);
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearch(String q) {
    context.read<AssetProvider>().fetchBarangByKategori(
      widget.kategoriId,
      query: q,
    );
  }

  void _showPakaiBahanBottomSheet(BuildContext context, BarangModel item) {
    final qtyController = TextEditingController(text: '1');
    final noteController = TextEditingController();
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setSheetState) {
          final sisaStok = item.stokSaatIni;
          final satuan = item.satuan ?? 'unit';

          return Container(
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 20,
              bottom: MediaQuery.of(context).viewInsets.bottom + 24,
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    ToolThumbnail(
                      imageUrl: item.gambarUrl,
                      toolName: item.namaBarang,
                      size: 48,
                      borderRadius: 10,
                    ),
                    const SizedBox(width: 12),
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
                          const SizedBox(height: 2),
                          Text(
                            'Sisa Stok Saat Ini: $sisaStok $satuan',
                            style: TextStyle(
                              fontSize: 12,
                              color: item.isLowStock ? Colors.red.shade700 : AppTheme.textMuted,
                              fontWeight: item.isLowStock ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Text(
                  'Jumlah Diambil / Digunakan ($satuan)',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    IconButton.filledTonal(
                      onPressed: () {
                        final cur = double.tryParse(qtyController.text) ?? 1;
                        if (cur > 1) {
                          setSheetState(() => qtyController.text = (cur - 1).toStringAsFixed(cur % 1 == 0 ? 0 : 1));
                        }
                      },
                      icon: const Icon(Icons.remove),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: qtyController,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        decoration: InputDecoration(
                          hintText: '1',
                          contentPadding: const EdgeInsets.symmetric(vertical: 10),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    IconButton.filledTonal(
                      onPressed: () {
                        final cur = double.tryParse(qtyController.text) ?? 0;
                        if (cur < sisaStok) {
                          setSheetState(() => qtyController.text = (cur + 1).toStringAsFixed(cur % 1 == 0 ? 0 : 1));
                        }
                      },
                      icon: const Icon(Icons.add),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Text(
                  'Keperluan Praktikum / Catatan',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: noteController,
                  decoration: InputDecoration(
                    hintText: 'Contoh: Praktik Pengelasan Modul 3',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: isSubmitting
                        ? null
                        : () async {
                            final qty = double.tryParse(qtyController.text) ?? 0;
                            if (qty <= 0) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Jumlah pemakaian harus lebih dari 0')),
                              );
                              return;
                            }
                            if (qty > sisaStok) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Sisa stok tidak mencukupi (sisa: $sisaStok $satuan)')),
                              );
                              return;
                            }

                            setSheetState(() => isSubmitting = true);
                            try {
                              await ApiService().pakaiBahan(
                                barangId: item.id,
                                jumlah: qty,
                                keterangan: noteController.text.trim(),
                              );
                              if (mounted) {
                                Navigator.pop(ctx);
                                context.read<AssetProvider>().fetchBarangByKategori(widget.kategoriId);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    backgroundColor: const Color(0xFF10B981),
                                    content: Text('Berhasil mencatat pemakaian $qty $satuan ${item.namaBarang}'),
                                  ),
                                );
                              }
                            } catch (e) {
                              setSheetState(() => isSubmitting = false);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  backgroundColor: Colors.red,
                                  content: Text(e.toString().replaceAll('Exception: ', '')),
                                ),
                              );
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: isSubmitting
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('Catat Pengambilan', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final assetProvider = Provider.of<AssetProvider>(context);
    final categoryName =
        assetProvider.selectedCategory?.namaKategori ?? widget.namaKategori;
    final isHabisPakai = assetProvider.selectedCategory?.isHabisPakai ?? false;
    final items = assetProvider.categoryItems;

    // Calculate total units and available units for bottom summary bar
    int totalUnits = 0;
    int availableUnits = 0;
    for (var item in items) {
      totalUnits += item.totalUnit;
      availableUnits += item.tersedia;
    }
    double percent = totalUnits > 0 ? (availableUnits / totalUnits) : 0.0;

    return Scaffold(
      backgroundColor: AppTheme.bgLight,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              categoryName,
              style: const TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            if (isHabisPakai)
              const Text(
                'Bahan Sekali Pakai • Monitoring Stok',
                style: TextStyle(
                  color: AppTheme.textMuted,
                  fontSize: 11,
                  fontWeight: FontWeight.normal,
                ),
              ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Search Bar + Filter Button
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 20.0,
              vertical: 12.0,
            ),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppTheme.cardLight,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.borderLight),
                    ),
                    child: TextField(
                      controller: _searchController,
                      onChanged: _onSearch,
                      decoration: const InputDecoration(
                        hintText: 'Cari perkakas...',
                        prefixIcon: Icon(
                          Icons.search,
                          size: 20,
                          color: AppTheme.textMuted,
                        ),
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppTheme.cardLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.borderLight),
                  ),
                  child: IconButton(
                    icon: const Icon(
                      Icons.tune,
                      size: 20,
                      color: AppTheme.textPrimary,
                    ),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Filter ketersediaan aktif.'),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          // Items List
          Expanded(
            child: assetProvider.isLoading
                ? ListView.separated(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 8,
                    ),
                    itemCount: 5,
                    separatorBuilder: (_, _) => const SizedBox(height: 12),
                    itemBuilder: (_, _) => const WamsSkeletonCard(),
                  )
                : items.isEmpty
                ? const Center(
                    child: Text(
                      'Tidak ada barang ditemukan.',
                      style: TextStyle(color: AppTheme.textMuted),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 8,
                    ),
                    itemCount: items.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return InkWell(
                        onTap: () {
                          if (isHabisPakai) {
                            _showPakaiBahanBottomSheet(item);
                          } else {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) =>
                                    DetailBarangScreen(barangId: item.id),
                              ),
                            );
                          }
                        },
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.all(14),
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
                          child: Row(
                            children: [
                              // Tool Thumbnail
                              ToolThumbnail(
                                imageUrl: item.gambarUrl,
                                toolName: item.namaBarang,
                                size: 52,
                                borderRadius: 12,
                                heroTag: 'tool_img_${item.id}',
                              ),
                              const SizedBox(width: 14),

                              // Name & Available Units / Stok
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item.namaBarang,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                        color: AppTheme.textPrimary,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    if (isHabisPakai) ...[
                                      Row(
                                        children: [
                                          Text(
                                            'Stok: ${item.stokSaatIni % 1 == 0 ? item.stokSaatIni.toInt().toString() : item.stokSaatIni.toString()} ${item.satuan.isNotEmpty ? item.satuan : 'Unit'}',
                                            style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                              color: item.isLowStock
                                                  ? const Color(0xFFEF4444)
                                                  : AppTheme.textMuted,
                                            ),
                                          ),
                                          if (item.isLowStock) ...[
                                            const SizedBox(width: 8),
                                            Container(
                                              padding: const EdgeInsets.symmetric(
                                                horizontal: 6,
                                                vertical: 2,
                                              ),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFFFEE2E2),
                                                borderRadius:
                                                    BorderRadius.circular(6),
                                              ),
                                              child: const Text(
                                                'Menipis',
                                                style: TextStyle(
                                                  fontSize: 10,
                                                  color: Color(0xFFDC2626),
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ],
                                      ),
                                    ] else ...[
                                      Text(
                                        '${item.totalUnit} Unit • ${item.tersedia} Tersedia',
                                        style: const TextStyle(
                                          fontSize: 12,
                                          color: AppTheme.textMuted,
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),

                              if (isHabisPakai)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primary.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        Icons.remove_circle_outline,
                                        size: 14,
                                        color: AppTheme.primary,
                                      ),
                                      SizedBox(width: 4),
                                      Text(
                                        'Pakai',
                                        style: TextStyle(
                                          color: AppTheme.primary,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                )
                              else
                                const Icon(
                                  Icons.chevron_right,
                                  color: Color(0xFF9CA3AF),
                                  size: 20,
                                ),
                            ],
                          ),
                        ),
                      ).animate(delay: (index * 45).ms).fadeIn(duration: 300.ms).slideY(begin: 0.05, end: 0);
                    },
                  ),
          ),

          // Bottom Summary Progress Bar (Matching Mockup 3)
          if (!assetProvider.isLoading && items.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.cardLight,
                border: const Border(
                  top: BorderSide(color: AppTheme.borderLight),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: SafeArea(
                top: false,
                child: isHabisPakai
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.inventory_2_outlined,
                                size: 18,
                                color: AppTheme.primary,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                '${items.length} Jenis Bahan Tersedia',
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                            ],
                          ),
                          Builder(
                            builder: (_) {
                              final lowCount =
                                  items.where((i) => i.isLowStock).length;
                              if (lowCount > 0) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFEE2E2),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    '$lowCount Perlu Restock',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFFDC2626),
                                    ),
                                  ),
                                );
                              }
                              return Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFD1FAE5),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text(
                                  'Stok Aman',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF059669),
                                  ),
                                ),
                              );
                            },
                          ),
                        ],
                      )
                    : Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '$availableUnits dari $totalUnits Unit tersedia',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                              Text(
                                '${(percent * 100).toInt()}%',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.primary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: percent,
                              backgroundColor: const Color(0xFFE5E7EB),
                              valueColor: const AlwaysStoppedAnimation<Color>(
                                AppTheme.primary,
                              ),
                              minHeight: 6,
                            ),
                          ),
                        ],
                      ),
              ),
            ),
        ],
      ),
    );
  }
}
