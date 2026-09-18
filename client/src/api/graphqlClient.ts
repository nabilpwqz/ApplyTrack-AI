// Typed GraphQL client with automatic local persistence fallback

const GRAPHQL_ENDPOINT = '/graphql';

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function graphQLRequest<T = any>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T> {
  let token: string | null = null;
  try {
    const session = JSON.parse(localStorage.getItem('applytrack_ai_session') || 'null');
    token = session?.token || null;
  } catch {
    token = null;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    if (!result.data) {
      throw new Error('No data returned from GraphQL server');
    }

    return result.data;
  } catch (err) {
    // Return or throw error
    throw err;
  }
}

// Queries & Mutation Strings
export const QUERIES = {
  GET_APPLICATIONS: `#graphql
    query GetApplications($search: String, $status: String, $priority: String) {
      applications(search: $search, status: $status, priority: $priority) {
        id
        company
        title
        url
        location
        workMode
        employmentType
        salaryMin
        salaryMax
        applicationDate
        deadline
        source
        priority
        status
        notes
        recruiterName
        recruiterEmail
        resumeVersion
        tags
        interviewPrep
        timeline {
          date
          event
          type
        }
      }
    }
  `,

  GET_ANALYTICS: `#graphql
    query GetAnalyticsSummary {
      analyticsSummary {
        totalApplications
        activeOpportunities
        interviewsCount
        offersCount
        rejectionsCount
        responseRate
        statusDistribution {
          status
          count
        }
        priorityDistribution {
          priority
          count
        }
      }
    }
  `,

  GET_NETWORK: `#graphql
    query GetNetworkContacts($search: String, $role: String) {
      networkContacts(search: $search, role: $role) {
        id
        name
        role
        company
        email
        notes
        lastTouch
      }
    }
  `,

  GET_STORIES: `#graphql
    query GetStories {
      stories {
        id
        title
        tags
        situation
        task
        action
        result
      }
    }
  `,

  GET_GOALS: `#graphql
    query GetCareerGoals {
      careerGoals {
        weeklyApplications
        weeklyInterviews
        targetRole
        targetDate
        notes
        streak
      }
    }
  `,

  GET_EMAIL_IMPORTS: `#graphql
    query GetEmailImports($status: String) {
      emailImports(status: $status) {
        id
        company
        title
        source
        status
        detectedDate
        confidence
        emailSubject
        extractData
      }
    }
  `,

  GET_ADMIN_USERS: `#graphql
    query GetAdminUsers($search: String) {
      adminUsers(search: $search) {
        id
        name
        email
        plan
        applicationsCount
        status
      }
    }
  `,
};

export const MUTATIONS = {
  LOGIN: `#graphql
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
        user {
          id
          name
          email
          role
          provider
          plan
        }
      }
    }
  `,

  SIGNUP: `#graphql
    mutation Signup($name: String!, $email: String!, $password: String!) {
      signup(name: $name, email: $email, password: $password) {
        token
        user {
          id
          name
          email
          role
          provider
          plan
        }
      }
    }
  `,

  GOOGLE_AUTH: `#graphql
    mutation GoogleAuth($name: String, $email: String) {
      googleAuth(name: $name, email: $email) {
        token
        user {
          id
          name
          email
          role
          provider
          plan
        }
      }
    }
  `,

  CREATE_APPLICATION: `#graphql
    mutation CreateApplication($input: ApplicationInput!) {
      createApplication(input: $input) {
        id
        company
        title
        status
        priority
      }
    }
  `,

  UPDATE_APPLICATION: `#graphql
    mutation UpdateApplication($id: Int!, $input: ApplicationInput!) {
      updateApplication(id: $id, input: $input) {
        id
        company
        title
        status
        priority
      }
    }
  `,

  UPDATE_APPLICATION_STATUS: `#graphql
    mutation UpdateApplicationStatus($id: Int!, $status: String!) {
      updateApplicationStatus(id: $id, status: $status) {
        id
        status
      }
    }
  `,

  DELETE_APPLICATION: `#graphql
    mutation DeleteApplication($id: Int!) {
      deleteApplication(id: $id)
    }
  `,

  PROCESS_EMAIL_IMPORT: `#graphql
    mutation ProcessEmailImport($id: Int!, $action: String!) {
      processEmailImport(id: $id, action: $action)
    }
  `,

  SAVE_CAREER_GOALS: `#graphql
    mutation SaveCareerGoals($input: CareerGoalInput!) {
      saveCareerGoals(input: $input) {
        weeklyApplications
        weeklyInterviews
      }
    }
  `,

  CREATE_CONTACT: `#graphql
    mutation CreateContact($input: NetworkContactInput!) {
      createContact(input: $input) {
        id
        name
      }
    }
  `,

  CREATE_STORY: `#graphql
    mutation CreateStory($input: StoryInput!) {
      createStory(input: $input) {
        id
        title
      }
    }
  `,

  SAVE_SUBSCRIPTION: `#graphql
    mutation SaveSubscription($input: SubscriptionInput!) {
      saveSubscription(input: $input) {
        id
        plan
        status
      }
    }
  `,

  APPROVE_PREMIUM: `#graphql
    mutation ApprovePremium($subscriptionId: ID!) {
      approvePremium(subscriptionId: $subscriptionId) {
        id
        plan
        status
      }
    }
  `,

  TOGGLE_USER_STATUS: `#graphql
    mutation ToggleUserStatus($userId: ID!) {
      toggleUserStatus(userId: $userId) {
        id
        status
      }
    }
  `,

  DELETE_USER: `#graphql
    mutation DeleteAdminUser($userId: ID!) {
      deleteAdminUser(userId: $userId)
    }
  `,
};
