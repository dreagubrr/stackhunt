import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET;

export const uploadToS3 = async (buffer, filename, mimetype, folder = 'cvs') => {
  const key = `${folder}/${Date.now()}-${filename}`;
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  }));
  return key;
};

//Subida de avatar a S3 (no ACL - usa URLS firmadas)
export const uploadAvatarToS3 = async (base64Data, mimetype, userId) => {
  const ext = mimetype.split('/')[1] || 'jpg';
  const key = `avatars/${userId}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(base64Data, 'base64');

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  }));

  // Regresa URL firmado por 7 dias
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  const url = await getSignedUrl(s3, command, { expiresIn: 604800 });
  return { key, url };
};

// Borra archivo del s3
export const deleteFromS3 = async (key) => {
  await s3.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }));
};

// Genera un URL firmado válido por 1 hora
export const getSignedDownloadUrl = async (key) => {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
};

//Refresca el avatar firmado en URL tiene vigencia de 7 días 
export const getSignedAvatarUrl = async (key) => {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return await getSignedUrl(s3, command, { expiresIn: 604800 });
};