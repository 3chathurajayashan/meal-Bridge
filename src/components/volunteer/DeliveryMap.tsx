/**
 * DeliveryMap
 *
 * Shows a real Leaflet / OpenStreetMap map with:
 *   • Volunteer's live geolocation (pulsing car pin)
 *   • Pickup location (orange P marker)
 *   • Actual road-routing polyline via OSRM (volunteer → pickup)
 *   • Distance & ETA calculated from the OSRM response
 */

import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
    Platform,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import type { AddressInfo } from "../../types/volunteer";

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface DeliveryMapProps {
    pickupAddress: AddressInfo;
    dropOffAddress: AddressInfo;
    distanceKm?: number;
    etaMinutes?: number;
    currentLocation?: { latitude: number; longitude: number };
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function parseCoord(val: any, fallback: number): number {
    if (typeof val === "number" && !isNaN(val)) return val;
    if (typeof val === "string") {
        const p = parseFloat(val);
        if (!isNaN(p)) return p;
    }
    return fallback;
}

function extractCoords(
    addr: any,
    fallbackLat: number,
    fallbackLng: number
) {
    if (!addr) return { latitude: fallbackLat, longitude: fallbackLng };
    if (Array.isArray(addr.coordinates) && addr.coordinates.length >= 2) {
        return {
            latitude: parseCoord(addr.coordinates[1], fallbackLat),
            longitude: parseCoord(addr.coordinates[0], fallbackLng),
        };
    }
    const c = addr.coordinates;
    const lat = c?.latitude ?? c?.lat ?? addr.latitude ?? addr.lat;
    const lng = c?.longitude ?? c?.lng ?? addr.longitude ?? addr.lng;
    return {
        latitude: parseCoord(lat, fallbackLat),
        longitude: parseCoord(lng, fallbackLng),
    };
}

function shortAddress(addr: AddressInfo): string {
    return (
        addr.fullAddress ??
        [addr.street, addr.city].filter(Boolean).join(", ") ??
        "—"
    );
}

function openMaps(destination: AddressInfo) {
    const query = encodeURIComponent(shortAddress(destination));
    if (Platform.OS === "web" || typeof window !== "undefined") {
        window.open(
            `https://www.google.com/maps/search/?api=1&query=${query}`,
            "_blank"
        );
        return;
    }
    const url =
        Platform.OS === "ios" ? `maps://?daddr=${query}` : `geo:0,0?q=${query}`;
    Linking.openURL(url).catch(() =>
        Linking.openURL(
            `https://www.google.com/maps/search/?api=1&query=${query}`
        )
    );
}

async function fetchOsrmRoute(
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number }
): Promise<{ distanceKm: number; etaMinutes: number } | null> {
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
            return {
                distanceKm: data.routes[0].distance / 1000,
                etaMinutes: Math.ceil(data.routes[0].duration / 60),
            };
        }
    } catch {
        // fallback silently
    }
    return null;
}

