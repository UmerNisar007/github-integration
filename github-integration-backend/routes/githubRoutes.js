
import express from "express";
import passport from "passport";
import {
  githubCallback,
  githubStatus,
  githubLogout,
  resyncIntegration,
  removeIntegration,
  getCollections,
  getDataFromCollection,
} from "../controllers/githubController.js";

const router = express.Router();

// Start GitHub OAuth flow
router.get("/connect", passport.authenticate("github", { scope: ["user:email", "read:org", "repo"] }));

// GitHub OAuth callback
router.get(
  "/callback",
  passport.authenticate("github", { failureRedirect: "/api/github/failure" }),
  githubCallback
);

// Get connection status
router.get("/status", githubStatus);

// Logout / Remove session
router.get("/logout", githubLogout);

// Resync integration (fetch data)
router.post("/:integrationId/resync", resyncIntegration);

// Remove integration and related data
router.delete("/:integrationId", removeIntegration);

// List collections (for frontend dropdown)
router.get("/collections", getCollections);

// Generic data fetch for ag-grid and viewers
router.get("/data/:collection", getDataFromCollection);

// Failure route
router.get("/failure", (req, res) => res.send("GitHub authentication failed"));

export default router;