let selectedContact = null;
let etaTimer;
let mapUpdateInterval; // For live map updates
const driverInfo = {
    name: "Alex Rider",
    phone: "+91 9306953755",
    vehicle: "Tesla Model 3 - Black",
    license: "XYZ-7890"
};

// Placeholder for user's current location (Gangapur, Rajasthan, India)
const userCurrentLocation = { lat: 25.6888, lng: 76.3245 }; // Approximate coordinates for Gangapur, Rajasthan

// Function to simulate location suggestions (replace with actual API call)
async function getLocationSuggestions(query) {
    if (query.length < 3) return []; // Don't suggest for very short queries

    // In a real application, you would use a geocoding API here, e.g., Google Places API, OpenStreetMap Nominatim
    // Example:
    // const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=YOUR_GOOGLE_PLACES_API_KEY`);
    // const data = await response.json();
    // return data.predictions.map(prediction => prediction.description);

    // For demonstration, use a static list
    const suggestions = [
        "BITS Pilani Gate 1",
        "BITS Pilani, Rajasthan",
        "Vidya Vihar Colony",
        "Gangapur City Railway Station",
        "New Delhi Railway Station",
        "Indira Gandhi International Airport",
        "Jaipur International Airport",
        "Hotel Grand Imperial",
        "City Hospital",
        "Central Park"
    ];
    return suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()));
}

