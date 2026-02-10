import { useEffect } from 'react';
import { insforge } from '@/lib/insforge';

/**
 * Custom hook for InsForge Realtime subscriptions
 * @param {string} table - Table name to listen to (e.g., 'requests', 'ticket_messages')
 * @param {Function} callback - Function called when an event occurs
 * @param {Array} events - Array of events to listen to ['INSERT', 'UPDATE', 'DELETE', '*']
 * @param {string} filter - Optional filter (e.g., 'status=eq.open')
 */
export function useRealtime(table, callback, events = ['*'], filter = null) {
    useEffect(() => {
        let channelName = null;
        let eventHandler = null;

        const setupRealtime = async () => {
            if (!insforge || !insforge.realtime) {
                console.error('❌ InsForge Realtime client not initialized correctly.');
                return;
            }

            try {
                // 1. Ensure connection
                await insforge.realtime.connect();

                // 2. Subscribe to channel (Simulating table subscription with channel name)
                channelName = `${table}:updates`;
                const { ok, error } = await insforge.realtime.subscribe(channelName);

                if (!ok) {
                    console.error(`❌ Failed to subscribe to ${channelName}:`, error);
                    return;
                }

                console.log(`✅ Subscribed to ${channelName}`);

                // 3. Listen to events
                // Always listen to 'postgres_changes' as the main event from Realtime
                const socketEvent = 'postgres_changes';

                eventHandler = (payload) => {
                    // Filter by table if available
                    if (payload.table && payload.table !== table) return;

                    // Filter by event type
                    const eventType = (payload.eventType || payload.type || '').toUpperCase();
                    const allowedEvents = events.map(e => e.toUpperCase());

                    if (allowedEvents.includes('*') || allowedEvents.includes(eventType)) {
                        console.log(`⚡ Realtime Event (${table} - ${eventType}):`, payload);
                        callback(payload);
                    }
                };

                insforge.realtime.on(socketEvent, eventHandler);

            } catch (err) {
                console.error('❌ Realtime setup error:', err);
            }
        };

        setupRealtime();

        return () => {
            if (channelName && insforge?.realtime) {
                console.log(`🔌 Unsubscribing from ${channelName}...`);
                try {
                    insforge.realtime.unsubscribe(channelName);
                    if (eventHandler) {
                        insforge.realtime.off('postgres_changes', eventHandler);
                    }
                } catch (e) {
                    console.warn('Realtime cleanup warning:', e);
                }
            }
        };
    }, [table, filter]); // Dependencies
}
