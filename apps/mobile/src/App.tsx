import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const SITE = "https://rentocampo.com";
const COLORS = {
  green: "#193E32",
  greenDeep: "#102C23",
  greenSoft: "#416957",
  white: "#FFFFFF",
  paper: "#F5F6F3",
  gray: "#626D69",
  silver: "#C9D0CC",
  border: "#DFE5E0",
  black: "#17231D",
} as const;

type Section = "inicio" | "campos" | "servicios" | "perfil";
type Country = { code: string; label: string; flag: string };
const COUNTRIES: Country[] = [
  { code: "AR", label: "Argentina", flag: "🇦🇷" },
  { code: "BO", label: "Bolivia", flag: "🇧🇴" },
  { code: "BR", label: "Brasil", flag: "🇧🇷" },
  { code: "CL", label: "Chile", flag: "🇨🇱" },
  { code: "CO", label: "Colombia", flag: "🇨🇴" },
  { code: "CR", label: "Costa Rica", flag: "🇨🇷" },
  { code: "DO", label: "República Dominicana", flag: "🇩🇴" },
  { code: "EC", label: "Ecuador", flag: "🇪🇨" },
  { code: "GT", label: "Guatemala", flag: "🇬🇹" },
  { code: "HN", label: "Honduras", flag: "🇭🇳" },
  { code: "MX", label: "México", flag: "🇲🇽" },
  { code: "NI", label: "Nicaragua", flag: "🇳🇮" },
  { code: "PA", label: "Panamá", flag: "🇵🇦" },
  { code: "PY", label: "Paraguay", flag: "🇵🇾" },
  { code: "PE", label: "Perú", flag: "🇵🇪" },
  { code: "SV", label: "El Salvador", flag: "🇸🇻" },
  { code: "US", label: "Estados Unidos", flag: "🇺🇸" },
  { code: "UY", label: "Uruguay", flag: "🇺🇾" },
  { code: "VE", label: "Venezuela", flag: "🇻🇪" },
];
const TABS: { id: Section; label: string; icon: string; path: string }[] = [
  { id: "inicio", label: "Inicio", icon: "⌂", path: "/lite" },
  { id: "campos", label: "Campos", icon: "▱", path: "/lite/campos" },
  { id: "servicios", label: "Servicios", icon: "▦", path: "/lite/servicios" },
  { id: "perfil", label: "Perfil", icon: "◯", path: "/lite/perfil" },
];

// The shared Android and iOS native shell owns the header and tab bar.
// Hide duplicated web chrome in both Android WebView and iOS WKWebView.
// This also applies the approved English-green / white / gray / silver palette
// to the live Lite pages, including authentication flows.
const LITE_STYLES = `
(function () {
 var id = "rentocampo-mobile-unified-theme";
 function install() {
  if (!document.head || document.getElementById(id)) return;
  var style = document.createElement("style");
  style.id = id;
  style.textContent = [
    ".lite-regional-header,.lite-app-footer{display:none!important}",
    "nav[aria-label='Navegación Lite'],main > nav[style*='position:fixed'],main > nav[style*='position: fixed']{display:none!important}",
    "html,body,.lite-app{background:#F5F6F3!important}",
    "main{padding-bottom:28px!important}",
    ".rcLiteDirectHero{background:#102C23!important}",
    ".rcLiteDirectHero__tone{background:linear-gradient(145deg,rgba(16,44,35,.97),rgba(25,62,50,.83) 65%,rgba(25,62,50,.48))!important}",
    ".rcLiteDirectHero__features{color:#D3DDD5!important}",
    ".rcLiteDirectHero__register{background:#FFFFFF!important;color:#193E32!important}",
    ".rcLiteDirectHero__register:hover{background:#E5EBE6!important}",
    ".rcLiteDirectHero__stats>div+div{border-left-color:#C9D0CC!important}",
    ".rcLiteDirectHero__line{color:#F1F4F1!important}",
    "a[href*='/lite/campos/filtrar'],a[href*='/lite/servicios/filtrar']{border-color:#C9D0CC!important}",
    "a:focus-visible,button:focus-visible{outline-color:#416957!important}"
  ].join("");
  document.head.appendChild(style);
 }
 install();
 document.addEventListener("DOMContentLoaded", install);
})();
true;`;

