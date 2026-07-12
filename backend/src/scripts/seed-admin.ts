import prisma from '../utils/prisma';

async function main() {
  const emailToPromote = process.argv[2];
  if (!emailToPromote) {
    console.error('Please provide an email to promote. Usage: tsx seed-admin.ts <email>');
    process.exit(1);
  }

  const user = await prisma.employee.findUnique({
    where: { email: emailToPromote }
  });

  if (!user) {
    console.error(`User with email ${emailToPromote} not found.`);
    process.exit(1);
  }

  const updatedUser = await prisma.employee.update({
    where: { email: emailToPromote },
    data: { role: 'Admin' }
  });

  console.log(`Successfully promoted ${updatedUser.name} (${updatedUser.email}) to Admin!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
