import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditItem.deleteMany();
  await prisma.auditCycle.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.transferRequest.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.assetCategory.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();

  console.log('Seeding Database for Demo...');

  // 1. Departments
  const itDept = await prisma.department.create({
    data: { name: 'IT' }
  });
  const mktDept = await prisma.department.create({
    data: { name: 'Marketing' }
  });
  const engDept = await prisma.department.create({
    data: { name: 'Engineering' }
  });

  // 2. Employees (Users)
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.employee.create({
    data: {
      name: 'John Admin',
      email: 'admin@assetflow.com',
      passwordHash: hashedPassword,
      departmentId: itDept.id,
      role: 'Admin',
      status: 'Active',
    }
  });

  const employee1 = await prisma.employee.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah@assetflow.com',
      passwordHash: hashedPassword,
      departmentId: mktDept.id,
      role: 'Employee',
      status: 'Active',
    }
  });

  const employee2 = await prisma.employee.create({
    data: {
      name: 'Mike Ross',
      email: 'mike@assetflow.com',
      passwordHash: hashedPassword,
      departmentId: engDept.id,
      role: 'Employee',
      status: 'Active',
    }
  });

  console.log('Created Employees:', admin.email, employee1.email, employee2.email);

  // 3. Asset Categories
  const laptopCat = await prisma.assetCategory.create({ data: { name: 'Laptop' } });
  const projectorCat = await prisma.assetCategory.create({ data: { name: 'Projector' } });
  const deskCat = await prisma.assetCategory.create({ data: { name: 'Desk' } });

  // 4. Assets
  const assetsToCreate = [
    // Laptops
    ...Array.from({ length: 15 }).map((_, i) => ({
      name: `MacBook Pro 14" M3 - ${i + 1}`,
      assetTag: `AF-LAPT-${100 + i}`,
      categoryId: laptopCat.id,
      serialNumber: `MBP-M3-${1000 + i}`,
      acquisitionDate: new Date('2025-01-15'),
      acquisitionCost: 1999.99,
      condition: 'New',
      location: 'HQ - IT Room',
      status: 'Available',
      isBookable: true,
    })),
    // Projectors
    ...Array.from({ length: 5 }).map((_, i) => ({
      name: `Epson 4K Projector - ${i + 1}`,
      assetTag: `AF-PROJ-${200 + i}`,
      categoryId: projectorCat.id,
      serialNumber: `EPS-${2000 + i}`,
      acquisitionDate: new Date('2024-11-01'),
      acquisitionCost: 899.50,
      condition: 'Good',
      location: 'HQ - Storage',
      status: 'Available',
      isBookable: true,
    })),
    // Desks
    ...Array.from({ length: 10 }).map((_, i) => ({
      name: `Herman Miller Standing Desk - ${i + 1}`,
      assetTag: `AF-DESK-${300 + i}`,
      categoryId: deskCat.id,
      serialNumber: `HM-SD-${3000 + i}`,
      acquisitionDate: new Date('2024-06-12'),
      acquisitionCost: 1250.00,
      condition: 'Fair',
      location: 'HQ - Floor 2',
      status: 'Available',
      isBookable: false,
    }))
  ];

  await prisma.asset.createMany({ data: assetsToCreate });
  
  const allAssets = await prisma.asset.findMany();
  console.log(`Created ${allAssets.length} Assets`);

  // 5. Allocations
  // Allocate some laptops to employees
  const laptop1 = allAssets.find(a => a.categoryId === laptopCat.id && a.assetTag === 'AF-LAPT-100');
  const laptop2 = allAssets.find(a => a.categoryId === laptopCat.id && a.assetTag === 'AF-LAPT-101');
  
  if (laptop1 && laptop2) {
    await prisma.allocation.create({
      data: {
        assetId: laptop1.id,
        employeeId: employee1.id,
        createdBy: admin.id,
        allocatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
        expectedReturnDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // OVERDUE 1 day
        status: 'Active',
      }
    });
    await prisma.asset.update({ where: { id: laptop1.id }, data: { status: 'Allocated', currentHolderId: employee1.id } });

    await prisma.allocation.create({
      data: {
        assetId: laptop2.id,
        employeeId: employee2.id,
        createdBy: admin.id,
        allocatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
        status: 'Active',
      }
    });
    await prisma.asset.update({ where: { id: laptop2.id }, data: { status: 'Allocated', currentHolderId: employee2.id } });
  }

  // 6. Bookings
  const projector = allAssets.find(a => a.categoryId === projectorCat.id);
  if (projector) {
    await prisma.booking.create({
      data: {
        assetId: projector.id,
        bookedById: employee1.id,
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // tomorrow
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // day after
        status: 'Approved'
      }
    });
  }

  // 7. Maintenance
  const desk = allAssets.find(a => a.categoryId === deskCat.id);
  if (desk) {
    await prisma.maintenanceRequest.create({
      data: {
        assetId: desk.id,
        raisedById: employee2.id,
        issueDescription: 'Motor is stuck on the left side',
        priority: 'High',
        status: 'Pending'
      }
    });
    await prisma.asset.update({ where: { id: desk.id }, data: { status: 'Under Maintenance' } });
  }
  
  // 8. Notifications
  await prisma.notification.createMany({
    data: [
      {
        recipientId: employee1.id,
        type: 'Asset Assigned',
        message: 'A new MacBook Pro 14" has been assigned to you.',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5)
      },
      {
        recipientId: employee1.id,
        type: 'Booking Confirmed',
        message: 'Your booking for the Epson 4K Projector is confirmed for tomorrow.',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      {
        recipientId: admin.id,
        type: 'Overdue Alert',
        message: 'Asset AF-LAPT-100 is overdue for return from Sarah Jenkins.',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
      }
    ]
  });

  console.log('Demo Data Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