function AppShell() {
  const insets = useSafeAreaInsets();
  const browser = useRef<WebView>(null);
  const appliedCountry = useRef<string | null>(null);
  const [section, setSection] = useState<Section>("inicio");
  const [destination, setDestination] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [country, setCountry] = useState("AR");
  const [countryModal, setCountryModal] = useState(false);
  const [failed, setFailed] = useState(false);

  const select = useCallback((next: Section) => {
    setDestination(null);
    setCanGoBack(false);
    setFailed(false);
    setSection(next);
  }, []);

  const open = useCallback((path: string) => {
    setCanGoBack(false);
    setFailed(false);
    setDestination(path);
  }, []);

  const back = useCallback(() => {
    if (countryModal) { setCountryModal(false); return true; }
    if (destination && canGoBack) { browser.current?.goBack(); return true; }
    if (destination) { setDestination(null); setCanGoBack(false); return true; }
    if (section !== "inicio" && canGoBack) { browser.current?.goBack(); return true; }
    if (section !== "inicio") { select("inicio"); return true; }
    return false;
  }, [countryModal, destination, canGoBack, section, select]);

  useEffect(() => {
    const listener = BackHandler.addEventListener("hardwareBackPress", back);
    return () => listener.remove();
  }, [back]);

  const changeCountry = (code: string) => {
    setCountryModal(false);
    if (country !== code) {
      appliedCountry.current = null;
      setCountry(code);
      if (section !== "inicio" || destination) {
        // Keep the native country selector in sync with the regionalized web catalog.
        appliedCountry.current = code;
        browser.current?.injectJavaScript(`document.cookie="rentocampo_country=${code}; path=/; max-age=31536000; SameSite=Lax";window.location.reload();true;`);
      }
    }
  };

  const t = (es: string, pt: string, en: string) => country === "BR" ? pt : country === "US" ? en : es;

  const renderLink = (title: string, detail: string, onPress: () => void, filled = false) => (
    <TouchableOpacity key={title} onPress={onPress} activeOpacity={0.82} style={[styles.action, filled && styles.actionFilled]}>
      <View style={styles.actionCopy}>
        <Text style={[styles.actionTitle, filled && styles.textWhite]}>{title}</Text>
        <Text style={[styles.actionDetail, filled && styles.detailWhite]}>{detail}</Text>
      </View>
      <Text style={[styles.arrow, filled && styles.textWhite]}>→</Text>
    </TouchableOpacity>
  );

  const home = () => (
    <ScrollView contentContainerStyle={styles.homeScroll} showsVerticalScrollIndicator={false}>
      <ImageBackground
        source={{ uri: SITE + "/rentocampo-hero-campo-bn-1920x1080.webp" }}
        imageStyle={styles.heroImage}
        style={styles.hero}
      >
        <Text style={styles.eyebrow}>{t("CONECTAMOS EL CAMPO", "CONECTAMOS O CAMPO", "CONNECTING RURAL COMMUNITIES")}</Text>
        <Text style={styles.heroBig}>{t("SIN", "SEM", "NO")}</Text>
        <Text style={styles.heroHeading}>{t("INTERMEDIARIOS.", "INTERMEDIÁRIOS.", "MIDDLEMEN.")}</Text>
        <Text style={styles.heroFeature}>{t("MAPAS + CHAT ONLINE", "MAPAS + CHAT ONLINE", "MAPS + ONLINE CHAT")}</Text>
        <Text style={styles.heroSecondary}>{t("Productores + Tierra + Servicios", "Produtores + Terras + Serviços", "Farmers + Land + Services")}</Text>
        <Text style={styles.heroLine}>{t("Vos publicás. Vos contactás. Vos acordás.", "Você anuncia. Você conversa. Você combina.", "Post. Connect. Make a deal.")}</Text>
        <TouchableOpacity style={styles.register} activeOpacity={0.82} onPress={() => open("/lite/cuenta/registro")} accessibilityRole="button">
          <Text style={styles.registerText}>{t("REGISTRATE GRATIS", "CADASTRE-SE GRÁTIS", "SIGN UP FOR FREE")}</Text>
          <Text style={styles.registerArrow}>→</Text>
        </TouchableOpacity>
        <View style={styles.stats}>
          <View style={styles.statLeft}>
            <Text style={styles.statNumber}>0%</Text>
            <Text style={styles.statCaption}>{t("COMISIONES", "COMISSÕES", "FEES")}</Text>
          </View>
          <View style={styles.statRight}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statCaption}>{t("CONTACTO DIRECTO", "CONTATO DIRETO", "DIRECT CONTACT")}</Text>
          </View>
        </View>
      </ImageBackground>
      <View style={styles.homeActions}>
        <Text style={styles.sectionKicker}>{t("EXPLORÁ RENTOCAMPO", "EXPLORE A RENTOCAMPO", "EXPLORE RENTOCAMPO")}</Text>
        <Text style={styles.sectionTitle}>{t("¿Qué necesitás hoy?", "Do que você precisa hoje?", "What do you need today?")}</Text>
        {renderLink(t("Ver campos", "Ver terras", "Find land"), t("Encontrá tierras disponibles en el mapa", "Encontre terras disponíveis no mapa", "Find available land on the map"), () => select("campos"), true)}
        {renderLink(t("Ver servicios rurales", "Ver serviços rurais", "Rural services"), t("Conectá con profesionales del campo", "Conecte-se com profissionais do campo", "Connect with rural professionals"), () => select("servicios"))}
        {renderLink(t("Publicar y administrar", "Anunciar e administrar", "Post and manage"), t("Tus publicaciones, mensajes y perfil", "Seus anúncios, mensagens e perfil", "Your listings, messages and profile"), () => select("perfil"))}
      </View>
    </ScrollView>
  );

  const webPath = destination ?? TABS.find(t => t.id === section)!.path;
  const showWeb = Boolean(destination || section !== "inicio");

  const applyCountry = () => {
    if (!showWeb || appliedCountry.current === country) return;
    appliedCountry.current = country;
    const safeCode = country.replace(/[^A-Z]/g, "");
    const script = `(function(){var code="${safeCode}";var cookie="rentocampo_country="+code; if (document.cookie.indexOf(cookie)===-1) {document.cookie=cookie+"; path=/; max-age=31536000; SameSite=Lax";location.reload();}})();true;`;
    browser.current?.injectJavaScript(script);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.greenDeep} translucent={false} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => select("inicio")} style={styles.brandBox} accessibilityLabel="RentoCampo, ir al inicio">
          <View style={styles.logoTile}>
            <Image source={require("../assets/icon.png")} resizeMode="contain" style={styles.logoImage} />
          </View>
          <Text style={styles.brand} numberOfLines={1}>Rento<Text style={styles.brandStrong}>Campo</Text></Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.countryButton} onPress={() => setCountryModal(true)} accessibilityRole="button" accessibilityLabel="Seleccionar país">
          <Text style={styles.countryText}>{COUNTRIES.find(c => c.code === country)?.flag ?? "🌎"} {country}  ▾</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => select("perfil")} style={styles.profileButton} accessibilityLabel="Ir a mi perfil">
          <Text style={styles.profileSymbol}>◯</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        {showWeb ? (
          <>
            <WebView
              key={webPath}
              ref={browser}
              source={{ uri: SITE + webPath }}
              originWhitelist={["https://*"]}
              injectedJavaScriptBeforeContentLoaded={LITE_STYLES}
              injectedJavaScript={LITE_STYLES}
              onMessage={() => undefined}
              allowsBackForwardNavigationGestures
              allowsInlineMediaPlayback
              onLoadEnd={applyCountry}
              sharedCookiesEnabled
              thirdPartyCookiesEnabled
              domStorageEnabled
              javaScriptEnabled
              startInLoadingState
              renderLoading={() => <View style={styles.loader}><ActivityIndicator color={COLORS.green} size="large" /></View>}
              onNavigationStateChange={nav => setCanGoBack(nav.canGoBack)}
              onError={() => setFailed(true)}
              setSupportMultipleWindows={false}
              style={styles.webView}
            />
            {failed && (
              <View style={styles.error}>
                <Text style={styles.errorTitle}>No se pudo cargar la página</Text>
                <Text style={styles.errorText}>Revisá tu conexión a Internet.</Text>
                <TouchableOpacity onPress={() => { setFailed(false); browser.current?.reload(); }} style={styles.retry}>
                  <Text style={styles.retryText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : home()}
      </View>
      <View style={[styles.tabs, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {TABS.map(item => {
          const active = item.id === section;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => select(item.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={[styles.tab, active && styles.activeTab]}
            >
              <Text style={[styles.tabIcon, active && styles.tabActiveText]}>{item.icon}</Text>
              <Text numberOfLines={1} style={[styles.tabLabel, active && styles.tabActiveText]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Modal visible={countryModal} animationType="slide" transparent onRequestClose={() => setCountryModal(false)}>
        <View style={styles.modalShade}>
          <View style={styles.modalPanel}>
            <View style={styles.modalHeading}>
              <Text style={styles.modalTitle}>Seleccioná tu país</Text>
              <TouchableOpacity onPress={() => setCountryModal(false)} accessibilityLabel="Cerrar selección de país">
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {COUNTRIES.map(c => (
                <TouchableOpacity key={c.code} onPress={() => changeCountry(c.code)} style={[styles.countryRow, c.code === country && styles.countrySelected]}>
                  <Text style={styles.countryRowText}>{c.flag}  {c.label}</Text>
                  <Text style={styles.countryCode}>{c.code === country ? "✓" : c.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function App() {
  return <SafeAreaProvider><AppShell /></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.greenDeep },
  header: { minHeight: 68, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", backgroundColor: COLORS.greenDeep, borderBottomWidth: 1, borderBottomColor: COLORS.greenSoft },
  brandBox: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center" },
  logoTile: { height: 42, width: 42, backgroundColor: COLORS.white, borderRadius: 7, justifyContent: "center", alignItems: "center", overflow: "hidden", marginRight: 10 },
  logoImage: { height: 40, width: 40 },
  brand: { color: COLORS.white, fontWeight: "300", fontSize: 21, letterSpacing: -1.2, flexShrink: 1 },
  brandStrong: { fontWeight: "900" },
  countryButton: { minHeight: 42, borderWidth: 1, borderColor: COLORS.silver, borderRadius: 22, paddingHorizontal: 9, justifyContent: "center", marginRight: 7 },
  countryText: { fontSize: 12, fontWeight: "800", color: COLORS.white },
  profileButton: { width: 35, height: 42, alignItems: "center", justifyContent: "center" },
  profileSymbol: { fontSize: 27, fontWeight: "700", color: COLORS.white },
  body: { flex: 1, backgroundColor: COLORS.paper },
  homeScroll: { paddingBottom: 32 },
  hero: { backgroundColor: COLORS.greenDeep, paddingHorizontal: 22, paddingTop: 38, paddingBottom: 35, minHeight: 455 },
  heroImage: { opacity: 0.29 },
  eyebrow: { fontSize: 11, letterSpacing: 2.4, color: COLORS.silver, fontWeight: "800", marginBottom: 24 },
  heroBig: { fontSize: 67, fontWeight: "900", color: COLORS.white, letterSpacing: -3.5, lineHeight: 72 },
  heroHeading: { fontSize: 31, fontWeight: "900", color: COLORS.white, letterSpacing: -1.5, marginBottom: 24 },
  heroFeature: { fontSize: 19, fontWeight: "900", color: COLORS.silver, letterSpacing: -0.5 },
  heroSecondary: { fontSize: 15, fontWeight: "800", color: COLORS.white, marginTop: 4 },
  heroLine: { fontSize: 13, fontWeight: "700", color: COLORS.white, marginVertical: 19, lineHeight: 19 },
  register: { backgroundColor: COLORS.white, minHeight: 55, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 14, borderRadius: 30 },
  registerText: { fontSize: 16, fontWeight: "900", color: COLORS.green },
  registerArrow: { fontSize: 22, color: COLORS.green },
  stats: { flexDirection: "row", marginTop: 28 },
  statLeft: { flex: 1, borderRightWidth: 1, borderRightColor: COLORS.silver },
  statRight: { flex: 1.45, paddingLeft: 19 },
  statNumber: { fontSize: 45, lineHeight: 47, letterSpacing: -2, fontWeight: "900", color: COLORS.white },
  statCaption: { fontSize: 11, color: COLORS.white, fontWeight: "900", marginTop: 4, letterSpacing: 0.2 },
  homeActions: { paddingHorizontal: 20, paddingVertical: 30 },
  sectionKicker: { color: COLORS.greenSoft, letterSpacing: 2, fontSize: 11, fontWeight: "900" },
  sectionTitle: { color: COLORS.black, fontSize: 26, fontWeight: "900", marginTop: 9, marginBottom: 23 },
  action: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 15, minHeight: 82, paddingHorizontal: 18, paddingVertical: 13, marginBottom: 11, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  actionFilled: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  actionCopy: { flex: 1, paddingRight: 8 },
  actionTitle: { fontSize: 18, fontWeight: "900", color: COLORS.green },
  actionDetail: { fontSize: 12, lineHeight: 17, color: COLORS.gray, marginTop: 5 },
  textWhite: { color: COLORS.white },
  detailWhite: { color: "#DFE7E1" },
  arrow: { fontSize: 24, color: COLORS.green },
  webView: { flex: 1, backgroundColor: COLORS.paper },
  loader: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.paper },
  tabs: { flexDirection: "row", backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, paddingHorizontal: 7 },
  tab: { flex: 1, minHeight: 56, justifyContent: "center", alignItems: "center", marginHorizontal: 2, borderRadius: 10 },
  activeTab: { backgroundColor: "#E4ECE6" },
  tabIcon: { fontSize: 22, color: COLORS.gray },
  tabLabel: { fontSize: 11, fontWeight: "800", color: COLORS.gray, marginTop: 3 },
  tabActiveText: { color: COLORS.green },
  error: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.paper, alignItems: "center", justifyContent: "center", padding: 25 },
  errorTitle: { fontSize: 19, fontWeight: "800", color: COLORS.green },
  errorText: { marginTop: 10, color: COLORS.gray },
  retry: { backgroundColor: COLORS.green, borderRadius: 25, paddingHorizontal: 25, paddingVertical: 13, marginTop: 23 },
  retryText: { color: COLORS.white, fontWeight: "900" },
  modalShade: { flex: 1, justifyContent: "flex-end", backgroundColor: "#0008" },
  modalPanel: { backgroundColor: COLORS.paper, borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingHorizontal: 18, paddingTop: 22, paddingBottom: 25, maxHeight: "78%" },
  modalHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  modalTitle: { color: COLORS.green, fontWeight: "900", fontSize: 22 },
  close: { color: COLORS.gray, fontSize: 22, padding: 8 },
  countryRow: { flexDirection: "row", paddingHorizontal: 12, minHeight: 51, justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: COLORS.border },
  countrySelected: { backgroundColor: "#E4ECE6", borderRadius: 8 },
  countryRowText: { color: COLORS.black, fontSize: 16, fontWeight: "700" },
  countryCode: { color: COLORS.greenSoft, fontSize: 13, fontWeight: "900" },
});
