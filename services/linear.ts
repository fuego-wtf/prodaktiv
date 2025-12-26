import { LinearIssue, LinearAssignee } from '../types';

interface LinearResponse {
  nodes: LinearIssue[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string;
  };
}

export const fetchLinearViewer = async (apiKey: string): Promise<LinearAssignee> => {
  const query = `query { viewer { id name avatarUrl } }`;
  
  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) throw new Error("Failed to fetch viewer");
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    
    return result.data.viewer;
  } catch (error) {
    console.error("Failed to fetch viewer", error);
    throw error;
  }
};

export const fetchLinearUsers = async (apiKey: string): Promise<LinearAssignee[]> => {
    const query = `
      query {
        users(first: 100, filter: { active: { eq: true } }) {
          nodes {
            id
            name
            avatarUrl
          }
        }
      }
    `;
    
    try {
      const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey,
        },
        body: JSON.stringify({ query }),
      });
  
      if (!response.ok) throw new Error("Failed to fetch users");
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      
      return result.data.users.nodes;
    } catch (error) {
      console.error("Failed to fetch users", error);
      return [];
    }
};

export const fetchLinearIssues = async (
    apiKey: string, 
    cursor?: string, 
    queryTerm?: string,
    assigneeId?: string // 'ME' is handled by caller passing the actual ID, or null for all
  ): Promise<LinearResponse> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in settings.");
  }

  const isSearch = !!queryTerm && queryTerm.trim().length > 0;

  // Build Filter
  // Important: Each object in the 'and' array must be wrapped in curly braces.
  const filters: string[] = [`{ state: { type: { nin: ["completed", "canceled"] } } }`];

  if (assigneeId) {
      filters.push(`{ assignee: { id: { eq: "${assigneeId}" } } }`);
  }

  if (isSearch) {
      filters.push(`{ or: [{ title: { contains: $term } }, { description: { contains: $term } }] }`);
  }

  const filterString = `filter: { and: [ ${filters.join(', ')} ] }`;

  const query = `
    query($cursor: String${isSearch ? ', $term: String' : ''}) {
      issues(
        ${filterString}
        first: 50
        after: $cursor
        orderBy: updatedAt
      ) {
        nodes {
          id
          identifier
          title
          url
          state {
            name
            type
          }
          assignee {
            id
            name
            avatarUrl
          }
          team {
            id
            name
            key
          }
          project {
            id
            name
            icon
            color
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      body: JSON.stringify({ 
        query,
        variables: { cursor, term: queryTerm }
      }),
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            throw new Error("Unauthorized: Check your Linear API Key.");
        }
        try {
             const errJson = await response.json();
             if (errJson.errors && errJson.errors.length > 0) {
                 const msg = errJson.errors[0].message;
                 throw new Error(`Linear API Error: ${msg}`);
             }
        } catch (e) {
             if (e instanceof Error && e.message.startsWith("Linear API Error")) {
                 throw e;
             }
        }
        throw new Error(`Linear API Error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error("Linear API Errors:", JSON.stringify(result.errors, null, 2));
      const errorMessages = result.errors.map((e: any) => e.message).join(', ');
      throw new Error(`Linear API: ${errorMessages}`);
    }

    const data = result.data?.issues;

    return {
      nodes: data?.nodes || [],
      pageInfo: data?.pageInfo || { hasNextPage: false, endCursor: '' }
    };
  } catch (error: any) {
    console.error("Failed to fetch Linear issues", error);
    throw error;
  }
};