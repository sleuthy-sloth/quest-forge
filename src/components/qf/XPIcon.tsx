interface XPIconProps {
  size?: number
}

export function XPIcon({ size = 14 }: XPIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ filter: 'drop-shadow(0 0 3px rgba(232,160,32,0.6))' }}
      aria-hidden="true"
    >
      <polygon
        points="8,1 10,6 15,6.5 11,10 12.5,15 8,12 3.5,15 5,10 1,6.5 6,6"
        fill="#f9c846"
        stroke="#9c5e04"
        strokeWidth="0.5"
      />
    </svg>
  )
}

export default XPIcon
