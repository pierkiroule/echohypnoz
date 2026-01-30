import { useState } from "react"
import EmojiGraph from "./EmojiGraph.jsx"
import { ARCHETYPES } from "./archetypes.js"

export default function App() {
  const [nodes, setNodes] = useState([])
  const [selected, setSelected] = useState([])

  function toggle(id) {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  return (
    <div className="page">
      <header className="top">
        <h1 className="title">
  EchoHypnoz<span className="sigil">•°</span>
</h1>
        <p className="intro">
          De cette constellation partagée,
          <br />
          choisis trois symboles qui résonnent pour toi.
        </p>
      </header>

      <main className="stage">
        {/* Champ vivant (D3 → positions) */}
        <EmojiGraph onPositions={setNodes} />

        {/* Icônes dans le champ */}
        {nodes.map(n => {
          const A = ARCHETYPES[n.id]
          if (!A) return null

          return (
            <div
              key={n.id}
              className={`nodeOverlay ${selected.includes(n.id) ? "selected" : ""}`}
              style={{ "--x": n.x, "--y": n.y }}
              onClick={() => toggle(n.id)}
              title={A.name}
            >
              <A.icon
                size={20}
                strokeWidth={1.6}
                style={{ pointerEvents: "none" }}
              />
            </div>
          )
        })}
      </main>

      {/* 🔑 MISE EN SENS */}
      {selected.length > 0 && (
        <section className="meaningBlock">
          {selected.map(id => {
            const A = ARCHETYPES[id]
            return (
              <div key={id} className="meaningItem">
                <strong>{A.name}</strong>
                <span>{A.skill}</span>
              </div>
            )
          })}

          {selected.length === 3 && (
            <p className="meaningHint">
              Ces trois forces composent ton champ de l’instant.
            </p>
          )}
        </section>
      )}
    </div>
  )
}