(async function () {

    // 🔹 Default fallback location
    const DEFAULT_LOCATION = { Name: "United States" };

    // 1️⃣ Fetch CSV file
    async function fetchLocationsCSV(url) {
        try {
            const res = await fetch(url);
            const text = await res.text();
            const lines = text.trim().split("\n");
            const headers = lines[0].split(",").map(h => h.trim());
            const locations = [];

            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(",").map(c => c.trim());
                const obj = {};
                headers.forEach((h, idx) => obj[h] = cols[idx]);
                locations.push(obj);
            }
            return locations;
        } catch (err) {
            console.error("Error fetching locations CSV:", err);
            return [];
        }
    }

    // 2️⃣ Load CSV
    const csvUrl = "/locations.csv";
    const locations = await fetchLocationsCSV(csvUrl);

    // 3️⃣ Get ?location parameter (if any)
    const params = new URLSearchParams(window.location.search);
    let locationId = params.get("location");

    // 4️⃣ Determine location name
    let locationName = DEFAULT_LOCATION.Name;

    if (locationId) {
        // Clean ID from quotes/parentheses
        locationId = locationId.replace(/[()"']/g, "").trim();

        // Find match in CSV
        const match = locations.find(loc => {
            const cleanId = loc["Criteria ID"].replace(/^"|"$/g, "").trim();
            return cleanId === locationId;
        });

        if (match) {
            locationName = match.Name.replace(/^"|"$/g, "").trim();
        }
    }

    // 5️⃣ Update all <span id="location"> elements
    const locationSpans = document.querySelectorAll("#location");
    locationSpans.forEach(span => {
        span.textContent = locationName.toUpperCase();
    });

})();
