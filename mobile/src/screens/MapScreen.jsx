import { useState, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps'
import { useProjectStore } from '../store/projectStore'
import { colors, spacing, radius } from '../utils/theme'

const { width } = Dimensions.get('window')

const STATUS_COLOR = {
  'בתכנון': '#f59e0b',
  'אושר': '#10b981',
  'בביצוע': '#3b82f6',
  'הושלם': '#8b5cf6',
}

const DEMO = [
  { id: 'd1', name: 'פרויקט רוטשילד', city: 'תל אביב', lat: 32.0643, lng: 34.7726, status: 'בביצוע', roi: 42, units: 180, type: 'פינוי-בינוי' },
  { id: 'd2', name: 'שדרות ויצמן', city: 'רחובות', lat: 31.8928, lng: 34.8113, status: 'אושר', roi: 31, units: 80, type: 'תמ"א 38/2' },
  { id: 'd3', name: 'שכונת נורדאו', city: 'חיפה', lat: 32.8191, lng: 34.9976, status: 'בתכנון', roi: 28, units: 120, type: 'עיבוי-בינוי' },
  { id: 'd4', name: 'רח\' הרצל', city: 'ראשון לציון', lat: 31.9641, lng: 34.8001, status: 'הושלם', roi: 38, units: 60, type: 'תמ"א 38/1' },
  { id: 'd5', name: 'שכונת פלורנטין', city: 'תל אביב', lat: 32.0523, lng: 34.7707, status: 'בביצוע', roi: 55, units: 320, type: 'פינוי-בינוי' },
  { id: 'd6', name: 'רמת אביב', city: 'תל אביב', lat: 32.1097, lng: 34.7976, status: 'הושלם', roi: 48, units: 140, type: 'עיבוי-בינוי' },
]

export default function MapScreen() {
  const storeProjects = useProjectStore((s) => s.projects)
  const mapRef = useRef(null)
  const [statusFilter, setStatusFilter] = useState('הכל')

  const allProjects = [...DEMO, ...storeProjects.filter(p => p.lat && p.lng)]
  const filtered = statusFilter === 'הכל' ? allProjects : allProjects.filter(p => p.status === statusFilter)

  const fitToMarkers = () => {
    if (!mapRef.current || filtered.length === 0) return
    mapRef.current.fitToCoordinates(
      filtered.map(p => ({ latitude: p.lat, longitude: p.lng })),
      { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true }
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        {['הכל', 'בתכנון', 'אושר', 'בביצוע', 'הושלם'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filter, statusFilter === f && styles.filterActive]}
            onPress={() => setStatusFilter(f)}
          >
            <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={darkMapStyle}
        initialRegion={{ latitude: 31.9, longitude: 34.85, latitudeDelta: 2.5, longitudeDelta: 1.5 }}
        onMapReady={fitToMarkers}
      >
        {filtered.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.lat, longitude: p.lng }}
            pinColor={STATUS_COLOR[p.status] || '#94a3b8'}
          >
            <View style={[styles.pin, { backgroundColor: STATUS_COLOR[p.status] || '#94a3b8' }]}>
              <Text style={styles.pinText}>{p.roi}%</Text>
            </View>
            <Callout style={styles.callout}>
              <View style={styles.calloutContent}>
                <Text style={styles.calloutName}>{p.name}</Text>
                <Text style={styles.calloutCity}>{p.city} · {p.type}</Text>
                <View style={styles.calloutStats}>
                  <Text style={styles.calloutStat}>ROI: <Text style={{ color: colors.success }}>{p.roi}%</Text></Text>
                  <Text style={styles.calloutStat}>יח"ד: <Text style={{ color: colors.primary }}>{p.units || p.proposedUnits}</Text></Text>
                </View>
                <View style={[styles.calloutStatus, { backgroundColor: (STATUS_COLOR[p.status] || '#94a3b8') + '30' }]}>
                  <Text style={[styles.calloutStatusText, { color: STATUS_COLOR[p.status] }]}>{p.status}</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.legend}>
        {Object.entries(STATUS_COLOR).map(([status, color]) => (
          <View key={status} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{status}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.fitBtn} onPress={fitToMarkers}>
        <Text style={styles.fitBtnText}>🎯 הצג הכל</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  filterBar: { flexDirection: 'row', paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, gap: 4, backgroundColor: colors.bg },
  filter: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, borderWidth: 1, borderColor: colors.cardBorder },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  map: { flex: 1 },
  pin: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  pinText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  callout: { width: 200 },
  calloutContent: { padding: 8 },
  calloutName: { fontWeight: '700', fontSize: 14, color: '#1e293b', textAlign: 'right' },
  calloutCity: { fontSize: 12, color: '#64748b', marginTop: 2, textAlign: 'right' },
  calloutStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  calloutStat: { fontSize: 12, color: '#374151' },
  calloutStatus: { marginTop: 6, borderRadius: 6, padding: 4, alignItems: 'center' },
  calloutStatusText: { fontSize: 11, fontWeight: '700' },
  legend: { position: 'absolute', bottom: 80, right: spacing.md, backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: radius.md, padding: spacing.sm, gap: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.text, fontSize: 11 },
  fitBtn: { position: 'absolute', bottom: 80, left: spacing.md, backgroundColor: colors.card, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.cardBorder },
  fitBtnText: { color: colors.text, fontSize: 13, fontWeight: '600' },
})

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a2744' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#748fc9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1a33' }] },
]
