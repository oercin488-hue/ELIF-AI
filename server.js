const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

app.get("/api/health", (req, res) => {
  res.json({ status: "online", name: "ELIF AI" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: "API anahtarı henüz ayarlanmamış."
      });
    }

    const messages = req.body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Mesaj bulunamadı."
      });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content: "Sen ELİF AI adlı yardımcı Türkçe yapay zekâ asistanısın. Açık, samimi ve faydalı cevaplar ver."
            },
            ...messages.slice(-20)
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API hatası:", data);
      return res.status(502).json({
        error: "Yapay zekâ bağlantısında sorun oluştu."
      });
    }

    res.json({
      reply: data.choices?.[0]?.message?.content || "Yanıt oluşturulamadı."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Sunucu hatası oluştu."
    });
  }
});

app.listen(PORT, () => {
  console.log(`ELİF AI çalışıyor: ${PORT}`);
});
