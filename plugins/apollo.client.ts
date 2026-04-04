import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  from
} from "@apollo/client/core";
import { AUTH_STORAGE_KEYS } from "~/utils/auth";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const httpLink = new HttpLink({
    uri: config.public.graphqlEndpoint,
    fetch
  });

  const authLink = new ApolloLink((operation, forward) => {
    const accessToken = import.meta.client
      ? window.localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)
      : null;

    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {})
      }
    }));

    return forward(operation);
  });

  const apollo = new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache()
  });

  return {
    provide: {
      apollo
    }
  };
});
