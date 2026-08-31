import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../models/riwayat_model.dart';
import '../../providers/transaction_provider.dart';
import '../main_navigation.dart';

class FormPengembalianScreen extends StatefulWidget {
  final RiwayatModel item;

  const FormPengembalianScreen({super.key, required this.item});

  @override
  State<FormPengembalianScreen> createState() => _FormPengembalianScreenState();
}

class _FormPengembalianScreenState extends State<FormPengembalianScreen> {
  String _selectedKondisi = 'Baik';
  final TextEditingController _catatanController = TextEditingController();
  bool _isSubmitting = false;

  final List<String> _kondisiOptions = [
    'Baik',
    'Rusak Ringan',
    'Rusak Berat',
    'Hilang',
  ];

  @override
  void dispose() {
    _catatanController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _isSubmitting = true);
    final txProvider = context.read<TransactionProvider>();
    final messenger = ScaffoldMessenger.of(context);
    final nav = Navigator.of(context);

    // Map UI condition to API parameter
    final apiKondisi = (_selectedKondisi == 'Baik') ? 'baik' : 'rusak';

    final success = await txProvider.returnItem(
      logbookId: widget.item.id,
      kondisi: apiKondisi,
    );

    setState(() => _isSubmitting = false);

    if (!mounted) return;
    if (success) {
      messenger.showSnackBar(
        SnackBar(
          content: Text('Pengembalian ${widget.item.namaBarang} ($_selectedKondisi) berhasil dikonfirmasi!'),
          backgroundColor: AppTheme.success,
        ),
      );
      nav.pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const MainNavigation(initialIndex: 2)),
        (route) => false,
      );
    } else {
      messenger.showSnackBar(
        SnackBar(
          content: Text(txProvider.errorMessage ?? 'Gagal memproses pengembalian.'),
          backgroundColor: AppTheme.danger,
        ),
      );
    }
  }

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
          'Pengembalian Barang',
          style: TextStyle(
            color: AppTheme.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
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
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.borderLight),
                    ),
                    child: const Center(
                      child: Icon(Icons.handyman, color: AppTheme.primary, size: 30),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.item.namaBarang,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          widget.item.kodeUnit,
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
            const SizedBox(height: 24),

            const Text(
              'Kondisi Saat Dikembalikan',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 12),

            // Radio options list
            ..._kondisiOptions.map((opt) {
              final isSelected = _selectedKondisi == opt;
              return Padding(
                padding: const EdgeInsets.only(bottom: 10.0),
                child: InkWell(
                  onTap: () => setState(() => _selectedKondisi = opt),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: AppTheme.cardLight,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected ? AppTheme.success : AppTheme.borderLight,
                        width: isSelected ? 1.5 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 18,
                          height: 18,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isSelected ? AppTheme.success : const Color(0xFF9CA3AF),
                              width: 2,
                            ),
                          ),
                          child: isSelected
                              ? Center(
                                  child: Container(
                                    width: 10,
                                    height: 10,
                                    decoration: const BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: AppTheme.success,
                                    ),
                                  ),
                                )
                              : null,
                        ),
                        const SizedBox(width: 14),
                        Text(
                          opt,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            color: isSelected ? AppTheme.textPrimary : const Color(0xFF374151),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),

            const SizedBox(height: 16),
            const Text(
              'Catatan (Opsional)',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _catatanController,
              decoration: InputDecoration(
                hintText: 'Tuliskan catatan kondisi barang...',
                fillColor: AppTheme.cardLight,
                filled: true,
              ),
            ),
            const SizedBox(height: 20),

            const Text(
              'Foto Kondisi (Opsional)',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            InkWell(
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Fitur kamera dapat digunakan saat perangkat fisik aktif.')),
                );
              },
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 20),
                decoration: BoxDecoration(
                  color: AppTheme.cardLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppTheme.borderLight,
                    style: BorderStyle.solid,
                  ),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.camera_alt_outlined, color: AppTheme.textMuted, size: 22),
                    SizedBox(width: 10),
                    Text(
                      'Tambah Foto',
                      style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),

            ElevatedButton(
              onPressed: _isSubmitting ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                minimumSize: const Size.fromHeight(50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text(
                      'Konfirmasi Pengembalian',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
