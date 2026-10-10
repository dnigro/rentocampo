import React, { useEffect, useRef, useState } from "react";
import { BackHandler, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

// La web de producción y su CSS responsive aprobado son la única fuente visual.
// No inyectamos estilos: eso causó diferencias entre preview y APK.
const SITE = "https://rentocampo.com";
const tabs = [
  { title: "Inicio", path: "/" },
  { title: "Campos", path: "/campos" },
  { title: "Servicios", path: "/servicios-rurales" },
  { title: "Mi cuenta", path: "/login" },
];

function MobileShell() {
  const insets = useSafeAreaInsets();
  const browser = useRef<WebView>(null);
  const [target, setTarget] = useState(SITE);
  const [currentUrl, setCurrentUrl] = useState(SITE);
  const [canGoBack, setCanGoBack] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack) {
        browser.current?.goBack();
        return true;
      }
      if (currentUrl !== SITE) {
        setTarget(SITE);
        setCurrentUrl(SITE);
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [canGoBack, currentUrl]);

  const selected = (path: string) => {
    const url = SITE + (path === "/" ? "" : path);
    return path === "/"
      ? currentUrl === SITE || currentUrl === SITE + "/"
      : currentUrl.startsWith(url);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <View style={styles.body}>
        <WebView
          ref={browser}
          key={target}
          source={{ uri: target }}
          onNavigationStateChange={(nav) => {
            setCanGoBack(nav.canGoBack);
            setCurrentUrl(nav.url);
          }}
          onError={() => setFailed(true)}
          onLoadStart={() => setFailed(false)}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          domStorageEnabled
          javaScriptEnabled
          startInLoadingState
          setSupportMultipleWindows={false}
        />
        {failed && (
          <View style={styles.error}>
            <Text>No se pudo cargar RentoCampo. Revisá tu conexión.</Text>
            <TouchableOpacity onPress={() => browser.current?.reload()}>
              <Text style={styles.retry}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={[styles.tabs, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.path}
            accessibilityRole="tab"
            accessibilityState={{ selected: selected(tab.path) }}
            style={[styles.tab, selected(tab.path) && styles.tabActive]}
            onPress={() => {
              setFailed(false);
              setCanGoBack(false);
              const url = SITE + (tab.path === "/" ? "" : tab.path);
              setCurrentUrl(url);
              setTarget(url);
            }}
          >
            <Text style={[styles.tabText, selected(tab.path) && styles.tabTextActive]} numberOfLines={1}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MobileShell />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  body: { flex: 1 },
  tabs: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#E5E5E5",
    paddingTop: 8,
    paddingHorizontal: 6,
    backgroundColor: "#FFFFFF",
  },
  tab: { flex: 1, minHeight: 42, justifyContent: "center", alignItems: "center", borderRadius: 6, marginHorizontal: 2 },
  tabActive: { backgroundColor: "#171717" },
  tabText: { color: "#171717", fontWeight: "700", fontSize: 11 },
  tabTextActive: { color: "#FFFFFF" },
  error: { ...StyleSheet.absoluteFillObject, backgroundColor: "white", alignItems: "center", justifyContent: "center", padding: 20 },
  retry: { marginTop: 20, fontWeight: "800", textDecorationLine: "underline" },
});
