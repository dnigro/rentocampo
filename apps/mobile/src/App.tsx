import React, { useEffect, useRef, useState } from "react";
import { BackHandler, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

const SITE = "https://rentocampo.com";
const tabs = [
  { title: "Inicio", path: "/" },
  { title: "Campos", path: "/campos" },
  { title: "Servicios", path: "/servicios-rurales" },
  { title: "Mi cuenta", path: "/login" },
];

export default function App() {
  const browser = useRef<WebView>(null);
  const [target, setTarget] = useState(SITE);
  const [canGoBack, setCanGoBack] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack) { browser.current?.goBack(); return true; }
      if (target !== SITE) { setTarget(SITE); return true; }
      return false;
    });
    return () => handler.remove();
  }, [canGoBack, target]);
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}><Text style={styles.logo}>rento<Text style={styles.bold}>Campo</Text></Text></View>
      <View style={styles.body}>
        <WebView
          ref={browser}
          key={target}
          source={{ uri: target }}
          onNavigationStateChange={(nav) => setCanGoBack(nav.canGoBack)}
          onError={() => setFailed(true)}
          onLoadStart={() => setFailed(false)}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          domStorageEnabled
          javaScriptEnabled
          startInLoadingState
          setSupportMultipleWindows={false}
        />
        {failed && <View style={styles.error}><Text>No se pudo cargar RentoCampo. Revisá tu conexión.</Text><TouchableOpacity onPress={() => browser.current?.reload()}><Text style={styles.retry}>Reintentar</Text></TouchableOpacity></View>}
      </View>
      <View style={styles.tabs}>{tabs.map((tab) => <TouchableOpacity key={tab.path} style={styles.tab} onPress={() => { setFailed(false); setTarget(SITE + (tab.path === "/" ? "" : tab.path)); }}><Text style={styles.tabText}>{tab.title}</Text></TouchableOpacity>)}</View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { padding: 12, alignItems: "center", borderBottomWidth: 1, borderColor: "#E5E5E5" },
  logo: { fontSize: 24, fontWeight: "300", color: "#171717" },
  bold: { fontWeight: "900" },
  body: { flex: 1 },
  tabs: { flexDirection: "row", borderTopWidth: 1, borderColor: "#DDDDDD", paddingVertical: 15 },
  tab: { flex: 1, alignItems: "center" },
  tabText: { color: "#171717", fontWeight: "700", fontSize: 12 },
  error: { ...StyleSheet.absoluteFillObject, backgroundColor: "white", alignItems: "center", justifyContent: "center", padding: 20 },
  retry: { marginTop: 20, fontWeight: "800", textDecorationLine: "underline" },
});
