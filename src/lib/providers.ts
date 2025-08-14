import {
  Provider,
  Service,
  CreateServiceData,
  UpdateServiceData,
} from '@/types/provider';
import prisma from '@/lib/prisma';
import slugify from 'slugify';

// Provider functions
export async function getProviderBySlug(
  slug: string
): Promise<Provider | null> {
  const provider = await prisma.provider.findUnique({
    where: { slug },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  return provider;
}

export async function getProviderById(id: string): Promise<Provider | null> {
  const provider = await prisma.provider.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  return provider;
}

export async function getProviderByUserId(
  userId: string
): Promise<Provider | null> {
  const provider = await prisma.provider.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  return provider;
}

export async function createProvider(
  userId: string,
  businessName: string
): Promise<Provider> {
  const baseSlug = slugify(businessName, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.provider.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const provider = await prisma.provider.create({
    data: {
      userId,
      businessName,
      slug,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  return provider;
}

// Service functions
export async function getServicesByProviderId(
  providerId: string
): Promise<Service[]> {
  const services = await prisma.service.findMany({
    where: { providerId },
    include: {
      provider: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      },
    },
  });

  return services;
}

export async function getServiceBySlug(
  providerSlug: string,
  serviceSlug: string
): Promise<Service | null> {
  const service = await prisma.service.findFirst({
    where: {
      slug: serviceSlug,
      provider: {
        slug: providerSlug,
      },
    },
    include: {
      provider: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      },
    },
  });

  return service;
}

export async function createService(
  providerId: string,
  data: CreateServiceData
): Promise<Service> {
  const baseSlug = slugify(data.name, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.service.findFirst({ where: { slug, providerId } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const service = await prisma.service.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      slug,
      providerId,
    },
    include: {
      provider: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      },
    },
  });

  return service;
}

export async function updateService(
  serviceId: string,
  data: UpdateServiceData
): Promise<Service> {
  const service = await prisma.service.update({
    where: { id: serviceId },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      slug: data.slug,
    },
    include: {
      provider: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      },
    },
  });

  return service;
}

export async function deleteService(serviceId: string): Promise<void> {
  await prisma.service.delete({
    where: { id: serviceId },
  });
}

// Subscription functions
export async function getSubscribersByServiceId(serviceId: string) {
  const subscriptions = await prisma.subscription.findMany({
    where: { serviceId },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  return subscriptions;
}

export async function createSubscription(
  serviceId: string,
  userId: string,
  providerId: string
) {
  const subscription = await prisma.subscription.create({
    data: {
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      userId,
      providerId,
      serviceId,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
      provider: true,
      service: true,
    },
  });

  return subscription;
}

// Security helpers
export async function verifyProviderAccess(
  userId: string,
  providerId: string
): Promise<boolean> {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
  });

  return provider?.userId === userId;
}

export async function verifyServiceAccess(
  userId: string,
  serviceId: string
): Promise<boolean> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { provider: true },
  });

  return service?.provider.userId === userId;
}
