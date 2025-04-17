/// <reference types="google.maps" />
import { useEffect, useRef } from "react";

interface MatchPageMapProps {
	source: { lat: number; lng: number } | null;
	stop1: { lat: number; lng: number } | null;
	stop2: { lat: number; lng: number } | null;
	destination: { lat: number; lng: number } | null;
}

export function MatchPageMap({
	source,
	stop1,
	stop2,
	destination,
}: MatchPageMapProps) {
	const mapRef = useRef<HTMLDivElement>(null);

	// Helper function to validate coordinates
	const isValidLatLng = (
		point: { lat: number; lng: number } | null
	): point is { lat: number; lng: number } => {
		return (
			point !== null &&
			typeof point.lat === "number" &&
			typeof point.lng === "number" &&
			!isNaN(point.lat) &&
			!isNaN(point.lng)
		);
	};

	useEffect(() => {
		if (!window.google) {
			console.error("Google Maps API is not loaded.");
			return;
		}
		if (!mapRef.current) {
			console.error("Map container is not available.");
			return;
		}

		// Ensure at least one valid coordinate is available
		const defaultLocation = { lat: 18.5204, lng: 73.8567 }; // Pune, India
		const center = isValidLatLng(source)
			? source
			: isValidLatLng(destination)
			? destination
			: isValidLatLng(stop1)
			? stop1
			: isValidLatLng(stop2)
			? stop2
			: defaultLocation;

		const map = new google.maps.Map(mapRef.current, {
			center,
			zoom: 12,
			disableDefaultUI: true,
		});

		// Function to add markers
		const addMarker = (
			position: { lat: number; lng: number },
			title: string
		) => {
			const marker = new google.maps.Marker({
				position,
				map,
				title,
			});

			const infoWindow = new google.maps.InfoWindow({
				content: `<div style="padding:5px;"><strong>${title}</strong></div>`,
			});

			// Show tooltip when clicking on the marker
			marker.addListener("click", () => {
				infoWindow.open(map, marker);
			});
		};

		if (source) addMarker(source, "Source");
		if (stop1) addMarker(stop1, "Stop 1");
        if (stop2) addMarker(stop2, "Stop 2");
        if (destination) addMarker(destination, "Destination");

		// Function to draw route
		const drawRoute = (
			origin: { lat: number; lng: number } | null,
			destination: { lat: number; lng: number } | null
		) => {
			if (!isValidLatLng(origin) || !isValidLatLng(destination)) {
				console.warn("Skipping invalid route", origin, destination);
				return;
			}

			const directionsService = new google.maps.DirectionsService();
			const directionsRenderer = new google.maps.DirectionsRenderer({
				map,
				suppressMarkers: true, // Prevents Google Maps default markers
				polylineOptions: {
					strokeColor: "#4285F4", // Blue route
					strokeOpacity: 0.8,
					strokeWeight: 5,
				},
			});

			directionsService.route(
				{
					origin,
					destination,
					travelMode: google.maps.TravelMode.DRIVING,
				},
				(result, status) => {
					if (status === google.maps.DirectionsStatus.OK) {
						directionsRenderer.setDirections(result);
					} else {
						console.error("Directions request failed due to " + status);
					}
				}
			);
		};

		// Draw Routes
		if (
			isValidLatLng(source) &&
			isValidLatLng(stop1) &&
			isValidLatLng(stop2) &&
			isValidLatLng(destination)
		) {
			drawRoute(source, stop1);
			drawRoute(stop1, stop2);
			drawRoute(stop2, destination);
		} else if (
			isValidLatLng(source) &&
			isValidLatLng(stop1) &&
			isValidLatLng(destination)
		) {
			drawRoute(source, stop1);
			drawRoute(stop1, destination);
		} else if (isValidLatLng(source) && isValidLatLng(destination)) {
			drawRoute(source, destination);
		}
	}, [source, stop1, stop2, destination]);

	return <div ref={mapRef} className="w-full h-full relative" />;
}
