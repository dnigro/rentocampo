import React, { useEffect, useRef, useState } from "react";
import { BackHandler, SafeAreaView, StatusBar, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

const SITE = "https://rentocampo.com";
const MOBILE_CSS = `
  html { -webkit-text-size-adjust: 100% !important; }
  body { overflow-x: hidden !important; }
  :is(.app-shell, body) :is(.listing-button, .btn-aplicar, .btn-primary, .btn-primary-lg, .btn-submit, .rc-button, .rc-button-yellow, .hero-cta, .btn-mapa, .rc-hero-cta, a[href="/campos"].rc-button-yellow) { background: #171717 !important; border-color: #171717 !important; color: #fff !important; box-shadow: none !important; }
  .app-shell :is(.filtro-chip.active, .filtro-chip[aria-pressed="true"]) { background: #171717 !important; border-color: #171717 !important; color: #fff !important; }
  .app-shell :is(.filtro-chip:not(.active)) { background: #fff !important; color: #171717 !important; border-color: #171717 !important; }
  a[href="/campos"], a[href="/servicios-rurales"] { border-color: #171717 !important; }\n  a[href="/campos"].rc-button-yellow, a[href="/campos"].rc-button { background: #171717 !important; color: #fff !important; }\n  @media(max-width:768px) {
    .app-shell .filtros-panel { padding: 14px !important; }\n    .rc-hero, .hero-content, .hero-inner { max-width: 100% !important; }\n    .hero-title, .rc-hero-title { font-size: clamp(30px, 9vw, 48px) !important; line-height: 1.06 !important; }
    .app-shell :is(.listing-button, .btn-aplicar, .rc-button, .rc-button-yellow) { min-height: 44px !important; padding: 9px 14px !important; font-size: 14px !important; }
    .app-shell .filtro-chip { font-size: 13px !important; padding: 7px 11px !important; }
    .app-shell :is(.explorador-layout, .listing-header) { padding-left: 12px !important; padding-right: 12px !important; }
  }
`;
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <View style={styles.header}><Text style={styles.logo}>rento<Text style={styles.bold}>Campo</Text></Text></View>
      <View style={styles.body}>
        <WebView
          ref={browser}
          key={target}
          source={{ uri: target }}
          injectedJavaScriptBeforeContentLoaded={`(function(){var s=document.createElement("style");s.textContent=${JSON.stringify(MOBILE_CSS)};document.head.appendChild(s);})();true;`}
          injectedJavaScript={`(function(){var css=${JSON.stringify(MOBILE_CSS)};function apply(){var s=document.getElementById("rc-app-mobile-overrides");if(!s){s=document.createElement("style");s.id="rc-app-mobile-overrides";document.head.appendChild(s);}s.textContent=css;}apply();setTimeout(apply,1200);setTimeout(apply,3500);})();true;`}
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
  header: { paddingVertical: 8, alignItems: "center", borderBottomWidth: 1, borderColor: "#E5E5E5" },
  logo: { fontSize: 19, fontWeight: "300", color: "#171717" },
  bold: { fontWeight: "900" },
  body: { flex: 1 },
  tabs: { flexDirection: "row", borderTopWidth: 1, borderColor: "#DDDDDD", paddingTop: 10, paddingBottom: Platform.OS === "android" ? 32 : 12, backgroundColor: "#FFFFFF" },
  tab: { flex: 1, alignItems: "center" },
  tabText: { color: "#171717", fontWeight: "700", fontSize: 12 },
  error: { ...StyleSheet.absoluteFillObject, backgroundColor: "white", alignItems: "center", justifyContent: "center", padding: 20 },
  retry: { marginTop: 20, fontWeight: "800", textDecorationLine: "underline" },
});
