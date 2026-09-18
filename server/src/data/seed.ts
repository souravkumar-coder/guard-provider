import type {
  AvailabilityStatus,
  Review,
  Service,
  VerificationStatus,
} from '@guard-provider/shared';
import { hashPassword } from '../utils/password.js';
import type { DataSource } from './DataSource.js';

/**
 * Demo dataset so the platform can be explored immediately.
 * Runs only when the data source is empty and SEED_DEMO_DATA=true.
 * All demo accounts share the password: Password123!
 */

const DEMO_PASSWORD = 'Password123!';

const SERVICES: Service[] = [
  {
    id: 'svc_personal',
    name: 'Personal Security',
    slug: 'personal-security',
    description: 'Dedicated close protection officers for individuals and families.',
    icon: 'user-shield',
  },
  {
    id: 'svc_event',
    name: 'Event Security',
    slug: 'event-security',
    description: 'Crowd control, access checks and quick response for events of any size.',
    icon: 'calendar-shield',
  },
  {
    id: 'svc_residential',
    name: 'Residential Security',
    slug: 'residential-security',
    description: 'Gatekeeping and patrolling for apartments, villas and communities.',
    icon: 'home-shield',
  },
  {
    id: 'svc_commercial',
    name: 'Commercial Security',
    slug: 'commercial-security',
    description: 'Protection for shops, showrooms, warehouses and business premises.',
    icon: 'store-shield',
  },
  {
    id: 'svc_night',
    name: 'Night Security',
    slug: 'night-security',
    description: 'Overnight guarding with regular patrols and incident logging.',
    icon: 'moon-shield',
  },
  {
    id: 'svc_corporate',
    name: 'Corporate Security',
    slug: 'corporate-security',
    description: 'Front-desk and lobby security for offices and corporate parks.',
    icon: 'building-shield',
  },
  {
    id: 'svc_supervisor',
    name: 'Security Supervisor',
    slug: 'security-supervisor',
    description: 'Experienced supervisors to lead guard teams and manage post orders.',
    icon: 'badge-shield',
  },
];

interface SeedGuard {
  key: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  about: string;
  city: string;
  serviceArea: string;
  experienceYears: number;
  skills: string[];
  languages: string[];
  services: string[];
  hourlyRate: number;
  availability: AvailabilityStatus;
  verificationStatus: VerificationStatus;
  completedJobs: number;
}

