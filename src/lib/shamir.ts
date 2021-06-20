import { split, join } from 'shamir';
import { randomBytes } from 'crypto';

const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder();

export { utf8Encoder, utf8Decoder };

export function generateParts(secret:string, parts:number, quorum:number): any {
    return split(randomBytes, parts, quorum, utf8Encoder.encode(secret));
}

export function joinParts(parts: any): string {
    return utf8Decoder.decode(join(parts));
}