import { extname, } from 'node:path';


/**
 * get file extname by file path or file name
 * @param {string} filePath | filename
 */
export const getExtname = (filePath) => {
    let name = extname(filePath)
    if (name) {
        return name.slice(1)
    } else {
        return ''
    }
}