const GUARDS: SeedGuard[] = [
  {
    key: 'vikram',
    name: 'Vikram Rathore',
    email: 'vikram.rathore@demo.in',
    phone: '+91 98200 11001',
    title: 'Executive Personal Protection Officer',
    about:
      'Former army personnel with 12 years of close-protection experience for executives and public figures. Calm under pressure, discreet, and trained in advanced defensive driving and first aid.',
    city: 'Mumbai',
    serviceArea: 'Mumbai, Navi Mumbai, Thane',
    experienceYears: 12,
    skills: ['Close Protection', 'Threat Assessment', 'Defensive Driving', 'First Aid', 'Crowd Management'],
    languages: ['Hindi', 'English', 'Marathi'],
    services: ['svc_personal', 'svc_corporate', 'svc_supervisor'],
    hourlyRate: 850,
    availability: 'available',
    verificationStatus: 'verified',
    completedJobs: 143,
  },
  {
    key: 'arjun',
    name: 'Arjun Nair',
    email: 'arjun.nair@demo.in',
    phone: '+91 99001 22002',
    title: 'Event Security Lead',
    about:
      'I plan and lead security teams for weddings, concerts and corporate events — from access control plans to on-ground crowd flow. 8 years across 300+ events in Bengaluru.',
    city: 'Bengaluru',
    serviceArea: 'Bengaluru, Mysuru',
    experienceYears: 8,
    skills: ['Crowd Control', 'Access Control', 'Team Briefing', 'Emergency Response', 'Baggage Screening'],
    languages: ['English', 'Kannada', 'Hindi'],
    services: ['svc_event', 'svc_commercial'],
    hourlyRate: 600,
    availability: 'available',
    verificationStatus: 'verified',
    completedJobs: 214,
  },
  {
    key: 'suresh',
    name: 'Suresh Yadav',
    email: 'suresh.yadav@demo.in',
    phone: '+91 98110 33003',
    title: 'Residential Security Supervisor',
    about:
      '15 years managing gate operations, visitor registers and night patrols for residential societies across Delhi NCR. Strong focus on discipline, documentation and resident courtesy.',
    city: 'Delhi NCR',
    serviceArea: 'Delhi, Noida, Gurugram, Ghaziabad',
    experienceYears: 15,
    skills: ['Gate Management', 'Visitor Verification', 'Night Patrol', 'CCTV Monitoring', 'Fire Safety'],
    languages: ['Hindi', 'English'],
    services: ['svc_residential', 'svc_night', 'svc_supervisor'],
    hourlyRate: 550,
    availability: 'on_duty',
    verificationStatus: 'verified',
    completedJobs: 178,
  },
  {
    key: 'rahul',
    name: 'Rahul Verma',
    email: 'rahul.verma@demo.in',
    phone: '+91 97650 44004',
    title: 'Corporate Security Officer',
    about:
      'Ex-hotel security captain now handling corporate lobbies, executive floors and visitor management. Immaculate turnout, polite communication and strict protocol adherence.',
    city: 'Pune',
    serviceArea: 'Pune, Pimpri-Chinchwad',
    experienceYears: 10,
    skills: ['Lobby Management', 'Visitor Screening', 'Access Cards', 'Mail Screening', 'Evacuation Drills'],
    languages: ['Hindi', 'English', 'Marathi'],
    services: ['svc_corporate', 'svc_commercial', 'svc_supervisor'],
    hourlyRate: 640,
    availability: 'available',
    verificationStatus: 'verified',
    completedJobs: 121,
  },
  {
    key: 'deepak',
    name: 'Deepak Kulkarni',
    email: 'deepak.kulkarni@demo.in',
    phone: '+91 90000 55005',
    title: 'Personal Security Officer',
    about:
      'Trained martial artist providing dependable personal protection for business owners and families. Comfortable with school runs, shopping trips and travel escort duty.',
    city: 'Hyderabad',
    serviceArea: 'Hyderabad, Secunderabad',
    experienceYears: 6,
    skills: ['Estate Patrol', 'Family Protection', 'Surveillance Awareness', 'Unarmed Combat'],
    languages: ['Telugu', 'Hindi', 'English'],
    services: ['svc_personal', 'svc_residential'],
    hourlyRate: 520,
    availability: 'available',
    verificationStatus: 'pending',
    completedJobs: 44,
  },
  {
    key: 'manoj',
    name: 'Manoj Tiwari',
    email: 'manoj.tiwari@demo.in',
    phone: '+91 94140 66006',
    title: 'Night & Event Guard',
    about:
      'Reliable night guard with a spotless record across jaipur hotels and event venues. Alert, punctual and diligent with hourly patrol logs and incident reports.',
    city: 'Jaipur',
    serviceArea: 'Jaipur, Ajmer',
    experienceYears: 5,
    skills: ['Night Patrol', 'Incident Reporting', 'Fire Watch', 'Parking Management'],
    languages: ['Hindi', 'English'],
    services: ['svc_night', 'svc_event', 'svc_commercial'],
    hourlyRate: 460,
    availability: 'available',
    verificationStatus: 'verified',
    completedJobs: 96,
  },
  {
    key: 'farhan',
    name: 'Farhan Sheikh',
    email: 'farhan.sheikh@demo.in',
    phone: '+91 98200 77007',
    title: 'Commercial Premises Guard',
    about:
      'Nine years guarding retail showrooms and warehouses in Mumbai. Skilled at deterring shrinkage, handling aggressive visitors calmly and coordinating with police when needed.',
    city: 'Mumbai',
    serviceArea: 'Mumbai, Thane',
    experienceYears: 9,
    skills: ['Loss Prevention', 'Warehouse Security', 'CCTV Monitoring', 'Conflict De-escalation'],
    languages: ['Hindi', 'Urdu', 'English'],
    services: ['svc_commercial', 'svc_night'],
    hourlyRate: 580,
    availability: 'available',
    verificationStatus: 'verified',
    completedJobs: 152,
  },
  {
    key: 'kiran',
    name: 'Kiran Patil',
    email: 'kiran.patil@demo.in',
    phone: '+91 90280 88008',
    title: 'Residential Security Guard',
    about:
      'Newer to professional guarding but trained in gate protocol, visitor registers and basic firefighting. Looking for long-term residential postings in Pune.',
    city: 'Pune',
    serviceArea: 'Pune',
    experienceYears: 4,
    skills: ['Gate Duty', 'Visitor Registers', 'Basic Firefighting'],
    languages: ['Marathi', 'Hindi'],
    services: ['svc_residential'],
    hourlyRate: 420,
    availability: 'unavailable',
    verificationStatus: 'unverified',
    completedJobs: 12,
  },
  {
    key: 'balwant',
    name: 'Balwant Singh',
    email: 'balwant.singh@demo.in',
    phone: '+91 98760 99009',
    title: 'Senior Personal Protection Officer',
    about:
      '18 years of service including VIP escort duty in Chandigarh and Himachal. Ex-serviceman who believes protection work is 90% preparation and 10% reaction.',
    city: 'Chandigarh',
    serviceArea: 'Chandigarh, Mohali, Panchkula',
    experienceYears: 18,
    skills: ['VIP Escort', 'Route Planning', 'Weapon Handling (licensed)', 'First Aid', 'Driving'],
    languages: ['Hindi', 'Punjabi', 'English'],
    services: ['svc_personal', 'svc_night', 'svc_supervisor'],
    hourlyRate: 900,
    availability: 'available',
    verificationStatus: 'verified',
    completedJobs: 231,
  },
  {
    key: 'prakash',
    name: 'Prakash Menon',
    email: 'prakash.menon@demo.in',
    phone: '+91 98400 12010',
    title: 'Corporate & Event Security',
    about:
      'Seven years split between IT-park front-of-house security and Chennai event crews. Known for firm-but-polite access enforcement and clear radio communication.',
    city: 'Chennai',
    serviceArea: 'Chennai, Sriperumbudur',
    experienceYears: 7,
    skills: ['Front of House', 'Radio Protocol', 'Crowd Management', 'Access Control'],
    languages: ['Tamil', 'English', 'Hindi'],
    services: ['svc_corporate', 'svc_event'],
    hourlyRate: 560,
    availability: 'available',
    verificationStatus: 'pending',
    completedJobs: 78,
  },
];

