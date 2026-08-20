// Enhanced Mock LLM with 11 languages, timetable resolution, clarification handling, and robust NLU

const MULTILINGUAL_TEMPLATES = {
  en: {
    greeting: "Hello! I'm XYZ, your AI school assistant. How can I help you today?",
    own_attendance: (name, pct) => `Hello ${name}! Your overall attendance stands at **${pct}%**. Keep up the great consistency! Would you like to check your attendance for specific dates?`,
    child_attendance: (name, pct) => `**${name}** currently has **${pct}%** attendance. Let me know if you would like recent daily records or to speak with their class teacher.`,
    mark_success: (name, date, status, pct) => `✅ Attendance successfully marked: **${name}** is marked **${status.toUpperCase()}** for **${date}**. Updated attendance percentage is **${pct}%**.`,
    analytics: (avg, breakdown) => `📊 **School-Wide Attendance Overview**\n- **Overall Average:** **${avg}%**\n\n**Class-Level Breakdown:**\n` + breakdown.map((c) => `• **${c.className}**: ${c.average}% (${c.studentCount} students)`).join("\n"),
    timetable: (className, day, periods) => {
      if (!periods || periods.length === 0) return `📅 No classes scheduled for **${className}** on **${day}**.`;
      return `📅 **Schedule for ${className} (${day}):**\n` + periods.map((p) => `• **Period ${p.periodNumber}** (${p.time}): **${p.subject}** (${p.teacherName || "Faculty"}, ${p.room || "Room"})`).join("\n");
    },
    teacher_timetable: (teacherName, day, periods) => {
      if (!periods || periods.length === 0) return `📅 No teaching sessions scheduled for **${teacherName}** on **${day}**.`;
      return `📅 **Teaching Schedule for ${teacherName} (${day}):**\n` + periods.map((p) => `• **Period ${p.periodNumber}** (${p.time}): **${p.subject}** in **${p.className || p.classId}** (${p.room || "Room"})`).join("\n");
    },
    escalate_ask: (target, reason) => `I understand your concern: *"${reason}"*.\n\nWould you like me to raise an official callback request to the **${target}**? Please reply **"Yes, proceed"** to confirm.`,
    escalate_done: (ticketId, target) => `✅ Your callback ticket (**#${ticketId}**) has been officially submitted to the **${target}**. They will get in touch with you shortly.`,
    clarify_student: "Which student would you like me to check? Please provide the student's name.",
    forbidden: "⚠️ Access Denied: Your account role does not have permission for this specific action.",
    general_fallback: "I'm your XYZ AI School Assistant. You can ask me to check attendance, view schedules & timetables, mark attendance, or escalate queries to teachers.",
  },
  hi: {
    greeting: "नमस्ते! मैं XYZ हूँ, आपका AI स्कूल सहायक। मैं आज आपकी क्या मदद कर सकता हूँ?",
    own_attendance: (name, pct) => `नमस्ते ${name}! आपकी कुल उपस्थिति **${pct}%** है। शानदार प्रदर्शन! क्या आप किसी विशेष तारीख का रिकॉर्ड देखना चाहते हैं?`,
    child_attendance: (name, pct) => `**${name}** की वर्तमान उपस्थिति **${pct}%** है। यदि आप शिक्षक से बात करना चाहते हैं तो मुझे बताएं।`,
    mark_success: (name, date, status, pct) => `✅ उपस्थिति दर्ज की गई: **${name}** को **${date}** के लिए **${status === "present" ? "उपस्थित" : "अनुपस्थित"}** चिह्नित किया गया है। अद्यतन उपस्थिति **${pct}%** है।`,
    analytics: (avg, breakdown) => `📊 **स्कूल उपस्थिति विश्लेषण**\n- **औसत उपस्थिति:** **${avg}%**\n\n` + breakdown.map((c) => `• **${c.className}**: ${c.average}%`).join("\n"),
    timetable: (className, day, periods) => `📅 **${className} की समय सारणी (${day}):**\n` + (periods || []).map((p) => `• **पीरियड ${p.periodNumber}** (${p.time}): **${p.subject}** (${p.teacherName})`).join("\n"),
    teacher_timetable: (teacherName, day, periods) => `📅 **${teacherName} का शिक्षण कार्यक्रम (${day}):**\n` + (periods || []).map((p) => `• **पीरियड ${p.periodNumber}** (${p.time}): **${p.subject}** (${p.className})`).join("\n"),
    escalate_ask: (target) => `क्या आप चाहते हैं कि मैं **${target === "teacher" ? "अध्यापक" : "प्रबंधन"}** से संपर्क करने के लिए अनुरोध दर्ज करूँ? कृपया पुष्टि के लिए **"हाँ"** कहें।`,
    escalate_done: (ticketId, target) => `✅ आपका अनुरोध टिकट (**#${ticketId}**) **${target === "teacher" ? "अध्यापक" : "प्रबंधन"}** को भेज दिया गया है।`,
    clarify_student: "आप किस छात्र की उपस्थिति देखना चाहते हैं? कृपया नाम बताएं।",
    forbidden: "⚠️ इस कार्रवाई के लिए आपके पास अनुमति नहीं है।",
    general_fallback: "मैं आपका AI स्कूल सहायक हूँ। आप मुझसे उपस्थिति जांचने, समय सारणी देखने या शिक्षक से संपर्क करने के लिए कह सकते हैं।",
  },
  ta: {
    greeting: "வணக்கம்! நான் XYZ, உங்கள் பள்ளி AI உதவியாளர். இன்று உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    own_attendance: (name, pct) => `வணக்கம் ${name}! உங்கள் ஒட்டுமொத்த வருகை **${pct}%** ஆகும்.`,
    child_attendance: (name, pct) => `**${name}** இன் தற்போதைய வருகை **${pct}%** ஆகும்.`,
    mark_success: (name, date, status, pct) => `✅ வருகை பதிவு செய்யப்பட்டது: **${name}** - **${status}** (${date}). புதுப்பிக்கப்பட்ட வருகை: **${pct}%**.`,
    analytics: (avg, breakdown) => `📊 **பள்ளி வருகை பகுப்பாய்வு**: சராசரி **${avg}%**\n` + breakdown.map((c) => `• **${c.className}**: ${c.average}%`).join("\n"),
    timetable: (className, day, periods) => `📅 **${className} பாடவேளை அட்டவணை (${day}):**\n` + (periods || []).map((p) => `• **காலம் ${p.periodNumber}**: **${p.subject}** (${p.teacherName})`).join("\n"),
    teacher_timetable: (teacherName, day, periods) => `📅 **${teacherName} கற்பித்தல் அட்டவணை (${day}):**\n` + (periods || []).map((p) => `• **காலம் ${p.periodNumber}**: **${p.subject}** (${p.className})`).join("\n"),
    escalate_ask: (target) => `நான் **${target}** உடன் தொடர்பு கொள்ள டிக்கெட் பதிவு செய்ய வேண்டுமா? தயவுசெய்து **"ஆம்"** என உறுதிப்படுத்தவும்.`,
    escalate_done: (ticketId) => `✅ உங்கள் கோரிக்கை எண் (**#${ticketId}**) வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.`,
    clarify_student: "எந்த மாணவரின் வருகையை சரிபார்க்க விரும்புகிறீர்கள்?",
    forbidden: "⚠️ இந்த செயலைச் செய்ய உங்களுக்கு அனுமதி இல்லை.",
    general_fallback: "நான் உங்கள் AI பள்ளி உதவியாளர்.",
  },
  te: {
    greeting: "నమస్కారం! నేను XYZ, మీ స్కూల్ AI అసిస్టెంట్. నేను మీకు ఎలా సహాయపడగలను?",
    own_attendance: (name, pct) => `నమస్కారం ${name}! మీ మొత్తం హాజరు **${pct}%**.`,
    child_attendance: (name, pct) => `**${name}** ప్రస్తుత హాజరు **${pct}%**.`,
    mark_success: (name, date, status, pct) => `✅ హాజరు నమోదు చేయబడింది: **${name}** **${status}** (**${date}**). ప్రస్తుత హాజరు: **${pct}%**.`,
    analytics: (avg, breakdown) => `📊 **స్కూల్ హాజరు వివరాలు**: సగటు **${avg}%**\n` + breakdown.map((c) => `• **${c.className}**: ${c.average}%`).join("\n"),
    timetable: (className, day, periods) => `📅 **${className} టైమ్‌టేబుల్ (${day}):**\n` + (periods || []).map((p) => `• **పీరియడ్ ${p.periodNumber}**: **${p.subject}** (${p.teacherName})`).join("\n"),
    teacher_timetable: (teacherName, day, periods) => `📅 **${teacherName} టైమ్‌టేబుల్ (${day}):**\n` + (periods || []).map((p) => `• **పీరియడ్ ${p.periodNumber}**: **${p.subject}** (${p.className})`).join("\n"),
    escalate_ask: (target) => `మీరు **${target}**తో మాట్లాడటానికి రిక్వెస్ట్ పంపించమంటారా? దయచేసి **"అవును"** అని చెప్పండి.`,
    escalate_done: (ticketId) => `✅ మీ టికెట్ (**#${ticketId}**) విజయవంతంగా నమోదు చేయబడింది.`,
    clarify_student: "మీరు ఏ విద్యార్థి హాజరు చూడాలనుకుంటున్నారు?",
    forbidden: "⚠️ ఈ చర్య చేయడానికి మీకు అనుమతి లేదు.",
    general_fallback: "నేను మీ AI స్కూల్ అసిస్టెంట్.",
  },
};

