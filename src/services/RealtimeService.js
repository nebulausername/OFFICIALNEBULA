import { realtime } from '../lib/insforge';

/**
 * Nebula Realtime Service
 * Handles live viewer counts and stock updates
 */
class RealtimeService {
    constructor() {
        this.subscriptions = new Map();
        this.viewers = new Map();
    }

    /**
     * Subscribe to product updates (stock, viewers)
     * @param {string} productId 
     * @param {function} callback 
     */
    subscribeToProduct(productId, callback) {
        if (!productId) return () => { };

        const channelId = `product:${productId}`;

        // If not already subscribed, create subscription
        if (!this.subscriptions.has(channelId)) {
            const channel = realtime.channel(channelId)
                .on('broadcast', { event: 'view' }, ({ payload }) => {
                    this.viewers.set(productId, (this.viewers.get(productId) || 0) + 1);
                    callback({ type: 'viewers', count: this.viewers.get(productId) });
                })
                .subscribe();

            this.subscriptions.set(channelId, channel);
        }

        // Simulate immediate viewer count for UI "liveness"
        // In a real scenario, we'd fetch current presence count
        const mockViewers = Math.floor(Math.random() * 5) + 1;
        this.viewers.set(productId, mockViewers);
        callback({ type: 'viewers', count: mockViewers });

        return () => {
            // Cleanup: Unsubscribe if no more listeners (simplified for now)
            // In a real app, we would track listener count per channel
            try {
                // Optional: this.subscriptions.get(channelId)?.unsubscribe();
                // keeping channel open for now for shared state
            } catch (e) {
                console.warn('Realtime cleanup error:', e);
            }
        };
    }

    /**
     * Broadcast that current user is viewing a product
     * @param {string} productId 
     */
    viewProduct(productId) {
        const channelId = `product:${productId}`;
        const channel = this.subscriptions.get(channelId);
        if (channel) {
            channel.send({
                type: 'broadcast',
                event: 'view',
                payload: { productId }
            });
        }
    }
}

export const realtimeService = new RealtimeService();
export default realtimeService;
