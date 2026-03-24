export type GithubCommit = {
  sha: string;
  message: string;
};

export type GithubPushPayload = {
  head?: string;
  commits?: GithubCommit[];
};

export type GithubEvent = {
  type: string;
  created_at: string;
  repo?: {
    name: string;
  };
  payload?: GithubPushPayload;
};

type GithubRepo = {
  description: string | null;
};

type GithubCommitDetails = {
  commit?: {
    message?: string;
  };
};

export type ActivityView = {
  commitSha: string;
  commitUrl: string;
  commitMessage: string;
  repoName: string;
  repoUrl: string;
  projectDescription: string;
  createdAt: string;
  sourceLabel: "org" | "user";
};

const GITHUB_API_HEADERS = {
  Accept: "application/vnd.github+json"
} as const;

const ORG_NAME = "aimsora";
const FALLBACK_USER = "MinAleDm";
const FALLBACK_REPOSITORY_MATCHERS = [
  "stackmirea",
  "crm-system",
  "teamsync-pro",
  "dailyboost",
  "chayka.me"
] as const;

async function fetchGithubJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url, {
    headers: GITHUB_API_HEADERS
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

function matchesFallbackRepository(repoName: string): boolean {
  const normalizedRepoName = repoName.toLowerCase();

  return (
    normalizedRepoName.startsWith(`${ORG_NAME.toLowerCase()}/`) ||
    FALLBACK_REPOSITORY_MATCHERS.some((matcher) => normalizedRepoName.includes(matcher))
  );
}

async function fetchRepositoryDescription(repoFullName: string): Promise<string> {
  const repoData = await fetchGithubJson<GithubRepo>(`https://api.github.com/repos/${repoFullName}`);
  return repoData?.description ?? "";
}

async function fetchCommitMessage(repoFullName: string, sha: string): Promise<string> {
  const commitData = await fetchGithubJson<GithubCommitDetails>(
    `https://api.github.com/repos/${repoFullName}/commits/${sha}`
  );

  return commitData?.commit?.message?.trim() ?? "";
}

async function mapEventToActivity(
  pushEvent: GithubEvent,
  sourceLabel: ActivityView["sourceLabel"]
): Promise<ActivityView> {
  const commits = pushEvent.payload?.commits ?? [];
  const lastCommit = commits[commits.length - 1];
  const rawCommitSha = pushEvent.payload?.head ?? lastCommit?.sha ?? "";
  const headCommit = commits.find((commit) => commit.sha === rawCommitSha) ?? lastCommit;

  const repoName = pushEvent.repo?.name ?? `${ORG_NAME}/${ORG_NAME}`;
  const repoUrl = `https://github.com/${repoName}`;
  const commitSha = rawCommitSha.slice(0, 7);
  const commitUrl = rawCommitSha ? `${repoUrl}/commit/${rawCommitSha}` : repoUrl;

  let commitMessage = headCommit?.message?.trim() ?? "";
  if (!commitMessage && rawCommitSha) {
    commitMessage = await fetchCommitMessage(repoName, rawCommitSha);
  }

  return {
    commitSha: commitSha || "n/a",
    commitUrl,
    commitMessage: commitMessage || "Коммит без описания",
    repoName,
    repoUrl,
    projectDescription:
      (await fetchRepositoryDescription(repoName)) || "Описание не заполнено на GitHub.",
    createdAt: pushEvent.created_at,
    sourceLabel
  };
}

async function fetchLatestPushFromOrganization(): Promise<ActivityView | null> {
  const events = await fetchGithubJson<GithubEvent[]>(
    `https://api.github.com/orgs/${ORG_NAME}/events?per_page=40`
  );

  const pushEvent = events?.find((event) => event.type === "PushEvent" && Boolean(event.repo?.name));
  if (!pushEvent) {
    return null;
  }

  return mapEventToActivity(pushEvent, "org");
}

async function fetchLatestPushFromUser(): Promise<ActivityView | null> {
  const events = await fetchGithubJson<GithubEvent[]>(
    `https://api.github.com/users/${FALLBACK_USER}/events/public?per_page=50`
  );

  const pushEvent = events?.find((event) => {
    if (event.type !== "PushEvent" || !event.repo?.name) {
      return false;
    }

    return matchesFallbackRepository(event.repo.name);
  });

  if (!pushEvent) {
    return null;
  }

  return mapEventToActivity(pushEvent, "user");
}

export async function fetchLatestPushActivity(): Promise<ActivityView> {
  const organizationActivity = await fetchLatestPushFromOrganization();
  if (organizationActivity) {
    return organizationActivity;
  }

  const userActivity = await fetchLatestPushFromUser();
  if (userActivity) {
    return userActivity;
  }

  throw new Error("Push events not found");
}
