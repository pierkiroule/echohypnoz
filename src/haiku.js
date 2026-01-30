import { ARCHETYPES } from "./archetypes.js"

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateHaiku(sequence) {
  const maps = sequence.map(id => ARCHETYPES[id])
  if (maps.some(m => !m)) return null

  const [a, b, c] = maps

  return [
    pick(a.situation),
    pick(b.posture),
    pick(c.posture)
  ].join("\n")
}

export function generateMantra(sequence) {
  const maps = sequence.map(id => ARCHETYPES[id])
  if (maps.some(m => !m)) return null

  const [a, b, c] = maps
  const leads = ["Dans", "Par", "Avec"]

  const line1 = `${pick(leads)} ${a.name.toLowerCase()}, ${a.skill}.`
  const line2 = `${pick(leads)} ${b.name.toLowerCase()}, ${b.skill}.`
  const line3 = `${pick(leads)} ${c.name.toLowerCase()}, ${c.skill}.`

  return [line1, line2, line3].join("\n")
}
