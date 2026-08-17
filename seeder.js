require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for seeding...');
};

const users = [
  { name: 'Admin User', email: 'admin@college.edu', password: 'password123', role: 'admin' },
  { name: 'Dr. Ramesh Kumar', email: 'ramesh@college.edu', password: 'password123', role: 'teacher' },
  { name: 'Ms. Priya Devi', email: 'priya.t@college.edu', password: 'password123', role: 'teacher' },
  { name: 'Arun Selvam', email: 'arun.s@student.edu', password: 'password123', role: 'student', department: 'CSE', year: 2, rollNumber: '22CSE001', skills: ['Python', 'React', 'Node.js'], codingProfiles: { leetcode: 'arun_dev', codechef: 'arun_chef' }, points: 450 },
  { name: 'Kavitha R', email: 'kavitha.r@student.edu', password: 'password123', role: 'student', department: 'IT', year: 3, rollNumber: '21IT002', skills: ['Java', 'Spring Boot', 'MySQL'], points: 380 },
  { name: 'Mohamed Farhan', email: 'farhan.m@student.edu', password: 'password123', role: 'student', department: 'ECE', year: 2, rollNumber: '22ECE003', skills: ['Embedded C', 'Arduino', 'Python'], points: 210 },
  { name: 'Sneha Priya', email: 'sneha.p@student.edu', password: 'password123', role: 'student', department: 'CSE', year: 1, rollNumber: '23CSE004', skills: ['HTML', 'CSS', 'JavaScript'], points: 120 },
  { name: 'Vikram S', email: 'vikram.s@student.edu', password: 'password123', role: 'student', department: 'AIML', year: 3, rollNumber: '21AIML005', skills: ['ML', 'Deep Learning', 'Python', 'TensorFlow'], codingProfiles: { leetcode: 'vikram_ml' }, points: 620 },
];

const createEvents = (teacherId) => [
  {
    title: 'HackFest 2025 - 24hr Hackathon',
    description: 'Annual inter-college hackathon. Build solutions for real-world problems in 24 hours. Best projects win exciting prizes!',
    shortDescription: 'Build. Break. Repeat. 24-hour coding marathon.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    category: 'hackathon',
    eventType: 'internal',
    isOnline: false,
    location: 'Main Auditorium',
    eligibility: { allDepartments: false, departments: ['CSE', 'IT', 'AIML'], allYears: false, years: [2, 3, 4], teamEvent: true, teamSize: 4, maxParticipants: 100 },
    pointsForAttending: 100,
    pointsForWinning: 500,
    createdBy: teacherId,
    status: 'published',
    tags: ['hackathon', 'coding', 'innovation'],
    club: 'Tech Club',
  },
  {
    title: 'Web Dev Workshop - React & Node',
    description: 'Hands-on workshop covering modern full-stack development with React and Node.js. Bring your laptop!',
    shortDescription: 'Full-stack dev with React + Node.js',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    category: 'workshop',
    eventType: 'internal',
    isOnline: false,
    location: 'Lab Block 3 - Room 301',
    eligibility: { allDepartments: true, allYears: true },
    pointsForAttending: 50,
    createdBy: teacherId,
    status: 'published',
    tags: ['web', 'react', 'nodejs'],
    club: 'Web Dev Club',
  },
  {
    title: 'Smart India Hackathon - Zonal Round',
    description: 'Compete for a spot in the Smart India Hackathon national finals. Present your innovation to a panel of experts.',
    shortDescription: 'Gateway to Smart India Hackathon nationals.',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    category: 'hackathon',
    eventType: 'external',
    isOnline: false,
    location: 'Anna University, Chennai',
    eligibility: { allDepartments: false, departments: ['CSE', 'ECE', 'IT', 'AIML'], allYears: false, years: [3, 4], teamEvent: true, teamSize: 6 },
    pointsForAttending: 150,
    pointsForWinning: 800,
    createdBy: teacherId,
    status: 'published',
    tags: ['sih', 'national', 'innovation'],
  },
  {
    title: 'Alumni Talk: Life After Engineering',
    description: 'Senior alumni from top MNCs and startups share their journey, insights, and career advice.',
    shortDescription: 'Real talk from engineers in the field.',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    category: 'seminar',
    eventType: 'internal',
    isOnline: true,
    meetLink: 'https://meet.google.com/abc-defg-hij',
    eligibility: { allDepartments: true, allYears: true },
    pointsForAttending: 30,
    createdBy: teacherId,
    status: 'published',
    tags: ['career', 'alumni', 'motivation'],
  },
  {
    title: 'CodeChef Campus Contest #12',
    description: 'Monthly competitive programming contest. Solve algorithmic problems and climb the leaderboard!',
    shortDescription: 'Monthly CP contest - algorithms & data structures',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    category: 'technical',
    eventType: 'external',
    isOnline: true,
    externalLink: 'https://www.codechef.com/campus',
    eligibility: { allDepartments: true, allYears: true },
    pointsForAttending: 40,
    pointsForWinning: 200,
    createdBy: teacherId,
    status: 'published',
    tags: ['competitive-programming', 'codechef'],
  },
];

const importData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Event.deleteMany();
    await Registration.deleteMany();

    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    const teacher = createdUsers.find(u => u.role === 'teacher');
    const events = await Event.create(createEvents(teacher._id));
    console.log(`✅ Created ${events.length} events`);

    // Sample registrations
    const students = createdUsers.filter(u => u.role === 'student');
    const regs = [];
    for (const student of students.slice(0, 3)) {
      regs.push({ event: events[1]._id, student: student._id, isEligible: true, attended: true, pointsEarned: 50 });
    }
    await Registration.create(regs);
    console.log(`✅ Created ${regs.length} sample registrations`);

    console.log('\n🎉 Seed complete!\n');
    console.log('📋 Demo credentials:');
    console.log('   Admin:   admin@college.edu / password123');
    console.log('   Teacher: ramesh@college.edu / password123');
    console.log('   Student: arun.s@student.edu / password123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

importData();
