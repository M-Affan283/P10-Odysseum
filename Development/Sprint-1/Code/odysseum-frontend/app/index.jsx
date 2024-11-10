// File: app/index.jsx
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odysseum!</Text>
      <StatusBar style="auto" />
      {/* Adjusted Link paths based on common folder structure */}
      <Link href="/home" style={styles.link}>
        <Text style={styles.linkText}>Home</Text>
      </Link>
      <Link href="/search/example" style={styles.link}> 
        <Text style={styles.linkText}>Search</Text> 
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
  title: { fontSize: 24, marginBottom: 20 },
  link: { marginVertical: 5 },
  linkText: { color: 'blue', fontSize: 18 },
});
