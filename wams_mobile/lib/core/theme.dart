import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Palet Warna Utama (Sesuai Desain & Web Admin WAMS)
  static const Color darkSlate = Color(0xFF1D1616); // #1D1616
  static const Color industrialSlate = Color(0xFF0F172A); // Slate 900
  static const Color primaryDark = Color(0xFF8E1616); // #8E1616
  static const Color primary = Color(0xFFD84040); // #D84040 (Coral)
  static const Color bgLight = Color(
    0xFFF8FAFC,
  ); // #F8FAFC (Crisp Cool Background)
  static const Color cardLight = Color(0xFFFFFFFF); // #FFFFFF (Card Surface)
  static const Color borderLight = Color(0xFFE2E8F0); // #E2E8F0
  static const Color borderCrisp = Color(0xFFCBD5E1); // #CBD5E1 (1.2-1.5px Sharp Border)
  static const Color textPrimary = Color(0xFF0F172A); // High-contrast Slate 900
  static const Color textMuted = Color(0xFF64748B); // Slate 500

  // Aliases for compatibility
  static const Color accent = Color(0xFF8E1616);
  static const Color bgDark = bgLight;
  static const Color cardDark = cardLight;
  static const Color borderDark = borderCrisp;

  // Status & Utility Colors (Industrial High-Contrast)
  static const Color success = Color(0xFF059669);
  static const Color warning = Color(0xFFD97706);
  static const Color danger = Color(0xFFDC2626);

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: bgLight,
    fontFamily: GoogleFonts.poppins().fontFamily,
    textTheme: GoogleFonts.poppinsTextTheme(),
    primaryTextTheme: GoogleFonts.poppinsTextTheme(),
    colorScheme: const ColorScheme.light(
      primary: primary,
      secondary: primaryDark,
      surface: cardLight,
      error: danger,
      onPrimary: Colors.white,
      onSurface: textPrimary,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: cardLight,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: true,
      iconTheme: const IconThemeData(color: textPrimary),
      titleTextStyle: GoogleFonts.poppins(
        color: textPrimary,
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
    ),
    cardTheme: CardThemeData(
      color: cardLight,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: borderLight, width: 1),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: cardLight,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: borderLight),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: borderLight),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primary, width: 1.5),
      ),
      hintStyle: GoogleFonts.poppins(
        color: const Color(0xFF9CA3AF),
        fontSize: 14,
      ),
      labelStyle: GoogleFonts.poppins(color: textMuted, fontSize: 14),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold),
      ),
    ),
  );

  // Backward compatibility alias
  static ThemeData get darkTheme => lightTheme;
}
