import * as ws from 'ws';

export type Room = {
  uuid: string;
  members: Set<ws.WebSocket>;
  state: {
    lastUpdate: Date;
    estimates: UserEstimate[];
  }; 
};

export type UserEstimate = {
  username: string;
  estimate?: string;
  estimatedAt?: Date;
};

export type MessageType = 'reset' | 'vote';

export type UserMessage = {
  type: MessageType;
  payload: unknown;
};
