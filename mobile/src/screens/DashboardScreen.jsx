import { View, Text, ScrollView, StyleSheet, RefreshControl, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { LineChart, BarChart } from 'react-native-chart-kit'
import { useProjectStore } from '../store/projectStore'
import Card from '../components/Card'
import StatBadge from '../components/StatBadge'
import ProjectCard from '../components/ProjectCard'
import { colors, spacing } from '../utils/theme'
import { useState } from 'react'

const { width } = Dimensions.get('window')
const CHART_WIDTH = width - spacing.md * 2 - 32

const roiTrend = {
  labels: ["'20", "'21", "'22", "'23", "'24", "'25"],
  datasets: [{ data: [12, 18, 22, 28, 35, 42] }],
}

const cityChart = {
  labels: ['ת"א', 'חיפה', 'י-ם', 'ראשל"צ', 'נתניה'],
  datasets: [{ data: [45, 32, 28, 21, 18] }],
}

const chartConfig = {
  backgroundColor: colors.card,
  backgroundGradientFrom: colors.card,
  backgroundGradientTo: colors.card,
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  labelColor: () => colors.textMuted,
  strokeWidth: 2,
  propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
}

export default function DashboardScreen() {
  const projects = useProjectStore((s) => s.projects)
  const load = useProjectStore((s) => s.load)
  const [refreshing, setRefreshing] = useState(false)

  const avgRoi = projects.length
    ? Math.round(projects.reduce((s, p) => s + (p.roi || 0), 0) / projects.length)
    : 38

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <LinearGradient colors={['#1e3a5f', '#0f172a']} style={styles.hero}>
        <Text style={styles.heroTitle}>התחדשות עירונית</Text>
        <Text style={styles.heroSub}>סימולטור ישראלי</Text>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>{projects.length || 127}</Text>
            <Text style={styles.heroStatLabel}>פרויקטים</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>{avgRoi}%</Text>
            <Text style={styles.heroStatLabel}>ROI ממוצע</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>₪2.1B</Text>
            <Text style={styles.heroStatLabel}>השקעה</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.badges}>
          <StatBadge label="פרויקטים פעילים" value="127" color={colors.primary} />
          <View style={{ width: spacing.sm }} />
          <StatBadge label="דיירים מועתקים" value="4,820" color={colors.secondary} />
        </View>

        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>מגמת ROI לאורך זמן</Text>
          <LineChart
            data={roiTrend}
            width={CHART_WIDTH}
            height={160}
            chartConfig={chartConfig}
            bezier
            withInnerLines={false}
            style={{ marginLeft: -16 }}
          />
        </Card>

        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>פרויקטים לפי עיר</Text>
          <BarChart
            data={cityChart}
            width={CHART_WIDTH}
            height={140}
            chartConfig={{ ...chartConfig, color: (o = 1) => `rgba(139, 92, 246, ${o})` }}
            withInnerLines={false}
            showValuesOnTopOfBars
            style={{ marginLeft: -16 }}
          />
        </Card>

        <Text style={styles.sectionTitle}>פרויקטים אחרונים</Text>
        {projects.slice(0, 5).map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
        {projects.length === 0 && (
          <Card>
            <Text style={styles.empty}>אין פרויקטים עדיין.{'\n'}ייבא נתונים מעמוד הייבוא.</Text>
          </Card>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  hero: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl + 8 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'right' },
  heroSub: { color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'right', marginTop: 2 },
  heroStats: { flexDirection: 'row', marginTop: spacing.lg, justifyContent: 'space-around' },
  heroStat: { alignItems: 'center' },
  heroStatVal: { color: '#fff', fontSize: 22, fontWeight: '800' },
  heroStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  content: { padding: spacing.md },
  badges: { flexDirection: 'row', marginBottom: spacing.md },
  chartCard: { marginBottom: spacing.md },
  chartTitle: { color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: spacing.sm, textAlign: 'right' },
  sectionTitle: { color: colors.text, fontWeight: '700', fontSize: 17, marginBottom: spacing.sm, textAlign: 'right' },
  empty: { color: colors.textMuted, textAlign: 'center', lineHeight: 24, padding: spacing.md },
})
