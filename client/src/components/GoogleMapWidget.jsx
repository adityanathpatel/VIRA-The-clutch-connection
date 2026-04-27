/**
 * GoogleMapWidget.jsx
 * ─────────────────────────────────────────────────────────────
 * Reusable Google Maps component with:
 *   • Places search autocomplete
 *   • Dark mode map styling
 *   • Current location detection
 *   • Dynamic markers with info windows
 *   • Graceful error handling
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  Autocomplete,
} from '@react-google-maps/api';

// ── Config ──────────────────────────────────────────────────
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Libraries loaded alongside the Maps JS API
const LIBRARIES = ['places'];

// Default center — Lucknow, India
const DEFAULT_CENTER = { lat: 26.8467, lng: 80.9462 };
const DEFAULT_ZOOM = 12;

// Map container sizing (responsive via CSS)
const containerStyle = { width: '100%', height: '100%' };

// ── Dark‑mode map styles ────────────────────────────────────
const DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'landscape', elementType: 'geometry.fill', stylers: [{ color: '#162a45' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e3a56' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#132e30' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
];

const LIGHT_STYLE = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

// ── Component ───────────────────────────────────────────────
export default function GoogleMapWidget({
  markers = [],            // [{ lat, lng, title, info }]
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  onMarkerClick,           // (marker, index) => void
  onMapClick,              // (latLng) => void
  darkMode = false,
  showSearch = true,
  showLocateMe = true,
  height = '100%',
}) {
  // ── Load the Google Maps JavaScript API ──
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [activeMarker, setActiveMarker] = useState(null);
  const [searchMarker, setSearchMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  // Sync if parent changes center/zoom
  useEffect(() => { setMapCenter(center); }, [center]);
  useEffect(() => { setMapZoom(zoom); }, [zoom]);

  // ── Callbacks ──
  const onLoad = useCallback((map) => { mapRef.current = map; }, []);
  const onUnmount = useCallback(() => { mapRef.current = null; }, []);

  const onAutoLoad = useCallback((ac) => { autocompleteRef.current = ac; }, []);

  /** When user selects a place from the autocomplete */
  const onPlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const newCenter = { lat, lng };

    setMapCenter(newCenter);
    setMapZoom(15);
    setSearchMarker({ lat, lng, title: place.name || 'Selected Location' });

    mapRef.current?.panTo(newCenter);
  }, []);

  /** Detect the user's current location */
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);
        setMapCenter(loc);
        setMapZoom(15);
        mapRef.current?.panTo(loc);
        setLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Unable to retrieve your location. Please check permissions.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleMapClick = useCallback(
    (e) => {
      setActiveMarker(null);
      if (onMapClick) {
        onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      }
    },
    [onMapClick]
  );

  // ── Error state ──
  if (loadError) {
    return (
      <div className="gmap-error" id="google-map-error">
        <div className="gmap-error-icon">⚠️</div>
        <h3>Map Failed to Load</h3>
        <p>
          {GOOGLE_MAPS_API_KEY
            ? 'There was a problem loading Google Maps. Please check your API key and enabled APIs.'
            : 'No Google Maps API key found. Add VITE_GOOGLE_MAPS_API_KEY to your .env file.'}
        </p>
      </div>
    );
  }

  // ── Loading state ──
  if (!isLoaded) {
    return (
      <div className="gmap-loading" id="google-map-loading">
        <div className="spinner" />
        <p>Loading Google Maps…</p>
      </div>
    );
  }

  // ── Map options ──
  const mapOptions = {
    styles: darkMode ? DARK_STYLE : LIGHT_STYLE,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    gestureHandling: 'greedy',
  };

  return (
    <div className={`gmap-wrapper ${darkMode ? 'gmap-dark' : ''}`} style={{ height }} id="google-map-widget">
      {/* ── Search Bar ── */}
      {showSearch && (
        <div className="gmap-search" id="gmap-search-box">
          <Autocomplete onLoad={onAutoLoad} onPlaceChanged={onPlaceChanged}>
            <input
              type="text"
              placeholder="🔍  Search a location…"
              className="gmap-search-input"
              id="gmap-search-input"
            />
          </Autocomplete>
        </div>
      )}

      {/* ── Locate Me Button ── */}
      {showLocateMe && (
        <button
          className="gmap-locate-btn"
          onClick={handleLocateMe}
          disabled={locating}
          title="Go to my location"
          id="gmap-locate-btn"
        >
          {locating ? (
            <span className="gmap-locate-spinner" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          )}
        </button>
      )}

      {/* ── Dark Mode Toggle indicator ── */}

      {/* ── The Map ── */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={mapZoom}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
      >
        {/* Task markers from parent */}
        {markers.map((marker, idx) => (
          <Marker
            key={`marker-${idx}`}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.title || `Location ${idx + 1}`}
            onClick={() => {
              setActiveMarker(idx);
              if (onMarkerClick) onMarkerClick(marker, idx);
            }}
            animation={window.google?.maps?.Animation?.DROP}
          >
            {activeMarker === idx && marker.info && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div className="gmap-info-window">
                  <strong>{marker.title}</strong>
                  <p>{marker.info}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {/* Marker placed by search */}
        {searchMarker && (
          <Marker
            position={{ lat: searchMarker.lat, lng: searchMarker.lng }}
            title={searchMarker.title}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            }}
          >
            <InfoWindow onCloseClick={() => setSearchMarker(null)}>
              <div className="gmap-info-window">
                <strong>{searchMarker.title}</strong>
              </div>
            </InfoWindow>
          </Marker>
        )}

        {/* Current‑location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            title="Your Location"
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
