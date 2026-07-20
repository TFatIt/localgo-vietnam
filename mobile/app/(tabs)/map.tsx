import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import { placesService } from '../../services/places.service';
import { Colors, Typography, Spacing, BorderRadius, CategoryConfig } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const MAP_FILTERS = [
  { key: 'all', label: 'Tất cả', emoji: '📍' },
  { key: 'beach', label: 'Biển', emoji: '🏖️' },
  { key: 'mountain', label: 'Núi', emoji: '⛰️' },
  { key: 'cafe', label: 'Cà phê', emoji: '☕' },
  { key: 'restaurant', label: 'Ăn uống', emoji: '🍜' },
  { key: 'hotel', label: 'Lưu trú', emoji: '🏨' },
];

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a2235' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a2235' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState<Record<string, unknown> | null>(null);
  const [region, setRegion] = useState({
    latitude: 14.0583,
    longitude: 108.2772,
    latitudeDelta: 10,
    longitudeDelta: 10,
  });

  const { data: nearbyData } = useQuery({
    queryKey: ['map-nearby', userLocation?.lat, userLocation?.lng, activeFilter],
    queryFn: () => placesService.getNearby(
      userLocation?.lat || 14.0583,
      userLocation?.lng || 108.2772,
      {
        radius: 50,
        limit: 50,
        ...(activeFilter !== 'all' ? { category: activeFilter } : {}),
      }
    ),
    enabled: true,
  });

  const places = (nearbyData?.data?.places || MOCK_MAP_PLACES) as Record<string, unknown>[];

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = location.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setRegion({ latitude, longitude, latitudeDelta: 0.1, longitudeDelta: 0.1 });
        mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.1, longitudeDelta: 0.1 }, 800);
      }
    })();
  }, []);

  const goToCurrentLocation = () => {
    if (userLocation) {
      mapRef.current?.animateToRegion({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 600);
    } else {
      Alert.alert('Vị trí', 'Chưa lấy được vị trí của bạn.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Filter pills on top of map */}
      <View style={styles.filterOverlay}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {MAP_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterPill,
                activeFilter === filter.key && styles.filterPillActive,
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text style={styles.filterEmoji}>{filter.emoji}</Text>
              <Text style={[
                styles.filterLabel,
                activeFilter === filter.key && { color: '#fff' },
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        customMapStyle={DARK_MAP_STYLE}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        onPress={() => setSelectedPlace(null)}
      >
        {places.map((place, i) => {
          const coords = place.location as { coordinates?: [number, number] };
          if (!coords?.coordinates) return null;
          const [lng, lat] = coords.coordinates;
          const catConfig = CategoryConfig[place.category as string];

          return (
            <Marker
              key={(place._id as string) || i}
              coordinate={{ latitude: lat, longitude: lng }}
              onPress={() => setSelectedPlace(place)}
            >
              <View style={[
                styles.markerContainer,
                { borderColor: catConfig?.color || Colors.primary },
              ]}>
                <Text style={styles.markerEmoji}>{catConfig?.emoji || '📍'}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Location button */}
      <TouchableOpacity style={styles.locationBtn} onPress={goToCurrentLocation}>
        <Text style={{ fontSize: 20 }}>📡</Text>
      </TouchableOpacity>

      {/* AI Chat button */}
      <TouchableOpacity
        style={styles.aiBtn}
        onPress={() => router.push('/ai-chat')}
      >
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.aiBtnGradient}>
          <Text style={{ fontSize: 18 }}>🤖</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Selected place bottom sheet */}
      {selectedPlace && (
        <View style={styles.placeSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetContent}>
            <View style={styles.sheetInfo}>
              <Text style={styles.sheetName}>{selectedPlace.name as string}</Text>
              <Text style={styles.sheetLocation}>📍 {selectedPlace.province as string}</Text>
              <View style={styles.sheetMeta}>
                <Text style={styles.sheetRating}>⭐ {(selectedPlace.communityRating as number || 0).toFixed(1)}</Text>
                <Text style={styles.sheetCheckins}>• {selectedPlace.checkinCount as number || 0} check-in</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.sheetBtn}
              onPress={() => router.push(`/place/${selectedPlace._id}`)}
            >
              <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.sheetBtnGradient}>
                <Text style={styles.sheetBtnText}>Xem chi tiết →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const MOCK_MAP_PLACES: Record<string, unknown>[] = [
  { _id: '1', name: 'Vịnh Hạ Long', province: 'Quảng Ninh', category: 'national_park', communityRating: 4.9, checkinCount: 15420, location: { coordinates: [107.0352, 20.9101] } },
  { _id: '2', name: 'Phố cổ Hội An', province: 'Quảng Nam', category: 'historical', communityRating: 4.8, checkinCount: 12300, location: { coordinates: [108.3326, 15.8801] } },
  { _id: '3', name: 'Đảo Phú Quốc', province: 'Kiên Giang', category: 'beach', communityRating: 4.8, checkinCount: 11200, location: { coordinates: [103.9838, 10.2899] } },
  { _id: '4', name: 'Đà Lạt', province: 'Lâm Đồng', category: 'mountain', communityRating: 4.6, checkinCount: 9800, location: { coordinates: [108.4582, 11.9465] } },
  { _id: '5', name: 'Sapa', province: 'Lào Cai', category: 'mountain', communityRating: 4.7, checkinCount: 8900, location: { coordinates: [103.8438, 22.3361] } },
  { _id: '6', name: 'Ninh Bình', province: 'Ninh Bình', category: 'historical', communityRating: 4.7, checkinCount: 7600, location: { coordinates: [105.9745, 20.2506] } },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filterOverlay: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  filterRow: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(10, 14, 26, 0.9)',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterEmoji: { fontSize: 14 },
  filterLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 14, 26, 0.85)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  markerEmoji: { fontSize: 18 },
  locationBtn: {
    position: 'absolute',
    right: Spacing.base,
    bottom: 200,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(10, 14, 26, 0.9)',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  aiBtn: {
    position: 'absolute',
    right: Spacing.base,
    bottom: 260,
  },
  aiBtnGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  placeSheet: {
    position: 'absolute',
    bottom: 80,
    left: Spacing.base,
    right: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sheetInfo: { flex: 1 },
  sheetName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
  },
  sheetLocation: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 2,
  },
  sheetMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.xs },
  sheetRating: { color: Colors.star, fontSize: Typography.fontSize.sm },
  sheetCheckins: { color: Colors.textTertiary, fontSize: Typography.fontSize.sm },
  sheetBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  sheetBtnGradient: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2 },
  sheetBtnText: {
    color: '#fff',
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    whiteSpace: 'nowrap',
  },
});
