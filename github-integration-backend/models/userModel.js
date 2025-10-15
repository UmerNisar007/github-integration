
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  login: String,
  name: String,
  avatar_url: String,
  html_url: String,
  raw: { type: Object },
  _integrationId: { type: mongoose.Schema.Types.ObjectId, ref: "GitHubIntegration", index: true },
  fetchedAt: { type: Date, default: Date.now },
});

const GitHubUser = mongoose.model("GitHubUser", userSchema, "users");
export default GitHubUser;