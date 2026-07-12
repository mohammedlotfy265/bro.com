import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  migrated: boolean | undefined
}

if (!globalForPrisma.migrated && process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  try {
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      env: { ...process.env },
      stdio: 'pipe',
      timeout: 30000,
    })
    globalForPrisma.migrated = true
  } catch (e) {
    console.error('Migration error:', e)
  }
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export function userPublic(u: any) {
  return {
    id: u.id,
    name: u.name,
    phone: u.phone,
    role: u.role,
    points: u.points,
    active: u.active,
    approved: u.approved,
  }
}
