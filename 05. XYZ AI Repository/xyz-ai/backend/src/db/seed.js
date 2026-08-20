import bcrypt from "bcryptjs";
import { User } from "./models/User.js";
import { Attendance } from "./models/Attendance.js";
import { Escalation } from "./models/Escalation.js";
import { SchoolClass } from "./models/Class.js";
import { Timetable } from "./models/Timetable.js";
import { connectDB, isDbConnected } from "./connection.js";

// Full In-Memory & MongoDB Dataset: Classes 1-5, 10 Teachers, 1 Principal, 30 Students, 30 Parents + Custom 4 Users
export const memoryStore = {
  users: {
    // 4 Custom Core Role Users
    jeevan: { id: "jeevan", userId: "jeevan", username: "jeevan", name: "Jeevan", role: "student", language: "en", classId: "c1", studentIds: [], classIds: [] },
    surya: { id: "surya", userId: "surya", username: "surya prakash", name: "Surya Prakash", role: "teacher", language: "en", classIds: ["c1", "c2"], studentIds: [] },
    surya_short: { id: "surya_short", userId: "surya_short", username: "surya", name: "Surya Prakash", role: "teacher", language: "en", classIds: ["c1", "c2"], studentIds: [] },
    yashwanth: { id: "yashwanth", userId: "yashwanth", username: "yashwanth", name: "Yashwanth", role: "parent", language: "en", studentIds: ["jeevan", "s1"], classIds: [] },
    akhil: { id: "akhil", userId: "akhil", username: "akhil", name: "Akhil", role: "principal", language: "en", studentIds: [], classIds: ["c1","c2","c3","c4","c5","c6","c7","c8","c9","c10"] },

    // Institutional Principal
    m1: { id: "m1", userId: "m1", username: "Rajesh", name: "Dr. Rajesh Menon", role: "principal", language: "en", studentIds: [], classIds: ["c1","c2","c3","c4","c5","c6","c7","c8","c9","c10"] },

    // 10 Faculty Leads
    t1: { id: "t1", userId: "t1", username: "PriyaN", name: "Priya Nair", role: "teacher", language: "en", classIds: ["c1"], studentIds: [] },
    t2: { id: "t2", userId: "t2", username: "SunitaR", name: "Sunita Rao", role: "teacher", language: "te", classIds: ["c2"], studentIds: [] },
    t3: { id: "t3", userId: "t3", username: "AnanyaS", name: "Ananya Sharma", role: "teacher", language: "en", classIds: ["c3"], studentIds: [] },
    t4: { id: "t4", userId: "t4", username: "VikramR", name: "Vikram Roy", role: "teacher", language: "bn", classIds: ["c4"], studentIds: [] },
    t5: { id: "t5", userId: "t5", username: "DeepaK", name: "Deepa Kulkarni", role: "teacher", language: "mr", classIds: ["c5"], studentIds: [] },
    t6: { id: "t6", userId: "t6", username: "SureshV", name: "Suresh Verma", role: "teacher", language: "hi", classIds: ["c6"], studentIds: [] },
    t7: { id: "t7", userId: "t7", username: "NehaD", name: "Neha Deshmukh", role: "teacher", language: "mr", classIds: ["c7"], studentIds: [] },
    t8: { id: "t8", userId: "t8", username: "AmitP", name: "Amit Patel", role: "teacher", language: "gu", classIds: ["c8"], studentIds: [] },
    t9: { id: "t9", userId: "t9", username: "PoojaI", name: "Pooja Iyer", role: "teacher", language: "ta", classIds: ["c9"], studentIds: [] },
    t10: { id: "t10", userId: "t10", username: "RahulS", name: "Rahul Sengupta", role: "teacher", language: "bn", classIds: ["c10"], studentIds: [] },

    // 30 Students (Classes 1-5, 3 per section)
    s1: { id: "s1", userId: "s1", username: "AaravN", name: "Aarav Nair", role: "student", language: "en", classId: "c1", studentIds: [], classIds: [] },
    s2: { id: "s2", userId: "s2", username: "DiyaJ", name: "Diya Joshi", role: "student", language: "hi", classId: "c1", studentIds: [], classIds: [] },
    s3: { id: "s3", userId: "s3", username: "VivaanG", name: "Vivaan Gupta", role: "student", language: "en", classId: "c1", studentIds: [], classIds: [] },
    s4: { id: "s4", userId: "s4", username: "AnanyaR", name: "Ananya Rao", role: "student", language: "te", classId: "c2", studentIds: [], classIds: [] },
    s5: { id: "s5", userId: "s5", username: "KabirM", name: "Kabir Mehta", role: "student", language: "gu", classId: "c2", studentIds: [], classIds: [] },
    s6: { id: "s6", userId: "s6", username: "SaanviS", name: "Saanvi Shah", role: "student", language: "gu", classId: "c2", studentIds: [], classIds: [] },
    s7: { id: "s7", userId: "s7", username: "AdityaS", name: "Aditya Sharma", role: "student", language: "en", classId: "c3", studentIds: [], classIds: [] },
    s8: { id: "s8", userId: "s8", username: "IshitaR", name: "Ishita Roy", role: "student", language: "bn", classId: "c3", studentIds: [], classIds: [] },
    s9: { id: "s9", userId: "s9", username: "RohanR", name: "Rohan Reddy", role: "student", language: "te", classId: "c3", studentIds: [], classIds: [] },
    s10: { id: "s10", userId: "s10", username: "MeeraR", name: "Meera Roy", role: "student", language: "bn", classId: "c4", studentIds: [], classIds: [] },
    s11: { id: "s11", userId: "s11", username: "ReyanshD", name: "Reyansh Das", role: "student", language: "en", classId: "c4", studentIds: [], classIds: [] },
    s12: { id: "s12", userId: "s12", username: "KiaraS", name: "Kiara Sen", role: "student", language: "bn", classId: "c4", studentIds: [], classIds: [] },
    s13: { id: "s13", userId: "s13", username: "TanviK", name: "Tanvi Kulkarni", role: "student", language: "mr", classId: "c5", studentIds: [], classIds: [] },
    s14: { id: "s14", userId: "s14", username: "ArjunB", name: "Arjun Bhat", role: "student", language: "kn", classId: "c5", studentIds: [], classIds: [] },
    s15: { id: "s15", userId: "s15", username: "RheaK", name: "Rhea Kapoor", role: "student", language: "pa", classId: "c5", studentIds: [], classIds: [] },
    s16: { id: "s16", userId: "s16", username: "SiddharthV", name: "Siddharth Verma", role: "student", language: "hi", classId: "c6", studentIds: [], classIds: [] },
    s17: { id: "s17", userId: "s17", username: "AvaniS", name: "Avani Singh", role: "student", language: "hi", classId: "c6", studentIds: [], classIds: [] },
    s18: { id: "s18", userId: "s18", username: "DevP", name: "Dev Patel", role: "student", language: "gu", classId: "c6", studentIds: [], classIds: [] },
    s19: { id: "s19", userId: "s19", username: "NavyaD", name: "Navya Deshmukh", role: "student", language: "mr", classId: "c7", studentIds: [], classIds: [] },
    s20: { id: "s20", userId: "s20", username: "YashM", name: "Yash Malhotra", role: "student", language: "pa", classId: "c7", studentIds: [], classIds: [] },
    s21: { id: "s21", userId: "s21", username: "PrishaN", name: "Prisha Nair", role: "student", language: "ml", classId: "c7", studentIds: [], classIds: [] },
    s22: { id: "s22", userId: "s22", username: "KaranP", name: "Karan Patel", role: "student", language: "gu", classId: "c8", studentIds: [], classIds: [] },
    s23: { id: "s23", userId: "s23", username: "AnikaP", name: "Anika Pillai", role: "student", language: "ta", classId: "c8", studentIds: [], classIds: [] },
    s24: { id: "s24", userId: "s24", username: "ShauryaJ", name: "Shaurya Jain", role: "student", language: "hi", classId: "c8", studentIds: [], classIds: [] },
    s25: { id: "s25", userId: "s25", username: "IshaI", name: "Isha Iyer", role: "student", language: "ta", classId: "c9", studentIds: [], classIds: [] },
    s26: { id: "s26", userId: "s26", username: "DhruvM", name: "Dhruv Menon", role: "student", language: "ml", classId: "c9", studentIds: [], classIds: [] },
    s27: { id: "s27", userId: "s27", username: "TaraB", name: "Tara Bose", role: "student", language: "bn", classId: "c9", studentIds: [], classIds: [] },
    s28: { id: "s28", userId: "s28", username: "ManishS", name: "Manish Sengupta", role: "student", language: "bn", classId: "c10", studentIds: [], classIds: [] },
    s29: { id: "s29", userId: "s29", username: "RiddhiA", name: "Riddhi Agarwal", role: "student", language: "hi", classId: "c10", studentIds: [], classIds: [] },
    s30: { id: "s30", userId: "s30", username: "AyaanK", name: "Ayaan Khan", role: "student", language: "ur", classId: "c10", studentIds: [], classIds: [] },

    // 30 Parents (Mapped to s1 - s30)
    p1: { id: "p1", userId: "p1", username: "SureshN", name: "Suresh Nair", role: "parent", language: "en", studentIds: ["s1"], classIds: [] },
    p2: { id: "p2", userId: "p2", username: "RekhaJ", name: "Rekha Joshi", role: "parent", language: "hi", studentIds: ["s2"], classIds: [] },
    p3: { id: "p3", userId: "p3", username: "ManishG", name: "Manish Gupta", role: "parent", language: "en", studentIds: ["s3"], classIds: [] },
    p4: { id: "p4", userId: "p4", username: "KVRao", name: "K. V. Rao", role: "parent", language: "te", studentIds: ["s4"], classIds: [] },
    p5: { id: "p5", userId: "p5", username: "BhavinM", name: "Bhavin Mehta", role: "parent", language: "gu", studentIds: ["s5"], classIds: [] },
    p6: { id: "p6", userId: "p6", username: "RupalS", name: "Rupal Shah", role: "parent", language: "gu", studentIds: ["s6"], classIds: [] },
    p7: { id: "p7", userId: "p7", username: "MeeraS", name: "Meera Sharma", role: "parent", language: "en", studentIds: ["s7"], classIds: [] },
    p8: { id: "p8", userId: "p8", username: "SubhashR", name: "Subhash Roy", role: "parent", language: "bn", studentIds: ["s8"], classIds: [] },
    p9: { id: "p9", userId: "p9", username: "VenkatR", name: "Venkat Reddy", role: "parent", language: "te", studentIds: ["s9"], classIds: [] },
    p10: { id: "p10", userId: "p10", username: "TapasR", name: "Tapas Roy", role: "parent", language: "bn", studentIds: ["s10"], classIds: [] },
    p11: { id: "p11", userId: "p11", username: "AlokD", name: "Alok Das", role: "parent", language: "en", studentIds: ["s11"], classIds: [] },
    p12: { id: "p12", userId: "p12", username: "DebashisS", name: "Debashis Sen", role: "parent", language: "bn", studentIds: ["s12"], classIds: [] },
    p13: { id: "p13", userId: "p13", username: "MilindK", name: "Milind Kulkarni", role: "parent", language: "mr", studentIds: ["s13"], classIds: [] },
    p14: { id: "p14", userId: "p14", username: "RaghavB", name: "Raghavendra Bhat", role: "parent", language: "kn", studentIds: ["s14"], classIds: [] },
    p15: { id: "p15", userId: "p15", username: "SimranK", name: "Simran Kapoor", role: "parent", language: "pa", studentIds: ["s15"], classIds: [] },
    p16: { id: "p16", userId: "p16", username: "ManojV", name: "Manoj Verma", role: "parent", language: "hi", studentIds: ["s16"], classIds: [] },
    p17: { id: "p17", userId: "p17", username: "RituS", name: "Ritu Singh", role: "parent", language: "hi", studentIds: ["s17"], classIds: [] },
    p18: { id: "p18", userId: "p18", username: "ChetanP", name: "Chetan Patel", role: "parent", language: "gu", studentIds: ["s18"], classIds: [] },
    p19: { id: "p19", userId: "p19", username: "HemantD", name: "Hemant Deshmukh", role: "parent", language: "mr", studentIds: ["s19"], classIds: [] },
    p20: { id: "p20", userId: "p20", username: "JaspreetM", name: "Jaspreet Malhotra", role: "parent", language: "pa", studentIds: ["s20"], classIds: [] },
    p21: { id: "p21", userId: "p21", username: "RadhikaN", name: "Radhika Nair", role: "parent", language: "ml", studentIds: ["s21"], classIds: [] },
    p22: { id: "p22", userId: "p22", username: "HirenP", name: "Hiren Patel", role: "parent", language: "gu", studentIds: ["s22"], classIds: [] },
    p23: { id: "p23", userId: "p23", username: "GopinathP", name: "Gopinath Pillai", role: "parent", language: "ta", studentIds: ["s23"], classIds: [] },
    p24: { id: "p24", userId: "p24", username: "SandeepJ", name: "Sandeep Jain", role: "parent", language: "hi", studentIds: ["s24"], classIds: [] },
    p25: { id: "p25", userId: "p25", username: "SIyer", name: "S. Iyer", role: "parent", language: "ta", studentIds: ["s25"], classIds: [] },
    p26: { id: "p26", userId: "p26", username: "RMenon", name: "Radhakrishnan Menon", role: "parent", language: "ml", studentIds: ["s26"], classIds: [] },
    p27: { id: "p27", userId: "p27", username: "AnirbanB", name: "Anirban Bose", role: "parent", language: "bn", studentIds: ["s27"], classIds: [] },
    p28: { id: "p28", userId: "p28", username: "SouravS", name: "Sourav Sengupta", role: "parent", language: "bn", studentIds: ["s28"], classIds: [] },
    p29: { id: "p29", userId: "p29", username: "SanjayA", name: "Sanjay Agarwal", role: "parent", language: "hi", studentIds: ["s29"], classIds: [] },
    p30: { id: "p30", userId: "p30", username: "FarhanK", name: "Farhan Khan", role: "parent", language: "ur", studentIds: ["s30"], classIds: [] },
  },

  classes: {
    c1: { id: "c1", classId: "c1", name: "Class 1A", grade: "Grade 1", teacherId: "surya", teacherName: "Surya Prakash", studentIds: ["jeevan", "s1", "s2", "s3"], roomNumber: "Room 101" },
    c2: { id: "c2", classId: "c2", name: "Class 1B", grade: "Grade 1", teacherId: "t2", teacherName: "Sunita Rao", studentIds: ["s4", "s5", "s6"], roomNumber: "Room 102" },
    c3: { id: "c3", classId: "c3", name: "Class 2A", grade: "Grade 2", teacherId: "t3", teacherName: "Ananya Sharma", studentIds: ["s7", "s8", "s9"], roomNumber: "Room 201" },
    c4: { id: "c4", classId: "c4", name: "Class 2B", grade: "Grade 2", teacherId: "t4", teacherName: "Vikram Roy", studentIds: ["s10", "s11", "s12"], roomNumber: "Room 202" },
    c5: { id: "c5", classId: "c5", name: "Class 3A", grade: "Grade 3", teacherId: "t5", teacherName: "Deepa Kulkarni", studentIds: ["s13", "s14", "s15"], roomNumber: "Room 301" },
    c6: { id: "c6", classId: "c6", name: "Class 3B", grade: "Grade 3", teacherId: "t6", teacherName: "Suresh Verma", studentIds: ["s16", "s17", "s18"], roomNumber: "Room 302" },
    c7: { id: "c7", classId: "c7", name: "Class 4A", grade: "Grade 4", teacherId: "t7", teacherName: "Neha Deshmukh", studentIds: ["s19", "s20", "s21"], roomNumber: "Room 401" },
    c8: { id: "c8", classId: "c8", name: "Class 4B", grade: "Grade 4", teacherId: "t8", teacherName: "Amit Patel", studentIds: ["s22", "s23", "s24"], roomNumber: "Room 402" },
    c9: { id: "c9", classId: "c9", name: "Class 5A", grade: "Grade 5", teacherId: "t9", teacherName: "Pooja Iyer", studentIds: ["s25", "s26", "s27"], roomNumber: "Room 501" },
    c10: { id: "c10", classId: "c10", name: "Class 5B", grade: "Grade 5", teacherId: "t10", teacherName: "Rahul Sengupta", studentIds: ["s28", "s29", "s30"], roomNumber: "Room 502" },
  },

  attendance: {},
  timetables: {},

  escalations: [
    {
      ticketId: "TKT-2001",
      requesterId: "yashwanth",
      requesterName: "Yashwanth",
      role: "parent",
      targetRole: "teacher",
      studentId: "jeevan",
      studentName: "Jeevan",
      reason: "Requesting teacher callback regarding Jeevan's recent mathematics worksheet progress.",
      status: "pending",
      priority: "high",
      createdAt: new Date(Date.now() - 3600 * 1000 * 2),
    },
    {
      ticketId: "TKT-2002",
      requesterId: "p18",
      requesterName: "Chetan Patel",
      role: "parent",
      targetRole: "management",
      studentId: "s18",
      studentName: "Dev Patel",
      reason: "Medical absence certificate submitted; requesting attendance threshold regularisation for Grade 3 evaluation.",
      status: "in_review",
      priority: "high",
      createdAt: new Date(Date.now() - 3600 * 1000 * 18),
    },
  ],
};

