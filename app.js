const express = require('express')
const cors = require('cors');
const {existsSync, stat} = require('node:fs')
const {mkdir, readdir,} = require('node:fs/promises');
const {
    join,
    basename,
    extname
} = require('node:path');

const app = express()

app.use(cors())

async function read(params) {
    const {path, type} = params
    let pathArr = path.split('/')
    if (existsSync(join(__dirname, ...pathArr))) {
        try {
            const currentPathFiles = await readdir(join(__dirname, ...pathArr), {withFileTypes: true, recursive: false});

            if (type === 'dir') {
                let dirs = currentPathFiles.filter(item => !item.isFile()).map(item => ({
                    type: 'dir',
                    name: item.name,
                    path: path + '/' + item.name
                }))
                return {code: 200, data: dirs, message: 'success'}
            }
            if (type === 'file') {
                let files = currentPathFiles.filter(item => !item.isDirectory()).map(file => ({
                    ...file,
                    path: path + '/' + file.name
                }))
                let filesPromise = []
                for (let i = 0; i < files.length; i++) {
                    filesPromise.push(getFileInfo(files[i]))
                }

                let fileStat = await Promise.all(filesPromise)
                return {code: 200, data: fileStat, message: 'success'}
            }

        } catch (err) {
            return {code: 500, data: null, message: 'Internal Server Error'}
        }
    } else {
        return {code: 404, message: 'not found', data: null}
    }
}

getFileInfo = (file) => new Promise((resolve, reject) => {
    stat(file.path, (err, stats) => {
        if (err) {
            reject(err);
            return;
        }
        resolve({name: file.name, ext: extname(file.path), type: 'file', mtime: stats.mtime, size: stats.size})
    })
},)

app.get('/api/path', async (req, res) => {
    console.log(req.query)
    let result = await read(req.query)
    res.status(result.code).json(result)
})

app.listen(3006, () => {
    console.log('访问成功,请到  http://localhost:3006')
})

