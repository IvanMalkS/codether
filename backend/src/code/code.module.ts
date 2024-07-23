import { Module } from '@nestjs/common';
import { CodeService } from './code.service';
import { CodeController } from './code.controller';
import { Code } from './entities/code.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodeGateway } from './code.gateway';
import { KafkaClientProvider } from '../kafka/kafka-client.provider';
import { S3ClientService } from '../s3/s3-client.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Code]), RedisModule],
  controllers: [CodeController],
  providers: [CodeService, CodeGateway, KafkaClientProvider, S3ClientService],
})
export class CodeModule {}
