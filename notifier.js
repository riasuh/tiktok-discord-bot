const axios = require("axios");

const webhookUrl = process.env.DISCORD_WEBHOOK;
const rapidApiKey = process.env.RAPIDAPI_KEY;
const tiktokUserId = process.env.TIKTOK_USER_ID;

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

    const latestVideo = videos[0];
    const username = latestVideo.author?.unique_id;
    const videoId = latestVideo.video_id;
    const postLink = `https://tiktokez.com/@${username}/video/${videoId}`;

    const message = {
      content: `[**New TikTok by @${username} 🥹**](${postLink})`,
    };

    await axios.post(webhookUrl, message);

    console.log("✅ Message sent to Discord!");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

checkLatestTikTok();