// Generate Timetables for Classes 1A to 5B
function generateTimetables() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const periodTimes = [
    "08:30 - 09:15",
    "09:15 - 10:00",
    "10:15 - 11:00",
    "11:00 - 11:45",
    "12:30 - 01:15",
    "01:15 - 02:00",
  ];

  const classConfigs = [
    {
      classId: "c1",
      className: "Class 1A",
      grade: "Grade 1",
      room: "Room 101",
      subjects: [
        { name: "Mathematics", teacherId: "surya", teacherName: "Surya Prakash" },
        { name: "English Literature", teacherId: "t1", teacherName: "Priya Nair" },
        { name: "General Science", teacherId: "surya", teacherName: "Surya Prakash" },
        { name: "Environmental Studies", teacherId: "t1", teacherName: "Priya Nair" },
        { name: "Physical Education", teacherId: "t6", teacherName: "Suresh Verma" },
        { name: "Art & Creativity", teacherId: "t7", teacherName: "Neha Deshmukh" },
      ],
    },
    {
      classId: "c2",
      className: "Class 1B",
      grade: "Grade 1",
      room: "Room 102",
      subjects: [
        { name: "English Literature", teacherId: "t2", teacherName: "Sunita Rao" },
        { name: "Mathematics", teacherId: "surya", teacherName: "Surya Prakash" },
        { name: "General Science", teacherId: "surya", teacherName: "Surya Prakash" },
        { name: "Social Studies", teacherId: "t2", teacherName: "Sunita Rao" },
        { name: "Physical Education", teacherId: "t6", teacherName: "Suresh Verma" },
        { name: "Music & Rhythm", teacherId: "t5", teacherName: "Deepa Kulkarni" },
      ],
    },
    {
      classId: "c3",
      className: "Class 2A",
      grade: "Grade 2",
      room: "Room 201",
      subjects: [
        { name: "English Language", teacherId: "t3", teacherName: "Ananya Sharma" },
        { name: "Mathematics", teacherId: "t8", teacherName: "Amit Patel" },
        { name: "Science", teacherId: "t3", teacherName: "Ananya Sharma" },
        { name: "Social Studies", teacherId: "t4", teacherName: "Vikram Roy" },
        { name: "Computer Literacy", teacherId: "t4", teacherName: "Vikram Roy" },
        { name: "Library & Reading", teacherId: "t1", teacherName: "Priya Nair" },
      ],
    },
    {
      classId: "c4",
      className: "Class 2B",
      grade: "Grade 2",
      room: "Room 202",
      subjects: [
        { name: "Science", teacherId: "t4", teacherName: "Vikram Roy" },
        { name: "Mathematics", teacherId: "t8", teacherName: "Amit Patel" },
        { name: "English", teacherId: "t3", teacherName: "Ananya Sharma" },
        { name: "Computer Literacy", teacherId: "t4", teacherName: "Vikram Roy" },
        { name: "Physical Education", teacherId: "t6", teacherName: "Suresh Verma" },
        { name: "Arts & Crafts", teacherId: "t7", teacherName: "Neha Deshmukh" },
      ],
    },
    {
      classId: "c5",
      className: "Class 3A",
      grade: "Grade 3",
      room: "Room 301",
      subjects: [
        { name: "Mathematics", teacherId: "t5", teacherName: "Deepa Kulkarni" },
        { name: "Science Lab", teacherId: "t5", teacherName: "Deepa Kulkarni" },
        { name: "English", teacherId: "t9", teacherName: "Pooja Iyer" },
        { name: "Social Studies", teacherId: "t7", teacherName: "Neha Deshmukh" },
        { name: "Physical Education", teacherId: "t6", teacherName: "Suresh Verma" },
        { name: "Robotics Intro", teacherId: "t10", teacherName: "Rahul Sengupta" },
      ],
    },
    {
      classId: "c6",
      className: "Class 3B",
      grade: "Grade 3",
      room: "Room 302",
      subjects: [
        { name: "Hindi / Language", teacherId: "t6", teacherName: "Suresh Verma" },
        { name: "Mathematics", teacherId: "t5", teacherName: "Deepa Kulkarni" },
        { name: "Science", teacherId: "t5", teacherName: "Deepa Kulkarni" },
        { name: "English", teacherId: "t9", teacherName: "Pooja Iyer" },
        { name: "Social Studies", teacherId: "t7", teacherName: "Neha Deshmukh" },
        { name: "Sports & Yoga", teacherId: "t6", teacherName: "Suresh Verma" },
      ],
    },
    {
      classId: "c7",
      className: "Class 4A",
      grade: "Grade 4",
      room: "Room 401",
      subjects: [
        { name: "Social Studies", teacherId: "t7", teacherName: "Neha Deshmukh" },
        { name: "Mathematics", teacherId: "t8", teacherName: "Amit Patel" },
        { name: "Science", teacherId: "t10", teacherName: "Rahul Sengupta" },
        { name: "English Literature", teacherId: "t9", teacherName: "Pooja Iyer" },
        { name: "Computer Science", teacherId: "t4", teacherName: "Vikram Roy" },
        { name: "Art & Culture", teacherId: "t7", teacherName: "Neha Deshmukh" },
      ],
    },
    {
      classId: "c8",
      className: "Class 4B",
      grade: "Grade 4",
      room: "Room 402",
      subjects: [
        { name: "Mathematics", teacherId: "t8", teacherName: "Amit Patel" },
        { name: "Social Studies", teacherId: "t7", teacherName: "Neha Deshmukh" },
        { name: "English", teacherId: "t9", teacherName: "Pooja Iyer" },
        { name: "Science", teacherId: "t10", teacherName: "Rahul Sengupta" },
        { name: "Physical Education", teacherId: "t6", teacherName: "Suresh Verma" },
        { name: "Coding & Logic", teacherId: "t4", teacherName: "Vikram Roy" },
      ],
    },
    {
      classId: "c9",
      className: "Class 5A",
      grade: "Grade 5",
      room: "Room 501",
      subjects: [
        { name: "English Masterclass", teacherId: "t9", teacherName: "Pooja Iyer" },
        { name: "Advanced Mathematics", teacherId: "t8", teacherName: "Amit Patel" },
        { name: "Physics & Chemistry", teacherId: "t10", teacherName: "Rahul Sengupta" },
        { name: "Biology & Ecology", teacherId: "t5", teacherName: "Deepa Kulkarni" },
        { name: "History & Civics", teacherId: "t7", teacherName: "Neha Deshmukh" },
        { name: "AI & Innovation Lab", teacherId: "t10", teacherName: "Rahul Sengupta" },
      ],
    },
    {
      classId: "c10",
      className: "Class 5B",
      grade: "Grade 5",
      room: "Room 502",
      subjects: [
        { name: "Physics & Chemistry", teacherId: "t10", teacherName: "Rahul Sengupta" },
        { name: "Advanced Mathematics", teacherId: "t8", teacherName: "Amit Patel" },
        { name: "English Masterclass", teacherId: "t9", teacherName: "Pooja Iyer" },
        { name: "History & Civics", teacherId: "t7", teacherName: "Neha Deshmukh" },
        { name: "AI & Innovation Lab", teacherId: "t10", teacherName: "Rahul Sengupta" },
        { name: "Physical Education", teacherId: "t6", teacherName: "Suresh Verma" },
      ],
    },
  ];

  classConfigs.forEach((cfg) => {
    const schedule = days.map((day, dIdx) => {
      const periods = periodTimes.map((time, pIdx) => {
        const subIdx = (dIdx * 2 + pIdx) % cfg.subjects.length;
        const sub = cfg.subjects[subIdx];
        return {
          periodNumber: pIdx + 1,
          time,
          subject: sub.name,
          teacherId: sub.teacherId,
          teacherName: sub.teacherName,
          room: cfg.room,
        };
      });
      return { day, periods };
    });

    memoryStore.timetables[cfg.classId] = {
      classId: cfg.classId,
      className: cfg.className,
      grade: cfg.grade,
      academicYear: "2026",
      schedule,
    };
  });
}

