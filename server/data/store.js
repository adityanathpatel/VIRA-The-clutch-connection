import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/* ============================================= */
/*  IN-MEMORY DATA STORE WITH SAMPLE SEED DATA   */
/* ============================================= */

const uid = () => crypto.randomUUID();
const hash = (pw) => bcrypt.hashSync(pw, 10);
const now = () => new Date().toISOString();

// ── Fixed IDs for cross-referencing ──
const ADMIN_1 = 'a0000001-0000-0000-0000-000000000001';
const ADMIN_2 = 'a0000002-0000-0000-0000-000000000002';
const VOL_1   = 'v0000001-0000-0000-0000-000000000001';
const VOL_2   = 'v0000002-0000-0000-0000-000000000002';
const VOL_3   = 'v0000003-0000-0000-0000-000000000003';
const VOL_4   = 'v0000004-0000-0000-0000-000000000004';
const VOL_5   = 'v0000005-0000-0000-0000-000000000005';

// ── USERS ──
const users = [
  { id: ADMIN_1, name: 'VIRA Admin',       email: 'admin@vira.org',          password: hash('admin123'),    role: 'admin',     organization: 'VIRA Foundation',      createdAt: '2026-01-15T10:00:00Z' },
  { id: ADMIN_2, name: 'Sunita Verma',     email: 'sunita@helpindia.org',    password: hash('admin123'),    role: 'admin',     organization: 'HelpIndia Trust',      createdAt: '2026-02-20T08:30:00Z' },
  { id: VOL_1,   name: 'Rahul Sharma',     email: 'rahul@email.com',         password: hash('volunteer123'), role: 'volunteer', organization: null,                   createdAt: '2026-03-01T09:00:00Z' },
  { id: VOL_2,   name: 'Priya Patel',      email: 'priya@email.com',         password: hash('volunteer123'), role: 'volunteer', organization: null,                   createdAt: '2026-03-05T11:00:00Z' },
  { id: VOL_3,   name: 'Amit Kumar',       email: 'amit@email.com',          password: hash('volunteer123'), role: 'volunteer', organization: null,                   createdAt: '2026-03-10T14:00:00Z' },
  { id: VOL_4,   name: 'Sara Khan',        email: 'sara@email.com',          password: hash('volunteer123'), role: 'volunteer', organization: null,                   createdAt: '2026-03-12T07:00:00Z' },
  { id: VOL_5,   name: 'Vikram Singh',     email: 'vikram@email.com',        password: hash('volunteer123'), role: 'volunteer', organization: null,                   createdAt: '2026-03-15T16:00:00Z' },
];

// ── VOLUNTEER PROFILES ──
const volunteerProfiles = [
  { id: uid(), userId: VOL_1, skills: ['teaching', 'first_aid', 'counseling'],       location: 'Mumbai',  availability: 'weekends',  phone: '+91-9876543210' },
  { id: uid(), userId: VOL_2, skills: ['cooking', 'counseling', 'event_management'], location: 'Delhi',   availability: 'weekdays',  phone: '+91-9876543211' },
  { id: uid(), userId: VOL_3, skills: ['driving', 'logistics', 'first_aid'],         location: 'Mumbai',  availability: 'full_time', phone: '+91-9876543212' },
  { id: uid(), userId: VOL_4, skills: ['medical', 'first_aid', 'teaching'],          location: 'Pune',    availability: 'weekends',  phone: '+91-9876543213' },
  { id: uid(), userId: VOL_5, skills: ['teaching', 'farming', 'construction'],       location: 'Chennai', availability: 'weekdays',  phone: '+91-9876543214' },
];

