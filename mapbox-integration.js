// Set your Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoiaXNtNGw5MiIsImEiOiJjbTRwaG4zNnkwdTI3MmpxczlkanBjZ2RqIn0.h20uUmHwEJSNQ7MX9D6bPQ';

// OpenWeather API Key
const openWeatherAPIKey = '486d5e6a0a4361ca45f0513941d70dd6';

// Define featured locations
const featuredLocations = [
    {
        name: 'Paris',
        country: 'France',
        coordinates: [2.3522, 48.8566],
        images: [
            'https://babapicture.blob.core.windows.net/blobabap/P1.webp',
            'https://babapicture.blob.core.windows.net/blobabap/P2.webp',
            'https://babapicture.blob.core.windows.net/blobabap/P3.webp'
        ],
        description: 'The City of Light, Paris is renowned for its stunning architecture, world-class museums like the Louvre, iconic Eiffel Tower, and exquisite cuisine.',
        bookingUrl: 'https://honeydew-worm-328764.hostingersite.com/alger/'
    },
    {
        name: 'London',
        country: 'UK',
        coordinates: [-0.1276, 51.5074],
        images: [
            'https://babapicture.blob.core.windows.net/blobabap/L1.webp',
            'https://babapicture.blob.core.windows.net/blobabap/L2.webp',
            'https://babapicture.blob.core.windows.net/blobabap/L3.webp'
        ],
        description: 'A city where tradition meets innovation, London offers iconic landmarks like Big Ben and Tower Bridge, world-renowned museums, diverse neighborhoods, and beautiful royal parks.',
        bookingUrl: 'https://honeydew-worm-328764.hostingersite.com/alger/'
    },
    {
        name: 'Djanet',
        country: 'Algeria',
        coordinates: [9.4840, 24.5534],
        images: [
            'https://babapicture.blob.core.windows.net/blobabap/dj1.jpg',
            'https://babapicture.blob.core.windows.net/blobabap/dj2.jpg',
            'https://babapicture.blob.core.windows.net/blobabap/dj3.jpg'
        ],
        description: 'An oasis in the heart of the Sahara, Djanet is gateway to the stunning Tassili n\'Ajjer National Park.',
        bookingUrl: 'https://honeydew-worm-328764.hostingersite.com/alger/'
    },
    {
        name: 'Kota Kinabalu',
        country: 'Malaysia',
        coordinates: [116.0735, 5.9804],
        images: [
            'https://babapicture.blob.core.windows.net/blobabap/M1.webp',
            'https://babapicture.blob.core.windows.net/blobabap/M2.webp',
            'https://babapicture.blob.core.windows.net/blobabap/M3.webp'
        ],
        description: 'Capital of Sabah, Kota Kinabalu offers stunning sunsets over the South China Sea, access to Mount Kinabalu, and rich biodiversity.',
        bookingUrl: 'https://honeydew-worm-328764.hostingersite.com/malaisie/'
    },
    {
        name: 'Surabaya',
        country: 'Indonesia',
        coordinates: [112.7508, -7.2575],
        images: [
            'https://babapicture.blob.core.windows.net/blobabap/In1.webp',
            'https://babapicture.blob.core.windows.net/blobabap/In2.webp',
            'https://babapicture.blob.core.windows.net/blobabap/In3.webp'
        ],
        description: 'Indonesia\'s second-largest city, Surabaya blends colonial heritage with modern urban life. Explore historic sites like the House of Sampoerna',
        bookingUrl: 'https://honeydew-worm-328764.hostingersite.com/circuit-sumatra-nord-et-ile-de-weh/'
    }
];

// Initialize the Map with Globe Projection
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    projection: 'globe',
    center: [0, 20],
    zoom: 1.8,
    pitch: 0,
    bearing: 0
});

// Add navigation controls (zoom, rotate, compass)
map.addControl(new mapboxgl.NavigationControl(), 'top-left');

// Add fullscreen control
map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

// Function to create popup content
function createPopupContent(location) {
    const container = document.createElement('div');
    
    // Create carousel container (will be populated by ImageCarousel class)
    const carouselContainer = document.createElement('div');
    
    // Create location info section
    const infoSection = document.createElement('div');
    infoSection.className = 'location-info';
    
    // Fetch weather data for the location
    fetchWeatherData(location.coordinates[1], location.coordinates[0])
        .then(weatherData => {
            const weatherInfo = weatherData ? `
                <p class="weather-details">
                    🌡️ Temperature: ${Math.round(weatherData.main.temp - 273.15)}°C<br>
                    ☁️ Clouds: ${weatherData.clouds.all}%<br>
                    💨 Wind: ${weatherData.wind.speed} m/s
                </p>
            ` : '';

            infoSection.innerHTML = `
                <h3>${location.name}, ${location.country}</h3>
                <p>${location.description}</p>
                ${weatherInfo}
                <a href="${location.bookingUrl}" target="_blank" class="book-trip-button">Book My Trip</a>
            `;
        });
    
    container.appendChild(carouselContainer);
    container.appendChild(infoSection);
    
    // Initialize carousel after a short delay to ensure proper rendering
    setTimeout(() => {
        new ImageCarousel(carouselContainer, location.images);
    }, 100);
    
    return container;
}

