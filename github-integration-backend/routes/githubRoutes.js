import express from "express";
import passport from "passport";
import {
  githubCallback,
  githubStatus,
  githubLogout,
} from "../controllers/githubController.js";

const router = express.Router();

// Start GitHub OAuth flow
router.get(
  "/connect",
  passport.authenticate("github", { scope: ["user:email", "read:org"] })
);

// GitHub OAuth callback
router.get(
  "/callback",
  passport.authenticate("github", { failureRedirect: "/api/github/failure" }),
  githubCallback
);

// Get connection status
router.get("/status", githubStatus);

// Logout / Remove integration
router.get("/logout", githubLogout);

// Failure route
router.get("/failure", (req, res) => res.send("GitHub authentication failed"));

export default router;