# -*- coding: utf-8 -*-
"""
gen_tokens.py — يولّد من design-tokens.json:
  • app/tokens.css          (aria-website) — :root داكن افتراضياً + [data-theme="light"] + prefers-color-scheme
  • lib/core/tokens.dart    (aria-mobile)  — DevelTokens (ألوان داكن/فاتح، مسافات، أنصاف أقطار، خط)

python gen_tokens.py --web ../aria-website/app/tokens.css --dart ../aria-mobile/lib/core/tokens.dart
ثم في globals.css: @import './tokens.css'; واحذف تعريفات :root المكررة.
"""
import argparse
import json
import os
import re


def _kebab(s):
    s = re.sub(r"([a-z0-9])([A-Z])", r"\1-\2", s)
    return re.sub(r"([a-zA-Z])(\d)", r"\1-\2", s).lower()


def css(t, system_theme=True):
    d, l = t["color"]["dark"], t["color"]["light"]
    lines = ["/* GENERATED from design-tokens.json — do not edit by hand */", ":root {"]
    lines += [f"  --{_kebab(k)}: {v};" for k, v in d.items()]
    lines += [f"  --font-ar: '{t['font']['arabic']}', {t['font']['fallback']};",
              f"  --font-en: '{t['font']['latin']}', '{t['font']['arabic']}', {t['font']['fallback']};",
              f"  --mono: '{t['font']['mono']}', ui-monospace, 'Cascadia Code', monospace;",
              "  --font-sans: var(--font-ar);"]
    lines += [f"  --fs-{k}: {v}px;" for k, v in t["typeScale"].items()]
    lines += [f"  --lh-{k}: {v};" for k, v in t["lineHeight"].items()]
    lines += [f"  --space-{k}: {v}px;" for k, v in t["space"].items()]
    lines += [f"  --radius-{k}: {v}px;" for k, v in t["radius"].items()]
    lines += [f"  --shadow-{_kebab(k)}: {v};" for k, v in t["shadow"].items()]
    lines += [f"  --motion-{k}: {v};" for k, v in t["motion"].items()]
    # semantic aliases
    for k, v in t["semantic"].items():
        if isinstance(v, str):
            lines.append(f"  --c-{k}: var(--{v});")
    for eng, c in t["semantic"]["engine"].items():
        lines.append(f"  --engine-{eng.lower().replace('_', '-')}: var(--{c});")
    lines.append("  color-scheme: dark;\n}")
    light = "\n".join(f"  --{_kebab(k)}: {v};" for k, v in l.items())
    lines.append(f":root[data-theme=\"light\"] {{\n{light}\n  color-scheme: light;\n}}")
    if system_theme:
        lines.append(f"@media (prefers-color-scheme: light) {{\n  :root:not([data-theme=\"dark\"]) {{\n{light}\n    color-scheme: light;\n  }}\n}}")
    lines.append("html[lang=\"en\"] { --font-sans: var(--font-en); }")
    return "\n".join(lines) + "\n"


def _dart_color(v):
    if v.startswith("#"):
        return f"Color(0xFF{v[1:].upper()})"
    m = re.match(r"rgba\((\d+),(\d+),(\d+),([\d.]+)\)", v.replace(" ", ""))
    r, g, b, a = m.groups()
    return f"Color.fromRGBO({r}, {g}, {b}, {a})"


def dart(t):
    out = ["// GENERATED from design-tokens.json — do not edit by hand", "import 'package:flutter/material.dart';", "",
           "class DevelColorScheme {"]
    keys = list(t["color"]["dark"].keys())
    out += [f"  final Color {k};" for k in keys]
    out.append("  const DevelColorScheme({" + ", ".join(f"required this.{k}" for k in keys) + "});")
    for theme in ("dark", "light"):
        out.append(f"  static const {theme} = DevelColorScheme(")
        out += [f"    {k}: {_dart_color(v)}," for k, v in t["color"][theme].items()]
        out.append("  );")
    out.append("}\n")
    # ثوابت ساكنة (static const) — تصلح كقيم افتراضية لـDevelColors القديمة في theme.dart بدون كسر أي شاشة
    for theme, cls_name in (("dark", "DevelTokenColors"), ("light", "DevelTokenColorsLight")):
        out.append(f"class {cls_name} {{")
        out.append(f"  {cls_name}._();")
        out += [f"  static const {k} = {_dart_color(v)};" for k, v in t["color"][theme].items()]
        out.append("}\n")
    out.append("class DevelTokens {")
    out.append(f"  static const fontArabic = '{t['font']['arabic']}';")
    out.append(f"  static const fontLatin = '{t['font']['latin']}';")
    out.append(f"  static const fontMono = '{t['font']['mono']}';")
    out += [f"  static const fs{k.capitalize()} = {float(v)};" for k, v in t["typeScale"].items()]
    out += [f"  static const space{k} = {float(v)};" for k, v in t["space"].items()]
    out += [f"  static const radius{k.capitalize()} = {float(v)};" for k, v in t["radius"].items()]
    out.append("  static const engineColor = <String, String>{")
    out += [f"    '{k}': '{v}'," for k, v in t["semantic"]["engine"].items()]
    out.append("  };")
    out.append("}\n")
    out.append("""ThemeData develThemeFromTokens(Brightness b) {
  final c = b == Brightness.dark ? DevelColorScheme.dark : DevelColorScheme.light;
  return ThemeData(
    brightness: b,
    scaffoldBackgroundColor: c.bg,
    cardColor: c.surface,
    dividerColor: c.border,
    fontFamily: DevelTokens.fontArabic,
    colorScheme: ColorScheme(
      brightness: b, primary: c.cyan, onPrimary: const Color(0xFF000000), secondary: c.purple,
      onSecondary: const Color(0xFFFFFFFF), error: c.red, onError: const Color(0xFFFFFFFF),
      surface: c.surface, onSurface: c.text),
    textTheme: TextTheme(
      displayLarge: TextStyle(fontSize: DevelTokens.fsDisplay, fontWeight: FontWeight.w800, color: c.text, height: 1.1),
      headlineMedium: TextStyle(fontSize: DevelTokens.fsH2, fontWeight: FontWeight.w700, color: c.text),
      bodyMedium: TextStyle(fontSize: DevelTokens.fsBody, color: c.text, height: 1.5),
      bodySmall: TextStyle(fontSize: DevelTokens.fsSmall, color: c.muted),
      labelSmall: TextStyle(fontSize: DevelTokens.fsMicro, color: c.muted, letterSpacing: 0.6),
    ),
  );
}
""")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tokens", default=os.path.join(os.path.dirname(__file__), "design-tokens.json"))
    ap.add_argument("--web", default="./out/tokens.css")
    ap.add_argument("--dart", default="./out/tokens.dart")
    ap.add_argument("--no-system-theme", action="store_true", help="الموقع: الثيم يُحدَّد فقط من data-theme (ClientShell) لا من نظام التشغيل")
    a = ap.parse_args()
    t = json.load(open(a.tokens, encoding="utf-8"))
    for p, content in ((a.web, css(t, system_theme=not a.no_system_theme)), (a.dart, dart(t))):
        os.makedirs(os.path.dirname(os.path.abspath(p)), exist_ok=True)
        open(p, "w", encoding="utf-8").write(content)
        print("wrote", p)


if __name__ == "__main__":
    main()
