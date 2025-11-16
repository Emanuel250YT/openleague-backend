import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { EmailModule } from './email/email.module.js';
import { UploadModule } from './upload/upload.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { NotificationModule } from './notification/notification.module.js';
import { ChallengeModule } from './challenge/challenge.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { AdminModule } from './admin/admin.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    EmailModule,
    UploadModule,
    ProfileModule,
    NotificationModule,
    ChallengeModule,
    TasksModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
