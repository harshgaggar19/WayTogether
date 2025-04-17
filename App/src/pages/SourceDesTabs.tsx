import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../src/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mapdisplay } from "@/components/Mapdisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser,SignedIn } from "@clerk/clerk-react";
import { toast } from "sonner";

interface FormData {
	from: string;
	to: string;
}

export function SourceDesTabs() {
	const navigate = useNavigate();
	const {user} = useUser();
	const [submitting, setSubmitting] = useState(false);
	const [formData, setFormData] = useState<FormData>({ from: "", to: "" });
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [selectedField, setSelectedField] = useState<"from" | "to" | "">("");
	const [sourceCoords, setSourceCoords] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const [destinationCoords, setDestinationCoords] = useState<{
		lat: number;
		lng: number;
	} | null>(null);

	const [userLocation, setUserLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	
	const backend_url = import.meta.env.VITE_BACKEND_URL;

	//get user's current location using geolocation API
	useEffect(() => {
		const getLocation = () => {
			if (!navigator.geolocation) {
				console.log("Geolocation is not supported by your browser.");
				return;
			}

			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					setUserLocation({ lat: latitude, lng: longitude });
				},
				(err) => {
					console.log("Error:", err);
				},
				{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
			);
		};

		getLocation();
	}, []);

	//get places suggestions
	const fetchPlaces = async (input: string) => {
		const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
		const apiUrl = "https://places.googleapis.com/v1/places:autocomplete";

		const requestBody = {
			input,
			locationBias: {
				circle: {
					center: {
						latitude: userLocation?.lat || 18.4575,
						longitude: userLocation?.lng || 73.8508,
					},
					radius: 50000.0,
				},
			},
		};

		try {
			const response = await fetch(apiUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Goog-Api-Key": apiKey,
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Error response:", errorData);
				throw new Error(errorData.error?.message || "Failed to fetch places");
			}

			const data = await response.json();
			const placeNames = data.suggestions.map(
				(place: any) => place.placePrediction.text.text
			);
			setSuggestions(placeNames);
			console.log("Places data:", data);
			return data;
		} catch (error) {
			console.error("Error fetching places:", error);
			return null;
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		setFormData((prev) => ({ ...prev, [id]: value }));
		setSelectedField(id as "from" | "to");

		if (value.trim().length > 2) {
			fetchPlaces(value);
		} else {
			setSuggestions([]);
		}
	};

	const fetchCoordinates = async (placeName: string, isSource: boolean) => {
		const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
			placeName
		)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;

		try {
			const response = await fetch(geocodeUrl);
			const data = await response.json();
			if (data.results && data.results.length > 0) {
				const location = data.results[0].geometry.location;
				isSource ? setSourceCoords(location) : setDestinationCoords(location);
			} else {
				console.error("Location not found");
			}
		} catch (error) {
			console.error("Error fetching coordinates:", error);
		}
	};

	const handleSuggestionClick = (place: string) => {
		setFormData((prev) => ({ ...prev, [selectedField]: place }));
		setSuggestions([]);
		fetchCoordinates(place, selectedField === "from");
	};

	const handleSubmit = async () => {
		// console.log(sourceCoords,destinationCoords)
		
		console.log(formData,sourceCoords,destinationCoords,user?.id);
		try {
			setSubmitting(true);
			const response = await axios.post(
				`${backend_url}/users/find-match`,
				{
					from: sourceCoords,
					to: destinationCoords,
					fromName: formData.from,
					toName: formData.to,
					clerkUserId: user?.id,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			// const data = await response.json();
			console.log("Response from backend:", response);
			if (response.status == 200) {
				localStorage.setItem(
					"matchMessage",
					JSON.stringify({
						from: sourceCoords,
						to: destinationCoords,
						fromName: formData.from,
						toName: formData.to,
						clerkUserId: user?.id,
					})
				);
				navigate("/matched-users");
			} else {
				toast.error(response.data.message);
			}
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				// Axios-specific error
				console.error("Axios error:", error.response?.data || error.message);
				toast.error(error.response?.data?.message || "Failed to submit data");
			} else if (error instanceof Error) {
				// General JavaScript error
				console.error("General error:", error.message);
				toast.error(error.message || "An unexpected error occurred");
			} else {
				// Unknown error type
				console.error("Unexpected error:", error);
				toast.error("An unknown error occurred");
			}
		}
	};

	return (
		<div className="relative w-full h-screen">
			{/* Map Background */}
			<div className="absolute inset-0 z-0">
				<Mapdisplay
					userLocation={userLocation}
					source={sourceCoords}
					destination={destinationCoords}
				/>
			</div>

			{/* Bottom Tab Section */}
			<div className="absolute bottom-0 w-full z-10 bg-white rounded-t-2xl shadow-lg p-4">
				<Tabs defaultValue="from" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="from">From</TabsTrigger>
						<TabsTrigger value="to">To</TabsTrigger>
					</TabsList>

					<TabsContent value="from">
						<Card>
							<CardHeader>
								<CardTitle>From</CardTitle>
								<CardDescription>Enter Source Destination.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2 relative">
								<Input
									id="from"
									value={formData.from}
									onChange={handleChange}
									placeholder="Enter source"
								/>
								{selectedField === "from" && suggestions.length > 0 && (
									<div
										className="absolute bottom-full left-0 w-full bg-white border shadow-md rounded-md z-10
			max-h-60 overflow-y-auto" 
									>
										{suggestions.map((place, index) => (
											<div
												key={index}
												className="p-2 cursor-pointer hover:bg-gray-100 "
												onClick={() => handleSuggestionClick(place)}
											>
												{place}
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="to">
						<Card>
							<CardHeader>
								<CardTitle>To</CardTitle>
								<CardDescription>Enter Destination.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2 relative">
								<Input
									id="to"
									value={formData.to}
									onChange={handleChange}
									placeholder="Enter destination"
								/>
								{selectedField === "to" && suggestions.length > 0 && (
									<div className="absolute bottom-full left-0 w-full bg-white border shadow-md rounded-md z-10">
										{suggestions.map((place, index) => (
											<div
												key={index}
												className="p-2 cursor-pointer hover:bg-gray-100"
												onClick={() => handleSuggestionClick(place)}
											>
												{place}
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<Button className="mt-4 w-full" onClick={handleSubmit}>
						{submitting? "Submitting": "Submit" }
					</Button>
				</Tabs>
			</div>
		</div>
	);
}