generateTimetables();

// Generate 90 Calendar Days for all students including 'jeevan'
function generateComprehensiveAttendance() {
  const studentIds = ["jeevan", ...Array.from({ length: 30 }, (_, i) => `s${i + 1}`)];
  const targetRates = {
    jeevan: 0.954,
    s1: 0.945, s2: 0.912, s3: 0.880, s4: 0.960, s5: 0.784,
    s6: 0.920, s7: 0.955, s8: 0.893, s9: 0.932, s10: 0.910,
    s11: 0.840, s12: 0.971, s13: 0.948, s14: 0.904, s15: 0.935,
    s16: 0.872, s17: 0.965, s18: 0.795, s19: 0.928, s20: 0.885,
    s21: 0.950, s22: 0.916, s23: 0.930, s24: 0.855, s25: 0.968,
    s26: 0.900, s27: 0.942, s28: 0.890, s29: 0.924, s30: 0.952,
  };

  const today = new Date();
  const daysToGenerate = 90;

  studentIds.forEach((sid, idx) => {
    const targetRate = targetRates[sid] || 0.92;
    const records = [];
    let workingDays = 0;
    let presentDays = 0;

    for (let dIdx = daysToGenerate; dIdx >= 0; dIdx--) {
      const d = new Date(today);
      d.setDate(d.getDate() - dIdx);
      const dateStr = d.toISOString().split("T")[0];
      const dayOfWeek = d.getDay();

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        records.push({ date: dateStr, status: "weekend" });
      } else {
        workingDays++;
        const seedVal = (((idx + 1) * 37 + dIdx * 19) % 1000) / 1000;
        const isPresent = seedVal < targetRate;
        if (isPresent) {
          presentDays++;
          records.push({ date: dateStr, status: "present", remarks: "On time" });
        } else {
          records.push({ date: dateStr, status: "absent", remarks: "Absence logged" });
        }
      }
    }

    const percentage = workingDays > 0 ? ((presentDays / workingDays) * 100).toFixed(1) : "100.0";
    memoryStore.attendance[sid] = {
      studentId: sid,
      percentage,
      totalWorkingDays: workingDays,
      presentDays,
      records,
    };
  });
}

