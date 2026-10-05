import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../core/constants.dart';
import '../../models/barang_model.dart';
import '../../providers/asset_provider.dart';
import '../barang/detail_barang_screen.dart';
import '../scan/scan_screen.dart';

class KategoriScreen extends StatefulWidget {
  final int? initialKategoriId;

  const KategoriScreen({
    super.key,
    this.initialKategoriId,
  });

  @override
  State<KategoriScreen> createState() => _KategoriScreenState();
}

class _KategoriScreenState extends State<KategoriScreen> {
  int? _selectedKategoriId;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  Timer? _debounceTimer;

  @override
  void initState() {
    super.initState();
    _selectedKategoriId = widget.initialKategoriId;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        final assetProvider = context.read<AssetProvider>();
        assetProvider.fetchCategories();
        assetProvider.fetchKatalog(kategoriId: _selectedKategoriId);
      }
    });
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String val) {
    setState(() {
      _searchQuery = val;
    });

    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 350), () {
      if (mounted) {
        context.read<AssetProvider>().fetchKatalog(
          kategoriId: _selectedKategoriId,
          query: val.trim().isNotEmpty ? val.trim() : null,
        );
      }
    });
  }

  void _clearSearch() {
    _debounceTimer?.cancel();
    _searchController.clear();
    setState(() {
      _searchQuery = '';
    });
    context.read<AssetProvider>().fetchKatalog(
      kategoriId: _selectedKategoriId,
    );
  }

  Color _getCategoryPillColor(String name) {
    final lower = name.toLowerCase();
    if (lower.contains('perkakas') || lower.contains('tangan')) {
      return const Color(0xFFDC2626); // Merah
    } else if (lower.contains('elektronik') || lower.contains('listrik') || lower.contains('ukur')) {
      return const Color(0xFFF59E0B); // Kuning / Amber
    } else if (lower.contains('komponen') || lower.contains('chip') || lower.contains('board') || lower.contains('habis')) {
      return const Color(0xFF16A34A); // Hijau
    }
    return Colors.white; // 'Semua' default
  }

  Color _getCategoryShadowColor(String name) {
    final lower = name.toLowerCase();
    if (lower.contains('perkakas') || lower.contains('tangan')) {
      return const Color(0xFFDC2626).withValues(alpha: 0.35);
    } else if (lower.contains('elektronik') || lower.contains('listrik') || lower.contains('ukur')) {
      return const Color(0xFFF59E0B).withValues(alpha: 0.35);
    } else if (lower.contains('komponen') || lower.contains('chip') || lower.contains('board') || lower.contains('habis')) {
      return const Color(0xFF16A34A).withValues(alpha: 0.35);
    }
    return Colors.black.withValues(alpha: 0.08);
  }

  Color _getActiveTextColor(String name) {
    final lower = name.toLowerCase();
    if (lower == 'semua') {
      return const Color(0xFF0F172A);
    }
    return Colors.white;
  }

  Color _getCategoryBadgeColor(String name) {
    final lower = name.toLowerCase();
    if (lower.contains('perkakas') || lower.contains('tangan')) {
      return const Color(0xFFDC2626); // Merah
    } else if (lower.contains('elektronik') || lower.contains('listrik') || lower.contains('ukur')) {
      return const Color(0xFFD97706); // Kuning / Amber
    } else if (lower.contains('komponen') || lower.contains('chip') || lower.contains('board') || lower.contains('habis')) {
      return const Color(0xFF16A34A); // Hijau
    }
    return const Color(0xFFDC2626);
  }

  @override
  Widget build(BuildContext context) {
    final assetProvider = Provider.of<AssetProvider>(context);

    final categories = assetProvider.categories;
    final rawKatalogItems = assetProvider.katalogItems;

    // Instant live local filtering for ultra-responsive search
    final query = _searchQuery.trim().toLowerCase();
    final katalogItems = query.isEmpty
        ? rawKatalogItems
        : rawKatalogItems.where((item) {
            final nameMatch = item.namaBarang.toLowerCase().contains(query);
            final codeMatch = item.kodeBarang.toLowerCase().contains(query);
            final specMatch = (item.detailSpesifikasi ?? '').toLowerCase().contains(query);
            final katMatch = (item.namaKategori ?? '').toLowerCase().contains(query);
            return nameMatch || codeMatch || specMatch || katMatch;
          }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // 1. TOP APP BAR (Title: "Katalog" Centered)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 10),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  if (Navigator.canPop(context))
                    Align(
                      alignment: Alignment.centerLeft,
                      child: GestureDetector(
                        onTap: () => Navigator.pop(context),
                        behavior: HitTestBehavior.opaque,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: const Icon(
                            Icons.arrow_back_ios_new_rounded,
                            size: 16,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ),
                    ),
                  const Center(
                    child: Text(
                      'Katalog',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF0F172A),
                        letterSpacing: -0.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // 2. SEARCH BAR WIDGET
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 2, 16, 8),
              child: Container(
                height: 46,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFCBD5E1), width: 1.1),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x060F172A),
                      blurRadius: 6,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: TextField(
                  controller: _searchController,
                  onChanged: _onSearchChanged,
                  textInputAction: TextInputAction.search,
                  onSubmitted: (val) {
                    _debounceTimer?.cancel();
                    assetProvider.fetchKatalog(
                      kategoriId: _selectedKategoriId,
                      query: val.trim().isNotEmpty ? val.trim() : null,
                    );
                  },
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF0F172A),
                  ),
                  decoration: InputDecoration(
                    hintText: 'Cari nama alat, spesifikasi, atau kode...',
                    hintStyle: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF94A3B8),
                    ),
                    prefixIcon: const Icon(
                      Icons.search_rounded,
                      size: 20,
                      color: Color(0xFF64748B),
                    ),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? GestureDetector(
                            onTap: _clearSearch,
                            behavior: HitTestBehavior.opaque,
                            child: const Icon(
                              Icons.close_rounded,
                              size: 18,
                              color: Color(0xFF64748B),
                            ),
                          )
                        : null,
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ),

            // 3. CATEGORY SEGMENTED CONTROL WITH DYNAMIC THEME COLORS
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final totalWidth = constraints.maxWidth;
                  const horizontalPadding = 4.0;
                  final availableWidth = totalWidth - (horizontalPadding * 2);
                  final tabNames = ['Semua', ...categories.map((c) => c.namaKategori)];
                  final tabWidth = availableWidth / tabNames.length;

                  int selectedIndex = 0;
                  if (_selectedKategoriId != null) {
                    final idx = categories.indexWhere((c) => c.id == _selectedKategoriId);
                    if (idx != -1) {
                      selectedIndex = idx + 1;
                    }
                  }
                  selectedIndex = selectedIndex.clamp(0, tabNames.length - 1);

                  final activeTabName = tabNames[selectedIndex];
                  final pillColor = _getCategoryPillColor(activeTabName);
                  final shadowColor = _getCategoryShadowColor(activeTabName);

                  return Container(
                    height: 44,
                    padding: const EdgeInsets.all(horizontalPadding),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F2F6),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Stack(
                      children: [
                        // Smooth Sliding Colored Pill Indicator
                        AnimatedPositioned(
                          duration: const Duration(milliseconds: 260),
                          curve: Curves.easeInOutCubic,
                          left: selectedIndex * tabWidth,
                          top: 0,
                          bottom: 0,
                          width: tabWidth,
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 260),
                            curve: Curves.easeInOutCubic,
                            decoration: BoxDecoration(
                              color: pillColor,
                              borderRadius: BorderRadius.circular(10),
                              boxShadow: [
                                BoxShadow(
                                  color: shadowColor,
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Tab Text Buttons
                        Row(
                          children: tabNames.asMap().entries.map((entry) {
                            final index = entry.key;
                            final tab = entry.value;
                            final isSelected = selectedIndex == index;

                            return Expanded(
                              child: GestureDetector(
                                behavior: HitTestBehavior.opaque,
                                onTap: () {
                                  if (index == 0) {
                                    if (_selectedKategoriId != null) {
                                      setState(() {
                                        _selectedKategoriId = null;
                                      });
                                      assetProvider.fetchKatalog(
                                        query: _searchQuery.trim().isNotEmpty ? _searchQuery.trim() : null,
                                      );
                                    }
                                  } else {
                                    final kat = categories[index - 1];
                                    if (_selectedKategoriId != kat.id) {
                                      setState(() {
                                        _selectedKategoriId = kat.id;
                                      });
                                      assetProvider.fetchKatalog(
                                        kategoriId: kat.id,
                                        query: _searchQuery.trim().isNotEmpty ? _searchQuery.trim() : null,
                                      );
                                    }
                                  }
                                },
                                child: Center(
                                  child: AnimatedDefaultTextStyle(
                                    duration: const Duration(milliseconds: 200),
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
                                      color: isSelected
                                          ? _getActiveTextColor(tab)
                                          : const Color(0xFF64748B),
                                    ),
                                    child: Text(
                                      tab,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 8),

            // 4. NOTICE BANNER: "Peminjaman Wajib Scan QR Code"
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: _buildScanNoticeBanner(),
            ),

            const SizedBox(height: 12),

            // 5. MAIN PRODUCT GRID (2 COLUMNS)
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async {
                  await assetProvider.fetchCategories();
                  await assetProvider.fetchKatalog(
                    kategoriId: _selectedKategoriId,
                    query: _searchQuery.trim().isNotEmpty ? _searchQuery.trim() : null,
                  );
                },
                child: assetProvider.isLoading && katalogItems.isEmpty
                    ? _buildGridShimmer()
                    : katalogItems.isEmpty
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.all(24.0),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    _searchQuery.isNotEmpty
                                        ? Icons.search_off_rounded
                                        : Icons.inventory_2_outlined,
                                    size: 48,
                                    color: const Color(0xFFCBD5E1),
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    _searchQuery.isNotEmpty
                                        ? 'Tidak ada alat dengan kata kunci "$_searchQuery"'
                                        : 'Tidak ada alat pada kategori ini.',
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(
                                      color: Color(0xFF64748B),
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13,
                                    ),
                                  ),
                                  if (_searchQuery.isNotEmpty) ...[
                                    const SizedBox(height: 12),
                                    TextButton.icon(
                                      onPressed: _clearSearch,
                                      icon: const Icon(Icons.refresh_rounded, size: 16),
                                      label: const Text('Reset Pencarian'),
                                      style: TextButton.styleFrom(
                                        foregroundColor: const Color(0xFFDC2626),
                                        textStyle: const TextStyle(fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          )
                        : GridView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 2, 16, 80),
                            physics: const AlwaysScrollableScrollPhysics(
                              parent: BouncingScrollPhysics(),
                            ),
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                              mainAxisExtent: 244,
                            ),
                            itemCount: katalogItems.length,
                            itemBuilder: (context, index) {
                              final item = katalogItems[index];
                              return _buildProductCard(context, item, index);
                            },
                          ),
              ),
            ),
          ],
        ),
      ),
    );
  }



  // =============================================================
  // NOTICE BANNER WIDGET
  // =============================================================
  Widget _buildScanNoticeBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFECACA), width: 1.2),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06DC2626),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Red Squircle QR Icon
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: const Color(0xFFDC2626),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFDC2626).withValues(alpha: 0.25),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: const Center(
              child: Icon(
                Icons.qr_code_scanner_rounded,
                color: Colors.white,
                size: 22,
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Banner Text
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Peminjaman Wajib Scan QR Code',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF991B1B),
                    letterSpacing: -0.2,
                  ),
                ),
                SizedBox(height: 3),
                Text(
                  'Pilih alat yang Anda butuhkan, lalu klik Scan QR Unit dan arahkan kamera ke stiker QR fisik unit di workshop.',
                  style: TextStyle(
                    fontSize: 11,
                    color: Color(0xFF64748B),
                    height: 1.35,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 350.ms).slideY(begin: 0.04, end: 0);
  }

  // =============================================================
  // PRODUCT CARD WIDGET (2 COLUMNS)
  // =============================================================
  Widget _buildProductCard(BuildContext context, BarangModel item, int index) {
    final categoryName = (item.namaKategori ?? 'PERALATAN').toUpperCase();
    final itemCode = item.kodeBarang.isNotEmpty ? item.kodeBarang : 'WMS';

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
        boxShadow: const [
          BoxShadow(
            color: Color(0x080F172A),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => DetailBarangScreen(barangId: item.id),
            ),
          );
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Image Container (With [ X Tersedia ] badge)
              Container(
                width: double.infinity,
                height: 120,
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      // Center Image / Wireframe Box
                      _buildItemImage(item),

                      // Top-Right: [ X Tersedia ]
                      Positioned(
                        top: 7,
                        right: 7,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFDCFCE7).withValues(alpha: 0.95),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFA7F3D0)),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x10000000),
                                blurRadius: 4,
                                offset: Offset(0, 1),
                              ),
                            ],
                          ),
                          child: Text(
                            '${item.tersedia} Tersedia',
                            style: const TextStyle(
                              fontSize: 9.5,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF047857),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 7),

              // 2. Category & Code Row: "KOMPONEN   AIB"
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      categoryName,
                      style: TextStyle(
                        fontSize: 9.5,
                        fontWeight: FontWeight.w900,
                        color: _getCategoryBadgeColor(item.namaKategori ?? ''),
                        letterSpacing: 0.5,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    itemCode,
                    style: const TextStyle(
                      fontSize: 9.5,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF94A3B8),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 3),

              // 3. Tool Name: "AI Boards"
              SizedBox(
                height: 32,
                child: Text(
                  item.namaBarang,
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0F172A),
                    height: 1.25,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),

              const Spacer(),

              // 4. Crimson Button: [ ⛶ Scan QR Unit ]
              SizedBox(
                width: double.infinity,
                height: 34,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const ScanScreen(),
                      ),
                    );
                  },
                  icon: const Icon(
                    Icons.qr_code_scanner_rounded,
                    size: 14,
                    color: Colors.white,
                  ),
                  label: const Text(
                    'Scan QR Unit',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFDC2626),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: EdgeInsets.zero,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(9),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    ).animate(delay: (index * 30).ms).fadeIn(duration: 300.ms).slideY(begin: 0.05, end: 0);
  }

  // =============================================================
  // REAL PHOTO OR ISOMETRIC WIREFRAME BOX PLACEHOLDER
  // =============================================================
  Widget _buildItemImage(BarangModel item) {
    final resolvedUrl = ApiConstants.resolveImageUrl(item.gambarUrl);
    if (resolvedUrl != null && resolvedUrl.isNotEmpty) {
      return CachedNetworkImage(
        imageUrl: resolvedUrl,
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
        placeholder: (context, url) => Container(
          color: const Color(0xFFF1F5F9),
          child: const Center(
            child: SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFDC2626)),
            ),
          ),
        ),
        errorWidget: (context, url, error) => _buildWireframePlaceholder(),
      );
    }
    return _buildWireframePlaceholder();
  }

  Widget _buildWireframePlaceholder() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: const [
        Icon(
          Icons.view_in_ar_outlined,
          size: 40,
          color: Color(0xFF64748B),
        ),
        SizedBox(height: 2),
        Text(
          'WAMS',
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.w800,
            color: Color(0xFF94A3B8),
            letterSpacing: 0.8,
          ),
        ),
      ],
    );
  }

  // =============================================================
  // GRID SHIMMER SKELETON
  // =============================================================
  Widget _buildGridShimmer() {
    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(16, 2, 16, 80),
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        mainAxisExtent: 244,
      ),
      itemCount: 6,
      itemBuilder: (context, index) => Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
        ),
        padding: const EdgeInsets.all(10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 120,
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            const SizedBox(height: 7),
            Container(
              height: 10,
              width: 80,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 5),
            Container(
              height: 14,
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const Spacer(),
            Container(
              height: 34,
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(9),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