const CUSTOMERS = [
  {
    key: 'anita',
    name: 'Anita Desai',
    email: 'anita.desai@demo.in',
    phone: '+91 98201 44001',
    city: 'Mumbai',
    address: 'B-1204, Sea Breeze Apartments, Worli',
  },
  {
    key: 'rohit',
    name: 'Rohit Malhotra',
    email: 'rohit.malhotra@demo.in',
    phone: '+91 98111 44002',
    city: 'Delhi NCR',
    address: '23 Golf Links, New Delhi',
  },
  {
    key: 'priya',
    name: 'Priya Iyer',
    email: 'priya.iyer@demo.in',
    phone: '+91 99002 44003',
    city: 'Bengaluru',
    address: '82 Palm Meadows, Whitefield',
  },
];

const ADMIN = {
  name: 'Arjun Mehta',
  email: 'admin@guardprovider.demo',
  phone: '+91 98000 00001',
};

interface SeedReview {
  guardKey: string;
  customerKey: string;
  rating: number;
  comment: string;
  daysAgo: number;
}

const REVIEWS: SeedReview[] = [
  { guardKey: 'vikram', customerKey: 'anita', rating: 5, comment: 'Vikram handled our annual day with total professionalism. Guests felt safe and he anticipated every detail.', daysAgo: 12 },
  { guardKey: 'vikram', customerKey: 'rohit', rating: 5, comment: 'Excellent executive protection during a board visit. Punctual, discreet and very presentable.', daysAgo: 34 },
  { guardKey: 'vikram', customerKey: 'priya', rating: 4, comment: 'Very reliable for our conference security. Would have liked more frequent status updates.', daysAgo: 58 },
  { guardKey: 'arjun', customerKey: 'priya', rating: 5, comment: 'Arjun managed a 600-guest wedding flawlessly — crowd flow and vendor gates were spot on.', daysAgo: 21 },
  { guardKey: 'arjun', customerKey: 'anita', rating: 5, comment: 'Booked him for a product launch. His team briefing and queue management were impressive.', daysAgo: 45 },
  { guardKey: 'suresh', customerKey: 'rohit', rating: 5, comment: 'Our society gates have never been this disciplined. Visitor registers maintained perfectly.', daysAgo: 9 },
  { guardKey: 'suresh', customerKey: 'anita', rating: 4, comment: 'Solid night supervision for our building. Good with residents and delivery staff alike.', daysAgo: 61 },
  { guardKey: 'rahul', customerKey: 'priya', rating: 5, comment: 'Front desk security for our office — visitors keep complimenting how courteous he is.', daysAgo: 17 },
  { guardKey: 'farhan', customerKey: 'anita', rating: 5, comment: 'Shrinkage at our showroom dropped noticeably in the month Farhan covered night shifts.', daysAgo: 27 },
  { guardKey: 'balwant', customerKey: 'rohit', rating: 5, comment: 'Senior, steady and extremely experienced. Exactly what we needed for a family wedding escort.', daysAgo: 15 },
  { guardKey: 'balwant', customerKey: 'priya', rating: 5, comment: 'Balwant-ji planned our travel routes meticulously. Complete peace of mind.', daysAgo: 40 },
  { guardKey: 'manoj', customerKey: 'anita', rating: 4, comment: 'Dependable night guarding for our warehouse. Simple, honest and always on time.', daysAgo: 33 },
  { guardKey: 'prakash', customerKey: 'priya', rating: 5, comment: 'Handled our tech summit entry gates calmly even when queues got long.', daysAgo: 24 },
];

