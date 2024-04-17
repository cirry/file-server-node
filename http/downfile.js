import fs from "fs"
import path from "path"

export const downloadFile = (pathUrl, res) => {
    const readStream = fs.createReadStream(pathUrl);

    const stats = fs.statSync(pathUrl);

    const filename = path.basename(pathUrl);

    res.writeHead(200, {
        'Content-Type': 'application/octet-stream', //告诉浏览器这是一个二进制文件
        'Content-Disposition': 'attachment; filename=' + filename, //告诉浏览器这是一个需要下载的文件
        'Content-Length': stats.size
    });

    readStream.pipe(res);
}