import { Tabs } from 'expo-router'
import { Text, View } from 'react-native'
import { colors } from '../../src/utils/theme'

function TabIcon({ emoji, label, focused }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: focused ? 22 : 20 }}>{emoji}</Text>
      <Text style={{ color: focused ? colors.primary : colors.textDim, fontSize: 10, marginTop: 2, fontWeight: focused ? '700' : '400' }}>
        {label}
      </Text>
    </View>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.cardBorder,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 4,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="בית" focused={focused} /> }}
      />
      <Tabs.Screen
        name="projects"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏗️" label="פרויקטים" focused={focused} /> }}
      />
      <Tabs.Screen
        name="roi"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="ROI" focused={focused} /> }}
      />
      <Tabs.Screen
        name="map"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" label="מפה" focused={focused} /> }}
      />
      <Tabs.Screen
        name="import"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📂" label="יבוא" focused={focused} /> }}
      />
    </Tabs>
  )
}
