import * as map from "./map.js";
import * as ajax from "./ajax.js";
import * as storage from "./storage.js";

// I. Variables & constants
// NB - it's easy to get [longitude,latitude] coordinates with this tool: http://geojson.io/
const lnglatNYS = [-75.71615970715911, 43.025810763917775];
const lnglatUSA = [-98.5696, 39.8282];
let geojson;
let favoriteIds;
let currentParkId;


// II. Functions
const setupUI = () => {
	// NYS Zoom 5.2
	document.querySelector("#btn1").onclick = () => {
		map.setZoomLevel(5.2);
		map.setPitchAndBearing(0, 0);
		map.flyTo(lnglatNYS);
	};
	
	// NYS isometric view
	document.querySelector("#btn2").onclick = () => {
		map.setZoomLevel(5.5);
		map.setPitchAndBearing(45, 0);
		map.flyTo(lnglatNYS);
	};
	
	// World zoom 0
	document.querySelector("#btn3").onclick = () => {
		map.setZoomLevel(3);
		map.setPitchAndBearing(0, 0);
		map.flyTo(lnglatUSA);
	};

	if (Array.isArray(storage.readFromLocalStorage("jkt1886-NYState-Parks"))) {
		favoriteIds = storage.readFromLocalStorage("jkt1886-NYState-Parks");
	}
	else {
		favoriteIds = [];
	}

	refreshFavorites();
}

const init = () => {
	map.initMap(lnglatNYS);

	ajax.downloadFile("data/parks.geojson", (str) => {
		geojson = JSON.parse(str);
		console.log(geojson);
		map.addMarkersToMap(geojson, showFeatureDetails);
		setupUI();
	});
};

const showFeatureDetails = (id) => { 
	currentParkId = id;
	const feature = getFeatureById(id);

	//add button for favoriting parks
	const favButton = document.createElement("button");
	favButton.className = "button is-primary mr-1";
	favButton.id = "button-favorite";
	favButton.innerHTML = "Favorite";
	favButton.onclick = () => { addToFavorites(currentParkId); };

	//add button for deleting favorites
	const delButton = document.createElement("button");
	delButton.className = "button is-warning";
	delButton.id = "button-delete";
	delButton.innerHTML = "Delete";
	delButton.onclick = () => { deleteFavorite(currentParkId); };

	//populate park description
	document.querySelector("#details-1").innerHTML = `Info for ${feature.properties.title}`;
	document.querySelector("#details-2").innerHTML = `<b>Address:</b> ${feature.properties.address} <br> 
													  <b>Phone:</b> <a href="tel:${feature.properties.phone}">${feature.properties.phone}</a><br> 
													  <b>Website:</b> <a href="${feature.properties.url}">${feature.properties.url}</a><br><br>`;
	document.querySelector("#details-3").innerHTML = feature.properties.description;

	document.querySelector("#details-2").appendChild(favButton);
	document.querySelector("#details-2").appendChild(delButton);

	//if already favorited, disable favorite button and vice versa
	for (const ids of favoriteIds) {
		document.querySelector("#button-delete").disabled = true;
		document.querySelector("#button-favorite").disabled = false;

		if (ids == id) {
			document.querySelector("#button-favorite").disabled = true;
			document.querySelector("#button-delete").disabled = false;
			return;
		}	
	}
}

const getFeatureById = (id) => {
	return geojson.features.find((feature) => feature.id == id);
}

// update favorites container
const refreshFavorites = () => {
	const favoritesContainer = document.querySelector("#favorites-list");
	favoritesContainer.innerHTML = "";

	for (const id of favoriteIds) {
		favoritesContainer.appendChild(createFavoriteElement(id));
	}
}

// create new favorite park
const createFavoriteElement = (id) => {
	const feature = getFeatureById(id);
	const a = document.createElement("a");
	
	a.className = "panel-block";
	a.id = feature.id;
	a.onclick = () => {
		showFeatureDetails(a.id);
		map.setZoomLevel(6);
		map.flyTo(feature.geometry.coordinates);
	};

	a.innerHTML = `
		<span class="panel-icon">
			<i class="fas fa-map-pin"></i>
		</span>
		${feature.properties.title}
	`;

	return a;
}

// add currently selected park to favorites array and refresh container
const addToFavorites = (id) => {
	for (const ids of favoriteIds) {
		if (id == ids) { return; }
	}

	favoriteIds.push(id);
	storage.writeToLocalStorage("jkt1886-NYState-Parks", favoriteIds);
	refreshFavorites();
	showFeatureDetails(id);
}

// remove currently selected park from favorites and refresh container
const deleteFavorite = (id) => {
	const item = favoriteIds.indexOf(id);

	if (item > -1) {
		favoriteIds.splice(item, 1);
	}
	
	refreshFavorites();
	showFeatureDetails(id);
}

init();