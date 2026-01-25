import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const RANKS = {
    NUTZER: 'nutzer',   // 0€
    KUNDE: 'kunde',     // First Order
    VIP: 'vip',         // > 500€
    VIP_PLUS: 'vip_plus', // > 1500€
    NEBULA: 'nebula'    // > 5000€ (Invite only logic can be handled manually or by threshold)
};

const THRESHOLDS = {
    [RANKS.VIP]: 500,
    [RANKS.VIP_PLUS]: 1500,
    [RANKS.NEBULA]: 5000
};

/**
 * Calculates new rank based on total spend
 * @param {number} totalSpend 
 * @param {string} currentRank 
 * @returns {string} newRank
 */
function calculateRank(totalSpend, currentRank) {
    // Never downgrade from Nebula automatically (it's invite/prestige)
    if (currentRank === RANKS.NEBULA) return RANKS.NEBULA;

    if (totalSpend >= THRESHOLDS[RANKS.NEBULA]) return RANKS.NEBULA;
    if (totalSpend >= THRESHOLDS[RANKS.VIP_PLUS]) return RANKS.VIP_PLUS;
    if (totalSpend >= THRESHOLDS[RANKS.VIP]) return RANKS.VIP;
    if (totalSpend > 0) return RANKS.KUNDE;

    return RANKS.NUTZER;
}

const updateRankForUser = async (userId) => {
    try {
        // 1. Calculate total lifetime spend (sum of all completed/shipped requests)
        const aggregate = await prisma.request.aggregate({
            where: {
                user_id: userId,
                status: { in: ['completed', 'shipped'] } // Only count real sales
            },
            _sum: {
                total_sum: true
            }
        });

        const totalSpend = Number(aggregate._sum.total_sum || 0);

        // 2. Get current user
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return;

        // 3. Determine new rank
        const newRank = calculateRank(totalSpend, user.rank);

        // 4. Update if changed or spend updated
        if (user.rank !== newRank || Number(user.lifetime_spend) !== totalSpend) {
            console.log(`🚀 Updating User ${user.email}: Spend ${totalSpend}€ | Rank ${user.rank} -> ${newRank}`);

            await prisma.user.update({
                where: { id: userId },
                data: {
                    lifetime_spend: totalSpend,
                    rank: newRank,
                    // Legacy support
                    is_vip: ['vip', 'vip_plus', 'nebula'].includes(newRank)
                }
            });

            return { oldRank: user.rank, newRank, totalSpend };
        }
    } catch (error) {
        console.error('Error updating rank:', error);
    }
};

export {
    updateRankForUser,
    RANKS
};
