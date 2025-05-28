import { request as httpRequest, IncomingMessage } from 'http';
import { request as httpsRequest, RequestOptions } from 'https';

export interface IExpandShortUrlOptions extends RequestOptions {
    timeout: number;
    maxRedirects: number;
}