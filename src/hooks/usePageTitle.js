import { useEffect } from 'react';

export function usePageTitle(title) {
    useEffect(() => {
        const prevTitle = document.title;
        const siteTitle = 'Nebula Shop';
        document.title = title ? `${title} | ${siteTitle}` : siteTitle;

        return () => {
            document.title = prevTitle;
        };
    }, [title]);
}
