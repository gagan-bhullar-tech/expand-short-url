import { request as httpRequest, IncomingMessage } from 'http';
import { request as httpsRequest, RequestOptions } from 'https';

export interface IExpandShortUrlOptions extends RequestOptions {
    timeout: number;
    maxRedirects: number;
}

const defaultOptions: IExpandShortUrlOptions = {
    timeout: 5000, // Default timeout of 5 seconds
    maxRedirects: 3, // Default max redirects
};

const fireRequest = (url: string, options: IExpandShortUrlOptions): Promise<string> => {
    return new Promise((resolve, reject) => {
        const request = url.startsWith('https') ? httpsRequest : httpRequest;
        const req = request(url, options, (res: IncomingMessage) => {
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // Handle redirects
                if (options.maxRedirects > 0) {
                    options.maxRedirects--;
                    return resolve(fireRequest(res.headers.location, options));
                } else {
                    return reject(new Error('Max redirects exceeded'));
                }
            } else if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                // Successful response
                resolve(res.headers.location || url);
            } else {
                // Error response
                reject(new Error(`Request failed with status code ${res.statusCode}`));
            }
        });

        req.on('error', reject);
        req.setTimeout(options.timeout, () => req.destroy());
        req.end();
    });
};

export const expand = (url: string, options: IExpandShortUrlOptions): Promise<string> => {
    const finalOptions: IExpandShortUrlOptions = {
        ...defaultOptions,
        ...options,
    };

    return fireRequest(url, finalOptions);
};