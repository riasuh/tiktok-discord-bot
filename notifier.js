const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Config from env vars
const username = process.env.TIKTOK_USERNAME || "avamaxsucks";
const webhook = process.env.DISCORD_WEBHOOK;

if (!webhook) {
  console.error("DISCORD_WEBHOOK env var is missing!");
  process.exit(1);
}

const checkpointFile = path.resolve(__dirname, "lastVideoId.txt");

async function main() {
  try {
    const res = await axios.get(`https://www.tiktok.com/@${username}`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const match = res.data.match(/"videoId":"(\d+)"/);
    const videoId = match ? match[1] : null;

    if (!videoId) {
      console.log("No video ID found");
      return;
    }

    let lastVideoId = null;
    try {
      lastVideoId = fs.readFileSync(checkpointFile, "utf8");
    } catch (err) {
      // File might not exist on first run
    }

    if (lastVideoId === videoId) {
      console.log("No new video, skipping.");
      return;
    }

    // Save new videoId for next runs
    fs.writeFileSync(checkpointFile, videoId, "utf8");

    const proxyLink = `https://vm.tiktokez.com/${videoId}`;

    // Send Discord message
    const payload = {
      embeds: [
        {
          title: `🎬 New TikTok from @${username}`,
          description: `[Click here to watch](${proxyLink})`,
          color: 0x1da1f2,
          footer: { text: "TikTok Discord Bot" },
        },
      ],
    };

    const discordRes = await axios.post(webhook, payload);
    console.log("Discord message sent:", discordRes.status);
  } catch (err) {
    console.error("Error:", err.message || err);
    process.exit(1);
  }
}

main();
