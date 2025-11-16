import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import { UpdateNotificationDto } from './dto/update-notification.dto.js';
import { NotificationFilterDto } from './dto/notification-filter.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Get()
  async findAll(@Request() req, @Query() filters: NotificationFilterDto) {
    return this.notificationService.findByUser(req.user.id, filters);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    return this.notificationService.getUnreadCount(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.notificationService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationDto,
    @Request() req,
  ) {
    return this.notificationService.update(id, req.user.id, dto);
  }

  @Patch('mark-all/read')
  async markAllAsRead(@Request() req) {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.notificationService.remove(id, req.user.id);
  }
}
