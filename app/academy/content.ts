// محتوى أكاديمية DevelBot, نفس مواضيع كتاب "Trade Well" (الشموع اليابانية،
// النماذج السعرية، المؤشرات الفنية، تحديد مستويات السعر، إدارة المخاطر)
// بشرح مُعاد صياغته (مو نسخ حرفي) وبتصميم جديد بالكامل.

export type L2 = [string, string] // [عربي, English]

export type Concept = {
  id: string
  name: L2
  emoji?: string
  desc: L2
  points?: L2[]
  diagram?: string
  tip?: L2
}

export type Section = { id: string; name: L2; concepts: Concept[] }
export type Chapter = { id: string; name: L2; icon: string; color: string; note?: L2; sections: Section[] }

const botPatternNote: L2 = [
  'بوت DevelBot يكتشف كل هذي النماذج تلقائياً على أكثر من 100 عملة. فعّلها من أمر /patterns بتلقرام أو من صفحة منشئ الاستراتيجيات بالموقع.',
  'DevelBot automatically detects all these patterns across 100+ coins. Activate them via /patterns on Telegram or from the Strategy Builder page.',
]
const botIndicatorNote: L2 = [
  'كل المؤشرات بهذا القسم من ضمن المؤشرات اللي يراقبها سكانر DevelBot لحظياً على كل عملة، وتقدر تبني شرط مخصص على أي منها من منشئ الاستراتيجيات.',
  "Every indicator in this chapter is one that DevelBot's scanner tracks live on every coin, and you can build a custom condition on any of them from the Strategy Builder.",
]
const botRiskNote: L2 = [
  'كل إشارة توصلك من DevelBot تجي جاهزة بالدخول والهدف والوقف محسوبين حسب هذي المبادئ بالضبط.',
  'Every signal you get from DevelBot arrives with entry, target, and stop loss already calculated using exactly these principles.',
]

