import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { Source } from './source.entity';

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(Source)
    private sourcesRepository: Repository<Source>,
  ) {}

  async create(createSourceDto: CreateSourceDto): Promise<Source> {
    const source = this.sourcesRepository.create(createSourceDto);
    return this.sourcesRepository.save(source);
  }

  async findAll(): Promise<Source[]> {
    return this.sourcesRepository.find();
  }

  async findOne(id: number): Promise<Source> {
    const source = await this.sourcesRepository.findOne({ where: { id } });
    if (!source) {
      throw new NotFoundException(`Источник с ID ${id} не найден`);
    }
    return source;
  }

  async update(id: number, updateSourceDto: UpdateSourceDto): Promise<Source> {
    await this.sourcesRepository.update(id, updateSourceDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.sourcesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Источник с ID ${id} не найден`);
    }
  }
}