interface SeedRequest {
  guardKey: string;
  customerKey: string;
  serviceId: string;
  /** Days from today for the requested service date. */
  inDays: number;
  durationHours: number;
  location: string;
  requirements: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  rejectReason?: string;
  createdDaysAgo: number;
}

const REQUESTS: SeedRequest[] = [
  { guardKey: 'vikram', customerKey: 'anita', serviceId: 'svc_personal', inDays: 4, durationHours: 8, location: 'Worli, Mumbai', requirements: 'Family event escort, 2 vehicles, need someone comfortable with elderly guests.', status: 'pending', createdDaysAgo: 1 },
  { guardKey: 'arjun', customerKey: 'anita', serviceId: 'svc_event', inDays: 11, durationHours: 10, location: 'Bandra Kurla Complex, Mumbai', requirements: 'Product launch for ~250 guests. Access control at 3 gates + VIP lounge cover.', status: 'pending', createdDaysAgo: 2 },
  { guardKey: 'balwant', customerKey: 'rohit', serviceId: 'svc_personal', inDays: 7, durationHours: 12, location: 'Golf Links, New Delhi', requirements: 'Wedding escort for the bride-side family, both venues within 5 km.', status: 'pending', createdDaysAgo: 1 },
  { guardKey: 'farhan', customerKey: 'anita', serviceId: 'svc_night', inDays: 2, durationHours: 12, location: 'Andheri East, Mumbai', requirements: 'Warehouse night cover 8pm–8am, hourly patrol logs required.', status: 'accepted', createdDaysAgo: 3 },
  { guardKey: 'rahul', customerKey: 'priya', serviceId: 'svc_corporate', inDays: 6, durationHours: 9, location: 'Whitefield, Bengaluru', requirements: 'Lobby + 3rd floor executive wing cover during an audit week.', status: 'accepted', createdDaysAgo: 4 },
  { guardKey: 'suresh', customerKey: 'rohit', serviceId: 'svc_residential', inDays: 9, durationHours: 12, location: 'Vasant Kunj, New Delhi', requirements: 'Diwali week gate cover for our society, visitor verification essential.', status: 'accepted', createdDaysAgo: 5 },
  { guardKey: 'manoj', customerKey: 'anita', serviceId: 'svc_night', inDays: 3, durationHours: 10, location: 'Kurla, Mumbai', requirements: 'Night watch for stock take event.', status: 'rejected', rejectReason: 'Already committed to another posting on that date.', createdDaysAgo: 3 },
  { guardKey: 'prakash', customerKey: 'priya', serviceId: 'svc_event', inDays: 15, durationHours: 8, location: 'OMR, Chennai', requirements: 'Hackathon venue security, 40-hour? No — 8 hours, two entry points.', status: 'cancelled', createdDaysAgo: 6 },
];

