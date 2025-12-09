(async function () {

    // 🔹 Default fallback location (update if you want another city)
    const DEFAULT_LOCATION = { "Criteria ID": "1002009", Name: "MIAMI" };

    // 1️⃣ Fetch CSV
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

    // 2️⃣ Detect user city via IP
    async function detectUserCity() {
        try {
            const res = await fetch("https://ipapi.co/json/");
            const data = await res.json();
            return data.city; // returns city name
        } catch (err) {
            console.error("Could not detect user city:", err);
            return null;
        }
    }

    const csvUrl = "/locations.csv";
    const locations = await fetchLocationsCSV(csvUrl);

    const params = new URLSearchParams(window.location.search);
    let locationId = params.get("location");

    // 🔹 Clean Criteria ID from URL (remove parentheses, quotes, trim spaces)
    if (locationId) {
        locationId = locationId.replace(/[()"']/g, "").trim();
    }

    // 3️⃣ If no ?location=, detect user city and redirect with Criteria ID
    if (!locationId) {
        const userCity = await detectUserCity();

        let match = null;
        if (userCity) {
            match = locations.find(loc =>
                loc.Name.toLowerCase() === userCity.toLowerCase() ||
                loc["Canonical Name"].toLowerCase().includes(userCity.toLowerCase())
            );
        }

        // If no match, fallback to DEFAULT
        if (!match) {
            match = DEFAULT_LOCATION;
        }

        // 🔹 Ensure Criteria ID has no quotes
        let cleanId = match["Criteria ID"].replace(/^"|"$/g, "").trim();

        const url = new URL(window.location.href);
        url.searchParams.set("location", cleanId);
        window.location.replace(url.toString());

    }
    // 4️⃣ If ?location= exists, replace <span id="location">
    else {
        let match = locations.find(loc => {
            let cleanId = loc["Criteria ID"].replace(/^"|"$/g, "").trim();
            return cleanId === locationId;
        });

        // If no match in CSV, fallback to default
        if (!match) {
            match = DEFAULT_LOCATION;
        }

        // Clean up name: remove extra quotes and convert to ALL CAPS
        let locationName = match.Name.replace(/^"|"$/g, "").toUpperCase();

        const locationSpans = document.querySelectorAll("#location"); // support multiple spans
        locationSpans.forEach(span => {
            span.textContent = locationName;
        });
    }
})();
