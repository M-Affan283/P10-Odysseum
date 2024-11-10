// File: app/index.jsx
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odysseum!</Text>
      <StatusBar style="auto" />
        
      <Link href="/HomeScreen" className="text-blue-700">Home</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
  title: { fontSize: 24, marginBottom: 20 },
  link: { marginVertical: 5 },
  linkText: { color: 'blue', fontSize: 18 },
});
