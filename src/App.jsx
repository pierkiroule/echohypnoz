import { useEffect, useMemo, useRef, useState } from "react"
import EmojiGraph from "./EmojiGraph.jsx"
import { ARCHETYPES } from "./archetypes.js"
import { generateMantra } from "./haiku.js"

export default function App() {
  const [nodes, setNodes] = useState([])
  const [selected, setSelected] = useState([])
  const [transitioning, setTransitioning] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const timersRef = useRef([])

  const mantra = useMemo(() => {
    if (selected.length !== 3) return null
    return generateMantra(selected)
  }, [selected])

  useEffect(() => {
    timersRef.current.forEach(timer => clearTimeout(timer))
    timersRef.current = []
    setTransitioning(false)
    setSceneReady(false)

    if (selected.length === 3) {
      const transitionTimer = setTimeout(() => {
        setTransitioning(true)
      }, 5200)
      const sceneTimer = setTimeout(() => {
        setSceneReady(true)
      }, 7200)

      timersRef.current = [transitionTimer, sceneTimer]
    }

    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer))
    }
  }, [selected])

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
        <EmojiGraph onPositions={setNodes} selectedIds={selected} />

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

        {selected.length === 3 && (
          <div
            className={`immersionLayer${transitioning ? " active" : ""}${
              sceneReady ? " visible" : ""
            }`}
          >
            <div className="immersionContent">
              <span>La scène s’ouvre doucement</span>
              <small>Une immersion se prépare.</small>
            </div>
          </div>
        )}
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
            <>
              {mantra && (
                <div className="mantraBlock">
                  <p className="mantraTitle">Mantra du moment</p>
                  <p className="mantraText">
                    {mantra.split("\n").map((line, index) => (
                      <span key={`${line}-${index}`}>{line}</span>
                    ))}
                  </p>
                </div>
              )}
              <p className="meaningHint">
                Ces trois forces composent ton champ de l’instant.
              </p>
              {transitioning && (
                <p className="transitionHint">
                  Laisse le mantra s’infuser, la scène se déplie.
                </p>
              )}
            </>
          )}
        </section>
      )}
    </div>
  )
}
