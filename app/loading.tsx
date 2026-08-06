export default function Loading() {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', zIndex: 9998,
    }}>
      {/* نفس لوقو النافبار */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', animation: 'pulse 1.6s ease-in-out infinite' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'linear-gradient(135deg,#00c4ef,var(--purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: '22px', color: '#fff',
        }}>D</div>
        <span style={{ fontWeight: 900, fontSize: '22px', letterSpacing: '-0.04em', color: '#00c4ef' }}>Devel<span style={{ color: '#fff' }}>Bot</span></span>
      </div>

      <div style={{ display: 'flex', gap: '7px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#00c4ef',
            animation: `dot 1.2s ${i * 0.2}s ease-in-out infinite`,
          }}/>
        ))}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes dot   { 0%,80%,100%{opacity:0.2;transform:scale(1)} 40%{opacity:1;transform:scale(1.4)} }
      `}</style>
    </div>
  )
}
