
import GitHubIntegration from "../models/githubIntegrationModel.js";
import Organization from "../models/organizationModel.js";
import Repo from "../models/repoModel.js";
import Commit from "../models/commitModel.js";
import Pull from "../models/pullModel.js";
import Issue from "../models/issueModel.js";
import IssueChangelog from "../models/issueChangelogModel.js";
import GitHubUser from "../models/userModel.js";

import {
  fetchUserOrgs,
  fetchOrgRepos,
  fetchRepoCommits,
  fetchRepoPulls,
  fetchRepoIssues,
  fetchIssueComments,
  fetchUserByUsername,
} from "../helpers/githubApiHelper.js";

/**
 * Existing controller functions remain (githubConnect handled by passport,
 * githubStatus etc.). Below: resync, removeIntegration, getCollections, getData.
 */

export const githubCallback = async (req, res) => {
  try {
    const user = req.user;
    const integration = await GitHubIntegration.findOneAndUpdate(
      { githubId: user.githubId },
      {
        username: user.username,
        avatarUrl: user.avatarUrl,
        profileUrl: user.profileUrl,
        accessToken: user.accessToken,
        connectedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // redirect to frontend success
    res.redirect("http://localhost:4200/integration-success");
  } catch (error) {
    console.error("Error saving GitHub integration:", error);
    res.redirect("http://localhost:4200/integration-failure");
  }
};

// Get status (improved)
export const githubStatus = async (req, res) => {
  try {
    const integration = req.user
      ? await GitHubIntegration.findOne({ githubId: req.user.githubId })
      : await GitHubIntegration.findOne().sort({ connectedAt: -1 }).limit(1);

    if (!integration) return res.json({ connected: false });

    return res.json({
      connected: true,
      username: integration.username,
      connectedAt: integration.connectedAt,
      _id: integration._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ connected: false });
  }
};

export const githubLogout = async (req, res) => {
  try {
    req.logout(() => {});
    res.json({ success: true, message: "Logged out" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/**
 * POST /api/github/:integrationId/resync
 * Synchronously fetches orgs -> repos -> commits/pulls/issues -> saves into collections
 */
export const resyncIntegration = async (req, res) => {
  const { integrationId } = req.params;

  try {
    const integration = await GitHubIntegration.findById(integrationId);
    if (!integration) return res.status(404).json({ message: "Integration not found" });

    const token = integration.accessToken;
    const orgsFetched = [];

    console.log("Starting GitHub resync for integration: with token:", integration.username,token.slice(0, 10));

    // Fetch all user orgs
    await fetchUserOrgs(token, async (orgsPage) => {
      const ops = orgsPage.map((org) => {
        orgsFetched.push(org.login);
        return {
          updateOne: {
            filter: { id: org.id },
            update: {
              $set: {
                id: org.id,
                login: org.login,
                name: org.name,
                url: org.url,
                raw: org,
                _integrationId: integration._id,
                fetchedAt: new Date(),
              },
            },
            upsert: true,
          },
        };
      });

      if (ops.length) {
        const result = await Organization.bulkWrite(ops, { ordered: false });
        console.log("Orgs upserted:", result.upsertedCount || 0);
      }
    });

    const repoList = [];

    for (const orgLogin of orgsFetched) {
      try {
        await fetchOrgRepos(orgLogin, token, async (reposPage) => {
          const repoOps = reposPage.map((r) => ({
            updateOne: {
              filter: { id: r.id },
              update: {
                $set: {
                  id: r.id,
                  name: r.name,
                  full_name: r.full_name,
                  private: r.private,
                  html_url: r.html_url,
                  description: r.description,
                  owner_login: r.owner?.login,
                  raw: r,
                  _integrationId: integration._id,
                  _orgId: r.owner?.id,
                  fetchedAt: new Date(),
                },
              },
              upsert: true,
            },
          }));

          if (repoOps.length) {
            const result = await Repo.bulkWrite(repoOps, { ordered: false });
            console.log(`Repos upserted for org ${orgLogin}:`, result.upsertedCount || 0);
          }

          repoList.push(...reposPage.map((r) => ({ owner: r.owner.login, name: r.name, id: r.id })));
        });
      } catch (err) {
        console.error("Error fetching repos for org:", orgLogin, err);
      }
    }

    // Fetch commits, pulls, issues, comments, and users
    for (const r of repoList) {
      try {
        await fetchRepoCommits(r.owner, r.name, token, async (commitsPage) => {
          const commitOps = commitsPage.map((c) => {
            const sha = c.sha;
            const message = c.commit?.message || "";
            const author_name = c.commit?.author?.name || (c.author && c.author.login) || "";
            const author_email = c.commit?.author?.email || "";
            return {
              updateOne: {
                filter: { sha },
                update: {
                  $set: {
                    sha,
                    message,
                    author_name,
                    author_email,
                    html_url: c.html_url || "",
                    raw: c,
                    repo_id: r.id,
                    _integrationId: integration._id,
                    fetchedAt: new Date(),
                  },
                },
                upsert: true,
              },
            };
          });

          if (commitOps.length) {
            const result = await Commit.bulkWrite(commitOps, { ordered: false });
            console.log(`Commits upserted for repo ${r.name}:`, result.upsertedCount || 0);
          }
        });
      } catch (err) {
        console.error("Error fetching commits for repo:", r.name, err);
      }

      // Pulls
      try {
        await fetchRepoPulls(r.owner, r.name, token, async (pullsPage) => {
          const pullOps = pullsPage.map((p) => ({
            updateOne: {
              filter: { id: p.id },
              update: {
                $set: {
                  id: p.id,
                  number: p.number,
                  title: p.title,
                  state: p.state,
                  user_login: p.user?.login,
                  html_url: p.html_url,
                  raw: p,
                  repo_id: r.id,
                  _integrationId: integration._id,
                  fetchedAt: new Date(),
                },
              },
              upsert: true,
            },
          }));
          if (pullOps.length) {
            const result = await Pull.bulkWrite(pullOps, { ordered: false });
            console.log(`Pulls upserted for repo ${r.name}:`, result.upsertedCount || 0);
          }
        });
      } catch (err) {
        console.error("Error fetching pulls for repo:", r.name, err);
      }

      // Issues + comments
      try {
        await fetchRepoIssues(r.owner, r.name, token, async (issuesPage) => {
          const issueOps = issuesPage.map((iss) => ({
            updateOne: {
              filter: { id: iss.id },
              update: {
                $set: {
                  id: iss.id,
                  number: iss.number,
                  title: iss.title,
                  state: iss.state,
                  user_login: (iss.user && iss.user.login) || "",
                  html_url: iss.html_url,
                  raw: iss,
                  repo_id: r.id,
                  _integrationId: integration._id,
                  fetchedAt: new Date(),
                },
              },
              upsert: true,
            },
          }));

          if (issueOps.length) {
            const result = await Issue.bulkWrite(issueOps, { ordered: false });
            console.log(`Issues upserted for repo ${r.name}:`, result.upsertedCount || 0);
          }

          for (const iss of issuesPage) {
            if (!iss.comments || iss.comments === 0) continue;
            try {
              await fetchIssueComments(r.owner, r.name, iss.number, token, async (commentsPage) => {
                const changelogOps = commentsPage.map((c) => ({
                  updateOne: {
                    filter: { id: `${r.id}-${iss.number}-${c.id}` },
                    update: {
                      $set: {
                        id: `${r.id}-${iss.number}-${c.id}`,
                        issue_id: iss.id,
                        body: c.body,
                        user_login: c.user?.login,
                        raw: c,
                        repo_id: r.id,
                        _integrationId: integration._id,
                        fetchedAt: new Date(),
                      },
                    },
                    upsert: true,
                  },
                }));
                if (changelogOps.length) {
                  const result = await IssueChangelog.bulkWrite(changelogOps, { ordered: false });
                  console.log(`Issue comments upserted for issue ${iss.number}:`, result.upsertedCount || 0);
                }
              });
            } catch (err) {
              console.error("Error fetching comments for issue:", iss.number, err);
            }
          }
        });
      } catch (err) {
        console.error("Error fetching issues for repo:", r.name, err);
      }

      // Repo owner as GitHubUser
      try {
        const ownerUser = await fetchUserByUsername(r.owner, token);
        if (ownerUser && ownerUser.id) {
          const result = await GitHubUser.updateOne(
            { id: ownerUser.id },
            {
              $set: {
                id: ownerUser.id,
                login: ownerUser.login,
                name: ownerUser.name,
                avatar_url: ownerUser.avatar_url,
                html_url: ownerUser.html_url,
                raw: ownerUser,
                _integrationId: integration._id,
                fetchedAt: new Date(),
              },
            },
            { upsert: true }
          );
          console.log(`User upserted: ${ownerUser.login}`);
        }
      } catch (err) {
        console.error("Error fetching owner user for repo:", r.name, err);
      }
    }

    console.log("✅ Resync completed successfully");
    return res.json({ success: true, message: "Resync completed" });
  } catch (err) {
    console.error("Resync error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};


/**
 * DELETE /api/github/:integrationId
 * Deletes integration and related GitHub collections docs for that integration.
 */
export const removeIntegration = async (req, res) => {
  const { integrationId } = req.params;
  try {
    const integration = await GitHubIntegration.findById(integrationId);
    if (!integration) return res.status(404).json({ message: "Integration not found" });

    await GitHubIntegration.deleteOne({ _id: integrationId });

    const deletions = [
      Organization.deleteMany({ _integrationId: integrationId }),
      Repo.deleteMany({ _integrationId: integrationId }),
      Commit.deleteMany({ _integrationId: integrationId }),
      Pull.deleteMany({ _integrationId: integrationId }),
      Issue.deleteMany({ _integrationId: integrationId }),
      IssueChangelog.deleteMany({ _integrationId: integrationId }),
      GitHubUser.deleteMany({ _integrationId: integrationId }),
    ];
    await Promise.all(deletions);

    return res.json({ success: true, message: "Integration and related data removed" });
  } catch (err) {
    console.error("Remove integration error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/github/collections
 * Returns the list of collections we maintain (for the frontend Entity dropdown).
 */
export const getCollections = async (req, res) => {
  const collections = [
    "organizations",
    "repos",
    "commits",
    "pulls",
    "issues",
    "issue_changelogs",
    "users",
    "github-integration",
  ];
  res.json({ collections });
};

/**
 * GET /api/data/:collection
 * Generic data fetcher with server-side pagination, sorting, filtering and global search.
 *
 * Query params:
 *  - page (1-based)
 *  - pageSize
 *  - sortField
 *  - sortDir (asc|desc)
 *  - filters (JSON encoded object: { field: value, ... } - values are matched partially for strings)
 *  - search (global string)
 */
export const getDataFromCollection = async (req, res) => {
  const { collection } = req.params;
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const pageSize = Math.min(parseInt(req.query.pageSize || "25", 10), 1000);
  const sortField = req.query.sortField || "fetchedAt";
  const sortDir = req.query.sortDir === "desc" ? -1 : 1;
  const search = req.query.search || "";
  const filters = req.query.filters ? JSON.parse(req.query.filters) : {};
  const integrationId = req.query.integrationId || null;

  const map = {
    organizations: Organization,
    repos: Repo,
    commits: Commit,
    pulls: Pull,
    issues: Issue,
    issue_changelogs: IssueChangelog,
    users: GitHubUser,
    "github-integration": GitHubIntegration,
  };

  const Model = map[collection];
  if (!Model) return res.status(400).json({ error: "Unknown collection" });

  try {
    const query = { ...Object.create(null) };

    if (integrationId) {
      query["_integrationId"] = integrationId;
    }

    for (const [field, value] of Object.entries(filters || {})) {
      if (typeof value === "string") {
        query[field] = { $regex: value, $options: "i" };
      } else {
        query[field] = value;
      }
    }

    if (search) {
      const sample = await Model.findOne().lean();
      if (sample) {
        const textFields = Object.keys(sample).filter((k) => {
          const v = sample[k];
          return typeof v === "string" && k !== "_id";
        });
        if (textFields.length) {
          query["$or"] = textFields.map((f) => ({ [f]: { $regex: search, $options: "i" } }));
        } else {
          query["$or"] = [{ raw: { $regex: search, $options: "i" } }];
        }
      }
    }

    const total = await Model.countDocuments(query);

    const docs = await Model.find(query)
      .sort({ [sortField]: sortDir })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    let columns = [];
    if (docs && docs.length) {
      const first = docs[0];
      columns = Object.keys(first).filter((k) => k !== "__v").map((k) => ({ field: k }));
    }

    res.json({
      total,
      page,
      pageSize,
      data: docs,
      columns,
    });
  } catch (err) {
    console.error("getDataFromCollection error:", err);
    res.status(500).json({ error: err.message });
  }
};