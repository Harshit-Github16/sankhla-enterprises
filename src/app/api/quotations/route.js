import { NextResponse } from 'next/server';
import * as dbServices from '@/lib/services';

export async function POST(request) {
  try {
    const { companyId, quoteData } = await request.json();
    const newQuote = await dbServices.createQuotation(companyId, quoteData);
    return NextResponse.json(newQuote);
  } catch (error) {
    console.error("API quotations POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, quoteData } = await request.json();
    const { id: _, companyId: __, clientId: ___, createdAt: ____, updatedAt: _____, client: ______, ...updatePayload } = quoteData;
    if (updatePayload.dueDate) {
      updatePayload.dueDate = new Date(updatePayload.dueDate);
    }
    const updatedQuote = await dbServices.updateQuotation(id, updatePayload);
    return NextResponse.json(updatedQuote);
  } catch (error) {
    console.error("API quotations PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: "Missing Quotation ID" }, { status: 400 });
    }
    const deletedQuote = await dbServices.deleteQuotation(id);
    return NextResponse.json(deletedQuote);
  } catch (error) {
    console.error("API quotations DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

