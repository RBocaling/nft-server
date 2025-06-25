import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import multer from "multer";
import FormData from "form-data";
const app = express();
app.use(cors());
app.use(express.json());
const upload = multer();
app.post("/api/befunky", async (req:any, res:any) => {
  const { imageUrl, value, fidelity, variation, smoothness } = req.body;

  if (!imageUrl) return res.status(400).json({ error: "Missing imageUrl" });

  const encodedImage = encodeURIComponent(imageUrl);

  try {
    const response = await fetch("https://upload.befunky.com/artsy/", {
      method: "POST",
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "x-csrf-token":
          "2d7ef632651d622b40ce55b7836f302a.a37fe1c1f92f9e7f6cc4d979cfdb91f285d692369dabb0737f4a6a0cf8db8e51",
        cookie:
          "_ga=GA1.1.1955507701.1750605462; bfnfprint=BfNe3e7859b.f9d684ec.ecba05ec; _country_=PH; _FREE_=1; _regfrom=GOOGLE; _bfn_tkn_=eyJpZCI6ICIxODI4NzIzNSIsICJlbWFpbCI6InJleW5hbGRvZmJvY2FsaW5nJTQwZ21haWwuY29tIiwgInVzZXJfbmFtZSI6InJleW5hbGRvZmJvY2FsaW5nIiwgInBsIjoiMCIsICJ0aW1lIjoiMTc1MDYwNTQ3OCJ9.c7e14a5943ca9e03c5864933358d91e7a50bda1370961bb02b04a3f90fca3570; _memtype_=1; lang=en; _ga_0YLH3PWTHB=GS2.1.s1750605462$o1$g1$t1750605730$j56$l0$h0; _gcl_au=1.1.1977604020.1750605462.2067937814.1750605477.1750605730; CSRFtoken=2d7ef632651d622b40ce55b7836f302a.a37fe1c1f92f9e7f6cc4d979cfdb91f285d692369dabb0737f4a6a0cf8db8e51",
        Referer: "https://www.befunky.com/",
        "Referrer-Policy": "origin-when-cross-origin",
      },
      body: `image=${encodedImage}&CSRFtoken=2d7ef632651d622b40ce55b7836f302a.a37fe1c1f92f9e7f6cc4d979cfdb91f285d692369dabb0737f4a6a0cf8db8e51&version=2&method=api%2Fartsy-generative%2F&style=${value}&fidelity=${fidelity}&smoothness=${smoothness}&variation=${variation}`,
    });

    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ error: "BeFunky request failed" });
  }
});


app.post("/api/uploadImage3", upload.single("image"), async (req:any, res:any) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No image uploaded" });

    const s3Config = await fetch("https://www.befunky.com/api/direct-upload/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": "https://www.befunky.com/create/photo-to-cartoon/",
      },
      body: new URLSearchParams({
        bucket: "ai-direct-upload",
        content_type: file.mimetype,
        CSRFtoken: "", // if required
      }),
    });

    const config = await s3Config.json();

    if (!config?.data?.url || !config?.data?.inputs?.key) {
      return res.status(500).json({ error: "Invalid S3 config from BeFunky" });
    }

    const form = new FormData();
    for (const [key, value] of Object.entries(config.data.inputs)) {
      form.append(key, value);
    }
    form.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const uploadRes = await fetch(config.data.url, {
      method: "POST",
      body: form,
    });

    if (uploadRes.status !== 201) {
      return res.status(500).json({ error: "S3 upload failed" });
    }

    const imageKey = config.data.inputs.key;
    const imageUrl = `${config.data.url}/${imageKey}`;

    res.status(200).json({
      message: "Image uploaded successfully",
      key: imageKey,
      url: imageUrl,
    });
  } catch (err) {
    console.error("UploadImage3 Error:", err);
    res.status(500).json({ error: "UploadImage3 failed" });
  }
});

app.listen(4000, () =>
  console.log("✅ Backend running on http://localhost:4000")
);



