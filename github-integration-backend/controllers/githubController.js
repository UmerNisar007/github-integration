export const githubConnect = (req, res, next) => {
  next();
};

export const githubCallback = async (req, res) => {
  try {
    const user = req.user;

    const integration = await GitHubIntegration.findOneAndUpdate(
      { githubId: user.githubId },
      {
        username: user.username,
        avatarUrl: user.avatarUrl,
        profileUrl: user.profileUrl,
        accessToken: user.accessToken,
        connectedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log("Integration saved:", integration); 

    res.redirect("http://localhost:4200/integration-success");
  } catch (error) {
    console.error("Error saving GitHub integration:", error);
    res.redirect("http://localhost:4200/integration-failure");
  }
};

export const githubStatus = async (req, res) => {
  if (req.isAuthenticated()) {
    const integration = await GitHubIntegration.findOne({ githubId: req.user.githubId });
    if (integration) {
      return res.json({
        success: true,
        connectedAt: integration.connectedAt,
        username: integration.username,
      });
    }
  }
  res.json({ success: false, message: "Not connected" });
};

export const githubLogout = (req, res) => {
  req.logout(() => {
    res.json({ success: true, message: "Integration removed" });
  });
};