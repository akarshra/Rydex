type GraphQLVariables = Record<string, unknown>;

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8080/graphql";

export async function graphqlRequest<TData>(
  query: string,
  variables: GraphQLVariables = {},
  token?: string
): Promise<TData> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = (await response.json()) as GraphQLResponse<TData>;

  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.[0]?.message || "GraphQL request failed");
  }

  return payload.data as TData;
}
