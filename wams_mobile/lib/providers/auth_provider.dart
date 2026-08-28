import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  UserModel? _user;
  UserProfileModel? _userProfile;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get user => _user;
  UserProfileModel? get userProfile => _userProfile;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _user != null;

  Future<bool> checkAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    if (token == null) return false;

    try {
      final profileData = await _apiService.getProfile();
      _userProfile = UserProfileModel.fromJson(profileData);
      _user = UserModel(
        id: _userProfile!.id,
        nama: _userProfile!.nama,
        email: _userProfile!.email,
        nip: _userProfile!.nip,
        role: _userProfile!.role,
      );
      notifyListeners();
      return true;
    } catch (_) {
      await prefs.remove('auth_token');
      _user = null;
      _userProfile = null;
      notifyListeners();
      return false;
    }
  }

  Future<bool> login(String loginInput, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiService.login(loginInput, password);
      final userData = response['data']['user'];
      _user = UserModel.fromJson(userData);
      await fetchProfile();
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

  Future<bool> register({
    required String nama,
    required String email,
    String? nip,
    required String password,
    required String passwordConfirmation,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiService.register(
        nama: nama,
        email: email,
        nip: nip,
        password: password,
        passwordConfirmation: passwordConfirmation,
      );
      final userData = response['data']['user'];
      _user = UserModel.fromJson(userData);
      await fetchProfile();
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

  Future<void> fetchProfile() async {
    try {
      final profileData = await _apiService.getProfile();
      _userProfile = UserProfileModel.fromJson(profileData);
      notifyListeners();
    } catch (_) {}
  }

  Future<void> logout() async {
    await _apiService.logout();
    _user = null;
    _userProfile = null;
    notifyListeners();
  }
}
