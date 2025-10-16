# GitHub Integration Project

This project allows users to connect their GitHub account, fetch organizations, repositories, commits, pull requests, issues, and issue comments, and view them in a web interface.  

Built with **Angular** (frontend) and **Node.js/Express** (backend) with **MongoDB Atlas** as the database.

---

## Features

- Connect your GitHub account via OAuth  
- Fetch GitHub organizations, repositories, commits, pull requests, issues, and comments  
- Remove integration and all related data  
- Paginated and sortable view of GitHub data  
- Real-time sync and resync GitHub data  

---

## Tech Stack

- **Frontend:** Angular, Ag-Grid  
- **Backend:** Node.js, Express, Passport.js (GitHub OAuth)  
- **Database:** MongoDB Atlas  
- **API Requests:** Axios  

---

## Getting Started

### Frontend
1. Navigate to frontend folder:  
```
cd github-integration-web
Install dependencies:


 
npm install
Run the frontend:


 
ng serve
Access at http://localhost:4200

Backend
Navigate to backend folder:


 
cd github-integration-backend
Install dependencies:


 
npm install
Create a .env file with required variables (see below)

Run backend:


 
node app.js
API endpoints available at http://localhost:3000/api/github

Environment Variables
Create a .env file in the backend folder:

env
 
PORT=3000
MONGO_URI=<MongoDB Atlas URI>
SESSION_SECRET=<Session Secret>
GITHUB_CLIENT_ID=<GitHub OAuth App Client ID>
GITHUB_CLIENT_SECRET=<GitHub OAuth App Client Secret>
GITHUB_CALLBACK_URL=http://localhost:3000/api/github/callback
GitHub Token & Scopes
OAuth token scopes needed:

read:org ✅

repo ✅

user:email ✅

Your account must be a member of the organization.

Organization membership visibility must be public or the OAuth app must be authorized.

Usage
Open frontend at http://localhost:4200

Click Connect GitHub to authorize

Data will sync automatically, or click Resync

View organizations, repos, commits, issues, and pull requests

Remove integration if needed (deletes all related data)

#### Troubleshooting

Empty /user/orgs response: Check token scopes and org membership visibility

Backend errors: Ensure MONGO_URI is correct and MongoDB Atlas allows connections

Frontend not showing data: Check network, API endpoint URL, and CORS

CURL Windows SSL issue: Use -k flag if certificate revocation fails

License
MIT License

Author
Umer Nisar
GitHub