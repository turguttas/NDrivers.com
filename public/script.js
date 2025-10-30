document.addEventListener("DOMContentLoaded", () => {

  // ---------------- Dark Mode ----------------
  const toggle = document.getElementById('darkModeToggle');
  const centerLogo = document.getElementById('logoImg');
  const navLogo = document.querySelector('.nav-logo img');

  function setDarkMode(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    toggle.textContent = isDark ? '☀️' : '🌙';
    if (centerLogo) centerLogo.src = isDark ? '/img/logo-white.png' : '/img/logo.png';
    if (navLogo) navLogo.src = isDark ? '/img/logo-white.png' : '/img/logo-dark.png';
    if (mapImg) mapImg.src = isDark ? '/img/map-placeholder-dark.jpg' : '/img/map-placeholder.jpg';
  }

  const savedDark = localStorage.getItem('darkMode') === 'true';
  setDarkMode(savedDark);

  toggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-mode');
    setDarkMode(isDark);
    localStorage.setItem('darkMode', isDark);
  });

  // ---------------- Form Elements ----------------
  emailjs.init("ufT1pFlXWfC1M0mfj");

  const form = document.getElementById("rideForm");
  const pickup = document.getElementById("pickup");
  const dropoff = document.getElementById("dropoff");
  const terminalWrapper = document.getElementById("terminalSelectWrapper");
  const terminalSelect = document.getElementById("terminalSelect");
  const airlineWrapper = document.getElementById("airlineWrapper");
  const airlineSelect = document.getElementById("airlineSelect");
  const flightCodeWrapper = document.getElementById("flightCodeWrapper");
  const flightCodeInput = document.getElementById("flightCode");

  const emailInput = document.getElementById('email');
  const phoneWrapper = document.getElementById('phoneWrapper');
  const phoneInput = document.getElementById('phone');
  const nameWrapper = document.getElementById('nameWrapper');
  const nameInput = document.getElementById('name');

