import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../services/email.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  async createInquiry(dto: CreateContactDto) {
    // Save to DB
    const inquiry = await this.prisma.contactInquiry.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        subject: dto.subject,
        message: dto.message,
        inquiryType: dto.inquiryType,
        status: 'PENDING',
      },
    });

    // Auto-reply to sender
    try {
      await this.email.sendContactFormAutoReply(dto.name, dto.email, dto.inquiryType);
    } catch {
      // Don't fail if email fails
    }

    return { message: 'Inquiry submitted successfully', id: inquiry.id };
  }

  async findAll(userId: string, query: Record<string, string>) {
    const page = parseInt(query.page ?? '1');
    const limit = parseInt(query.limit ?? '20');
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.contactInquiry.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where: query.status ? { status: query.status as any } : undefined,
      }),
      this.prisma.contactInquiry.count(),
    ]);

    return { items, total, page, limit };
  }

  async findOne(id: string, _userId: string) {
    return this.prisma.contactInquiry.findUnique({ where: { id } });
  }

  async create(userId: string, dto: any) {
    return this.createInquiry(dto);
  }

  async update(id: string, _userId: string, dto: any) {
    return this.prisma.contactInquiry.update({ where: { id }, data: dto });
  }

  async remove(id: string, _userId: string) {
    return this.prisma.contactInquiry.delete({ where: { id } });
  }
}
