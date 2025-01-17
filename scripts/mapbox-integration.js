// Set your Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoiaXNtNGw5MiIsImEiOiJjbTRwaG4zNnkwdTI3MmpxczlkanBjZ2RqIn0.h20uUmHwEJSNQ7MX9D6bPQ';

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
    
    const title = document.createElement('h3');
    title.textContent = `${location.name}, ${location.country}`;
    
    const description = document.createElement('p');
    description.textContent = location.description;
    
    const bookButton = document.createElement('a');
    bookButton.href = location.bookingUrl;
    bookButton.textContent = 'Book Now';
    bookButton.className = 'book-button';
    bookButton.target = '_blank';
    
    infoSection.appendChild(title);
    infoSection.appendChild(description);
    infoSection.appendChild(bookButton);
    
    container.appendChild(carouselContainer);
    container.appendChild(infoSection);
    
    // Initialize the carousel
    new ImageCarousel(carouselContainer, location.images);
    
    return container;
}

// Function to add markers for featured locations
function addFeaturedLocationMarkers() {
    featuredLocations.forEach(location => {
        const popup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: false,
            maxWidth: '300px',
            className: 'location-popup'
        }).setDOMContent(createPopupContent(location));

        new mapboxgl.Marker()
            .setLngLat(location.coordinates)
            .setPopup(popup)
            .addTo(map);
    });
}

// Load and configure the map layers
map.on('load', () => {
    // Set atmospheric fog for a realistic effect
    map.setFog({
        'color': 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
    });

    addFeaturedLocationMarkers();
});

function flyToLocation(locationName) {
    const location = featuredLocations.find(loc => loc.name.toLowerCase() === locationName.toLowerCase());
    if (location) {
        map.flyTo({
            center: location.coordinates,
            zoom: 12,
            duration: 2000,
            essential: true
        });
    }
}
