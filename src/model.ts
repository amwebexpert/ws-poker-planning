import * as ws from 'ws';

export type UserSocket = {
    socket: ws.WebSocket;
    browser: string;
    ip: string;
};

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
    sockets: Set<UserSocket>;
    state: PokerPlanningSession;
};

export type MessageType = 'reset' | 'vote' | 'remove';

export type UserMessage<TPayload = unknown> = {
    type: MessageType;
    payload: TPayload;
};

export type UserMessageEstimate = UserMessage<UserEstimate>;
export type UserMessageReset = UserMessage<never>;
export type UserMessageRemove = UserMessage<string>;

export const isUserMessageEstimate = (message: UserMessage): message is UserMessageEstimate =>
    message.type === 'vote';
export const isUserMessageReset = (message: UserMessage): message is UserMessageReset =>
    message.type === 'reset';
export const isUserMessageRemove = (message: UserMessage): message is UserMessageRemove =>
    message.type === 'remove';
