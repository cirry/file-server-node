const express = require('express')
const {mkdir, readdir, stat} = require('node:fs/promises');
const {join,basename,extname} = require('node:path');

const app = express()

console.log(__dirname);

async function read() {
    try {
        const files = await readdir(join(__dirname, 'publish'), {withFileTypes: true, recursive: true});
        console.log(files)
        let ext = extname(files[1].name).slice(1);
        console.log(files[1].name, ext, basename(files[1].path))
        // for (const file of files) {
        //     let filename = basename(file.path)
        //     let fileext = extname(file.path).slice(1);
        //
        //     let fileStatus = await stat(file.path)
        //     console.log(filename)
        //     console.log(fileext)
        //     console.log(fileStatus.filename)
        // }
    } catch (err) {
        console.log(err)
    }
}

read();
console.log('1')


app.listen(3006, () => {
    console.log('访问成功,请到  http://localhost:3006')
})

