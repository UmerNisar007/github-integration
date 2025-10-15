
import mongoose from "mongoose";

const repoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  name: String,
  full_name: String,
  private: Boolean,
  html_url: String,
  description: String,
  owner_login: String,
  raw: { type: Object },
  _integrationId: { type: mongoose.Schema.Types.ObjectId, ref: "GitHubIntegration", index: true },
  _orgId: { type: Number, index: true },
  fetchedAt: { type: Date, default: Date.now },
});

const Repo = mongoose.model("Repo", repoSchema, "repos");
export default Repo;