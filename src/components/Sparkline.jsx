import { ResponsiveContainer, LineChart, Line } from 'recharts'

export default function Sparkline({ data, color = '#fff' }) {
  const points = data.map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width="100%" height={44}>
      <LineChart data={points} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2.2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
