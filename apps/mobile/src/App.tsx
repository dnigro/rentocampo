import React, { useEffect, useRef, useState } from "react";
import { BackHandler, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const SITE = "https://rentocampo.com";
type Section = "inicio" | "campos" | "servicios" | "perfil";
type WebDestination = { url: string; title: string };
const NAV: { id: Section; title: string }[] = [
  { id: "campos", title: "Campos" },
  { id: "servicios", title: "Servicios" },
  { id: "perfil", title: "Mi perfil" },
];

function AppShell() {
  const insets = useSafeAreaInsets();
  const browser = useRef<WebView>(null);
  const [section, setSection] = useState<Section>("inicio");
  const [destination, setDestination] = useState<WebDestination | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [failed, setFailed] = useState(false);

  const open = (url: string, title: string) => {
    setFailed(false);
    setCanGoBack(false);
    setDestination({ url: SITE + url, title });
  };
  const select = (next: Section) => {
    setDestination(null);
    setFailed(false);
    setSection(next);
  };
  const back = () => {
    if (destination && canGoBack) {
      browser.current?.goBack();
      return true;
    }
    if (destination) {
      setDestination(null);
      setCanGoBack(false);
      return true;
    }
    if (section !== "inicio") {
      setSection("inicio");
      return true;
    }
    return false;
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", back);
    return () => subscription.remove();
  });

  const action = (title: string, detail: string, onPress: () => void, dark = false) => (
    <TouchableOpacity key={title} onPress={onPress} activeOpacity={0.82} style={[styles.action, dark && styles.actionDark]}>
      <View style={styles.actionCopy}>
        <Text style={[styles.actionTitle, dark && styles.onDark]}>{title}</Text>
        <Text style={[styles.actionDetail, dark && styles.detailOnDark]}>{detail}</Text>
      </View>
      <Text style={[styles.arrow, dark && styles.onDark]}>→</Text>
    </TouchableOpacity>
  );

  const content = () => {
    if (section === "inicio") return (
      <>
        <Text style={styles.kicker}>#1 RED FEDERAL</Text>
        <Text style={styles.heading}>El campo,{"\n"}más cerca.</Text>
        <Text style={styles.description}>Tierra, productores y servicios rurales en un solo lugar.</Text>
        <View style={styles.space} />
        {action("Campos", "Explorá tierras disponibles", () => select("campos"), true)}
        {action("Servicios rurales", "Encontrá prestadores", () => select("servicios"))}
        {action("Mi perfil", "Ingresá a tu cuenta", () => select("perfil"))}
        <Text style={styles.foot}>REGISTRARTE, PUBLICAR Y CONTACTAR ES GRATIS.</Text>
      </>
    );
    if (section === "campos") return (
      <>
        <Text style={styles.kicker}>TIERRA PRODUCTIVA</Text>
        <Text style={styles.heading}>Campos</Text>
        <Text style={styles.description}>Encontrá oportunidades en Argentina.</Text>
        <View style={styles.space} />
        {action("Ver campos", "Listado de publicaciones", () => open("/campos", "Campos disponibles"), true)}
        {action("Explorar mapa", "Ubicaciones de campos", () => open("/mapa?tipo=campos", "Mapa de campos"))}
        <View style={styles.rule} />
        {action("Publicar un campo", "Accedé con tu cuenta", () => open("/login", "Ingresar"))}
      </>
    );
    if (section === "servicios") return (
      <>
        <Text style={styles.kicker}>RED DE SERVICIOS</Text>
        <Text style={styles.heading}>Servicios{"\n"}rurales</Text>
        <Text style={styles.description}>Conectá con quienes trabajan en el campo.</Text>
        <View style={styles.space} />
        {action("Ver servicios", "Prestadores disponibles", () => open("/servicios-rurales", "Servicios disponibles"), true)}
        {action("Explorar mapa", "Servicios por ubicación", () => open("/mapa?tipo=servicios", "Mapa de servicios"))}
        <View style={styles.rule} />
        {action("Ofrecer un servicio", "Accedé con tu cuenta", () => open("/login", "Ingresar"))}
      </>
    );
    return (
      <>
        <Text style={styles.kicker}>TU ESPACIO</Text>
        <Text style={styles.heading}>Mi perfil</Text>
        <Text style={styles.description}>Administrá tus publicaciones, consultas y datos.</Text>
        <View style={styles.space} />
        {action("Ingresar", "Accedé a tu cuenta RentoCampo", () => open("/login", "Iniciar sesión"), true)}
        {action("Registrarme", "Creá tu cuenta gratis", () => open("/register", "Registro"))}
      </>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => destination ? setDestination(null) : select("inicio")} accessibilityLabel={destination ? "Volver" : "Inicio"}>
          <Text style={styles.brand}>rento<Text style={styles.brandBold}>Campo</Text></Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => destination ? setDestination(null) : select("inicio")} style={styles.monogram}>
          <Text style={styles.monogramText}>{destination ? "←" : "RC"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        {destination ? (
          <>
            <View style={styles.webBar}>
              <TouchableOpacity onPress={() => { setDestination(null); setCanGoBack(false); }}>
                <Text style={styles.webBack}>← Volver</Text>
              </TouchableOpacity>
              <Text style={styles.webTitle} numberOfLines={1}>{destination.title}</Text>
            </View>
            <WebView
              ref={browser}
              key={destination.url}
              source={{ uri: destination.url }}
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
            {failed && (
              <View style={styles.error}>
                <Text>No se pudo cargar. Revisá tu conexión.</Text>
                <TouchableOpacity onPress={() => browser.current?.reload()}><Text style={styles.retry}>Reintentar</Text></TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
            {content()}
          </ScrollView>
        )}
      </View>
      <View style={[styles.tabs, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {NAV.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => select(item.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: !destination && section === item.id }}
            style={[styles.tab, !destination && section === item.id && styles.activeTab]}
          >
            <Text numberOfLines={1} style={[styles.tabLabel, !destination && section === item.id && styles.activeLabel]}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function App() {
  return <SafeAreaProvider><AppShell /></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { minHeight: 64, paddingHorizontal: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#ECECEC" },
  brand: { color: "#111111", fontSize: 26, fontWeight: "300", letterSpacing: -1.1 },
  brandBold: { fontWeight: "900" },
  monogram: { width: 40, height: 40, borderWidth: 2, borderColor: "#111111", borderRadius: 20, justifyContent: "center", alignItems: "center" },
  monogramText: { fontSize: 15, fontWeight: "900", color: "#111111" },
  body: { flex: 1 },
  page: { paddingHorizontal: 24, paddingTop: 42, paddingBottom: 36, flexGrow: 1 },
  kicker: { fontSize: 11, letterSpacing: 2.3, fontWeight: "900", color: "#666666" },
  heading: { marginTop: 15, fontSize: 40, lineHeight: 45, letterSpacing: -1.4, fontWeight: "900", color: "#111111" },
  description: { marginTop: 16, fontSize: 16, lineHeight: 24, color: "#666666", maxWidth: 330 },
  space: { height: 35 },
  action: { borderWidth: 1, borderColor: "#111111", backgroundColor: "#FFFFFF", borderRadius: 12, minHeight: 78, marginBottom: 12, paddingHorizontal: 18, paddingVertical: 13, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  actionDark: { backgroundColor: "#111111" },
  actionCopy: { flex: 1 },
  actionTitle: { fontSize: 19, fontWeight: "800", color: "#111111" },
  actionDetail: { marginTop: 5, fontSize: 12, color: "#666666" },
  onDark: { color: "#FFFFFF" },
  detailOnDark: { color: "#DDDDDD" },
  arrow: { fontSize: 25, color: "#111111", marginLeft: 8 },
  foot: { marginTop: 32, fontSize: 10, lineHeight: 17, letterSpacing: 1.2, fontWeight: "800", color: "#777777" },
  rule: { height: 1, backgroundColor: "#EEEEEE", marginVertical: 15 },
  tabs: { flexDirection: "row", borderTopWidth: 1, borderColor: "#E5E5E5", paddingTop: 9, paddingHorizontal: 8, backgroundColor: "#FFFFFF" },
  tab: { flex: 1, minHeight: 43, alignItems: "center", justifyContent: "center", borderRadius: 8, marginHorizontal: 3 },
  activeTab: { backgroundColor: "#111111" },
  tabLabel: { fontSize: 12, fontWeight: "800", color: "#111111" },
  activeLabel: { color: "#FFFFFF" },
  webBar: { height: 46, flexDirection: "row", alignItems: "center", gap: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#EEEEEE" },
  webBack: { fontSize: 14, fontWeight: "800", color: "#111111" },
  webTitle: { fontSize: 13, color: "#666666", flex: 1 },
  error: { ...StyleSheet.absoluteFillObject, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", padding: 20 },
  retry: { marginTop: 20, fontWeight: "800", textDecorationLine: "underline" },
});
