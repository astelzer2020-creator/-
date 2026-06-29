import { useState, useMemo, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import Slider from '@react-native-community/slider'
import { LineChart } from 'react-native-chart-kit'
import { useProjectStore } from '../store/projectStore'
import Card from '../components/Card'
import StatBadge from '../components/StatBadge'
import ROIGauge from '../components/ROIGauge'
import Button from '../components/Button'
import { colors, spacing, radius } from '../utils/theme'
import * as Haptics from 'expo-haptics'

const { width } = Dimensions.get('window')

const PLAN_TYPES = ['תמ"א 38/1', 'תמ"א 38/2', 'פינוי-בינוי', 'עיבוי-בינוי']
const CITY_PRICES = {
  'תל אביב': { build: 12000, sale: 55000 },
  'חיפה':    { build: 10000, sale: 18000 },
  'ירושלים': { build: 11000, sale: 38000 },
  'ראשון לציון': { build: 10500, sale: 25000 },
  'נתניה':   { build: 10000, sale: 20000 },
}

function SliderRow({ label, value, min, max, step = 1, unit = '', onChange }) {
  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{value.toLocaleString()}{unit}</Text>
      </View>
      <Slider
        style={{ width: '100%', height: 36 }}
        minimumValue={min} maximumValue={max} step={step} value={value}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.cardBorder}
        thumbTintColor={colors.primary}
        onValueChange={(v) => { onChange(v); Haptics.selectionAsync() }}
      />
    </View>
  )
}

