import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../main_navigation.dart';

class LoginScreen extends StatefulWidget {
  final bool initialIsLogin;
  const LoginScreen({super.key, this.initialIsLogin = true});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late bool _isLogin;

  // Login Form
  final _loginFormKey = GlobalKey<FormState>();
  final _loginController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _rememberMe = false;

  // Register Form
  final _registerFormKey = GlobalKey<FormState>();
  final _namaController = TextEditingController();
  final _regEmailController = TextEditingController();
  final _nipController = TextEditingController();
  final _regPasswordController = TextEditingController();
  final _regConfirmPasswordController = TextEditingController();
  bool _obscureRegPassword = true;
  bool _obscureRegConfirmPassword = true;

  @override
  void initState() {
    super.initState();
    _isLogin = widget.initialIsLogin;
    _loadSavedCredentials();
  }

  Future<void> _loadSavedCredentials() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final remember = prefs.getBool('remember_me') ?? false;
      final savedLogin = prefs.getString('saved_login_identifier') ?? '';
      if (mounted) {
        setState(() {
          _rememberMe = remember;
          if (remember && savedLogin.isNotEmpty) {
            _loginController.text = savedLogin;
          }
        });
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _loginController.dispose();
    _passwordController.dispose();
    _namaController.dispose();
    _regEmailController.dispose();
    _nipController.dispose();
    _regPasswordController.dispose();
    _regConfirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_loginFormKey.currentState!.validate()) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.login(
      _loginController.text.trim(),
      _passwordController.text,
    );

