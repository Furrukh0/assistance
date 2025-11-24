const plans = [
    {
        name: 'Basic Plan',
        subtitle: 'For Small Teams',
        icon: 'ri-book-mark-line',
        monthly: 19,
        yearly: 171,
        features: [
            { text: 'Up to 500 calls/month', included: true },
            { text: 'Standard Conversation Analytics', included: true },
            { text: '1 Customizable Scorecard', included: true },
            { text: 'Basic Reporting & Dashboards', included: true },
            { text: 'Email Support', included: true },
            { text: '1 User License', included: true },
            { text: 'Real-Time Alerts', included: false }
        ],
        popular: false
    },
    {
        name: 'Pro Plan',
        subtitle: 'For Growing Businesses',
        icon: 'ri-medal-fill',
        monthly: 49,
        yearly: 261,
        features: [
            { text: 'Up to 2,500 calls/month', included: true },
            { text: 'Advanced Conversation Analytics', included: true },
            { text: '5 Customizable Scorecards', included: true },
            { text: 'Automated Coaching', included: true },
            { text: 'Real-Time Alerts', included: true },
            { text: 'Priority Email & Chat Support', included: true },
            { text: '5 User Licenses', included: true }
        ],
        popular: true
    },
    {
        name: 'Enterprise Plan',
        subtitle: 'For Large Organizations',
        icon: 'ri-stack-fill',
        monthly: 'Custom',
        yearly: 'Custom',
        features: [
            { text: 'Unlimited calls/month', included: true },
            { text: 'Comprehensive Analytics & Trends', included: true },
            { text: 'Unlimited Customizable Scorecards', included: true },
            { text: 'Automated Coaching & Root Cause Analysis', included: true },
            { text: 'Omnichannel Analysis', included: true },
            { text: 'Dedicated Support & Onboarding', included: true },
            { text: 'Custom Integrations & APIs', included: true }
        ],
        popular: false
    }
];

export { plans };