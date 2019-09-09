import {HttpError} from "routing-controllers";

export class ErrorToken extends HttpError {
    constructor() {
        super(404, "User not found!");
    }
}