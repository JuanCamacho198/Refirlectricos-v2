import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {
    if (!this.prisma) {
      console.error('ProductsService: PrismaService is not initialized!');
    }
  }

  async create(createProductDto: CreateProductDto) {
    console.log('ProductsService: Creating product in DB:', createProductDto);
    try {
      const slug = slugify(createProductDto.name, {
        lower: true,
        strict: true,
      });

      // Verificar si el slug ya existe
      const existingProduct = await this.prisma.product.findUnique({
        where: { slug },
      });

      if (existingProduct) {
        throw new BadRequestException(
          `Product with name "${createProductDto.name}" already exists (slug conflict)`,
        );
      }

      const product = await this.prisma.product.create({
        data: {
          ...createProductDto,
          slug,
        },
      });
      console.log('ProductsService: Product created successfully:', product.id);
      return product;
    } catch (error) {
      console.error(
        'ProductsService: Error creating product in Prisma:',
        error,
      );
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      search?: string;
      category?: string;
      brand?: string;
      minPrice?: number;
      maxPrice?: number;
    },
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {};

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { brand: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.brand) {
      where.brand = filters.brand;
    }

    if (filters?.minPrice || filters?.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(term: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: term }, { slug: term }],
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with term "${term}" not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { name } = updateProductDto;
    const data = { ...updateProductDto, slug: undefined };

    if (name) {
      data.slug = slugify(name, { lower: true, strict: true });
    }

    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async getMetadata() {
    const [categories, brands] = await Promise.all([
      this.prisma.product.findMany({
        select: { category: true },
        distinct: ['category'],
        where: { category: { not: null } },
      }),
      this.prisma.product.findMany({
        select: { brand: true },
        distinct: ['brand'],
        where: { brand: { not: null } },
      }),
    ]);

    return {
      categories: categories.map((c) => c.category).filter(Boolean),
      brands: brands.map((b) => b.brand).filter(Boolean),
    };
  }

  async findRelated(category: string, excludeId: string) {
    return this.prisma.product.findMany({
      where: {
        category,
        id: { not: excludeId },
        isActive: true,
      },
      take: 4,
    });
  }
}
