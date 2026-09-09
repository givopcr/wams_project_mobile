import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

import '../../core/theme.dart';
import '../../models/barang_model.dart';
import '../../models/barang_unit_model.dart';
import '../../providers/asset_provider.dart';
import '../../providers/transaction_provider.dart';
import 'peminjaman_berhasil_screen.dart';

class FormPeminjamanScreen extends StatefulWidget {
  final BarangModel barang;
  final List<BarangUnitModel> units;
  final BarangUnitModel? unit;

  const FormPeminjamanScreen({
    super.key,
    required this.barang,
    this.units = const [],
    this.unit,
  });

  List<BarangUnitModel> get allUnits {
    if (units.isNotEmpty) return units;
    if (unit != null) return [unit!];
    return [];
  }

  @override
  State<FormPeminjamanScreen> createState() => _FormPeminjamanScreenState();
}

class _FormPeminjamanScreenState extends State<FormPeminjamanScreen> {
  DateTime _tanggalPinjam = DateTime.now();
  DateTime _tanggalKembali = DateTime.now().add(const Duration(days: 3));
  final TextEditingController _keperluanController = TextEditingController();
  bool _isSubmitting = false;

  final DateFormat _dateFormat = DateFormat('dd MMM yyyy');

  @override
  void dispose() {
    _keperluanController.dispose();
    super.dispose();
  }

  Future<void> _pickDate(bool isPinjam) async {
    final initial = isPinjam ? _tanggalPinjam : _tanggalKembali;
    final firstDate = isPinjam
        ? DateTime.now().subtract(const Duration(days: 1))
        : _tanggalPinjam;
    final lastDate = DateTime.now().add(const Duration(days: 60));

    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: firstDate,
      lastDate: lastDate,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppTheme.primary,
              onPrimary: Colors.white,
              surface: AppTheme.cardLight,
              onSurface: AppTheme.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        if (isPinjam) {
          _tanggalPinjam = picked;
          if (_tanggalKembali.isBefore(_tanggalPinjam)) {
            _tanggalKembali = _tanggalPinjam.add(const Duration(days: 1));
          }
        } else {
          _tanggalKembali = picked;
        }
      });
    }
  }

  Future<void> _submit() async {
    final keperluan = _keperluanController.text.trim();
    if (keperluan.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Silakan masukkan keperluan peminjaman alat.'),
          backgroundColor: AppTheme.warning,
        ),
      );
      return;
    }

    final selectedUnits = widget.allUnits;
    if (selectedUnits.isEmpty) return;

    setState(() => _isSubmitting = true);
    final assetProvider = context.read<AssetProvider>();
    final txProvider = context.read<TransactionProvider>();
    final messenger = ScaffoldMessenger.of(context);
    final nav = Navigator.of(context);

    final success = await assetProvider.pinjamBarang(
      widget.barang.id,
      unitIds: selectedUnits.map((u) => u.id).toList(),
      keperluan: keperluan,
      batasKembali: _dateFormat.format(_tanggalKembali),
    );

    setState(() => _isSubmitting = false);

    if (!mounted) return;
    if (success) {
      // Refresh transaction list
      txProvider.fetchRiwayat();

      final kodeUnitsText = selectedUnits.map((u) => u.kodeUnit).join(', ');

      nav.pushReplacement(
        MaterialPageRoute(
          builder: (_) => PeminjamanBerhasilScreen(
            barang: widget.barang,
            kodeUnit: kodeUnitsText,
            tanggalPinjam: _dateFormat.format(_tanggalPinjam),
            tanggalKembali: _dateFormat.format(_tanggalKembali),
            keperluan: keperluan,
          ),
        ),
      );
    } else {
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            assetProvider.errorMessage ?? 'Peminjaman gagal diajukan.',
          ),
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
          'Form Peminjaman',
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
            if (widget.barang.perluPersetujuan) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFFCD34D)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.shield_outlined, color: Color(0xFFD97706), size: 22),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            'Wajib Izin Langsung Admin',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              color: Color(0xFF92400E),
                            ),
                          ),
                          SizedBox(height: 3),
                          Text(
                            'Alat ini berstatus spesifik. Pengajuan peminjaman akan masuk antrean approval admin sebelum unit dapat diambil & digunakan.',
                            style: TextStyle(
                              fontSize: 11.5,
                              color: Color(0xFFB45309),
                              height: 1.35,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Item & Unit summary card
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 52,
                        height: 52,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.borderLight),
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.handyman,
                            color: AppTheme.primary,
                            size: 26,
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.barang.namaBarang,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${widget.allUnits.length} unit dipilih',
                              style: const TextStyle(
                                color: AppTheme.textMuted,
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Divider(color: AppTheme.borderLight, height: 1),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: widget.allUnits.map((u) {
                      return Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFBFDBFE)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.check_circle,
                              size: 12,
                              color: Color(0xFF2563EB),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              u.kodeUnit,
                              style: const TextStyle(
                                color: Color(0xFF1D4ED8),
                                fontWeight: FontWeight.bold,
                                fontSize: 11,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Tanggal Pinjam
            const Text(
              'Tanggal Pinjam',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 13,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            InkWell(
              onTap: () => _pickDate(true),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 14,
                ),
                decoration: BoxDecoration(
                  color: AppTheme.cardLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.borderLight),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _dateFormat.format(_tanggalPinjam),
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const Icon(
                      Icons.calendar_today_outlined,
                      color: AppTheme.primary,
                      size: 20,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 18),

            // Tanggal Kembali (Batas)
            const Text(
              'Tanggal Kembali (Batas)',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 13,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            InkWell(
              onTap: () => _pickDate(false),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 14,
                ),
                decoration: BoxDecoration(
                  color: AppTheme.cardLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.borderLight),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _dateFormat.format(_tanggalKembali),
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const Icon(
                      Icons.calendar_month_outlined,
                      color: AppTheme.primary,
                      size: 20,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 18),

            // Keperluan
            const Text(
              'Keperluan',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 13,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _keperluanController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Contoh: Praktikum, Perbaikan alat, Proyek...',
                fillColor: AppTheme.cardLight,
                filled: true,
                contentPadding: const EdgeInsets.all(14),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppTheme.borderLight),
                ),
              ),
            ),
            const SizedBox(height: 36),

            // Submit Button
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                minimumSize: const Size.fromHeight(50),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : Text(
                      widget.barang.perluPersetujuan
                          ? 'Ajukan Izin Peminjaman'
                          : 'Ajukan Peminjaman',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
