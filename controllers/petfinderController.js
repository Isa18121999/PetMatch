var token;
var tokenExpiresAt = 0;

function getAccessToken() {
  if (token && Date.now() < tokenExpiresAt) {
    return Promise.resolve(token);
  }

  var clientId = process.env.PETFINDER_CLIENT_ID;
  var clientSecret = process.env.PETFINDER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return Promise.reject(new Error("Petfinder credentials are not configured."));
  }

  return fetch("https://api.petfinder.com/v2/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret
    })
  }).then(function(response) {
    if (!response.ok) {
      throw new Error("Petfinder authentication failed.");
    }
    return response.json();
  }).then(function(data) {
    token = data.access_token;
    tokenExpiresAt = Date.now() + Math.max((data.expires_in - 60) * 1000, 0);
    return token;
  });
}

module.exports = function(app) {
  app.get("/api/pet-search", function(req, res) {
    var parameters = new URLSearchParams();
    ["type", "breed", "gender", "age", "location"].forEach(function(key) {
      if (req.query[key]) {
        parameters.set(key, req.query[key]);
      }
    });
    parameters.set("limit", "20");

    getAccessToken().then(function(accessToken) {
      return fetch("https://api.petfinder.com/v2/animals?" + parameters.toString(), {
        headers: { Authorization: "Bearer " + accessToken }
      });
    }).then(function(response) {
      if (!response.ok) {
        throw new Error("Petfinder search failed.");
      }
      return response.json();
    }).then(function(data) {
      res.json(data);
    }).catch(function(error) {
      console.error("Petfinder request error:", error.message);
      res.status(503).json({ error: "Pet search is temporarily unavailable. Please try again later." });
    });
  });
};
