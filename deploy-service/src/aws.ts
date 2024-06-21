import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";

const s3 = new S3({
    accessKeyId: "e8982f02389b20bcdadb5ff512256bc6",
    secretAccessKey: "caf5b86ce7e985ed0835216e779980985345c6cd7f269c7987cfc415bac0b6d4",
    endpoint: "https://f52e0f63db3f8b509c16750e29c9eda1.r2.cloudflarestorage.com",
})

    export async function downloadS3Folder(prefix: string) {
        const allFiles = await s3.listObjectsV2({
            Bucket: "deployhere",
            Prefix: prefix
        }).promise();
        
        // 
        const allPromises = allFiles.Contents?.map(async ({Key}) => {
            return new Promise(async (resolve) => {
                if (!Key) {
                    resolve("");
                    return;
                }
                const finalOutputPath = path.join(__dirname, Key);
                const outputFile = fs.createWriteStream(finalOutputPath);
                const dirName = path.dirname(finalOutputPath);
                if (!fs.existsSync(dirName)){
                    fs.mkdirSync(dirName, { recursive: true });
                }
                s3.getObject({
                    Bucket: "deployhere",
                    Key: Key||""
                }).createReadStream().pipe(outputFile).on("finish", () => {
                    resolve("");
                })
            })
        }) || []
    
        await Promise.all(allPromises?.filter(x => x !== undefined));
    }

    export function copyFinalDist(id: string) {
        // const folderPath = path.join(__dirname, `output/${id}/dist`);
        // const allFiles = getAllFiles(folderPath);
        // allFiles.forEach(file => {
        //     uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
        // })
    const folderPath = path.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath);

    // Normalize the paths and upload files in parallel
    const uploadPromises = allFiles.map(file => {
        // Normalize the path to use forward slashes
        const relativePath = `dist/${id}/` + file.slice(folderPath.length + 1).split(path.sep).join(path.posix.sep);
        return uploadFile(relativePath, file);
    });
    }
    
    const getAllFiles = (folderPath: string) => {
        let response: string[] = [];
    
        const allFilesAndFolders = fs.readdirSync(folderPath);allFilesAndFolders.forEach(file => {
            const fullFilePath = path.join(folderPath, file);
            if (fs.statSync(fullFilePath).isDirectory()) {
                response = response.concat(getAllFiles(fullFilePath))
            } else {
                response.push(fullFilePath);
            }
        });
        return response;
    }
    
    const uploadFile = async (fileName: string, localFilePath: string) => {
        const fileContent = fs.readFileSync(localFilePath);
        const response = await s3.upload({
            Body: fileContent,
            Bucket: "deployhere",
            Key: fileName,
        }).promise();
        console.log(response);
    }