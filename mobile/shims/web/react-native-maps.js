import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

export const Marker = ({ children, title, description, coordinate, onPress }) => (
  <View style={styles.markerContainer} onClick={onPress}>
    {children || (
      <View style={styles.defaultMarker}>
        <Text style={styles.markerText}>📍</Text>
      </View>
    )}
  </View>
);

export const Callout = ({ children }) => (
  <View style={styles.callout}>{children}</View>
);

export const Polyline = () => null;
export const Polygon = () => null;
export const Circle = () => null;

const MapView = React.forwardRef(({ style, initialRegion, region, children, onRegionChangeComplete }, ref) => {
  const currentRegion = region || initialRegion || {
    latitude: 16.0544,
    longitude: 108.2022,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${currentRegion.longitude - 0.04}%2C${currentRegion.latitude - 0.03}%2C${currentRegion.longitude + 0.04}%2C${currentRegion.latitude + 0.03}&layer=mapnik&marker=${currentRegion.latitude}%2C${currentRegion.longitude}`;

  return (
    <View style={[styles.container, style]}>
      <iframe
        title="Bản đồ LocalGo"
        src={osmUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 0,
          filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)',
        }}
      />
      <View style={styles.overlayContent} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0f172a',
  },
  overlayContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  markerContainer: {
    position: 'absolute',
    cursor: 'pointer',
  },
  defaultMarker: {
    padding: 4,
  },
  markerText: {
    fontSize: 24,
  },
  callout: {
    backgroundColor: '#1e293b',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
});

export default MapView;
