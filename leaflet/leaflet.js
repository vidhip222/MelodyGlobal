// all this is just for debugging purposes, can safely ignore - since e is a circular structure, we need a custom stringifier to avoid infinite recursion
JSON.safeStringify = (obj, indent = 2) => {
    let cache = [];
    const retVal = JSON.stringify(
    obj,
    (key, value) =>
        typeof value === "object" && value !== null
        ? cache.includes(value)
            ? undefined // Duplicate reference found, discard key
            : cache.push(value) && value // Store value in our collection
        : value,
    indent
    );
    cache = null;
    return retVal;
};

// creates one massive geoJson file of the world - pangaea...
let theWorld = {
    "type":"FeatureCollection",
    "features": [],
    "style":{
        "stroke":"#000000",
        "fill":"#3498DB",
        "stroke-width":1,
        "fill-opacity":0.8
    }
}

// all countries that are currently shown and the one that is currently selected
const activeCountriesList = [
    ["China","mandopop"],["Brazil","brazil"],["Japan","j-pop"],["United Kingdom","british"],["France","french"],["Germany","german"],["India","indian"], ["Iran","iranian"], ["South Korea (Republic of Korea)","k-pop"], ["Malaysia","malay"], ["Philippines","philippines-opm"], ["Spain","spanish"], ["Sweden","swedish"], ["Turkey","turkish"], ["Nigeria", "nigerian"], ["South Africa", "south african"]
]
const activeCountries = new Map();
for (i = 0; i < activeCountriesList.length; i++){
    activeCountries.set(activeCountriesList[i][0], activeCountriesList[i][1]);
}

let selectedCountry = "";

/* tries all the genres and adds them into activeCountries
let all_music_types = [
    "Tech", "Pop", "Hip Hop", "Indie", "Metal", "Rock", "Jazz", "Blues", "Reggae", "Folk", "Traditional", "Punk"
]
for (j = 0; j < all_music_types.length; j++){
    type = all_music_types[j];
    console.log(type);
    let similar_genres = findSimilarGenres(type);
    console.log(similar_genres);
    for (country in similar_genres){
        if (!activeCountries.has(country)){
            activeCountries.set(country, []);
        }
        for (k = 0; k < similar_genres[country].length; k++){
            let thisGenre = similar_genres[country][k];
            if (!activeCountries.get(country).has(thisGenre)){
                activeCountries.get(country).push(similar_genres[country][k]);
            }
        }
    }
}
*/

theWorld.features = theWorld.features.concat(north_america_data.features);
theWorld.features = theWorld.features.concat(south_america_data.features);
theWorld.features = theWorld.features.concat(asia_data.features);
theWorld.features = theWorld.features.concat(australia_data.features);
theWorld.features = theWorld.features.concat(europe_data.features);
theWorld.features = theWorld.features.concat(africa_data.features);

// calculates the optimal zoom for the user's screen
let averageDimension = (window.innerHeight + window.innerWidth) / 2, optimalZoom = 0.30269 * Math.log2(averageDimension) - 0.52010; 

// initializes the empty map with no controls
let map = L.map('map', {
    center: [51.505, -0.09],
    minZoom: optimalZoom,
    maxZoom: 7,
    dragging: false,
    zoomControl: false,
    doubleClickZoom: false,
    scrollWheelZoom: false
});

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 8,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

map.setView([23.276495031663973, 12.121257773548779], optimalZoom);

//simple robin karp hash, uses the name of the country to randomize a color for it
function colorHash(name){
    let base = 233, mdl = 1000000007, hash = 0, place = 1, hex = 16777215 + 1;
    for (i = 0; i < name.length; i++){
        if (name.charAt(i) == ' ') continue;
        hash += (place * (name.charAt(i).charCodeAt()) % mdl);
        hash %= mdl;
        place = (place * base) % mdl;
        //console.log(`hash = ${hash}, base = ${base}, char = ${name.charAt(i).charCodeAt()}`);
    }
    hash %= hex;
    //console.log(name + " " + hash.toString(16).padStart(6, '0'));
    return "#" + hash.toString(16).padStart(6, '0');
}

// styles the inputted "feature" (the feature is basically a country)
function style(feature){
    let countryName = feature.properties.name;

    if (activeCountries.has(countryName)){
        return {
            fillColor: (countryName === selectedCountry ? darken(colorHash(countryName).substring(1)) : colorHash(countryName)),
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.3
        };
    } else {
        return {
            fillColor: (countryName === selectedCountry ? darken(colorHash(countryName).substring(1)) : colorHash(countryName)),
            weight: 0,
            opacity: 0,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0
        }
    }
}

// darkens each of the three colors (RGB) 
function darken(col){
    let R = col.substring(0, 2), G = col.substring(2, 4), B = col.substring(4, 6);
    // adds 22 to each pair in the hex - equivalent to adding 34 in decimal
    R = Math.min(255, parseInt(R, 16) + 34);
    G = Math.min(255, parseInt(G, 16) + 34);
    B = Math.min(255, parseInt(B, 16) + 34);
    //console.log(R.toString(16) + G.toString(16) + B.toString(16));
    return "#" + R.toString(16) + G.toString(16) + B.toString(16);
}

// what happens when you hover over this country
function highlightFeature(e){
    let country = e.target;

    // if this is not an active country, just skip it
    let countryName = country.feature.properties.name;

    //console.log(country); 

    if (activeCountries.has(countryName)){
        if (selectedCountry == countryName){
            country.setStyle({
                weight: 1,
                fillColor: country.options.fillColor,
                dashArray: '',
                fillOpacity: 0.8
            });
        } else {
            country.setStyle({
                weight: 1,
                fillColor: darken((country.options.fillColor).toString().substring(1)),
                dashArray: '',
                fillOpacity: 0.8
            });
        }
        

        country.bringToFront();
    }
}

// simply resets the style back to normal
function resetHighlight(e){
    original_world.resetStyle(e.target);
}   

function displaySidebar(country){
    document.getElementById("sidebar").style.display = "block";
    document.getElementById("name").innerHTML = country.feature.properties.name; 
    selectedCountry = "";
}

function hideSidebar(){
    document.getElementById("sidebar").style.display = "none";
    map.setView([23, 12.121257773548779], 2.9);
}

function zoomInCountry(e) {
    let country = e.target;
    let countryName = country.feature.properties.name;

    if (activeCountries.has(countryName)){ 
        selectedCountry = countryName;
        country.options.fillColor = "#" + darken(country.options.fillColor.substring(1));

        var north = Math.min(80, country.getBounds().getNorth());
        var south = Math.max(-80, country.getBounds().getSouth())
        var west = country.getBounds().getWest();
        var east = country.getBounds().getEast();
        var shift = (east - west) * 0.25;
        var corner1 = L.latLng(south, west - shift);
        var corner2 = L.latLng(north, east - shift);
        var bounds = L.latLngBounds(corner1, corner2);

        map.fitBounds(bounds);
        displaySidebar(country);
    }
}

// describes the interactivity of each country
function onEachFeature(feature, layer){
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomInCountry
    });
}

//console.log(JSON.safeStringify(north_america_data));

let original_world = L.geoJson(theWorld, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

/* example of how to add markers / polygons / lines to the map
let marker = L.marker([51.5, -0.09]);
marker.addTo(map);
*/

/* example of event listeners for when the map changes
map.on('move', () => {
    let ll = map.getCenter();
    console.log(`${ll.lat}, ${ll.lng}`);
});
*/

/* example of event listeners for when the map changes
map.on('move', () => {
    let ll = map.getCenter();
    console.log(`${ll.lat}, ${ll.lng}`);
});
*/