export const CHAPTERS: Chapter[] = [
  {
    id: 'candlesticks', icon: '🕯️', color: '#00c4ef',
    name: ['الشموع اليابانية', 'Japanese Candlesticks'],
    sections: [
      {
        id: 'bullish', name: ['الشموع الصاعدة', 'Bullish Candlesticks'],
        concepts: [
          { id: 'hammer', name: ['المطرقة', 'Hammer'], diagram: 'hammer',
            desc: ['شمعة بجسم صغير وذيل سفلي طويل، تظهر بعد هبوط وتشير لاحتمال ارتداد السعر للصعود.', 'A small body with a long lower wick that appears after a decline, signaling a possible bullish reversal.'] },
          { id: 'inv-hammer', name: ['المطرقة المقلوبة', 'Inverted Hammer'], diagram: 'inv-hammer',
            desc: ['عكس المطرقة، جسم صغير وذيل علوي طويل بعد هبوط، إشارة انعكاس صعودي محتملة.', 'The mirror of the Hammer, small body, long upper wick after a decline, a potential bullish reversal signal.'] },
          { id: 'piercing', name: ['نموذج الثقب', 'Piercing Pattern'], diagram: 'piercing',
            desc: ['شمعتان: هبوطية ثم صعودية تفتح تحت قاع الأولى وتغلق فوق منتصف جسمها بأكثر من 50%.', 'Two candles: a bearish one followed by a bullish one that opens below its low and closes above its midpoint.'] },
          { id: 'bull-engulf', name: ['الابتلاعية الصاعدة', 'Bullish Engulfing'], diagram: 'engulf-bull',
            desc: ['شمعة صعودية كبيرة تبتلع تماماً جسم الشمعة الهبوطية السابقة لها، إشارة انعكاس قوية.', 'A large bullish candle that fully engulfs the prior bearish candle\'s body, a strong reversal signal.'] },
          { id: 'morning-star', name: ['نجمة الصباح', 'Morning Star'], diagram: 'star-morning',
            desc: ['3 شموع: هبوطية، ثم صغيرة (قد تكون دوجي)، ثم صعودية تغلق فوق منتصف الشمعة الأولى.', 'Three candles: bearish, then small (often a doji), then bullish closing above the first candle\'s midpoint.'] },
          { id: 'three-white', name: ['الثلاث جنود البيض', 'Three White Soldiers'], diagram: 'three-up',
            desc: ['3 شموع صعودية متتالية، كل واحدة تفتح داخل سابقتها وتغلق عند أعلى مستوى، زخم شرائي قوي.', 'Three consecutive bullish candles, each opening within the last and closing near its high, strong buying momentum.'] },
          { id: 'bull-marubozu', name: ['ماروبوزو صاعدة', 'Bullish Marubozu'], diagram: 'marubozu-bull',
            desc: ['شمعة صعودية بجسم طويل بدون ذيول، سيطرة كاملة للمشترين طوال الفترة.', 'A long bullish body with no wicks, buyers were in full control the entire period.'] },
          { id: 'three-inside-up', name: ['3 شموع صاعدية داخلة', 'Three Inside Up'], diagram: 'harami-bull',
            desc: ['هبوطية، تليها صعودية صغيرة داخل جسمها، ثم صعودية تغلق فوق الشمعة الأولى.', 'A bearish candle, a small bullish one inside its body, then a bullish close above the first candle.'] },
          { id: 'bull-harami', name: ['هارامي صاعد', 'Bullish Harami'], diagram: 'harami-bull',
            desc: ['شمعة هبوطية كبيرة تليها شمعة صعودية صغيرة داخل جسمها، تراجع في قوة البائعين.', 'A large bearish candle followed by a small bullish candle inside its body, selling pressure fading.'] },
          { id: 'tweezers-bottom', name: ['ملقاط القيعان', 'Tweezers Bottoms'], diagram: 'tweezers-bottom',
            desc: ['شمعتان متجاورتان بنفس مستوى القاع تقريباً في نهاية هبوط، إشارة انعكاس قوية.', 'Two adjacent candles with nearly the same low at the end of a decline, a strong reversal signal.'] },
        ],
      },
      {
        id: 'bearish', name: ['الشموع الهابطة', 'Bearish Candlesticks'],
        concepts: [
          { id: 'hanging-man', name: ['الرجل المشنوق', 'Hanging Man'], diagram: 'hanging-man',
            desc: ['نفس شكل المطرقة لكن يظهر بعد صعود، إشارة تحذيرية لاحتمال انعكاس هابط.', 'Same shape as the Hammer but appears after an uptrend, a warning of a possible bearish reversal.'] },
          { id: 'shooting-star', name: ['الشهاب', 'Shooting Star'], diagram: 'shooting-star',
            desc: ['جسم صغير وذيل علوي طويل بعد صعود، رفض قوي من البائعين عند القمة.', 'Small body, long upper wick after a rally, strong seller rejection at the top.'] },
          { id: 'dark-cloud', name: ['الغيمة الداكنة', 'Dark Cloud Cover'], diagram: 'dark-cloud',
            desc: ['شمعة صعودية يتبعها شمعة هبوطية تفتح فوق قمة الأولى وتغلق تحت منتصفها.', 'A bullish candle followed by a bearish one that opens above its high and closes below its midpoint.'] },
          { id: 'bear-engulf', name: ['الابتلاعية الهابطة', 'Bearish Engulfing'], diagram: 'engulf-bear',
            desc: ['شمعة هبوطية كبيرة تبتلع تماماً جسم الشمعة الصعودية السابقة، إشارة انعكاس قوية.', 'A large bearish candle that fully engulfs the prior bullish candle\'s body, a strong reversal signal.'] },
          { id: 'evening-star', name: ['نجمة المساء', 'Evening Star'], diagram: 'star-evening',
            desc: ['3 شموع: صعودية، ثم صغيرة، ثم هبوطية تغلق تحت منتصف الشمعة الأولى، عكس نجمة الصباح.', 'Three candles: bullish, small, then bearish closing below the first candle\'s midpoint, the mirror of Morning Star.'] },
          { id: 'three-black', name: ['الغربان الثلاثة السود', 'Three Black Crows'], diagram: 'three-down',
            desc: ['3 شموع هبوطية متتالية تغلق كل واحدة عند أدنى مستوى، زخم بيعي قوي.', 'Three consecutive bearish candles each closing near its low, strong selling momentum.'] },
          { id: 'bear-marubozu', name: ['ماروبوزو هابطة', 'Bearish Marubozu'], diagram: 'marubozu-bear',
            desc: ['شمعة هبوطية بجسم طويل بدون ذيول، سيطرة كاملة للبائعين طوال الفترة.', 'A long bearish body with no wicks, sellers were in full control the entire period.'] },
          { id: 'three-inside-down', name: ['3 شموع هابطة داخلة', 'Three Inside Down'], diagram: 'harami-bear',
            desc: ['صعودية، تليها هبوطية صغيرة داخل جسمها، ثم هبوطية تغلق تحت الشمعة الأولى.', 'A bullish candle, a small bearish one inside its body, then a bearish close below the first candle.'] },
          { id: 'bear-harami', name: ['هارامي هابط', 'Bearish Harami'], diagram: 'harami-bear',
            desc: ['شمعة صعودية كبيرة تليها شمعة هبوطية صغيرة داخل جسمها، تراجع في قوة المشترين.', 'A large bullish candle followed by a small bearish candle inside its body, buying pressure fading.'] },
          { id: 'tweezers-top', name: ['ملقاط القمم', 'Tweezers Tops'], diagram: 'tweezers-top',
            desc: ['شمعتان متجاورتان بنفس مستوى القمة تقريباً في نهاية صعود، إشارة انعكاس قوية.', 'Two adjacent candles with nearly the same high at the end of a rally, a strong reversal signal.'] },
        ],
      },
      {
        id: 'neutral', name: ['الشموع الحيادية', 'Neutral Candlesticks'],
        concepts: [
          { id: 'doji', name: ['الدوجي', 'Doji'], diagram: 'doji',
            desc: ['سعر الافتتاح والإغلاق شبه متطابقين، تعادل بين المشترين والبائعين، غالباً ينذر بانعكاس قريب.', 'Open and close are nearly identical, a tug-of-war between buyers and sellers, often warning of a nearby reversal.'] },
          { id: 'dragonfly', name: ['دوجي اليعسوب', 'Dragonfly Doji'], diagram: 'hammer',
            desc: ['دوجي بذيل سفلي طويل بدون ذيل علوي، رفض قوي من الأسفل، إشارة صعودية محتملة.', 'A doji with a long lower wick and no upper wick, strong rejection from below, a possible bullish signal.'] },
          { id: 'gravestone', name: ['دوجي شاهد القبر', 'Gravestone Doji'], diagram: 'shooting-star',
            desc: ['دوجي بذيل علوي طويل بدون ذيل سفلي، رفض قوي من الأعلى، إشارة هبوطية محتملة.', 'A doji with a long upper wick and no lower wick, strong rejection from above, a possible bearish signal.'] },
        ],
      },
      {
        id: 'continuation', name: ['الشموع المستمرة', 'Continuation Candlesticks'],
        concepts: [
          { id: 'spinning-top', name: ['القمة الدوارة', 'Spinning Top'], diagram: 'doji',
            desc: ['جسم صغير وذيلين متقاربين في الطول، تردد بالسوق، غالباً استراحة قبل استمرار الاتجاه.', 'A small body with two similar-length wicks, market indecision, often a pause before the trend continues.'] },
        ],
      },
    ],
  },

  {
    id: 'patterns', icon: '📐', color: '#00e664',
    name: ['النماذج السعرية', 'Price Chart Patterns'],
    note: botPatternNote,
    sections: [
      {
        id: 'reversal', name: ['النماذج الانعكاسية', 'Reversal Patterns'],
        concepts: [
          { id: 'double-top', name: ['القمة المزدوجة', 'Double Top'], diagram: 'double-top',
            desc: ['قمتان متقاربتان بالسعر يفصلهما قاع، كسر خط الرقبة (القاع) للأسفل يؤكد انعكاساً هابطاً.', 'Two similar-height peaks separated by a trough, a break below the neckline confirms a bearish reversal.'] },
          { id: 'double-bottom', name: ['القاع المزدوج', 'Double Bottom'], diagram: 'double-bottom',
            desc: ['عكس القمة المزدوجة، قاعان متقاربان، وكسر خط الرقبة للأعلى يؤكد انعكاساً صعودياً.', 'The mirror of Double Top, two similar-depth troughs, and a break above the neckline confirms a bullish reversal.'] },
          { id: 'triple-top', name: ['القمة الثلاثية', 'Triple Top'], diagram: 'double-top',
            desc: ['نفس فكرة القمة المزدوجة لكن بثلاث قمم متقاربة، فشل السعر بكسر المقاومة 3 مرات إشارة انعكاس أقوى.', 'Same idea as Double Top but with three similar peaks, failing to break resistance three times is a stronger reversal signal.'] },
          { id: 'triple-bottom', name: ['القاع الثلاثي', 'Triple Bottom'], diagram: 'double-bottom',
            desc: ['عكس القمة الثلاثية، ثلاث قيعان متقاربة قبل انعكاس صعودي مؤكد بكسر المقاومة.', 'The mirror of Triple Top, three similar troughs before a bullish reversal confirmed by a resistance break.'] },
          { id: 'head-shoulders', name: ['رأس وكتفين', 'Head & Shoulders'], diagram: 'head-shoulders',
            desc: ['كتف، فرأس أعلى منه، فكتف آخر مشابه للأول، كسر خط الرقبة للأسفل يؤكد انعكاساً هابطاً.', 'A shoulder, a higher head, then a matching shoulder, breaking the neckline downward confirms a bearish reversal.'] },
          { id: 'inv-head-shoulders', name: ['رأس وكتفين معكوس', 'Inverse Head & Shoulders'], diagram: 'head-shoulders',
            desc: ['عكس رأس وكتفين، يظهر في نهاية هبوط، وكسر خط الرقبة للأعلى يؤكد انعكاساً صعودياً.', 'The mirror of Head & Shoulders, appears after a decline, and breaking the neckline upward confirms a bullish reversal.'] },
        ],
      },
      {
        id: 'continuation-p', name: ['النماذج الاستمرارية', 'Continuation Patterns'],
        concepts: [
          { id: 'bull-flag', name: ['العلم الصاعد', 'Bullish Flag'], diagram: 'flag-bull',
            desc: ['استراحة قصيرة مائلة هبوطاً بعد صعود قوي، كسرها للأعلى يعني استمرار الصعود.', 'A short downward-sloping pause after a strong rally, breaking upward signals the uptrend continuing.'] },
          { id: 'bear-flag', name: ['العلم الهابط', 'Bearish Flag'], diagram: 'flag-bear',
            desc: ['عكس العلم الصاعد، استراحة مائلة صعوداً بعد هبوط قوي، وكسرها للأسفل يعني استمرار الهبوط.', 'The mirror of Bullish Flag, an upward-sloping pause after a sharp decline; breaking down means the downtrend continues.'] },
          { id: 'bull-pennant', name: ['الراية الصاعدة', 'Bullish Pennant'], diagram: 'triangle-sym',
            desc: ['مثل العلم لكن على شكل مثلث صغير متماثل بعد صعود قوي، كسره للأعلى استمرار للصعود.', 'Like a flag but a small symmetric triangle after a strong rally, breaking upward continues the uptrend.'] },
          { id: 'bear-pennant', name: ['الراية الهابطة', 'Bearish Pennant'], diagram: 'triangle-sym',
            desc: ['عكس الراية الصاعدة، مثلث صغير بعد هبوط حاد، وكسره للأسفل استمرار للهبوط.', 'The mirror of Bullish Pennant, a small triangle after a sharp decline; breaking down continues the downtrend.'] },
          { id: 'bull-rect', name: ['المستطيل الصاعد', 'Bullish Rectangle'], diagram: 'rectangle',
            desc: ['تذبذب جانبي بين دعم ومقاومة أفقيين بعد صعود، كسر المقاومة للأعلى استمرار للصعود.', 'Sideways movement between horizontal support/resistance after a rally, breaking resistance upward continues the uptrend.'] },
          { id: 'bear-rect', name: ['المستطيل الهابط', 'Bearish Rectangle'], diagram: 'rectangle',
            desc: ['نفس فكرة المستطيل الصاعد لكن بعد هبوط، كسر الدعم للأسفل استمرار للهبوط.', 'Same idea as Bullish Rectangle but after a decline, breaking support downward continues the downtrend.'] },
        ],
      },
      {
        id: 'bilateral', name: ['النماذج الثنائية', 'Bilateral Patterns'],
        concepts: [
          { id: 'sym-triangle', name: ['المثلث المتماثل', 'Symmetrical Triangle'], diagram: 'triangle-sym',
            desc: ['قمم هابطة وقيعان صاعدة يتقاربان نحو نقطة، الاختراق يحدد الاتجاه (لأعلى أو لأسفل)، فراقب باحتراس.', 'Falling highs and rising lows converge to a point, the breakout direction (up or down) determines the move, so watch carefully.'] },
          { id: 'asc-triangle', name: ['المثلث الصاعد', 'Ascending Triangle'], diagram: 'triangle-asc',
            desc: ['مقاومة أفقية ثابتة ودعم صاعد، يميل عادة للاختراق صعوداً بسبب قوة المشترين المتزايدة.', 'A flat resistance and a rising support, usually tends to break upward due to increasing buyer strength.'] },
          { id: 'desc-triangle', name: ['المثلث الهابط', 'Descending Triangle'], diagram: 'triangle-desc',
            desc: ['عكس المثلث الصاعد، دعم أفقي ثابت ومقاومة هابطة، يميل للاختراق هبوطاً.', 'The mirror of Ascending Triangle, a flat support and falling resistance, tends to break downward.'] },
          { id: 'rising-wedge', name: ['الوتد الصاعد', 'Rising Wedge'], diagram: 'wedge-rising',
            desc: ['خطا دعم ومقاومة صاعدان يتقاربان، رغم صعوده يُعتبر غالباً إشارة هبوطية عند كسر الدعم.', 'Two rising, converging support/resistance lines, despite rising, it\'s usually a bearish signal once support breaks.'] },
          { id: 'falling-wedge', name: ['الوتد الهابط', 'Falling Wedge'], diagram: 'wedge-falling',
            desc: ['عكس الوتد الصاعد، خطان هابطان متقاربان، ويُعتبر غالباً إشارة صعودية عند كسر المقاومة.', 'The mirror of Rising Wedge, two falling, converging lines, usually a bullish signal once resistance breaks.'] },
        ],
      },
    ],
  },

  {
    id: 'indicators', icon: '📊', color: '#7c3aed',
    name: ['المؤشرات الفنية', 'Technical Indicators'],
    note: botIndicatorNote,
    sections: [
      {
        id: 'trend', name: ['مؤشرات الاتجاه', 'Trend Indicators'],
        concepts: [
          { id: 'ma', name: ['المتوسطات المتحركة (SMA / EMA)', 'Moving Averages (SMA / EMA)'],
            desc: ['متوسط حركة السعر خلال فترة معينة، EMA يعطي وزناً أكبر للأسعار الحديثة فيكون أقرب لحركة السعر من SMA.', 'The average price movement over a period, EMA weighs recent prices more heavily, tracking price more closely than SMA.'],
            points: [
              ['كسر السعر للمتوسط لأعلى/أسفل = إشارة شراء/بيع (مع انتظار شمعة تأكيد لتفادي الكسر الوهمي).', "Price crossing above/below the average = buy/sell signal (wait for a confirming candle to avoid a fake break)."],
              ['تقاطع متوسطين (قصير × طويل) لأعلى = شراء، ولأسفل = بيع.', 'A short-term average crossing a long-term one upward = buy, downward = sell.'],
              ['تقاطع 3 متوسطات (مثل 5/10/20) بترتيب معين يعطي إشارة أقوى.', 'Three averages (e.g. 5/10/20) crossing in a specific order gives a stronger signal.'],
            ] },
          { id: 'macd', name: ['الماك دي', 'MACD'],
            desc: ['يقيس الفارق بين متوسطين أسيين (12 و26) لتحديد الزخم واتجاه السوق، ويصاحبه خط إشارة (9).', 'Measures the gap between two EMAs (12 and 26) to gauge momentum and trend, alongside a signal line (9).'],
            points: [
              ['تقاطع خط الماكد مع خط الإشارة لأعلى = شراء، ولأسفل = بيع.', 'MACD line crossing the signal line upward = buy, downward = sell.'],
              ['تجاوز خط الماكد لخط الصفر لأعلى = سيطرة مشترين، ولأسفل = سيطرة بائعين.', 'MACD crossing above the zero line = buyer control, below = seller control.'],
            ] },
          { id: 'adx', name: ['مؤشر ADX', 'Average Directional Index (ADX)'], diagram: 'adx-rising',
            desc: ['يقيس قوة الاتجاه الحالي (بغض النظر عن اتجاهه صعوداً أو هبوطاً) برقم من 0 إلى 100.', "Measures the strength of the current trend (regardless of direction) on a 0-100 scale."],
            points: [
              ['فوق 25 = اتجاه قوي يستحق المتابعة، تحت 20 = سوق عرضي بلا اتجاه واضح.', 'Above 25 = a strong trend worth following, below 20 = a sideways market with no clear direction.'],
              ['يُستخدم دائماً مع +DI و-DI لتحديد هل القوة صعودية أو هبوطية.', 'Always used alongside +DI and -DI to determine whether the strength is bullish or bearish.'],
              ['سكانر DevelBot يستخدم ADX فوق 25 كشرط أساسي لتأكيد جودة أي فرصة قبل احتساب الـ Score.', "DevelBot's scanner uses an ADX above 25 as a core condition to confirm an opportunity's quality before calculating the Score."],
            ] },
        ],
      },
      {
        id: 'momentum', name: ['مؤشرات الزخم', 'Momentum Indicators'],
        concepts: [
          { id: 'rsi', name: ['مؤشر القوة النسبية RSI', 'Relative Strength Index (RSI)'],
            desc: ['يقيس سرعة وقوة تغير السعر برقم بين 0 و100 لتحديد التشبع الشرائي أو البيعي.', 'Measures the speed and strength of price change on a 0-100 scale to spot overbought/oversold conditions.'],
            points: [
              ['فوق 70 = تشبع شرائي (احتمال هبوط)، تحت 30 = تشبع بيعي (احتمال صعود).', 'Above 70 = overbought (possible drop), below 30 = oversold (possible rise).'],
              ['كسر خط المنتصف (50) لأعلى = سيطرة مشترين، ولأسفل = سيطرة بائعين.', 'Crossing the 50 midline upward = buyers in control, downward = sellers in control.'],
              ['الدايفرجنس (تباعد حركة المؤشر عن حركة السعر) إشارة انعكاس رائدة قوية.', 'Divergence (indicator moving opposite to price) is a strong leading reversal signal.'],
            ] },
          { id: 'stochastic', name: ['مؤشر ستوكاستك', 'Stochastic Oscillator'],
            desc: ['يقارن سعر الإغلاق بنطاق التداول خلال فترة معينة، برقم بين 0 و100.', 'Compares the closing price to its trading range over a period, on a 0-100 scale.'],
            points: [
              ['تحت 20 = تشبع بيعي، فوق 80 = تشبع شرائي.', 'Below 20 = oversold, above 80 = overbought.'],
              ['يُستخدم بنفس منطق الدايفرجنس المستخدم في RSI.', 'Used with the same divergence logic as RSI.'],
            ] },
        ],
      },
      {
        id: 'volume', name: ['مؤشرات الحجم', 'Volume Indicators'],
        concepts: [
          { id: 'volume', name: ['الحجم (Volume)', 'Volume'],
            desc: ['يقيس عدد الوحدات المتداولة خلال فترة معينة، يؤكد قوة الاتجاه وسيولة السوق.', 'Measures how many units traded in a period, confirms trend strength and market liquidity.'],
            points: [
              ['زيادة الحجم مع الاتجاه = تأكيد قوته، انخفاضه = ضعف واحتمال انعكاس.', 'Rising volume with the trend = confirms strength; falling volume = weakness and possible reversal.'],
              ['يُستخدم لتأكيد نماذج التحليل الفني (مثل ازدياد الحجم عند كسر رأس وكتفين).', 'Used to confirm chart patterns (e.g. rising volume on a Head & Shoulders breakout).'],
            ] },
          { id: 'obv', name: ['مؤشر OBV', 'On-Balance Volume (OBV)'],
            desc: ['يجمع الحجم تراكمياً (+/-) حسب اتجاه إغلاق كل شمعة لقياس ضغط الشراء أو البيع التراكمي.', 'Accumulates volume (+/-) based on each candle\'s close direction to gauge cumulative buy/sell pressure.'] },
        ],
      },
      {
        id: 'oscillators', name: ['مؤشرات التذبذب والتقلب', 'Oscillators & Volatility'],
        concepts: [
          { id: 'bollinger', name: ['بولنجر باند', 'Bollinger Bands'], diagram: 'bollinger',
            desc: ['حد علوي وسفلي حول متوسط متحرك بسيط (20) بمقدار انحرافين معياريين، يقيس التقلب.', 'Upper/lower bands around a 20-period SMA at two standard deviations, measures volatility.'],
            points: [
              ['تقارب الحدود = هدوء بالسوق وغالباً يسبق حركة قوية قادمة.', 'Narrow bands = low volatility, often preceding a strong move.'],
              ['تباعد الحدود = تقلب مرتفع واحتمال اقتراب السعر من ذروة الحركة.', 'Wide bands = high volatility, price may be nearing an extreme.'],
              ['يمكن استخدام الحد العلوي/السفلي كأهداف سعرية بدل نقاط دخول.', 'The bands can be used as price targets rather than entry points.'],
            ] },
          { id: 'atr', name: ['مؤشر ATR', 'Average True Range (ATR)'], diagram: 'atr-expand',
            desc: ['يقيس متوسط مدى حركة السعر (تقلبه) خلال فترة معينة برقم مطلق بوحدة السعر، مو نسبة مئوية.', 'Measures the average range of price movement (volatility) over a period, as an absolute price value, not a percentage.'],
            points: [
              ['ارتفاع ATR = تقلب أعلى، انخفاضه = سوق هادئ.', 'Rising ATR = higher volatility, falling ATR = a calmer market.'],
              ['أداة أساسية لتحديد وقف خسارة يتناسب مع تقلب العملة نفسها بدل رقم ثابت.', 'A core tool for setting a stop loss sized to that specific coin\'s own volatility instead of a fixed number.'],
              ['استراتيجية DevelBot للفيوتشر تحسب وقف الخسارة كمضاعف من الـATR (0.6×ATR) بدل نسبة مئوية ثابتة.', "DevelBot's futures strategy calculates its stop loss as a multiple of ATR (0.6×ATR) instead of a fixed percentage."],
            ] },
        ],
      },
      {
        id: 'smc', name: ['هيكل السوق الذكي (Smart Money Concepts)', 'Smart Money Concepts (SMC)'],
        concepts: [
          { id: 'market-structure', name: ['هيكل السوق', 'Market Structure'], diagram: 'market-structure',
            desc: ['قراءة السوق كسلسلة قمم وقيعان: قمم وقيعان أعلى = اتجاه صاعد، وقمم وقيعان أدنى = اتجاه هابط.', 'Reading the market as a sequence of highs and lows: higher highs and higher lows = uptrend, lower highs and lower lows = downtrend.'],
            points: [
              ['كسر الهيكل (Break of Structure / BOS) = تأكيد استمرار الاتجاه الحالي.', 'A Break of Structure (BOS) confirms the current trend continuing.'],
              ['تغيّر الطابع (Change of Character / CHoCH) = أول إشارة محتملة على انعكاس الاتجاه.', 'A Change of Character (CHoCH) is the first possible sign of a trend reversal.'],
            ] },
          { id: 'order-block', name: ['كتلة الأوامر (Order Block)', 'Order Block'], diagram: 'order-block',
            desc: ['آخر شمعة معاكسة قبل حركة سعرية قوية، تمثّل منطقة تجمّع أوامر مؤسسية كبيرة.', 'The last opposing candle before a strong price move, marking a zone where large institutional orders likely clustered.'],
            points: [
              ['السعر غالباً يرجع لهذي المنطقة قبل ما يكمل بنفس اتجاه الحركة القوية.', 'Price often returns to this zone before continuing in the direction of the strong move.'],
              ['تُستخدم كمنطقة دخول محتملة بدل الدخول مباشرة عند كسر السعر.', 'Used as a potential entry zone instead of entering right at the breakout.'],
            ] },
          { id: 'liquidity-grab', name: ['سحب السيولة (Liquidity Grab)', 'Liquidity Grab'], diagram: 'liquidity-grab',
            desc: ['اختراق سريع ووهمي لمستوى دعم أو مقاومة لتحفيز أوامر وقف الخسارة، ثم انعكاس فوري بالاتجاه المعاكس.', 'A fast, fake break of a support/resistance level that triggers stop-loss orders, followed by an immediate reversal the other way.'],
            points: [
              ['يظهر عادة كذيل شمعة طويل يخترق المستوى ثم يغلق داخله مباشرة.', 'Usually shows up as a long candle wick that pierces the level then closes right back inside it.'],
              ['استراتيجية DevelBot للسبوت (SMC_MTF) مبنية أساساً على رصد هذا النمط قبل الدخول.', "DevelBot's spot strategy (SMC_MTF) is built primarily on spotting this pattern before entering."],
            ] },
        ],
      },
    ],
  },

  {
    id: 'levels', icon: '📏', color: '#f5a623',
    name: ['تحديد مستويات السعر', 'Price Level Tools'],
    note: botRiskNote,
    sections: [
      {
        id: 'sr', name: ['الدعوم والمقاومات', 'Support & Resistance'],
        concepts: [
          { id: 'support-resistance', name: ['الدعم والمقاومة', 'Support & Resistance'], diagram: 'support-resistance',
            desc: ['الدعم مستوى يتوقف عنده الهبوط لزيادة الطلب، والمقاومة مستوى يتوقف عنده الصعود لزيادة العرض.', 'Support is a level where declines tend to stop due to rising demand; resistance is where rallies tend to stop due to rising supply.'],
            points: [
              ['كل قاع سابق دعم متوقع الارتداد منه، وكل قمة سابقة مقاومة متوقع الارتداد منها.', 'Every prior low is expected support; every prior high is expected resistance.'],
              ['كسر المقاومة يحولها لدعم جديد، وكسر الدعم يحوله لمقاومة جديدة.', 'A broken resistance becomes new support; a broken support becomes new resistance.'],
              ['انتظر شمعة تأكيد بعد الاختراق أو الكسر قبل الدخول لتفادي الحركة الوهمية.', 'Wait for a confirming candle after a breakout/breakdown before entering, to avoid a fake move.'],
            ] },
        ],
      },
      {
        id: 'fibonacci', name: ['أدوات الفيبوناتشي', 'Fibonacci Tools'],
        concepts: [
          { id: 'fib-retracement', name: ['تصحيح فيبوناتشي', 'Fibonacci Retracement'], diagram: 'fibonacci',
            desc: ['يرسم من القاع للقمة (أو العكس) ليحدد مستويات تصحيح محتملة (23.6%، 38.2%، 50%، 61.8%، 78.6%).', 'Drawn from low to high (or the reverse) to mark likely pullback levels (23.6%, 38.2%, 50%, 61.8%, 78.6%).'],
            points: [
              ['نسبة 61.8% تُسمى "النسبة الذهبية", أقوى منطقة يُتوقع منها ارتداد السعر.', 'The 61.8% level is the "golden ratio", the strongest zone where a price bounce is expected.'],
              ['تتزامن غالباً مع مستويات دعم/مقاومة تقليدية مما يقوّي المستوى.', 'It often lines up with traditional support/resistance levels, reinforcing them.'],
            ] },
          { id: 'fib-extension', name: ['تمديد فيبوناتشي', 'Fibonacci Extension'],
            desc: ['يُستخدم لتحديد أهداف الأرباح المحتملة بعد تصحيح، بامتداد أبعد من الحركة الأصلية.', 'Used to project potential profit targets beyond the original move, after a pullback.'] },
        ],
      },
      {
        id: 'channels', name: ['القنوات السعرية', 'Price Channels'],
        concepts: [
          { id: 'channel-asc', name: ['القناة الصاعدة', 'Ascending Channel'],
            desc: ['خطا دعم ومقاومة متوازيان صاعدان، كسر الدعم يضعف الاتجاه الصاعد الحالي.', 'Two parallel rising support/resistance lines, breaking support weakens the current uptrend.'] },
          { id: 'channel-desc', name: ['القناة الهابطة', 'Descending Channel'],
            desc: ['عكس القناة الصاعدة، كسر المقاومة العلوية يضعف الاتجاه الهابط الحالي.', 'The mirror of Ascending Channel, breaking the upper resistance weakens the current downtrend.'] },
          { id: 'channel-side', name: ['القناة الجانبية', 'Sideways Channel'],
            desc: ['قمم وقيعان متساوية تقريباً، اختراق المقاومة إشارة صعود، وكسر الدعم إشارة هبوط.', 'Nearly equal highs and lows, breaking resistance signals a rise, breaking support signals a decline.'] },
        ],
      },
    ],
  },

  {
    id: 'risk', icon: '🛡️', color: '#ff4455',
    name: ['إدارة المخاطر', 'Risk Management'],
    note: botRiskNote,
    sections: [
      {
        id: 'core', name: ['المبادئ الأساسية', 'Core Principles'],
        concepts: [
          { id: 'rr-ratio', name: ['نسبة المخاطرة إلى العائد', 'Risk-to-Reward Ratio'],
            desc: ['تقيّم جدوى الصفقة قبل الدخول، مثلاً مخاطرة $1 مقابل عائد محتمل $3 تعني نسبة 1:3.', 'Evaluates a trade\'s worth before entry, e.g. risking $1 for a potential $3 reward is a 1:3 ratio.'] },
          { id: 'stop-loss', name: ['وقف الخسارة', 'Stop-Loss Order'],
            desc: ['أمر يغلق الصفقة تلقائياً عند مستوى سعري محدد إذا تحرك السعر ضدك، يحمي رأس المال من خسائر كبيرة.', 'An order that automatically closes the trade at a set price if it moves against you, protects capital from large losses.'] },
          { id: 'diversification', name: ['تنويع المحفظة', 'Portfolio Diversification'],
            desc: ['توزيع الاستثمار على أصول مختلفة يقلل تأثير خسارة أصل واحد على المحفظة كاملة.', 'Spreading investment across different assets reduces the impact of one asset\'s loss on the whole portfolio.'] },
          { id: 'position-sizing', name: ['حجم المركز المناسب', 'Position Sizing'],
            desc: ['لا تخاطر بأكثر من 1-3% من رأس المال بصفقة واحدة، حتى لا تؤثر خسارة واحدة بشكل كبير على حسابك.', "Don't risk more than 1-3% of capital on a single trade, so one loss can't seriously damage your account."] },
          { id: 'trading-plan', name: ['التداول وفق خطة', 'Trading with a Plan'],
            desc: ['خطة واضحة تشمل معايير الدخول والخروج ووقف الخسارة وأهداف الربح تقلل القرارات العشوائية.', 'A clear plan with entry/exit criteria, stop-loss, and profit targets reduces impulsive decisions.'] },
          { id: 'overtrading', name: ['تجنب التداول الزائد', 'Avoiding Overtrading'],
            desc: ['التداول فقط عند وجود فرصة واضحة مبنية على تحليل حقيقي، كثرة الصفقات تزيد الخسائر.', 'Only trade when there\'s a clear, analysis-based opportunity, overtrading increases losses.'] },
          { id: 'emotions', name: ['السيطرة على العواطف', 'Emotional Control'],
            desc: ['العواطف تؤثر سلباً على قرارات التداول، التزم بالتحليل والخطة بدل ردة الفعل اللحظية.', "Emotions negatively affect trading decisions, stick to your analysis and plan instead of reacting impulsively."] },
          { id: 'review', name: ['مراجعة الأداء بانتظام', 'Regular Performance Review'],
            desc: ['راجع صفقاتك دورياً لتتعلم من أخطائك ونجاحاتك وتحسّن استراتيجيتك المستقبلية.', 'Regularly review your trades to learn from mistakes and wins, and improve future strategy.'] },
          { id: 'fomo', name: ['الخوف من فوات الفرصة (FOMO)', 'Fear of Missing Out (FOMO)'],
            desc: ['شعور بأنك ستفوّت فرصة مربحة، يدفعك لقرارات عاطفية غير محسوبة بدل تحليل سليم.', 'The feeling of missing a profitable opportunity, pushing you into impulsive decisions instead of sound analysis.'] },
        ],
      },
    ],
  },
]

