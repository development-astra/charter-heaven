(async function () {
    const DEFAULT_LOCATION_NAME = "United States";

    function setLocationName(name) {
        const finalName = (name || DEFAULT_LOCATION_NAME).toUpperCase();

        // Header badge
        document.querySelectorAll("#location").forEach((span) => {
            span.textContent = finalName;
        });

        // Hero pill (if present)
        document.querySelectorAll("#heroLocation").forEach((span) => {
            span.textContent = finalName;
        });
    }

    // 1) If URL has ?location=xxxx, use locations.csv
    const params = new URLSearchParams(window.location.search);
    const locationId = params.get("location");

    if (locationId) {
        try {
            const res = await fetch("locations.csv", { cache: "no-store" });
            if (!res.ok) throw new Error(`Failed to load locations.csv (${res.status})`);

            const csv = await res.text();
            const lines = csv.split(/\r?\n/).filter(Boolean);
            if (lines.length < 2) throw new Error("locations.csv is empty or invalid");

            const headers = lines[0].split(",").map((h) => h.trim());

            let foundName = null;

            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(",").map((c) => c.trim());
                const row = {};
                headers.forEach((h, idx) => (row[h] = cols[idx] || ""));

                // Common column names people use
                const rowId = row.location || row.location_id || row.locationId || row.id || "";

                if (String(rowId) === String(locationId)) {
                    foundName =
                        row.city ||
                        row.city_name ||
                        row.name ||
                        row.location_name ||
                        row.region ||
                        row.state ||
                        row.country ||
                        null;
                    break;
                }
            }

            setLocationName(foundName || DEFAULT_LOCATION_NAME);
            return; // stop here; we already set it from CSV
        } catch (e) {
            console.error("CSV location lookup failed:", e);
            setLocationName(DEFAULT_LOCATION_NAME);
            return;
        }
    }

    // 2) No ?location= → use IP geolocation (CORS-friendly)
    try {
        const res = await fetch("https://ipwho.is/", { cache: "no-store" });
        if (!res.ok) throw new Error(`ipwho failed (${res.status})`);
        const data = await res.json();

        const name = data.city || data.region || data.country || DEFAULT_LOCATION_NAME;
        setLocationName(name);
    } catch (e) {
        console.error("IP geolocation failed:", e);
        setLocationName(DEFAULT_LOCATION_NAME);
    }
})();