function buildMapHtml(
    driverLat: number,
    driverLng: number,
    pickupLat: number,
    pickupLng: number,
    locating: boolean
): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0; padding: 0; width: 100%; height: 100%;
      background: #EAF0F8; overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    #map { width: 100%; height: 100%; position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
    .custom-marker {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 50%;
      color: #FFFFFF; font-weight: 800; font-size: 14px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.28);
      border: 2.5px solid #FFFFFF; cursor: pointer;
    }
    .marker-pickup { background: #FF6B00; }
    .driver-pin {
      width: 36px; height: 36px; border-radius: 50%;
      background: #FFFFFF; border: 2.5px solid #007AFF;
      box-shadow: 0 4px 12px rgba(0,122,255,0.35);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; cursor: pointer;
      animation: pulse 2s infinite ease-in-out;
    }
    @keyframes pulse {
      0%   { transform: scale(1);    box-shadow: 0 0 0 0   rgba(0,122,255,0.4); }
      70%  { transform: scale(1.08); box-shadow: 0 0 0 10px rgba(0,122,255,0); }
      100% { transform: scale(1);    box-shadow: 0 0 0 0   rgba(0,122,255,0); }
    }
    .leaflet-popup-content-wrapper { border-radius: 12px; padding: 4px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
    .leaflet-popup-content { margin: 8px 12px; line-height: 1.4; }
    .popup-title { font-size: 13px; font-weight: 700; color: #1C1C1E; }
    .popup-sub   { font-size: 11px; font-weight: 500; color: #8E8E93; margin-top: 2px; }
    #loc-overlay {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(234,240,248,0.82);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      z-index: 1000;
      font-size: 13px; color: #8E8E93; font-weight: 600; gap: 8px;
    }
    .spin {
      width: 28px; height: 28px; border-radius: 50%;
      border: 3px solid #E5E5EA; border-top-color: #FF6B00;
      animation: sp 0.8s linear infinite;
    }
    @keyframes sp { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div id="map"></div>
  ${locating ? '<div id="loc-overlay"><div class="spin"></div>Getting your location\u2026</div>' : ""}
  <script>
    (function() {
      var dLat = ${driverLat}, dLng = ${driverLng};
      var pLat = ${pickupLat}, pLng = ${pickupLng};

      var driver = [dLat, dLng];
      var pickup = [pLat, pLng];

      var map = L.map('map', { zoomControl: true, attributionControl: false })
                 .setView([(dLat + pLat) / 2, (dLng + pLng) / 2], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

      var pickupIcon = L.divIcon({
        className: '',
        html: '<div class="custom-marker marker-pickup">P</div>',
        iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0,-18]
      });
      var driverIcon = L.divIcon({
        className: '',
        html: '<div class="driver-pin">\uD83D\uDE97</div>',
        iconSize: [36,36], iconAnchor: [18,18], popupAnchor: [0,-20]
      });

      L.marker(pickup, { icon: pickupIcon })
        .addTo(map)
        .bindPopup('<div class="popup-title">\uD83D\uDCCD Pickup Location</div><div class="popup-sub">Your destination</div>');

      L.marker(driver, { icon: driverIcon })
        .addTo(map)
        .bindPopup('<div class="popup-title">\uD83D\uDE97 Your Location</div><div class="popup-sub">Heading to pickup</div>');

      map.fitBounds(L.latLngBounds([driver, pickup]), { paddingTopLeft: [40,40], paddingBottomRight: [40,40], maxZoom: 16 });

      fetch('https://router.project-osrm.org/route/v1/driving/' + dLng + ',' + dLat + ';' + pLng + ',' + pLat + '?overview=full&geometries=geojson')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data && data.routes && data.routes.length > 0) {
            var coords = data.routes[0].geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
            L.polyline(coords, { color: 'rgba(255,107,0,0.2)', weight: 8, lineCap: 'round', lineJoin: 'round' }).addTo(map);
            var rl = L.polyline(coords, { color: '#FF6B00', weight: 5, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }).addTo(map);
            map.fitBounds(rl.getBounds(), { paddingTopLeft: [40,40], paddingBottomRight: [40,40], maxZoom: 16 });
          } else {
            L.polyline([driver, pickup], { color: '#FF6B00', weight: 4, dashArray: '8,8', opacity: 0.8 }).addTo(map);
          }
        })
        .catch(function() {
          L.polyline([driver, pickup], { color: '#FF6B00', weight: 4, dashArray: '8,8', opacity: 0.8 }).addTo(map);
        });
    })();
  </script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

const DeliveryMap: React.FC<DeliveryMapProps> = ({
    pickupAddress,
    dropOffAddress,
    distanceKm: distanceProp,
    etaMinutes: etaProp,
}) => {
    const pickupCoords = extractCoords(pickupAddress, 6.9271, 79.8612);

    // ── Geolocation state ──────────────────────────────────
    const [currentLoc, setCurrentLoc] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locating, setLocating]     = useState(true);
    const [locLabel, setLocLabel]     = useState("Locating…");

    // ── Route stats computed from OSRM ─────────────────────
    const [routeDistance, setRouteDistance] = useState<number | undefined>(distanceProp);
    const [routeEta, setRouteEta]           = useState<number | undefined>(etaProp);
    const [routeLoading, setRouteLoading]   = useState(false);

    // ── 1. Get live location ───────────────────────────────
    useEffect(() => {
        if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                    setCurrentLoc(loc);
                    setLocLabel(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
                    setLocating(false);
                },
                () => {
                    const fallback = {
                        latitude: pickupCoords.latitude - 0.008,
                        longitude: pickupCoords.longitude - 0.008,
                    };
                    setCurrentLoc(fallback);
                    setLocLabel("Approximate location");
                    setLocating(false);
                },
                { enableHighAccuracy: false, timeout: 8000 }
            );
        } else {
            const fallback = {
                latitude: pickupCoords.latitude - 0.008,
                longitude: pickupCoords.longitude - 0.008,
            };
            setCurrentLoc(fallback);
            setLocLabel("Simulated location");
            setLocating(false);
        }
    }, []);

    // ── 2. Fetch OSRM route for distance + ETA ─────────────
    useEffect(() => {
        if (!currentLoc) return;
        setRouteLoading(true);
        fetchOsrmRoute(currentLoc, pickupCoords)
            .then((result) => {
                if (result) {
                    setRouteDistance(result.distanceKm);
                    setRouteEta(result.etaMinutes);
                }
            })
            .finally(() => setRouteLoading(false));
    }, [currentLoc]);

    const driverLat = currentLoc?.latitude  ?? pickupCoords.latitude  - 0.008;
    const driverLng = currentLoc?.longitude ?? pickupCoords.longitude - 0.008;
    const mapHtml   = buildMapHtml(driverLat, driverLng, pickupCoords.latitude, pickupCoords.longitude, locating);

    const distanceLabel = routeDistance != null
        ? routeDistance < 1
            ? `${Math.round(routeDistance * 1000)} m`
            : `${routeDistance.toFixed(1)} km`
        : "—";
    const etaLabel = routeEta != null ? `~${routeEta} min` : "—";

    return (
        <View style={styles.card}>
            <Text style={styles.sectionLabel}>Route to Pickup</Text>

            {/* ── Live Map (WebView for native / iframe for Web) ──────────────── */}
            <View style={styles.mapWrapper}>
                {Platform.OS === "web" ? (
                    React.createElement("iframe", {
                        srcDoc: mapHtml,
                        style: {
                            width: "100%",
                            height: "100%",
                            border: "none",
                            backgroundColor: "#EAF0F8",
                        },
                        title: "Route to Pickup",
                    } as any)
                ) : (
                    <WebView
                        originWhitelist={["*"]}
                        source={{ html: mapHtml }}
                        style={{ flex: 1, backgroundColor: "#EAF0F8" }}
                        javaScriptEnabled
                        domStorageEnabled
                    />
                )}

                {/* Status chip */}
                <View style={styles.statusChip}>
                    <View style={styles.statusChipDot} />
                    <Text style={styles.statusChipText}>
                        {locating ? "Locating you\u2026" : "Heading to Pickup"}
                    </Text>
                </View>

                {/* Navigate button */}
                <TouchableOpacity
                    style={styles.navBtn}
                    onPress={() => openMaps(pickupAddress)}
                    activeOpacity={0.85}
                >
                    <Ionicons name="navigate-outline" size={13} color="#FFF" />
                    <Text style={styles.navBtnText}>Navigate</Text>
                </TouchableOpacity>
            </View>

            {/* ── Distance / ETA strip ──────────────────────── */}
            <View style={styles.statsStrip}>
                <View style={styles.stat}>
                    {routeLoading ? (
                        <ActivityIndicator size="small" color="#FF6B00" />
                    ) : (
                        <Text style={styles.statValue}>{distanceLabel}</Text>
                    )}
                    <Text style={styles.statLabel}>Distance</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.stat}>
                    {routeLoading ? (
                        <ActivityIndicator size="small" color="#FF6B00" />
                    ) : (
                        <Text style={styles.statValue}>{etaLabel}</Text>
                    )}
                    <Text style={styles.statLabel}>Est. Travel</Text>
                </View>

                <View style={styles.statDivider} />

                <TouchableOpacity
                    style={styles.navigateBtn}
                    onPress={() => openMaps(pickupAddress)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="map-outline" size={14} color="#FFF" />
                    <Text style={styles.navigateText}>Navigate</Text>
                </TouchableOpacity>
            </View>

            {/* ── Address rows ──────────────────────────────── */}
            <View style={styles.addressBlock}>
                {/* Your location */}
                <View style={styles.addressRow}>
                    <View style={[styles.addrDot, styles.addrDotDriver]} />
                    <View style={styles.addrTextBlock}>
                        <Text style={styles.addrRoleLabel}>YOUR LOCATION</Text>
                        <Text style={styles.addrValue} numberOfLines={1}>
                            {locLabel}
                        </Text>
                    </View>
                </View>

                <View style={styles.addrConnector} />

                {/* Pickup */}
                <View style={styles.addressRow}>
                    <View style={[styles.addrDot, styles.addrDotPickup]} />
                    <View style={styles.addrTextBlock}>
                        <Text style={styles.addrRoleLabel}>PICKUP LOCATION</Text>
                        <Text style={styles.addrValue} numberOfLines={2}>
                            {shortAddress(pickupAddress)}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addrBtn}
                        onPress={() => openMaps(pickupAddress)}
                        activeOpacity={0.75}
                    >
                        <Text style={styles.addrBtnText}>Go</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.addrConnector} />

                {/* Drop-off */}
                <View style={styles.addressRow}>
                    <View style={[styles.addrDot, styles.addrDotDropoff]} />
                    <View style={styles.addrTextBlock}>
                        <Text style={styles.addrRoleLabel}>DROP-OFF LOCATION</Text>
                        <Text style={styles.addrValue} numberOfLines={2}>
                            {shortAddress(dropOffAddress)}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addrBtn}
                        onPress={() => openMaps(dropOffAddress)}
                        activeOpacity={0.75}
                    >
                        <Text style={styles.addrBtnText}>Go</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default DeliveryMap;

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const MAP_HEIGHT = 230;

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#8E8E93",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 10,
    },

    // ── Map wrapper ────────────────────────────────────────
    mapWrapper: {
        height: MAP_HEIGHT,
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#EAF0F8",
        position: "relative",
    },

    statusChip: {
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 10,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#E5E5EA",
        paddingHorizontal: 10,
        paddingVertical: 5,
        gap: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    statusChipDot:  { width: 7, height: 7, borderRadius: 4, backgroundColor: "#FF6B00" },
    statusChipText: { fontSize: 11, fontWeight: "600", color: "#1C1C1E" },

    navBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#FF6B00",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        shadowColor: "#FF6B00",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    navBtnText: { fontSize: 12, fontWeight: "700", color: "#FFF" },

    // ── Stats strip ────────────────────────────────────────
    statsStrip: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#F2F2F7",
    },
    stat: { alignItems: "center", flex: 1 },
    statValue: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1C1C1E",
        letterSpacing: -0.3,
    },
    statLabel: {
        fontSize: 11,
        color: "#8E8E93",
        fontWeight: "500",
        marginTop: 2,
    },
    statDivider: {
        width: StyleSheet.hairlineWidth,
        height: 32,
        backgroundColor: "#E5E5EA",
    },
    navigateBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FF6B00",
        borderRadius: 10,
        paddingVertical: 8,
        marginLeft: 8,
        gap: 5,
    },
    navigateText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },

    // ── Address rows ───────────────────────────────────────
    addressBlock: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },
    addressRow:   { flexDirection: "row", alignItems: "flex-start" },
    addrDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 4,
        marginRight: 10,
    },
    addrDotDriver:  { backgroundColor: "#007AFF" },
    addrDotPickup:  { backgroundColor: "#FF6B00" },
    addrDotDropoff: { backgroundColor: "#34C759" },
    addrTextBlock:  { flex: 1 },
    addrRoleLabel: {
        fontSize: 10,
        fontWeight: "600",
        color: "#8E8E93",
        textTransform: "uppercase",
        letterSpacing: 0.4,
        marginBottom: 1,
    },
    addrValue: {
        fontSize: 14,
        fontWeight: "500",
        color: "#1C1C1E",
        lineHeight: 19,
    },
    addrBtn: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        backgroundColor: "#F2F2F7",
        borderRadius: 8,
        marginLeft: 8,
        alignSelf: "center",
    },
    addrBtnText: { fontSize: 13, fontWeight: "600", color: "#FF6B00" },
    addrConnector: {
        width: 1.5,
        height: 14,
        backgroundColor: "#C7C7CC",
        marginLeft: 5,
        marginVertical: 3,
    },
});