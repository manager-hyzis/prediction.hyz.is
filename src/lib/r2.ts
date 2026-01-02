import { createHmac } from 'crypto'
import 'server-only'

export const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'forkast-assets'
export const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL!
export const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!
export const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!
export const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!

function sign(key: string | Buffer, msg: string, encoding?: 'hex' | 'binary'): string {
  return createHmac('sha256', key).update(msg, 'utf8').digest(encoding || 'hex')
}

function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Buffer {
  const kDate = Buffer.from(sign(`AWS4${key}`, dateStamp, 'binary'), 'binary')
  const kRegion = Buffer.from(sign(kDate, regionName, 'binary'), 'binary')
  const kService = Buffer.from(sign(kRegion, serviceName, 'binary'), 'binary')
  const kSigning = Buffer.from(sign(kService, 'aws4_request', 'binary'), 'binary')
  return kSigning
}

export async function uploadToR2(
  key: string,
  buffer: ArrayBuffer,
  contentType: string = 'image/jpeg',
): Promise<string> {
  try {
    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.slice(0, 8)

    const s3Url = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`
    const url = new URL(s3Url)

    const canonicalUri = `/${R2_BUCKET_NAME}/${key}`
    const canonicalQuerystring = ''
    const canonicalHeaders = `content-type:${contentType}\nhost:${url.hostname}\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:${amzDate}\n`
    const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date'

    const payloadHash = 'UNSIGNED-PAYLOAD'
    const canonicalRequest = `PUT\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`

    const algorithm = 'AWS4-HMAC-SHA256'
    const credentialScope = `${dateStamp}/auto/s3/aws4_request`
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${sign(canonicalRequest, '')}`

    const signingKey = getSignatureKey(R2_SECRET_ACCESS_KEY, dateStamp, 'auto', 's3')
    const signature = sign(signingKey, stringToSign)

    const authorizationHeader = `${algorithm} Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

    const response = await fetch(s3Url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Cache-Control': '31536000',
        'X-Amz-Date': amzDate,
        'X-Amz-Content-Sha256': payloadHash,
        'Authorization': authorizationHeader,
      },
      body: Buffer.from(buffer),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`R2 upload failed: ${response.statusText} - ${errorText}`)
    }

    return key
  }
  catch (error) {
    console.error(`Failed to upload to R2: ${key}`, error)
    throw error
  }
}

export function getR2ImageUrl(iconPath: string | null): string {
  if (!iconPath || !R2_PUBLIC_URL) {
    return 'https://avatar.vercel.sh/creator.png'
  }

  return `${R2_PUBLIC_URL}/${iconPath}`
}
