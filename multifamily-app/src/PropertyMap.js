import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PropertyMap = ({ properties }) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const [status, setStatus] = useState('Loading properties...');
  const markersRef = useRef([]);

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Initialize map
    const initMap = async () => {
      try {
        setStatus('Creating map...');
        
        // If map exists, remove it first to prevent duplicates
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
        }

        // Clear existing markers
        markersRef.current.forEach(marker => {
          if (marker) marker.remove();
        });
        markersRef.current = [];

        // Create new map
        const map = L.map(mapRef.current, {
          center: [35.7796, -78.6382], // North Carolina center
          zoom: 6,
          attributionControl: false
        });
        
        leafletMapRef.current = map;

        // Add tile layer (map background)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add attribution in a more controlled way
        L.control.attribution({
          position: 'bottomright',
          prefix: false
        }).addAttribution('© OpenStreetMap contributors').addTo(map);

        if (properties && properties.length > 0) {
          const bounds = L.latLngBounds();
          let markersAdded = 0;

          // Process each property
          for (const property of properties) {
            try {
              // Check if property has lat/lng
              if (property.lat && property.lng) {
                // Create custom marker icon
                const markerIcon = L.divIcon({
                  className: 'custom-marker-icon',
                  html: `<div style="background-color: #06b6d4; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">${property.units}</div>`,
                  iconSize: [30, 30],
                  iconAnchor: [15, 15]
                });

                // Create marker
                const marker = L.marker([property.lat, property.lng], { icon: markerIcon }).addTo(map);
                
                // Create popup content
                const popupContent = `
                  <div style="padding: 12px; font-family: Arial, sans-serif; max-width: 280px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${property.name}</h3>
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                      📍 ${property.address}
                    </p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
                      <div style="background: #f3f4f6; padding: 6px; border-radius: 4px; text-align: center;">
                        <div style="font-weight: bold; color: #10b981; font-size: 14px;">${property.units}</div>
                        <div style="color: #6b7280; font-size: 11px;">Units</div>
                      </div>
                      <div style="background: #f3f4f6; padding: 6px; border-radius: 4px; text-align: center;">
                        <div style="font-weight: bold; color: #06b6d4; font-size: 14px;">$${(property.purchasePrice/1000).toFixed(0)}K</div>
                        <div style="color: #6b7280; font-size: 11px;">Price</div>
                      </div>
                      <div style="background: #f3f4f6; padding: 6px; border-radius: 4px; text-align: center;">
                        <div style="font-weight: bold; color: #8b5cf6; font-size: 14px;">${property.capRate?.toFixed(2) || '0.00'}%</div>
                        <div style="color: #6b7280; font-size: 11px;">Cap Rate</div>
                      </div>
                      <div style="background: #f3f4f6; padding: 6px; border-radius: 4px; text-align: center;">
                        <div style="font-weight: bold; color: #f59e0b; font-size: 14px;">${property.cashOnCash?.toFixed(2) || '0.00'}%</div>
                        <div style="color: #6b7280; font-size: 11px;">Cash on Cash</div>
                      </div>
                    </div>
                    <div style="margin-top: 8px; padding: 6px; background: #eff6ff; border-radius: 4px; text-align: center;">
                      <div style="font-size: 11px; color: #6b7280;">Status</div>
                      <div style="font-weight: bold; color: #2563eb;">${property.status}</div>
                    </div>
                  </div>
                `;

                // Bind popup to marker
                marker.bindPopup(popupContent);

                // Extend bounds
                bounds.extend([property.lat, property.lng]);
                markersAdded++;
                
                // Save marker reference for cleanup
                markersRef.current.push(marker);

              } else if (property.address) {
                // For properties without lat/lng but with address, you could:
                // 1. Use a 3rd party geocoding service
                // 2. Show a warning and skip this property
                console.warn(`Property ${property.name} has address but no coordinates:`, property.address);
              }
            } catch (error) {
              console.warn(`Error processing property ${property.name}:`, error);
            }
          }

          // Fit map to show all markers
          if (markersAdded > 0) {
            map.fitBounds(bounds, { padding: [30, 30] });
            
            // Ensure reasonable zoom level
            if (map.getZoom() > 15) {
              map.setZoom(15);
            }
          }

          setStatus(`Map loaded with ${markersAdded} properties!`);
        } else {
          setStatus('Map loaded - no properties to display');
        }

      } catch (error) {
        console.error('Error creating map:', error);
        setStatus(`Map error: ${error.message}`);
      }
    };

    if (mapRef.current) {
      initMap();
    }

    // Cleanup
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }
    };
  }, [properties]);

  return (
    <div style={{ position: 'relative' }}>
      <p style={{ color: '#94a3b8', marginBottom: '12px', fontSize: '0.875rem' }}>
        Status: {status}
      </p>
      <div 
        ref={mapRef} 
        style={{ 
          height: '450px', 
          width: '100%', 
          borderRadius: '8px',
          background: '#374151',
          position: 'relative'
        }} 
      />
      <style>{`
        .leaflet-container {
          height: 100%;
          width: 100%;
          border-radius: 8px;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
        .custom-marker-icon {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default PropertyMap;