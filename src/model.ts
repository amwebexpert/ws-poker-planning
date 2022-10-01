import * as ws from 'ws';

export type UserEstimate = {
    username: string;
    estimate?: string;
    estimatedAtISO8601?: string;
};

export type PokerPlanningSession = {
    version: string;
    lastUpdateISO8601: string;
    estimates: UserEstimate[];
};

export type Room = {
    uuid: string;
    members: Set<ws.WebSocket>;
    state: PokerPlanningSession;
};

export type MessageType = 'reset' | 'vote' | 'remove';

export type UserMessage<TPayload = unknown> = {
    type: MessageType;
    payload?: TPayload;
};