/** Completed bookings below correspond to older requests that are not listed above. */
const COMPLETED_HISTORY: Array<{
  guardKey: string;
  customerKey: string;
  serviceId: string;
  daysAgo: number;
  durationHours: number;
  location: string;
  requirements: string;
}> = [
  { guardKey: 'vikram', customerKey: 'anita', serviceId: 'svc_personal', daysAgo: 30, durationHours: 8, location: 'Worli, Mumbai', requirements: 'Anniversary party escort.' },
  { guardKey: 'vikram', customerKey: 'rohit', serviceId: 'svc_corporate', daysAgo: 60, durationHours: 9, location: 'Connaught Place, New Delhi', requirements: 'Board meeting cover.' },
  { guardKey: 'arjun', customerKey: 'priya', serviceId: 'svc_event', daysAgo: 40, durationHours: 10, location: 'Whitefield, Bengaluru', requirements: 'Wedding sangeet crowd management.' },
  { guardKey: 'arjun', customerKey: 'anita', serviceId: 'svc_event', daysAgo: 70, durationHours: 8, location: 'Lower Parel, Mumbai', requirements: 'Store launch event.' },
  { guardKey: 'suresh', customerKey: 'rohit', serviceId: 'svc_residential', daysAgo: 20, durationHours: 12, location: 'Vasant Kunj, New Delhi', requirements: 'Society gate cover during renovation.' },
  { guardKey: 'rahul', customerKey: 'priya', serviceId: 'svc_corporate', daysAgo: 35, durationHours: 9, location: 'Koramangala, Bengaluru', requirements: 'Office relocation security.' },
  { guardKey: 'farhan', customerKey: 'anita', serviceId: 'svc_commercial', daysAgo: 45, durationHours: 10, location: 'Andheri East, Mumbai', requirements: 'Inventory audit watch.' },
  { guardKey: 'balwant', customerKey: 'rohit', serviceId: 'svc_personal', daysAgo: 25, durationHours: 12, location: 'Chanakyapuri, New Delhi', requirements: 'Family wedding escort.' },
  { guardKey: 'balwant', customerKey: 'priya', serviceId: 'svc_personal', daysAgo: 55, durationHours: 6, location: 'Indiranagar, Bengaluru', requirements: 'Jewellery store visit escort.' },
  { guardKey: 'manoj', customerKey: 'anita', serviceId: 'svc_night', daysAgo: 50, durationHours: 12, location: 'Kurla, Mumbai', requirements: 'Night watch during systems migration.' },
  { guardKey: 'prakash', customerKey: 'priya', serviceId: 'svc_event', daysAgo: 42, durationHours: 8, location: 'Guindy, Chennai', requirements: 'Tech meetup entry management.' },
];

function daysFromNow(days: number, hour = 9): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function daysAgoIso(days: number, jitterMinutes = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setMinutes(jitterMinutes);
  return d.toISOString();
}

