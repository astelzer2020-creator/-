import { useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useProjectStore } from '../store/projectStore'
import ProjectCard from '../components/ProjectCard'
import { colors, spacing, radius } from '../utils/theme'
import * as Haptics from 'expo-haptics'

const FILTERS = ['הכל', 'בתכנון', 'אושר', 'בביצוע', 'הושלם']

export default function ProjectsScreen() {
  const projects = useProjectStore((s) => s.projects)
  const removeProject = useProjectStore((s) => s.removeProject)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('הכל')

  const filtered = projects.filter((p) => {
    const matchStatus = filter === 'הכל' || p.status === filter
    const matchSearch = !search || p.name?.includes(search) || p.city?.includes(search)
    return matchStatus && matchSearch
  })

  const handleDelete = useCallback((id, name) => {
    Alert.alert('מחק פרויקט', `למחוק את "${name}"?`, [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק', style: 'destructive',
        onPress: () => { removeProject(id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning) },
      },
    ])
  }, [removeProject])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>פרויקטים</Text>
        <Text style={styles.count}>{filtered.length} / {projects.length}</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="חיפוש לפי שם / עיר..."
          placeholderTextColor={colors.textDim}
          value={search}
          onChangeText={setSearch}
          textAlign="right"
        />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterActive]}
            onPress={() => { setFilter(f); Haptics.selectionAsync() }}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item }) => (
          <View>
            <ProjectCard project={item} />
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏗️</Text>
            <Text style={styles.emptyText}>
              {projects.length === 0 ? 'אין פרויקטים.\nייבא נתונים מעמוד הייבוא.' : 'אין תוצאות לסינון זה.'}
            </Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  title: { color: colors.text, fontSize: 26, fontWeight: '800' },
  count: { color: colors.textMuted, fontSize: 13 },
  searchRow: { paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  search: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.cardBorder, color: colors.text, paddingHorizontal: spacing.md, paddingVertical: 11, fontSize: 14 },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: 6, marginBottom: spacing.sm },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1, borderColor: colors.cardBorder },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: spacing.md, paddingBottom: 40 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
})
