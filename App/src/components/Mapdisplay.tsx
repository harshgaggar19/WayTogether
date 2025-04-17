/// <reference types="google.maps" />

import { useEffect, useRef } from "react";

interface MapDisplayProps {
	source: { lat: number; lng: number } | null;
	destination: { lat: number; lng: number } | null;
	userLocation: { lat: number; lng: number } | null;
}
type PointsType = {
	[key: string]: [number, number]; // Each key has an array of two numbers (lat, lng)
};

export function Mapdisplay({
	source,
	destination,
	userLocation,
}: MapDisplayProps) {
	const mapRef = useRef<HTMLDivElement>(null);
	// const [points, setPoints] = useState<PointsType>({});

	// useEffect(() => {
	// 	const response = fetch("http://localhost:8080/users/dummy-points")
	// 		.then((res) => res.json())
	// 		.then((data) => {
	// 			console.log(data)
	// 			setPoints(data || []);
	// 		})
	//  },[]);
		

	useEffect(() => {
		if (
			window.google &&
			mapRef.current &&
			(source || destination || userLocation)
		) {
			const map = new google.maps.Map(mapRef.current, {
				center: userLocation ||
					source ||
					destination || { lat: 18.4575, lng: 73.8508 },
				zoom: 12,
				disableDefaultUI: true,
			});

			// if (
			// 	points &&
			// 	points.swargate &&
			// 	Array.isArray(points.swargate) &&
			// 	points.swargate.length === 2
			// ) {
			// 	new google.maps.Marker({
			// 		position: { lat: points.swargate[0], lng: points.swargate[1] },
			// 		map,
			// 		title: "",
			// 	});
			// } else {
			// 	console.error("Invalid or missing coordinates for Swargate:", points);
			// }
			// User Location Marker
			if (userLocation) {
				new google.maps.Marker({
					position: userLocation,
					map,
					icon: {
						path: google.maps.SymbolPath.CIRCLE,
						scale: 7,
						fillColor: "#ff0000",
						fillOpacity: 1,
						strokeWeight: 2,
						strokeColor: "#000000",
					},
					title: "User Location",
				});
			}

			// Source Marker
			if (source) {
				new google.maps.Marker({
					position: source,
					map,
					title: "Source",
				});
			}

			// Destination Marker
			if (destination) {
				new google.maps.Marker({
					position: destination,
					map,
					title: "Destination",
				});
			}

			// Draw Actual Route with Directions API
			if (source && destination) {
				const directionsService = new google.maps.DirectionsService();
				const directionsRenderer = new google.maps.DirectionsRenderer({
					map: map,
					suppressMarkers: true, // Prevents Google Maps default markers
					polylineOptions: {
						strokeColor: "#4285F4", // Blue route
						strokeOpacity: 0.8,
						strokeWeight: 5,
					},
				});

				directionsService.route(
					{
						origin: source,
						destination: destination,
						travelMode: google.maps.TravelMode.DRIVING, // Change as needed
					},
					(result, status) => {
						if (status === google.maps.DirectionsStatus.OK) {
							directionsRenderer.setDirections(result);
						} else {
							console.error("Directions request failed due to " + status);
						}
					}
				);
			}
		}
	}, [userLocation, source, destination]);

	return <div ref={mapRef} className="w-full h-full relative" />;
}
