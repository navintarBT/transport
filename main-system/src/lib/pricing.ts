export type PriceTier = {
  id: string
  minKg: number
  maxKg: number
  mode: 'flat' | 'round_up'
  /** kip if mode is 'flat', or the kg to round up to and bill if mode is 'round_up' */
  value: number
}

export const DEFAULT_RATE_PER_KG = 10000
export const DEFAULT_RATE_PER_M3 = 1800000

export const DEFAULT_TIERS: PriceTier[] = [
  { id: 't1', minKg: 0, maxKg: 0.3, mode: 'flat', value: 5000 },
  { id: 't2', minKg: 0.31, maxKg: 1, mode: 'round_up', value: 1 },
  { id: 't3', minKg: 1.1, maxKg: 1.5, mode: 'flat', value: 14000 },
  { id: 't4', minKg: 1.6, maxKg: 2, mode: 'round_up', value: 2 },
]

export type CalcResult =
  | { mode: 'box'; weightPrice: number; volumePrice: number; volumeM3: number; finalPrice: number }
  | { mode: 'tier'; tier: PriceTier; finalPrice: number }
  | { mode: 'weight_only'; weightPrice: number; finalPrice: number }
  | { mode: 'empty' }

export function findTier(weightKg: number, tiers: PriceTier[]): PriceTier | undefined {
  return tiers.find((t) => weightKg >= t.minKg && weightKg <= t.maxKg)
}

export function calculatePrice(input: {
  weightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
  ratePerKg: number
  ratePerM3: number
  tiers: PriceTier[]
}): CalcResult {
  const { weightKg, lengthCm, widthCm, heightCm, ratePerKg, ratePerM3, tiers } = input

  if (!weightKg || weightKg <= 0) return { mode: 'empty' }

  const hasDimensions = lengthCm > 0 && widthCm > 0 && heightCm > 0

  if (!hasDimensions) {
    const tier = findTier(weightKg, tiers)
    if (tier) {
      const finalPrice = tier.mode === 'flat' ? tier.value : tier.value * ratePerKg
      return { mode: 'tier', tier, finalPrice }
    }
    const weightPrice = weightKg * ratePerKg
    return { mode: 'weight_only', weightPrice, finalPrice: weightPrice }
  }

  const weightPrice = weightKg * ratePerKg
  const volumeM3 = (lengthCm / 100) * (widthCm / 100) * (heightCm / 100)
  const volumePrice = volumeM3 * ratePerM3
  return { mode: 'box', weightPrice, volumePrice, volumeM3, finalPrice: Math.max(weightPrice, volumePrice) }
}
