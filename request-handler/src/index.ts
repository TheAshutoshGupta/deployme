import express from "express";
import { S3 } from "aws-sdk";

const s3 = new S3({
    accessKeyId: "e8982f02389b20bcdadb5ff512256bc6",
    secretAccessKey: "caf5b86ce7e985ed0835216e779980985345c6cd7f269c7987cfc415bac0b6d4",
    endpoint: "https://f52e0f63db3f8b509c16750e29c9eda1.r2.cloudflarestorage.com",
})

const app = express();

app.get("/*", async (req, res) => {
    // id.100xdevs.com
    const host = req.hostname;

    const id = host.split(".")[0];
    const filePath = req.path;

    const contents = await s3.getObject({
        Bucket: "deployhere",
        Key: `dist/${id}${filePath}`
    }).promise();
    
    const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript"
    res.set("Content-Type", type);

    res.send(contents.Body);
})

app.listen(3001);