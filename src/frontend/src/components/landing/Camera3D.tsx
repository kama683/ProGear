interface Camera3DProps {
  mouseX: number;
  mouseY: number;
}

export function Camera3D({ mouseX, mouseY }: Camera3DProps) {
  const rotX = (mouseY - 0.5) * -22;
  const rotY = (mouseX - 0.5) * 22 - 12;

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div
        className="relative animate-float"
        style={{
          transform: `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transition: 'transform 0.12s ease-out',
          transformStyle: 'preserve-3d',
          filter: 'drop-shadow(0 30px 60px rgba(139,92,246,0.4)) drop-shadow(0 0 80px rgba(139,92,246,0.15))',
        }}
      >
        <svg viewBox="0 0 520 360" width="480" height="340" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1e35" />
              <stop offset="50%" stopColor="#12121f" />
              <stop offset="100%" stopColor="#080812" />
            </linearGradient>
            <linearGradient id="bodyEdge" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(139,92,246,0.5)" />
              <stop offset="100%" stopColor="rgba(139,92,246,0.05)" />
            </linearGradient>
            <linearGradient id="topPlate" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#252540" />
              <stop offset="100%" stopColor="#10101c" />
            </linearGradient>
            <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#18182e" />
              <stop offset="100%" stopColor="#0d0d1a" />
            </linearGradient>
            <linearGradient id="finderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1a30" />
              <stop offset="100%" stopColor="#0a0a16" />
            </linearGradient>
            <radialGradient id="lensOuter" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#22224a" />
              <stop offset="100%" stopColor="#050510" />
            </radialGradient>
            <radialGradient id="lensRing1" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#2e2e60" />
              <stop offset="100%" stopColor="#0a0a20" />
            </radialGradient>
            <radialGradient id="lensCore" cx="38%" cy="35%" r="60%">
              <stop offset="0%" stopColor="rgba(139,92,246,0.7)" />
              <stop offset="30%" stopColor="rgba(80,50,180,0.5)" />
              <stop offset="70%" stopColor="rgba(20,10,60,0.9)" />
              <stop offset="100%" stopColor="#010108" />
            </radialGradient>
            <radialGradient id="lensCenter" cx="40%" cy="38%" r="55%">
              <stop offset="0%" stopColor="rgba(180,150,255,0.6)" />
              <stop offset="50%" stopColor="rgba(80,40,200,0.4)" />
              <stop offset="100%" stopColor="#020210" />
            </radialGradient>
            <radialGradient id="recBtn" cx="35%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#ff6060" />
              <stop offset="100%" stopColor="#991111" />
            </radialGradient>
            <radialGradient id="lcdBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#041830" />
              <stop offset="100%" stopColor="#020c18" />
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Camera body shadow */}
          <ellipse cx="240" cy="330" rx="150" ry="18" fill="rgba(80,40,180,0.2)" style={{ filter: 'blur(12px)' }} />

          {/* Main camera body */}
          <rect x="95" y="110" width="268" height="178" rx="12" fill="url(#bodyGrad)" />
          <rect x="95" y="110" width="268" height="178" rx="12" fill="none" stroke="url(#bodyEdge)" strokeWidth="1" />

          {/* Body side panel accent */}
          <rect x="95" y="118" width="4" height="162" rx="2" fill="rgba(139,92,246,0.4)" />

          {/* Top plate with accessory shoe */}
          <rect x="130" y="73" width="178" height="44" rx="7" fill="url(#topPlate)" />
          <rect x="130" y="73" width="178" height="44" rx="7" fill="none" stroke="rgba(139,92,246,0.25)" strokeWidth="1" />

          {/* Accessory shoe (hot shoe) */}
          <rect x="175" y="70" width="80" height="8" rx="2" fill="#0e0e20" stroke="rgba(139,92,246,0.3)" strokeWidth="0.8" />
          <rect x="180" y="68" width="70" height="4" rx="1" fill="#0a0a18" />

          {/* Viewfinder extension */}
          <rect x="296" y="50" width="108" height="58" rx="8" fill="url(#finderGrad)" />
          <rect x="296" y="50" width="108" height="58" rx="8" fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
          {/* Viewfinder eyepiece */}
          <rect x="397" y="62" width="18" height="34" rx="5" fill="#0a0a18" stroke="rgba(139,92,246,0.3)" strokeWidth="0.8" />
          <ellipse cx="406" cy="79" rx="6" ry="10" fill="#050510" />
          <ellipse cx="404" cy="76" rx="2" ry="4" fill="rgba(139,92,246,0.2)" />
          {/* Viewfinder screen inside */}
          <rect x="303" y="57" width="88" height="44" rx="4" fill="#030310" />
          <rect x="307" y="61" width="80" height="36" rx="2" fill="rgba(10,20,60,0.8)" />
          {/* Viewfinder content lines */}
          <rect x="312" y="66" width="40" height="3" rx="1" fill="rgba(0,200,255,0.35)" />
          <rect x="312" y="72" width="60" height="2" rx="1" fill="rgba(0,200,255,0.2)" />
          <rect x="312" y="77" width="50" height="2" rx="1" fill="rgba(0,200,255,0.15)" />
          <rect x="358" y="65" width="24" height="10" rx="2" fill="rgba(255,60,60,0.3)" />
          <circle cx="367" cy="70" r="3" fill="rgba(255,60,60,0.9)" filter="url(#glow)" />

          {/* Right handle */}
          <rect x="358" y="108" width="55" height="178" rx="12" fill="url(#handleGrad)" />
          <rect x="358" y="108" width="55" height="178" rx="12" fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
          {/* Handle grip texture lines */}
          {[130, 145, 160, 175, 190, 205, 220, 235, 250].map((y, i) => (
            <rect key={i} x="363" y={y} width="45" height="2" rx="1" fill="rgba(255,255,255,0.04)" />
          ))}
          {/* Handle top record trigger */}
          <rect x="365" y="115" width="38" height="22" rx="6" fill="#0f0f22" stroke="rgba(139,92,246,0.3)" strokeWidth="0.8" />
          <rect x="372" y="120" width="24" height="12" rx="3" fill="#dc2626" filter="url(#glow)" />

          {/* Lens mount / housing ring */}
          <circle cx="210" cy="200" r="88" fill="#030308" />
          <circle cx="210" cy="200" r="85" fill="#050512" stroke="rgba(139,92,246,0.5)" strokeWidth="2" />

          {/* Lens elements - outer to inner */}
          <circle cx="210" cy="200" r="79" fill="url(#lensOuter)" />
          <circle cx="210" cy="200" r="79" fill="none" stroke="rgba(80,80,160,0.3)" strokeWidth="1" />

          <circle cx="210" cy="200" r="66" fill="url(#lensRing1)" stroke="rgba(100,100,200,0.3)" strokeWidth="1" />

          <circle cx="210" cy="200" r="52" fill="#08081a" stroke="rgba(139,92,246,0.45)" strokeWidth="1.5" />

          <circle cx="210" cy="200" r="40" fill="url(#lensCore)" stroke="rgba(139,92,246,0.6)" strokeWidth="1" />

          <circle cx="210" cy="200" r="26" fill="url(#lensCenter)" stroke="rgba(139,92,246,0.7)" strokeWidth="1" />

          <circle cx="210" cy="200" r="14" fill="#010106" stroke="rgba(180,140,255,0.6)" strokeWidth="1" />
          <circle cx="210" cy="200" r="7" fill="rgba(139,92,246,0.5)" filter="url(#softGlow)" />
          <circle cx="210" cy="200" r="3" fill="rgba(200,180,255,0.9)" filter="url(#glow)" />

          {/* Lens reflections / highlights */}
          <ellipse cx="193" cy="182" rx="14" ry="9" fill="rgba(255,255,255,0.22)" transform="rotate(-25,193,182)" />
          <ellipse cx="226" cy="216" rx="6" ry="4" fill="rgba(255,255,255,0.08)" transform="rotate(-25,226,216)" />

          {/* Lens focus ring markings */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const r1 = 82, r2 = 86;
            return (
              <line
                key={i}
                x1={210 + r1 * Math.cos(rad)}
                y1={200 + r1 * Math.sin(rad)}
                x2={210 + r2 * Math.cos(rad)}
                y2={200 + r2 * Math.sin(rad)}
                stroke="rgba(139,92,246,0.4)"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Record button on body */}
          <circle cx="140" cy="125" r="16" fill="#1a0a0a" stroke="rgba(220,38,38,0.4)" strokeWidth="1" />
          <circle cx="140" cy="125" r="12" fill="url(#recBtn)" filter="url(#glow)" />
          <circle cx="136" cy="121" r="3.5" fill="rgba(255,255,255,0.5)" />

          {/* Body control buttons cluster */}
          <rect x="102" y="155" width="24" height="11" rx="4" fill="#0f0f22" stroke="rgba(139,92,246,0.3)" strokeWidth="0.7" />
          <rect x="102" y="171" width="24" height="11" rx="4" fill="#0f0f22" stroke="rgba(139,92,246,0.3)" strokeWidth="0.7" />
          <rect x="102" y="187" width="24" height="11" rx="4" fill="#0f0f22" stroke="rgba(139,92,246,0.3)" strokeWidth="0.7" />
          <rect x="102" y="203" width="24" height="11" rx="4" fill="#0f0f22" stroke="rgba(139,92,246,0.3)" strokeWidth="0.7" />

          {/* LCD monitor on body side */}
          <rect x="308" y="148" width="46" height="60" rx="5" fill="#050510" stroke="rgba(60,120,255,0.3)" strokeWidth="1" />
          <rect x="311" y="151" width="40" height="54" rx="3" fill="url(#lcdBg)" />
          <rect x="314" y="155" width="34" height="4" rx="1" fill="rgba(0,200,255,0.4)" />
          <rect x="314" y="162" width="22" height="3" rx="1" fill="rgba(0,200,255,0.25)" />
          <rect x="314" y="168" width="28" height="3" rx="1" fill="rgba(0,200,255,0.2)" />
          <rect x="314" y="174" width="18" height="3" rx="1" fill="rgba(0,200,255,0.15)" />
          <circle cx="342" cy="158" r="3.5" fill="rgba(255,60,60,0.9)" filter="url(#glow)" />

          {/* Dial / wheel control */}
          <circle cx="330" cy="215" r="13" fill="#0d0d20" stroke="rgba(139,92,246,0.35)" strokeWidth="1" />
          <circle cx="330" cy="215" r="9" fill="#141430" stroke="rgba(139,92,246,0.2)" strokeWidth="0.8" />
          {[0, 72, 144, 216, 288].map((a, i) => {
            const rad = (a * Math.PI) / 180;
            return <circle key={i} cx={330 + 10 * Math.cos(rad)} cy={215 + 10 * Math.sin(rad)} r="1.5" fill="rgba(139,92,246,0.5)" />;
          })}

          {/* Ports / connectors */}
          <rect x="99" y="248" width="7" height="18" rx="2" fill="#07070f" stroke="rgba(139,92,246,0.3)" strokeWidth="0.7" />
          <rect x="99" y="270" width="7" height="14" rx="2" fill="#07070f" stroke="rgba(139,92,246,0.3)" strokeWidth="0.7" />

          {/* Memory card slot */}
          <rect x="320" y="240" width="34" height="7" rx="3" fill="#050510" stroke="rgba(139,92,246,0.4)" strokeWidth="0.8" />
          <rect x="323" y="242" width="28" height="3" rx="1" fill="rgba(139,92,246,0.15)" />

          {/* Brand text */}
          <text x="228" y="298" textAnchor="middle" fill="rgba(139,92,246,0.55)" fontSize="8.5" fontFamily="monospace" letterSpacing="5">PRO GEAR</text>
          <text x="228" y="308" textAnchor="middle" fill="rgba(139,92,246,0.3)" fontSize="6.5" fontFamily="monospace" letterSpacing="2">CINEMA PRO · 8K</text>

          {/* Top plate labels */}
          <text x="160" y="99" fill="rgba(139,92,246,0.45)" fontSize="7" fontFamily="monospace" letterSpacing="2">INPUT</text>
          <text x="235" y="99" fill="rgba(139,92,246,0.45)" fontSize="7" fontFamily="monospace" letterSpacing="2">OUTPUT</text>

          {/* Audio XLR inputs on top plate */}
          <circle cx="145" cy="87" r="7" fill="#0a0a1a" stroke="rgba(139,92,246,0.3)" strokeWidth="0.8" />
          <circle cx="145" cy="87" r="4" fill="#050510" />
          <circle cx="225" cy="87" r="7" fill="#0a0a1a" stroke="rgba(139,92,246,0.3)" strokeWidth="0.8" />
          <circle cx="225" cy="87" r="4" fill="#050510" />
        </svg>
      </div>

      {/* Ground glow */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-72 h-6 rounded-full pointer-events-none"
        style={{ background: 'rgba(139,92,246,0.2)', filter: 'blur(16px)' }}
      />
    </div>
  );
}
