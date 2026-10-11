/**
 * Ongoing Delivery Screen — Light UI
 *
 * Active delivery tracking interface:
 *   - Real Map with OpenStreetMap & OSRM road routing
 *   - Bottom sheet: trip info, progress stepper, morphing CTA button
 *   - Report Issue modal
 *   - Completion success modal → navigates to /volunteer (Dashboard)
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Modal,
    Animated,
    Dimensions,
    Linking,
    Platform,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import { volunteerApi } from "../../../services/api";
import type { Delivery } from "../../../types/volunteer";

let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
let UrlTile: any = null;
let PROVIDER_DEFAULT: any = null;

if (Platform.OS !== "web") {
    try {
        const Maps = require("react-native-maps");
        MapView = Maps.default ?? Maps;
        Marker = Maps.Marker;
        Polyline = Maps.Polyline;
        UrlTile = Maps.UrlTile;
        PROVIDER_DEFAULT = Maps.PROVIDER_DEFAULT;
    } catch {
        // Native maps not available
    }
}

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_H = SCREEN_H * 0.52;

// ─────────────────────────────────────────────────────────────
// Free OSRM driving route fetcher
// ─────────────────────────────────────────────────────────────
async function fetchDrivingRoute(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
) {
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
            return data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => ({
                latitude: lat,
                longitude: lng,
            }));
        }
    } catch (err) {
        console.error("Failed to fetch OSRM route:", err);
    }
    return [origin, destination]; // Fallback to straight line
}

function parseCoord(val: any, fallback: number): number {
    if (typeof val === "number" && !isNaN(val)) return val;
    if (typeof val === "string") {
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) return parsed;
    }
    return fallback;
}

function extractCoords(addr: any, fallbackLat: number, fallbackLng: number) {
    if (!addr) return { latitude: fallbackLat, longitude: fallbackLng };
    if (Array.isArray(addr.coordinates) && addr.coordinates.length >= 2) {
        return {
            latitude: parseCoord(addr.coordinates[1], fallbackLat),
            longitude: parseCoord(addr.coordinates[0], fallbackLng),
        };
    }
    const lat = addr.coordinates?.latitude ?? addr.latitude ?? addr.lat;
    const lng = addr.coordinates?.longitude ?? addr.longitude ?? addr.lng;
    return {
        latitude: parseCoord(lat, fallbackLat),
        longitude: parseCoord(lng, fallbackLng),
    };
}

// ─────────────────────────────────────────────────────────────
// Live Map Component
// ─────────────────────────────────────────────────────────────
const LiveMap: React.FC<{ delivery: Delivery; status: string }> = ({
    delivery,
    status,
}) => {
    const isPickup = status === "ACCEPTED";

    const pickupCoords = extractCoords(delivery.pickupAddress, 6.9271, 79.8612);
    const dropoffCoords = extractCoords(delivery.dropOffAddress, 6.9344, 79.8510);

    const driverCoords = isPickup
        ? { latitude: pickupCoords.latitude - 0.002, longitude: pickupCoords.longitude - 0.002 }
        : { latitude: dropoffCoords.latitude - 0.001, longitude: dropoffCoords.longitude - 0.001 };

    const [routeCoords, setRouteCoords] = useState<Array<{ latitude: number; longitude: number }>>([]);

    useEffect(() => {
        if (Platform.OS !== "web") {
            fetchDrivingRoute(pickupCoords, dropoffCoords).then(setRouteCoords);
        }
    }, [delivery.id]);

    const openMaps = (addr: string) => {
        const q = encodeURIComponent(addr);
        if (Platform.OS === "web") {
            window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
            return;
        }
        const url = Platform.OS === "ios" ? `maps://?daddr=${q}` : `geo:0,0?q=${q}`;
        Linking.openURL(url).catch(() =>
            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`)
        );
    };

    const targetAddr = isPickup
        ? (delivery.pickupAddress.fullAddress  ?? delivery.pickupAddress.street  ?? "")
        : (delivery.dropOffAddress.fullAddress ?? delivery.dropOffAddress.street ?? "");

    // On Web view or when native MapView is not present: render interactive Leaflet map
    if (Platform.OS === "web" || !MapView) {
        const pLat = pickupCoords.latitude;
        const pLng = pickupCoords.longitude;
        const dLat = dropoffCoords.latitude;
        const dLng = dropoffCoords.longitude;
        const drLat = driverCoords.latitude;
        const drLng = driverCoords.longitude;

        const mapHtml = `<!DOCTYPE html>
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
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    #map { width: 100%; height: 100%; position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
    .custom-marker {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 50%;
      color: #FFFFFF; font-weight: 800; font-size: 14px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.28);
      border: 2.5px solid #FFFFFF; cursor: pointer;
    }
    .marker-pickup { background: #FF6B00; }
    .marker-dropoff { background: #34C759; }
    .driver-pin {
      width: 36px; height: 36px; border-radius: 50%;
      background: #FFFFFF; border: 2.5px solid #FF6B00;
      box-shadow: 0 4px 12px rgba(255, 107, 0, 0.35);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; cursor: pointer; animation: pulse 2s infinite ease-in-out;
    }
    @keyframes pulse {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 0, 0.4); }
      70% { transform: scale(1.08); box-shadow: 0 0 0 10px rgba(255, 107, 0, 0); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 0, 0); }
    }
    .leaflet-popup-content-wrapper { border-radius: 12px; padding: 4px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); font-size: 13px; font-weight: 600; }
    .leaflet-popup-content { margin: 8px 12px; line-height: 1.4; }
    .popup-title { font-size: 13px; font-weight: 700; color: #1C1C1E; }
    .popup-sub { font-size: 11px; font-weight: 500; color: #8E8E93; margin-top: 2px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    (function() {
      var pLat = ${pLat}, pLng = ${pLng};
      var dLat = ${dLat}, dLng = ${dLng};
      var drLat = ${drLat}, drLng = ${drLng};

      var pickup = [pLat, pLng];
      var dropoff = [dLat, dLng];
      var driver = [drLat, drLng];

      var centerLat = (pLat + dLat) / 2;
      var centerLng = (pLng + dLng) / 2;

      var map = L.map('map', { zoomControl: true, attributionControl: false }).setView([centerLat, centerLng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

      var pickupIcon = L.divIcon({ className: '', html: '<div class=\"custom-marker marker-pickup\">P</div>', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -18] });
      var dropoffIcon = L.divIcon({ className: '', html: '<div class=\"custom-marker marker-dropoff\">D</div>', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -18] });
      var driverIcon = L.divIcon({ className: '', html: '<div class=\"driver-pin\">🚗</div>', iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -20] });

      L.marker(pickup, { icon: pickupIcon }).addTo(map).bindPopup('<div class=\"popup-title\">📍 Pickup Location</div><div class=\"popup-sub\">${isPickup ? "Next Stop" : "Completed"}</div>');
      L.marker(dropoff, { icon: dropoffIcon }).addTo(map).bindPopup('<div class=\"popup-title\">🎯 Drop-off Location</div><div class=\"popup-sub\">${!isPickup ? "Next Stop" : "Final Destination"}</div>');
      L.marker(driver, { icon: driverIcon }).addTo(map).bindPopup('<div class=\"popup-title\">🚗 Volunteer Driver</div><div class=\"popup-sub\">${isPickup ? "Heading to pickup" : "En route to drop-off"}</div>');

      var bounds = L.latLngBounds([pickup, dropoff, driver]);
      map.fitBounds(bounds, { paddingTopLeft: [40, 50], paddingBottomRight: [40, 240], maxZoom: 16 });

      var osrmUrl = 'https://router.project-osrm.org/route/v1/driving/' + pLng + ',' + pLat + ';' + dLng + ',' + dLat + '?overview=full&geometries=geojson';
      fetch(osrmUrl)
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data && data.routes && data.routes.length > 0) {
            var coords = data.routes[0].geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
            L.polyline(coords, { color: 'rgba(255, 107, 0, 0.25)', weight: 8, lineCap: 'round', lineJoin: 'round' }).addTo(map);
            var routeLine = L.polyline(coords, { color: '#FF6B00', weight: 5, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }).addTo(map);
            map.fitBounds(routeLine.getBounds(), { paddingTopLeft: [40, 50], paddingBottomRight: [40, 240], maxZoom: 16 });
          } else {
            L.polyline([pickup, dropoff], { color: '#FF6B00', weight: 4, dashArray: '8, 8', opacity: 0.8 }).addTo(map);
          }
        })
        .catch(function() {
          L.polyline([pickup, dropoff], { color: '#FF6B00', weight: 4, dashArray: '8, 8', opacity: 0.8 }).addTo(map);
        });
    })();
  </script>
</body>
</html>`;

        return (
            <View style={mapS.container}>
                {React.createElement("iframe", {
                    srcDoc: mapHtml,
                    style: {
                        width: "100%",
                        height: "100%",
                        border: "none",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "#EAF0F8",
                    },
                    title: "Live Delivery Route Map",
                })}

                <View style={mapS.statusChip}>
                    <View style={mapS.statusChipDot} />
                    <Text style={mapS.statusChipText}>
                        {status === "ACCEPTED"   ? "Heading to Pickup"    :
                         status === "PICKED_UP"  ? "Food Collected"       :
                         status === "IN_TRANSIT" ? "En Route to Drop-off" : ""}
                    </Text>
                </View>

                <TouchableOpacity
                    style={mapS.navBtn}
                    onPress={() => openMaps(targetAddr)}
                    activeOpacity={0.85}
                >
                    <Ionicons name="navigate-outline" size={14} color="#FFF" />
                    <Text style={mapS.navBtnText}>Navigate</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={mapS.container}>
            <MapView
                provider={PROVIDER_DEFAULT}
                style={StyleSheet.absoluteFill}
                initialRegion={{
                    latitude: (pickupCoords.latitude + dropoffCoords.latitude) / 2,
                    longitude: (pickupCoords.longitude + dropoffCoords.longitude) / 2,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04,
                }}
            >
                {/* Free OpenStreetMap Tiles */}
                <UrlTile
                    urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                />

                {/* On-the-road Polyline Route */}
                {routeCoords.length > 0 && (
                    <Polyline
                        coordinates={routeCoords}
                        strokeColor="#FF6B00"
                        strokeWidth={4}
                    />
                )}

                {/* Pickup Pin */}
                <Marker coordinate={pickupCoords} title="Pickup Location">
                    <View style={[mapS.markerBubble, { backgroundColor: "#FF6B00" }]}>
                        <Text style={mapS.markerText}>P</Text>
                    </View>
                </Marker>

                {/* Drop-off Pin */}
                <Marker coordinate={dropoffCoords} title="Drop-off Location">
                    <View style={[mapS.markerBubble, { backgroundColor: "#34C759" }]}>
                        <Text style={mapS.markerText}>D</Text>
                    </View>
                </Marker>

                {/* Driver Pin */}
                <Marker coordinate={driverCoords} title="Volunteer En Route">
                    <View style={mapS.driverBubble}>
                        <Ionicons name="car" size={18} color="#FF6B00" />
                    </View>
                </Marker>
            </MapView>

            {/* Status chip */}
            <View style={mapS.statusChip}>
                <View style={mapS.statusChipDot} />
                <Text style={mapS.statusChipText}>
                    {status === "ACCEPTED"   ? "Heading to Pickup"    :
                     status === "PICKED_UP"  ? "Food Collected"       :
                     status === "IN_TRANSIT" ? "En Route to Drop-off" : ""}
                </Text>
            </View>

            {/* Navigate button */}
            <TouchableOpacity
                style={mapS.navBtn}
                onPress={() => openMaps(targetAddr)}
                activeOpacity={0.85}
            >
                <Ionicons name="navigate-outline" size={14} color="#FFF" />
                <Text style={mapS.navBtnText}>Navigate</Text>
            </TouchableOpacity>
        </View>
    );
};