export const GLOSSARY: Concept[] = [
  { id: 'stocks', name: ['الأسهم', 'Stocks'], desc: ['حصة في ملكية شركة تمنح حاملها حقوقاً مثل التصويت وجزء من الأرباح.', 'A share in company ownership granting rights like voting and a portion of profits.'] },
  { id: 'bonds', name: ['السندات', 'Bonds'], desc: ['ورقة مالية تمثل قرضاً للمستثمر مع وعد بالسداد بفائدة خلال فترة محددة.', 'A security representing a loan with a promise of repayment with interest over time.'] },
  { id: 'futures', name: ['العقود الآجلة', 'Futures'], desc: ['عقد لشراء أو بيع أصل بسعر محدد في تاريخ مستقبلي معين.', 'A contract to buy or sell an asset at a set price on a future date.'] },
  { id: 'options', name: ['الخيارات', 'Options'], desc: ['عقد يمنح الحق (لا الإلزام) بشراء أو بيع أصل بسعر محدد خلال فترة معينة.', 'A contract granting the right (not obligation) to buy/sell an asset at a set price within a period.'] },
  { id: 'ta', name: ['التحليل الفني', 'Technical Analysis'], desc: ['دراسة حركة السعر والحجم بالرسوم البيانية والمؤشرات لتوقع الاتجاهات المستقبلية.', 'Studying price and volume via charts and indicators to forecast future trends.'] },
  { id: 'fa', name: ['التحليل الأساسي', 'Fundamental Analysis'], desc: ['تحليل البيانات المالية والاقتصادية لتقييم القيمة الجوهرية للأصل.', "Analyzing financial and economic data to assess an asset's intrinsic value."] },
  { id: 'roi', name: ['العائد على الاستثمار (ROI)', 'Return on Investment (ROI)'], desc: ['نسبة تقيس العائد مقابل التكلفة لتقييم كفاءة الاستثمار.', 'A ratio measuring return versus cost to evaluate investment efficiency.'] },
  { id: 'liquidity', name: ['السيولة', 'Liquidity'], desc: ['مدى سهولة تحويل الأصل إلى نقد دون التأثير على سعره.', 'How easily an asset converts to cash without affecting its price.'] },
  { id: 'day-trading', name: ['التداول اليومي', 'Day Trading'], desc: ['فتح وإغلاق الصفقات في نفس اليوم.', 'Opening and closing trades within the same day.'] },
  { id: 'position-trading', name: ['التداول طويل الأجل', 'Position Trading'], desc: ['الاحتفاظ بالأصول لفترة طويلة قد تمتد لأسابيع أو شهور أو سنوات.', 'Holding assets for a long period, weeks, months, or years.'] },
  { id: 'swing-trading', name: ['التداول المتأرجح', 'Swing Trading'], desc: ['الاستفادة من التقلبات قصيرة إلى متوسطة الأجل في السعر.', 'Capturing short-to-medium-term price swings.'] },
  { id: 'pending-orders', name: ['الأوامر المعلقة', 'Pending Orders'], desc: ['أوامر تُنفذ تلقائياً عند وصول السعر لمستوى معين.', 'Orders that execute automatically once price reaches a set level.'] },
  { id: 'leverage', name: ['الرافعة المالية', 'Leverage'], desc: ['استخدام أموال مقترضة لزيادة حجم الصفقة، يكبّر الأرباح والخسائر معاً.', 'Using borrowed funds to increase position size, amplifies both profits and losses.'] },
  { id: 'pips', name: ['النقاط (Pips)', 'Pips'], desc: ['وحدة قياس للتغير في أسعار أزواج العملات، عادة الرقم الرابع بعد الفاصلة.', 'A unit measuring price change in currency pairs, usually the fourth decimal place.'] },
  { id: 'margin', name: ['الهامش', 'Margin'], desc: ['المبلغ المطلوب إيداعه كضمان لإبقاء صفقة مفتوحة بالرافعة.', 'The amount required as collateral to keep a leveraged trade open.'] },
  { id: 'automated-trading', name: ['التداول الآلي', 'Automated Trading'], desc: ['استخدام برمجيات وبوتات لتنفيذ استراتيجيات التداول تلقائياً بدون تدخل بشري، بالضبط زي DevelBot.', 'Using software/bots to execute strategies automatically without human intervention, exactly like DevelBot.'] },
  { id: 'trailing-stop', name: ['وقف الخسارة المتحرك', 'Trailing Stop'], desc: ['وقف خسارة يتحرك تلقائياً مع تحرك السعر لصالحك لحماية الأرباح المحققة.', 'A stop-loss that automatically follows price in your favor to protect realized profits.'] },
  { id: 'pivot-points', name: ['النقاط المحورية', 'Pivot Points'], desc: ['مستويات سعرية مبنية على أسعار سابقة تُستخدم لتوقع تحركات السوق.', 'Price levels based on prior prices used to anticipate market moves.'] },
  { id: 'breakout-trading', name: ['تداول الاختراق', 'Breakout Trading'], desc: ['الدخول عندما يتجاوز السعر مستوى دعم أو مقاومة رئيسي.', 'Entering when price breaks past a key support or resistance level.'] },
  { id: 'reversal-trading', name: ['تداول الانعكاس', 'Reversal Trading'], desc: ['الدخول عند ظهور علامات انعكاس الاتجاه مثل تشكّل نمط عكسي.', 'Entering when trend-reversal signs appear, like a reversal pattern forming.'] },
  { id: 'retail-trading', name: ['التداول بالتجزئة', 'Retail Trading'], desc: ['تداول الأفراد بحسابات شخصية بدلاً من حسابات مؤسسية.', 'Individuals trading via personal accounts rather than institutional ones.'] },
  { id: 'cash-flow', name: ['السيولة النقدية', 'Cash Flow'], desc: ['تدفق النقد الداخل والخارج من حساب أو شركة خلال فترة معينة.', 'Cash moving in and out of an account or company over a period.'] },
  { id: 'news-trading', name: ['التداول على الأخبار', 'News Trading'], desc: ['الاستفادة من التقلبات الناتجة عن الأخبار الاقتصادية والسياسية.', 'Capitalizing on volatility caused by economic and political news.'] },
  { id: 'trend-trading', name: ['تداول الاتجاه', 'Trend Trading'], desc: ['تحديد ومتابعة الاتجاه العام للسوق صاعداً أو هابطاً.', "Identifying and following the market's general direction, up or down."] },
  { id: 'djia', name: ['مؤشر داو جونز', 'Dow Jones (DJIA)'], desc: ['مؤشر يتتبع أداء 30 من كبرى الشركات الأمريكية.', "Tracks the performance of 30 major US companies."] },
  { id: 'sp500', name: ['مؤشر S&P 500', 'S&P 500'], desc: ['مؤشر يضم 500 من أكبر الشركات الأمريكية، من أهم المؤشرات الاقتصادية.', 'An index of 500 of the largest US companies, one of the key economic indicators.'] },
  { id: 'short-selling', name: ['البيع على المكشوف', 'Short Selling'], desc: ['بيع أصل مقترض بهدف إعادة شرائه لاحقاً بسعر أقل والاستفادة من الفرق.', 'Selling a borrowed asset to rebuy it later at a lower price and profit from the difference.'] },
  { id: 'margin-buying', name: ['الشراء بالهامش', 'Margin Buying'], desc: ['استخدام أموال مقترضة لشراء أصول بهدف زيادة القدرة الشرائية.', 'Using borrowed funds to buy assets and increase purchasing power.'] },
  { id: 'bull-market', name: ['السوق الصاعد', 'Bull Market'], desc: ['حالة سوق تتسم بارتفاع الأسعار وزيادة ثقة المستثمرين.', 'A market state marked by rising prices and growing investor confidence.'] },
  { id: 'bear-market', name: ['السوق الهابط', 'Bear Market'], desc: ['حالة سوق تتسم بانخفاض الأسعار وزيادة التشاؤم بين المستثمرين.', 'A market state marked by falling prices and growing investor pessimism.'] },
  { id: 'crypto-trading', name: ['تداول العملات الرقمية', 'Crypto Trading'], desc: ['تداول عملات رقمية مثل البيتكوين والإيثيريوم وغيرها.', 'Trading digital currencies like Bitcoin, Ethereum, and others.'] },
  { id: 'trade', name: ['الصفقة', 'Trade'], desc: ['عملية شراء أو بيع أصل مالي معين.', 'A single buy or sell transaction of a financial asset.'] },
  { id: 'breakeven', name: ['تأمين الصفقة على الدخول', 'Move Stop to Breakeven'], desc: ['ضبط وقف الخسارة على سعر الدخول بعد تحقيق ربح معين لحماية رأس المال.', 'Moving the stop-loss to entry price after reaching a certain profit, to protect capital.'] },
  { id: 'take-profit', name: ['جني الأرباح', 'Take Profit'], desc: ['مستوى سعري محدد مسبقاً لإغلاق الصفقة وجني الأرباح عند الوصول إليه.', 'A pre-set price level to close the trade and lock in profit once reached.'] },
  { id: 'position-size', name: ['حجم المركز', 'Position Size'], desc: ['حجم أو قيمة الصفقة المفتوحة، يُحسب بضرب عدد الوحدات في سعر الأصل.', "The size or value of an open trade, calculated as units traded times asset price."] },
  { id: 'portfolio', name: ['المحفظة', 'Portfolio'], desc: ['مجموعة الأصول المالية المختلفة التي يملكها ويديرها المستثمر.', 'The collection of different financial assets an investor holds and manages.'] },
  { id: 'investment', name: ['الاستثمار', 'Investment'], desc: ['شراء أصول بهدف الاحتفاظ بها طويلاً للاستفادة من ارتفاع قيمتها.', 'Buying assets to hold long-term and benefit from their rising value.'] },
  { id: 'speculation', name: ['المضاربة', 'Speculation'], desc: ['شراء وبيع الأصول بشكل متكرر لتحقيق أرباح من التقلبات قصيرة الأجل.', 'Frequently buying and selling assets to profit from short-term volatility.'] },
  { id: 'retracement', name: ['الارتداد', 'Retracement'], desc: ['حركة سعرية مؤقتة عكس الاتجاه العام قبل أن يستمر السعر باتجاهه الأصلي.', "A temporary price move against the main trend before it resumes its original direction."] },
  { id: 'accumulation', name: ['التجميع', 'Accumulation'], desc: ['شراء كميات كبيرة من الأصول عند انخفاض أسعارها استعداداً لصعودها لاحقاً.', 'Buying large quantities of an asset while its price is low, anticipating a future rise.'] },
  { id: 'distribution', name: ['التصريف', 'Distribution'], desc: ['بيع كميات كبيرة من الأصول عند ارتفاع أسعارها تجنباً لانخفاض متوقع.', "Selling large quantities of an asset while its price is high, ahead of an expected drop."] },
  { id: 'scalping', name: ['المضاربة السريعة', 'Scalping'], desc: ['تحقيق أرباح صغيرة ومتكررة من تحركات سعرية سريعة جداً.', 'Capturing small, frequent profits from very fast price movements.'] },
  { id: 'holding', name: ['الاحتفاظ (Hold)', 'Holding'], desc: ['شراء الأصول والاحتفاظ بها لفترة طويلة للاستفادة من نموها.', 'Buying assets and holding them long-term to benefit from their growth.'] },
  { id: 'market-cap', name: ['القيمة السوقية', 'Market Cap'], desc: ['القيمة الإجمالية لأسهم الشركة المتداولة، تُحسب بضرب سعر السهم في عدد الأسهم.', "A company's total traded share value, calculated as share price times number of shares."] },
  { id: 'spot-trading', name: ['التداول الفوري', 'Spot Trading'], desc: ['شراء وبيع الأصول للتسليم الفوري، بعكس العقود الآجلة.', 'Buying/selling assets for immediate delivery, unlike futures contracts.'] },
  { id: 'broker', name: ['وسيط التداول', 'Broker'], desc: ['جهة تنفذ أوامر الشراء والبيع نيابة عن العملاء في الأسواق المالية.', 'An entity that executes buy/sell orders on behalf of clients in financial markets.'] },
  { id: 'blockchain', name: ['تقنية البلوكشين', 'Blockchain'], desc: ['سجل حسابات موزّع يؤمّن ويوثّق المعاملات بشبكة لامركزية، أساس العملات الرقمية.', 'A distributed ledger that secures and records transactions on a decentralized network, the basis of crypto.'] },
]
