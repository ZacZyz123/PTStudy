/**
 * Ambient aurora background — slow-drifting, blurred light blobs that add
 * atmospheric depth behind content (Modern Dark "Cinema" style). Pure CSS,
 * fixed behind everything, and automatically stilled under reduced-motion.
 */
export default function AuroraBackground({ fixed = true }: { fixed?: boolean }) {
  return (
    <div
      aria-hidden
      className={`${fixed ? 'fixed' : 'absolute'} inset-0 -z-20 overflow-hidden`}
    >
      <div className="aurora" />
    </div>
  )
}
