import fetch from "node-fetch";
import { categories } from './data.js';

(async () => {
    const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJkZXNhaWhhcnNoaXQ3MjJAZ21haWwuY29tIiwiaWF0IjoxNzMwODE4MjgxLCJleHAiOjE3MzA5MDQ2ODF9.4UR1rONjxFcYuIvtQbLA0lCkJtE_cfHWjxqfGQtaVwEhh9-znYcmV6AYqbxEStNElj550Bup7i4sXo3j4s4t_w";

    console.log("Making request!\n");

    for (let i = 0; i < categories.length; i++) {
        console.log(`Sending category: ${categories[i].name}`);

        try {
            const response = await fetch(`http://13.235.168.107:5006/api/categories`, {
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
