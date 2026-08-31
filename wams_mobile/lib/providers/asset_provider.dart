import 'package:flutter/material.dart';
import '../models/barang_model.dart';
import '../models/kategori_model.dart';
import '../services/api_service.dart';

import '../models/barang_unit_model.dart';

class AssetProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<KategoriModel> _categories = [];
  List<BarangModel> _categoryItems = [];
  KategoriModel? _selectedCategory;
  BarangModel? _detailBarang;
  List<BarangUnitModel> _barangUnits = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<KategoriModel> get categories => _categories;
  List<BarangModel> get categoryItems => _categoryItems;
  KategoriModel? get selectedCategory => _selectedCategory;
  BarangModel? get detailBarang => _detailBarang;
  List<BarangUnitModel> get barangUnits => _barangUnits;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchCategories() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final data = await _apiService.getKategori();
      _categories = data.map((json) => KategoriModel.fromJson(json)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
    }
  }

  Future<void> fetchBarangByKategori(int kategoriId, {String? query}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await _apiService.getBarangByKategori(kategoriId, query: query);
      if (res['kategori'] != null) {
        _selectedCategory = KategoriModel.fromJson(res['kategori']);
      }
      final List list = res['data'] ?? [];
      _categoryItems = list.map((json) => BarangModel.fromJson(json)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
    }
  }

  Future<void> fetchDetailBarang(int id) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final data = await _apiService.getDetailBarang(id);
      _detailBarang = BarangModel.fromJson(data);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
    }
  }

  Future<void> fetchBarangUnits(int barangId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final list = await _apiService.getBarangUnits(barangId);
      _barangUnits = list.map((json) => BarangUnitModel.fromJson(json)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
    }
  }

  Future<bool> pinjamBarang(int barangId, {int? unitId}) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _apiService.pinjamBarang(barangId, unitId: unitId);
      // Refresh detail barang & units
      await fetchDetailBarang(barangId);
      await fetchBarangUnits(barangId);
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
