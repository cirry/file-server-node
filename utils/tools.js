const { extname, } = require('node:path');


/**
 * get file extname by file path or file name
 * @param {string} filePath | filename
 */
const getExtname = (filePath) => {
    let name = extname(filePath)
    if (name) {
        return name.slice(1)
    } else {
        return ''
    }
}

module.exports = {
    getExtname
}