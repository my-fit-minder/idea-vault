// Modal screen - keeping for potential future use
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function ModalScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0a0a0a' : '#fff' }]}>
      <Text style={[styles.title, { color: colors.text }]}>Modal</Text>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
