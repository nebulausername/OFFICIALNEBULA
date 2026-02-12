import { realtime } from '../lib/insforge';

/**
 * Nebula Realtime Service
 * Handles live viewer counts and stock updates via InsForge Realtime SDK
 * 
 * InsForge Realtime API:
 *   realtime.connect() → connect to WebSocket
 *   realtime.subscribe(channel) → subscribe to channel
 *   realtime.on(event, callback) → listen for events
 *   realtime.publish(channel, event, payload) → send events
 *   realtime.unsubscribe(channel) → unsubscribe
 *   realtime.disconnect() → disconnect
 */
class RealtimeService {
    constructor() {
        this.subscriptions = new Set();
        this.viewers = new Map();
        this.connected = false;
        this.connecting = false;
    }

    /**
     * Ensure we're connected to the realtime server
     */
    async ensureConnected() {
        if (this.connected || this.connecting) return;
        this.connecting = true;
        try {
            await realtime.connect();
            this.connected = true;
            realtime.on('disconnect', () => {
                this.connected = false;
            });
        } catch (err) {
            console.warn('Realtime connection failed:', err.message);
            this.connected = false;
        } finally {
            this.connecting = false;
        }
    }

    /**
     * Subscribe to product updates (stock, viewers)
     * @param {string} productId 
     * @param {function} callback 
     */
    subscribeToProduct(productId, callback) {
        if (!productId) return () => { };

        const channelId = `product:${productId}`;

        // Provide immediate mock viewer count for UI "liveness"
        const mockViewers = Math.floor(Math.random() * 5) + 1;
        this.viewers.set(productId, mockViewers);
        callback({ type: 'viewers', count: mockViewers });

        // Try to subscribe in the background (non-blocking)
        this._subscribeAsync(channelId, productId, callback);

        return () => {
            // Cleanup
            try {
                if (this.subscriptions.has(channelId)) {
                    realtime.unsubscribe(channelId);
                    this.subscriptions.delete(channelId);
                }
            } catch (e) {
                console.warn('Realtime cleanup error:', e);
            }
        };
    }

    async _subscribeAsync(channelId, productId, callback) {
        if (this.subscriptions.has(channelId)) return;

        try {
            await this.ensureConnected();
            if (!this.connected) return;

            const response = await realtime.subscribe(channelId);
            if (response.ok) {
                this.subscriptions.add(channelId);

                // Listen for view events on this product
                realtime.on('view', (payload) => {
                    if (payload?.productId === productId) {
                        this.viewers.set(productId, (this.viewers.get(productId) || 0) + 1);
                        callback({ type: 'viewers', count: this.viewers.get(productId) });
                    }
                });
            }
        } catch (err) {
            console.warn(`Failed to subscribe to ${channelId}:`, err.message);
        }
    }

    /**
     * Broadcast that current user is viewing a product
     * @param {string} productId 
     */
    async viewProduct(productId) {
        const channelId = `product:${productId}`;
        if (!this.subscriptions.has(channelId)) return;

        try {
            await realtime.publish(channelId, 'view', { productId });
        } catch (err) {
            // Silently fail — not critical
        }
    }
}

export const realtimeService = new RealtimeService();
export default realtimeService;
