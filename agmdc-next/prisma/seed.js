const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Create Regions
  let south = await prisma.region.findUnique({
    where: { name: 'South Region' }
  })
  if (!south) {
    south = await prisma.region.create({
      data: { name: 'South Region' }
    })
  }

  let central = await prisma.region.findUnique({
    where: { name: 'Central Region' }
  })
  if (!central) {
    central = await prisma.region.create({
      data: { name: 'Central Region' }
    })
  }

  // Create Section
  let section1 = await prisma.section.findFirst({
    where: { name: 'Trivandrum South', regionId: south.id }
  })
  if (!section1) {
    section1 = await prisma.section.create({
      data: { name: 'Trivandrum South', regionId: south.id }
    })
  }

  // Create Church
  let church1 = await prisma.church.findFirst({
    where: { name: 'Bethel AG Trivandrum', sectionId: section1.id }
  })
  if (!church1) {
    church1 = await prisma.church.create({
      data: { name: 'Bethel AG Trivandrum', sectionId: section1.id, isRecognized: true }
    })
  }

  // Create User (Superintendent)
  let superuser = await prisma.user.findUnique({
    where: { email: 'super@agmdc.in' }
  })
  if (!superuser) {
    superuser = await prisma.user.create({
      data: {
        name: 'Rev. Superintendent',
        email: 'super@agmdc.in',
        role: 'SUPERINTENDENT',
        credentialLevel: 'ORDINATION',
        churchId: church1.id
      }
    })
  }

  // Create a Complaint
  let complaint1 = await prisma.complaint.findUnique({
    where: { refNumber: 'COMP-101' }
  })
  if (!complaint1) {
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
  }

  console.log("Database successfully seeded/verified with live data!")
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