function autocomplete(inp, callback) {
    let currentFocus;

    inp.addEventListener("input", async function (e) {
        let a, b, i, val = this.value;
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;

        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);

        const suggestions = await callback(val);

        for (i = 0; i < suggestions.length; i++) {
            b = document.createElement("DIV");
            b.innerHTML = "<strong>" + suggestions[i].substr(0, val.length) + "</strong>";
            b.innerHTML += suggestions[i].substr(val.length);
            b.innerHTML += "<input type='hidden' value='" + suggestions[i] + "'>";
            b.addEventListener("click", function (e) {
                inp.value = this.getElementsByTagName("input")[0].value;
                closeAllLists();
            });
            a.appendChild(b);
        }
    });

    inp.addEventListener("keydown", function (e) {
        let x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) { // Arrow Down
            currentFocus++;
            addActive(x);
        } else if (e.keyCode == 38) { // Arrow Up
            currentFocus--;
            addActive(x);
        } else if (e.keyCode == 13) { // Enter
            e.preventDefault();
            if (currentFocus > -1) {
                if (x) x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        for (let i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        const x = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

// Initialize autocomplete for pickup and dropoff
autocomplete(document.getElementById("pickupLocation"), getLocationSuggestions);
autocomplete(document.getElementById("dropoffLocation"), getLocationSuggestions);

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginText = document.getElementById('loginText');
    const loginLoader = document.getElementById('loginLoader');

    loginText.style.display = 'none';
    loginLoader.style.display = 'inline-block';

    setTimeout(() => {
        if (username === "abcd" && password === "123456") {
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('mainInterface').style.display = 'block';
            showNotification('Welcome back, abcd! Ready to book your ride.', 'success');
            loginText.style.display = 'inline';
            loginLoader.style.display = 'none';
        } else {
            showNotification('Invalid credentials. Please try again.', 'error');
            loginText.style.display = 'inline';
            loginLoader.style.display = 'none';
        }
    }, 1500);
}

function bookRide() {
    const pickup = document.getElementById('pickupLocation').value;
    const dropoff = document.getElementById('dropoffLocation').value;
    const rideType = document.getElementById('rideType').value;
    const bookText = document.getElementById('bookText');
    const bookLoader = document.getElementById('bookLoader');

    if (!pickup || !dropoff) {
        showNotification('Please enter both pickup and dropoff locations', 'error');
        return;
    }

    bookText.style.display = 'none';
    bookLoader.style.display = 'inline-block';

    setTimeout(() => {
        document.getElementById('bookingSection').style.display = 'none';
        document.getElementById('rideStatus').style.display = 'block';
        document.getElementById('emergencySection').style.display = 'block';

        document.getElementById('displayPickup').textContent = pickup;
        document.getElementById('displayDropoff').textContent = dropoff;

        // Update map iframe source with dynamic locations
        updateMap(pickup, dropoff);

        showNotification(`Your ${rideType} ride has been booked!`, 'success');
        startETACountdown();

        bookText.style.display = 'inline';
        bookLoader.style.display = 'none';
    }, 2000);
}

function toggleMap() {
    const mapContainer = document.getElementById('mapContainer');
    if (mapContainer.style.display === 'none') {
        mapContainer.style.display = 'block';
        showNotification('Map expanded successfully', 'success');
        // Start continuous map updates when expanded
        startLiveMapUpdates();
    } else {
        mapContainer.style.display = 'none';
        // Stop continuous map updates when collapsed
        clearInterval(mapUpdateInterval);
    }
}

function updateMap(pickup, dropoff) {
    const mapFrame = document.getElementById('liveMapFrame');
    // This is a placeholder. In a real app, you'd get precise coordinates
    // and use a Directions API to show the route and update driver's position.
    // For now, we'll just center the map based on the dropoff for visual effect.
    const query = encodeURIComponent(`${pickup} to ${dropoff}`);
    mapFrame.src = `https://www.google.com/maps/embed/v1/directions?key=YOUR_Maps_API_KEY&origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(dropoff)}&mode=driving`;
    // Replace 'YOUR_Maps_API_KEY' with your actual Google Maps API Key
}

// Simulates live location updates for the map
function startLiveMapUpdates() {
    let currentLat = userCurrentLocation.lat;
    let currentLng = userCurrentLocation.lng;
    const mapFrame = document.getElementById('liveMapFrame');

    // This is a very basic simulation. A real implementation would involve:
    // 1. Getting actual driver location from a backend service.
    // 2. Using a mapping library (e.g., Google Maps JavaScript API) to
    //    dynamically update a marker on the map.
    mapUpdateInterval = setInterval(() => {
        // Simulate driver moving towards destination
        // For demo, slightly change coordinates
        currentLat += (Math.random() - 0.5) * 0.0005;
        currentLng += (Math.random() - 0.5) * 0.0005;

        // Update the map iframe source to show a new 'place' (driver's simulated location)
        // In a real app, you'd update a marker on a dynamic map, not reload the iframe.
        // This reload is just for visual demonstration of "update".
        mapFrame.src = `https://www.google.com/maps/embed/v1/place?key=YOUR_Maps_API_KEY&q=${currentLat},${currentLng}`;
        // Replace 'YOUR_Maps_API_KEY' with your actual Google Maps API Key
    }, 5000); // Update map every 5 seconds
}


function showEmergencyContacts() {
    const contactList = document.getElementById('emergencyContactList');
    if (contactList.style.display === 'none' || !contactList.style.display) {
        contactList.style.display = 'block';
        showNotification('Emergency contacts displayed', 'info');
    } else {
        contactList.style.display = 'none';
    }
}

function selectContact(name, phone, element) {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('selected');
    });

    element.classList.add('selected');

    selectedContact = { name, phone };
    document.getElementById('selectedContactName').textContent = `${name} (${phone})`;

    document.getElementById('emergencyModal').style.display = 'flex';
}

function confirmSOS() {
    if (selectedContact) {
        sendSOSMessage(selectedContact.phone);
        showNotification(`SOS sent to ${selectedContact.name}`, 'success');
        closeModal();
    }
}

function closeModal() {
    document.getElementById('emergencyModal').style.display = 'none';
}

function sendSOSMessage(phoneNumber) {
    // Use Geolocation API to get current precise location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
            const message = `EMERGENCY! I need help with my NeoRide. My current location: ${googleMapsLink}. Driver: ${driverInfo.name}, Phone: ${driverInfo.phone}, Vehicle: ${driverInfo.vehicle}, License: ${driverInfo.license}`;
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');

            console.log("Emergency alert sent with live location:", {
                timestamp: new Date(),
                recipient: selectedContact,
                driverDetails: driverInfo,
                location: { lat, lng }
            });
        }, (error) => {
            console.error("Error getting location for SOS:", error);
            // Fallback if location access is denied
            const fallbackMessage = `EMERGENCY! I need help with my NeoRide. My current general location is Gangapur, Rajasthan, India. Driver: ${driverInfo.name}, Phone: ${driverInfo.phone}, Vehicle: ${driverInfo.vehicle}, License: ${driverInfo.license}`;
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(fallbackMessage)}`;
            window.open(url, '_blank');
            showNotification('Could not get precise location, sending general emergency alert.', 'error');
        });
    } else {
        // Browser doesn't support Geolocation
        const fallbackMessage = `EMERGENCY! I need help with my NeoRide. My current general location is Gangapur, Rajasthan, India. Driver: ${driverInfo.name}, Phone: ${driverInfo.phone}, Vehicle: ${driverInfo.vehicle}, License: ${driverInfo.license}`;
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(fallbackMessage)}`;
        window.open(url, '_blank');
        showNotification('Geolocation not supported, sending general emergency alert.', 'error');
    }
}

function shareLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
            const message = `My current live location is: ${googleMapsLink}`;

            // Here, you would typically send this to selected emergency contacts
            // For demo, we'll just show a notification and log it.
            showNotification('Live location retrieved. Ready to share.', 'success');
            console.log("Current Live Location:", { lat, lng, link: googleMapsLink });

            // Simulate sharing with one of the emergency contacts (e.g., Nikhil)
            const nikhilPhone = '6376589226';
            const url = `https://wa.me/${nikhilPhone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
            showNotification('Location shared with Nikhil (Bro)', 'success');

        }, (error) => {
            console.error("Error getting location for sharing:", error);
            showNotification('Could not get your live location.', 'error');
        });
    } else {
        showNotification('Geolocation is not supported by your browser.', 'error');
    }

    const widget = document.querySelector('.floating-widget');
    widget.style.animation = 'pulse 0.5s';
    setTimeout(() => widget.style.animation = '', 500);
}

function callDriver() {
    const driverPhone = driverInfo.phone.replace(/\s+/g, '');
    showNotification(`Calling driver: ${driverInfo.phone}...`, 'info');

    window.open(`tel:${driverPhone}`);

    setTimeout(() => {
        showNotification(`Call connected to ${driverInfo.name}`, 'success');
    }, 2000);
}

function sendFeedback() {
    const feedback = prompt('Please share your feedback:');
    if (feedback) {
        showNotification('Feedback sent successfully', 'success');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    notificationText.textContent = message;
    notification.className = 'notification show';

    if (type === 'success') {
        notification.style.background = '#48bb78';
    } else if (type === 'error') {
        notification.style.background = '#f56565';
    } else {
        notification.style.background = '#4299e1';
    }

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function startETACountdown() {
    let eta = 10;
    const etaElement = document.getElementById('eta');

    etaTimer = setInterval(() => {
        eta--;
        etaElement.textContent = `${eta} mins`;

        if (eta <= 0) {
            clearInterval(etaTimer);
            etaElement.textContent = 'Arrived!';
            showNotification('You have reached your destination!', 'success');
        }
    }, 60000);
}

document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && document.getElementById('loginContainer').style.display !== 'none') {
        login();
    }
});

window.onclick = function (event) {
    const modal = document.getElementById('emergencyModal');
    if (event.target === modal) {
        closeModal();
    }
}

setInterval(() => {
    const statusIndicator = document.querySelector('.status-indicator i');
    if (statusIndicator) {
        statusIndicator.style.animation = 'none';
        setTimeout(() => statusIndicator.style.animation = 'bounce 1s infinite', 10);
    }
}, 10000);

const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#password');

togglePassword.addEventListener('click', function () {
    // toggle the type attribute
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    // toggle the eye slash icon
    this.classList.toggle('fa-eye-slash');
});

// Scroll to Top Button functionality
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

// Ensure button is visible and bind click events
if (scrollToTopBtn) {
    // Add click event listener as backup to onclick attribute
    scrollToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Button clicked via event listener');
        scrollToTop();
    });

    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollPosition > 100) { // Show button after scrolling 100px (reduced threshold)
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.transform = 'scale(1)';
        } else {
            scrollToTopBtn.style.opacity = '0.7'; // Still visible but faded when at top
            scrollToTopBtn.style.transform = 'scale(0.8)';
        }
    });

    // Make button always visible initially for testing
    scrollToTopBtn.style.opacity = '0.7';
    scrollToTopBtn.style.transform = 'scale(0.8)';
    
    console.log('Scroll to top button initialized successfully');
    
    // Test button immediately after page load
    setTimeout(() => {
        console.log('=== DEBUGGING INFO ===');
        console.log('Testing button after page load...');
        console.log('Button exists:', !!scrollToTopBtn);
        console.log('Button is visible:', scrollToTopBtn.style.opacity);
        console.log('Current scroll position:', window.pageYOffset);
        
        // Make scroll functions globally accessible for testing
        window.testScroll = scrollToTop;
        window.forceScroll = forceScrollToTop;
        console.log('=== TEST FUNCTIONS AVAILABLE ===');
        console.log('Type "testScroll()" or "forceScroll()" in console to test');
        console.log('Or simply click the purple button in bottom-right');
    }, 2000);
} else {
    console.error('Scroll to top button not found!');
}

// Smooth scroll to top function - Enhanced for desktop
function scrollToTop() {
    const btn = document.getElementById('scrollToTopBtn');
    if (btn) {
        // Add the animation class
        btn.classList.add('clicked');
        document.body.classList.add('scrolling-up');
        
        // Use smooth scroll
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Remove the classes after animation completes and reset position
        setTimeout(() => {
            btn.classList.remove('clicked');
            document.body.classList.remove('scrolling-up');
            // Reset visibility/opacity
            btn.style.opacity = '0.7';
            btn.style.transform = 'scale(0.8)';
        }, 1200);
    }
}

// Alternative scroll function for testing
function forceScrollToTop() {
    console.log('FORCE SCROLL CALLED');
    const scrollableElement = document.scrollingElement || document.documentElement;
    scrollableElement.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    console.log('Force scroll completed');
}

// Add keyboard accessibility for scroll to top button
scrollToTopBtn.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToTop();
    }
});