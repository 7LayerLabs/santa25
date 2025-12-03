import { init } from '@instantdb/react';

// Secret Santa InstantDB Schema
type Schema = {
  participants: {
    id: string;
    name: string;
    isTaken: boolean;
    pickedBy: string | null;
    ticketNumber: number;
  };
  picks: {
    id: string;
    pickerName: string;
    recipientName: string;
    ticketNumber: number;
    timestamp: number;
  };
};

const APP_ID = 'd9cb0c2b-d29b-4828-9dd3-f7698413da9f';

export const db = init<Schema>({ appId: APP_ID });