export default function ROIScreen() {
  const addProject = useProjectStore((s) => s.addProject)
  const [city, setCity] = useState('תל אביב')
  const [planType, setPlanType] = useState('פינוי-בינוי')
  const [existingUnits, setExistingUnits] = useState(20)
  const [addedUnits, setAddedUnits] = useState(40)
  const [avgUnitSize, setAvgUnitSize] = useState(85)
  const [buildCost, setBuildCost] = useState(11000)
  const [salePrice, setSalePrice] = useState(25000)
  const [tenantComp, setTenantComp] = useState(2500)
  const [financeRate, setFinanceRate] = useState(5)
  const [years, setYears] = useState(4)
  const [saved, setSaved] = useState(false)

  const calc = useMemo(() => {
    const total = existingUnits + addedUnits
    const revenue = addedUnits * avgUnitSize * salePrice
    const construction = total * avgUnitSize * buildCost
    const tenant = existingUnits * tenantComp * 12 * years
    const demolition = planType.includes('פינוי') || planType.includes('הריסה') ? 1000 * 200 : 0
    const permits = revenue * 0.035
    const finance = construction * (financeRate / 100) * years
    const totalCost = construction + tenant + demolition + permits + finance
    const profit = revenue - totalCost
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0
    const npv = profit / Math.pow(1 + financeRate / 100, years)
    const irr = roi > 0 ? (Math.pow(1 + roi / 100, 1 / years) - 1) * 100 : 0
    return { revenue, construction, tenant, totalCost, profit, roi, npv, irr, total }
  }, [existingUnits, addedUnits, avgUnitSize, buildCost, salePrice, tenantComp, financeRate, years, planType])

  const sensitivityData = useMemo(() => {
    const steps = [-30, -20, -10, 0, 10, 20, 30]
    return {
      labels: steps.map(s => `${s > 0 ? '+' : ''}${s}%`),
      datasets: [{
        data: steps.map(pct => {
          const sp = salePrice * (1 + pct / 100)
          const rev = addedUnits * avgUnitSize * sp
          const cost = (existingUnits + addedUnits) * avgUnitSize * buildCost +
            existingUnits * tenantComp * 12 * years + rev * 0.035 +
            (existingUnits + addedUnits) * avgUnitSize * buildCost * (financeRate / 100) * years
          return Math.max(0, ((rev - cost) / cost) * 100)
        }),
      }],
    }
  }, [addedUnits, avgUnitSize, salePrice, existingUnits, buildCost, tenantComp, financeRate, years])

  const fmt = (n) => `₪${(Math.abs(n) / 1e6).toFixed(1)}M`

  const handleSave = () => {
    addProject({
      name: `${planType} - ${city}`,
      city, type: planType,
      existingUnits, proposedUnits: existingUnits + addedUnits,
      investment: calc.construction,
      roi: Math.round(calc.roi),
      status: 'בתכנון',
    })
    setSaved(true)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>מחשבון ROI</Text>
        <Text style={styles.sub}>חישוב כדאיות כלכלית</Text>
      </View>

      <View style={styles.gaugeRow}>
        <ROIGauge roi={calc.roi} size={160} />
        <View style={styles.keyStats}>
          {[
            { label: 'הכנסות', value: fmt(calc.revenue), color: colors.success },
            { label: 'עלויות', value: fmt(calc.totalCost), color: colors.danger },
            { label: 'רווח', value: fmt(calc.profit), color: calc.profit > 0 ? colors.success : colors.danger },
            { label: 'IRR', value: `${calc.irr.toFixed(1)}%`, color: colors.primary },
          ].map(({ label, value, color }) => (
            <View key={label} style={styles.keyStat}>
              <Text style={styles.keyStatLabel}>{label}</Text>
              <Text style={[styles.keyStatVal, { color }]}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>סוג תוכנית</Text>
        <View style={styles.chips}>
          {PLAN_TYPES.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, planType === p && styles.chipActive]}
              onPress={() => { setPlanType(p); Haptics.selectionAsync() }}
            >
              <Text style={[styles.chipText, planType === p && styles.chipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>עיר</Text>
        <View style={styles.chips}>
          {Object.keys(CITY_PRICES).map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, city === c && styles.chipActive]}
              onPress={() => {
                setCity(c)
                setBuildCost(CITY_PRICES[c].build)
                setSalePrice(CITY_PRICES[c].sale)
                Haptics.selectionAsync()
              }}
            >
              <Text style={[styles.chipText, city === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>פרמטרי בנייה</Text>
        <SliderRow label="יחידות קיימות" value={existingUnits} min={4} max={200} onChange={setExistingUnits} unit=" יח'" />
        <SliderRow label="יחידות חדשות" value={addedUnits} min={0} max={400} onChange={setAddedUnits} unit=" יח'" />
        <SliderRow label="גודל ממוצע" value={avgUnitSize} min={40} max={200} onChange={setAvgUnitSize} unit=' מ"ר' />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>מחירים ומימון</Text>
        <SliderRow label='עלות בנייה למ"ר' value={buildCost} min={8000} max={20000} step={500} onChange={setBuildCost} unit=" ₪" />
        <SliderRow label='מחיר מכירה למ"ר' value={salePrice} min={12000} max={80000} step={500} onChange={setSalePrice} unit=" ₪" />
        <SliderRow label="שכ\"ד לדייר/חודש" value={tenantComp} min={1000} max={6000} step={100} onChange={setTenantComp} unit=" ₪" />
        <SliderRow label="ריבית מימון" value={financeRate} min={2} max={12} step={0.5} onChange={setFinanceRate} unit="%" />
        <SliderRow label="משך פרויקט" value={years} min={1} max={10} onChange={setYears} unit=" שנים" />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>ניתוח רגישות — מחיר מכירה</Text>
        <LineChart
          data={sensitivityData}
          width={width - spacing.md * 2 - 32}
          height={160}
          chartConfig={{
            backgroundColor: colors.card, backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            color: (o = 1) => `rgba(16, 185, 129, ${o})`,
            labelColor: () => colors.textMuted,
          }}
          bezier withInnerLines={false}
          style={{ marginLeft: -16 }}
        />
      </Card>

      <View style={styles.actions}>
        <Button
          title={saved ? '✓ נשמר!' : 'שמור לפרויקטים'}
          onPress={handleSave}
          variant={saved ? 'secondary' : 'primary'}
          style={{ flex: 1 }}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.lg, paddingBottom: spacing.md },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', textAlign: 'right' },
  sub: { color: colors.textMuted, fontSize: 14, textAlign: 'right', marginTop: 2 },
  gaugeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, marginBottom: spacing.md },
  keyStats: { flex: 1, marginRight: spacing.md },
  keyStat: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  keyStatLabel: { color: colors.textMuted, fontSize: 12 },
  keyStatVal: { fontWeight: '700', fontSize: 13 },
  section: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
  sectionTitle: { color: colors.text, fontWeight: '700', fontSize: 15, textAlign: 'right', marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1, borderColor: colors.cardBorder },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  sliderRow: { marginBottom: spacing.sm },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  sliderLabel: { color: colors.textMuted, fontSize: 13 },
  sliderValue: { color: colors.text, fontWeight: '700', fontSize: 13 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.md, marginTop: spacing.sm },
})
