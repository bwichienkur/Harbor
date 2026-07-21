import { ART_DIRECTION } from './defaults'

/** Build a Pollinations AI image URL from a refined scene description. */
export function buildEnvironmentImageUrl(refinedPrompt: string, seed?: number): string {
  const full = `${refinedPrompt}. ${ART_DIRECTION}`
  const encoded = encodeURIComponent(full).replace(/%20/g, '%20')
  const s = seed ?? Math.floor(Math.random() * 1_000_000)
  return `https://image.pollinations.ai/prompt/${encoded}?width=1920&height=1080&nologo=true&enhance=true&seed=${s}`
}

export function buildRegeneratedImageUrl(
  baseRefined: string,
  extras: string[],
  seed?: number,
): string {
  const merged = [baseRefined, ...extras.filter(Boolean)].join('. ')
  return buildEnvironmentImageUrl(merged, seed)
}
