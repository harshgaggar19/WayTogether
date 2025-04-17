export const toRadians = (deg) => {
	return deg * (Math.PI / 180);
};

export const haversine = (lat1, lon1, lat2, lon2) => {
	const R = 6371.0;
	const dLat = toRadians(lat2 - lat1);
	const dLon = toRadians(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRadians(lat1)) *
			Math.cos(toRadians(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
};
export const findUserWithinRadius = (userLocations, lat, lon, radius = 1) => {
	let matches = [];
	for (const user in userLocations) {
		const distance = haversine(
			lat,
			lon,
			userLocations[user].source.latitude,
			userLocations[user].source.longitude
		);
		if (distance <= radius) {
			console.log(`${user} is within ${radius} km radius.`);
			matches.push(user);
		}
	}
	return matches.length > 0 ? matches : null;
};


async function returnData(coordinates) {
	
	const query = await fetch(
		`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordinates}?geometries=geojson&access_token=pk.eyJ1IjoibWR0b3VzaWYwMDciLCJhIjoiY2x4dHplOGh4MWw3eTJqcXl4dWM5eHU2NiJ9.69lnpa9uRrPPxXUfhOPeyg`
	);

	const data = await query.json();
	console.log("Data : ",data);
	return data;
}

function create_string(a, b) {
	return `${a[0]},${a[1]};${b[0]},${b[1]}`;
}
function CostForUberGo(duration, distance) {
	let base = 42.0;
	let pricePerKM = 6.3;
	let pricePerMin = 1.58;
	let surge = false; //add on for trffic
	let cost = base + pricePerKM * distance + pricePerMin * duration;
	return cost;
}
function CostForUberAuto(duration, distance) {
	let baseFor4KM = 30;
	let pricePerKM = 7.75; //after 4 km per km
	let pricePerMin = 0.9;
	let surge = false; //add on for traffic
	let cost =
		distance <= 4
			? baseFor4KM + pricePerMin * duration
			: baseFor4KM + pricePerKM * (distance - 4) + pricePerMin * duration;
	return cost;
}

function CostForRoute(duration, distance) {
	console.log(
		"The cost for UberGo is: " + CostForUberGo(duration / 60, distance / 1000)
	);
	console.log(
		"The cost for UberAuto is: " +
			CostForUberAuto(duration / 60, distance / 1000)
	);
	return Math.min(
		CostForUberGo(duration / 60, distance / 1000),
		CostForUberAuto(duration / 60, distance / 1000)
	);
}

export const findMostOptimalRoute = async (sources, destination) => {
	let optimalSequence = [];
	let data1 = await returnData(
		create_string(sources[0], sources[1]) +
			";" +
			create_string(destination[0], destination[1])
	);
	let data2 = await returnData(
		create_string(sources[0], sources[1]) +
			";" +
			create_string(destination[1], destination[0])
	);

	let temp1 = data1.routes[0];
	let temp2 = data2.routes[0];
	// console.log(temp1, temp2);
	if (temp1.duration < temp2.duration) {
		optimalSequence = [sources[0], sources[1], destination[0], destination[1]];
		console.log("temp1--------", temp1);
		let cost = CostForRoute(temp1.duration, temp1.distance);
		console.log("cost", cost);

		return { sequence: optimalSequence, duration: temp1.duration, cost: cost };
	} else {
		optimalSequence = [sources[0], sources[1], destination[1], destination[0]];
		console.log("temp2--------", temp2);
		let cost = CostForRoute(temp2.duration, temp2.distance);
		console.log("cost", cost);
		return { sequence: optimalSequence, duration: temp2.duration, cost: cost };
	}

	// console.log(optimalSequence)
	return optimalSequence;
};

export const getRoutePoints = async (a, b) => {
	const query_b = await fetch(
		`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${create_string(
			a,
			b
		)}?geometries=geojson&access_token=${process.env.MAPBOX_ACCESS_TOKEN}`
	);
	const data_b = await query_b.json();
	// console.log(data_b);
	// const route_b = data_b.routes[0]?.geometry;
	if (!data_b || !data_b.routes || data_b.routes.length === 0) {
		console.error("No route data available:", data_b);
	} else {
		const route_b = data_b.routes[0].geometry;
	}
	// console.log(route_b);
	return route_b;
}