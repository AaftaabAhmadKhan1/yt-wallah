import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST — register a new student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, city, state, country, pincode } = body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !city?.trim() || !state?.trim() || !country?.trim() || !pincode?.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Check if student already exists
    const existing = await prisma.student.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists. Please login instead.' }, { status: 409 });
    }

    const student = await prisma.student.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        pincode: pincode.trim(),
      },
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET — check if a student exists by email
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    return NextResponse.json({ exists: !!student, student: student || null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lookup failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
