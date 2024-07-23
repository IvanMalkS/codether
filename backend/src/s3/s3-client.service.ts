import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
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

  async uploadFile(fileExtension: string, file: Buffer): Promise<string> {
    const creationDate = new Date();
    const key = `${uuidv4()}.${fileExtension}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
          Body: file,
          Metadata: {
            'creation-date': creationDate.toISOString(),
          },
        }),
      );
    } catch (error) {
      console.error(error);
      throw new Error('Failed to upload file on S3');
    }
    return key;
  }

  async getFile(key: string): Promise<string> {
    try {
      if (!key) {
        throw new Error('Key is required');
      }
      const { Body } = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
        }),
      );
      return await Body?.transformToString();
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get file from S3');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      if (!key) {
        throw new Error('Key is required');
      }
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
        }),
      );
    } catch (error) {
      console.error(error);
      throw new Error('Failed to delete file from S3');
    }
  }
}
