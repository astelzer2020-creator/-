import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { colors, radius, spacing, shadow } from '../utils/theme'

const STATUS_COLOR = {
  'בתכנון': colors.warning,
  'אושר': colors.success,
  'בביצוע': colors.primary,
  'הושלם': colors.secondary,
}

export default function ProjectCard({ project }) {
  const router = useRouter()
  const statusColor = STATUS_COLOR[project.status] || colors.textMuted

  const handlePress = () => {
    Haptics.selectionAsync()
    router.push(`/project/${project.id}`)
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text style={styles.name} numberOfLines={1}>{project.name}</Text>
          <Text style={styles.city}>{project.city} · {project.type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor + '50' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{project.status}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.success }]}>{project.roi || 0}%</Text>
          <Text style={styles.statLabel}>ROI</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{project.existingUnits || 0}</Text>
          <Text style={styles.statLabel}>יח"ד קיים</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{project.proposedUnits || 0}</Text>
          <Text style={styles.statLabel}>יח"ד חדש</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {project.investment ? `₪${(project.investment / 1e6).toFixed(1)}M` : '—'}
          </Text>
          <Text style={styles.statLabel}>השקעה</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  titleArea: { flex: 1, marginLeft: spacing.sm },
  name: { color: colors.text, fontWeight: '700', fontSize: 15 },
  city: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  statusBadge: { borderRadius: radius.full, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  stats: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.text, fontWeight: '700', fontSize: 15 },
  statLabel: { color: colors.textDim, fontSize: 10, marginTop: 1 },
  divider: { width: 1, height: 28, backgroundColor: colors.cardBorder },
})
