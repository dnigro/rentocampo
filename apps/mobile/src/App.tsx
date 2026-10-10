import React, { useEffect, useRef, useState } from "react";
import { BackHandler, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

// La web de producción y su CSS responsive aprobado son la única fuente visual.
// No inyectamos estilos: eso causó diferencias entre preview y APK.
const SITE = "https://rentocampo.com";
const tabs = [
  { title: "Campos", path: "/campos" },
  { title: "Servicios", path: "/servicios-rurales" },
  { title: "Mi perfil", path: "/login" },
];
const HOME = "native-home";

function MobileShell() {
  const insets = useSafeAreaInsets();
  const browser = useRef<WebView>(null);
  const [target, setTarget] = useState(HOME);
  const [currentUrl, setCurrentUrl] = useState(SITE);
  const [canGoBack, setCanGoBack] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack) {
        browser.current?.goBack();
        return true;
      }
      if (target !== HOME) {
        setTarget(HOME);
        setCurrentUrl(HOME);
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [canGoBack, currentUrl]);

  const navigate = (path: string) => {
    const url = SITE + path;
    setFailed(false);
    setCanGoBack(false);
    setCurrentUrl(url);
    setTarget(url);
  };

  const selected = (path: string) => {
    const url = SITE + (path === "/" ? "" : path);
    return path === "/"
      ? currentUrl === SITE || currentUrl === SITE + "/"
      : currentUrl.startsWith(url);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <View style={styles.brand}><TouchableOpacity onPress={() => { setTarget(HOME); setCurrentUrl(HOME); }}><Text style={styles.brandText}>rento<Text style={styles.brandHeavy}>Campo</Text></Text></TouchableOpacity><View style={styles.rc}><Text style={styles.rcText}>RC</Text></View></View>
      <View style={styles.body}>
        {target === HOME ? (
          <View style={styles.home}>
            <Text style={styles.eyebrow}>LA RED FEDERAL DEL CAMPO</Text>
            <Text style={styles.homeTitle}>Todo el campo.{"\n"}En un lugar.</Text>
            <Text style={styles.homeIntro}>Explorá oportunidades y conectá directamente.</Text>
            <TouchableOpacity style={styles.homeCard} onPress={() => navigate("/campos")}><Text style={styles.homeCardText}>Campos</Text><Text style={styles.homeArrow}>→</Text></TouchableOpacity>
            <TouchableOpacity style={styles.homeCard} onPress={() => navigate("/servicios-rurales")}><Text style={styles.homeCardText}>Servicios rurales</Text><Text style={styles.homeArrow}>→</Text></TouchableOpacity>
            <TouchableOpacity style={styles.profileCard} onPress={() => navigate("/login")}><Text style={styles.profileText}>Mi perfil</Text><Text style={styles.profileText}>→</Text></TouchableOpacity>
            <Text style={styles.homeFoot}>REGISTRARTE, PUBLICAR Y CONTACTAR ES GRATIS.</Text>
          </View>
        ) : <WebView
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
        />}
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
              navigate(tab.path);
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
  brand: { minHeight: 56, paddingHorizontal: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#EEEEEE" },
  brandText: { fontSize: 25, fontWeight: "300", color: "#111111", letterSpacing: -1 },
  brandHeavy: { fontWeight: "900" },
  rc: { borderWidth: 2, borderColor: "#111111", borderRadius: 22, width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  rcText: { fontSize: 15, fontWeight: "900", color: "#111111" },
  home: { flex: 1, padding: 22, paddingTop: 38 },
  eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 2, color: "#555555" },
  homeTitle: { marginTop: 18, fontSize: 36, lineHeight: 41, letterSpacing: -1.4, fontWeight: "900", color: "#111111" },
  homeIntro: { marginTop: 12, marginBottom: 32, fontSize: 15, lineHeight: 23, color: "#555555" },
  homeCard: { backgroundColor: "#111111", minHeight: 76, marginBottom: 12, borderRadius: 12, paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  homeCardText: { fontSize: 20, fontWeight: "800", color: "#FFFFFF" },
  homeArrow: { fontSize: 26, color: "#FFFFFF" },
  profileCard: { borderWidth: 1, borderColor: "#111111", minHeight: 65, borderRadius: 12, paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  profileText: { fontSize: 18, fontWeight: "700", color: "#111111" },
  homeFoot: { marginTop: 26, fontSize: 10, letterSpacing: 1, fontWeight: "800", color: "#555555" },
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
