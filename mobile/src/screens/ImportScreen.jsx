import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import * as Haptics from 'expo-haptics'
import { useProjectStore } from '../store/projectStore'
import Card from '../components/Card'
import Button from '../components/Button'
import { colors, spacing, radius } from '../utils/theme'

const FIELD_MAP = {
  'מספר תיק': 'caseNumber', 'כתובת': 'address', 'עיר': 'city',
  'גוש': 'block', 'חלקה': 'parcel', 'קומות קיים': 'existingFloors',
  'קומות מוצע': 'proposedFloors', 'יח"ד קיים': 'existingUnits',
  'יח"ד מוצע': 'proposedUnits', 'שטח קרקע': 'landArea',
  'עלות בנייה': 'buildCost', 'מחיר מכירה': 'salePrice',
  'סוג תוכנית': 'planType', 'סטטוס': 'status',
}

function parseCSV(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/"/g, ''))
    const row = {}
    headers.forEach((h, i) => { row[FIELD_MAP[h] || h] = vals[i] || '' })
    return row
  })
}

function parseJSON(text) {
  const data = JSON.parse(text)
  const rows = Array.isArray(data) ? data : data.features?.map(f => f.properties) || [data]
  return rows.map(r => {
    const out = {}
    for (const [k, v] of Object.entries(r)) out[FIELD_MAP[k] || k] = v
    return out
  })
}

export default function ImportScreen() {
  const addBulk = useProjectStore((s) => s.addBulk)
  const [parsed, setParsed] = useState(null)
  const [loading, setLoading] = useState(false)

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/json', 'text/plain'],
        copyToCacheDirectory: true,
      })
      if (res.canceled) return

      setLoading(true)
      const file = res.assets[0]
      const text = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.UTF8 })
      const ext = file.name.split('.').pop().toLowerCase()

      let rows = []
      if (ext === 'csv' || ext === 'txt') rows = parseCSV(text)
      else if (ext === 'json') rows = parseJSON(text)
      else { Alert.alert('שגיאה', 'פורמט לא נתמך. השתמש ב-CSV או JSON.'); setLoading(false); return }

      setParsed({ rows, name: file.name, count: rows.length })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (e) {
      Alert.alert('שגיאה', e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = () => {
    if (!parsed) return
    const projects = parsed.rows
      .filter(r => r.address || r.caseNumber)
      .map(r => ({
        name: r.address || `תיק ${r.caseNumber}`,
        city: r.city || 'לא ידוע',
        type: r.planType || 'תמ"א 38',
        existingUnits: Number(r.existingUnits) || 0,
        proposedUnits: Number(r.proposedUnits) || 0,
        investment: Number(r.buildCost) || 0,
        roi: r.proposedUnits && r.existingUnits
          ? Math.round(((Number(r.proposedUnits) - Number(r.existingUnits)) / Number(r.existingUnits)) * 100)
          : 0,
        status: r.status || 'בתכנון',
        lat: 32.0853 + (Math.random() - 0.5) * 0.5,
        lng: 34.7818 + (Math.random() - 0.5) * 0.5,
      }))

    addBulk(projects)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    Alert.alert('יובא בהצלחה!', `${projects.length} פרויקטים נוספו.`)
    setParsed(null)
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>יבוא נתונים</Text>
        <Text style={styles.sub}>ייבא נתוני תב"ע / PIO</Text>
      </View>

      <View style={styles.sourceRow}>
        {['תב"ע', 'PIO', 'Excel/CSV'].map((s) => (
          <Card key={s} style={styles.sourceCard}>
            <Text style={styles.sourceIcon}>📊</Text>
            <Text style={styles.sourceName}>{s}</Text>
          </Card>
        ))}
      </View>

      <TouchableOpacity style={styles.dropzone} onPress={pickFile} activeOpacity={0.8}>
        <Text style={styles.dropIcon}>📂</Text>
        <Text style={styles.dropTitle}>בחר קובץ</Text>
        <Text style={styles.dropSub}>CSV · JSON · GeoJSON</Text>
      </TouchableOpacity>

      {loading && <Text style={styles.loading}>טוען...</Text>}

      {parsed && (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.parsedTitle}>✅ {parsed.name}</Text>
          <View style={styles.parsedStats}>
            <View style={styles.parsedStat}>
              <Text style={styles.parsedStatVal}>{parsed.count}</Text>
              <Text style={styles.parsedStatLabel}>רשומות</Text>
            </View>
            <View style={styles.parsedStat}>
              <Text style={styles.parsedStatVal}>{Object.keys(parsed.rows[0] || {}).length}</Text>
              <Text style={styles.parsedStatLabel}>עמודות</Text>
            </View>
          </View>

          <ScrollView horizontal style={{ marginBottom: spacing.md }}>
            <View>
              <View style={styles.tableRow}>
                {Object.keys(parsed.rows[0] || {}).slice(0, 5).map(k => (
                  <Text key={k} style={styles.tableHeader}>{k}</Text>
                ))}
              </View>
              {parsed.rows.slice(0, 4).map((row, i) => (
                <View key={i} style={styles.tableRow}>
                  {Object.values(row).slice(0, 5).map((v, j) => (
                    <Text key={j} style={styles.tableCell}>{String(v)}</Text>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>

          <Button title={`ייבא ${parsed.count} רשומות`} onPress={handleImport} />
        </Card>
      )}

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.mapTitle}>מיפוי עמודות (תב"ע ← English)</Text>
        {Object.entries(FIELD_MAP).slice(0, 8).map(([heb, eng]) => (
          <View key={eng} style={styles.mapRow}>
            <Text style={styles.mapHeb}>{heb}</Text>
            <Text style={styles.mapArrow}>→</Text>
            <Text style={styles.mapEng}>{eng}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingTop: spacing.md, paddingBottom: spacing.md },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', textAlign: 'right' },
  sub: { color: colors.textMuted, fontSize: 14, textAlign: 'right', marginTop: 2 },
  sourceRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  sourceCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  sourceIcon: { fontSize: 22, marginBottom: 4 },
  sourceName: { color: colors.text, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  dropzone: { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.primary + '60', borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center' },
  dropIcon: { fontSize: 40, marginBottom: spacing.sm },
  dropTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  dropSub: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  loading: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
  parsedTitle: { color: colors.success, fontWeight: '700', fontSize: 15, marginBottom: spacing.sm, textAlign: 'right' },
  parsedStats: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  parsedStat: { flex: 1, backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  parsedStatVal: { color: colors.primary, fontSize: 22, fontWeight: '800' },
  parsedStatLabel: { color: colors.textMuted, fontSize: 11 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  tableHeader: { color: colors.textMuted, fontSize: 11, fontWeight: '700', width: 100, padding: 6 },
  tableCell: { color: colors.text, fontSize: 11, width: 100, padding: 6 },
  mapTitle: { color: colors.text, fontWeight: '700', fontSize: 14, textAlign: 'right', marginBottom: spacing.sm },
  mapRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.cardBorder + '50' },
  mapHeb: { color: colors.textMuted, fontSize: 12, flex: 1, textAlign: 'right' },
  mapArrow: { color: colors.textDim, marginHorizontal: 8 },
  mapEng: { color: colors.primary, fontFamily: 'monospace', fontSize: 12, flex: 1 },
})