export async function seedDemoData(ds: DataSource): Promise<void> {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const baseDate = daysAgoIso(90);

  await ds.services.saveAll(SERVICES);

  // Admin
  const admin = await ds.users.create({
    name: ADMIN.name,
    email: ADMIN.email,
    phone: ADMIN.phone,
    role: 'admin',
    avatarUrl: null,
    passwordHash,
    createdAt: daysAgoIso(120),
  });

  // Customers
  const customerIds = new Map<string, string>();
  for (const c of CUSTOMERS) {
    const user = await ds.users.create({
      name: c.name,
      email: c.email,
      phone: c.phone,
      role: 'customer',
      avatarUrl: null,
      passwordHash,
      createdAt: daysAgoIso(80),
    });
    customerIds.set(c.key, user.id);
    await ds.customerProfiles.create({ userId: user.id, address: c.address, city: c.city });
  }

  // Guards
  const guardProfileIds = new Map<string, string>();
  const guardUserIds = new Map<string, string>();
  let guardIndex = 0;
  for (const g of GUARDS) {
    guardIndex += 1;
    const user = await ds.users.create({
      name: g.name,
      email: g.email,
      phone: g.phone,
      role: 'guard',
      avatarUrl: null,
      passwordHash,
      createdAt: daysAgoIso(100 - guardIndex * 3),
    });
    guardUserIds.set(g.key, user.id);
    const profile = await ds.guards.create({
      userId: user.id,
      title: g.title,
      about: g.about,
      city: g.city,
      serviceArea: g.serviceArea,
      experienceYears: g.experienceYears,
      skills: g.skills,
      languages: g.languages,
      serviceIds: g.services,
      hourlyRate: g.hourlyRate,
      availability: g.availability,
      verificationStatus: g.verificationStatus,
      rating: 0,
      reviewCount: 0,
      completedJobs: g.completedJobs,
      createdAt: baseDate,
    });
    guardProfileIds.set(g.key, profile.id);
  }

  // Verification records for guards that already went through review
  for (const g of GUARDS) {
    if (g.verificationStatus === 'verified' || g.verificationStatus === 'rejected') {
      await ds.verifications.create({
        guardId: guardProfileIds.get(g.key)!,
        status: g.verificationStatus,
        notes:
          g.verificationStatus === 'verified'
            ? 'ID, address proof and experience documents verified.'
            : 'Documents incomplete — resubmission requested.',
        documents: ['id_proof.pdf', 'address_proof.pdf', 'experience_certificate.pdf'],
        reviewedBy: admin.id,
        reviewedAt: daysAgoIso(40),
        createdAt: daysAgoIso(45),
      });
    } else if (g.verificationStatus === 'pending') {
      await ds.verifications.create({
        guardId: guardProfileIds.get(g.key)!,
        status: 'pending',
        notes: 'Submitted for review.',
        documents: ['id_proof.pdf', 'police_verification.pdf'],
        reviewedBy: null,
        reviewedAt: null,
        createdAt: daysAgoIso(2),
      });
    }
  }

  // Reviews for historical jobs (these also set guard ratings below)
  const reviewsByGuard = new Map<string, Review[]>();
  for (const r of REVIEWS) {
    const guardId = guardProfileIds.get(r.guardKey)!;
    const customerId = customerIds.get(r.customerKey)!;
    const review = await ds.reviews.create({
      bookingId: `seed_bkg_${r.guardKey}_${r.customerKey}_${r.daysAgo}`,
      customerId,
      guardId,
      rating: r.rating,
      comment: r.comment,
      createdAt: daysAgoIso(r.daysAgo),
    });
    const list = reviewsByGuard.get(r.guardKey) ?? [];
    list.push(review);
    reviewsByGuard.set(r.guardKey, list);
  }

  for (const g of GUARDS) {
    const list = reviewsByGuard.get(g.key) ?? [];
    if (list.length === 0) continue;
    const avg = list.reduce((sum, r) => sum + r.rating, 0) / list.length;
    await ds.guards.update(guardProfileIds.get(g.key)!, {
      rating: Math.round(avg * 10) / 10,
      reviewCount: list.length,
    });
  }

  // Historical completed bookings (with reviews attached where defined)
  let historyIndex = 0;
  const reviewByGuardCustomer = new Map<string, SeedReview>();
  for (const r of REVIEWS) reviewByGuardCustomer.set(`${r.guardKey}:${r.customerKey}`, r);

  for (const h of COMPLETED_HISTORY) {
    historyIndex += 1;
    const guardId = guardProfileIds.get(h.guardKey)!;
    const customerId = customerIds.get(h.customerKey)!;
    const request = await ds.requests.create({
      customerId,
      guardId,
      serviceId: h.serviceId,
      requestedDate: daysFromNow(-h.daysAgo),
      durationHours: h.durationHours,
      location: h.location,
      requirements: h.requirements,
      status: 'accepted',
      rejectReason: null,
      createdAt: daysAgoIso(h.daysAgo + 7),
      respondedAt: daysAgoIso(h.daysAgo + 6),
    });
    const booking = await ds.bookings.create({
      requestId: request.id,
      customerId,
      guardId,
      serviceId: h.serviceId,
      scheduledDate: request.requestedDate,
      durationHours: h.durationHours,
      location: h.location,
      requirements: h.requirements,
      status: 'completed',
      cancelReason: null,
      createdAt: request.respondedAt ?? request.createdAt,
      completedAt: daysAgoIso(Math.max(h.daysAgo - 1, 0), historyIndex * 7),
    });
    const linked = reviewByGuardCustomer.get(`${h.guardKey}:${h.customerKey}`);
    if (linked) {
      // Point the seeded review at the real booking it belongs to.
      const reviews = await ds.reviews.listByGuard(guardId);
      const match = reviews.find(
        (rv) => rv.customerId === customerId && rv.comment === linked.comment,
      );
      if (match) match.bookingId = booking.id;
    }
  }

  // Current-cycle requests
  const acceptedRequests: Array<{ requestId: string; seed: SeedRequest }> = [];
  for (let i = 0; i < REQUESTS.length; i++) {
    const r = REQUESTS[i];
    const guardId = guardProfileIds.get(r.guardKey)!;
    const customerId = customerIds.get(r.customerKey)!;
    const request = await ds.requests.create({
      customerId,
      guardId,
      serviceId: r.serviceId,
      requestedDate: daysFromNow(r.inDays),
      durationHours: r.durationHours,
      location: r.location,
      requirements: r.requirements,
      status: r.status,
      rejectReason: r.rejectReason ?? null,
      createdAt: daysAgoIso(r.createdDaysAgo),
      respondedAt:
        r.status === 'pending' ? null : daysAgoIso(Math.max(r.createdDaysAgo - 1, 0)),
    });

    if (r.status === 'accepted') acceptedRequests.push({ requestId: request.id, seed: r });
  }

  // Bookings for accepted current requests
  for (const { requestId, seed } of acceptedRequests) {
    await ds.bookings.create({
      requestId,
      customerId: customerIds.get(seed.customerKey)!,
      guardId: guardProfileIds.get(seed.guardKey)!,
      serviceId: seed.serviceId,
      scheduledDate: daysFromNow(seed.inDays),
      durationHours: seed.durationHours,
      location: seed.location,
      requirements: seed.requirements,
      status: 'confirmed',
      cancelReason: null,
      createdAt: daysAgoIso(Math.max(seed.createdDaysAgo - 1, 0)),
      completedAt: null,
    });
  }

  // Notifications for the demo accounts
  const anita = customerIds.get('anita')!;
  const vikramUser = guardUserIds.get('vikram')!;
  await ds.notifications.create({
    userId: anita,
    type: 'request_rejected',
    title: 'Request declined',
    message: 'Manoj Tiwari declined your Night Security request for Kurla.',
    read: false,
    link: '/dashboard/requests',
    createdAt: daysAgoIso(3),
  });
  await ds.notifications.create({
    userId: anita,
    type: 'request_accepted',
    title: 'Request accepted',
    message: 'Farhan Sheikh accepted your Night Security request. A booking has been created.',
    read: true,
    link: '/dashboard/bookings',
    createdAt: daysAgoIso(2, 30),
  });
  await ds.notifications.create({
    userId: vikramUser,
    type: 'request_new',
    title: 'New service request',
    message: 'Anita Desai requested Personal Security — review and respond.',
    read: false,
    link: '/guard/requests',
    createdAt: daysAgoIso(1),
  });
  await ds.notifications.create({
    userId: admin.id,
    type: 'verification_update',
    title: 'Verifications pending',
    message: '2 guard profiles are awaiting verification review.',
    read: false,
    link: '/admin/users',
    createdAt: daysAgoIso(1, 15),
  });
}
