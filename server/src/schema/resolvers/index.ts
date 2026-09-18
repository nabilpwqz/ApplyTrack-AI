import { adminResolvers } from './adminResolvers';
import { applicationResolvers } from './applicationResolvers';
import { authResolvers } from './authResolvers';
import { contactResolvers } from './contactResolvers';
import { goalResolvers } from './goalResolvers';
import { storyResolvers } from './storyResolvers';
import { subscriptionResolvers } from './subscriptionResolvers';

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...applicationResolvers.Query,
    ...goalResolvers.Query,
    ...contactResolvers.Query,
    ...storyResolvers.Query,
    ...subscriptionResolvers.Query,
    ...adminResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...applicationResolvers.Mutation,
    ...goalResolvers.Mutation,
    ...contactResolvers.Mutation,
    ...storyResolvers.Mutation,
    ...subscriptionResolvers.Mutation,
    ...adminResolvers.Mutation,
  },
};
