
import React from 'react';

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor"
};

export const IADSS_Icon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="256" height="256" rx="60" fill="#14532d"/>
        <path d="M128 55C94.12 55 67 82.12 67 116C67 141.6 94.75 186.25 128 201C161.25 186.25 189 141.6 189 116C189 82.12 161.88 55 128 55Z" fill="#22C55E"/>
        <path d="M128 116V200.5" stroke="white" strokeOpacity="0.8" strokeWidth="6" strokeLinecap="round"/>
        <path d="M128 116L104 92" stroke="white" strokeOpacity="0.8" strokeWidth="6" strokeLinecap="round"/>
        <path d="M128 116L152 92" stroke="white" strokeOpacity="0.8" strokeWidth="6" strokeLinecap="round"/>
        <path d="M128 140L104 116" stroke="white" strokeOpacity="0.8" strokeWidth="6" strokeLinecap="round"/>
        <path d="M128 140L152 116" stroke="white" strokeOpacity="0.8" strokeWidth="6" strokeLinecap="round"/>
        <path d="M110 148H98" stroke="white" strokeOpacity="0.8" strokeWidth="6" strokeLinecap="round"/>
        <path d="M158 148H146" stroke="white" strokeOpacity="0.8" strokeWidth="6" strokeLinecap="round"/>
    </svg>
);


export const DashboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12a8.25 8.25 0 1116.5 0 8.25 8.25 0 01-16.5 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v9h9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75a8.25 8.25 0 00-8.25 8.25" />
  </svg>
);

export const SoilIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75c4.828 0 8.25-3.134 8.25-7.5 0-4.366-3.422-7.5-8.25-7.5s-8.25 3.134-8.25 7.5c0 4.366 3.422 7.5 8.25 7.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25v.01M12 9.75v.01M12 5.25v.01" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 14.25c0-4.366 3.422-7.5 8.25-7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.25c0-4.366-3.422-7.5-8.25-7.5" />
  </svg>
);

export const LeafIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75c4.828 0 8.25-3.134 8.25-7.5s-3.422-7.5-8.25-7.5-8.25 3.134-8.25 7.5S7.172 21.75 12 21.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75V2.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75c-4.828 0-8.25-3.134-8.25-7.5" />
  </svg>
);

export const GuideIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

export const MarketIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.517L21.75 6M2.25 6l4.5 4.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6v6m0-6h-6" />
  </svg>
);

export const FertilizerIcon = ({ className }: { className?: string }) => (
    <svg className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
    </svg>
);

export const ChatIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
  </svg>
);

export const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const SendIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

export const ProfileIcon = ({ className }: { className?: string }) => (
  <svg className={className} {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
