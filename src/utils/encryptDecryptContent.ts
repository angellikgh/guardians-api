import * as crypto from 'crypto';
import { Buffer } from 'buffer';
const algorithm = 'aes-256-ctr';

export const encrypt = (
  text: string,
  secretKey: string,
  iv: { toString: (arg0: string) => { iv: string; content: string } }
) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encryptedContent = Buffer.concat([cipher.update(text), cipher.final()]);
  return {
    iv: iv.toString('hex'),
    content: encryptedContent.toString('hex'),
  };
};

export const decrypt = (hash: { iv: Buffer; content: string }, secretKey: string) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const buffer = Buffer.from(hash.iv, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, secretKey, buffer);
  const decryptContent = Buffer.concat([
    decipher.update(Buffer.from(hash.content, 'hex')),
    decipher.final(),
  ]);
  return decryptContent.toString();
};
