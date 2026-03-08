import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { registerSchema } from '@/lib/validations/auth'
import { createCustodialWallet } from '@/lib/solana/custodial'

// ---------------------------------------------------------------------------
// POST /api/users/register
//
// Creates a new user account with:
//   - Hashed password (bcrypt, 12 rounds)
//   - Default role: INVESTOR
//   - Default KYC: NONE
//   - Audit log entry
//
// Called by the registration form before triggering signIn('credentials').
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { name, email, password } = parsed.data

    // Check for existing account
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user + custodial wallet + audit log atomically
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          // defaults: role=INVESTOR, kycStatus=NONE, subscriptionTier=free
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      })

      // Provision a custodial Solana wallet — sets User.walletAddress
      await createCustodialWallet(newUser.id, tx)

      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: 'user.register',
          resourceType: 'User',
          resourceId: newUser.id,
          metadata: { provider: 'credentials' },
        },
      })

      return newUser
    })

    return NextResponse.json(
      { success: true, userId: user.id },
      { status: 201 },
    )
  } catch (error) {
    console.error('[register] Error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 },
    )
  }
}
