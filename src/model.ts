import * as ws from 'ws';

export const APP_VERSION = process.env.npm_package_version ?? 'NA';

export type UserEstimate = {
    username: string;
    estimate?: string;
    estimatedAt?: Date;
};

export type PokerPlanningSession = {
    version: string;
    lastUpdate: Date;
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
