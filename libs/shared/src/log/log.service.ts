import { Injectable } from '@nestjs/common';
import { createLogger, format } from 'winston';
import * as redisTransport from 'winston-redis';

@Injectable()
export class LogService {
  async createErrorLog(msg: string): Promise<void> {
    const logger = createLogger({
      format: format.combine(
        format.errors({ stack: true }),
        format.json(),
        format.timestamp(),
      ),
      transports: [
        new redisTransport({
          host: process.env.REDIS_HOST,
          auth: process.env.REDIS_PASSWORD,
        }),
      ],
    });
    logger.error(new Error(msg));
  }

  async createInfoLog(msg: string): Promise<void> {
    const logger = createLogger({
      format: format.combine(format.timestamp(), format.json()),
      transports: [
        new redisTransport({
          host: process.env.REDIS_HOST,
          auth: process.env.REDIS_PASSWORD,
        }),
      ],
    });
    logger.info(msg);
  }
}
