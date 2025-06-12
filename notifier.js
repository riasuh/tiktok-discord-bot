const axios = require("axios");
const fs = require("fs");
const path = require("path");

const webhook = process.env.DISCORD_WEBHOOK;
const rapidApiKey = process.env.RAPIDAPI_KEY;
const tiktokUserId = process.env.TIKTOK_USER_ID || "107955"; // hardcoded or from env

if (!webhook || !rapidApiKey || !tiktokUserId) {
  console.error("Missing env vars: DISCORD_WEBHOOK, RAPIDAPI_KEY, or TIKTOK_USER_ID");
  process.exit(1);
}

const checkpointFile = path.resolve(__dirname, "lastVideoId.txt");

async function main() {
  try {
    const res = await axios.get("https://tiktok-scraper7.p.rapidapi.com/user/posts", {
      params: { user_id: tiktokUserId, count: 1, cursor: 0 },
      headers: {
        "x-rapidapi-host": "tiktok-scraper7.p.rapidapi.com",
        "x-rapidapi-key": rapidApiKey,
      },
    });

    const videos = res.data.data || [];
    if (!videos.length) {
      console.log("No videos found");
      return;
    }

    const video = videos[0];
    const videoId = video.id;
    const proxyLink = `https://vm.tiktokez.com/${videoId}`;

    let lastVideoId = null;
    try {
      lastVideoId = fs.readFileSync(checkpointFile, "utf8");
    } catch (err) {}

    if (lastVideoId === videoId) {
      console.log("No new video, skipping.");
      return;
    }

    fs.writeFileSync(checkpointFile, videoId, "utf8");

    const payload = {
      embeds: [
        {
          title: `🎬 New TikTok Posted`,
          description: `[Click to Watch](${proxyLink})`,
          color: 0xff0050,
          footer: { text: "Posted by TikTok Bot" },
        },
      ],
    };

    await axios.post(webhook, payload);
    console.log("✅ Sent to Discord!");
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    process.exit(1);
  }
}

main();
