/**
 * Fetches GitHub profile data using the provider_token from the Supabase
 * session (already granted via GitHub OAuth login — no extra auth needed).
 */
import { createClient } from "./supabase-browser";

export async function fetchGithubData() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.provider_token;
  if (!token) {
    throw new Error(
      "No GitHub access token found. Try signing out and back in."
    );
  }

  const headers = { Authorization: `Bearer ${token}` };

  const userRes = await fetch("https://api.github.com/user", { headers });
  if (!userRes.ok) throw new Error("Failed to fetch GitHub profile");
  const user = await userRes.json();

  const reposRes = await fetch(
    `https://api.github.com/users/${user.login}/repos?sort=updated&per_page=20`,
    { headers }
  );
  if (!reposRes.ok) throw new Error("Failed to fetch GitHub repos");
  const repos = await reposRes.json();

  return {
    username: user.login,
    name: user.name,
    bio: user.bio,
    public_repos: user.public_repos,
    followers: user.followers,
    repos: repos.map((r: any) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      updated_at: r.updated_at,
      topics: r.topics,
    })),
  };
}