interface CoinProps {
  size?: number
}

export function Coin({ size = 14 }: CoinProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="#f9c846" stroke="#9c5e04" strokeWidth="1" />
      <circle cx="8" cy="8" r="4.5" fill="none" stroke="#9c5e04" strokeWidth="0.5" />
      <text
        x="8"
        y="11"
        fontSize="7"
        fontFamily="serif"
        fontWeight="bold"
        fill="#9c5e04"
        textAnchor="middle"
      >
        G
      </text>
    </svg>
  )
}

export default Coin
