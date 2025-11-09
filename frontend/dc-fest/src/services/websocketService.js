import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// Polyfill for global if not available
if (typeof global === 'undefined') {
    window.global = window;
}

/**
 * Get the base backend URL for WebSocket connection
 * In production, preserve the full path if it exists (e.g., /fest/backend/)
 * WebSocket endpoint will be appended to this base URL
 */
const getBaseBackendUrl = () => {
    if (import.meta.env.VITE_APP_NODE_ENV === "production") {
        const backendUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:5003";
        try {
            const url = new URL(backendUrl);
            // In production, preserve the path if it exists (e.g., /fest/backend/)
            // Remove trailing slash if present, we'll add it when constructing the WebSocket URL
            let baseUrl = url.origin;
            if (url.pathname && url.pathname !== "/") {
                // Preserve the path (e.g., /fest/backend)
                baseUrl = url.origin + url.pathname.replace(/\/$/, ""); // Remove trailing slash
            }
            console.log("🔌 WebSocket backend URL:", baseUrl);
            return baseUrl;
        } catch (error) {
            console.error("Error parsing backend URL:", error);
            // If URL parsing fails, try to extract manually
            if (backendUrl.startsWith("http://") || backendUrl.startsWith("https://")) {
                // Extract protocol + host + path (without trailing slash)
                const match = backendUrl.match(/^(https?:\/\/[^/]+(?:\/[^/]+)*)/);
                if (match) {
                    return match[1].replace(/\/$/, ""); // Remove trailing slash
                }
            }
            return backendUrl.replace(/\/$/, ""); // Remove trailing slash
        }
    }
    return "http://localhost:5003";
};

const BACKEND_URL = getBaseBackendUrl();

let stompClient = null;
const connectionCallbacks = [];

/**
 * Initialize WebSocket connection using STOMP over SockJS
 */
export const initWebSocket = () => {
    if (stompClient?.connected) {
        return stompClient;
    }

    const wsUrl = `${BACKEND_URL}/ws`;

    // In production, use only XHR transports to avoid WebSocket upgrade issues with proxies/load balancers
    // WebSocket connections often fail in production due to proxy/load balancer configurations
    // XHR transports are more reliable and don't require WebSocket upgrade support
    const isProduction = import.meta.env.VITE_APP_NODE_ENV === "production";
    const transports = isProduction
        ? ['xhr-streaming', 'xhr-polling']  // Only XHR in production (no WebSocket to avoid errors)
        : ['websocket', 'xhr-streaming', 'xhr-polling']; // Prefer WebSocket in development

    console.log("🔌 Initializing WebSocket connection to:", wsUrl);
    console.log("📡 Transport priority:", transports.join(" → "));

    try {
        const socket = new SockJS(wsUrl, null, {
            transports: transports,
            timeout: 10000, // Increased timeout for production
        });

        // Track connection state to suppress unnecessary errors
        let connectionEstablished = false;

        stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                connectionEstablished = true;
                console.log("✅ WebSocket connected via STOMP");
                // Execute all queued callbacks
                connectionCallbacks.forEach(callback => {
                    try {
                        callback();
                    } catch (error) {
                        console.error("Error executing connection callback:", error);
                    }
                });
                connectionCallbacks.length = 0; // Clear the queue
            },
            onDisconnect: () => {
                connectionEstablished = false;
                console.log("❌ WebSocket disconnected");
            },
            onStompError: (frame) => {
                // Only log STOMP errors if connection was never established
                if (!connectionEstablished) {
                    console.error("❌ STOMP error:", frame);
                } else {
                    console.warn("⚠️ STOMP warning (connection active):", frame);
                }
            },
            onWebSocketError: (event) => {
                // Only log WebSocket errors if connection was never established
                // This helps suppress fallback transport errors when connection succeeds
                if (!connectionEstablished) {
                    console.error("❌ WebSocket error:", event);
                } else {
                    // Connection succeeded via fallback, this is just informational
                    console.debug("ℹ️ WebSocket transport fallback (connection active)");
                }
            },
        });

        stompClient.activate();
        return stompClient;
    } catch (error) {
        console.error("❌ Failed to initialize WebSocket:", error);
        return null;
    }
};

/**
 * Get the current STOMP client instance
 */
export const getStompClient = () => {
    if (!stompClient) {
        return initWebSocket();
    }
    return stompClient;
};

/**
 * Disconnect WebSocket
 */
export const disconnectWebSocket = () => {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
    }
};

/**
 * Subscribe to quota updates for a specific event
 */
