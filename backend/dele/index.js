import fetch from "node-fetch";
import { categories } from './data copy.js';

(async () => {
    const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJkZXNhaWhhcnNoaXQ3MjJAZ21haWwuY29tIiwiaWF0IjoxNzMxNTA2OTUyLCJleHAiOjE3MzE1OTMzNTJ9.x97zvbopmZmcu8RAYVWdAWw7M5Jjjnj4_LqmAjhf6gK4Qa7u7M2k1LaY1HfaYR5zloD9eumkfRaYuXTQwZJJNQ";

    console.log("Making request!\n");

    for (let i = 0; i < categories.length; i++) {
        console.log(`Sending category: ${categories[i].name}`);

        try {
            const response = await fetch(`http://localhost:5006/api/categories`, {
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
