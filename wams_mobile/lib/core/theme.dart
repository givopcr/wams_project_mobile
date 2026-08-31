import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Palet Warna Utama (Sesuai Desain & Web Admin WAMS)
  static const Color darkSlate = Color(0xFF1D1616); // #1D1616
  static const Color primaryDark = Color(0xFF8E1616); // #8E1616
  static const Color primary = Color(0xFFD84040); // #D84040 (Coral)
  static const Color bgLight = Color(0xFFEEEEEE); // #EEEEEE (Light Warm Background)
  static const Color cardLight = Color(0xFFFFFFFF); // #FFFFFF (Card Surface)
  static const Color borderLight = Color(0xFFE0E0E0); // #E0E0E0 (Border Subtil)
  static const Color textPrimary = Color(0xFF1D1616); // #1D1616 (Main Text)
  static const Color textMuted = Color(0xFF6B7280); // Muted / Subtitle Gray

  // Aliases for compatibility
  static const Color accent = Color(0xFF8E1616);
  static const Color bgDark = bgLight;
  static const Color cardDark = cardLight;
  static const Color borderDark = borderLight;

  // Status & Utility Colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color danger = Color(0xFFEF4444);

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: bgLight,
    textTheme: GoogleFonts.interTextTheme(),
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
      titleTextStyle: GoogleFonts.inter(
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
      hintStyle: GoogleFonts.inter(color: const Color(0xFF9CA3AF), fontSize: 14),
      labelStyle: GoogleFonts.inter(color: textMuted, fontSize: 14),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        textStyle: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold),
      ),
    ),
  );

  // Backward compatibility alias
  static ThemeData get darkTheme => lightTheme;
}

