import { useEffect, useRef } from "react"
import * as d3 from "d3"
import { ARCHETYPES } from "./archetypes.js"
import { simulateCommunity } from "./communitySim.js"

let t = 0

export default function EmojiGraph({ onPositions, onNodeRef }) {
  const svgRef = useRef(null)
  const nodesRef = useRef([])
  const simRef = useRef(null)

  useEffect(() => {
    const stage = svgRef.current.parentElement
    if (!stage) return

    const w = stage.clientWidth
    const h = stage.clientHeight

    const nodes = Object.values(ARCHETYPES).map(a => ({
      id: a.id,
      x: Math.random() * w,
      y: Math.random() * h
    }))
    nodesRef.current = nodes

    const links = simulateCommunity(140)

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()
    svg.attr("width", w).attr("height", h)

    const g = svg.append("g")

    g.selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "rgba(255,255,255,0.15)")
      .attr("stroke-width", d => Math.sqrt(d.weight))
      .attr("opacity", 0.35)

    const sim = d3.forceSimulation(nodes)
      .force("link",
        d3.forceLink(links)
          .id(d => d.id)
          .strength(d => d.weight * 0.01)
      )
      .force("charge", d3.forceManyBody().strength(-45))
      .force("center", d3.forceCenter(w / 2, h / 2))
      .force("collision", d3.forceCollide().radius(26))
      .alphaDecay(0.04)
      .velocityDecay(0.35)

    simRef.current = sim

    sim.on("tick", () => {
      t += 0.01
      const breathe = 1 + Math.sin(t) * 0.03

      g.selectAll("line")
        .attr("x1", d => d.source.x * breathe)
        .attr("y1", d => d.source.y * breathe)
        .attr("x2", d => d.target.x * breathe)
        .attr("y2", d => d.target.y * breathe)

      onPositions(
        nodes.map(n => ({
          id: n.id,
          x: n.x * breathe,
          y: n.y * breathe
        }))
      )
    })

    // 🔑 exposer les refs au parent
    onNodeRef?.({
      getNode(id) {
        return nodesRef.current.find(n => n.id === id)
      },
      restart() {
        simRef.current?.alpha(0.3).restart()
      }
    })

    return () => sim.stop()
  }, [onPositions, onNodeRef])

  return (
    <svg
      ref={svgRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none"
      }}
    />
  )
}