const flatRateBox = document.getElementById('flat-rate-box'); // use your HTML div
flatRateBox.style.display = 'none'; // hide initially


  let airportData = {};
  let zonesData = {};
  let flatRatesData = {};

  // ---------------- Fetch Data ----------------
  async function fetchData() {
    try {
      const [airportsRes, zonesRes, ratesRes] = await Promise.all([
        fetch('/api/airports'), 
        fetch('/api/service-zones'), 
        fetch('/api/flat-rates')
      ]);
      airportData = await airportsRes.json();
      zonesData = await zonesRes.json();
      flatRatesData = await ratesRes.json();
    } catch (err) {
      console.error('Data fetch failed:', err);
    }
  }
  fetchData();

  // ---------------- Terminal / Airline Logic ----------------
  function findMatchingAirports(val) {
    const matches = [];
    val = val.toUpperCase();
    for (const code in airportData) {
      const airport = airportData[code];
      if (code.toUpperCase().includes(val)) {
        matches.push(code);
        continue;
      }
      if (airport.aliases) {
        for (const alias of airport.aliases) {
          if (alias.toUpperCase().includes(val)) {
            matches.push(code);
            break;
          }
        }
      }
    }
    return matches;
  }

  function showTerminalDropdown() {
    const allVal = [pickup.value.trim(), dropoff.value.trim()];
    let matchedAirport = null;

    for (const val of allVal) {
      if (!val) continue;
      const matches = findMatchingAirports(val);
      if (matches.length === 1) { matchedAirport = matches[0]; break; }
    }

    if (!matchedAirport) {
      terminalWrapper.style.display = "none";
      airlineWrapper.style.display = "none";
      flightCodeWrapper.style.display = "none";
      terminalSelect.value = '';
      airlineSelect.innerHTML = '';
      flightCodeInput.value = '';
      return;
    }

    terminalWrapper.style.display = "block";
    airlineWrapper.style.display = "none";
    flightCodeWrapper.style.display = "none";

    const terminals = Object.keys(airportData[matchedAirport]).filter(k => k !== 'aliases');
    terminalSelect.innerHTML = '<option disabled selected>Select a terminal</option>';
    terminals.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      terminalSelect.appendChild(opt);
    });

    terminalSelect.onchange = () => {
      const selectedTerminal = terminalSelect.value;
      const airlines = airportData[matchedAirport][selectedTerminal] || [];
      if (airlines.length > 0) {
        airlineSelect.innerHTML = '<option disabled selected>Select an airline</option>';
        airlines.forEach(a => {
          const opt = document.createElement('option');
          opt.value = a;
          opt.textContent = a;
          airlineSelect.appendChild(opt);
        });
        airlineWrapper.style.display = 'block';
        flightCodeWrapper.style.display = 'none';
        flightCodeInput.value = '';
      } else {
        airlineWrapper.style.display = 'none';
        airlineSelect.innerHTML = '';
        flightCodeWrapper.style.display = 'none';
        flightCodeInput.value = '';
      }
    };

    airlineSelect.addEventListener("change", () => {
      flightCodeWrapper.style.display = airlineSelect.value ? 'block' : 'none';
      if (!airlineSelect.value) flightCodeInput.value = '';
    });
  }

  pickup.addEventListener('input', showTerminalDropdown);
  dropoff.addEventListener('input', showTerminalDropdown);

  // ---------------- Dynamic Email → Phone → Name ----------------
  function updateContactFields() {
    const emailFilled = emailInput.value.trim() !== '';
    const phoneFilled = phoneInput.value.trim() !== '';

    phoneWrapper.style.display = emailFilled ? 'block' : 'none';
    if (!emailFilled) phoneInput.value = '';

    nameWrapper.style.display = phoneFilled ? 'block' : 'none';
    if (!phoneFilled) nameInput.value = '';
  }
  emailInput.addEventListener('input', updateContactFields);
  phoneInput.addEventListener('input', updateContactFields);

  // ---------------- Flat Rate Calculation ----------------
  const airportZoneMap = {
    'lax': 'Zone A', 'los angeles international airport': 'Zone A', 'los angeles': 'Zone A',
    'sna': 'Zone D', 'john wayne airport': 'Zone D', 'santa ana': 'Zone D'
  };

  console.log(extractCity("123 Main St, Irvine, CA 9000")); // Irvine
  console.log(extractCity("456 Broadway St, Los Angeles 90100")); // Los Angeles
  console.log(extractCity("789 Ocean Ave, Santa Monica, CA 90401")); // Santa Monica
  console.log(findZone("Irvine")); // OC_South
  console.log(findZone("Los Angeles")); // LA_Metro
  console.log(findZone("Santa Monica")); // LA_Metro
  console.log(findZone("Compton")); // South_LA

  function getFlatRate() {
  const pickupCity = extractCity(pickup.value);   // Step 1 function
  const dropoffCity = extractCity(dropoff.value);

  if (!pickupCity || !dropoffCity) {
    flatRateBox.textContent = ''; // hide flat rate if input is empty
    return;
  }

  const pickupZone = findZone(pickupCity);   // Step 2 function
  const dropoffZone = findZone(dropoffCity);

  if (!pickupZone || !dropoffZone) {
    flatRateBox.textContent = ''; // city not in your zones
    return;
  }

  // Lookup rate
  const price =
    flatRatesData[pickupZone]?.[dropoffZone] ||
    flatRatesData[dropoffZone]?.[pickupZone]; // fallback if missing

  flatRateBox.textContent = price ? `Flat Rate: $${price}` : '';
}

pickup.addEventListener('input', getFlatRate);
dropoff.addEventListener('input', getFlatRate);

function getFlatRate() {
  const pickupCity = extractCity(pickup.value); 
  const dropoffCity = extractCity(dropoff.value);

  // If either input is empty, hide the flat rate box
  if (!pickupCity || !dropoffCity) {
    flatRateBox.style.display = 'none';
    flatRateBox.textContent = '';
    return;
  }

  const pickupZone = findZone(pickupCity);  
  const dropoffZone = findZone(dropoffCity);

  // If city not in zones, hide the box
  if (!pickupZone || !dropoffZone) {
    flatRateBox.style.display = 'none';
    flatRateBox.textContent = '';
    return;
  }

  // Lookup rate
  const price =
    flatRatesData[pickupZone]?.[dropoffZone] ||
    flatRatesData[dropoffZone]?.[pickupZone];

  if (price) {
    flatRateBox.style.display = 'block';
    flatRateBox.textContent = `Flat Rate: $${price}`;
  } else {
    flatRateBox.style.display = 'none';
    flatRateBox.textContent = '';
  }
}

