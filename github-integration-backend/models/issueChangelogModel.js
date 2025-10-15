
import mongoose from "mongoose";

const changelogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  issue_id: { type: Number, index: true },
  body: String,
  user_login: String,
  raw: { type: Object },
  repo_id: { type: Number, index: true },
  _integrationId: { type: mongoose.Schema.Types.ObjectId, ref: "GitHubIntegration", index: true },
  fetchedAt: { type: Date, default: Date.now },
});

const IssueChangelog = mongoose.model("IssueChangelog", changelogSchema, "issue_changelogs");
export default IssueChangelog;