// Weather data fetching function
async function fetchWeatherData(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherAPIKey}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Function to add weather layer
async function addWeatherLayer(type, date = null) {
    // Remove existing weather layers
    if (map.getLayer('weather-layer')) {
        map.removeLayer('weather-layer');
    }
    if (map.getSource('weather-source')) {
        map.removeSource('weather-source');
    }

    let weatherTileUrl;
    if (date) {
        // For precipitation forecast (only available for the next 10 days)
        weatherTileUrl = `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${openWeatherAPIKey}&date=${date}`;
    } else {
        // For current weather
        switch(type) {
            case 'temp':
                weatherTileUrl = `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${openWeatherAPIKey}`;
                break;
            case 'wind':
                weatherTileUrl = `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${openWeatherAPIKey}`;
                break;
            case 'clouds':
                weatherTileUrl = `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${openWeatherAPIKey}`;
                break;
            case 'precipitation':
                weatherTileUrl = `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${openWeatherAPIKey}`;
                break;
        }
    }

    map.addSource('weather-source', {
        type: 'raster',
        tiles: [weatherTileUrl],
        tileSize: 256
    });

    map.addLayer({
        id: 'weather-layer',
        type: 'raster',
        source: 'weather-source',
        paint: {
            'raster-opacity': 0.6
        }
    });
}

// Initialize weather controls
function initWeatherControls() {
    const buttons = {
        temperature: document.getElementById('temperatureBtn'),
        wind: document.getElementById('windBtn'),
        clouds: document.getElementById('cloudsBtn'),
        precipitation: document.getElementById('precipitationBtn')
    };

    const dateInput = document.getElementById('weatherDate');
    
    // Set min date to today and max date to 10 days from now
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 10);
    
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];
    dateInput.value = today.toISOString().split('T')[0];

    // Add click handlers for weather buttons
    Object.entries(buttons).forEach(([type, button]) => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            Object.values(buttons).forEach(btn => btn.classList.remove('active'));
            
            if (button.classList.contains('active')) {
                button.classList.remove('active');
                if (map.getLayer('weather-layer')) {
                    map.removeLayer('weather-layer');
                    map.removeSource('weather-source');
                }
            } else {
                button.classList.add('active');
                addWeatherLayer(type);
            }
        });
    });

    // Add date input handler for precipitation forecast
    dateInput.addEventListener('change', (e) => {
        if (buttons.precipitation.classList.contains('active')) {
            addWeatherLayer('precipitation', e.target.value);
        }
    });
}

// Function to add markers for featured locations
function addFeaturedLocationMarkers() {
    featuredLocations.forEach(location => {
        const marker = new mapboxgl.Marker({
            color: '#00a699'
        })
            .setLngLat(location.coordinates)
            .setPopup(
                new mapboxgl.Popup({
                    closeButton: true,
                    closeOnClick: false
                })
                .setDOMContent(createPopupContent(location))
            )
            .addTo(map);
    });
}

// Route planning variables
let startPoint = null;
let endPoint = null;
let currentRoute = null;
let pickingLocation = null;

// Function to format duration
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

// Function to format distance
function formatDistance(meters) {
    const km = meters / 1000;
    return km >= 1 ? `${km.toFixed(1)}km` : `${meters}m`;
}

// Function to get route between two points
async function getRoute(start, end, mode = 'driving-traffic') {
    try {
        const query = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/${mode}/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
        );
        const json = await query.json();
        const data = json.routes[0];
        const route = data.geometry.coordinates;
        const geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route
            }
        };
        return {
            route: geojson,
            duration: data.duration,
            distance: data.distance
        };
    } catch (error) {
        console.error('Error fetching route:', error);
        return null;
    }
}

