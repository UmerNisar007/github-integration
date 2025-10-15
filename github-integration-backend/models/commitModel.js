
import mongoose from "mongoose";

const commitSchema = new mongoose.Schema({
  sha: { type: String, required: true, unique: true, index: true },
  message: String,
  author_name: String,
  author_email: String,
  html_url: String,
  raw: { type: Object },
  repo_id: { type: Number, index: true },
  _integrationId: { type: mongoose.Schema.Types.ObjectId, ref: "GitHubIntegration", index: true },
  fetchedAt: { type: Date, default: Date.now },
});

const Commit = mongoose.model("Commit", commitSchema, "commits");
export default Commit;