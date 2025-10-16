# GitHub Integration Project (Developer Guide)

This document provides technical details for developers working on the GitHub Integration project.

---

## Project Structure

github-integration/
│
├─ app.js # Main Express server
├─ routes/
│ └─ githubRoutes.js # API routes
├─ controllers/
│ └─ githubController.js # GitHub API logic and DB integration
├─ helpers/
│ └─ githubApiHelper.js # Axios requests to GitHub API
├─ models/
│ ├─ githubIntegrationModel.js
│ ├─ organizationModel.js
│ ├─ repoModel.js
│ ├─ commitModel.js
│ ├─ pullModel.js
│ ├─ issueModel.js
│ ├─ issueChangelogModel.js
│ └─ userModel.js
├─ .env # Environment variables
├─ package.json
└─ README-DEV.md

shell


### Frontend
github-integration-web/
├─ src/
├─ angular.json
├─ package.json
└─ .gitignore

---

## Backend Setup

1. Install dependencies:
```
npm install
Create .env file:

env

PORT=3000
MONGO_URI=<MongoDB Atlas URI>
SESSION_SECRET=<Random Secret String>
GITHUB_CLIENT_ID=<GitHub OAuth Client ID>
GITHUB_CLIENT_SECRET=<GitHub OAuth Client Secret>
GITHUB_CALLBACK_URL=http://localhost:3000/api/github/callback
Start server:



node app.js
API Routes:

Method	Endpoint	Description
GET	/api/github/connect	Start OAuth flow
GET	/api/github/callback	OAuth callback
GET	/api/github/status	Get GitHub connection status
GET	/api/github/logout	Logout user
POST	/api/github/:integrationId/resync	Fetch organizations, repos, commits, issues, pulls
DELETE	/api/github/:integrationId	Delete integration and related data
GET	/api/github/collections	Return list of collections
GET	/api/github/data/:collection	Generic fetch with pagination/filtering

GitHub Integration Flow
OAuth Authorization

Passport.js handles GitHub login

Stores accessToken in MongoDB

Resync Integration

Fetches organizations → repositories → commits, issues, pulls → users

Stores data in MongoDB collections:

organizations

repos

commits

pulls

issues

issue_changelogs

users

github-integration

Database Models

Each model has _integrationId for linking

Use bulkWrite for efficiency

GitHub API Helper

githubApiHelper.js handles paginated requests

Implements rate-limit handling and retries

Important Notes for Devs
Ensure your GitHub token has correct scopes:

read:org

repo

user:email

Organization membership must be public if token is personal access token

Resync endpoint may take time for large organizations

Use .env file for sensitive keys

.gitignore excludes node_modules, dist, .env, .vscode, logs, etc.

Debugging Tips
No data fetched: Confirm token scopes and organization membership

CURL Windows issues: Use -k for SSL certificate bypass

Mongo connection errors: Check IP whitelist in MongoDB Atlas

Frontend data not showing: Inspect network calls to /api/github/data/:collection

Scripts
Backend:



node app.js
Frontend:



cd github-integration-web
ng serve
Recommended Dev Tools
Node.js 18+

VS Code (with ESLint, Prettier)

MongoDB Atlas for DB

Postman or CURL for API testing

GitHub OAuth App for credentials

License
MIT License

Author
Umer Nisar