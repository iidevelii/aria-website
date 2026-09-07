import type { CapacitorConfig } from '@capacitor/cli';

// يغلّف الموقع الحي (devel-bot.space) بدل تصدير نسخة ثابتة -- الموقع فيه
// صفحات ديناميكية كثيرة (داشبورد، سكانر، مصادقة JWT، API حي) ما تشتغل
// بتصدير Next.js الثابت (next export). أي تحديث على الموقع الحي ينعكس على
// التطبيق تلقائياً بدون إعادة بناء/رفع نسخة جديدة لـApp Store.
const config: CapacitorConfig = {
  // مختلف عمداً عن com.develbot.app (تطبيق Flutter المستقل، على TestFlight
  // فعلاً) -- الاثنان كانا يتشاركان نفس المعرّف، وأبل لا تسمح برفع تطبيقين
  // مختلفين بنفس Bundle ID. هذا الغلاف (نسخة ويب مغلّفة بـCapacitor) يبقى
  // com.develbot.web إذا احتجناه لاحقاً، بينما Flutter يبقى المسار الأساسي.
  appId: 'com.develbot.web',
  appName: 'DevelBot',
  webDir: 'public', // Capacitor يتطلب مجلد ما، لكنه غير مُستخدم فعلياً طالما server.url مضبوط
  server: {
    url: 'https://devel-bot.space',
    androidScheme: 'https',
    iosScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0b0e14', // نفس --bg بالموقع (dark navy) -- يمنع ومضة بيضاء وقت تشغيل التطبيق
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: '#0b0e14',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK', // نص/أيقونات الحالة فاتحة تناسب الخلفية الغامقة
    },
  },
};

export default config;
