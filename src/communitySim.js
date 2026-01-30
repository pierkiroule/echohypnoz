import { ARCHETYPES } from "./archetypes.js"

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function simulateCommunity(users = 140) {
  const ids = Object.keys(ARCHETYPES)
  const weights = new Map()

  for (let u = 0; u < users; u++) {
    const a = pick(ids)
    let b = pick(ids)
    let c = pick(ids)

    while (b === a) b = pick(ids)
    while (c === a || c === b) c = pick(ids)

    const pairs = [
      [a, b],
      [a, c],
      [b, c]
    ]

    for (const [s, t] of pairs) {
      const key = s < t ? `${s}|${t}` : `${t}|${s}`
      weights.set(key, (weights.get(key) || 0) + 1)
    }
  }

  return Array.from(weights.entries()).map(([key, w]) => {
    const [source, target] = key.split("|")
    return {
      source,
      target,
      weight: w
    }
  })
}