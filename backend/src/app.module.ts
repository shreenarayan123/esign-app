// 
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from '../config/app.config';
import { EsignModule } from './esign/esign.module';
@Module({
  imports: [
    EsignModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
