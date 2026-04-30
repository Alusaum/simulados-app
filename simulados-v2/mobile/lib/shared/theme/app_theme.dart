// lib/shared/theme/app_theme.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color gold    = Color(0xFFC8922A);
  static const Color ink     = Color(0xFF0A0A0A);
  static const Color bgDark  = Color(0xFF0D0F14);
  static const Color bgCard  = Color(0xFF141720);
  static const Color border  = Color(0xFF252A3A);
  static const Color green   = Color(0xFF34D399);
  static const Color red     = Color(0xFFF87171);

  static ThemeData get dark => ThemeData(
    brightness:      Brightness.dark,
    scaffoldBackgroundColor: bgDark,
    primaryColor:    gold,
    colorScheme:     const ColorScheme.dark(
      primary:   gold,
      secondary: gold,
      surface:   bgCard,
    ),
    textTheme: GoogleFonts.dmSansTextTheme(ThemeData.dark().textTheme),
    appBarTheme: AppBarTheme(
      backgroundColor: bgDark,
      elevation:       0,
      titleTextStyle:  GoogleFonts.instrumentSerif(
        fontSize: 20, fontWeight: FontWeight.w600, color: Colors.white,
      ),
      iconTheme: const IconThemeData(color: Colors.white),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled:      true,
      fillColor:   Colors.white.withOpacity(.05),
      border:      OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide:   BorderSide(color: Colors.white.withOpacity(.1)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide:   BorderSide(color: Colors.white.withOpacity(.1)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide:   const BorderSide(color: gold),
      ),
      hintStyle: TextStyle(color: Colors.white.withOpacity(.3)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: gold,
        foregroundColor: ink,
        textStyle:       GoogleFonts.dmSans(fontWeight: FontWeight.w700),
        shape:           RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        minimumSize:     const Size(double.infinity, 50),
        elevation:       0,
      ),
    ),
    cardTheme: CardTheme(
      color:  bgCard,
      shape:  RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side:         BorderSide(color: Colors.white.withOpacity(.07)),
      ),
      elevation: 0,
      margin:    EdgeInsets.zero,
    ),
  );
}
