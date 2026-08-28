import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../core/theme.dart';
import '../kategori/barang_kategori_screen.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  final MobileScannerController _cameraController = MobileScannerController();
  final TextEditingController _manualInputController = TextEditingController();
  bool _isProcessing = false;

  @override
  void dispose() {
    _cameraController.dispose();
    _manualInputController.dispose();
    super.dispose();
  }

  void _handleBarcode(String rawValue) {
    if (_isProcessing) return;
    _isProcessing = true;

    // Pattern format QR kategori: /scan/kategori/{id} atau digit langsung
    int? kategoriId;
    final match = RegExp(r'\/scan\/kategori\/(\d+)').firstMatch(rawValue);
    if (match != null) {
      kategoriId = int.tryParse(match.group(1)!);
    } else {
      kategoriId = int.tryParse(rawValue.trim());
    }

    if (kategoriId != null) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => BarangKategoriScreen(
            kategoriId: kategoriId!,
            namaKategori: 'Kategori #$kategoriId',
          ),
        ),
      ).then((_) {
        _isProcessing = false;
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('QR Code tidak valid untuk kategori workshop.'),
          backgroundColor: AppTheme.danger,
        ),
      );
      Future.delayed(const Duration(seconds: 2), () {
        _isProcessing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan QR Code Kategori'),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on_outlined),
            onPressed: () => _cameraController.toggleTorch(),
          ),
          IconButton(
            icon: const Icon(Icons.cameraswitch_outlined),
            onPressed: () => _cameraController.switchCamera(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Scanner Camera Area
          Expanded(
            flex: 5,
            child: Stack(
              alignment: Alignment.center,
              children: [
                MobileScanner(
                  controller: _cameraController,
                  onDetect: (capture) {
                    final List<Barcode> barcodes = capture.barcodes;
                    for (final barcode in barcodes) {
                      if (barcode.rawValue != null) {
                        _handleBarcode(barcode.rawValue!);
                        break;
                      }
                    }
                  },
                ),
                // Scanning Box Overlay
                Container(
                  width: 250,
                  height: 250,
                  decoration: BoxDecoration(
                    border: Border.all(color: AppTheme.primary, width: 2.5),
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
              ],
            ),
          ),

          // Manual Simulator Input & Info
          Expanded(
            flex: 3,
            child: Container(
              padding: const EdgeInsets.all(20),
              color: AppTheme.bgDark,
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'Posisikan QR Code di dalam kotak pemindai',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                    ),
                    const SizedBox(height: 16),
                    const Divider(color: AppTheme.borderDark),
                    const SizedBox(height: 12),
                    const Text(
                      'Input Manual / Simulator ID Kategori:',
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _manualInputController,
                            keyboardType: TextInputType.text,
                            decoration: const InputDecoration(
                              hintText: 'Contoh: /scan/kategori/1 atau 1',
                              contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: () {
                            if (_manualInputController.text.isNotEmpty) {
                              _handleBarcode(_manualInputController.text);
                            }
                          },
                          child: const Text('Buka'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
