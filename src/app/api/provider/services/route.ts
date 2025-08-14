import { NextRequest, NextResponse } from 'next/server';
import {
  createService,
  getServicesByProviderId,
  updateService,
  deleteService,
  verifyProviderAccess,
  verifyServiceAccess,
} from '@/lib/providers';
import { CreateServiceData, UpdateServiceData } from '@/types/provider';
import { auth } from '@/lib/auth';
import slugify from 'slugify';

// GET /api/provider/services?providerId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    const services = await getServicesByProviderId(providerId);
    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST /api/provider/services
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const {
      providerId,
      ...serviceData
    }: { providerId: string } & CreateServiceData = body;

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    const hasAccess = await verifyProviderAccess(
      session.user.id as string,
      providerId
    );
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Ensure slug creation consistency at API boundary too (defense in depth)
    serviceData.name = serviceData.name.trim();
    const service = await createService(providerId, serviceData);
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}

// PUT /api/provider/services
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const {
      serviceId,
      ...updateData
    }: { serviceId: string } & UpdateServiceData = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const hasAccess = await verifyServiceAccess(
      session.user.id as string,
      serviceId
    );
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (updateData.name && !updateData.slug) {
      updateData.slug = slugify(updateData.name, { lower: true, strict: true });
    }

    const service = await updateService(serviceId, updateData);
    return NextResponse.json({ service });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE /api/provider/services?serviceId=...
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const hasAccess = await verifyServiceAccess(
      session.user.id as string,
      serviceId
    );
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteService(serviceId);
    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
