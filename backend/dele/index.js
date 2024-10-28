import fetch from "node-fetch";
import { categories } from './data.js';

(async () => {
    const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJkZXNhaWhhcnNoaXQ3MjJAZ21haWwuY29tIiwiaWF0IjoxNzMwMDQzNzQxLCJleHAiOjE3MzAxMzAxNDF9.3B5o2URTWtYsTkZq4N07Y3hu1rAQuHUU_wlZQw5ld3dtRv99dU019O0x-osm5TiL0e_AcGyu2MxeJKr5CLatyg";

    console.log("Making request!\n");

    for (let i = 0; i < categories.length; i++) {
        console.log(`Sending category: ${categories[i].name}`);

        try {
            const response = await fetch(`http://localhost:5003/api/categories`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(categories[i])
            });

            if (!response.ok) {
                // If the response status is not 200, log the status and status text
                console.log(`Error: ${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                // Parse JSON response if content type is application/json
                const data = await response.json();
                console.log(data);
            } else {
                // If the content type is not JSON, log the text response
                const text = await response.text();
                console.log("Received non-JSON response:", text);
            }
        } catch (error) {
            console.error("Request failed:", error);
        }
    }
})();
