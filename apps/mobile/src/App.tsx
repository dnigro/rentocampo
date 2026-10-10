import React from "react";
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as WebBrowser from "expo-web-browser";

const SITE = "https://rentocampo.com";
const destinations = [
  { title: "Ver campos", path: "/campos", description: "Explorá campos publicados en Argentina" },
  { title: "Ver servicios", path: "/servicios-rurales", description: "Encontrá servicios rurales" },
  { title: "Ingresar", path: "/login", description: "Accedé a tu cuenta existente" },
] as const;

async function openDestination(path: string) {
  try {
    await WebBrowser.openBrowserAsync(SITE + path);
  } catch {
    Alert.alert("No pudimos abrir la página", "Verificá tu conexión e intentá nuevamente.");
  }
}

export default function App() {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.brand}>
          <Text style={styles.monogram}>RC</Text>
          <Text style={styles.brandName}>rento<Text style={styles.brandHeavy}>Campo</Text></Text>
          <Text style={styles.tagline}>La red federal del campo</Text>
        </View>
        <Text style={styles.heading}>El campo, más cerca.</Text>
        <Text style={styles.intro}>Explorá oportunidades y servicios rurales desde tu celular.</Text>
        {destinations.map((item) => (
          <TouchableOpacity key={item.path} accessibilityRole="button" style={styles.card} onPress={() => void openDestination(item.path)}>
            <Text style={styles.cardTitle}>{item.title}  →</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.notice}>Versión interna de prueba. Por ahora las secciones se abren en el navegador; todavía no es una app lista para las tiendas.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { padding: 24, paddingTop: 40, paddingBottom: 48 },
  brand: { alignItems: "center", marginBottom: 36 },
  monogram: { color: "#141414", fontSize: 66, fontWeight: "900", letterSpacing: -9, marginRight: 9 },
  brandName: { color: "#141414", fontSize: 25, fontWeight: "300", marginTop: 4 },
  brandHeavy: { fontWeight: "900" },
  tagline: { color: "#555555", fontSize: 12, marginTop: 6 },
  heading: { color: "#141414", fontSize: 29, fontWeight: "800", marginBottom: 8 },
  intro: { color: "#525252", fontSize: 16, lineHeight: 23, marginBottom: 24 },
  card: { borderWidth: 1, borderColor: "#DADADA", backgroundColor: "#FAFAFA", borderRadius: 14, padding: 20, marginBottom: 12 },
  cardTitle: { color: "#141414", fontWeight: "800", fontSize: 19, marginBottom: 6 },
  cardDescription: { color: "#575757", fontSize: 14 },
  notice: { color: "#666666", fontSize: 12, lineHeight: 18, marginTop: 25 },
});
