import mongoose from "mongoose";

const githubIntegrationSchema = new mongoose.Schema({
    githubId : { type: String, required: true, unique: true},
    username: {type: String, required: true},
    avatarUrl: {type: String},
    profileUrl: {type: String},
    accessToken: {type: String, required: true},
    connectedAt: {type: Date, default: Date.now}
})

const GitHubIntegration = mongoose.model(
  "GitHubIntegration",
  githubIntegrationSchema,
  "github-integration"
);

export default GitHubIntegration;