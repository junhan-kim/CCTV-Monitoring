export const MAP_CONSTANTS = {
  CCTV_MARKER_IMAGE_URL: '/images/cctv-camera.png',
  CCTV_MARKER_SIZE: {
    width: 30,
    height: 30,
  },
  DEFAULT_CENTER: {
    lat: 37.5665,
    lng: 126.9780,
  },
  DEFAULT_ZOOM_LEVEL: 3,
  GEOLOCATION_OPTIONS: {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  },
} as const;
