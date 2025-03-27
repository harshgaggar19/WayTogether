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
		`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordinates}?geometries=geojson&access_token=${process.env.MAPBOX_ACCESS_TOKEN}`
	);

	const data = await query.json();
	return data;
}

function create_string(a, b) {
	return `${a[0]},${a[1]};${b[0]},${b[1]}`;
}

export const findMostOptimalRoute = async(sources, destination) => {
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

	let temp1 = data1.routes[0].duration;
	let temp2 = data2.routes[0].duration;
// console.log(temp1, temp2);
	if (temp1 < temp2) {
		optimalSequence = [sources[0], sources[1], destination[0], destination[1]];
		return {sequence: optimalSequence, duration: temp1};
	} else {
		optimalSequence = [sources[0], sources[1], destination[1], destination[0]];
		return { sequence: optimalSequence, duration: temp2 };
	}

	// console.log(optimalSequence)
	return optimalSequence;
  
}


export const getRoutePoints = async (a, b) => {
	const query_b = await fetch(
		`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${create_string(
			a,
			b
		)}?geometries=geojson&access_token=${process.env.MAPBOX_ACCESS_TOKEN}`
	);
	const data_b = await query_b.json();
	// console.log(data_b);
	const route_b = data_b.routes[0].geometry;
	// console.log(route_b);
	return route_b;
}