    if (!mounted) return;
    if (success) {
      try {
        final prefs = await SharedPreferences.getInstance();
        if (_rememberMe) {
          await prefs.setBool('remember_me', true);
          await prefs.setString(
            'saved_login_identifier',
            _loginController.text.trim(),
          );
        } else {
          await prefs.setBool('remember_me', false);
          await prefs.remove('saved_login_identifier');
        }
      } catch (_) {}

      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const MainNavigation()),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.errorMessage ?? 'Login gagal.'),
          backgroundColor: AppTheme.danger,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
    }
  }

  Future<void> _handleRegister() async {
    if (!_registerFormKey.currentState!.validate()) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.register(
      nama: _namaController.text.trim(),
      email: _regEmailController.text.trim(),
      nip: _nipController.text.trim().isEmpty ? null : _nipController.text.trim(),
      password: _regPasswordController.text,
      passwordConfirmation: _regConfirmPasswordController.text,
    );

    if (!mounted) return;
    if (success) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const MainNavigation()),
        (route) => false,
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.errorMessage ?? 'Registrasi gagal.'),
          backgroundColor: AppTheme.danger,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
    }
  }

  InputDecoration _fieldDecoration({
    required String hintText,
    Widget? suffixIcon,
    bool isPassword = false,
  }) {
    return InputDecoration(
      hintText: hintText,
      hintStyle: TextStyle(
        color: Colors.grey.shade400,
        fontSize: 14,
        letterSpacing: isPassword ? 2 : 0,
      ),
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 14,
      ),
      filled: true,
      fillColor: Colors.white,
      suffixIcon: suffixIcon,
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(
          color: Color(0xFFE5E7EB),
          width: 1.2,
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(
          color: Color(0xFFD84040),
          width: 1.5,
        ),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(
          color: Color(0xFFEF4444),
          width: 1.2,
        ),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(
          color: Color(0xFFEF4444),
          width: 1.5,
        ),
      ),
    );
  }

  Widget _fieldLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: Color(0xFF4B5563),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: const Color(0xFF8E1616),
      body: Stack(
        children: [
          // 1. Red Topographic Background
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: size.height * 0.45,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Container(color: const Color(0xFF8E1616)),
                Image.asset(
                  'assets/images/login_bg.png',
                  fit: BoxFit.cover,
                ),
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.25),
                        const Color(0xFF8E1616).withValues(alpha: 0.45),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // 2. Foreground Content (Header + White Bottom Sheet)
          SafeArea(
            bottom: false,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top Header (Logo + Title + Subtitle)
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 16, 24, 22),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Top Row: Logo + App Name
                      Row(
                        children: [
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: const Color(0xFFD84040),
                              borderRadius: BorderRadius.circular(9),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.25),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: const Center(
                              child: Text(
                                'W',
                                style: TextStyle(
                                  fontSize: 19,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                  height: 1.0,
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          const Text(
                            'WAMS',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ],
                      ).animate().fadeIn(duration: 400.ms),

                      const SizedBox(height: 20),

                      // Title: "Selamat Datang"
                      const Text(
                        'Selamat Datang',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: -0.5,
                        ),
                      ).animate().fadeIn(delay: 100.ms, duration: 400.ms).slideY(begin: 0.15, end: 0),

                      const SizedBox(height: 6),

                      // Subtitle: "Masukkan Email dan Password anda"
                      Text(
                        'Masukkan Email dan Password anda',
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.white.withValues(alpha: 0.85),
                          fontWeight: FontWeight.normal,
                        ),
                      ).animate().fadeIn(delay: 200.ms, duration: 400.ms),
                    ],
                  ),
                ),

                // White Bottom Sheet Container
                Expanded(
                  child: Container(
                    width: double.infinity,
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                      boxShadow: [
                        BoxShadow(
                          color: Color(0x18000000),
                          blurRadius: 20,
                          offset: Offset(0, -4),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.fromLTRB(24, 22, 24, 32),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // 1. Tab Switcher [Masuk | Daftar] with Sliding Animation
                            Container(
                              height: 48,
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF3F4F6),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: LayoutBuilder(
                                builder: (context, constraints) {
                                  final tabWidth = constraints.maxWidth / 2;
                                  return Stack(
                                    children: [
                                      // Sliding Pill Indicator
                                      AnimatedAlign(
                                        duration: const Duration(milliseconds: 250),
                                        curve: Curves.easeInOutCubic,
                                        alignment: _isLogin
                                            ? Alignment.centerLeft
                                            : Alignment.centerRight,
                                        child: Container(
                                          width: tabWidth,
                                          height: double.infinity,
                                          decoration: BoxDecoration(
                                            color: Colors.white,
                                            borderRadius: BorderRadius.circular(10),
                                            boxShadow: [
                                              BoxShadow(
                                                color: Colors.black.withValues(alpha: 0.08),
                                                blurRadius: 8,
                                                offset: const Offset(0, 2),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),

                                      // Tab Buttons & Text Labels
                                      Row(
                                        children: [
                                          // Tab Masuk
                                          Expanded(
                                            child: GestureDetector(
                                              behavior: HitTestBehavior.opaque,
                                              onTap: () {
                                                if (!_isLogin) {
                                                  setState(() {
                                                    _isLogin = true;
                                                  });
                                                }
                                              },
                                              child: Center(
                                                child: AnimatedDefaultTextStyle(
                                                  duration: const Duration(milliseconds: 200),
                                                  style: TextStyle(
                                                    fontSize: 14,
                                                    fontWeight: _isLogin
                                                        ? FontWeight.w700
                                                        : FontWeight.w500,
                                                    color: _isLogin
                                                        ? const Color(0xFF1D1616)
                                                        : const Color(0xFF6B7280),
                                                  ),
                                                  child: const Text('Masuk'),
                                                ),
                                              ),
                                            ),
                                          ),

                                          // Tab Daftar
                                          Expanded(
                                            child: GestureDetector(
                                              behavior: HitTestBehavior.opaque,
                                              onTap: () {
                                                if (_isLogin) {
                                                  setState(() {
                                                    _isLogin = false;
                                                  });
                                                }
                                              },
                                              child: Center(
                                                child: AnimatedDefaultTextStyle(
                                                  duration: const Duration(milliseconds: 200),
                                                  style: TextStyle(
                                                    fontSize: 14,
                                                    fontWeight: !_isLogin
                                                        ? FontWeight.w700
                                                        : FontWeight.w500,
                                                    color: !_isLogin
                                                        ? const Color(0xFF1D1616)
                                                        : const Color(0xFF6B7280),
                                                  ),
                                                  child: const Text('Daftar'),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  );
                                },
                              ),
                            ),

                            const SizedBox(height: 22),

                            // 2. Form Content with Smooth Sliding / Fade Transition
                            AnimatedSwitcher(
                              duration: const Duration(milliseconds: 280),
                              switchInCurve: Curves.easeOutCubic,
                              switchOutCurve: Curves.easeInCubic,
                              transitionBuilder: (child, animation) {
                                final inAnimation = Tween<Offset>(
                                  begin: const Offset(0.04, 0),
                                  end: Offset.zero,
                                ).animate(animation);
                                return FadeTransition(
                                  opacity: animation,
                                  child: SlideTransition(
                                    position: inAnimation,
                                    child: child,
                                  ),
                                );
                              },
                              child: _isLogin
                                  ? KeyedSubtree(
                                      key: const ValueKey('login_form'),
                                      child: _buildLoginForm(authProvider),
                                    )
                                  : KeyedSubtree(
                                      key: const ValueKey('register_form'),
                                      child: _buildRegisterForm(authProvider),
                                    ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // --- Form Masuk (Log In) ---
  Widget _buildLoginForm(AuthProvider authProvider) {
    return Form(
      key: _loginFormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Email / Username
          _fieldLabel('Email atau Username'),
          TextFormField(
            controller: _loginController,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF1D1616),
              fontWeight: FontWeight.w500,
            ),
            decoration: _fieldDecoration(
              hintText: 'admin@wams.test',
            ),
            validator: (v) => v == null || v.trim().isEmpty
                ? 'Email atau Username wajib diisi'
                : null,
          ),

          const SizedBox(height: 16),

          // Password
          _fieldLabel('Password'),
          TextFormField(
            controller: _passwordController,
            obscureText: _obscurePassword,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF1D1616),
              fontWeight: FontWeight.w500,
            ),
            decoration: _fieldDecoration(
              hintText: '••••••••',
              isPassword: true,
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  size: 20,
                  color: Colors.grey.shade400,
                ),
                onPressed: () {
                  setState(() {
                    _obscurePassword = !_obscurePassword;
                  });
                },
              ),
            ),
            validator: (v) =>
                v == null || v.isEmpty ? 'Password wajib diisi' : null,
          ),

          const SizedBox(height: 16),

          // Remember Me & Forgot Password Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Ingat Saya
              GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () {
                  setState(() {
                    _rememberMe = !_rememberMe;
                  });
                },
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      width: 18,
                      height: 18,
                      decoration: BoxDecoration(
                        color: _rememberMe
                            ? const Color(0xFFD84040)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(
                          color: _rememberMe
                              ? const Color(0xFFD84040)
                              : const Color(0xFF9CA3AF),
                          width: 1.5,
                        ),
                      ),
                      child: _rememberMe
                          ? const Icon(
                              Icons.check,
                              size: 13,
                              color: Colors.white,
                            )
                          : null,
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Ingat saya',
                      style: TextStyle(
                        fontSize: 13,
                        color: Color(0xFF4B5563),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),

              // Lupa Password
              GestureDetector(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text(
                        'Silakan hubungi administrator lab untuk reset password Anda.',
                      ),
                      backgroundColor: const Color(0xFF1D1616),
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  );
                },
                child: const Text(
                  'Lupa Password?',
                  style: TextStyle(
                    fontSize: 13,
                    color: Color(0xFFD84040),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Primary Button: Masuk
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: authProvider.isLoading ? null : _handleLogin,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD84040),
                foregroundColor: Colors.white,
                elevation: 2,
                shadowColor: const Color(0xFFD84040).withValues(alpha: 0.35),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: authProvider.isLoading
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2.2,
                      ),
                    )
                  : const Text(
                      'Masuk',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  // --- Form Daftar (Sign Up) ---
  Widget _buildRegisterForm(AuthProvider authProvider) {
    return Form(
      key: _registerFormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Nama Lengkap
          _fieldLabel('Nama Lengkap'),
          TextFormField(
            controller: _namaController,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF1D1616),
              fontWeight: FontWeight.w500,
            ),
            decoration: _fieldDecoration(hintText: 'Nama Lengkap Anda'),
            validator: (v) => v == null || v.trim().isEmpty
                ? 'Nama lengkap wajib diisi'
                : null,
          ),

          const SizedBox(height: 14),

          // Alamat Email
          _fieldLabel('Alamat Email'),
          TextFormField(
            controller: _regEmailController,
            keyboardType: TextInputType.emailAddress,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF1D1616),
              fontWeight: FontWeight.w500,
            ),
            decoration: _fieldDecoration(hintText: 'nama@email.com'),
            validator: (v) =>
                v == null || !v.contains('@') ? 'Email tidak valid' : null,
          ),

          const SizedBox(height: 14),

          // NIP (Opsional)
          _fieldLabel('NIP (Opsional)'),
          TextFormField(
            controller: _nipController,
            keyboardType: TextInputType.number,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF1D1616),
              fontWeight: FontWeight.w500,
            ),
            decoration: _fieldDecoration(hintText: '1985xxxx...'),
          ),

          const SizedBox(height: 14),

          // Password
          _fieldLabel('Password'),
          TextFormField(
            controller: _regPasswordController,
            obscureText: _obscureRegPassword,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF1D1616),
              fontWeight: FontWeight.w500,
            ),
            decoration: _fieldDecoration(
              hintText: '••••••••',
              isPassword: true,
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureRegPassword
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  size: 20,
                  color: Colors.grey.shade400,
                ),
                onPressed: () {
                  setState(() {
                    _obscureRegPassword = !_obscureRegPassword;
                  });
                },
              ),
            ),
            validator: (v) =>
                v == null || v.length < 6 ? 'Password minimal 6 karakter' : null,
          ),

          const SizedBox(height: 14),

          // Konfirmasi Password
          _fieldLabel('Konfirmasi Password'),
          TextFormField(
            controller: _regConfirmPasswordController,
            obscureText: _obscureRegConfirmPassword,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF1D1616),
              fontWeight: FontWeight.w500,
            ),
            decoration: _fieldDecoration(
              hintText: '••••••••',
              isPassword: true,
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureRegConfirmPassword
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  size: 20,
                  color: Colors.grey.shade400,
                ),
                onPressed: () {
                  setState(() {
                    _obscureRegConfirmPassword = !_obscureRegConfirmPassword;
                  });
                },
              ),
            ),
            validator: (v) {
              if (v != _regPasswordController.text) {
                return 'Konfirmasi password tidak cocok';
              }
              return null;
            },
          ),

          const SizedBox(height: 24),

          // Primary Button: Daftar
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: authProvider.isLoading ? null : _handleRegister,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD84040),
                foregroundColor: Colors.white,
                elevation: 2,
                shadowColor: const Color(0xFFD84040).withValues(alpha: 0.35),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: authProvider.isLoading
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2.2,
                      ),
                    )
                  : const Text(
                      'Daftar',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
