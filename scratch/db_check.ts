
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const userCount = await prisma.user.count()
    const leadCount = await prisma.lead.count()
    console.log(`Users: ${userCount}`)
    console.log(`Leads: ${leadCount}`)
    
    const sampleLeads = await prisma.lead.findMany({ take: 5 })
    console.log('Sample Leads:', JSON.stringify(sampleLeads, null, 2))
    
    const sampleUsers = await prisma.user.findMany({ take: 5 })
    console.log('Sample Users:', JSON.stringify(sampleUsers, null, 2))
  } catch (e) {
    console.error('Error connecting to DB:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
