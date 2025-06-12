const axios = require("axios");
const fs = require("fs");

const webhookUrl = process.env.DISCORD_WEBHOOK;
const rapidApiKey = process.env.RAPIDAPI_KEY;
const tiktokUserId = process.env.TIKTOK_USER_ID;
const cacheFile = ".last_video";

async function checkLatestTikTok() {
  try {
    const res = await axios.get("https://tiktok-scraper7.p.rapidapi.com/user/posts", {
      params: { user_id: tiktokUserId, count: 1, cursor: 0 },
      headers: {
        "x-rapidapi-host": "tiktok-scraper7.p.rapidapi.com",
        "x-rapidapi-key": rapidApiKey,
      },
    });

    const videos = res.data?.data?.videos || [];
    if (videos.length === 0) {
      console.log("❌ No videos found");
      return;
    }

    const latest = videos[0];
    const videoId = latest.video_id;
    const username = latest.author?.unique_id;
    const link = `https://tiktokez.com/@${username}/video/${videoId}`;

    const lastPosted = fs.existsSync(cacheFile)
      ? fs.readFileSync(cacheFile, "utf8").trim()
      : null;

    if (videoId === lastPosted) {
      console.log("⏩ Already posted.");
      return;
    }

    await axios.post(webhookUrl, {
      content: `[**New TikTok by @${username} 🥹**](${link})`,
    });

    fs.writeFileSync(cacheFile, videoId);
    console.log("✅ Posted and updated cache.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

checkLatestTikTok();
