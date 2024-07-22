import { Module } from '@nestjs/common';
import { CodeService } from './code.service';
import { CodeController } from './code.controller';
import { Code } from './entities/code.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodeGateway } from './code.gateway';
import { KafkaClientProvider } from '../kafka/kafka-client.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Code])],
  controllers: [CodeController],
  providers: [CodeService, CodeGateway, KafkaClientProvider],
})
export class CodeModule {}