export const subscribeToQuotaUpdates = (availableEventId, callback) => {
    const client = getStompClient();
    let subscription = null;

    const doSubscribe = () => {
        const currentClient = getStompClient();
        if (currentClient && currentClient.connected) {
            try {
                subscription = currentClient.subscribe(
                    `/topic/event/${availableEventId}/quota-update`,
                    (message) => {
                        try {
                            const data = JSON.parse(message.body);
                            console.log(`📨 Quota update for event ${availableEventId}:`, data);
                            callback(data);
                        } catch (error) {
                            console.error("Error parsing quota update message:", error);
                        }
                    }
                );
                console.log(`✅ Subscribed to quota updates for event ${availableEventId}`);
            } catch (error) {
                console.error("Error subscribing to quota updates:", error);
            }
        } else {
            console.warn("STOMP client not connected, subscription will be queued");
        }
    };

    if (client && client.connected) {
        doSubscribe();
    } else {
        // Queue the subscription for when connection is established
        connectionCallbacks.push(doSubscribe);
        console.log(`⏳ Queued quota update subscription for event ${availableEventId}`);
    }

    return {
        unsubscribe: () => {
            if (subscription) {
                subscription.unsubscribe();
                console.log(`🔌 Unsubscribed from quota updates for event ${availableEventId}`);
            }
        }
    };
};

/**
 * Subscribe to participant added events
 */
export const subscribeToParticipantAdded = (availableEventId, callback) => {
    const client = getStompClient();
    let subscription = null;

    const doSubscribe = () => {
        const currentClient = getStompClient();
        if (currentClient && currentClient.connected) {
            try {
                subscription = currentClient.subscribe(
                    `/topic/event/${availableEventId}/participant-added`,
                    (message) => {
                        try {
                            const data = JSON.parse(message.body);
                            callback(data);
                        } catch (error) {
                            console.error("Error parsing participant added message:", error);
                        }
                    }
                );
            } catch (error) {
                console.error("Error subscribing to participant added:", error);
            }
        }
    };

    if (client && client.connected) {
        doSubscribe();
    } else {
        connectionCallbacks.push(doSubscribe);
    }

    return {
        unsubscribe: () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        }
    };
};

/**
 * Subscribe to participant removed events
 */
export const subscribeToParticipantRemoved = (availableEventId, callback) => {
    const client = getStompClient();
    let subscription = null;

    const doSubscribe = () => {
        const currentClient = getStompClient();
        if (currentClient && currentClient.connected) {
            try {
                subscription = currentClient.subscribe(
                    `/topic/event/${availableEventId}/participant-removed`,
                    (message) => {
                        try {
                            const data = JSON.parse(message.body);
                            callback(data);
                        } catch (error) {
                            console.error("Error parsing participant removed message:", error);
                        }
                    }
                );
            } catch (error) {
                console.error("Error subscribing to participant removed:", error);
            }
        }
    };

    if (client && client.connected) {
        doSubscribe();
    } else {
        connectionCallbacks.push(doSubscribe);
    }

    return {
        unsubscribe: () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        }
    };
};

/**
 * Subscribe to waiting list promotion events
 */
export const subscribeToWaitingListPromotion = (availableEventId, callback) => {
    const client = getStompClient();
    let subscription = null;

    const doSubscribe = () => {
        const currentClient = getStompClient();
        if (currentClient && currentClient.connected) {
            try {
                subscription = currentClient.subscribe(
                    `/topic/event/${availableEventId}/waiting-list-promotion`,
                    (message) => {
                        try {
                            const data = JSON.parse(message.body);
                            callback(data);
                        } catch (error) {
                            console.error("Error parsing waiting list promotion message:", error);
                        }
                    }
                );
            } catch (error) {
                console.error("Error subscribing to waiting list promotion:", error);
            }
        }
    };

    if (client && client.connected) {
        doSubscribe();
    } else {
        connectionCallbacks.push(doSubscribe);
    }

    return {
        unsubscribe: () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        }
    };
};

/**
 * Subscribe to registration status updates
 * This listens for changes in registration deadline status
 */
export const subscribeToRegistrationStatus = (callback) => {
    const client = getStompClient();
    let subscription = null;

    const doSubscribe = () => {
        const currentClient = getStompClient();
        if (currentClient && currentClient.connected) {
            try {
                subscription = currentClient.subscribe(
                    `/topic/registration-status`,
                    (message) => {
                        try {
                            const data = JSON.parse(message.body);
                            console.log("📨 Registration status update received:", data);
                            callback(data);
                        } catch (error) {
                            console.error("Error parsing registration status message:", error);
                        }
                    }
                );
                console.log("✅ Subscribed to registration status updates");
            } catch (error) {
                console.error("Error subscribing to registration status:", error);
            }
        }
    };

    if (client && client.connected) {
        doSubscribe();
    } else {
        connectionCallbacks.push(doSubscribe);
        console.log("⏳ Queued registration status subscription");
    }

    return {
        unsubscribe: () => {
            if (subscription) {
                subscription.unsubscribe();
                console.log("🔌 Unsubscribed from registration status updates");
            }
        }
    };
};

export default {
    initWebSocket,
    getStompClient,
    disconnectWebSocket,
    subscribeToQuotaUpdates,
    subscribeToParticipantAdded,
    subscribeToParticipantRemoved,
    subscribeToWaitingListPromotion,
};

