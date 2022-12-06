// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com
mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/danilo-99/clbatww5x000015mttcd1fyuj', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 15, // starting zoom
});
map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({
        offset: 25
    })
        .setHTML(`<p class="mt-3">${campground.title}</p>`))
    .addTo(map);