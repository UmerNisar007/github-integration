
import mongoose from "mongoose";

const pullSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  number: Number,
  title: String,
  state: String,
  user_login: String,
  html_url: String,
  raw: { type: Object },
  repo_id: { type: Number, index: true },
  _integrationId: { type: mongoose.Schema.Types.ObjectId, ref: "GitHubIntegration", index: true },
  fetchedAt: { type: Date, default: Date.now },
});

const Pull = mongoose.model("Pull", pullSchema, "pulls");
export default Pull;