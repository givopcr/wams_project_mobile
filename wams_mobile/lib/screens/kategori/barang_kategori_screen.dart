import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../../core/theme.dart';
import '../../providers/asset_provider.dart';
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
    context.read<AssetProvider>().fetchBarangByKategori(widget.kategoriId, query: q);
  }

  @override
  Widget build(BuildContext context) {
    final assetProvider = Provider.of<AssetProvider>(context);
    final categoryName = assetProvider.selectedCategory?.namaKategori ?? widget.namaKategori;
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
        title: Text(
          categoryName,
          style: const TextStyle(
            color: AppTheme.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      ),
      body: Column(
        children: [
          // Search Bar + Filter Button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
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
                        prefixIcon: Icon(Icons.search, size: 20, color: AppTheme.textMuted),
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
                    icon: const Icon(Icons.tune, size: 20, color: AppTheme.textPrimary),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Filter ketersediaan aktif.')),
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
                ? const Center(
                    child: SpinKitFadingCircle(color: AppTheme.primary, size: 36),
                  )
                : items.isEmpty
                    ? const Center(
                        child: Text(
                          'Tidak ada barang ditemukan.',
                          style: TextStyle(color: AppTheme.textMuted),
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                        itemCount: items.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final item = items[index];
                          return InkWell(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => DetailBarangScreen(barangId: item.id),
                                ),
                              );
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
                                  Container(
                                    width: 52,
                                    height: 52,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF8FAFC),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: AppTheme.borderLight),
                                    ),
                                    child: const Center(
                                      child: Icon(Icons.handyman, color: AppTheme.primary, size: 26),
                                    ),
                                  ),
                                  const SizedBox(width: 14),

                                  // Name & Available Units
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
                                        Text(
                                          '${item.totalUnit} Unit • ${item.tersedia} Tersedia',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: AppTheme.textMuted,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),

                                  const Icon(Icons.chevron_right, color: Color(0xFF9CA3AF), size: 20),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),

          // Bottom Summary Progress Bar (Matching Mockup 3)
          if (!assetProvider.isLoading && items.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.cardLight,
                border: const Border(top: BorderSide(color: AppTheme.borderLight)),
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
                child: Column(
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
                        valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primary),
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