// ── TASKS ──
const tasks = [
  { id: uid(), title: 'Health Camp in Dharavi',          description: 'Organize a free health check-up camp for 200+ residents in Dharavi slum area. Need volunteers with medical and first aid skills.',                                        category: 'health',        location: 'Mumbai',  urgency: 'high',   status: 'pending',   requiredSkills: ['medical', 'first_aid'],              assignedVolunteerId: null,  createdBy: ADMIN_1, createdAt: '2026-04-01T10:00:00Z' },
  { id: uid(), title: 'Food Distribution Drive',         description: 'Weekly food distribution to 500 families in underprivileged areas. Requires cooking and logistics coordination.',                                                          category: 'food',          location: 'Delhi',   urgency: 'high',   status: 'assigned',  requiredSkills: ['cooking', 'logistics'],              assignedVolunteerId: VOL_2, createdBy: ADMIN_1, createdAt: '2026-04-02T09:00:00Z' },
  { id: uid(), title: 'Teaching Workshop for Kids',       description: 'Conduct weekend teaching sessions for underprivileged children aged 6-14. English, Math, and Science basics.',                                                             category: 'education',     location: 'Pune',    urgency: 'medium', status: 'assigned',  requiredSkills: ['teaching'],                          assignedVolunteerId: VOL_4, createdBy: ADMIN_2, createdAt: '2026-04-03T11:00:00Z' },
  { id: uid(), title: 'Water Supply Survey',              description: 'Survey water supply infrastructure in 10 villages. Document water quality issues and access problems.',                                                                    category: 'infrastructure', location: 'Mumbai', urgency: 'high',   status: 'pending',   requiredSkills: ['logistics'],                         assignedVolunteerId: null,  createdBy: ADMIN_1, createdAt: '2026-04-04T08:00:00Z' },
  { id: uid(), title: 'Mental Health Awareness Session',  description: 'Conduct mental health awareness workshops for youth aged 18-30 in community centers.',                                                                                     category: 'health',        location: 'Delhi',   urgency: 'medium', status: 'pending',   requiredSkills: ['counseling'],                        assignedVolunteerId: null,  createdBy: ADMIN_2, createdAt: '2026-04-05T13:00:00Z' },
  { id: uid(), title: 'Clothing Distribution',            description: 'Distribute donated winter clothing to homeless shelters and street dwellers.',                                                                                              category: 'welfare',       location: 'Chennai', urgency: 'low',    status: 'completed', requiredSkills: ['logistics', 'event_management'],     assignedVolunteerId: VOL_5, createdBy: ADMIN_1, createdAt: '2026-03-20T10:00:00Z' },
  { id: uid(), title: 'Adult Literacy Program',           description: 'Evening literacy classes for adults who missed formal education. 3 days per week.',                                                                                         category: 'education',     location: 'Mumbai',  urgency: 'medium', status: 'assigned',  requiredSkills: ['teaching'],                          assignedVolunteerId: VOL_1, createdBy: ADMIN_1, createdAt: '2026-04-06T07:00:00Z' },
  { id: uid(), title: 'Community Kitchen Setup',          description: 'Set up a community kitchen to serve 300 meals daily to migrant workers and daily wage laborers.',                                                                           category: 'food',          location: 'Pune',    urgency: 'high',   status: 'pending',   requiredSkills: ['cooking', 'event_management'],       assignedVolunteerId: null,  createdBy: ADMIN_2, createdAt: '2026-04-07T12:00:00Z' },
  { id: uid(), title: 'First Aid Training Camp',          description: 'Train 50 community volunteers in basic first aid and emergency response procedures.',                                                                                      category: 'health',        location: 'Delhi',   urgency: 'medium', status: 'completed', requiredSkills: ['first_aid', 'medical'],               assignedVolunteerId: VOL_3, createdBy: ADMIN_1, createdAt: '2026-03-15T09:00:00Z' },
  { id: uid(), title: 'Environmental Awareness Rally',    description: 'Organize a rally and plantation drive in local parks and school grounds. Engage 100+ participants.',                                                                        category: 'environment',   location: 'Mumbai',  urgency: 'low',    status: 'pending',   requiredSkills: ['event_management', 'teaching'],      assignedVolunteerId: null,  createdBy: ADMIN_2, createdAt: '2026-04-10T15:00:00Z' },
];

