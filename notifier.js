const axios = require("axios");
const fs = require("fs");
const path = require("path");

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
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept":
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Referer": "https://www.google.com/",
    "Connection": "keep-alive",
  },
});

console.log("DEBUG: Page snippet:", res.data.slice(0, 1000));


    // Extract JSON blob inside <script id="SIGI_STATE">
    const jsonMatch = res.data.match(/<script id="SIGI_STATE" type="application\/json">([^<]+)<\/script>/);
    if (!jsonMatch) {
      console.log("❌ Could not find SIGI_STATE JSON in page");
      return;
    }

    const data = JSON.parse(jsonMatch[1]);

    // Navigate JSON to find latest video ID
    // Path: data.ItemList -> [username] -> items -> first video ID
    const userItems = data.ItemList?.user?.[`@${username}`]?.list;
    if (!userItems || userItems.length === 0) {
      console.log("❌ No videos found for user in JSON data");
      return;
    }

    const videoId = userItems[0];

    if (!videoId) {
      console.log("❌ Video ID not found");
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

    fs.writeFileSync(checkpointFile, videoId, "utf8");

    const proxyLink = `https://vm.tiktokez.com/${videoId}`;

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
    console.error("Error:", err.response?.data || err.message || err);
    process.exit(1);
  }
}

main();
