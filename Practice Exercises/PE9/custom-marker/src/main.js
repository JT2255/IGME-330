export function init() {
    mapboxgl.accessToken = 'pk.eyJ1Ijoiamt0MTg4NiIsImEiOiJjbHVoN3VkcmcyZDR4MmxxdGhqcnl5d2N3In0.zPS6eN-Ghapu57G3hA2FsA';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-96, 37.8],
        zoom: 3
    });

    // code from the next step will go here!
    const geojson = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [-77.032, 38.913]
                },
                properties: {
                    title: 'Mapbox',
                    description: 'Washington, D.C.'
                }
            },
            {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [-122.414, 37.776]
                },
                properties: {
                    title: 'Mapbox',
                    description: 'San Francisco, California'
                }
            },
            {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [-77.67523647246445, 43.08433175351456]
                },
                properties: {
                    title: 'RIT',
                    description: 'Rochester, NY'
                }
            }
        ]
    };

    // add markers to map
    for (const feature of geojson.features) {
        // create a HTML element for each feature
        const el = document.createElement('div');
        el.className = 'marker';

        // make a marker for each feature and add to the map
        new mapboxgl.Marker(el).setLngLat(feature.geometry.coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`))
            .addTo(map);
    }
}