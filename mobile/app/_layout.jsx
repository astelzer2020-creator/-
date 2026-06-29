import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useProjectStore } from '../src/store/projectStore'
import { colors } from '../src/utils/theme'

export default function RootLayout() {
  const load = useProjectStore((s) => s.load)
  useEffect(() => { load() }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor={colors.bg} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="project/[id]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
      </Stack>
    </GestureHandlerRootView>
  )
}
