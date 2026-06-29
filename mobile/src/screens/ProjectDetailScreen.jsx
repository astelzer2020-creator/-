import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useProjectStore } from '../store/projectStore'
import Card from '../components/Card'
import StatBadge from '../components/StatBadge'
import ROIGauge from '../components/ROIGauge'
import Button from '../components/Button'
import { colors, spacing } from '../utils/theme'
import * as Haptics from 'expo-haptics'

const STATUS_COLOR = {
  'בתכנון': '#f59e0b', 'אושר': '#10b981', 'בביצוע': '#3b82f6', 'הושלם': '#8b5cf6',
}

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const projects = useProjectStore((s) => s.projects)
  const removeProject = useProjectStore((s) => s.removeProject)

  const project = projects.find((p) => String(p.id) === String(id))

  if (!project) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>הפרויקט לא נמצא</Text>
        <Button title="חזרה" onPress={() => router.back()} variant="outline" style={{ marginTop: spacing.md }} />
      </View>
    )
  }

  const statusColor = STATUS_COLOR[project.status] || colors.textMuted
  const density = project.existingUnits > 0
    ? Math.round(((project.proposedUnits - project.existingUnits) / project.existingUnits) * 100)
    : 0

  const handleShare = async () => {
    await Share.share({
      message: `פרויקט: ${project.name}\nעיר: ${project.city}\nסוג: ${project.type}\nROI: ${project.roi}%\nיח"ד: ${project.existingUnits} → ${project.proposedUnits}`,
      title: project.name,
    })
  }

  const handleDelete = () => {
    Alert.alert('מחק פרויקט', `למחוק את "${project.name}"?`, [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק', style: 'destructive',
        onPress: () => {
          removeProject(project.id)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
          router.back()
        },
      },
    ])
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <LinearGradient colors={['#1e3a5f', '#0f172a']} style={styles.hero}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← חזרה</Text>
        </TouchableOpacity>
        <Text style={styles.heroName}>{project.name}</Text>
        <Text style={styles.heroCity}>{project.city} · {project.type}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '30', borderColor: statusColor + '60' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{project.status}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.gaugeRow}>
          <ROIGauge roi={project.roi || 0} size={150} />
          <View style={styles.keyMetrics}>
            {[
              { label: 'יח"ד קיים', value: project.existingUnits || 0, color: colors.textMuted },
              { label: 'יח"ד חדש', value: project.proposedUnits || 0, color: colors.primary },
              { label: 'גידול', value: `${density}%`, color: colors.success },
              { label: 'השקעה', value: project.investment ? `₪${(project.investment / 1e6).toFixed(1)}M` : '—', color: colors.warning },
            ].map(({ label, value, color }) => (
              <View key={label} style={styles.metric}>
                <Text style={styles.metricLabel}>{label}</Text>
                <Text style={[styles.metricValue, { color }]}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>פרטי פרויקט</Text>
          {[
            ['שם', project.name],
            ['עיר', project.city],
            ['סוג תוכנית', project.type],
            ['סטטוס', project.status],
            ['שטח קרקע', project.landArea ? `${project.landArea} מ"ר` : '—'],
          ].map(([label, val]) => (
            <View key={label} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={styles.detailValue}>{val || '—'}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>ניתוח כלכלי</Text>
          {[
            ['ROI', `${project.roi || 0}%`, colors.success],
            ['השקעה כוללת', project.investment ? `₪${(project.investment / 1e6).toFixed(1)}M` : '—', colors.warning],
            ['יח"ד לפני', String(project.existingUnits || 0), colors.textMuted],
            ['יח"ד אחרי', String(project.proposedUnits || 0), colors.primary],
            ['גידול ביחידות', `${density}%`, colors.success],
          ].map(([label, val, color]) => (
            <View key={label} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={[styles.detailValue, { color }]}>{val}</Text>
            </View>
          ))}
        </Card>

        <View style={styles.actions}>
          <Button title="שתף" onPress={handleShare} variant="outline" style={{ flex: 1 }} />
          <Button title="מחק" onPress={handleDelete} variant="danger" style={{ flex: 1 }} />
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  notFoundText: { color: colors.textMuted, fontSize: 16 },
  hero: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  back: { marginBottom: spacing.md },
  backText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  heroName: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'right' },
  heroCity: { color: 'rgba(255,255,255,0.65)', fontSize: 14, textAlign: 'right', marginTop: 4 },
  statusBadge: { alignSelf: 'flex-end', marginTop: spacing.sm, borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  content: { padding: spacing.md },
  gaugeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  keyMetrics: { flex: 1, marginRight: spacing.md },
  metric: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  metricLabel: { color: colors.textMuted, fontSize: 13 },
  metricValue: { fontWeight: '700', fontSize: 14 },
  card: { marginBottom: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: '700', fontSize: 15, textAlign: 'right', marginBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.cardBorder, paddingBottom: spacing.sm },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.cardBorder + '50' },
  detailLabel: { color: colors.textMuted, fontSize: 13 },
  detailValue: { color: colors.text, fontSize: 13, fontWeight: '600', textAlign: 'right', flex: 1, marginRight: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
})
