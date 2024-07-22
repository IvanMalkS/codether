import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3ClientService {
  private readonly s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    endpoint: process.env.AWS_ENDPOINT,
    apiVersion: 'latest',
    forcePathStyle: true,
  });

  async uploadFile(fileExtension: string, file: Buffer): Promise<void> {
    const creationDate = new Date();

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}.${fileExtension}`,
        Body: file,
        Metadata: {
          'creation-date': creationDate.toISOString(),
        },
      }),
    );
  }
}
