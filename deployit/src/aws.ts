import { S3 } from "aws-sdk";
import fs from "fs";

// replace with your own credentials
const s3 = new S3({
    accessKeyId: "e8982f02389b20bcdadb5ff512256bc6",
    secretAccessKey: "caf5b86ce7e985ed0835216e779980985345c6cd7f269c7987cfc415bac0b6d4",
    endpoint: "https://f52e0f63db3f8b509c16750e29c9eda1.r2.cloudflarestorage.com",
})

// fileName => output/12312/src/App.jsx
// filePath => /Users/harkiratsingh/vercel/dist/output/12312/src/App.jsx
export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "deployhere",
        Key: fileName,
    }).promise();
    console.log(response);
}