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
    const postLink = `https://vm.tiktokez.com/${latestVideo.aweme_id}`;

    const message = {
      content: `[**New TikTok by @${latestVideo.author?.unique_id} 🥹**](${postLink})`,
      embeds: null,
      attachments: [],
    };

    await axios.post(webhookUrl, message);

    console.log("✅ Simple message sent to Discord!");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

checkLatestTikTok();
