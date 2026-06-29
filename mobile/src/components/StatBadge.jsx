import { View, Text, StyleSheet } from 'react-native'
import { colors, radius, spacing } from '../utils/theme'

export default function StatBadge({ label, value, unit = '', color = colors.primary, small = false }) {
  return (
    <View style={[styles.badge, { borderColor: color + '40', backgroundColor: color + '15' }]}>
      <Text style={[styles.value, { color, fontSize: small ? 18 : 24 }]}>
        {value}{unit}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm + 4,
    alignItems: 'center',
    flex: 1,
  },
  value: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
})
