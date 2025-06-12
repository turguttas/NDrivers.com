<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Ride Request</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
    }

    .container {
      display: flex;
      flex-direction: column;
      max-width: 600px;
      margin: 0 auto;
      padding: 30px;
    }

    h1 {
      text-align: center;
      margin-bottom: 30px;
    }

    label {
      display: block;
      margin-top: 15px;
      font-weight: bold;
    }

    input, select {
      width: 100%;
      padding: 8px;
      margin-top: 5px;
      box-sizing: border-box;
    }

    .date-time-row {
      display: flex;
      gap: 12px;
      margin-top: 15px;
    }

    .date-time-row > div {
      flex: 1;
    }

    button {
      margin-top: 20px;
      padding: 12px;
      background-color: #000;
      color: white;
      border: none;
      width: 100%;
      font-size: 16px;
      cursor: pointer;
    }

    .map-container {
      margin-top: 40px;
    }

    .map-container img {
      width: 100%;
      height: auto;
      border-radius: 8px;
    }

    #terminalSelectWrapper {
      display: none;
      margin-top: 10px;
    }
  </style>

  <!-- ✅ Load EmailJS SDK -->
  <script src="https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js"></script>
</head>

<body>
  <div class="container">
    <h1>Your Neighbor, Your Driver</h1>
    <form id="rideForm">
      <label for="pickup">Pick-up Location</label>
      <input type="text" id="pickup" name="pickup" required />

      <label for="dropoff">Drop-off Location</label>
      <input type="text" id="dropoff" name="dropoff" required />

      <!-- ✅ LAX Terminal Dropdown (hidden unless LAX is detected) -->
      <div id="terminalSelectWrapper">
        <label for="terminalSelect">LAX Terminal (if applicable)</label>
        <select id="terminalSelect">
          <option disabled selected>Loading terminals...</option>
        </select>
      </div>

      <label for="email">Your Email</label>
      <input type="email" id="email" name="email" required />

      <div class="date-time-row">
        <div>
          <label for="date">Date</label>
          <input type="date" id="date" name="date" required />
        </div>
        <div>
          <label for="time">Time</label>
          <input type="time" id="time" name="time" required />
        </div>
      </div>

      <button type="submit">Request Ride</button>
    </form>

    <div class="map-container">
      <img src="/img/map-placeholder.jpg" alt="Map Placeholder" />
    </div>
  </div>

  <!-- ✅ JS Script (inserted here for convenience) -->
  <script>
    document.addEventListener("DOMContentLoaded", function () {
      emailjs.init("ufT1pFlXWfC1M0mfj"); // Public Key
  
      const form = document.getElementById("rideForm");
      const pickup = document.getElementById("pickup");
      const dropoff = document.getElementById("dropoff");
      const terminalWrapper = document.getElementById("terminalSelectWrapper");
      const terminalSelect = document.getElementById("terminalSelect");
  
      // Static array of LAX terminals
      const laxTerminals = [
        "Terminal 1",
        "Terminal 2",
        "Terminal 3",
        "Terminal 4",
        "Terminal 5",
        "Terminal 6",
        "Terminal 7",
        "Terminal 8",
        "Tom Bradley International Terminal (Terminal B)"
      ];
  
      function showLAXTerminalDropdownIfNeeded() {
        const pickupVal = pickup.value.toUpperCase();
        const dropoffVal = dropoff.value.toUpperCase();
        const shouldShow = pickupVal.includes("LAX") || dropoffVal.includes("LAX");
  
        if (shouldShow) {
          terminalWrapper.style.display = "block";
  
          // Populate only once
          if (terminalSelect.options.length <= 1) {
            terminalSelect.innerHTML = '<option disabled selected>Select a terminal</option>';
            laxTerminals.forEach(name => {
              const opt = document.createElement('option');
              opt.value = name;
              opt.textContent = name;
              terminalSelect.appendChild(opt);
            });
          }
        } else {
          terminalWrapper.style.display = "none";
          terminalSelect.value = "";
        }
      }
  
      pickup.addEventListener("input", showLAXTerminalDropdownIfNeeded);
      dropoff.addEventListener("input", showLAXTerminalDropdownIfNeeded);
  
      form.addEventListener("submit", function (event) {
        event.preventDefault();
  
        const templateParams = {
          pickup: pickup.value,
          dropoff: dropoff.value,
          email: document.getElementById("email").value,
          date: document.getElementById("date").value,
          time: document.getElementById("time").value,
          terminal: terminalSelect.value || "N/A"
        };
  
        emailjs.send("service_m9hf1b8", "template_odu6xgm", templateParams)
          .then(() => emailjs.send("service_m9hf1b8", "template_2fhl4rb", templateParams))
          .then(() => window.location.href = "/thank-you.html")
          .catch(error => {
            console.error("EmailJS error:", error);
            alert("Failed to send ride request. Please try again.");
          });
      });
    });
  </script>  
</body>
</html>
