import { PrismaClient, RoleType, SubscriptionStatus, PaymentStatus, AttendanceMethod } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Branches
  console.log('🏢 Creating branches...');
  const hqBranch = await prisma.branch.upsert({
    where: { code: 'HQ-IND' },
    update: {},
    create: {
      name: 'A² ReVamp Gym - Central',
      code: 'HQ-IND',
      address: '123 Main St, Indore, MP',
      contactPhone: '+91 9876543210',
      contactEmail: 'central@a2revampgym.com',
    },
  });

  const eastBranch = await prisma.branch.upsert({
    where: { code: 'EAST-IND' },
    update: {},
    create: {
      name: 'A² ReVamp Gym - Eastside',
      code: 'EAST-IND',
      address: '456 East Ave, Indore, MP',
      contactPhone: '+91 9876543211',
      contactEmail: 'eastside@a2revampgym.com',
    },
  });

  // 2. Create Roles
  console.log('🎭 Creating roles...');
  const roles = [
    RoleType.SUPER_ADMIN,
    RoleType.MANAGER,
    RoleType.TRAINER,
    RoleType.RECEPTIONIST,
    RoleType.MEMBER,
  ];

  const createdRoles = await Promise.all(
    roles.map((roleName) =>
      prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName, description: `${roleName} privileges` },
      })
    )
  );

  const adminRole = createdRoles.find(r => r.name === RoleType.SUPER_ADMIN);
  const trainerRole = createdRoles.find(r => r.name === RoleType.TRAINER);
  const receptionistRole = createdRoles.find(r => r.name === RoleType.RECEPTIONIST);
  const memberRole = createdRoles.find(r => r.name === RoleType.MEMBER);

  // 3. Hash Passwords (Mock)
  const defaultPassword = await bcrypt.hash('Gym@2026', 10);

  // 4. Create Staff Users
  console.log('👥 Creating staff users...');
  
  // Super Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@a2revampgym.com' },
    update: {},
    create: {
      email: 'admin@a2revampgym.com',
      passwordHash: defaultPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '1000000000',
      branchId: hqBranch.id,
      roles: { create: [{ roleId: adminRole.id }] }
    }
  });

  // Trainer
  const trainerUser = await prisma.user.upsert({
    where: { email: 'trainer1@a2revampgym.com' },
    update: {},
    create: {
      email: 'trainer1@a2revampgym.com',
      passwordHash: defaultPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '1000000001',
      branchId: hqBranch.id,
      roles: { create: [{ roleId: trainerRole.id }] },
      trainerProfile: {
        create: {
          specialization: 'Strength & Conditioning',
          experienceYrs: 5,
          bio: 'Certified strength expert'
        }
      }
    }
  });

  // Receptionist
  const receptionistUser = await prisma.user.upsert({
    where: { email: 'frontdesk@a2revampgym.com' },
    update: {},
    create: {
      email: 'frontdesk@a2revampgym.com',
      passwordHash: defaultPassword,
      firstName: 'Alice',
      lastName: 'Desk',
      phone: '1000000002',
      branchId: hqBranch.id,
      roles: { create: [{ roleId: receptionistRole.id }] }
    }
  });

  // 5. Create Plans
  console.log('💳 Creating membership plans...');
  const monthlyPlan = await prisma.plan.create({
    data: {
      branchId: hqBranch.id,
      name: 'Monthly Standard',
      description: 'Full access for 30 days',
      price: 999.00,
      durationDays: 30
    }
  });

  const quarterlyPlan = await prisma.plan.create({
    data: {
      branchId: hqBranch.id,
      name: 'Quarterly Pro',
      description: 'Full access for 90 days',
      price: 2499.00,
      durationDays: 90
    }
  });

  const yearlyPlan = await prisma.plan.create({
    data: {
      branchId: hqBranch.id,
      name: 'Yearly Elite',
      description: 'Full access for 365 days',
      price: 7999.00,
      durationDays: 365
    }
  });

  // 6. Create Members
  console.log('💪 Creating realistic members...');
  
  const member1 = await prisma.user.upsert({
    where: { email: 'member1@a2revampgym.com' },
    update: {},
    create: {
      email: 'member1@a2revampgym.com',
      passwordHash: defaultPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '9000000001',
      branchId: hqBranch.id,
      roles: { create: [{ roleId: memberRole.id }] },
      memberProfile: {
        create: {
          dob: new Date('1995-06-15'),
          gender: 'Female',
          heightCm: 165,
          weightKg: 62
        }
      },
      memberships: {
        create: {
          planId: quarterlyPlan.id,
          startDate: new Date(),
          endDate: new Date(new Date().setDate(new Date().getDate() + 90)),
          status: SubscriptionStatus.ACTIVE
        }
      }
    }
  });

  // 7. Permissions and RolePermissions
  console.log('🔒 Seeding permissions...');
  const permissions = [
    // Member
    { action: 'create', resource: 'member', description: 'Create new members' },
    { action: 'read', resource: 'member', description: 'View member profiles' },
    { action: 'update', resource: 'member', description: 'Edit member details' },
    { action: 'delete', resource: 'member', description: 'Remove members' },
    // Trainer
    { action: 'create', resource: 'trainer', description: 'Add trainers' },
    { action: 'read', resource: 'trainer', description: 'View trainer profiles' },
    { action: 'update', resource: 'trainer', description: 'Edit trainer details' },
    { action: 'delete', resource: 'trainer', description: 'Remove trainers' },
    // Payment
    { action: 'create', resource: 'payment', description: 'Create payments' },
    { action: 'read', resource: 'payment', description: 'View payment records' },
    { action: 'manage', resource: 'payment', description: 'Manage refunds and adjustments' },
    // Attendance
    { action: 'create', resource: 'attendance', description: 'Mark attendance' },
    { action: 'read', resource: 'attendance', description: 'View attendance records' },
    // Report
    { action: 'read', resource: 'report', description: 'View reports' },
    { action: 'export', resource: 'report', description: 'Export reports' },
    // Branch
    { action: 'create', resource: 'branch', description: 'Create branches' },
    { action: 'read', resource: 'branch', description: 'View branches' },
    { action: 'update', resource: 'branch', description: 'Edit branches' },
    { action: 'delete', resource: 'branch', description: 'Remove branches' },
    // Settings
    { action: 'read', resource: 'settings', description: 'View settings' },
    { action: 'manage', resource: 'settings', description: 'Manage all settings' },
    // Staff
    { action: 'create', resource: 'staff', description: 'Add staff members' },
    { action: 'read', resource: 'staff', description: 'View staff' },
    { action: 'update', resource: 'staff', description: 'Edit staff' },
    { action: 'delete', resource: 'staff', description: 'Remove staff' },
    // Chat
    { action: 'read', resource: 'chat', description: 'View messages' },
    { action: 'create', resource: 'chat', description: 'Send messages' },
    // Own profile (everyone)
    { action: 'read', resource: 'own_profile', description: 'View own profile' },
    { action: 'update', resource: 'own_profile', description: 'Edit own profile' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { action_resource: { action: perm.action, resource: perm.resource } },
      update: { description: perm.description },
      create: perm,
    });
  }

  console.log('🔑 Seeding role permissions...');
  const rolePermissions = {
    [RoleType.SUPER_ADMIN]: permissions,
    [RoleType.MANAGER]: [
      { action: 'create', resource: 'member' }, { action: 'read', resource: 'member' },
      { action: 'update', resource: 'member' }, { action: 'delete', resource: 'member' },
      { action: 'create', resource: 'trainer' }, { action: 'read', resource: 'trainer' },
      { action: 'update', resource: 'trainer' }, { action: 'delete', resource: 'trainer' },
      { action: 'create', resource: 'payment' }, { action: 'read', resource: 'payment' },
      { action: 'manage', resource: 'payment' },
      { action: 'create', resource: 'attendance' }, { action: 'read', resource: 'attendance' },
      { action: 'read', resource: 'report' }, { action: 'export', resource: 'report' },
      { action: 'read', resource: 'branch' },
      { action: 'read', resource: 'settings' },
      { action: 'create', resource: 'staff' }, { action: 'read', resource: 'staff' },
      { action: 'update', resource: 'staff' },
      { action: 'read', resource: 'chat' }, { action: 'create', resource: 'chat' },
      { action: 'read', resource: 'own_profile' }, { action: 'update', resource: 'own_profile' },
    ],
    [RoleType.TRAINER]: [
      { action: 'read', resource: 'member' },
      { action: 'create', resource: 'attendance' }, { action: 'read', resource: 'attendance' },
      { action: 'read', resource: 'chat' }, { action: 'create', resource: 'chat' },
      { action: 'read', resource: 'own_profile' }, { action: 'update', resource: 'own_profile' },
    ],
    [RoleType.RECEPTIONIST]: [
      { action: 'read', resource: 'member' },
      { action: 'create', resource: 'attendance' }, { action: 'read', resource: 'attendance' },
      { action: 'create', resource: 'payment' }, { action: 'read', resource: 'payment' },
      { action: 'read', resource: 'own_profile' }, { action: 'update', resource: 'own_profile' },
    ],
    [RoleType.MEMBER]: [
      { action: 'read', resource: 'chat' }, { action: 'create', resource: 'chat' },
      { action: 'read', resource: 'own_profile' }, { action: 'update', resource: 'own_profile' },
    ],
  };

  for (const [role, perms] of Object.entries(rolePermissions)) {
    for (const perm of perms) {
      const permission = await prisma.permission.findUnique({
        where: { action_resource: { action: perm.action, resource: perm.resource } },
      });
      if (permission) {
        await prisma.rolePermission.upsert({
          where: { role_permissionId: { role, permissionId: permission.id } },
          update: {},
          create: { role, permissionId: permission.id },
        });
      }
    }
  }

  console.log('✅ Seed data successfully injected!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding: ', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
