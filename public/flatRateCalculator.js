
// ---------------- Flat Rate Calculator ----------------
const zonesData = {
  "zones": {
    "LA_Metro": ["Los Angeles","Beverly Hills","Burbank","Glendale","Pasadena","Santa Monica","West Hollywood"],
    "South_LA": ["Inglewood","Hawthorne","Compton","Torrance","Carson"],
    "OC_North": ["Anaheim","Fullerton","Buena Park","Placentia","La Habra"],
    "OC_South": ["Irvine","Tustin","Laguna Beach","Newport Beach","Mission Viejo"],
    "Riverside": ["Riverside","Corona","Moreno Valley","Temecula","Murrieta"],
    "San_Bernardino": ["San Bernardino","Ontario","Rancho Cucamonga","Fontana","Chino"],
    "Ventura": ["Ventura","Oxnard","Thousand Oaks","Camarillo"],
    "Santa_Barbara": ["Santa Barbara","Goleta","Santa Maria"],
    "Imperial": ["El Centro","Brawley","Calexico"],
    "Kern": ["Bakersfield","Delano","Tehachapi"],
    "San_Luis_Obispo": ["San Luis Obispo","Paso Robles","Pismo Beach"],
    "San_Diego": ["San Diego","Carlsbad","Chula Vista","La Mesa","Oceanside"]
  },
  "flat_rates": {
    "LA_Metro": { "LA_Metro": 55, "South_LA": 60, "OC_North": 90, "OC_South": 92, "Riverside": 120, "San_Bernardino": 140, "Ventura": 130, "San_Diego": 180, "Santa_Barbara": 150, "Imperial": 360, "Kern": 180, "San_Luis_Obispo": 300 },
    "South_LA": { "LA_Metro": 60, "South_LA": 55, "OC_North": 80, "OC_South": 85, "Riverside": 110, "San_Bernardino": 130, "Ventura": 110, "San_Diego": 175, "Santa_Barbara": 145 },
    "OC_North": { "LA_Metro": 90, "South_LA": 80, "OC_North": 55, "OC_South": 55, "Riverside": 120, "San_Bernardino": 140, "Ventura": 125, "San_Diego": 170 },
    "OC_South": { "LA_Metro": 92, "South_LA": 85, "OC_North": 55, "OC_South": 55, "Riverside": 120, "San_Bernardino": 140, "Ventura": 130, "San_Diego": 150, "Santa_Barbara": 200, "Kern": 270, "Imperial": 310, "San_Luis_Obispo": 260 },
    "Riverside": { "LA_Metro": 120, "South_LA": 110, "OC_North": 120, "OC_South": 120, "Riverside": 55, "San_Bernardino": 70, "Ventura": 160, "San_Diego": 140, "Santa_Barbara": 225 },
    "San_Bernardino": { "LA_Metro": 140, "South_LA": 130, "OC_North": 140, "OC_South": 140, "Riverside": 70, "San_Bernardino": 55, "Ventura": 180, "San_Diego": 185, "Santa_Barbara": 250 },
    "Ventura": { "LA_Metro": 130, "South_LA": 110, "OC_North": 125, "OC_South": 130, "Riverside": 160, "San_Bernardino": 180, "Ventura": 55, "San_Diego": 210, "Santa_Barbara": 95 },
    "Santa_Barbara": { "LA_Metro": 150, "South_LA": 145, "OC_South": 200, "Riverside": 225, "San_Bernardino": 250, "Ventura": 95, "Santa_Barbara": 55, "San_Diego": 310, "Kern": 260, "San_Luis_Obispo": 150 },
    "Imperial": { "LA_Metro": 360, "OC_South": 310, "San_Diego": 310, "Kern": 330, "Imperial": 55 },
    "Kern": { "LA_Metro": 180, "OC_South": 270, "Santa_Barbara": 260, "San_Luis_Obispo": 190, "Imperial": 330, "Kern": 55 },
    "San_Luis_Obispo": { "LA_Metro": 300, "OC_South": 260, "Santa_Barbara": 150, "Kern": 190, "San_Luis_Obispo": 55, "San_Diego": 370 },
    "San_Diego": { "LA_Metro": 180, "South_LA": 175, "OC_South": 150, "Riverside": 140, "San_Bernardino": 185, "Ventura": 210, "San_Diego": 55 }
  }
};

// Get zone by city
function getZone(city) {
  for (const zone in zonesData.zones) {
    if (zonesData.zones[zone].includes(city)) return zone;
  }
  return null;
}

// Calculate & display flat rate
function updateFlatRate() {
  const pickupVal = document.getElementById("pickup").value.trim();
  const dropoffVal = document.getElementById("dropoff").value.trim();
  const display = document.getElementById("flatRateDisplay");

  if (!pickupVal || !dropoffVal) {
    display.textContent = '';
    return;
  }

  const pickupZone = getZone(pickupVal);
  const dropoffZone = getZone(dropoffVal);

  if (!pickupZone || !dropoffZone) {
    display.textContent = "Flat rate not available!";
    return;
  }

  const rate = zonesData.flat_rates[pickupZone][dropoffZone];
  display.textContent = rate ? `Flat Rate: $${rate}` : "Flat rate not available!";
}

// Update rate on input changes
document.getElementById("pickup").addEventListener("input", updateFlatRate);
document.getElementById("dropoff").addEventListener("input", updateFlatRate);
<p id="flatRateDisplay" style="margin-top:10px; font-weight:bold;"></p>
