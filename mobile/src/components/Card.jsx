import { View, StyleSheet } from 'react-native'
import { colors, radius, spacing } from '../utils/theme'

export default function Card({ children, style, padded = true }) {
  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  padded: {
    padding: spacing.md,
  },
})
