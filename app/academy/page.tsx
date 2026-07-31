'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useLang } from '../layout'
import { CHAPTERS, GLOSSARY, Concept } from './content'
import Diagram from './Diagrams'

function ConceptCard({ c, lang, color }: { c: Concept; lang: string; color: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
      {c.diagram && (
        <div style={{ height: '90px', background: 'var(--surface-2)', padding: '8px' }}>
          <Diagram type={c.diagram} />
        </div>
      )}
      <div style={{ padding: '16px' }}>
        <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>{lang === 'en' ? c.name[1] : c.name[0]}</div>
        <div style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.7 }}>{lang === 'en' ? c.desc[1] : c.desc[0]}</div>

        {c.points && (
          <button onClick={() => setOpen(v => !v)} style={{
            marginTop: '10px', background: 'transparent', border: 'none', color, fontSize: '12px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', padding: 0, display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            {open ? (lang === 'en' ? 'Hide details ▲' : 'إخفاء التفاصيل ▲') : (lang === 'en' ? 'How to use it ▼' : 'كيف تستخدمه ▼')}
          </button>
        )}
        {open && c.points && (
          <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {c.points.map((p, i) => (
              <li key={i} style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.6, paddingInlineStart: '16px', position: 'relative' }}>
                <span style={{ position: 'absolute', insetInlineStart: 0, color }}>•</span>
                {lang === 'en' ? p[1] : p[0]}
              </li>
            ))}
          </ul>
        )}

        {c.tip && (
          <div style={{ marginTop: '12px', background: 'rgba(0,196,239,0.06)', border: '1px solid rgba(0,196,239,0.18)', borderRadius: '9px', padding: '9px 11px', fontSize: '11.5px', color: 'var(--cyan)', lineHeight: 1.6 }}>
            🤖 {lang === 'en' ? c.tip[1] : c.tip[0]}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AcademyPage() {
  const { t, lang } = useLang()
  const [activeChapter, setActiveChapter] = useState(CHAPTERS[0].id)
  const [query, setQuery] = useState('')

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    const all: Concept[] = [...CHAPTERS.flatMap(ch => ch.sections.flatMap(s => s.concepts)), ...GLOSSARY]
    return all.filter(c =>
      c.name[0].toLowerCase().includes(q) || c.name[1].toLowerCase().includes(q) ||
      c.desc[0].toLowerCase().includes(q) || c.desc[1].toLowerCase().includes(q)
    )
  }, [query])

  const chapter = CHAPTERS.find(c => c.id === activeChapter)!

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(0,196,239,0.06) 0%, rgba(107,31,255,0.06) 100%)', borderBottom: '1px solid var(--border)', padding: '36px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
            {t('← الرئيسية', '← Home')}
          </Link>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, letterSpacing: '-0.02em', margin: '12px 0 8px' }}>
            🎓 {t('أكاديمية DevelBot', 'DevelBot Academy')}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '640px', lineHeight: 1.7, margin: 0 }}>
            {t('كل أساسيات التحليل الفني اللي تحتاجها: الشموع، النماذج، المؤشرات، مستويات السعر، وإدارة المخاطر. بالعربي، بأمثلة، ومربوط بمميزات البوت.', 'Everything you need to know about technical analysis: candlesticks, patterns, indicators, price levels, and risk management. In Arabic, with examples, tied to the bot\'s features.')}
          </p>
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder={t('🔍 دوّر عن أي مصطلح (مثال: RSI، مثلث، وقف خسارة...)', '🔍 Search any term (e.g. RSI, triangle, stop-loss...)')}
            style={{ marginTop: '20px', width: '100%', maxWidth: '480px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text)', fontSize: '13px', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px 80px' }}>
        {searchResults ? (
          <>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
              {t(`${searchResults.length} نتيجة`, `${searchResults.length} results`)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
              {searchResults.map(c => <ConceptCard key={c.id} c={c} lang={lang} color="var(--cyan)" />)}
            </div>
          </>
        ) : (
          <>
            {/* Chapter tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
              {CHAPTERS.map(ch => (
                <button key={ch.id} onClick={() => setActiveChapter(ch.id)}
                  style={{
                    padding: '10px 18px', borderRadius: '10px', border: `1px solid ${activeChapter === ch.id ? ch.color : 'var(--border)'}`,
                    background: activeChapter === ch.id ? `${ch.color}18` : 'var(--surface)',
                    color: activeChapter === ch.id ? ch.color : 'var(--text)',
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                  <span>{ch.icon}</span> {lang === 'en' ? ch.name[1] : ch.name[0]}
                </button>
              ))}
              <button onClick={() => setActiveChapter('__glossary__')}
                style={{
                  padding: '10px 18px', borderRadius: '10px', border: `1px solid ${activeChapter === '__glossary__' ? '#a78bfa' : 'var(--border)'}`,
                  background: activeChapter === '__glossary__' ? 'rgba(167,139,250,0.1)' : 'var(--surface)',
                  color: activeChapter === '__glossary__' ? '#a78bfa' : 'var(--text)',
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                📖 {t('قاموس المصطلحات', 'Glossary')}
              </button>
            </div>

            {activeChapter !== '__glossary__' && chapter.note && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: `${chapter.color}0f`, border: `1px solid ${chapter.color}30`, borderRadius: '12px', padding: '14px 16px', marginBottom: '24px' }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>🤖</span>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.7, color: chapter.color }}>{lang === 'en' ? chapter.note[1] : chapter.note[0]}</p>
              </div>
            )}

            {activeChapter === '__glossary__' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {GLOSSARY.map(g => (
                  <div key={g.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                    <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>{lang === 'en' ? g.name[1] : g.name[0]}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '12px', lineHeight: 1.6 }}>{lang === 'en' ? g.desc[1] : g.desc[0]}</div>
                  </div>
                ))}
              </div>
            ) : (
              chapter.sections.map(section => (
                <div key={section.id} style={{ marginBottom: '36px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '18px', borderRadius: '3px', background: chapter.color, display: 'inline-block' }} />
                    {lang === 'en' ? section.name[1] : section.name[0]}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                    {section.concepts.map(c => <ConceptCard key={c.id} c={c} lang={lang} color={chapter.color} />)}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* CTA */}
        <div style={{ marginTop: '40px', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px' }}>
          <div style={{ fontWeight: 800, fontSize: '18px', marginBottom: '8px' }}>{t('تبي تطبّق اللي تعلمته؟', 'Ready to put this into practice?')}</div>
          <div style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px' }}>{t('DevelBot يراقب كل هذي المؤشرات والأنماط تلقائياً على أكثر من 100 عملة ويرسل لك الإشارة جاهزة.', 'DevelBot tracks all these indicators and patterns automatically across 100+ coins and sends you the ready-made signal.')}</div>
          <Link href="/register" className="btn-primary" style={{ padding: '12px 28px', fontSize: '14px' }}>{t('ابدأ مجاناً ←', 'Start free →')}</Link>
        </div>
      </div>
    </div>
  )
}
