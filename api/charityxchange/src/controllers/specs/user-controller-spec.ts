import {SchemaObject} from '@loopback/rest';

const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 6,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

const packageSubscriptionSchema: SchemaObject = {
  type: 'object',
  required: ['id', 'price', 'discounted_price', 'total_links'],
  properties: {
    id: {
      type: 'number',
    },
    price: {
      type: 'number',
    },
    discounted_price: {
      type: 'number',
    },
    total_links: {
      type: 'number',
    },
    title: {
      type: 'string',
    },
    features: {
      type: 'object',
    },
  },
};
export const PackageSubscriptionRequestBody = {
  description: 'The input of subscribeplan function',
  required: true,
  content: {
    'application/json': {schema: packageSubscriptionSchema},
  },
};
