import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../core/theme.dart';

/// Base Shimmer wrapper for WAMS Mobile
class WamsShimmer extends StatelessWidget {
  final Widget child;
  final Color? baseColor;
  final Color? highlightColor;

  const WamsShimmer({
    super.key,
    required this.child,
    this.baseColor,
    this.highlightColor,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: baseColor ?? const Color(0xFFE5E7EB),
      highlightColor: highlightColor ?? const Color(0xFFF9FAFB),
      period: const Duration(milliseconds: 1400),
      child: child,
    );
  }
}

/// Generic skeleton rectangle/box with rounded corners
class WamsSkeletonBox extends StatelessWidget {
  final double? width;
  final double? height;
  final double borderRadius;

  const WamsSkeletonBox({
    super.key,
    this.width,
    this.height,
    this.borderRadius = 8,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(borderRadius),
      ),
    );
  }
}

/// Shimmer card matching the dimensions and layout of equipment cards
class WamsSkeletonCard extends StatelessWidget {
  const WamsSkeletonCard({super.key});

  @override
  Widget build(BuildContext context) {
    return WamsShimmer(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.borderLight),
        ),
        child: Row(
          children: [
            // Thumbnail skeleton
            const WamsSkeletonBox(
              width: 52,
              height: 52,
              borderRadius: 12,
            ),
            const SizedBox(width: 14),
            // Text rows skeleton
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  WamsSkeletonBox(
                    width: MediaQuery.of(context).size.width * 0.45,
                    height: 14,
                    borderRadius: 4,
                  ),
                  const SizedBox(height: 8),
                  const WamsSkeletonBox(
                    width: 100,
                    height: 11,
                    borderRadius: 4,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            // Pill badge skeleton
            const WamsSkeletonBox(
              width: 68,
              height: 24,
              borderRadius: 12,
            ),
          ],
        ),
      ),
    );
  }
}

/// Shimmer card matching category cards on the dashboard
class WamsSkeletonCategory extends StatelessWidget {
  const WamsSkeletonCategory({super.key});

  @override
  Widget build(BuildContext context) {
    return WamsShimmer(
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppTheme.borderLight),
        ),
        child: Row(
          children: [
            const WamsSkeletonBox(
              width: 42,
              height: 42,
              borderRadius: 10,
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  WamsSkeletonBox(width: 120, height: 13, borderRadius: 4),
                  SizedBox(height: 6),
                  WamsSkeletonBox(width: 70, height: 10, borderRadius: 4),
                ],
              ),
            ),
            const WamsSkeletonBox(width: 18, height: 18, borderRadius: 4),
          ],
        ),
      ),
    );
  }
}

/// Shimmer placeholder for the Detail Barang screen
class WamsSkeletonDetail extends StatelessWidget {
  const WamsSkeletonDetail({super.key});

  @override
  Widget build(BuildContext context) {
    return WamsShimmer(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            // Top hero image card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.borderLight),
              ),
              child: Column(
                children: const [
                  WamsSkeletonBox(width: 140, height: 140, borderRadius: 16),
                  SizedBox(height: 18),
                  WamsSkeletonBox(width: 180, height: 18, borderRadius: 6),
                  SizedBox(height: 10),
                  WamsSkeletonBox(width: 90, height: 22, borderRadius: 12),
                ],
              ),
            ),
            const SizedBox(height: 20),
            // Info specs box
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  WamsSkeletonBox(width: 120, height: 14, borderRadius: 4),
                  SizedBox(height: 16),
                  WamsSkeletonBox(width: double.infinity, height: 12, borderRadius: 4),
                  SizedBox(height: 8),
                  WamsSkeletonBox(width: 220, height: 12, borderRadius: 4),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
