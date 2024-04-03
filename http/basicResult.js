class basicResult {
    constructor(code, msg, data) {
        this.code = code
        this.msg = msg
        this.data = data
        this.time = Date.now()
    }

    /**
     * 成功
     * @param data {any} 返回对象
     * @return {basicResult}
     */
    static success(data) {
        return new basicResult(CODE.SUCCESS, "成功", data);
    }

    /**
     * 失败
     */
    static fail(errData) {
        return new basicResult(CODE.SERVER_ERROR, "服务器异常", errData);
    }

}

const CODE = {
    SUCCESS: 200,
    SERVER_ERROR: 500,
    NOT_FOUND: 404,
}

export {
    CODE, basicResult
}