function getFlatRate() {
  const pickupCity = extractCity(pickup.value); 
  const dropoffCity = extractCity(dropoff.value);

  // If either input is empty, hide the flat rate box
  if (!pickupCity || !dropoffCity) {
    flatRateBox.style.display = 'none';
    flatRateBox.textContent = '';
    return;
  }

  const pickupZone = findZone(pickupCity);  
  const dropoffZone = findZone(dropoffCity);

  // If city not in zones, show message
  if (!pickupZone || !dropoffZone) {
    flatRateBox.style.display = 'block';
    flatRateBox.textContent = 'Sorry, we only service Southern California.';
    return;
  }

  // Lookup rate
  const price =
    flatRatesData[pickupZone]?.[dropoffZone] ||
    flatRatesData[dropoffZone]?.[pickupZone];

  if (price) {
    flatRateBox.style.display = 'block';
    flatRateBox.textContent = `Flat Rate: $${price}`;
  } else {
    flatRateBox.style.display = 'block';
    flatRateBox.textContent = 'Sorry, we cannot calculate a flat rate for this route.';
  }
}


  function findZone(city) {
  if (!city) return null;

  city = city.toLowerCase(); // make case-insensitive

  for (const [zone, cities] of Object.entries(zonesData.zones)) {
    if (cities.some(c => c.toLowerCase() === city)) {
      return zone;
    }
  }

  return null; // city not found
}



  function extractCity(address) {
  if (!address) return null;

  const parts = address.split(',');
  if (parts.length < 2) return address.trim();

  // Usually city is the second-to-last part
  let city = parts[parts.length - 2].trim();

  // Remove numbers (zip codes) and extra whitespace
  city = city.replace(/\d+$/, '').trim();

  return city;
}

  // ---------------- Form Submission ----------------
  form.addEventListener('submit', event => {
    event.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    const templateParams = {
  pickup: pickup.value,
  dropoff: dropoff.value,
  email: document.getElementById("email").value,
  phone: phoneInput.value,      // <-- add this
  name: document.getElementById("name").value,  // <-- add this
  date: document.getElementById("date").value,
  time: document.getElementById("time").value,
  terminal: terminalSelect.value || "N/A",
  airline: airlineSelect.value || "N/A",
  flight_code: flightCodeInput.value || "N/A"
};

    emailjs.send("service_m9hf1b8", "template_odu6xgm", templateParams)
      .then(() => emailjs.send("service_m9hf1b8", "template_2fhl4rb", templateParams))
      .then(() => window.location.href = "/thank-you.html")
      .catch(error => { 
        console.error(error); 
        alert("Failed to send ride request."); 
        submitBtn.disabled = false;
      });
  });

  // ---------------- Testimonial Slider ----------------
  const slider = document.querySelector('.slider-container');
  const slides = document.querySelectorAll('.testimonial-slide');
  const wrapper = document.querySelector('.slider-wrapper');
  let index = 0;

  function updateSlider() {
    wrapper.style.transform = `translateX(-${index * 100}%)`;
  }

  document.querySelector('.slider-prev')?.addEventListener('click', () => {
    index = (index === 0) ? slides.length - 1 : index - 1;
    updateSlider();
  });
  document.querySelector('.slider-next')?.addEventListener('click', () => {
    index = (index + 1) % slides.length;
    updateSlider();
  });

  setInterval(() => {
    index = (index + 1) % slides.length;
    updateSlider();
  }, 6000);

  // ---------------- Scroll Reveal ----------------
  window.addEventListener('scroll', () => {
    document.querySelectorAll('.reveal').forEach(el => {
      const top = el.getBoundingClientRect().top;
      const height = window.innerHeight;
      if (top < height * 0.85) el.classList.add('active');
    });
  });

  // ---------------- Hamburger Menu ----------------
  const menuBtn = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('.nav-links');
  menuBtn?.addEventListener('click', () => {
    navLinks?.classList.toggle('active');
  });

});
document.addEventListener('DOMContentLoaded', () => {

    // --- Element Selectors ---
    const themeToggleButton = document.getElementById('darkModeToggle');
    const navbarLogo = document.getElementById('navbarLogo');
    const hamburgerButton = document.getElementById('hamburger-button');
    const navMenu = document.getElementById('nav-menu');

    const lightLogoSrc = '/img/logo.png';
    const darkLogoSrc = '/img/logo-white.png';

    // --- Theme Management ---
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggleButton.textContent = '☀️';
            if (navbarLogo) navbarLogo.src = darkLogoSrc;
        } else {
            document.body.classList.remove('dark-mode');
            themeToggleButton.textContent = '🌙';
            if (navbarLogo) navbarLogo.src = lightLogoSrc;
        }
    };

    const toggleTheme = () => {
        const currentTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
        applyTheme(currentTheme);
    };

    // Initialize theme on page load
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(initialTheme);
    
    themeToggleButton.addEventListener('click', toggleTheme);


    // --- Mobile Navigation ---
    if (hamburgerButton && navMenu) {
        hamburgerButton.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            hamburgerButton.classList.toggle('open');
            const isExpanded = navMenu.classList.contains('open');
            hamburgerButton.setAttribute('aria-expanded', isExpanded);
        });
    }


    // --- Active Navigation Link Highlighting ---
    const currentPagePath = window.location.pathname.split('/').pop();
    const navLinks = navMenu.querySelectorAll('a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        // Reset active class from all links first
        link.classList.remove('active');
        // Add active class to the current page link
        if (linkPath === currentPagePath) {
            link.classList.add('active');
        }
    });
    // Edge case for the homepage (index.html or root '/')
    if (currentPagePath === '' || currentPagePath === 'index.html') {
        const homeLink = navMenu.querySelector('a[href="index.html"]');
        if (homeLink) homeLink.classList.add('active');
    }
});
// script.js

