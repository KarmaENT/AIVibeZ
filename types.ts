export enum SubscriptionTier {
    Free = 'Free',
    Pro = 'Pro',
    Enterprise = 'Enterprise',
}

export interface User {
    id: string;
    email: string;
    subscriptionTier: SubscriptionTier;
}

export interface CodeFile {
    path: string;
    content: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}