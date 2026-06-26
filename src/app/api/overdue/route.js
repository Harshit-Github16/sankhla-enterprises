import { NextResponse } from 'next/server';
import * as dbServices from '@/lib/services';

export async function POST(request) {
  try {
    const { companyId, overdueData } = await request.json();
    const newRecord = await dbServices.createOverdueRecord(companyId, overdueData);
    return NextResponse.json(newRecord);
  } catch (error) {
    console.error("API overdue POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, overdueData } = await request.json();
    const { id: _, companyId: __, createdAt: ___, updatedAt: ____, ...updatePayload } = overdueData;
    const updatedRecord = await dbServices.updateOverdueRecord(id, updatePayload);
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error("API overdue PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: "Missing Overdue Record ID" }, { status: 400 });
    }
    const deletedRecord = await dbServices.deleteOverdueRecord(id);
    return NextResponse.json(deletedRecord);
  } catch (error) {
    console.error("API overdue DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