const mapS = StyleSheet.create({
    container: {
        flex: 1, position: "relative", overflow: "hidden",
    },
    markerBubble: {
        width: 32, height: 32, borderRadius: 16,
        alignItems: "center", justifyContent: "center",
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25, shadowRadius: 4, elevation: 4,
    },
    markerText: { color: "#FFF", fontWeight: "800", fontSize: 14 },
    driverBubble: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: "#FFF", borderWidth: 2, borderColor: "#FF6B00",
        alignItems: "center", justifyContent: "center", elevation: 5,
    },
    statusChip: {
        position: "absolute", top: 14, left: 14,
        flexDirection: "row", alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.92)",
        borderRadius: 20, borderWidth: 1, borderColor: "#E5E5EA",
        paddingHorizontal: 12, paddingVertical: 6, gap: 6,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
    },
    statusChipDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF6B00" },
    statusChipText: { fontSize: 12, fontWeight: "600", color: "#1C1C1E" },
    navBtn: {
        position: "absolute", top: 14, right: 14,
        flexDirection: "row", alignItems: "center", gap: 5,
        backgroundColor: "#FF6B00", borderRadius: 20,
        paddingHorizontal: 14, paddingVertical: 8,
        shadowColor: "#FF6B00", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    navBtnText: { fontSize: 13, fontWeight: "700", color: "#FFF" },
});

