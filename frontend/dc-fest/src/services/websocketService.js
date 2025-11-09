import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// Polyfill for global if not available
if (typeof global === 'undefined') {
    window.global = window;
}

/**
 * Get the base backend URL without any path prefixes
 * Extracts just the protocol + domain + port from the backend URL
 */
const getBaseBackendUrl = () => {
    if (import.meta.env.VITE_APP_NODE_ENV === "production") {
        const backendUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:5003";
        try {
            const url = new URL(backendUrl);
            // Return just the origin (protocol + host + port)
            return url.origin;
        } catch {
            // If URL parsing fails, return as is
            return backendUrl;
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

    const socket = new SockJS(`${BACKEND_URL}/ws`);
    stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
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
            console.log("❌ WebSocket disconnected");
        },
        onStompError: (frame) => {
            console.error("❌ STOMP error:", frame);
        },
    });

    stompClient.activate();
    return stompClient;
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

