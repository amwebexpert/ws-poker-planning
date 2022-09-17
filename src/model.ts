import * as ws from 'ws';

export type UserEstimate = {
    username: string;
    estimate?: string;
    estimatedAt?: Date;
};

export type PokerPlanningSession = {
    lastUpdate: Date;
    estimates: UserEstimate[];
};

export type Room = {
    uuid: string;
    members: Set<ws.WebSocket>;
    state: PokerPlanningSession;
};

export type MessageType = 'reset' | 'vote';

export type UserMessage = {
    type: MessageType;
    payload?: unknown;
};
