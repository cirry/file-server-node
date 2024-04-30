import express from 'express'
import cors from 'cors'
import { existsSync, stat, readFileSync, createReadStream } from 'node:fs'
import { mkdir, readdir, } from 'node:fs/promises'
import { join, basename, extname, } from 'node:path';
import { getExtname, } from './utils/tools.js'

import { downloadFile } from './http/downfile.js'
import { getPreviewMode, getFileMime, getFileType, getFileExtension } from './utils/mime.js'
const app = express()
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
import FileType from 'file-type';
import { config } from './dist/config.js'

// const { } = require('./dist/config.js')

app.use(cors())
app.use('/publish', express.static(join(__dirname, 'publish')))

let imageExts = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'ico', 'avif', 'tif', 'bmp', 'gif']
async function read(params) {
    const { path, type } = params
    let pathArr = path.split('/')
    if (existsSync(join(__dirname, ...pathArr))) {
        try {
            const currentPathFiles = await readdir(join(__dirname, ...pathArr), { withFileTypes: true, recursive: false });

            if (type === 'dir') {
                let dirs = currentPathFiles.filter(item => !item.isFile()).map(item => ({
                    type: 'dir',
                    name: item.name,
                    path: path + '/' + item.name
                }))
                return { code: 200, data: dirs, message: 'success' }
            } else if (type === 'file') {
                let files = currentPathFiles.filter(item => !item.isDirectory()).map(file => ({
                    ...file,
                    path: path + '/' + file.name
                }))
                let filesPromise = []
                for (let i = 0; i < files.length; i++) {
                    filesPromise.push(getFileInfo(files[i]))
                }

                let fileStat = await Promise.all(filesPromise)
                return { code: 200, data: fileStat, message: 'success' }
            } else {
                currentPathFiles.forEach(item => item.path = path + '/' + item.name)
                let files = currentPathFiles.filter(file => file.isFile())
                let filesPromise = []
                for (let i = 0; i < files.length; i++) {
                    filesPromise.push(getFileInfo(files[i]))
                }
                let fileStat = await Promise.all(filesPromise)
                fileStat.forEach(item => item.path = path + '/' + item.name)
                let otherFiles = currentPathFiles.filter(file => !file.isFile()).map(item => ({
                    type: 'dir',
                    name: item.name,
                    path: path + '/' + item.name
                }))

                return { code: 200, data: otherFiles.concat(fileStat), message: 'success' }
            }

        } catch (err) {
            return { code: 500, data: null, message: 'Internal Server Error' }
        }
    } else {
        return { code: 404, message: 'not found', data: null }
    }
}

const getFileInfo = (file) => new Promise((resolve, reject) => {
    stat(file.path, (err, stats) => {
        if (err) {
            reject(err);
            return;
        }
        let extname = getExtname(file.path)
        let extension = getFileMime(extname)
        resolve({
            name: file.name,
            ext: extname,
            mime: extension,
            canPreview: getPreviewMode(extension),
            type: getFileType(file.name),
            mtime: stats.mtime,
            size: stats.size
        })
    })
},)

const previewFile = (query) => {
    const { filePath } = query
    // 获取文件类型
    let ext = extname(filePath).split('.')[1]
    let content = ''
    try {
        if (imageExts.includes(ext)) {
            content = readFileSync(filePath,);
            content = Buffer.from(content).toString('base64')
        } else {
            content = readFileSync(filePath, "utf-8");
            content = content.replace(new RegExp("\\r\\n", "g"), '\n')
        }
        return { code: 200, message: 'success', data: content }
    } catch (err) {
        return { code: 403, message: err, data: null }
    }
}

app.get('/path', async (req, res) => {
    let result = await read(req.query)
    res.status(result.code).json(result)
})

app.get('/downloadFile', (req, res) => {
    downloadFile(req.query.filePath, res)
})

app.get('/previewFile', (req, res) => {
    const result = previewFile({ filePath: req.query.filePath })
    res.status(result.code).json(result)
})


app.listen(config.serverPort, () => {
    console.log('访问成功,请到  http://localhost:3006')
})


