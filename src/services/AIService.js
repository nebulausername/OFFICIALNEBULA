import { ai } from '../lib/insforge';

/**
 * Nebula AI Service
 * Generates dynamic content and insights
 */
class AIService {

    /**
     * Generate a "hype" description for a product
     * @param {object} product 
     * @returns {Promise<string>}
     */
    async getProductHype(product) {
        try {
            if (!product) return "Experience the future of Nebula.";

            // Use InsForge AI to generate text
            // Falling back to mock if AI service is not configured or fails
            try {
                const prompt = `Generate a short, 1-sentence, high-energy marketing hook for a premium shisha/vape product named "${product.name}". Use words like "Premium", "Exclusive", "Cosmic", "Next-level". Language: German.`;

                const response = await ai.generateText({
                    model: 'openai/gpt-4o-mini',
                    prompt: prompt,
                    maxTokens: 50
                });

                return response.text || this.getMockHype(product);
            } catch (e) {
                console.warn('AI Service unavailable, using fallback:', e);
                return this.getMockHype(product);
            }
        } catch (error) {
            console.error('AIService Error:', error);
            return "Next Level Shisha Experience.";
        }
    }

    getMockHype(product) {
        const hooks = [
            `Erlebe mit ${product.name} eine neue Dimension des Geschmacks.`,
            "High-End Performance trifft auf kosmisches Design.",
            "Das Must-Have für deine nächste Session.",
            "Unvergleichliche Qualität, die man bei jedem Zug spürt."
        ];
        return hooks[Math.floor(Math.random() * hooks.length)];
    }

    /**
     * Get personalized recommendation reason
     */
    async getRecommendationReason(product, userPreferences) {
        // Placeholder for personalized AI logic
        return "Passt perfekt zu deinem Style.";
    }
}

export const aiService = new AIService();
export default aiService;