// ── DATA REPORTS ──
const dataReports = [
  { id: uid(), type: 'survey',  title: 'Dharavi Water Quality Survey',       content: 'Survey of 50 households revealed 72% lack access to clean drinking water. Major contamination sources identified near drainage canals.',          location: 'Mumbai',  submittedBy: ADMIN_1, createdAt: '2026-03-25T10:00:00Z' },
  { id: uid(), type: 'report',  title: 'Delhi Hunger Index Report',          content: 'Field report indicating 35% of children under 5 in surveyed areas show signs of malnutrition. Urgent food intervention required in 3 zones.',    location: 'Delhi',   submittedBy: ADMIN_2, createdAt: '2026-03-28T14:00:00Z' },
  { id: uid(), type: 'survey',  title: 'Education Gap Assessment - Pune',    content: 'Assessment of 200 children aged 6-14: 45% cannot read basic text, 60% struggle with basic math. Need for structured teaching programs.',         location: 'Pune',    submittedBy: ADMIN_2, createdAt: '2026-04-01T09:00:00Z' },
  { id: uid(), type: 'report',  title: 'Volunteer Availability Analysis',    content: 'Analysis shows 70% of volunteers prefer weekend engagement. Only 20% available full-time. Skill gap identified in medical and counseling.',     location: 'All',     submittedBy: ADMIN_1, createdAt: '2026-04-05T11:00:00Z' },
  { id: uid(), type: 'survey',  title: 'Infrastructure Needs - Rural Mumbai', content: 'Survey of 8 villages: 5 lack paved roads, 6 have no primary health center within 10km, 4 have unreliable electricity supply.',                  location: 'Mumbai',  submittedBy: ADMIN_1, createdAt: '2026-04-08T08:00:00Z' },
];

// ── NOTIFICATIONS ──
const notifications = [
  { id: uid(), userId: VOL_1, message: 'You have been assigned to "Adult Literacy Program" in Mumbai.',                   read: false, createdAt: '2026-04-06T07:05:00Z' },
  { id: uid(), userId: VOL_2, message: 'You have been assigned to "Food Distribution Drive" in Delhi.',                   read: false, createdAt: '2026-04-02T09:05:00Z' },
  { id: uid(), userId: VOL_3, message: 'You completed "First Aid Training Camp". Great work!',                            read: true,  createdAt: '2026-03-20T18:00:00Z' },
  { id: uid(), userId: VOL_4, message: 'New task available near you: "Community Kitchen Setup" in Pune.',                 read: false, createdAt: '2026-04-07T12:05:00Z' },
  { id: uid(), userId: VOL_5, message: 'You completed "Clothing Distribution" in Chennai. Thank you!',                   read: true,  createdAt: '2026-03-25T16:00:00Z' },
  { id: uid(), userId: VOL_1, message: 'New high-urgency task posted: "Health Camp in Dharavi". Check it out!',           read: false, createdAt: '2026-04-01T10:05:00Z' },
];


/* ============================================= */
/*     COLLECTION HELPER (MongoDB-like API)      */
/* ============================================= */

function createCollection(arr) {
  return {
    findAll:     (filter) => {
      if (!filter) return [...arr];
      return arr.filter(item =>
        Object.entries(filter).every(([key, val]) => {
          if (Array.isArray(val)) return val.includes(item[key]);
          return item[key] === val;
        })
      );
    },
    findById:    (id) => arr.find(item => item.id === id) || null,
    findOne:     (filter) => arr.find(item => Object.entries(filter).every(([k, v]) => item[k] === v)) || null,
    create:      (data) => { const entry = { id: uid(), ...data, createdAt: now() }; arr.push(entry); return entry; },
    update:      (id, data) => {
      const idx = arr.findIndex(item => item.id === id);
      if (idx === -1) return null;
      arr[idx] = { ...arr[idx], ...data, updatedAt: now() };
      return arr[idx];
    },
    delete:      (id) => {
      const idx = arr.findIndex(item => item.id === id);
      if (idx === -1) return null;
      return arr.splice(idx, 1)[0];
    },
    count:       (filter) => {
      if (!filter) return arr.length;
      return arr.filter(item => Object.entries(filter).every(([k, v]) => item[k] === v)).length;
    },
  };
}

/* ============================================= */
/*             EXPORTED DB INTERFACE              */
/* ============================================= */

const db = {
  users:             createCollection(users),
  volunteerProfiles: createCollection(volunteerProfiles),
  tasks:             createCollection(tasks),
  dataReports:       createCollection(dataReports),
  notifications:     createCollection(notifications),
};

export default db;
