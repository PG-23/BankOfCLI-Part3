import type { ReactNode } from 'react';

interface InfoBannerProps{
    variant?: 'info' | 'error';
    children:ReactNode;
}

//Style for each variant, kept in one object so the JSX below stays short.
// All colours come from the tokens in index.css; no hex codes.

const STYLES = {
    info:{
        box:'bg-success-bg text-text-muted',
        icon: 'bi-info-circle text-primary',
    },
    error:{
        box:'bg-error-bg text-error',
        icon: 'bi-exclamation-circle text-error',
    },
};

export function InfoBanner({ variant ='info',children}: InfoBannerProps){
      // Pick the class names for the chosen variant
        const style = STYLES[variant];
        return (
            <div 
            role={variant === 'error' ? 'alert':'note'}
            className={`flex items-start gap-sm rounded-sm px-md py-sm text-small ${style.box} `}>
                <i className={`bi ${style.icon} mt-0.5`} aria-hidden = "true" />
                <p>{children}</p>
            </div>
        );

}
