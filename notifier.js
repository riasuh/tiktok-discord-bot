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

    console.log(`✅ Found video: ${postLink}`);

    await axios.post(webhookUrl, {
      embeds: [
        {
          title: latestVideo.title || "New TikTok Post",
          url: postLink,
          image: {
            url: latestVideo.cover,
          },
          footer: {
            text: `Posted by ${latestVideo.author?.unique_id}`,
          },
        },
      ],
    });

    console.log("✅ Message sent to Discord!");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

checkLatestTikTok();
