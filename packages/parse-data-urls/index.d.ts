/// <reference types="node" />
import Bluebird from 'bluebird';
import MIMEType from 'whatwg-mimetype';
export interface IParseDataURL {
    mime: string;
    charset: string;
    base64: boolean;
    /**
     * The mimeType property is an instance of whatwg-mimetype's MIMEType class.
     */
    mimeType: MIMEType;
    /**
     * The body property is a Node.js Buffer instance.
     */
    body: Buffer;
}
export declare function parseDataURL(url: string): Bluebird<IParseDataURL>;
export default parseDataURL;
