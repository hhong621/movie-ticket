/**
 * @typedef {Object} TicketHoloGlobal
 * @property {boolean} pointerTracking
 * @property {number} hoverTransitionMs
 * @property {number} hoverScale
 * @property {number} effectRadiusPx
 * @property {number} effectFeather
 * @property {number} checkerSizePx
 */

/**
 * @typedef {Object} TicketHoloLayerAB
 * @property {boolean} enabled
 * @property {number} opacity
 * @property {string} mixBlendMode
 * @property {'linear'|'conic'} gradientType
 * @property {number} angleDeg
 * @property {number} pointerShiftDeg
 * @property {string} color1
 * @property {string} color2
 * @property {string} color3
 * @property {boolean} animateHue
 * @property {number} animationDurationMs
 */

/**
 * @typedef {Object} TicketHoloLayerC
 * @property {boolean} enabled
 * @property {number} opacity
 * @property {string} mixBlendMode
 * @property {number} highlightVsGrain
 * @property {number} highlightRadius
 * @property {number} highlightIntensity
 * @property {number} grainStrength
 * @property {number} scanOpacity
 * @property {number} scanAngleDeg
 * @property {number} scanSpacingPx
 * @property {string} scanColor
 */

/**
 * @typedef {Object} TicketHoloSettings
 * @property {TicketHoloGlobal} global
 * @property {TicketHoloLayerAB} layerA
 * @property {TicketHoloLayerAB} layerB
 * @property {TicketHoloLayerC} layerC
 */

/** @type {TicketHoloSettings} */
export const TICKET_HOLO_SETTINGS = {
  global: {
    pointerTracking: true,
    hoverTransitionMs: 280,
    hoverScale: 1.03,
    effectRadiusPx: 172,
    effectFeather: 1,
    checkerSizePx: 32,
  },
  layerA: {
    enabled: true,
    opacity: 0.8,
    mixBlendMode: 'normal',
    gradientType: 'linear',
    angleDeg: 168,
    pointerShiftDeg: 72,
    color1: '#ff85cc',
    color2: '#ffffff',
    color3: '#2e7eff',
    animateHue: false,
    animationDurationMs: 8000,
  },
  layerB: {
    enabled: true,
    opacity: 0.5,
    mixBlendMode: 'plus-lighter',
    gradientType: 'linear',
    angleDeg: 320,
    pointerShiftDeg: 72,
    color1: 'rgba(255, 255, 255, 0.75)',
    color2: 'rgba(255, 179, 238, 0.45)',
    color3: 'rgba(222, 189, 255, 0.35)',
    animateHue: false,
    animationDurationMs: 6000,
  },
  layerC: {
    enabled: true,
    opacity: 0.8,
    mixBlendMode: 'multiply',
    highlightVsGrain: 0.18,
    highlightRadius: 0.25,
    highlightIntensity: 0.5,
    grainStrength: 1,
    scanOpacity: 1,
    scanAngleDeg: 45,
    scanSpacingPx: 24,
    scanColor: 'rgba(255, 255, 255, 0.25)',
  },
}

const DEFAULT_COLOR3 = '#ffffff'

/**
 * @param {Record<string, unknown> | null | undefined} showtime
 * @returns {TicketHoloSettings}
 */
export function mergeShowtimeIntoSettings(showtime) {
  const s = TICKET_HOLO_SETTINGS
  const color1 =
    typeof showtime?.color1 === 'string' && showtime.color1
      ? showtime.color1
      : s.layerA.color1
  const color2 =
    typeof showtime?.color2 === 'string' && showtime.color2
      ? showtime.color2
      : s.layerA.color2
  const color3 =
    typeof showtime?.color3 === 'string' && showtime.color3
      ? showtime.color3
      : DEFAULT_COLOR3

  return {
    ...s,
    layerA: {
      ...s.layerA,
      color1,
      color2,
      color3,
    },
  }
}
