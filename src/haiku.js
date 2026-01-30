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