import React from 'react';
import { useAuth, ACCESS_LEVELS } from '@/lib/AuthContext';
import TeaserOverlay from './TeaserOverlay';

/**
 * GatedContent - Wrapper that shows blur/teaser for non-verified users
 * 
 * Usage:
 * <GatedContent requiredLevel="verified" fallback={<TeaserOverlay />}>
 *   <ProductPrice price={99.99} />
 * </GatedContent>
 */
export default function GatedContent({
    children,
    requiredLevel = ACCESS_LEVELS.VERIFIED,
    fallback = null,
    blurIntensity = 'medium', // 'light', 'medium', 'heavy'
    showTeaser = true,
    teaserMessage = null,
    className = ''
}) {
    const { hasAccess, accessLevel, isTelegram } = useAuth();

    // If user has required access, show content normally
    if (hasAccess(requiredLevel)) {
        return <>{children}</>;
    }

    // Get blur class based on intensity
    const blurClasses = {
        light: 'blur-sm',
        medium: 'blur-md',
        heavy: 'blur-lg'
    };

    // If custom fallback provided, use it
    if (fallback) {
        return (
            <div className={`relative ${className}`}>
                {/* Blurred content behind */}
                <div className={`${blurClasses[blurIntensity]} select-none pointer-events-none`}>
                    {children}
                </div>
                {/* Overlay on top */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {fallback}
                </div>
            </div>
        );
    }

    // Default teaser overlay
    if (showTeaser) {
        return (
            <div className={`relative ${className}`}>
                {/* Blurred content behind */}
                <div className={`${blurClasses[blurIntensity]} select-none pointer-events-none`}>
                    {children}
                </div>
                {/* TeaserOverlay on top */}
                <div className="absolute inset-0">
                    <TeaserOverlay
                        compact={true}
                        message={teaserMessage}
                    />
                </div>
            </div>
        );
    }

    // Just blur without overlay
    return (
        <div className={`${blurClasses[blurIntensity]} select-none pointer-events-none ${className}`}>
            {children}
        </div>
    );
}

/**
 * GatedAction - For buttons/actions that require verification
 * Instead of blurring, it intercepts the action and shows verification modal
 */
export function GatedAction({
    children,
    requiredLevel = ACCESS_LEVELS.VERIFIED,
    onBlocked = null,
    className = ''
}) {
    const { hasAccess, navigateToLogin } = useAuth();

    if (hasAccess(requiredLevel)) {
        return <>{children}</>;
    }

    // Clone child and intercept onClick
    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (onBlocked) {
            onBlocked();
        } else {
            // Default: navigate to login
            navigateToLogin();
        }
    };

    return (
        <div onClick={handleClick} className={`cursor-pointer ${className}`}>
            {children}
        </div>
    );
}
