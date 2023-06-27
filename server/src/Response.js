export class Response {
    data;
    status;
    error;

    constructor(data = {}, status = 200, error = '') {
        this.data = data;
        this.status = status;
        this.error = error;
    }

    get toString() {
        return JSON.stringify({
            status: this.status,
            error: this.error,
            data: this.data
        });
    }
}

/** The server cannot or will not process the request due to something that is perceived to be a client error. */
export const BAD_REQUEST = 400;
/** Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response. */
export const UNAUTHORIZED = 401;
/** Not allowed for this current identified user. */
export const FORBIDDEN = 403;
/** The server cannot find the requested resource. */
export const NOT_FOUND = 404;
/** This response is sent on an idle connection by some servers, even without any previous request by the client. It means that the server would like to shut down this unused connection. */
export const TIMEOUT = 408;
/** The request succeeded. */
export const OK = 200;