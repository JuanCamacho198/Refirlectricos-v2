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
    const grouped = await this.prisma.product.groupBy({
      by: ['category', 'brand'],
      where: {
        isActive: true,
        category: { not: '' }, // Ensure category is not empty
      },
      orderBy: {
        category: 'asc',
      },
    });

    // Transform into a structured format: Category -> Brands[]
    const categoryMap = new Map<string, Set<string>>();

    grouped.forEach((item) => {
      if (!item.category) return;
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, new Set());
      }
      if (item.brand) {
        categoryMap.get(item.category).add(item.brand);
      }
    });

    const categoriesWithBrands = Array.from(categoryMap.entries()).map(
      ([category, brandsSet]) => ({
        name: category,
        subcategories: Array.from(brandsSet).sort(),
      }),
    );

    // Maintain backward compatibility for simple lists if needed,
    // but for now we return the structured data + flat lists
    const allCategories = Array.from(categoryMap.keys()).sort();
    const allBrands = Array.from(
      new Set(grouped.map((g) => g.brand).filter(Boolean)),
    ).sort();

    return {
      categories: allCategories,
      brands: allBrands,
      structure: categoriesWithBrands,
    };
  }

  async getSuggestions(term: string) {
    if (!term) return [];

    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { category: { contains: term, mode: 'insensitive' } },
          { brand: { contains: term, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      select: {
        name: true,
        category: true,
        brand: true,
        image_url: true,
        slug: true,
        id: true,
      },
      take: 5,
    });

    return products;
  }

  async getRecommendations(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { category: true, tags: true },
    });

    if (!product) return [];

    return this.prisma.product.findMany({
      where: {
        id: { not: id },
        isActive: true,
        OR: [
          { category: product.category },
          { tags: { hasSome: product.tags } },
        ],
      },
      take: 4,
      orderBy: {
        // Prioritize newer products or maybe random?
        // Prisma doesn't support random easily.
        createdAt: 'desc',
      },
    });
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
