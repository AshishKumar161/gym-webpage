import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GalleryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: Record<string, string>) {
    return [];
  }

  async findOne(id: string, userId: string) {
    return null;
  }

  async create(userId: string, dto: any) {
    return null;
  }

  async update(id: string, userId: string, dto: any) {
    return null;
  }

  async remove(id: string, userId: string) {
    return null;
  }
}