generateComprehensiveAttendance();

export async function seedDatabase() {
  await connectDB();

  if (!isDbConnected()) {
    console.log("ℹ️ Using expanded in-memory dataset.");
    return memoryStore;
  }

  try {
    console.log("🌱 Seeding MongoDB collections with custom users (jeevan, surya, yashwanth, akhil) + Classes 1-5 & Timetables...");

    // Clean existing collections to avoid duplicate key index conflict
    await User.deleteMany({});
    await SchoolClass.deleteMany({});
    await Attendance.deleteMany({});
    await Escalation.deleteMany({});
    await Timetable.deleteMany({});

    // 1. Prepare User Docs (pre-hashed with bcrypt)
    const userDocs = Object.values(memoryStore.users).map((u) => {
      const passwordHash = bcrypt.hashSync(u.username, 8);
      return {
        userId: u.id,
        username: u.username,
        name: u.name,
        role: u.role,
        language: u.language,
        classId: u.classId || null,
        studentIds: u.studentIds || [],
        classIds: u.classIds || [],
        passwordHash,
      };
    });
    await User.insertMany(userDocs);

    // 2. Prepare Class Docs
    const classDocs = Object.values(memoryStore.classes).map((c) => ({
      classId: c.id,
      name: c.name,
      grade: c.grade,
      teacherId: c.teacherId,
      teacherName: c.teacherName,
      studentIds: c.studentIds,
      roomNumber: c.roomNumber,
    }));
    await SchoolClass.insertMany(classDocs);

    // 3. Prepare Attendance Docs
    const attDocs = Object.entries(memoryStore.attendance).map(([studentId, att]) => {
      const studentUser = memoryStore.users[studentId];
      return {
        studentId,
        classId: studentUser ? studentUser.classId : null,
        percentage: att.percentage,
        totalWorkingDays: att.totalWorkingDays,
        presentDays: att.presentDays,
        records: att.records,
      };
    });
    await Attendance.insertMany(attDocs);

    // 4. Prepare Escalation Docs
    await Escalation.insertMany(memoryStore.escalations);

    // 5. Prepare Timetable Docs
    const timetableDocs = Object.values(memoryStore.timetables);
    await Timetable.insertMany(timetableDocs);

    console.log("✅ MongoDB seeding completed: jeevan, surya, yashwanth, akhil + 30 Students, 10 Classes & Timetables live!");
    return memoryStore;
  } catch (err) {
    console.error("Error during database seed:", err);
    return memoryStore;
  }
}
