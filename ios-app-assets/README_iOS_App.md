# تطبيق DevelBot على iOS — دليل التسليم

## إيش سويت (جاهز 100%، مو محتاج أي شي إضافي)

- مشروع Capacitor كامل داخل `ios/` (فتحته فعلياً بأمر `cap add ios` واشتغل بدون مشاكل —
  Capacitor 8 يستخدم Swift Package Manager بدل CocoaPods، فما يحتاج تثبيت إضافي).
- `capacitor.config.ts` بالجذر: يغلّف الموقع الحي `https://devel-bot.space` مباشرة
  (`server.url`) — أي تحديث تنشره على الموقع ينعكس بالتطبيق تلقائياً، بدون ما تحتاج
  تبني نسخة تطبيق جديدة وترفعها لـApp Store كل مرة تعدّل بالموقع.
- أيقونة التطبيق (1024×1024، شعار DevelBot بس بدون الكتابة، خلفية داكنة تطابق هوية
  الموقع) مثبّتة بـ `ios/App/App/Assets.xcassets/AppIcon.appiconset/`.
- شاشة البداية (Splash) بنفس الشعار والخلفية الداكنة، مثبّتة بـ
  `ios/App/App/Assets.xcassets/Splash.imageset/`.
- `Info.plist`: اسم العرض "DevelBot"، Bundle ID `com.develbot.app`، الإصدار 1.0،
  ودعم التنبيهات الفورية (`UIBackgroundModes: remote-notification`) مفعّل.
- بلَجنات مثبّتة وجاهزة: `@capacitor/push-notifications`، `@capacitor/splash-screen`،
  `@capacitor/status-bar`.
- نسخة احتياطية من الشعار الأصلي والأيقونة/السبلاش المولّدة موجودة بمجلد
  `ios-app-assets/` (لو احتجت تعدّل عليها أو تولّد أحجام إضافية).

## إيش ناقص (يحتاج جهاز Mac — ما قدرت أسويها من Windows)

### 1) التسجيل والحسابات (يديك أنت، خارج نطاقي)
- حساب Apple Developer Program فعّال (99$/سنة) — https://developer.apple.com
- تسجيل الدخول بحسابك بـXcode (Xcode → Settings → Accounts)

### 2) على جهاز Mac
```bash
# 1. اسحب/انسخ مجلد aria-website كامل (يشمل ios/) على الـMac
# 2. ثبّت الاعتماديات
npm install

# 3. افتح المشروع بـXcode مباشرة
npx cap open ios
```

### 3) داخل Xcode
1. اختر target **App** → تبويب **Signing & Capabilities**.
2. فعّل **Automatically manage signing**، واختر **Team** حسابك (Apple Developer).
3. لو Bundle ID `com.develbot.app` مسجّل من قبل بحساب ثاني، غيّره لشي فريد
   (مثلاً `com.<اسمك>.develbot`) بنفس الحقل هذا + بملف `capacitor.config.ts`
   (`appId`)، وسوّي `npx cap sync ios` من جديد.
4. لو بتفعّل Push Notifications فعلياً: تبويب Signing & Capabilities → **+ Capability**
   → **Push Notifications**، وتولّد مفتاح APNs من developer.apple.com وتربطه
   بالباك اند (نظام إرسال الإشعارات الحالي بالبوت يرسل عبر تلقرام بس، يحتاج
   عمل إضافي لو تبي تنبيهات push حقيقية جوة التطبيق نفسه أيضاً — مو مربوط حالياً).
5. جرّب على المحاكي (Simulator) أو جهازك الشخصي (Xcode → اختر جهاز → ▶️ Run).

### 4) الرفع لـApp Store Connect
1. Xcode → **Product → Archive** (يحتاج جهاز حقيقي أو "Any iOS Device"، مو Simulator).
2. من نافذة Organizer اللي تفتح: **Distribute App → App Store Connect → Upload**.
3. بموقع App Store Connect (appstoreconnect.apple.com):
   - أنشئ سجل تطبيق جديد بنفس Bundle ID.
   - ارفع سكرين شوتات (مطلوبة لكل حجم شاشة — أقلها iPhone 6.7" و6.5").
   - وصف التطبيق + الكلمات المفتاحية.
   - رابط سياسة الخصوصية: `https://devel-bot.space/privacy` (موجود جاهز).
   - رابط الشروط: `https://devel-bot.space/terms`.
   - صنّف التطبيق (على الأغلب: Finance).
4. أرسل للمراجعة.

### ⚠️ ملاحظة مهمة عن قبول Apple
تطبيقات "تغليف موقع" (WebView wrapper) أحياناً تُرفض من Apple لو حسّوا إنه
"مجرد موقع بإطار تطبيق" بدون قيمة إضافية حقيقية. عشان تزيد فرصة القبول:
- فعّل Push Notifications حقيقية (مو بس المكوّن مثبّت).
- استخدم أزرار/تنقل التطبيق الأصلية (Capacitor يوفر هذا جزئياً عبر status bar
  وsplash screen المضبوطين أصلاً).
- وضّح بوصف التطبيق إنه أداة تنبيهات تداول حية، مو مجرد متصفح لموقع.

## اختبار سريع بدون Mac (اختياري)
تقدر تتأكد إن كل شي جاهز صح بفحص هذا الملف نفسه + `capacitor.config.ts` +
`ios/App/App/Info.plist` — كل الإعدادات موصوفة أعلاه موجودة فعلاً بالمشروع،
مو مجرد خطة.
