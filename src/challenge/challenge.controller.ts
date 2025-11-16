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
import { ChallengeService } from './challenge.service.js';
import { CreateChallengeDto } from './dto/create-challenge.dto.js';
import { UpdateChallengeDto } from './dto/update-challenge.dto.js';
import { CreateSubmissionDto } from './dto/create-submission.dto.js';
import { UpdateSubmissionDto } from './dto/update-submission.dto.js';
import { ChallengeFilterDto } from './dto/challenge-filter.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('challenges')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) { }

  // ============================================
  // ENDPOINTS DE RETOS
  // ============================================

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateChallengeDto) {
    return this.challengeService.create(dto);
  }

  @Get()
  async findAll(@Query() filters: ChallengeFilterDto) {
    return this.challengeService.findAll(filters);
  }

  @Get('active')
  async findActive() {
    return this.challengeService.findActive();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.challengeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateChallengeDto) {
    return this.challengeService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.challengeService.remove(id);
  }

  // ============================================
  // ENDPOINTS DE PARTICIPACIONES
  // ============================================

  @Post('submissions')
  @UseGuards(JwtAuthGuard)
  async createSubmission(@Request() req, @Body() dto: CreateSubmissionDto) {
    return this.challengeService.createSubmission(req.user.id, dto);
  }

  @Get('submissions/my')
  @UseGuards(JwtAuthGuard)
  async findMySubmissions(@Request() req) {
    return this.challengeService.findUserSubmissions(req.user.id);
  }

  @Get(':id/submissions')
  async findChallengeSubmissions(@Param('id') id: string) {
    return this.challengeService.findChallengeSubmissions(id);
  }

  @Get('submissions/:id')
  @UseGuards(JwtAuthGuard)
  async findSubmission(@Param('id') id: string) {
    return this.challengeService.findSubmission(id);
  }

  @Patch('submissions/:id')
  @UseGuards(JwtAuthGuard)
  async updateSubmission(
    @Param('id') id: string,
    @Body() dto: UpdateSubmissionDto,
  ) {
    return this.challengeService.updateSubmission(id, dto);
  }

  @Delete('submissions/:id')
  @UseGuards(JwtAuthGuard)
  async removeSubmission(@Param('id') id: string, @Request() req) {
    return this.challengeService.removeSubmission(id, req.user.id);
  }
}