// Function to update route on map
async function updateRoute(mode = 'driving-traffic') {
    if (!startPoint || !endPoint) return;

    // Remove existing route
    if (map.getSource('route')) {
        map.removeLayer('route');
        map.removeSource('route');
    }

    const routeData = await getRoute(startPoint, endPoint, mode);
    if (!routeData) return;

    currentRoute = routeData;

    // Add the route to the map
    map.addSource('route', {
        type: 'geojson',
        data: routeData.route
    });

    map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#00ffcc',
            'line-width': 4,
            'line-opacity': 0.75
        }
    });

    // Update route info
    const routeInfo = document.querySelector('.route-info');
    routeInfo.innerHTML = `
        <p>Route Details:</p>
        <div class="route-stats">
            <span>🕒 ${formatDuration(routeData.duration)}</span>
            <span>📏 ${formatDistance(routeData.distance)}</span>
        </div>
    `;
    routeInfo.classList.add('visible');

    // Fit the map to the route
    const coordinates = routeData.route.geometry.coordinates;
    const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    map.fitBounds(bounds, {
        padding: 50
    });
}

// Initialize route planning controls
function initRoutePlanning() {
    const startInput = document.getElementById('startLocation');
    const endInput = document.getElementById('endLocation');
    const locationPickers = document.querySelectorAll('.location-picker');
    const transportBtns = document.querySelectorAll('.transport-btn');

    // Location picker functionality
    locationPickers.forEach(picker => {
        picker.addEventListener('click', () => {
            pickingLocation = picker.dataset.for;
            map.getCanvas().style.cursor = 'crosshair';
        });
    });

    // Transport mode selection
    transportBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            transportBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (startPoint && endPoint) {
                updateRoute(btn.dataset.mode);
            }
        });
    });

    // Map click handler for location picking
    map.on('click', (e) => {
        if (pickingLocation) {
            const coords = [e.lngLat.lng, e.lngLat.lat];
            if (pickingLocation === 'start') {
                startPoint = coords;
                startInput.value = `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
            } else {
                endPoint = coords;
                endInput.value = `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
            }

            // Reset picking mode
            pickingLocation = null;
            map.getCanvas().style.cursor = '';

            // Update route if both points are set
            if (startPoint && endPoint) {
                const activeMode = document.querySelector('.transport-btn.active');
                updateRoute(activeMode ? activeMode.dataset.mode : 'driving-traffic');
            }
        }
    });

    // Input change handlers
    [startInput, endInput].forEach(input => {
        input.addEventListener('change', async () => {
            const coords = input.value.split(',').map(coord => parseFloat(coord.trim()));
            if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                if (input.id === 'startLocation') {
                    startPoint = coords;
                } else {
                    endPoint = coords;
                }

                if (startPoint && endPoint) {
                    const activeMode = document.querySelector('.transport-btn.active');
                    updateRoute(activeMode ? activeMode.dataset.mode : 'driving-traffic');
                }
            }
        });
    });
}

// Load and configure the map layers
map.on('load', () => {
    // Set atmospheric fog for a realistic effect
    map.setFog({
        range: [-1, 2],
        color: 'white',
        "high-color": "#245bde",
        "space-color": "#000000",
        "horizon-blend": 0.1
    });

    // Enhance label visibility
    // Country labels
    map.setPaintProperty('country-label', 'text-color', '#ffffff');
    map.setLayoutProperty('country-label', 'text-size', 14);

    // City labels
    map.setPaintProperty('settlement-label', 'text-color', '#dddddd');
    map.setLayoutProperty('settlement-label', 'text-size', 12);

    // Add markers for featured locations
    addFeaturedLocationMarkers();

    // Initialize weather controls
    initWeatherControls();

    // Initialize route planning
    initRoutePlanning();

    // Add click handler for weather information
    map.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        fetchWeatherData(lat, lng).then(weatherData => {
            if (weatherData) {
                const weatherInfo = document.getElementById('weatherInfo');
                weatherInfo.innerHTML = `
                    <h4>Weather at ${lng.toFixed(2)}°, ${lat.toFixed(2)}°</h4>
                    <p>🌡️ Temperature: ${Math.round(weatherData.main.temp - 273.15)}°C</p>
                    <p>☁️ Clouds: ${weatherData.clouds.all}%</p>
                    <p>💨 Wind: ${weatherData.wind.speed} m/s</p>
                `;
                weatherInfo.classList.add('visible');
            }
        });
    });

    console.log('Map initialized with weather controls');
});

// Export the flyToLocation function for use in other modules
window.mapInterface = {
    flyToLocation: async function(locationName) {
        try {
            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName)}.json?access_token=${mapboxgl.accessToken}`);
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const location = data.features[0];
                const [lng, lat] = location.center;
                
                map.flyTo({
                    center: [lng, lat],
                    zoom: 12,
                    essential: true,
                    duration: 2000,
                    pitch: 45
                });

                return location.place_name;
            }
            return null;
        } catch (error) {
            console.error('Error geocoding location:', error);
            return null;
        }
    }
};
