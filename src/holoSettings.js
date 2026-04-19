/**
 * @param {string} color
 * @param {number} factor 0–1
 * @returns {string}
 */
export function scaleRgbaAlpha(color, factor) {
  const m = color.match(/^rgba\s*\(\s*([^)]+)\s*\)\s*$/i)
  if (!m) return color
  const parts = m[1].split(',').map((s) => s.trim())
  if (parts.length !== 4) return color
  const a = Number.parseFloat(parts[3])
  if (Number.isNaN(a)) return color
  return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${a * factor})`
}

/**
 * @param {number} mx 0–1
 * @param {number} my 0–1
 * @param {object} layer
 * @returns {string}
 */
export function buildLayerABBackground(mx, my, layer) {
  const ax = layer.angleDeg + mx * layer.pointerShiftDeg
  const ay = layer.angleDeg * 0.5 + my * (layer.pointerShiftDeg * 0.5)
  if (layer.gradientType === 'conic') {
    const x = 50 + (mx - 0.5) * 40
    const y = 50 + (my - 0.5) * 40
    return `conic-gradient(from ${ax}deg at ${x}% ${y}%, ${layer.color1} 0deg, ${layer.color2} 120deg, ${layer.color3} 240deg, ${layer.color1} 360deg)`
  }
  return `linear-gradient(${ax + ay * 0.25}deg, ${layer.color1} 0%, ${layer.color2} 45%, ${layer.color3} 100%)`
}

/**
 * @param {number} mx
 * @param {number} my
 * @param {object} layer
 * @returns {string}
 */
export function buildLayerCBackground(mx, my, layer) {
  const hx = mx * 100
  const hy = my * 100
  const r = Math.max(5, layer.highlightRadius * 70)
  const hi = layer.highlightIntensity
  const balance = layer.highlightVsGrain
  const wHighlight = balance
  const wTexture = Math.max(0.001, 1 - balance)

  const radial = `radial-gradient(circle ${r}% at ${hx}% ${hy}%, rgba(255,255,255,${0.55 * hi * wHighlight}) 0%, rgba(255,255,255,${0.1 * hi * wHighlight}) 42%, transparent 68%)`

  const g1 = layer.grainStrength * wTexture
  const grain1 = `repeating-linear-gradient(0deg, rgba(30,30,40,${0.12 * g1}) 0px, transparent 1px, transparent 2px, rgba(255,255,255,${0.06 * g1}) 3px)`
  const grain2 = `repeating-linear-gradient(90deg, rgba(20,20,30,${0.08 * g1}) 0px, transparent 2px)`

  const scanA = layer.scanOpacity * wTexture
  const sp = layer.scanSpacingPx
  const scanTint = scaleRgbaAlpha(layer.scanColor, scanA)
  const scan = `repeating-linear-gradient(${layer.scanAngleDeg}deg, transparent 0, transparent ${sp}px, ${scanTint} ${sp}px, transparent ${sp + 1}px)`

  return [radial, grain1, grain2, scan].join(', ')
}

/**
 * CSS variables for the holo spotlight + checker (no fixed card dimensions).
 * @param {{ effectFeather: number, hoverTransitionMs: number, effectRadiusPx: number, checkerSizePx: number }} global
 * @param {{ mx: number, my: number }} pointer
 * @returns {import('react').CSSProperties}
 */
export function applyTicketHoloCssVars(global, pointer) {
  const { mx, my } = pointer
  const innerPct = Math.min(100, Math.max(0, (1 - global.effectFeather) * 100))
  return {
    '--holo-mx': String(mx),
    '--holo-my': String(my),
    '--holo-transition-ms': `${global.hoverTransitionMs}ms`,
    '--holo-effect-r': `${global.effectRadiusPx}px`,
    '--holo-effect-inner-pct': `${innerPct}%`,
    '--holo-checker-size': `${global.checkerSizePx}px`,
  }
}
