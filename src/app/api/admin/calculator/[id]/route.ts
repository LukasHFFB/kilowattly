import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.calculator.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting calculator:', error);
        return NextResponse.json({ error: 'Failed to delete calculator' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        const updated = await prisma.calculator.update({
            where: { id },
            data: {
                ...(body.deviceName !== undefined && { deviceName: body.deviceName }),
                ...(body.keyword !== undefined && { keyword: body.keyword }),
                ...(body.default_wattage !== undefined && { default_wattage: Number(body.default_wattage) }),
                ...(body.average_daily_usage_hours !== undefined && { average_daily_usage_hours: Number(body.average_daily_usage_hours) }),
                ...(body.seo_content !== undefined && { seo_content: body.seo_content }),
                ...(body.faqs !== undefined && { faqs: body.faqs }),
                ...(body.status !== undefined && { status: body.status }),
            },
        });

        return NextResponse.json({ success: true, calculator: updated });
    } catch (error) {
        console.error('Error updating calculator:', error);
        return NextResponse.json({ error: 'Failed to update calculator' }, { status: 500 });
    }
}