export function createMockLLM() {
  return {
    async understand(message, userRole, session) {
      const msg = message.trim().toLowerCase();
      const lang = session.language || "en";

      // 1. Confirm pending escalation
      if (session.state?.pendingEscalation && /^(yes|yeah|sure|confirm|proceed|ok|okay|please|haa|haan|aam|avunu)/i.test(msg)) {
        return {
          intent: "confirm_escalation",
          entities: session.state.pendingEscalation,
          needsClarification: false,
        };
      }

      // 2. Escalation triggers
      if (
        /talk.to.teacher|speak.to.teacher|contact.teacher|call.teacher|connect.with.teacher/i.test(msg) ||
        /talk.to.management|principal|complaint|not.satisfied|helpdesk|issue/i.test(msg)
      ) {
        const targetRole = /management|principal/i.test(msg) ? "management" : "teacher";
        return {
          intent: "escalate",
          entities: { targetRole, reason: message },
          needsClarification: false,
        };
      }

      // 3. Timetable / Schedule queries
      if (/timetable|time.table|schedule|routine|classes|period|periods|what class|which class|next class|समय सारणी/i.test(msg)) {
        let day = "today";
        if (/monday/i.test(msg)) day = "Monday";
        else if (/tuesday/i.test(msg)) day = "Tuesday";
        else if (/wednesday/i.test(msg)) day = "Wednesday";
        else if (/thursday/i.test(msg)) day = "Thursday";
        else if (/friday/i.test(msg)) day = "Friday";

        let targetClass = null;
        const classMatch = msg.match(/class\s*([1-5][a-b]?)/i);
        if (classMatch) targetClass = `c${classMatch[1].toLowerCase()}`;

        return {
          intent: "get_timetable",
          entities: { day, targetClass },
          needsClarification: false,
        };
      }

      // 4. Mark attendance (Teacher)
      if (/mark|present|absent/i.test(msg) && userRole === "teacher") {
        let studentName = null;
        const nameMatch = msg.match(/\b(jeevan|aarav|diya|vivaan|ananya|kabir|saanvi|aditya|ishita|rohan)\b/i);
        if (nameMatch) studentName = nameMatch[1];

        const status = /absent/i.test(msg) ? "absent" : "present";
        const date = /yesterday/i.test(msg) ? "yesterday" : /tomorrow/i.test(msg) ? "tomorrow" : "today";

        if (!studentName) {
          return {
            intent: "mark_attendance",
            entities: { status, date },
            needsClarification: true,
            clarificationMessage: MULTILINGUAL_TEMPLATES[lang]?.clarify_student || MULTILINGUAL_TEMPLATES.en.clarify_student,
          };
        }

        return {
          intent: "mark_attendance",
          entities: { studentName, status, date },
          needsClarification: false,
        };
      }

      // 5. Student check own attendance
      if (userRole === "student" && (/my\s*(attendance|percentage|records|status)/i.test(msg) || /attendance/i.test(msg) || /उपस्थिति/i.test(msg))) {
        return {
          intent: "get_own_attendance",
          entities: {},
          needsClarification: false,
        };
      }

      // 6. Parent check child attendance
      if (userRole === "parent") {
        let studentName = null;
        const nameMatch = msg.match(/\b(jeevan|aarav|diya|vivaan|ananya|kabir|saanvi|aditya|ishita|rohan)\b/i);
        if (nameMatch) studentName = nameMatch[1];

        if (studentName || /attendance|percentage|child|son|daughter|kid/i.test(msg)) {
          return {
            intent: "get_child_attendance",
            entities: { studentName: studentName || "jeevan" },
            needsClarification: false,
          };
        }
      }

      // 7. Principal Analytics
      if (userRole === "principal" && (/analytics|overall|school|average|stats|breakdown|attendance/i.test(msg) || /विश्लेषण/i.test(msg))) {
        return {
          intent: "get_school_attendance_analytics",
          entities: {},
          needsClarification: false,
        };
      }

      // 8. General query / greetings
      if (/hi|hello|hey|namaste|vanakkam|good\s*(morning|afternoon|evening)/i.test(msg)) {
        const templates = MULTILINGUAL_TEMPLATES[lang] || MULTILINGUAL_TEMPLATES.en;
        return {
          intent: "general_query",
          entities: {},
          needsClarification: false,
          directResponse: templates.greeting,
        };
      }

      const templates = MULTILINGUAL_TEMPLATES[lang] || MULTILINGUAL_TEMPLATES.en;
      return {
        intent: "general_query",
        entities: {},
        needsClarification: false,
        directResponse: templates.general_fallback,
      };
    },

    async generateNaturalReply(params) {
      return this.generateReply(params);
    },

    async generateReply({ userRole, language = "en", intent, toolResult, userProfile }) {
      const templates = MULTILINGUAL_TEMPLATES[language] || MULTILINGUAL_TEMPLATES.en;

      if (!toolResult) return templates.general_fallback;

      if (toolResult.error) {
        if (toolResult.error === "forbidden") return templates.forbidden;
        return `⚠️ ${toolResult.message || toolResult.error}`;
      }

      switch (intent) {
        case "get_own_attendance":
          return templates.own_attendance(toolResult.name || userProfile?.name || "Student", toolResult.percentage);

        case "get_child_attendance":
          return templates.child_attendance(toolResult.name || "Student", toolResult.percentage);

        case "mark_attendance":
          return templates.mark_success(
            toolResult.record?.studentName || toolResult.record?.studentId || "Student",
            toolResult.record?.date || "today",
            toolResult.record?.status || "present",
            toolResult.record?.percentage || "100"
          );

        case "get_school_attendance_analytics":
          return templates.analytics(toolResult.schoolAvg, toolResult.classBreakdown || []);

        case "get_timetable":
          if (toolResult.role === "teacher") {
            return templates.teacher_timetable(toolResult.teacherName || "Teacher", toolResult.day, toolResult.periods);
          }
          return templates.timetable(toolResult.className || "Class", toolResult.day, toolResult.periods);

        case "escalate":
          return templates.escalate_ask(toolResult.targetRole || "teacher", toolResult.reason || "attendance concern");

        case "confirm_escalation":
          return templates.escalate_done(toolResult.ticketId || "1001", toolResult.targetRole || "teacher");

        default:
          return templates.general_fallback;
      }
    },
  };
}
