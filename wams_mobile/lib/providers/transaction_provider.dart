import 'package:flutter/material.dart';
import '../models/riwayat_model.dart';
import '../services/api_service.dart';

class TransactionProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<RiwayatModel> _riwayatList = [];
  bool _isLoading = false;
  String? _errorMessage;
  String _selectedFilter = ''; // '' | 'dipinjam' | 'dikembalikan'

  List<RiwayatModel> get riwayatList => _riwayatList;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get selectedFilter => _selectedFilter;

  void setFilter(String filter) {
    _selectedFilter = filter;
    fetchRiwayat();
  }

  Future<void> fetchRiwayat({String? query}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final data = await _apiService.getRiwayat(
        status: _selectedFilter.isEmpty ? null : _selectedFilter,
        query: query,
      );
      _riwayatList = data.map((json) => RiwayatModel.fromJson(json)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
    }
  }

  Future<bool> returnItem({required int logbookId, required String kondisi}) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _apiService.kembalikanBarang(logbookId: logbookId, kondisiKembali: kondisi);
      await fetchRiwayat();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }
  }
}
