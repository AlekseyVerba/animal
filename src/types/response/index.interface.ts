export interface IResponse {
    status: boolean
    message: string
}

export interface IResponseSuccess<TYPE_RETURN = void> extends IResponse {
    status: true
    data?: TYPE_RETURN
}

export interface IResponseFail<TYPE_RETURN = void> extends IResponse {
    status: false
    errors?: TYPE_RETURN
}