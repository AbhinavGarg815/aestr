import { useEffect, useRef, useState } from "react";

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

const MapPicker = ({ value, onChange }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [error, setError] = useState("");

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("Missing VITE_GOOGLE_MAPS_API_KEY");
      return;
    }

    const initMap = async () => {
      try {
        await loadScript(`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`);
        if (!mapRef.current || !window.google?.maps) {
          return;
        }

        const initial = value?.lat && value?.lng ? value : { lat: 20.5937, lng: 78.9629 };
        const map = new window.google.maps.Map(mapRef.current, {
          center: initial,
          zoom: value?.lat && value?.lng ? 14 : 5,
          mapTypeControl: false,
          fullscreenControl: false
        });

        const marker = new window.google.maps.Marker({
          position: initial,
          map,
          draggable: true
        });

        const geocoder = new window.google.maps.Geocoder();

        const updateLocation = (position) => {
          const location = {
            lat: position.lat(),
            lng: position.lng()
          };

          geocoder.geocode({ location }, (results, status) => {
            const address =
              status === "OK" && results && results.length > 0
                ? results[0].formatted_address
                : `Lat ${location.lat.toFixed(5)}, Lng ${location.lng.toFixed(5)}`;

            if (inputRef.current) {
              inputRef.current.value = address;
            }

            onChangeRef.current({
              lat: location.lat,
              lng: location.lng,
              text: address
            });
          });
        };

        map.addListener("click", (event) => {
          marker.setPosition(event.latLng);
          updateLocation(event.latLng);
        });

        marker.addListener("dragend", (event) => {
          updateLocation(event.latLng);
        });

        if (inputRef.current && window.google?.maps?.places) {
          const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            fields: ["geometry", "formatted_address"]
          });
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place?.geometry?.location) {
              setError("No location details available");
              return;
            }
            marker.setPosition(place.geometry.location);
            map.setCenter(place.geometry.location);
            map.setZoom(16);
            if (inputRef.current && place.formatted_address) {
              inputRef.current.value = place.formatted_address;
            }
            onChangeRef.current({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              text: place.formatted_address || ""
            });
          });
          autocompleteRef.current = autocomplete;
        }

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } catch (err) {
        setError(err?.message || "Unable to load Google Maps");
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) {
      return;
    }
    if (value?.lat && value?.lng) {
      const position = { lat: value.lat, lng: value.lng };
      markerRef.current.setPosition(position);
      mapInstanceRef.current.setCenter(position);
      mapInstanceRef.current.setZoom(16);
    } else {
      markerRef.current.setPosition({ lat: 20.5937, lng: 78.9629 });
      mapInstanceRef.current.setCenter({ lat: 20.5937, lng: 78.9629 });
      mapInstanceRef.current.setZoom(5);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }, [value?.lat, value?.lng]);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        if (markerRef.current && mapInstanceRef.current) {
          markerRef.current.setPosition(coords);
          mapInstanceRef.current.setCenter(coords);
          mapInstanceRef.current.setZoom(16);
        }
        if (window.google?.maps) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: coords }, (results, status) => {
            const address =
              status === "OK" && results && results.length > 0
                ? results[0].formatted_address
                : `Lat ${coords.lat.toFixed(5)}, Lng ${coords.lng.toFixed(5)}`;
            if (inputRef.current) {
              inputRef.current.value = address;
            }
            onChangeRef.current({
              lat: coords.lat,
              lng: coords.lng,
              text: address
            });
          });
        }
      },
      () => setError("Unable to fetch current location")
    );
  };

  return (
    <div className="list">
      <div className="map-controls">
        <input
          ref={inputRef}
          className="map-input"
          placeholder="Search address"
          type="text"
        />
        <button className="button ghost" type="button" onClick={handleCurrentLocation}>
          Use current location
        </button>
      </div>
      <div className="map-canvas" ref={mapRef} />
      {/* {value?.text && <p className="muted">Pinned: {value.text}</p>} */}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

export default MapPicker;
