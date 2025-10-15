
import axios from "axios";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function githubRequest(url, token, params = {}) {
    if (!token) {
        console.error(" No GitHub token provided for:", url);
    } else {
        console.log(" Using token:", token.slice(0, 8) + "...");
    }
    const headers = {
        Authorization: `token ${token}`,
        "User-Agent": "github-integration",
        Accept: "application/vnd.github.v3+json",
    };

    try {
        const res = await axios.get(url, { headers, params });
        const remaining = parseInt(res.headers["x-ratelimit-remaining"] || "1", 10);
        const reset = parseInt(res.headers["x-ratelimit-reset"] || "0", 10);
        if (remaining === 0 && reset) {
        const waitMs = Math.max((reset * 1000 - Date.now()) + 1000, 1000);
        await sleep(waitMs);
    }
    return res;
  } catch (err) {
    if (err.response && err.response.status === 403) {
      await sleep(5000);
      return axios.get(url, { headers, params });
    }
    throw err;
  }
}

/**
 * fetch all pages for an endpoint that uses page/per_page paging.
 * processes page by page via the pageHandler callback.
 */
export async function fetchPaginated(url, token, perPage = 100, pageHandler = async (items) => {}) {
  let page = 1;
  while (true) {
    const res = await githubRequest(url, token, { per_page: perPage, page });
    const items = res.data || [];
    if (!items.length) break;
    await pageHandler(items, page);
    if (items.length < perPage) break;
    page += 1;
  }
}

/* Specific fetchers */

export async function fetchUserOrgs(token, pageHandler) {
  await fetchPaginated("https://api.github.com/user/orgs", token, 100, pageHandler);
}

export async function fetchOrgRepos(orgLogin, token, pageHandler) {
  await fetchPaginated(`https://api.github.com/orgs/${orgLogin}/repos`, token, 100, pageHandler);
}

export async function fetchRepoCommits(owner, repo, token, pageHandler) {
  await fetchPaginated(`https://api.github.com/repos/${owner}/${repo}/commits`, token, 100, pageHandler);
}

export async function fetchRepoPulls(owner, repo, token, pageHandler) {
  await fetchPaginated(`https://api.github.com/repos/${owner}/${repo}/pulls`, token, 100, pageHandler);
}

export async function fetchRepoIssues(owner, repo, token, pageHandler) {
  await fetchPaginated(`https://api.github.com/repos/${owner}/${repo}/issues`, token, 100, pageHandler);
}

export async function fetchIssueComments(owner, repo, issue_number, token, pageHandler) {
  await fetchPaginated(`https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}/comments`, token, 100, pageHandler);
}

export async function fetchUserByUsername(username, token) {
  const res = await githubRequest(`https://api.github.com/users/${username}`, token);
  return res.data;
}