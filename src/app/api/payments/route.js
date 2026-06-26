import { NextResponse } from 'next/server';
import * as dbServices from '@/lib/services';

export async function POST(request) {
  try {
    const { companyId, paymentData } = await request.json();
    const newPayment = await dbServices.createPayment(companyId, paymentData);
    return NextResponse.json(newPayment);
  } catch (error) {
    console.error("API payments POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
