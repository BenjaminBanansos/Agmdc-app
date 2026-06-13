const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Create Regions
  const south = await prisma.region.create({
    data: { name: 'South Region' }
  })
  const central = await prisma.region.create({
    data: { name: 'Central Region' }
  })

  // Create Section
  const section1 = await prisma.section.create({
    data: { name: 'Trivandrum South', regionId: south.id }
  })

  // Create Church
  const church1 = await prisma.church.create({
    data: { name: 'Bethel AG Trivandrum', sectionId: section1.id, isRecognized: true }
  })

  // Create User (Superintendent)
  const superuser = await prisma.user.create({
    data: {
      name: 'Rev. Superintendent',
      email: 'super@agmdc.in',
      role: 'SUPERINTENDENT',
      credentialLevel: 'ORDINATION',
      churchId: church1.id
    }
  })

  // Create a Complaint
  await prisma.complaint.create({
    data: {
      refNumber: 'COMP-101',
      title: 'Dispute over section boundaries',
      description: 'Two churches are disputing the borders in the South region.',
      submitterId: superuser.id,
      level: 'REGIONAL',
      status: 'OPEN',
      customFields: JSON.stringify({ resolutionTime: "Pending" })
    }
  })

  console.log("Database successfully seeded with live data!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
