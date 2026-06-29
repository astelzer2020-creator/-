import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg'
import { colors } from '../utils/theme'

export default function ROIGauge({ roi = 0, size = 140 }) {
  const r = (size / 2) - 12
  const circumference = 2 * Math.PI * r
  const clampedRoi = Math.min(Math.max(roi, 0), 100)
  const strokeDashoffset = circumference - (clampedRoi / 100) * circumference

  const getColor = () => {
    if (roi >= 30) return colors.success
    if (roi >= 15) return colors.warning
    return colors.danger
  }

  const label = roi >= 30 ? 'מעולה' : roi >= 15 ? 'סביר' : 'נמוך'

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="roiGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={getColor()} stopOpacity="1" />
            <Stop offset="1" stopColor={getColor()} stopOpacity="0.5" />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.cardBorder} strokeWidth={10} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="url(#roiGrad)" strokeWidth={10} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: getColor(), fontSize: 26, fontWeight: '800' }}>{roi.toFixed(1)}%</Text>
        <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{label}</Text>
      </View>
    </View>
  )
}