async function loadZones() {
  const response = await fetch('zones.json');
  return await response.json();
}

function findZoneForAddress(address, zonesData) {
  address = address.toLowerCase();
  for (const [zoneName, cities] of Object.entries(zonesData.zones)) {
    for (const city of cities) {
      if (address.includes(city.toLowerCase())) {
        return zoneName;
      }
    }
  }
  return null;
}

function getFlatRate(pickupZone, dropoffZone, zonesData) {
  if (
    zonesData.flat_rates[pickupZone] &&
    zonesData.flat_rates[pickupZone][dropoffZone]
  ) {
    return zonesData.flat_rates[pickupZone][dropoffZone];
  }
  return null;
}

function displayRate(rate) {
  let priceBox = document.getElementById('priceDisplay');
  if (!priceBox) {
    priceBox = document.createElement('div');
    priceBox.id = 'priceDisplay';
    priceBox.style.marginTop = '10px';
    priceBox.style.fontWeight = 'bold';
    document.querySelector('#dropoff').parentElement.appendChild(priceBox);
  }
  priceBox.textContent = rate
    ? `💰 Flat Rate: $${rate}`
    : 'No flat rate found for this route.';
}

async function setupFlatRateLookup() {
  const zonesData = await loadZones();

  const pickupInput = document.getElementById('pickup');
  const dropoffInput = document.getElementById('dropoff');

  function calculateIfBothFilled() {
    const pickup = pickupInput.value.trim();
    const dropoff = dropoffInput.value.trim();

    if (pickup && dropoff) {
      const pickupZone = findZoneForAddress(pickup, zonesData);
      const dropoffZone = findZoneForAddress(dropoff, zonesData);

      if (!pickupZone || !dropoffZone) {
        displayRate(null);
        return;
      }

      const rate = getFlatRate(pickupZone, dropoffZone, zonesData);
      displayRate(rate);
    }
  }

  pickupInput.addEventListener('change', calculateIfBothFilled);
  dropoffInput.addEventListener('change', calculateIfBothFilled);
  pickupInput.addEventListener('blur', calculateIfBothFilled);
  dropoffInput.addEventListener('blur', calculateIfBothFilled);
}

document.addEventListener('DOMContentLoaded', setupFlatRateLookup);
