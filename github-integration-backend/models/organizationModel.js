
import mongoose from "mongoose";

const orgSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  login: String,
  name: String,
  url: String,
  raw: { type: Object },
  _integrationId: { type: mongoose.Schema.Types.ObjectId, ref: "GitHubIntegration", index: true },
  fetchedAt: { type: Date, default: Date.now },
});

const Organization = mongoose.model("Organization", orgSchema, "organizations");
export default Organization;