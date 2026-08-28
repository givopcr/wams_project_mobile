import 'package:flutter_test/flutter_test.dart';
import 'package:wams_mobile/main.dart';

void main() {
  testWidgets('WAMS App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const WamsApp());
    expect(find.byType(WamsApp), findsOneWidget);
  });
}
