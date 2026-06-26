import { NextResponse } from 'next/server';
import * as dbServices from '@/lib/services';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    if (!companyId) return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
    
    const items = await dbServices.getInventoryItems(companyId);
    return NextResponse.json(items);
  } catch (error) {
    console.error("API inventory GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { companyId, itemData } = await request.json();
    const newItem = await dbServices.createInventoryItem(companyId, itemData);
    return NextResponse.json(newItem);
  } catch (error) {
    console.error("API inventory POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, itemData } = await request.json();
    const { id: _, companyId: __, createdAt: ____, updatedAt: _____, ...updatePayload } = itemData;
    const updatedItem = await dbServices.updateInventoryItem(id, updatePayload);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("API inventory PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await dbServices.deleteInventoryItem(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API inventory DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
