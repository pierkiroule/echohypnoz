import { useEffect, useRef } from "react"
import * as d3 from "d3"
import { ARCHETYPES } from "./archetypes.js"
import { simulateCommunity } from "./communitySim.js"

let t = 0

export default function EmojiGraph({ onPositions, onNodeRef, selectedIds = [] }) {
  const svgRef = useRef(null)
  const nodesRef = useRef([])
  const simRef = useRef(null)
  const selectedRef = useRef(new Set())

  useEffect(() => {
    selectedRef.current = new Set(selectedIds)
  }, [selectedIds])

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
    const maxWeight = d3.max(links, d => d.weight) || 1
    const widthScale = d3.scaleLinear().domain([1, maxWeight]).range([0.6, 2.4])
    const opacityScale = d3.scaleLinear().domain([1, maxWeight]).range([0.12, 0.5])

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()
    svg.attr("width", w).attr("height", h)

    const g = svg.append("g")

    const linkSelection = g.selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "rgba(225,210,255,0.45)")
      .attr("stroke-width", d => widthScale(d.weight))
      .attr("stroke-linecap", "round")
      .attr("opacity", d => opacityScale(d.weight))

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

      linkSelection
        .attr("x1", d => d.source.x * breathe)
        .attr("y1", d => d.source.y * breathe)
        .attr("x2", d => d.target.x * breathe)
        .attr("y2", d => d.target.y * breathe)
        .attr("stroke-dasharray", d => {
          const dash = 8 + d.weight * 0.4
          return `${dash} ${dash * 1.7}`
        })
        .attr("stroke-dashoffset", d => {
          const shift = (t * 6 + d.weight) * 0.8
          const isSelected = selectedRef.current.has(d.source.id) && selectedRef.current.has(d.target.id)
          return isSelected ? -shift * 1.6 : -shift
        })
        .attr("stroke-width", d => {
          const isSelected = selectedRef.current.has(d.source.id) && selectedRef.current.has(d.target.id)
          return widthScale(d.weight) + (isSelected ? 0.9 : 0)
        })
        .attr("opacity", d => {
          const base = opacityScale(d.weight)
          const pulse = (Math.sin(t + d.weight) + 1) * 0.06
          const isSelected = selectedRef.current.has(d.source.id) && selectedRef.current.has(d.target.id)
          return Math.min(0.9, base + pulse + (isSelected ? 0.3 : 0))
        })
        .attr("stroke", d => {
          const isSelected = selectedRef.current.has(d.source.id) && selectedRef.current.has(d.target.id)
          return isSelected ? "rgba(186,140,255,0.9)" : "rgba(225,210,255,0.45)"
        })

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
