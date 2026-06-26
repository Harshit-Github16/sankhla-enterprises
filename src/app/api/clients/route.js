import { NextResponse } from 'next/server';
import * as dbServices from '@/lib/services';

export async function POST(request) {
  try {
    const { companyId, clientData } = await request.json();
    const newClient = await dbServices.createClient(companyId, clientData);
    return NextResponse.json(newClient);
  } catch (error) {
    console.error("API clients POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, clientData } = await request.json();
    // Exclude relations/id from update fields
    const { id: _, companyId: __, createdAt: ___, updatedAt: ____, ...updatePayload } = clientData;
    const updatedClient = await dbServices.updateClient(id, updatePayload);
    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error("API clients PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: "Missing Client ID" }, { status: 400 });
    }
    const deletedClient = await dbServices.deleteClient(id);
    return NextResponse.json(deletedClient);
  } catch (error) {
    console.error("API clients DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
