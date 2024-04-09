const express = require('express')
const cors = require('cors');
const { existsSync, stat, readFileSync } = require('node:fs')
const { mkdir, readdir, } = require('node:fs/promises');
const {
    join,
    basename,
    extname,

} = require('node:path');
const { log } = require('node:console');
const { downloadFile } = require('./http/downfile')
const app = express()

app.use(cors())

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
                log(fileStat)
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

getFileInfo = (file) => new Promise((resolve, reject) => {
    stat(file.path, (err, stats) => {
        if (err) {
            reject(err);
            return;
        }
        resolve({ name: file.name, ext: extname(file.path).slice(1), type: 'file', mtime: stats.mtime, size: stats.size })
    })
},)

previewFile = (query) => {
    const { filePath } = query
    try {
        const content = readFileSync(filePath, 'utf8');
        return { code: 200, message: 'success', data: content }
    } catch (err) {
        return { code: 403, message: err, data: null }
    }
}

app.get('/api/path', async (req, res) => {
    console.log(req.query)
    let result = await read(req.query)
    res.status(result.code).json(result)
})

app.get('/api/downloadFile', (req, res) => {
    console.log(req.query, '/api/downloadFile')

    downloadFile(req.query.filePath, res)
})

app.get('/api/previewFile', (req, res) => {
    console.log(req.query)
    const result = previewFile({ filePath: req.query.filePath })
    res.status(result.code).json(result)
})

app.listen(3006, () => {
    console.log('访问成功,请到  http://localhost:3006')
})

