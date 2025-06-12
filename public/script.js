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
