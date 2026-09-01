import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../main_navigation.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _namaController = TextEditingController();
  final _emailController = TextEditingController();
  final _nipController = TextEditingController();
  final _passwordController = TextEditingController();
  final _passwordConfirmController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _namaController.dispose();
    _emailController.dispose();
    _nipController.dispose();
    _passwordController.dispose();
    _passwordConfirmController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.register(
      nama: _namaController.text.trim(),
      email: _emailController.text.trim(),
      nip: _nipController.text.trim().isEmpty ? null : _nipController.text.trim(),
      password: _passwordController.text,
      passwordConfirmation: _passwordConfirmController.text,
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
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      body: Stack(
        children: [
          // 1. Background with Theme Gradient & Organic Contour Lines
          Container(
            width: double.infinity,
            height: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF781212), // Deep WAMS Red
                  Color(0xFF9E1818),
                  Color(0xFFD84040), // WAMS Coral
                ],
              ),
            ),
          ),

          // 2. Custom Painter for Subtle Contour Curve Lines
          Positioned.fill(
            child: CustomPaint(
              painter: ContourBackgroundPainter(),
            ),
          ),

          // 3. Floating Center Card Form
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: double.infinity,
                      constraints: const BoxConstraints(maxWidth: 390),
                      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 30.0),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(28),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.18),
                            blurRadius: 30,
                            offset: const Offset(0, 12),
                          ),
                        ],
                      ),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Header Title
                            const Text(
                              'WAMS',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.w900,
                                letterSpacing: -0.5,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Daftar Akun Teknisi Baru',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 13,
                                color: AppTheme.textMuted,
                                fontWeight: FontWeight.normal,
                              ),
                            ),
                            const SizedBox(height: 24),

                            // Nama Lengkap Input
                            Container(
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F3F9),
                                borderRadius: BorderRadius.circular(18),
                              ),
                              child: TextFormField(
                                controller: _namaController,
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: AppTheme.textPrimary,
                                ),
                                decoration: InputDecoration(
                                  hintText: 'Nama Lengkap',
                                  hintStyle: const TextStyle(
                                    color: Color(0xFF8C93A0),
                                    fontSize: 14,
                                  ),
                                  prefixIcon: const Icon(
                                    Icons.person_outline,
                                    color: Color(0xFF6B7280),
                                    size: 20,
                                  ),
                                  border: InputBorder.none,
                                  enabledBorder: InputBorder.none,
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(18),
                                    borderSide: BorderSide(
                                      color: AppTheme.primary.withValues(alpha: 0.5),
                                      width: 1.5,
                                    ),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 15,
                                  ),
                                ),
                                validator: (v) =>
                                    v == null || v.isEmpty ? 'Nama lengkap wajib diisi' : null,
                              ),
                            ),
                            const SizedBox(height: 12),

                            // Email Input
                            Container(
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F3F9),
                                borderRadius: BorderRadius.circular(18),
                              ),
                              child: TextFormField(
                                controller: _emailController,
                                keyboardType: TextInputType.emailAddress,
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: AppTheme.textPrimary,
                                ),
                                decoration: InputDecoration(
                                  hintText: 'Alamat Email',
                                  hintStyle: const TextStyle(
                                    color: Color(0xFF8C93A0),
                                    fontSize: 14,
                                  ),
                                  prefixIcon: const Icon(
                                    Icons.mail_outline,
                                    color: Color(0xFF6B7280),
                                    size: 20,
                                  ),
                                  border: InputBorder.none,
                                  enabledBorder: InputBorder.none,
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(18),
                                    borderSide: BorderSide(
                                      color: AppTheme.primary.withValues(alpha: 0.5),
                                      width: 1.5,
                                    ),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 15,
                                  ),
                                ),
                                validator: (v) =>
                                    v == null || !v.contains('@') ? 'Email tidak valid' : null,
                              ),
                            ),
                            const SizedBox(height: 12),

                            // NIP Input
                            Container(
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F3F9),
                                borderRadius: BorderRadius.circular(18),
                              ),
                              child: TextFormField(
                                controller: _nipController,
                                keyboardType: TextInputType.number,
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: AppTheme.textPrimary,
                                ),
                                decoration: InputDecoration(
                                  hintText: 'NIP (Opsional)',
                                  hintStyle: const TextStyle(
                                    color: Color(0xFF8C93A0),
                                    fontSize: 14,
                                  ),
                                  prefixIcon: const Icon(
                                    Icons.badge_outlined,
                                    color: Color(0xFF6B7280),
                                    size: 20,
                                  ),
                                  border: InputBorder.none,
                                  enabledBorder: InputBorder.none,
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(18),
                                    borderSide: BorderSide(
                                      color: AppTheme.primary.withValues(alpha: 0.5),
                                      width: 1.5,
                                    ),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 15,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),

                            // Password Input
                            Container(
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F3F9),
                                borderRadius: BorderRadius.circular(18),
                              ),
                              child: TextFormField(
                                controller: _passwordController,
                                obscureText: _obscurePassword,
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: AppTheme.textPrimary,
                                ),
                                decoration: InputDecoration(
                                  hintText: 'Password',
                                  hintStyle: const TextStyle(
                                    color: Color(0xFF8C93A0),
                                    fontSize: 14,
                                  ),
                                  prefixIcon: const Icon(
                                    Icons.lock_outline,
                                    color: Color(0xFF6B7280),
                                    size: 20,
                                  ),
                                  suffixIcon: IconButton(
                                    icon: Icon(
                                      _obscurePassword
                                          ? Icons.visibility_off_outlined
                                          : Icons.visibility_outlined,
                                      size: 19,
                                      color: const Color(0xFF8C93A0),
                                    ),
                                    onPressed: () {
                                      setState(() {
                                        _obscurePassword = !_obscurePassword;
                                      });
                                    },
                                  ),
                                  border: InputBorder.none,
                                  enabledBorder: InputBorder.none,
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(18),
                                    borderSide: BorderSide(
                                      color: AppTheme.primary.withValues(alpha: 0.5),
                                      width: 1.5,
                                    ),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 15,
                                  ),
                                ),
                                validator: (v) =>
                                    v == null || v.length < 6 ? 'Password minimal 6 karakter' : null,
                              ),
                            ),
                            const SizedBox(height: 12),

                            // Password Confirmation Input
                            Container(
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F3F9),
                                borderRadius: BorderRadius.circular(18),
                              ),
                              child: TextFormField(
                                controller: _passwordConfirmController,
                                obscureText: _obscureConfirmPassword,
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: AppTheme.textPrimary,
                                ),
                                decoration: InputDecoration(
                                  hintText: 'Konfirmasi Password',
                                  hintStyle: const TextStyle(
                                    color: Color(0xFF8C93A0),
                                    fontSize: 14,
                                  ),
                                  prefixIcon: const Icon(
                                    Icons.lock_reset,
                                    color: Color(0xFF6B7280),
                                    size: 20,
                                  ),
                                  suffixIcon: IconButton(
                                    icon: Icon(
                                      _obscureConfirmPassword
                                          ? Icons.visibility_off_outlined
                                          : Icons.visibility_outlined,
                                      size: 19,
                                      color: const Color(0xFF8C93A0),
                                    ),
                                    onPressed: () {
                                      setState(() {
                                        _obscureConfirmPassword = !_obscureConfirmPassword;
                                      });
                                    },
                                  ),
                                  border: InputBorder.none,
                                  enabledBorder: InputBorder.none,
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(18),
                                    borderSide: BorderSide(
                                      color: AppTheme.primary.withValues(alpha: 0.5),
                                      width: 1.5,
                                    ),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 15,
                                  ),
                                ),
                                validator: (v) {
                                  if (v != _passwordController.text) {
                                    return 'Konfirmasi password tidak cocok';
                                  }
                                  return null;
                                },
                              ),
                            ),
                            const SizedBox(height: 22),

                            // Submit Pill Button
                            Center(
                              child: Container(
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [
                                      Color(0xFFD84040),
                                      Color(0xFF8E1616),
                                    ],
                                  ),
                                  borderRadius: BorderRadius.circular(20),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFFD84040).withValues(alpha: 0.35),
                                      blurRadius: 16,
                                      offset: const Offset(0, 6),
                                    ),
                                  ],
                                ),
                                child: ElevatedButton(
                                  onPressed: authProvider.isLoading ? null : _handleRegister,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.transparent,
                                    shadowColor: Colors.transparent,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 44,
                                      vertical: 14,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                  ),
                                  child: authProvider.isLoading
                                      ? const SizedBox(
                                          width: 20,
                                          height: 20,
                                          child: CircularProgressIndicator(
                                            color: Colors.white,
                                            strokeWidth: 2,
                                          ),
                                        )
                                      : const Text(
                                          'Daftar',
                                          style: TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                          ),
                                        ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 18),

                            // Back to Login Link
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Text(
                                  'Sudah memiliki akun? ',
                                  style: TextStyle(
                                    color: AppTheme.textMuted,
                                    fontSize: 12,
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () {
                                    Navigator.pop(context);
                                  },
                                  child: const Text(
                                    'Masuk',
                                    style: TextStyle(
                                      color: AppTheme.primary,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
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

/// Custom painter to draw organic contour / topographic wave lines on background
class ContourBackgroundPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.08)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 32
      ..strokeCap = StrokeCap.round;

    final path1 = Path()
      ..moveTo(-size.width * 0.2, size.height * 0.15)
      ..cubicTo(
        size.width * 0.3,
        size.height * 0.05,
        size.width * 0.4,
        size.height * 0.35,
        size.width * 1.2,
        size.height * 0.3,
      );
    canvas.drawPath(path1, paint);

    final path2 = Path()
      ..moveTo(-size.width * 0.2, size.height * 0.38)
      ..cubicTo(
        size.width * 0.35,
        size.height * 0.28,
        size.width * 0.5,
        size.height * 0.6,
        size.width * 1.2,
        size.height * 0.52,
      );
    canvas.drawPath(path2, paint..strokeWidth = 40);

    final path3 = Path()
      ..moveTo(-size.width * 0.1, size.height * 0.62)
      ..cubicTo(
        size.width * 0.4,
        size.height * 0.48,
        size.width * 0.6,
        size.height * 0.82,
        size.width * 1.2,
        size.height * 0.72,
      );
    canvas.drawPath(path3, paint..strokeWidth = 48);

    final path4 = Path()
      ..moveTo(size.width * 0.1, size.height * 0.85)
      ..cubicTo(
        size.width * 0.5,
        size.height * 0.72,
        size.width * 0.7,
        size.height * 1.05,
        size.width * 1.3,
        size.height * 0.95,
      );
    canvas.drawPath(path4, paint..strokeWidth = 56);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
