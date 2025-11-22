import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalProducts, totalOrders, paidOrders, lowStockProducts] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.product.count(),
        this.prisma.order.count(),
        this.prisma.order.findMany({
          where: { status: 'PAID' },
          select: { total: true, createdAt: true },
        }),
        this.prisma.product.count({
          where: { stock: { lte: 5 } },
        }),
      ]);

    const totalRevenue = paidOrders.reduce((acc, order) => acc + order.total, 0);

    // 1. Revenue History (Last 6 months)
    const revenueByMonth = this.getRevenueByMonth(paidOrders);

    // 2. Order Status Distribution
    const orderStatusDistribution = await this.prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // 3. Recent Orders
    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    // 4. Top Selling Products
    const topSellingItems = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 4,
    });

    const topProducts = await Promise.all(
      topSellingItems.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, price: true, image_url: true, category: true },
        });
        return {
          ...product,
          sold: item._sum.quantity,
        };
      }),
    );

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      lowStockProducts,
      revenueByMonth,
      orderStatusDistribution,
      recentOrders,
      topProducts,
    };
  }

  private getRevenueByMonth(orders: { total: number; createdAt: Date }[]) {
    const months = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    const currentDate = new Date();
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      last6Months.push({
        month: months[d.getMonth()],
        year: d.getFullYear(),
        revenue: 0,
        rawDate: d,
      });
    }

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const monthEntry = last6Months.find(
        (m) =>
          m.rawDate.getMonth() === orderDate.getMonth() &&
          m.rawDate.getFullYear() === orderDate.getFullYear(),
      );
      if (monthEntry) {
        monthEntry.revenue += order.total;
      }
    });

    return last6Months.map(({ month, revenue }) => ({ name: month, revenue }));
  }
}
