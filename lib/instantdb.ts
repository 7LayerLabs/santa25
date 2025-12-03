import { init, i } from '@instantdb/react';

const APP_ID = 'd9cb0c2b-d29b-4828-9dd3-f7698413da9f';

// Define the schema
const schema = i.schema({
  entities: {
    picks: i.entity({
      pickerName: i.string(),
      recipientName: i.string(),
      ticketNumber: i.number(),
      timestamp: i.number(),
    }),
  },
});

type Schema = typeof schema;

export const db = init<Schema>({ appId: APP_ID });
