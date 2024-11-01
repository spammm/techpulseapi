import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { SourcesService } from './sources.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { Source } from './source.entity';

@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Post()
  async create(@Body() createSourceDto: CreateSourceDto): Promise<Source> {
    return this.sourcesService.create(createSourceDto);
  }

  @Get()
  async findAll(): Promise<Source[]> {
    return this.sourcesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Source> {
    return this.sourcesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateSourceDto: UpdateSourceDto,
  ): Promise<Source> {
    return this.sourcesService.update(id, updateSourceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.sourcesService.remove(id);
  }
}
