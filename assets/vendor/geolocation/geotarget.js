(async function () {
    const DEFAULT_LOCATION_NAME = "United States";

    function setLocationName(name) {
        const finalName = (name || DEFAULT_LOCATION_NAME).toUpperCase();
        document.querySelectorAll("#location").forEach(span => {
        span.textContent = finalName;
        });
    }

    // 1. If ?location= is present, use the CSV (Google Ads style)
    const params = new URLSearchParams(window.location.search);
    const locationId = params.get("location");

    if (locationId) {
        try {
        const res = await fetch("locations.csv");
        const text = await res.text();
        const lines = text.trim().split("\n");
        const headers = lines[0].split(",").map(h => h.trim());

        let matchName = null;

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(",").map(c => c.trim());
            const row = {};
            headers.forEach((h, idx) => (row[h] = cols[idx]));

            if (row["Criteria ID"] && row["Criteria ID"].replace(/"/g, "") === locationId) {
            matchName = row["Name"].replace(/"/g, "").trim();
            break;
            }
        }

        setLocationName(matchName);
        return;
        } catch (e) {
        console.error("CSV geo lookup failed:", e);
        // fall through to IP geo
        }
    }

    // 2. No ?location= (or CSV failed): use IP-based geolocation
    try {
        const res = await fetch("https://ipapi.co/json/"); // or another IP geo API
        const data = await res.json();

        const name =
        data.city ||
        data.region ||
        data.country_name ||
        DEFAULT_LOCATION_NAME;

        setLocationName(name);
    } catch (e) {
        console.error("IP geolocation failed:", e);
        setLocationName(DEFAULT_LOCATION_NAME);
    }
})();