// ─────────────────────────────────────────────────────────────
// CTA config per status
// ─────────────────────────────────────────────────────────────
type CTAConfig = {
    label: string;
    action: "pickup" | "transit" | "delivered";
    color: string;
} | null;

function resolveCTA(status: string): CTAConfig {
    switch (status) {
        case "ACCEPTED":   return { label: "Confirm Pickup", action: "pickup",    color: "#FF6B00" };
        case "PICKED_UP":  return { label: "Start Transit",  action: "transit",   color: "#007AFF" };
        case "IN_TRANSIT": return { label: "Mark Delivered", action: "delivered", color: "#34C759" };
        default:           return null;
    }
}

// ─────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────
export default function OngoingDelivery() {
    const router          = useRouter();
    const { accessToken } = useAuth();

    const [delivery, setDelivery]           = useState<Delivery | null>(null);
    const [loading, setLoading]             = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError]                 = useState<string | null>(null);
    const [showReport, setShowReport]       = useState(false);
    const [showComplete, setShowComplete]   = useState(false);
    const [cancelling, setCancelling]       = useState(false);

    const sheetAnim   = useRef(new Animated.Value(SHEET_H)).current;
    const successAnim = useRef(new Animated.Value(0.6)).current;

    const fetchActive = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            setError(null);
            const summary = await volunteerApi.getSummary(accessToken);
            setDelivery(summary.activeDelivery ?? null);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load active delivery.");
        } finally {
            setLoading(false);
            Animated.spring(sheetAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65, friction: 11,
            }).start();
        }
    }, [accessToken]);

    const handleCancel = async () => {
        if (!accessToken || !delivery || cancelling) return;
        setCancelling(true);
        try {
            await volunteerApi.cancelDelivery(delivery.id, accessToken);
            setShowReport(false);
            router.replace("/volunteer");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to cancel delivery.");
            setShowReport(false);
        } finally {
            setCancelling(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchActive();
        }, [fetchActive])
    );

    const handleAction = async (action: "pickup" | "transit" | "delivered") => {
        if (!accessToken || !delivery || actionLoading) return;
        setActionLoading(true);
        try {
            let updated: Delivery;
            switch (action) {
                case "pickup":
                    updated = await volunteerApi.confirmPickup(delivery.id, accessToken);
                    break;
                case "transit":
                    updated = await volunteerApi.startTransit(delivery.id, accessToken);
                    break;
                case "delivered":
                    updated = await volunteerApi.confirmDelivered(delivery.id, accessToken);
                    setShowComplete(true);
                    Animated.spring(successAnim, {
                        toValue: 1, useNativeDriver: true,
                        tension: 80, friction: 8,
                    }).start();
                    setTimeout(() => {
                        setShowComplete(false);
                        router.replace("/volunteer");
                    }, 2500);
                    break;
            }
            setDelivery(updated!);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Action failed.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={s.safeArea}>
                <View style={s.center}>
                    <ActivityIndicator size="large" color="#FF6B00" />
                    <Text style={s.loadingText}>Loading active delivery…</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!delivery) {
        return (
            <SafeAreaView style={s.safeArea}>
                <View style={s.noDelivery}>
                    <Ionicons name="car-outline" size={64} color="#C7C7CC" style={{ marginBottom: 20 }} />
                    <Text style={s.noDeliveryTitle}>No Active Delivery</Text>
                    <Text style={s.noDeliverySubtitle}>
                        Accept a delivery from the Dashboard to start tracking here.
                    </Text>
                    <TouchableOpacity
                        style={s.dashboardBtn}
                        onPress={() => router.replace("/volunteer")}
                        activeOpacity={0.85}
                    >
                        <Text style={s.dashboardBtnText}>Browse Available Deliveries</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const cta     = resolveCTA(delivery.status);
    const pickup  = delivery.pickupAddress;
    const dropoff = delivery.dropOffAddress;

    const donorName     = delivery.donor?.name     || "—";
    const recipientName = delivery.recipient?.name || "—";

    return (
        <SafeAreaView style={s.safeArea}>
            {/* ── Map ───────── */}
            <View style={s.mapContainer}>
                <LiveMap delivery={delivery} status={delivery.status} />
            </View>

            {/* ── Bottom sheet ─────────────────────────── */}
            <Animated.View
                style={[s.sheet, { transform: [{ translateY: sheetAnim }] }]}
            >
                <View style={s.sheetHandle} />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={s.sheetScroll}
                    contentContainerStyle={s.sheetContent}
                >
                    {/* Food name + status badge */}
                    <View style={s.sheetHeader}>
                        <View style={s.sheetFoodInfo}>
                            <Text style={s.sheetFoodName} numberOfLines={1}>
                                {delivery.donation.foodName}
                            </Text>
                            <Text style={s.sheetQty}>{delivery.donation.quantity}</Text>
                        </View>
                        <View style={s.statusBadge}>
                            <View style={s.statusBadgeDot} />
                            <Text style={s.statusBadgeText}>
                                {delivery.status.replace("_", " ")}
                            </Text>
                        </View>
                    </View>

                    {/* Progress stepper */}
                    <View style={s.progressRow}>
                        {["ACCEPTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"].map((step, i) => {
                            const order = ["ACCEPTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];
                            const cur   = order.indexOf(delivery.status);
                            const done  = i < cur;
                            const active = i === cur;
                            return (
                                <React.Fragment key={step}>
                                    <View style={[
                                        s.progressDot,
                                        done   && s.progressDotDone,
                                        active && s.progressDotActive,
                                    ]}>
                                        {done && <Ionicons name="checkmark" size={12} color="#FFF" />}
                                    </View>
                                    {i < 3 && (
                                        <View style={[s.progressLine, done && s.progressLineDone]} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </View>
                    <View style={s.progressLabels}>
                        {["Accepted", "Picked Up", "In Transit", "Delivered"].map((l) => (
                            <Text key={l} style={s.progressLabel}>{l}</Text>
                        ))}
                    </View>

                    {/* Route card */}
                    <View style={s.routeCard}>
                        <View style={s.routeRow}>
                            <View style={[s.routeDot, { backgroundColor: "#FF6B00" }]} />
                            <View style={s.routeInfo}>
                                <Text style={s.routeRoleLabel}>PICKUP</Text>
                                <Text style={s.routeAddr} numberOfLines={1}>
                                    {pickup.fullAddress ?? pickup.street ?? "—"}
                                </Text>
                            </View>
                        </View>
                        <View style={s.routeConnector} />
                        <View style={s.routeRow}>
                            <View style={[s.routeDot, { backgroundColor: "#34C759" }]} />
                            <View style={s.routeInfo}>
                                <Text style={s.routeRoleLabel}>DROP-OFF</Text>
                                <Text style={s.routeAddr} numberOfLines={1}>
                                    {dropoff.fullAddress ?? dropoff.street ?? "—"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Contact cards */}
                    <View style={s.contactRow}>
                        <View style={s.contactCard}>
                            <Text style={s.contactRole}>DONOR</Text>
                            <Text style={s.contactName}>{donorName}</Text>
                            {delivery.donor?.phone ? (
                                <TouchableOpacity
                                    style={s.callBtn}
                                    onPress={() =>
                                        Linking.openURL(`tel:${delivery.donor.phone}`)
                                    }
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="call" size={13} color="#FF6B00" />
                                    <Text style={s.callBtnText}>Call</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        <View style={s.contactCard}>
                            <Text style={s.contactRole}>RECIPIENT</Text>
                            <Text style={s.contactName}>{recipientName}</Text>
                            {delivery.recipient?.phone ? (
                                <TouchableOpacity
                                    style={s.callBtn}
                                    onPress={() =>
                                        Linking.openURL(`tel:${delivery.recipient.phone}`)
                                    }
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="call" size={13} color="#FF6B00" />
                                    <Text style={s.callBtnText}>Call</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    </View>

                    {/* Error */}
                    {error ? (
                        <View style={s.errorBanner}>
                            <Text style={s.errorText}>{error}</Text>
                            <TouchableOpacity onPress={() => setError(null)}>
                                <Text style={s.errorDismiss}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {/* CTA button */}
                    {cta ? (
                        <TouchableOpacity
                            style={[
                                s.ctaBtn,
                                { backgroundColor: cta.color, shadowColor: cta.color },
                                actionLoading && s.ctaBtnDisabled,
                            ]}
                            onPress={() => handleAction(cta.action)}
                            disabled={actionLoading}
                            activeOpacity={0.85}
                        >
                            {actionLoading ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <Text style={s.ctaBtnText}>{cta.label}</Text>
                            )}
                        </TouchableOpacity>
                    ) : null}

                    {/* Report issue */}
                    {delivery.status !== "DELIVERED" &&
                     delivery.status !== "CANCELLED" ? (
                        <TouchableOpacity
                            style={s.reportBtn}
                            onPress={() => setShowReport(true)}
                            activeOpacity={0.75}
                        >
                            <Ionicons name="warning-outline" size={16} color="#FF3B30" style={{ marginRight: 6 }} />
                            <Text style={s.reportBtnText}>Report Issue / Cancel Task</Text>
                        </TouchableOpacity>
                    ) : null}

                    <View style={{ height: 16 }} />
                </ScrollView>
            </Animated.View>

            {/* ── Report Issue modal ───────────────────── */}
            <Modal
                visible={showReport}
                transparent
                animationType="slide"
                statusBarTranslucent
            >
                <View style={s.modalOverlay}>
                    <View style={s.reportModal}>
                        <Text style={s.reportTitle}>Report an Issue</Text>
                        <Text style={s.reportSubtitle}>
                            Select your reason. This will cancel the delivery
                            and release it back to the available pool.
                        </Text>
                        {[
                            "Donor not reachable",
                            "Recipient not reachable",
                            "Food quality concern",
                            "Unable to locate address",
                            "Personal emergency",
                        ].map((issue) => (
                            <TouchableOpacity
                                key={issue}
                                style={s.reportOption}
                                onPress={handleCancel}
                                activeOpacity={0.8}
                                disabled={cancelling}
                            >
                                {cancelling ? (
                                    <ActivityIndicator color="#FF6B00" size="small" />
                                ) : (
                                    <Text style={s.reportOptionText}>{issue}</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={s.reportClose}
                            onPress={() => setShowReport(false)}
                        >
                            <Text style={s.reportCloseText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ── Delivery complete modal ──────────────── */}
            <Modal
                visible={showComplete}
                transparent
                animationType="fade"
                statusBarTranslucent
            >
                <View style={s.modalOverlay}>
                    <Animated.View
                        style={[
                            s.completeModal,
                            { transform: [{ scale: successAnim }] },
                        ]}
                    >
                        <View style={s.completeIconCircle}>
                            <Ionicons name="checkmark" size={38} color="#FFF" />
                        </View>
                        <Text style={s.completeTitle}>Delivery Complete!</Text>
                        <Text style={s.completeSubtitle}>
                            You've successfully delivered{"\n"}
                            {delivery.donation.foodName}
                        </Text>
                        <View style={s.completeStats}>
                            <View style={s.completeStat}>
                                <Text style={s.completeStatValue}>
                                    {delivery.donation.quantity}
                                </Text>
                                <Text style={s.completeStatLabel}>Items Saved</Text>
                            </View>
                            <View style={s.completeStatDivider} />
                            <View style={s.completeStat}>
                                <Text style={s.completeStatValue}>✓</Text>
                                <Text style={s.completeStatLabel}>Done</Text>
                            </View>
                        </View>
                        <ActivityIndicator color="#FF6B00" style={{ marginTop: 16 }} />
                    </Animated.View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F2F2F7" },
    center:   { flex: 1, alignItems: "center", justifyContent: "center" },
    loadingText: { color: "#8E8E93", fontSize: 14, marginTop: 12 },

    // No delivery
    noDelivery: {
        flex: 1, alignItems: "center", justifyContent: "center",
        paddingHorizontal: 32,
    },
    noDeliveryTitle:    { fontSize: 22, fontWeight: "800", color: "#1C1C1E", marginBottom: 10, letterSpacing: -0.5 },
    noDeliverySubtitle: { fontSize: 15, color: "#8E8E93", textAlign: "center", lineHeight: 22, marginBottom: 32 },
    dashboardBtn: {
        backgroundColor: "#FF6B00", borderRadius: 16,
        paddingHorizontal: 28, paddingVertical: 14,
        shadowColor: "#FF6B00", shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
    },
    dashboardBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },

    // Map
    mapContainer: { flex: 1 },

    // Sheet
    sheet: {
        position: "absolute", left: 0, right: 0, bottom: 0,
        height: SHEET_H,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: "#E5E5EA",
        paddingTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08, shadowRadius: 12, elevation: 12,
    },
    sheetHandle: {
        width: 36, height: 4, borderRadius: 2,
        backgroundColor: "#C7C7CC", alignSelf: "center", marginBottom: 14,
    },
    sheetScroll: { flex: 1 },
    sheetContent: { paddingHorizontal: 20, paddingBottom: 24 },

    // Sheet header
    sheetHeader: {
        flexDirection: "row", alignItems: "flex-start",
        justifyContent: "space-between", marginBottom: 16,
    },
    sheetFoodInfo: { flex: 1, marginRight: 12 },
    sheetFoodName: {
        fontSize: 18, fontWeight: "800", color: "#1C1C1E",
        letterSpacing: -0.4, marginBottom: 2,
    },
    sheetQty: { fontSize: 13, color: "#8E8E93", fontWeight: "500" },
    statusBadge: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#FFF3E8", borderRadius: 10,
        paddingHorizontal: 10, paddingVertical: 5, gap: 5,
    },
    statusBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF6B00" },
    statusBadgeText: { fontSize: 11, fontWeight: "700", color: "#FF6B00", letterSpacing: 0.3 },

    // Progress
    progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    progressDot: {
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: "#E5E5EA",
        alignItems: "center", justifyContent: "center",
    },
    progressDotDone:   { backgroundColor: "#34C759" },
    progressDotActive: {
        backgroundColor: "#FF6B00",
        shadowColor: "#FF6B00", shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5, shadowRadius: 6, elevation: 4,
    },
    progressLine: {
        flex: 1, height: 2, borderRadius: 1,
        backgroundColor: "#E5E5EA", marginHorizontal: 4,
    },
    progressLineDone: { backgroundColor: "#34C759" },
    progressLabels: {
        flexDirection: "row", justifyContent: "space-between", marginBottom: 14,
    },
    progressLabel: {
        fontSize: 9, color: "#8E8E93", fontWeight: "600",
        letterSpacing: 0.3, width: 50, textAlign: "center",
    },

    // Route card
    routeCard: {
        backgroundColor: "#F9F9FB", borderRadius: 14,
        borderWidth: 1, borderColor: "#E5E5EA",
        padding: 14, marginBottom: 12,
    },
    routeRow: { flexDirection: "row", alignItems: "center" },
    routeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
    routeConnector: {
        width: 1.5, height: 14, backgroundColor: "#C7C7CC",
        marginLeft: 4, marginVertical: 3,
    },
    routeInfo: { flex: 1 },
    routeRoleLabel: {
        fontSize: 9, fontWeight: "700", color: "#8E8E93",
        letterSpacing: 1, marginBottom: 1,
    },
    routeAddr: { fontSize: 13, fontWeight: "500", color: "#1C1C1E" },

    // Contacts
    contactRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
    contactCard: {
        flex: 1, backgroundColor: "#F9F9FB",
        borderRadius: 12, borderWidth: 1, borderColor: "#E5E5EA",
        padding: 12,
    },
    contactRole:  {
        fontSize: 9, fontWeight: "700", color: "#8E8E93",
        letterSpacing: 1, marginBottom: 4,
    },
    contactName:  { fontSize: 13, fontWeight: "600", color: "#1C1C1E", marginBottom: 8 },
    callBtn: {
        backgroundColor: "#FFF3E8", borderRadius: 8,
        paddingVertical: 6, paddingHorizontal: 10,
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        borderWidth: 1, borderColor: "#FFD5A8", gap: 6,
    },
    callBtnText: { fontSize: 12, fontWeight: "600", color: "#FF6B00" },

    // Error
    errorBanner: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between", marginBottom: 12,
        backgroundColor: "#FFF0EF", borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: 8,
        borderWidth: 1, borderColor: "rgba(255,59,48,0.2)",
    },
    errorText:    { flex: 1, fontSize: 12, color: "#FF3B30", fontWeight: "500" },
    errorDismiss: { fontSize: 14, color: "#8E8E93", marginLeft: 8 },

    // CTA
    ctaBtn: {
        height: 56, borderRadius: 16,
        alignItems: "center", justifyContent: "center",
        marginBottom: 10,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28, shadowRadius: 12, elevation: 8,
    },
    ctaBtnDisabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
    ctaBtnText: { fontSize: 17, fontWeight: "800", color: "#FFF", letterSpacing: -0.3 },

    // Report
    reportBtn: {
        alignItems: "center", paddingVertical: 12,
        borderRadius: 12, borderWidth: 1,
        borderColor: "rgba(255,59,48,0.3)",
        backgroundColor: "#FFF0EF",
        flexDirection: "row", justifyContent: "center",
    },
    reportBtnText: { fontSize: 14, fontWeight: "600", color: "#FF3B30" },

    // Modals
    modalOverlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.4)",
        alignItems: "center", justifyContent: "flex-end",
    },
    reportModal: {
        width: "100%", backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 24,
        borderTopWidth: StyleSheet.hairlineWidth, borderColor: "#E5E5EA",
    },
    reportTitle:    { fontSize: 20, fontWeight: "800", color: "#1C1C1E", marginBottom: 6 },
    reportSubtitle: { fontSize: 13, color: "#8E8E93", marginBottom: 20, lineHeight: 18 },
    reportOption: {
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA",
    },
    reportOptionText: { fontSize: 15, color: "#1C1C1E", fontWeight: "500" },
    reportClose: {
        marginTop: 16, alignItems: "center",
        paddingVertical: 14, backgroundColor: "#F2F2F7", borderRadius: 14,
    },
    reportCloseText: { fontSize: 15, fontWeight: "700", color: "#8E8E93" },

    // Complete modal
    completeModal: {
        width: 300, backgroundColor: "#FFFFFF",
        borderRadius: 28, padding: 32, alignItems: "center",
        shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12, shadowRadius: 20, elevation: 10,
        marginBottom: 60,
    },
    completeIconCircle: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: "#34C759",
        alignItems: "center", justifyContent: "center",
        marginBottom: 16,
        shadowColor: "#34C759", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
    },
    completeTitle:     { fontSize: 24, fontWeight: "800", color: "#1C1C1E", marginBottom: 10, letterSpacing: -0.5 },
    completeSubtitle:  { fontSize: 14, color: "#8E8E93", textAlign: "center", lineHeight: 20, marginBottom: 20 },
    completeStats: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#F2F2F7", borderRadius: 14,
        paddingHorizontal: 24, paddingVertical: 14,
        borderWidth: 1, borderColor: "#E5E5EA", gap: 24,
    },
    completeStat:        { alignItems: "center" },
    completeStatValue:   { fontSize: 22, fontWeight: "800", color: "#1C1C1E" },
    completeStatLabel:   { fontSize: 11, color: "#8E8E93", marginTop: 2 },
    completeStatDivider: { width: 1, height: 32, backgroundColor: "#E5E5EA" },
});