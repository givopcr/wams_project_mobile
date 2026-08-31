import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../../core/theme.dart';
import '../../providers/asset_provider.dart';
import 'barang_kategori_screen.dart';

class KategoriScreen extends StatefulWidget {
  const KategoriScreen({super.key});

  @override
  State<KategoriScreen> createState() => _KategoriScreenState();
}

class _KategoriScreenState extends State<KategoriScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<AssetProvider>().fetchCategories();
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  IconData _getCategoryIcon(String name) {
    final n = name.toLowerCase();
    if (n.contains('perkakas') || n.contains('tangan')) return Icons.handyman;
    if (n.contains('listrik') || n.contains('elektronik') || n.contains('ukur')) return Icons.bolt;
    if (n.contains('mesin') || n.contains('berat') || n.contains('bubut')) return Icons.precision_manufacturing;
    if (n.contains('komponen') || n.contains('elektronika')) return Icons.memory;
    if (n.contains('keselamatan') || n.contains('k3') || n.contains('apd')) return Icons.security;
    return Icons.build_circle_outlined;
  }

  @override
  Widget build(BuildContext context) {
    final assetProvider = Provider.of<AssetProvider>(context);

    final filteredCategories = assetProvider.categories.where((kat) {
      if (_searchQuery.isEmpty) return true;
      return kat.namaKategori.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();

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
          'Kategori Peralatan',
          style: TextStyle(
            color: AppTheme.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      ),
      body: Column(
        children: [
          // Search Input "Cari kategori..."
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
            child: Container(
              decoration: BoxDecoration(
                color: AppTheme.cardLight,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.borderLight),
              ),
              child: TextField(
                controller: _searchController,
                onChanged: (val) => setState(() => _searchQuery = val),
                decoration: const InputDecoration(
                  hintText: 'Cari kategori...',
                  prefixIcon: Icon(Icons.search, size: 20, color: AppTheme.textMuted),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ),

          // Categories List
          Expanded(
            child: assetProvider.isLoading
                ? const Center(
                    child: SpinKitFadingCircle(color: AppTheme.primary, size: 36),
                  )
                : filteredCategories.isEmpty
                    ? const Center(
                        child: Text(
                          'Kategori tidak ditemukan.',
                          style: TextStyle(color: AppTheme.textMuted),
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                        itemCount: filteredCategories.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final kat = filteredCategories[index];
                          return InkWell(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => BarangKategoriScreen(
                                    kategoriId: kat.id,
                                    namaKategori: kat.namaKategori,
                                  ),
                                ),
                              );
                            },
                            borderRadius: BorderRadius.circular(16),
                            child: Container(
                              padding: const EdgeInsets.all(16),
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
                                  // Category Icon Container
                                  Container(
                                    width: 48,
                                    height: 48,
                                    decoration: BoxDecoration(
                                      color: AppTheme.primary.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Center(
                                      child: Icon(
                                        _getCategoryIcon(kat.namaKategori),
                                        color: AppTheme.primary,
                                        size: 24,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 14),

                                  // Category info
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          kat.namaKategori,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
                                            color: AppTheme.textPrimary,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          '${kat.totalBarang} Master Barang • ${kat.tersedia}/${kat.totalUnit} Unit Tersedia',
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
        ],
      ),
    );
  }
}
