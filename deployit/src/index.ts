import express from "express";
import cors from "cors";
import { generate } from "./utils";
import simpleGit from "simple-git";
import { getAllFiles } from "./file";
import path from "path";
import { uploadFile } from "./aws";

import { createClient } from "redis";
const publisher= createClient({});
publisher.connect();

const app = express();
app.use(cors())
app.use(express.json());

app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generate();
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`))

    

    const files = getAllFiles(path.join(__dirname, `output/${id}`));

    const uploadPromises = files.map(file => {
        const relativePath = file.slice(__dirname.length + 1).split(path.sep).join(path.posix.sep);
        return uploadFile(relativePath, file);
    });

    await Promise.all(uploadPromises);

    publisher.lPush("build-queue", id);

    console.log(files);
    res.json({ id });
});

app.listen(3000);