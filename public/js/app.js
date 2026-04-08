(function () {
  const STORAGE_KEY = "civicpulse-store-v1";
  const SESSION_KEY = "civicpulse-session-v1";
  const SIGNAL_KEY = "civicpulse-signal-v1";
  const CHANNEL_NAME = "civicpulse-sync";
  const listeners = new Set();
  const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL_NAME) : null;
  const geoData = window.ChhattisgarhData || { districts: [], officersByDepartment: {}, wardDistrictMap: {}, stateBounds: { north: 24.6, south: 17.8, east: 84.5, west: 80.2 }, defaultDistrict: "Raipur" };
  const districtDirectory = geoData.districts || [];
  const districtLookup = districtDirectory.reduce(function (lookup, district) {
    lookup[district.name] = district;
    (district.aliases || []).forEach(function (alias) {
      lookup[alias] = district;
    });
    return lookup;
  }, {});
  const wardDistrictMap = geoData.wardDistrictMap || {};

  const constants = {
    wards: ["Ward 1", "Ward 2", "Ward 3", "Ward 4", "Ward 5", "Ward 6", "Ward 7", "Ward 8"],
    districts: districtDirectory.map(function (district) {
      return district.name;
    }),
    voiceLanguages: [
      { value: "en-IN", label: "English" },
      { value: "hi-IN", label: "Hindi" },
      { value: "bn-IN", label: "Bengali" },
      { value: "ta-IN", label: "Tamil" },
      { value: "te-IN", label: "Telugu" },
      { value: "mr-IN", label: "Marathi" }
    ],
    statuses: [
      { value: "all", label: "All statuses" },
      { value: "open", label: "Open" },
      { value: "in_progress", label: "In Progress" },
      { value: "resolved", label: "Resolved" },
      { value: "escalated", label: "Escalated" }
    ],
    categories: ["Water", "Roads", "Electricity", "Sanitation", "Safety"],
    priorityLevels: ["all", "low", "medium", "high", "critical"],
    departments: [
      "Water Board",
      "Roads & Works",
      "Electricity Cell",
      "Sanitation Department",
      "Public Safety Cell"
    ]
  };

  const departmentByCategory = {
    Water: "Water Board",
    Roads: "Roads & Works",
    Electricity: "Electricity Cell",
    Sanitation: "Sanitation Department",
    Safety: "Public Safety Cell"
  };

  const officerDirectory = geoData.officersByDepartment || {
    "Water Board": [{ name: "Asha Nair" }, { name: "Rahul Singh" }],
    "Roads & Works": [{ name: "Karan Menon" }, { name: "Ishita Paul" }],
    "Electricity Cell": [{ name: "Neha Kapoor" }, { name: "Aditya Jain" }],
    "Sanitation Department": [{ name: "Deepa Joseph" }, { name: "Farhan Ali" }],
    "Public Safety Cell": [{ name: "Vikram Rao" }, { name: "Nisha Das" }]
  };

  const publicServiceDirectory = {
    documentServices: [
      {
        title: "Chhattisgarh Public Health Engineering Department",
        service: "Water Bill / Connection",
        area: "Utility Service"
      },
      {
        title: "e-District Chhattisgarh",
        service: "Birth / Domicile / Income Certificates",
        area: "Citizen Documents"
      },
      {
        title: "Urban Administration and Development",
        service: "Municipal Tax / Street / Cleanliness",
        area: "Urban Service"
      },
      {
        title: "Women and Child Development Department",
        service: "Women Safety / Child Protection",
        area: "Priority Support"
      }
    ],
    topDepartments: [
      {
        title: "Revenue and Disaster Management",
        summary: "Land records, district advisories, and emergency field coordination."
      },
      {
        title: "Health and Family Welfare",
        summary: "Ayushman guidance, ambulance linkage, and urgent health-response support."
      },
      {
        title: "Social Welfare Department",
        summary: "Pension, elder support, welfare checks, and district care services."
      }
    ]
  };

  const complaintTemplates = [
    {
      id: "road_damage",
      title: "Road damage / pothole",
      issueDesk: "general",
      category: "Roads",
      mode: "image",
      description: "Large pothole is causing traffic slowdown and safety risk for commuters.",
      hint: "Add nearby landmark, school, bus stop, or hospital if public risk is high."
    },
    {
      id: "water_leakage",
      title: "Water leakage",
      issueDesk: "general",
      category: "Water",
      mode: "image",
      description: "Continuous water leakage is wasting supply and making the road slippery.",
      hint: "Mention if the leak is near a school route, market road, or hospital."
    },
    {
      id: "harassment",
      title: "Harassment / abuse",
      issueDesk: "women",
      category: "Safety",
      mode: "emergency",
      description: "I need urgent help for harassment, abuse, or threat to personal safety.",
      hint: "Use women or men section based on who needs support."
    },
    {
      id: "elder_emergency",
      title: "Senior citizen emergency",
      issueDesk: "elder",
      category: "Safety",
      mode: "emergency",
      description: "Senior citizen living alone needs urgent medical or welfare check support.",
      hint: "Mention if the person is above 70, alone, injured, or not responding."
    }
  ];

  const supportContacts = {
    women: {
      title: "Chhattisgarh State Commission for Women",
      tollFree: "1800-233-4299",
      phone: "0771-2429977",
      email: "complaint@cgmahilaayog.com",
      supportWindowHours: 1,
      issues: [
        "Domestic violence",
        "Dowry harassment",
        "Sexual harassment or assault",
        "Mental or physical abuse"
      ]
    },
    men: {
      title: "Citizen Safety Support Desk",
      tollFree: "1800-233-1919",
      phone: "0771-2331199",
      email: "citizensafety@navdristi.demo",
      supportWindowHours: 6,
      issues: [
        "Physical assault",
        "Blackmail or extortion",
        "Threats or intimidation",
        "Mental distress and abuse"
      ]
    },
    child: {
      title: "Child Rescue and Protection Desk",
      tollFree: "1098",
      phone: "1098",
      email: "childsupport@navdristi.demo",
      supportWindowHours: 1,
      issues: [
        "Missing child alert",
        "Child rescue request",
        "Child abuse or exploitation",
        "Immediate child protection emergency"
      ]
    },
    elder: {
      title: "Senior Emergency and Welfare Desk",
      tollFree: "1800-233-7070",
      phone: "0771-2707070",
      email: "eldercare@navdristi.demo",
      supportWindowHours: 1,
      issues: [
        "Living alone welfare check",
        "Medical distress",
        "Fall or injury emergency",
        "Threat or abuse against senior citizen"
      ]
    }
  };

  const superiorDirectory = {
    "Water Board": { name: "Chief Water Operations Officer", email: "water.superior@navdristi.demo" },
    "Roads & Works": { name: "Superintending Engineer Roads", email: "roads.superior@navdristi.demo" },
    "Electricity Cell": { name: "Regional Power Control Head", email: "electricity.superior@navdristi.demo" },
    "Sanitation Department": { name: "Chief Sanitation Officer", email: "sanitation.superior@navdristi.demo" },
    "Public Safety Cell": { name: "District Safety Commissioner", email: "safety.superior@navdristi.demo" }
  };

  function getOfficerName(department, index) {
    const roster = officerDirectory[department] || [];
    const officer = roster[index || 0];
    if (!officer) {
      return "Unassigned officer";
    }
    return typeof officer === "string" ? officer : officer.name;
  }

  function resolveDistrictName(input) {
    if (input && input.district && districtLookup[input.district]) {
      return input.district;
    }
    if (input && input.ward && wardDistrictMap[input.ward]) {
      return wardDistrictMap[input.ward];
    }
    if (input && input.location) {
      const match = districtDirectory.find(function (district) {
        return String(input.location).toLowerCase().indexOf(district.name.toLowerCase()) !== -1;
      });
      if (match) {
        return match.name;
      }
    }
    return geoData.defaultDistrict || "Raipur";
  }

  function getDistrictMeta(districtName) {
    return districtLookup[districtName] || districtLookup[geoData.defaultDistrict] || null;
  }

  function getRoadName(input) {
    if (input && input.roadName) {
      return String(input.roadName).trim();
    }
    if (input && input.location) {
      return String(input.location).split(",")[0].trim();
    }
    const district = getDistrictMeta(resolveDistrictName(input));
    return district && district.roads && district.roads.length ? district.roads[0] : "Main Road";
  }

  function getMapPositionFromDistrict(districtName) {
    const district = getDistrictMeta(districtName);
    if (!district) {
      return { x: 50, y: 50, lat: 21.25, lng: 81.63 };
    }

    const latRange = geoData.stateBounds.north - geoData.stateBounds.south;
    const lngRange = geoData.stateBounds.east - geoData.stateBounds.west;
    const y = 90 - (((district.lat - geoData.stateBounds.south) / latRange) * 76);
    const x = 10 + (((district.lng - geoData.stateBounds.west) / lngRange) * 78);

    return {
      x: clamp(Math.round(x), 8, 92),
      y: clamp(Math.round(y), 10, 90),
      lat: district.lat,
      lng: district.lng
    };
  }

  function getSupportDeskConfig(issueDesk) {
    if (issueDesk === "women") {
      return supportContacts.women;
    }
    if (issueDesk === "men") {
      return supportContacts.men;
    }
    if (issueDesk === "child") {
      return supportContacts.child;
    }
    if (issueDesk === "elder") {
      return supportContacts.elder;
    }
    return null;
  }

  const wardMapCoordinates = {
    "Ward 1": { x: 41, y: 18 },
    "Ward 2": { x: 59, y: 24 },
    "Ward 3": { x: 70, y: 38 },
    "Ward 4": { x: 49, y: 45 },
    "Ward 5": { x: 43, y: 57 },
    "Ward 6": { x: 63, y: 60 },
    "Ward 7": { x: 35, y: 73 },
    "Ward 8": { x: 57, y: 81 }
  };

  const categoryKeywords = {
    Water: ["water", "leak", "pipeline", "pipe", "drain", "overflow", "sewer", "flood", "tap", "supply"],
    Roads: ["road", "pothole", "street", "pavement", "bridge", "traffic", "crack", "asphalt", "bus stand"],
    Electricity: ["electricity", "power", "transformer", "wire", "streetlight", "light", "outage", "voltage", "sparking"],
    Sanitation: ["garbage", "waste", "trash", "cleaning", "sanitation", "dump", "mosquito", "dirty", "smell"],
    Safety: ["smoke", "fire", "unsafe", "danger", "illegal", "accident", "school", "hospital", "security", "hazard"]
  };

  const urgentSignals = ["urgent", "danger", "immediately", "asap", "children", "school", "hospital", "unsafe", "flood", "sparking", "fire", "blocked"];
  const angrySignals = ["angry", "worst", "ignored", "frustrated", "tired", "delay", "disgusting", "annoyed", "bad", "smell"];
  const fearSignals = ["help", "fear", "scared", "accident", "dark", "unsafe", "smoke", "fire", "sparking", "shock", "risk"];
  const sadnessSignals = ["suffering", "problem", "unable", "days", "waiting", "pain", "difficult"];
  const civicPredictions = [
    {
      id: "water-cluster",
      title: "Waterlogging surge risk",
      match: ["water", "drain", "flood", "overflow", "leak"],
      recommendation: "Pre-position pumps and drainage teams in repeat wards before the next spike."
    },
    {
      id: "lighting-safety",
      title: "Night safety outage risk",
      match: ["streetlight", "light", "dark", "electricity", "wire"],
      recommendation: "Run an evening lighting sweep around schools, bus stops, and hospital roads."
    },
    {
      id: "sanitation-health",
      title: "Sanitation health risk",
      match: ["garbage", "waste", "smell", "mosquito", "dump"],
      recommendation: "Increase pickup frequency and health inspections in crowded market stretches."
    }
  ];

  const seedTemplate = {
    users: [
      {
        id: "USR-001",
        name: "Riya Sharma",
        email: "general@navdristi.in",
        password: "NavDristi@123",
        role: "citizen",
        citizenType: "general",
        district: "Raipur",
        ward: "Ward 5",
        phone: "+91 90000 11111"
      },
      {
        id: "USR-002",
        name: "Arjun Verma",
        email: "arjun@navdristi.demo",
        password: "demo123",
        role: "citizen",
        citizenType: "general",
        district: "Raipur",
        ward: "Ward 2",
        phone: "+91 90000 22222"
      },
      {
        id: "USR-004",
        name: "Nandini Sahu",
        email: "women@navdristi.in",
        password: "NavDristi@123",
        role: "citizen",
        citizenType: "women",
        district: "Raipur",
        ward: "Ward 5",
        phone: "+91 90000 44444"
      },
      {
        id: "USR-005",
        name: "Rohit Netam",
        email: "male@navdristi.in",
        password: "NavDristi@123",
        role: "citizen",
        citizenType: "men",
        district: "Bilaspur",
        ward: "Ward 1",
        phone: "+91 90000 55555"
      },
      {
        id: "USR-006",
        name: "Kamla Devi",
        email: "elder@navdristi.in",
        password: "NavDristi@123",
        role: "citizen",
        citizenType: "elder",
        district: "Raipur",
        ward: "Ward 8",
        phone: "+91 90000 66666"
      },
      {
        id: "USR-003",
        name: "Maya Iyer",
        email: "admin@navdristi.in",
        password: "NavDristi@123",
        role: "admin",
        department: "City Command Center",
        district: "Chhattisgarh",
        ward: "All Wards"
      }
    ],
    complaints: [
      {
        id: "CMP-1001",
        title: "Major water leakage near Rose Lane",
        description: "A large underground pipe seems to be leaking near Rose Lane in Ward 5. Water has been flowing since early morning and the road is becoming slippery for school children.",
        location: "VIP Road, Telibandha, Raipur",
        district: "Raipur",
        roadName: "VIP Road",
        ward: "Ward 5",
        citizenId: "USR-001",
        category: "Water",
        sentiment: "Urgent",
        priorityScore: 92,
        priorityLabel: "Critical",
        department: "Water Board",
        assignedOfficer: "Asha Nair",
        status: "in_progress",
        createdAt: "2026-03-20T09:10:00+05:30",
        updatedAt: "2026-03-21T16:15:00+05:30",
        resolvedAt: null,
        summary: "Likely underground pipe leakage causing water loss and public safety risk near a school route in Ward 5.",
        aiReply: "Water Board crew has been mobilized. Temporary barricading and leak inspection are underway.",
        tags: ["water-loss", "public-safety", "school-route"],
        supportVotes: ["USR-002"],
        duplicateOf: null,
        duplicateCandidates: [{ id: "CMP-1006", score: 0.74 }],
        messages: [
          {
            id: "MSG-1001",
            senderId: "USR-001",
            senderRole: "citizen",
            senderName: "Riya Sharma",
            text: "Please treat this as urgent. Children are slipping while crossing.",
            createdAt: "2026-03-20T09:18:00+05:30"
          },
          {
            id: "MSG-1002",
            senderId: "USR-003",
            senderRole: "admin",
            senderName: "Maya Iyer",
            text: "Team has been informed and the site is being verified by the ward officer.",
            createdAt: "2026-03-20T09:45:00+05:30"
          }
        ],
        timeline: [
          {
            id: "TL-1001",
            title: "Complaint submitted",
            note: "Citizen reported active leakage with safety concern.",
            createdAt: "2026-03-20T09:10:00+05:30"
          },
          {
            id: "TL-1002",
            title: "AI classified as Water / Critical",
            note: "Priority boosted due to school-route safety signal and duplicate pattern.",
            createdAt: "2026-03-20T09:10:20+05:30"
          },
          {
            id: "TL-1003",
            title: "Assigned to Water Board",
            note: "Officer Asha Nair is coordinating response.",
            createdAt: "2026-03-20T09:42:00+05:30"
          }
        ],
        imageData: ""
      },
      {
        id: "CMP-1002",
        title: "Streetlights out near public school",
        description: "The full stretch of streetlights near Greenfield Public School is not working. It is very dark and unsafe for students returning after evening classes.",
        location: "GE Road near public school, Raipur",
        district: "Raipur",
        roadName: "GE Road",
        ward: "Ward 2",
        citizenId: "USR-002",
        category: "Electricity",
        sentiment: "Urgent",
        priorityScore: 84,
        priorityLabel: "High",
        department: "Electricity Cell",
        assignedOfficer: "Neha Kapoor",
        status: "open",
        createdAt: "2026-03-21T18:35:00+05:30",
        updatedAt: "2026-03-21T18:35:00+05:30",
        resolvedAt: null,
        summary: "Streetlight outage on a school access road creates a public safety risk after dark.",
        aiReply: "Electricity Cell inspection recommended within the next service window due to safety context.",
        tags: ["streetlight", "student-safety"],
        supportVotes: ["USR-001"],
        duplicateOf: null,
        duplicateCandidates: [],
        messages: [
          {
            id: "MSG-1003",
            senderId: "USR-002",
            senderRole: "citizen",
            senderName: "Arjun Verma",
            text: "Please fix this before tomorrow evening. The whole lane is dark.",
            createdAt: "2026-03-21T18:37:00+05:30"
          }
        ],
        timeline: [
          {
            id: "TL-1004",
            title: "Complaint submitted",
            note: "Citizen flagged lighting outage near school zone.",
            createdAt: "2026-03-21T18:35:00+05:30"
          },
          {
            id: "TL-1005",
            title: "AI classified as Electricity / High",
            note: "Safety wording increased priority score.",
            createdAt: "2026-03-21T18:35:12+05:30"
          }
        ],
        imageData: ""
      },
      {
        id: "CMP-1003",
        title: "Deep pothole near central bus stand",
        description: "There is a deep pothole right at the bus stand turn in Ward 4. Two-wheelers are swerving hard and the condition keeps getting worse.",
        location: "TP Nagar Road near bus stand, Korba",
        district: "Korba",
        roadName: "TP Nagar Road",
        ward: "Ward 4",
        citizenId: "USR-001",
        category: "Roads",
        sentiment: "Angry",
        priorityScore: 68,
        priorityLabel: "Medium",
        department: "Roads & Works",
        assignedOfficer: "Karan Menon",
        status: "resolved",
        createdAt: "2026-03-17T11:15:00+05:30",
        updatedAt: "2026-03-19T15:10:00+05:30",
        resolvedAt: "2026-03-19T15:10:00+05:30",
        summary: "Road surface damage at a heavy-traffic turn presented moderate accident risk.",
        aiReply: "Temporary patching completed. Permanent resurfacing is scheduled in the next road cycle.",
        tags: ["road-damage", "bus-route"],
        supportVotes: [],
        duplicateOf: null,
        duplicateCandidates: [],
        messages: [
          {
            id: "MSG-1004",
            senderId: "USR-003",
            senderRole: "admin",
            senderName: "Maya Iyer",
            text: "The pothole has been patched and the road team has marked it for resurfacing.",
            createdAt: "2026-03-19T15:12:00+05:30"
          }
        ],
        timeline: [
          {
            id: "TL-1006",
            title: "Complaint submitted",
            note: "Citizen reported deep pothole near transit point.",
            createdAt: "2026-03-17T11:15:00+05:30"
          },
          {
            id: "TL-1007",
            title: "Assigned to Roads & Works",
            note: "Response scheduled in patchwork queue.",
            createdAt: "2026-03-18T09:05:00+05:30"
          },
          {
            id: "TL-1008",
            title: "Resolved",
            note: "Pothole patched and site reopened for traffic.",
            createdAt: "2026-03-19T15:10:00+05:30"
          }
        ],
        imageData: ""
      },
      {
        id: "CMP-1004",
        title: "Garbage pile causing foul smell near market",
        description: "Garbage has not been cleared for two days behind the main market in Ward 3. The smell is getting worse and flies are spreading around the shops.",
        location: "Station Road market lane, Durg",
        district: "Durg",
        roadName: "Station Road Durg",
        ward: "Ward 3",
        citizenId: "USR-002",
        category: "Sanitation",
        sentiment: "Angry",
        priorityScore: 63,
        priorityLabel: "Medium",
        department: "Sanitation Department",
        assignedOfficer: "Deepa Joseph",
        status: "in_progress",
        createdAt: "2026-03-19T14:25:00+05:30",
        updatedAt: "2026-03-21T08:05:00+05:30",
        resolvedAt: null,
        summary: "Waste backlog behind market is creating hygiene and business-impact issues in Ward 3.",
        aiReply: "Sanitation pickup is recommended within 12 hours to avoid escalation into a hygiene cluster.",
        tags: ["waste", "market", "hygiene"],
        supportVotes: ["USR-001"],
        duplicateOf: null,
        duplicateCandidates: [],
        messages: [
          {
            id: "MSG-1005",
            senderId: "USR-003",
            senderRole: "admin",
            senderName: "Maya Iyer",
            text: "The sanitation vehicle has been assigned for the next pickup cycle.",
            createdAt: "2026-03-20T07:30:00+05:30"
          }
        ],
        timeline: [
          {
            id: "TL-1009",
            title: "Complaint submitted",
            note: "Garbage accumulation reported near retail zone.",
            createdAt: "2026-03-19T14:25:00+05:30"
          },
          {
            id: "TL-1010",
            title: "Assigned to Sanitation Department",
            note: "Area added to next morning clearance route.",
            createdAt: "2026-03-20T07:25:00+05:30"
          }
        ],
        imageData: ""
      },
      {
        id: "CMP-1005",
        title: "Illegal burning smoke near housing block",
        description: "Someone is burning waste near the East Residency wall in Ward 6. Thick smoke is entering nearby homes and people are worried about breathing problems.",
        location: "Jagdalpur-Naidupeta Road, Bastar",
        district: "Bastar",
        roadName: "Jagdalpur-Naidupeta Road",
        ward: "Ward 6",
        citizenId: "USR-001",
        category: "Safety",
        sentiment: "Urgent",
        priorityScore: 88,
        priorityLabel: "High",
        department: "Public Safety Cell",
        assignedOfficer: "Vikram Rao",
        status: "escalated",
        createdAt: "2026-03-21T06:40:00+05:30",
        updatedAt: "2026-03-21T10:20:00+05:30",
        resolvedAt: null,
        summary: "Open waste burning is causing smoke exposure for residents and needs coordinated enforcement.",
        aiReply: "Escalation recommended to safety and sanitation teams because the issue impacts public health.",
        tags: ["smoke", "health-risk", "waste-burning"],
        supportVotes: ["USR-002"],
        duplicateOf: null,
        duplicateCandidates: [],
        messages: [
          {
            id: "MSG-1006",
            senderId: "USR-001",
            senderRole: "citizen",
            senderName: "Riya Sharma",
            text: "The smoke is getting worse this morning. Elderly residents are affected.",
            createdAt: "2026-03-21T06:45:00+05:30"
          },
          {
            id: "MSG-1007",
            senderId: "USR-003",
            senderRole: "admin",
            senderName: "Maya Iyer",
            text: "This has been escalated to the ward safety and sanitation teams for immediate field action.",
            createdAt: "2026-03-21T10:20:00+05:30"
          }
        ],
        timeline: [
          {
            id: "TL-1011",
            title: "Complaint submitted",
            note: "Citizen reported smoke from suspected waste burning.",
            createdAt: "2026-03-21T06:40:00+05:30"
          },
          {
            id: "TL-1012",
            title: "Escalated",
            note: "Marked high-risk due to health exposure and repeat pattern.",
            createdAt: "2026-03-21T10:20:00+05:30"
          }
        ],
        imageData: ""
      },
      {
        id: "CMP-1006",
        title: "Drain overflow causing waterlogging",
        description: "There is heavy overflow from the roadside drain near Rose Lane in Ward 5. It looks very similar to the pipe leakage complaint already reported and the road is getting flooded.",
        location: "Telibandha Main Road service lane, Raipur",
        district: "Raipur",
        roadName: "Telibandha Main Road",
        ward: "Ward 5",
        citizenId: "USR-001",
        category: "Water",
        sentiment: "Urgent",
        priorityScore: 79,
        priorityLabel: "High",
        department: "Water Board",
        assignedOfficer: "Rahul Singh",
        status: "open",
        createdAt: "2026-03-21T07:55:00+05:30",
        updatedAt: "2026-03-21T07:55:00+05:30",
        resolvedAt: null,
        summary: "Possible linked drainage overflow around the same Ward 5 leak cluster suggests a growing infrastructure issue.",
        aiReply: "Duplicate review suggested because the issue strongly resembles the existing Rose Lane leakage complaint.",
        tags: ["waterlogging", "duplicate-cluster"],
        supportVotes: [],
        duplicateOf: "CMP-1001",
        duplicateCandidates: [{ id: "CMP-1001", score: 0.74 }],
        messages: [],
        timeline: [
          {
            id: "TL-1013",
            title: "Complaint submitted",
            note: "Citizen reported likely connected drain overflow.",
            createdAt: "2026-03-21T07:55:00+05:30"
          },
          {
            id: "TL-1014",
            title: "AI linked duplicate",
            note: "Similarity with complaint CMP-1001 exceeded duplicate threshold.",
            createdAt: "2026-03-21T07:55:10+05:30"
          }
        ],
        imageData: ""
      },
      {
        id: "CMP-1007",
        title: "Women harassment alert near coaching lane",
        description: "A woman reported repeated stalking and verbal harassment near the evening coaching lane close to GE Road. The citizen asked for immediate intervention because the route is used daily after dark.",
        location: "GE Road coaching lane, Raipur",
        district: "Raipur",
        roadName: "GE Road",
        ward: "Ward 2",
        citizenId: "USR-004",
        issueDesk: "women",
        category: "Safety",
        sentiment: "Urgent",
        priorityScore: 95,
        priorityLabel: "Critical",
        department: "Public Safety Cell",
        assignedOfficer: "Kriti Sharma",
        status: "escalated",
        createdAt: "2026-03-22T19:10:00+05:30",
        updatedAt: "2026-03-22T20:05:00+05:30",
        resolvedAt: null,
        summary: "Women safety complaint on an evening route triggered red-alert escalation and superior visibility.",
        aiReply: "Women safety desk routed the case to Public Safety Cell with 1-hour escalation and patrol recommendation.",
        tags: ["women-safety", "stalking", "night-route"],
        supportVotes: ["USR-001", "USR-002"],
        duplicateOf: null,
        duplicateCandidates: [],
        supportDeskTitle: "Chhattisgarh State Commission for Women",
        supportDeskWindowHours: 1,
        escalationWindowHours: 1,
        messages: [
          {
            id: "MSG-1008",
            senderId: "USR-004",
            senderRole: "citizen",
            senderName: "Nandini Sahu",
            text: "Please respond quickly. This route is unsafe after coaching hours.",
            createdAt: "2026-03-22T19:14:00+05:30"
          },
          {
            id: "MSG-1009",
            senderId: "USR-003",
            senderRole: "admin",
            senderName: "Maya Iyer",
            text: "Women safety patrol has been activated and the superior desk has visibility on this case.",
            createdAt: "2026-03-22T20:05:00+05:30"
          }
        ],
        timeline: [
          {
            id: "TL-1015",
            title: "Complaint submitted",
            note: "Women support user flagged harassment on a repeated evening route.",
            createdAt: "2026-03-22T19:10:00+05:30"
          },
          {
            id: "TL-1016",
            title: "AI classified as Safety / Critical",
            note: "Severity rose due to women support desk, distress wording, and dark-route risk near coaching centers.",
            createdAt: "2026-03-22T19:10:12+05:30"
          },
          {
            id: "TL-1017",
            title: "Superior escalation mail triggered",
            note: "Fast-track women desk automatically alerted the district superior contact within the 1-hour window.",
            createdAt: "2026-03-22T20:02:00+05:30"
          }
        ],
        imageData: ""
      },
      {
        id: "CMP-1008",
        title: "Elder welfare check after missed evening response",
        description: "An elderly resident living alone did not answer the daily welfare call and neighbors requested a check. The family is worried because the resident has a history of dizziness.",
        location: "VIP Road resident block, Raipur",
        district: "Raipur",
        roadName: "VIP Road",
        ward: "Ward 8",
        citizenId: "USR-006",
        issueDesk: "elder",
        category: "Safety",
        sentiment: "Urgent",
        priorityScore: 91,
        priorityLabel: "Critical",
        department: "Public Safety Cell",
        assignedOfficer: "Vikram Rao",
        status: "in_progress",
        createdAt: "2026-03-23T18:20:00+05:30",
        updatedAt: "2026-03-23T19:10:00+05:30",
        resolvedAt: null,
        summary: "Missed elder welfare response triggered emergency desk routing with neighbor and ambulance readiness.",
        aiReply: "Elder emergency desk recommended immediate welfare check, neighbor contact verification, and ambulance standby.",
        tags: ["elder", "welfare-check", "medical-risk"],
        supportVotes: ["USR-001"],
        duplicateOf: null,
        duplicateCandidates: [],
        supportDeskTitle: "Senior Emergency and Welfare Desk",
        supportDeskWindowHours: 1,
        escalationWindowHours: 1,
        messages: [
          {
            id: "MSG-1010",
            senderId: "USR-003",
            senderRole: "admin",
            senderName: "Maya Iyer",
            text: "Ward volunteer and emergency contact have been notified. Field verification is underway.",
            createdAt: "2026-03-23T18:55:00+05:30"
          }
        ],
        timeline: [
          {
            id: "TL-1018",
            title: "Complaint submitted",
            note: "Elder support complaint created after a missed living-alone welfare check.",
            createdAt: "2026-03-23T18:20:00+05:30"
          },
          {
            id: "TL-1019",
            title: "Neighbor escalation chain activated",
            note: "Neighbor contact, family member, and district desk were informed in sequence.",
            createdAt: "2026-03-23T18:35:00+05:30"
          },
          {
            id: "TL-1020",
            title: "Field action started",
            note: "Officer began welfare visit with ambulance standby kept ready.",
            createdAt: "2026-03-23T19:10:00+05:30"
          }
        ],
        imageData: ""
      },
      {
        id: "CMP-1009",
        title: "Missing child alert near bus stand market",
        description: "A child was reported missing near the evening market close to the bus stand. Family requested an urgent 1098-linked rescue alert with the child's last seen location and photo details.",
        location: "Bus stand market lane, Bilaspur",
        district: "Bilaspur",
        roadName: "Link Road Bilaspur",
        ward: "Ward 1",
        citizenId: "USR-001",
        issueDesk: "child",
        category: "Safety",
        sentiment: "Urgent",
        priorityScore: 97,
        priorityLabel: "Critical",
        department: "Public Safety Cell",
        assignedOfficer: "Nisha Das",
        status: "escalated",
        createdAt: "2026-03-24T17:40:00+05:30",
        updatedAt: "2026-03-24T18:05:00+05:30",
        resolvedAt: null,
        summary: "Missing child alert routed immediately to child rescue workflow and district safety coordination.",
        aiReply: "Child rescue desk linked this complaint to 1098 rapid action and district police coordination.",
        tags: ["child-rescue", "bus-stand", "urgent-search"],
        supportVotes: ["USR-002", "USR-004"],
        duplicateOf: null,
        duplicateCandidates: [],
        supportDeskTitle: "Child Rescue and Protection Desk",
        supportDeskWindowHours: 1,
        escalationWindowHours: 1,
        messages: [
          {
            id: "MSG-1011",
            senderId: "USR-003",
            senderRole: "admin",
            senderName: "Maya Iyer",
            text: "1098 has been linked and district search points are being notified.",
            createdAt: "2026-03-24T18:05:00+05:30"
          }
        ],
        timeline: [
          {
            id: "TL-1021",
            title: "Complaint submitted",
            note: "Child rescue alert opened with urgent support desk priority.",
            createdAt: "2026-03-24T17:40:00+05:30"
          },
          {
            id: "TL-1022",
            title: "1098 rapid action linked",
            note: "Child helpline and district safety points were added to the escalation chain.",
            createdAt: "2026-03-24T17:45:00+05:30"
          },
          {
            id: "TL-1023",
            title: "Escalated",
            note: "District superior and field units were notified because the case involves a missing child in a crowded transit zone.",
            createdAt: "2026-03-24T18:05:00+05:30"
          }
        ],
        imageData: ""
      }
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createImageHash(value) {
    const text = String(value || "");
    let hash = 0;
    for (let index = 0; index < text.length; index += 1) {
      hash = ((hash << 5) - hash) + text.charCodeAt(index);
      hash |= 0;
    }
    return "img-" + Math.abs(hash);
  }

  function inferLanguageFromInput(input) {
    const transcript = String((input && (input.voiceTranscript || input.description || input.title)) || "");
    const requested = input && input.voiceLanguage;
    if (requested) {
      const match = constants.voiceLanguages.find(function (item) {
        return item.value === requested;
      });
      if (match) {
        return match.label;
      }
    }
    if (/[\u0900-\u097f]/.test(transcript)) {
      return "Hindi";
    }
    if (/[\u0980-\u09ff]/.test(transcript)) {
      return "Bengali";
    }
    if (/[\u0b80-\u0bff]/.test(transcript)) {
      return "Tamil";
    }
    if (/[\u0c00-\u0c7f]/.test(transcript)) {
      return "Telugu";
    }
    if (/[\u0900-\u097f]/.test(transcript)) {
      return "Marathi";
    }
    return "English";
  }

  function detectEmotionProfile(text) {
    const normalized = normalizeText(text);
    const urgentCount = countMatches(normalized, urgentSignals);
    const angryCount = countMatches(normalized, angrySignals);
    const fearCount = countMatches(normalized, fearSignals);
    const sadnessCount = countMatches(normalized, sadnessSignals);

    let label = "Calm";
    let score = 12;

    if (urgentCount >= 2 || fearCount >= 2) {
      label = "Distress";
      score = 80 + (urgentCount * 4) + (fearCount * 3);
    } else if (angryCount >= 1) {
      label = "Anger";
      score = 58 + (angryCount * 6);
    } else if (sadnessCount >= 2) {
      label = "Concern";
      score = 42 + (sadnessCount * 4);
    }

    return {
      label: label,
      score: clamp(score, 10, 99),
      urgentCount: urgentCount,
      angryCount: angryCount,
      fearCount: fearCount,
      sadnessCount: sadnessCount
    };
  }

  function getSlaHours(priorityLabel) {
    if (priorityLabel === "Critical") {
      return 12;
    }
    if (priorityLabel === "High") {
      return 24;
    }
    if (priorityLabel === "Medium") {
      return 36;
    }
    return 48;
  }

  function getSuggestedSolution(category, input) {
    const location = input.location || input.ward || "the affected area";
    const solutions = {
      Water: "Dispatch a leak inspection crew, isolate the affected line, and place temporary barricades around " + location + ".",
      Roads: "Schedule a field patching team, mark the hazard with reflective cones, and plan resurfacing for " + location + ".",
      Electricity: "Send an electrical safety crew, inspect the feeder or streetlight circuit, and restore lighting around " + location + ".",
      Sanitation: "Assign a pickup vehicle, disinfect the hotspot, and increase cleaning frequency around " + location + ".",
      Safety: "Trigger a rapid-response safety inspection, secure the site, and coordinate with the ward safety officer for " + location + "."
    };
    return solutions[category] || "Assign a field inspection crew and verify the issue on site.";
  }

  function verifyImageEvidence(input, existingComplaints) {
    if (!input.imageData) {
      return {
        status: "No image",
        confidence: 0,
        reason: "No photo evidence uploaded.",
        imageHash: ""
      };
    }

    const imageHash = createImageHash(input.imageData);
    const duplicate = (existingComplaints || []).find(function (complaint) {
      return complaint.imageHash && complaint.imageHash === imageHash;
    });

    if (duplicate) {
      return {
        status: "Reused image",
        confidence: 92,
        reason: "The uploaded image matches evidence already used in " + duplicate.id + ".",
        imageHash: imageHash
      };
    }

    if (input.imageMeta && input.imageMeta.size < 40000) {
      return {
        status: "Low confidence",
        confidence: 54,
        reason: "The image is very small, so authenticity confidence is limited.",
        imageHash: imageHash
      };
    }

    return {
      status: "Likely original",
      confidence: 87,
      reason: "No duplicate evidence pattern was detected in the current complaint set.",
      imageHash: imageHash
    };
  }

  function buildPredictionSignals(complaints) {
    return civicPredictions.map(function (prediction) {
      const matches = complaints.filter(function (complaint) {
        const text = normalizeText([complaint.title, complaint.description, complaint.summary].join(" "));
        return prediction.match.some(function (token) {
          return text.includes(token);
        });
      });

      const hotWard = matches.reduce(function (best, complaint) {
        const area = complaint.district || complaint.ward;
        if (!best[area]) {
          best[area] = 0;
        }
        best[area] += 1;
        return best;
      }, {});

      const wardEntries = Object.keys(hotWard).map(function (ward) {
        return { ward: ward, count: hotWard[ward] };
      }).sort(function (left, right) {
        return right.count - left.count;
      });

      return {
        id: prediction.id,
        title: prediction.title,
        score: clamp((matches.length * 18) + (wardEntries[0] ? wardEntries[0].count * 7 : 0), 8, 96),
        count: matches.length,
        ward: wardEntries[0] ? wardEntries[0].ward : "All wards",
        recommendation: prediction.recommendation
      };
    }).sort(function (left, right) {
      return right.score - left.score;
    });
  }

  function ensureComplaintAiFields(complaint, complaints) {
    const source = {
      title: complaint.title,
      description: complaint.description,
      location: complaint.location,
      district: complaint.district,
      roadName: complaint.roadName,
      ward: complaint.ward,
      voiceLanguage: complaint.voiceLanguage,
      voiceTranscript: complaint.voiceTranscript,
      imageData: complaint.imageData,
      imageMeta: complaint.imageMeta
    };
    const analysis = analyzeComplaint(source, (complaints || []).filter(function (entry) {
      return entry.id !== complaint.id;
    }));
    complaint.aiFeatures = Object.assign({}, analysis, complaint.aiFeatures || {});
    complaint.imageVerification = complaint.imageVerification || analysis.imageVerification;
    complaint.imageHash = complaint.imageHash || analysis.imageVerification.imageHash;
    complaint.voiceLanguage = complaint.voiceLanguage || analysis.detectedLanguage;
    complaint.voiceTranscript = complaint.voiceTranscript || "";
    complaint.suggestedSolution = complaint.suggestedSolution || analysis.suggestedSolution;
    complaint.escalationWindowHours = complaint.escalationWindowHours || analysis.escalationWindowHours;
    return complaint;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function emit(detail) {
    listeners.forEach(function (listener) {
      listener(detail || {});
    });
  }

  function broadcast(detail) {
    localStorage.setItem(SIGNAL_KEY, String(Date.now()));
    if (channel) {
      channel.postMessage(detail || { type: "sync" });
    }
    emit(detail || { type: "sync" });
  }

  window.addEventListener("storage", function (event) {
    if (event.key === STORAGE_KEY || event.key === SESSION_KEY || event.key === SIGNAL_KEY) {
      emit({ type: "external-sync" });
    }
  });

  if (channel) {
    channel.addEventListener("message", function (event) {
      emit(event.data || { type: "broadcast-sync" });
    });
  }

  function initStore() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clone(seedTemplate)));
    }
  }

  function getStore() {
    initStore();
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (upgradeStoreShape(store)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
    return store;
  }

  function saveStore(store, detail) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    broadcast(detail || { type: "store-updated" });
  }

  function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function setSession(user) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        userId: user.id,
        role: user.role,
        loginAt: nowIso()
      })
    );
    broadcast({ type: "session-updated", userId: user.id });
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    broadcast({ type: "session-cleared" });
  }

  function applyAutoEscalations(store) {
    let changed = false;
    store.complaints.forEach(function (complaint) {
      ensureComplaintAiFields(complaint, store.complaints);
      if (complaint.status === "resolved" || complaint.status === "escalated") {
        return;
      }

      const openHours = calculateOpenHours(complaint);
      const windowHours = complaint.escalationWindowHours || getSlaHours(complaint.priorityLabel);
      const alreadyLogged = complaint.timeline.some(function (item) {
        return item.title === "Auto-escalated by SLA";
      });

      if (openHours > windowHours && !alreadyLogged) {
        const timestamp = nowIso();
        complaint.status = "escalated";
        complaint.updatedAt = timestamp;
        complaint.timeline.push({
          id: createId("TL"),
          title: "Auto-escalated by SLA",
          note: "The complaint exceeded its " + windowHours + "h response window and was escalated automatically.",
          createdAt: timestamp
        });
        if (complaint.issueDesk === "women" && complaint.superiorContact) {
          complaint.timeline.push({
            id: createId("TL"),
            title: "Superior escalation mail triggered",
            note: "Escalation notice was generated for " + complaint.superiorContact.name + " at " + complaint.superiorContact.email + " because the women support complaint crossed the 1h response limit.",
            createdAt: timestamp
          });
        }
        complaint.messages.push({
          id: createId("MSG"),
          senderId: "SYS-AI",
          senderRole: "system",
          senderName: "Nav Dristi AI",
          text: complaint.issueDesk === "women" && complaint.superiorContact
            ? "This women support case crossed the 1h response limit and was escalated to the department superior."
            : "This case was auto-escalated because it crossed the response time threshold.",
          createdAt: timestamp
        });
        changed = true;
      }
    });
    return changed;
  }

  function upgradeStoreShape(store) {
    let changed = false;
    if (!store || !Array.isArray(store.complaints)) {
      return false;
    }

    const demoUsersById = seedTemplate.users.reduce(function (lookup, user) {
      lookup[user.id] = user;
      return lookup;
    }, {});

    if (Array.isArray(store.users)) {
      store.users.forEach(function (user) {
        const seedUser = demoUsersById[user.id];
        if (!seedUser) {
          return;
        }
        ["name", "email", "password", "role", "district", "ward", "phone", "citizenType", "department"].forEach(function (key) {
          if (seedUser[key] !== undefined && user[key] !== seedUser[key]) {
            user[key] = seedUser[key];
            changed = true;
          }
        });
      });

      seedTemplate.users.forEach(function (seedUser) {
        const existing = store.users.some(function (user) {
          return user.id === seedUser.id;
        });
        if (!existing) {
          store.users.push(clone(seedUser));
          changed = true;
        }
      });
    }

    store.complaints.forEach(function (complaint) {
      const before = JSON.stringify({
        aiFeatures: complaint.aiFeatures,
        imageVerification: complaint.imageVerification,
        imageHash: complaint.imageHash,
        voiceLanguage: complaint.voiceLanguage,
        voiceTranscript: complaint.voiceTranscript,
        suggestedSolution: complaint.suggestedSolution,
        escalationWindowHours: complaint.escalationWindowHours
      });
      ensureComplaintAiFields(complaint, store.complaints);
      const after = JSON.stringify({
        aiFeatures: complaint.aiFeatures,
        imageVerification: complaint.imageVerification,
        imageHash: complaint.imageHash,
        voiceLanguage: complaint.voiceLanguage,
        voiceTranscript: complaint.voiceTranscript,
        suggestedSolution: complaint.suggestedSolution,
        escalationWindowHours: complaint.escalationWindowHours
      });
      if (before !== after) {
        changed = true;
      }
    });
    return applyAutoEscalations(store) || changed;
  }

  function subscribe(listener) {
    listeners.add(listener);
    return function () {
      listeners.delete(listener);
    };
  }

  function sanitizeUser(user) {
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      citizenType: user.citizenType || "general",
      district: user.district || geoData.defaultDistrict || "Raipur",
      ward: user.ward,
      department: user.department || ""
    };
  }

  function getCurrentUser() {
    const session = getSession();
    if (!session) {
      return null;
    }

    const store = getStore();
    const user = store.users.find(function (entry) {
      return entry.id === session.userId;
    });

    return sanitizeUser(user);
  }

  function getUserById(userId) {
    const store = getStore();
    return store.users.find(function (entry) {
      return entry.id === userId;
    }) || null;
  }

  function login(credentials) {
    const store = getStore();
    const normalizedEmail = (credentials.email || "").trim().toLowerCase();
    const user = store.users.find(function (entry) {
      return entry.email.toLowerCase() === normalizedEmail &&
        entry.password === credentials.password &&
        entry.role === credentials.role;
    });

    if (!user) {
      return { ok: false, message: "Invalid email, password, or role selection." };
    }

    setSession(user);
    return { ok: true, user: sanitizeUser(user) };
  }

  function useDemoAccount(role) {
    if (role === "admin") {
      return login({
        email: "admin@navdristi.in",
        password: "NavDristi@123",
        role: "admin"
      });
    }

    if (role === "women") {
      return login({
        email: "women@navdristi.in",
        password: "NavDristi@123",
        role: "citizen"
      });
    }

    if (role === "men") {
      return login({
        email: "male@navdristi.in",
        password: "NavDristi@123",
        role: "citizen"
      });
    }

    if (role === "elder") {
      return login({
        email: "elder@navdristi.in",
        password: "NavDristi@123",
        role: "citizen"
      });
    }

    return login({
        email: "general@navdristi.in",
      password: "NavDristi@123",
      role: "citizen"
    });
  }

  function register(data) {
    const store = getStore();
    const normalizedEmail = (data.email || "").trim().toLowerCase();

    if (store.users.some(function (entry) {
      return entry.email.toLowerCase() === normalizedEmail;
    })) {
      return { ok: false, message: "An account with this email already exists." };
    }

    const user = {
      id: createId("USR"),
      name: (data.name || "").trim(),
      email: normalizedEmail,
      password: data.password,
      role: "citizen",
      citizenType: data.citizenType || "general",
      district: data.district || geoData.defaultDistrict || "Raipur",
      ward: data.ward,
      phone: ""
    };

    store.users.push(user);
    saveStore(store, { type: "user-registered", userId: user.id });
    setSession(user);
    return { ok: true, user: sanitizeUser(user) };
  }

  function logout() {
    clearSession();
  }

  function createId(prefix) {
    return prefix + "-" + String(Date.now()).slice(-6) + "-" + Math.floor(Math.random() * 900 + 100);
  }

  function normalizeText(value) {
    return (value || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenize(value) {
    return normalizeText(value)
      .split(" ")
      .filter(function (entry) {
        return entry && entry.length > 2;
      });
  }

  function countMatches(text, words) {
    return words.reduce(function (count, word) {
      return count + (text.includes(word) ? 1 : 0);
    }, 0);
  }

  function jaccardSimilarity(sourceText, targetText) {
    const a = new Set(tokenize(sourceText));
    const b = new Set(tokenize(targetText));
    const union = new Set([].concat(Array.from(a), Array.from(b)));

    if (!union.size) {
      return 0;
    }

    let intersection = 0;
    a.forEach(function (entry) {
      if (b.has(entry)) {
        intersection += 1;
      }
    });
    return intersection / union.size;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function priorityLabelFromScore(score) {
    if (score >= 86) {
      return "Critical";
    }
    if (score >= 70) {
      return "High";
    }
    if (score >= 50) {
      return "Medium";
    }
    return "Low";
  }

  function buildSummary(input, category, sentiment, duplicates, emotionLabel) {
    const urgencyText = sentiment === "Urgent"
      ? "high urgency"
      : sentiment === "Angry"
        ? "resident frustration"
        : "routine service disruption";
    const duplicateText = duplicates.length ? " Similar reports suggest this could be a recurring cluster." : "";
    const emotionText = emotionLabel && emotionLabel !== "Calm" ? " Emotion signal: " + emotionLabel + "." : "";
    return category + " issue flagged at " + input.location + " with " + urgencyText + "." + emotionText + duplicateText;
  }

  function buildAutoReply(category, priorityLabel, solution) {
    const department = departmentByCategory[category];
    const urgencyNote = priorityLabel === "Critical" || priorityLabel === "High"
      ? "This has been pushed to the fast-response queue."
      : "This has been added to the standard response queue.";
    return department + " has been recommended for this complaint. " + urgencyNote + " Suggested action: " + solution;
  }

  function analyzeComplaint(input, existingComplaints) {
    const districtName = resolveDistrictName(input);
    const roadName = getRoadName(input);
    const combinedText = normalizeText([input.title, input.description, input.location, input.ward, districtName, roadName].join(" "));
    const preferredCategory = constants.categories.includes(input.reportedCategory) ? input.reportedCategory : "";
    let bestCategory = "Sanitation";
    let bestScore = -1;

    constants.categories.forEach(function (category) {
      const score = countMatches(combinedText, categoryKeywords[category]);
      if (score > bestScore) {
        bestCategory = category;
        bestScore = score;
      }
    });

    if (preferredCategory && bestScore <= 1) {
      bestCategory = preferredCategory;
      bestScore = 1;
    }

    if (bestScore <= 0) {
      bestCategory = "Safety";
    }

    const emotion = detectEmotionProfile([input.title, input.description, input.voiceTranscript, input.location].join(" "));
    const urgentCount = emotion.urgentCount + (String(input.voiceTranscript || "").trim() ? 1 : 0);
    const angryCount = emotion.angryCount;
    const sameWardComplaints = existingComplaints.filter(function (complaint) {
      return complaint.ward === input.ward;
    });

    const duplicates = existingComplaints
      .map(function (complaint) {
        let score = jaccardSimilarity(
          [complaint.title, complaint.description, complaint.location].join(" "),
          [input.title, input.description, input.location].join(" ")
        );
        if (complaint.ward === input.ward) {
          score += 0.08;
        }
        if (complaint.category === bestCategory) {
          score += 0.04;
        }
        return {
          id: complaint.id,
          score: clamp(Number(score.toFixed(2)), 0, 1),
          title: complaint.title
        };
      })
      .filter(function (match) {
        return match.score >= 0.28;
      })
      .sort(function (left, right) {
        return right.score - left.score;
      })
      .slice(0, 3);

    const categoryWeight = {
      Water: 18,
      Roads: 13,
      Electricity: 17,
      Sanitation: 12,
      Safety: 20
    };

    let priorityScore = 34 + categoryWeight[bestCategory];
    priorityScore += urgentCount * 7;
    priorityScore += angryCount * 3;
    priorityScore += Math.round(emotion.score / 8);
    priorityScore += sameWardComplaints.length * 2;
    priorityScore += duplicates.length ? 6 : 0;
    if (combinedText.includes("school") || combinedText.includes("hospital")) {
      priorityScore += 10;
    }
    if (combinedText.includes("flood") || combinedText.includes("fire") || combinedText.includes("sparking")) {
      priorityScore += 12;
    }

    priorityScore = clamp(priorityScore, 24, 97);
    const sentiment = emotion.label === "Distress" || urgentCount >= 2
      ? "Urgent"
      : emotion.label === "Anger" || angryCount >= 1
        ? "Angry"
        : "Normal";
    const priorityLabel = priorityLabelFromScore(priorityScore);
    const detectedLanguage = inferLanguageFromInput(input);
    const suggestedSolution = getSuggestedSolution(bestCategory, input);
    const imageVerification = verifyImageEvidence(input, existingComplaints);
    const supportDesk = getSupportDeskConfig(input.issueDesk);
    const escalationWindowHours = supportDesk ? supportDesk.supportWindowHours : getSlaHours(priorityLabel);
    const predictiveSignals = buildPredictionSignals(existingComplaints.concat([{
      title: input.title,
      description: input.description,
      summary: input.description,
      ward: input.ward,
      district: districtName
    }])).slice(0, 2);
    const superiorContact = superiorDirectory[departmentByCategory[bestCategory]] || null;

    return {
      category: bestCategory,
      sentiment: sentiment,
      emotionLabel: emotion.label,
      emotionScore: emotion.score,
      priorityScore: priorityScore,
      priorityLabel: priorityLabel,
      department: departmentByCategory[bestCategory],
      assignedOfficer: getOfficerName(departmentByCategory[bestCategory], 0),
      summary: buildSummary(input, bestCategory, sentiment, duplicates, emotion.label),
      aiReply: buildAutoReply(bestCategory, priorityLabel, suggestedSolution),
      detectedLanguage: detectedLanguage,
      district: districtName,
      roadName: roadName,
      issueDesk: input.issueDesk || "general",
      supportDeskTitle: supportDesk ? supportDesk.title : "General civic desk",
      supportDeskWindowHours: escalationWindowHours,
      superiorContact: superiorContact,
      suggestedSolution: suggestedSolution,
      imageVerification: imageVerification,
      escalationWindowHours: escalationWindowHours,
      autoAssignmentReason: "Matched " + bestCategory + " signals and routed to " + departmentByCategory[bestCategory] + ".",
      voiceTranscript: input.voiceTranscript || "",
      predictiveSignals: predictiveSignals,
      tags: [bestCategory.toLowerCase(), input.ward.toLowerCase().replace(/\s+/g, "-"), priorityLabel.toLowerCase()],
      duplicateCandidates: duplicates
    };
  }

  function enrichComplaint(complaint, store) {
    const currentStore = store || getStore();
    const citizen = currentStore.users.find(function (entry) {
      return entry.id === complaint.citizenId;
    });
    const districtName = complaint.district || resolveDistrictName(complaint);
    const districtMeta = getDistrictMeta(districtName);
    const roadName = complaint.roadName || getRoadName(complaint);
    const aiFeatures = complaint.aiFeatures || analyzeComplaint({
      title: complaint.title,
      description: complaint.description,
      location: complaint.location,
      district: districtName,
      roadName: roadName,
      ward: complaint.ward,
      voiceLanguage: complaint.voiceLanguage,
      voiceTranscript: complaint.voiceTranscript,
      imageData: complaint.imageData,
      imageMeta: complaint.imageMeta
    }, currentStore.complaints.filter(function (entry) {
      return entry.id !== complaint.id;
    }));
    const escalationWindowHours = complaint.escalationWindowHours || aiFeatures.escalationWindowHours || getSlaHours(complaint.priorityLabel);
    const openHours = calculateOpenHours(complaint);

    return Object.assign({}, complaint, {
      citizenName: citizen ? citizen.name : "Citizen",
      district: districtName,
      districtMeta: districtMeta,
      roadName: roadName,
      issueDesk: complaint.issueDesk || aiFeatures.issueDesk || "general",
      supportDeskTitle: complaint.supportDeskTitle || aiFeatures.supportDeskTitle || "General civic desk",
      supportDeskWindowHours: complaint.supportDeskWindowHours || aiFeatures.supportDeskWindowHours || escalationWindowHours,
      superiorContact: complaint.superiorContact || aiFeatures.superiorContact || null,
      citizenFeedback: complaint.citizenFeedback || null,
      supportVotes: complaint.supportVotes || [],
      supportCount: complaint.supportVotes ? complaint.supportVotes.length : 0,
      resolutionProofs: complaint.resolutionProofs || [],
      templateId: complaint.templateId || "",
      incidentSeverity: complaint.incidentSeverity || "",
      privateMode: !!complaint.privateMode,
      livingAlonePriority: !!complaint.livingAlonePriority,
      actionVisibility: complaint.timeline ? complaint.timeline.slice(-3).map(function (item) {
        return {
          title: item.title,
          createdAt: item.createdAt
        };
      }) : [],
      aiFeatures: aiFeatures,
      imageVerification: complaint.imageVerification || aiFeatures.imageVerification,
      suggestedSolution: complaint.suggestedSolution || aiFeatures.suggestedSolution,
      voiceLanguage: complaint.voiceLanguage || aiFeatures.detectedLanguage,
      voiceTranscript: complaint.voiceTranscript || aiFeatures.voiceTranscript || "",
      escalationWindowHours: escalationWindowHours,
      isOverdue: isOverdue(complaint),
      duplicateCount: complaint.duplicateCandidates ? complaint.duplicateCandidates.length : 0,
      responseHours: openHours,
      mapPosition: getMapPositionFromDistrict(districtName),
      slaProgress: clamp(Math.round((openHours / Math.max(escalationWindowHours, 1)) * 100), 0, 200)
    });
  }

  function sortComplaints(complaints) {
    return complaints.sort(function (left, right) {
      if (right.priorityScore !== left.priorityScore) {
        return right.priorityScore - left.priorityScore;
      }
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }

  function getComplaints(filters) {
    const options = filters || {};
    const store = getStore();
    const currentUser = getCurrentUser();
    let complaints = store.complaints.map(function (entry) {
      return enrichComplaint(entry, store);
    });

    if (currentUser && currentUser.role === "citizen" && !options.includeAll) {
      complaints = complaints.filter(function (entry) {
        return entry.citizenId === currentUser.id;
      });
    }

    if (options.status && options.status !== "all") {
      complaints = complaints.filter(function (entry) {
        return entry.status === options.status;
      });
    }

    if (options.category && options.category !== "all") {
      complaints = complaints.filter(function (entry) {
        return entry.category === options.category;
      });
    }

    if (options.priority && options.priority !== "all") {
      complaints = complaints.filter(function (entry) {
        return entry.priorityLabel.toLowerCase() === options.priority;
      });
    }

    if (options.search) {
      const searchText = normalizeText(options.search);
      complaints = complaints.filter(function (entry) {
        return normalizeText([entry.id, entry.title, entry.description, entry.location, entry.ward, entry.district, entry.department, entry.assignedOfficer].join(" ")).includes(searchText);
      });
    }

    if (options.district && options.district !== "all") {
      complaints = complaints.filter(function (entry) {
        return entry.district === options.district;
      });
    }

    if (options.fromDate) {
      const fromDate = new Date(options.fromDate);
      complaints = complaints.filter(function (entry) {
        return new Date(entry.createdAt) >= fromDate;
      });
    }

    if (options.onlyFlaggedEvidence) {
      complaints = complaints.filter(function (entry) {
        return entry.imageVerification && entry.imageVerification.status !== "Likely original" && entry.imageVerification.status !== "No image";
      });
    }

    return sortComplaints(complaints);
  }

  function getComplaintById(complaintId) {
    const store = getStore();
    const currentUser = getCurrentUser();
    const complaint = store.complaints.find(function (entry) {
      return entry.id === complaintId;
    });

    if (!complaint) {
      return null;
    }

    if (currentUser && currentUser.role === "citizen" && complaint.citizenId !== currentUser.id) {
      return null;
    }

    return enrichComplaint(complaint, store);
  }

  function previewComplaint(data) {
    const store = getStore();
    return analyzeComplaint(data, store.complaints);
  }

  function submitComplaint(payload) {
    const user = getCurrentUser();
    if (!user || user.role !== "citizen") {
      return { ok: false, message: "Please log in as a citizen to submit a complaint." };
    }

    const store = getStore();
    const ai = analyzeComplaint(payload, store.complaints);
    const timestamp = nowIso();
    const complaint = {
      id: createId("CMP"),
      title: payload.title.trim(),
      description: payload.description.trim(),
      location: payload.location.trim(),
      district: ai.district || resolveDistrictName(payload),
      roadName: ai.roadName || getRoadName(payload),
      ward: payload.ward,
      citizenId: user.id,
      reportedCategory: payload.reportedCategory || "",
      issueDesk: payload.issueDesk || "general",
      category: ai.category,
      sentiment: ai.sentiment,
      priorityScore: ai.priorityScore,
      priorityLabel: ai.priorityLabel,
      department: ai.department,
      assignedOfficer: ai.assignedOfficer,
      status: ai.priorityLabel === "Critical" ? "escalated" : "open",
      createdAt: timestamp,
      updatedAt: timestamp,
      resolvedAt: null,
      summary: ai.summary,
      aiReply: ai.aiReply,
      aiFeatures: ai,
      tags: ai.tags,
      duplicateOf: ai.duplicateCandidates.length ? ai.duplicateCandidates[0].id : null,
      duplicateCandidates: ai.duplicateCandidates,
      voiceLanguage: payload.voiceLanguage || ai.detectedLanguage,
      voiceTranscript: payload.voiceTranscript || "",
      templateId: payload.templateId || "",
      incidentSeverity: payload.incidentSeverity || "",
      privateMode: !!payload.privateMode,
      livingAlonePriority: !!payload.livingAlonePriority,
      audioData: payload.audioData || "",
      audioMeta: payload.audioMeta || null,
      suggestedSolution: ai.suggestedSolution,
      supportDeskTitle: ai.supportDeskTitle,
      supportDeskWindowHours: ai.supportDeskWindowHours,
      superiorContact: ai.superiorContact,
      imageVerification: ai.imageVerification,
      imageHash: ai.imageVerification.imageHash,
      imageMeta: payload.imageMeta || null,
      escalationWindowHours: ai.escalationWindowHours,
      messages: [
        {
          id: createId("MSG"),
          senderId: user.id,
          senderRole: user.role,
          senderName: user.name,
          text: "Complaint submitted and awaiting authority review.",
          createdAt: timestamp
        }
      ],
      timeline: [
        {
          id: createId("TL"),
          title: "Complaint submitted",
          note: "Citizen submitted a new complaint with AI-assisted intake.",
          createdAt: timestamp
        },
        {
          id: createId("TL"),
          title: "AI classified as " + ai.category + " / " + ai.priorityLabel,
          note: "District: " + (ai.district || resolveDistrictName(payload)) + ". Road: " + (ai.roadName || getRoadName(payload)) + ". Recommended department: " + ai.department + ". Emotion: " + ai.emotionLabel + ". Duplicate matches: " + ai.duplicateCandidates.length + ".",
          createdAt: timestamp
        },
        {
          id: createId("TL"),
          title: "Auto-assigned with AI solution",
          note: ai.autoAssignmentReason + " " + ai.suggestedSolution,
          createdAt: timestamp
        },
        {
          id: createId("TL"),
          title: "Image verification completed",
          note: ai.imageVerification.status + " (" + ai.imageVerification.confidence + "% confidence). " + ai.imageVerification.reason,
          createdAt: timestamp
        },
        {
          id: createId("TL"),
          title: payload.audioData ? "Voice recording attached" : "No voice recording attached",
          note: payload.audioData
            ? "Citizen attached original recorded audio evidence for review."
            : "Complaint was submitted without a raw audio recording.",
          createdAt: timestamp
        }
      ],
      imageData: payload.imageData || ""
    };

    store.complaints.unshift(complaint);
    saveStore(store, { type: "complaint-created", complaintId: complaint.id });
    return { ok: true, complaint: enrichComplaint(complaint, store) };
  }

  function submitCitizenFeedback(complaintId, payload) {
    const user = getCurrentUser();
    if (!user || user.role !== "citizen") {
      return { ok: false, message: "Citizen access is required to submit feedback." };
    }

    const store = getStore();
    const complaint = store.complaints.find(function (entry) {
      return entry.id === complaintId;
    });

    if (!complaint) {
      return { ok: false, message: "Complaint not found." };
    }

    if (complaint.citizenId !== user.id) {
      return { ok: false, message: "You can only rate your own complaint." };
    }

    if (complaint.status !== "resolved") {
      return { ok: false, message: "Feedback can be submitted after resolution." };
    }

    const timestamp = nowIso();
    complaint.citizenFeedback = {
      rating: Number(payload.rating) || 0,
      note: String(payload.note || "").trim(),
      confirmedResolved: !!payload.confirmedResolved,
      createdAt: timestamp
    };
    complaint.updatedAt = timestamp;
    complaint.timeline.push({
      id: createId("TL"),
      title: "Citizen shared feedback",
      note: "Resolution rated " + complaint.citizenFeedback.rating + "/5" + (complaint.citizenFeedback.note ? ". " + complaint.citizenFeedback.note : "."),
      createdAt: timestamp
    });

    saveStore(store, { type: "feedback-submitted", complaintId: complaint.id });
    return { ok: true, complaint: enrichComplaint(complaint, store) };
  }

  function toggleCommunitySupport(complaintId) {
    const user = getCurrentUser();
    if (!user) {
      return { ok: false, message: "Please log in to support a complaint." };
    }

    const store = getStore();
    const complaint = store.complaints.find(function (entry) {
      return entry.id === complaintId;
    });

    if (!complaint) {
      return { ok: false, message: "Complaint not found." };
    }

    complaint.supportVotes = complaint.supportVotes || [];
    const existingIndex = complaint.supportVotes.indexOf(user.id);
    const timestamp = nowIso();

    if (existingIndex >= 0) {
      complaint.supportVotes.splice(existingIndex, 1);
      complaint.timeline.push({
        id: createId("TL"),
        title: "Community support removed",
        note: user.name + " removed support from this complaint.",
        createdAt: timestamp
      });
    } else {
      complaint.supportVotes.push(user.id);
      complaint.timeline.push({
        id: createId("TL"),
        title: "Community support added",
        note: user.name + " supported this complaint to raise local visibility.",
        createdAt: timestamp
      });
    }

    complaint.updatedAt = timestamp;
    saveStore(store, { type: "community-support-toggled", complaintId: complaint.id });
    return { ok: true, complaint: enrichComplaint(complaint, store) };
  }

  function addMessage(complaintId, text) {
    const user = getCurrentUser();
    if (!user) {
      return { ok: false, message: "Please log in to send a message." };
    }

    const store = getStore();
    const complaint = store.complaints.find(function (entry) {
      return entry.id === complaintId;
    });

    if (!complaint) {
      return { ok: false, message: "Complaint not found." };
    }

    if (user.role === "citizen" && complaint.citizenId !== user.id) {
      return { ok: false, message: "You do not have access to this chat." };
    }

    const timestamp = nowIso();
    complaint.messages.push({
      id: createId("MSG"),
      senderId: user.id,
      senderRole: user.role,
      senderName: user.name,
      text: text.trim(),
      createdAt: timestamp
    });
    complaint.updatedAt = timestamp;
    complaint.timeline.push({
      id: createId("TL"),
      title: user.role === "admin" ? "Authority message sent" : "Citizen message sent",
      note: text.trim(),
      createdAt: timestamp
    });

    saveStore(store, { type: "message-added", complaintId: complaint.id });
    return { ok: true, complaint: enrichComplaint(complaint, store) };
  }

  function prettifyStatus(status) {
    return status.replace(/_/g, " ").replace(/\b\w/g, function (letter) {
      return letter.toUpperCase();
    });
  }

  function updateComplaintStatus(complaintId, status, note) {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") {
      return { ok: false, message: "Admin access is required for status updates." };
    }

    const store = getStore();
    const complaint = store.complaints.find(function (entry) {
      return entry.id === complaintId;
    });
    if (!complaint) {
      return { ok: false, message: "Complaint not found." };
    }

    const timestamp = nowIso();
    complaint.status = status;
    complaint.updatedAt = timestamp;
    complaint.resolvedAt = status === "resolved" ? timestamp : null;

    complaint.timeline.push({
      id: createId("TL"),
      title: "Status changed to " + prettifyStatus(status),
      note: note && note.trim() ? note.trim() : "Status updated by control room.",
      createdAt: timestamp
    });

    if (note && note.trim()) {
      complaint.messages.push({
        id: createId("MSG"),
        senderId: user.id,
        senderRole: "admin",
        senderName: user.name,
        text: note.trim(),
        createdAt: timestamp
      });
    }

    saveStore(store, { type: "status-updated", complaintId: complaint.id, status: status });
    return { ok: true, complaint: enrichComplaint(complaint, store) };
  }

  function assignComplaint(complaintId, department, officer) {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") {
      return { ok: false, message: "Admin access is required for assignment changes." };
    }

    const store = getStore();
    const complaint = store.complaints.find(function (entry) {
      return entry.id === complaintId;
    });
    if (!complaint) {
      return { ok: false, message: "Complaint not found." };
    }

    const timestamp = nowIso();
    complaint.department = department;
    complaint.assignedOfficer = officer || getOfficerName(department, 0);
    complaint.updatedAt = timestamp;
    complaint.timeline.push({
      id: createId("TL"),
      title: "Assignment updated",
      note: "Assigned to " + complaint.department + " under " + complaint.assignedOfficer + ".",
      createdAt: timestamp
    });

    saveStore(store, { type: "assignment-updated", complaintId: complaint.id });
    return { ok: true, complaint: enrichComplaint(complaint, store) };
  }

  function logComplaintProof(complaintId, payload) {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") {
      return { ok: false, message: "Admin access is required to log closure proof." };
    }

    const store = getStore();
    const complaint = store.complaints.find(function (entry) {
      return entry.id === complaintId;
    });
    if (!complaint) {
      return { ok: false, message: "Complaint not found." };
    }

    const timestamp = nowIso();
    const proofPayload = typeof payload === "string" ? { note: payload } : (payload || {});
    const note = String(proofPayload.note || "").trim() || "Field verification completed and proof logged.";
    complaint.resolutionProofs = complaint.resolutionProofs || [];
    complaint.resolutionProofs.unshift({
      id: createId("PRF"),
      note: note,
      imageData: proofPayload.imageData || "",
      createdAt: timestamp,
      officer: user.name
    });
    complaint.updatedAt = timestamp;
    complaint.timeline.push({
      id: createId("TL"),
      title: "Proof of action logged",
      note: note,
      createdAt: timestamp
    });
    complaint.messages.push({
      id: createId("MSG"),
      senderId: user.id,
      senderRole: user.role,
      senderName: user.name,
      text: "Admin update: " + note,
      createdAt: timestamp
    });

    saveStore(store, { type: "proof-logged", complaintId: complaint.id });
    return { ok: true, complaint: enrichComplaint(complaint, store) };
  }

  function calculateOpenHours(complaint) {
    const start = new Date(complaint.createdAt).getTime();
    const end = complaint.resolvedAt ? new Date(complaint.resolvedAt).getTime() : Date.now();
    return Math.max(1, Math.round((end - start) / 36e5));
  }

  function isOverdue(complaint) {
    if (complaint.status === "resolved") {
      return false;
    }
    const limit = complaint.escalationWindowHours || getSlaHours(complaint.priorityLabel || priorityLabelFromScore(complaint.priorityScore || 40));
    return calculateOpenHours(complaint) > limit;
  }

  function getCitizenMetrics(userId) {
    const complaints = getComplaints({ includeAll: true }).filter(function (entry) {
      return entry.citizenId === userId;
    });

    return {
      total: complaints.length,
      open: complaints.filter(function (entry) {
        return entry.status === "open" || entry.status === "in_progress";
      }).length,
      resolved: complaints.filter(function (entry) {
        return entry.status === "resolved";
      }).length,
      escalated: complaints.filter(function (entry) {
        return entry.status === "escalated";
      }).length
    };
  }

  function getAnalytics() {
    const complaints = getComplaints({ includeAll: true });
    const statusCounts = {
      open: 0,
      in_progress: 0,
      resolved: 0,
      escalated: 0
    };
    const categoryCounts = {};
    const sentimentCounts = {};
    const emotionCounts = {};
    const imageFlags = {
      reused: 0,
      lowConfidence: 0,
      likelyOriginal: 0
    };

    constants.categories.forEach(function (category) {
      categoryCounts[category] = 0;
    });

    complaints.forEach(function (complaint) {
      statusCounts[complaint.status] += 1;
      categoryCounts[complaint.category] += 1;
      sentimentCounts[complaint.sentiment] = (sentimentCounts[complaint.sentiment] || 0) + 1;
      emotionCounts[complaint.aiFeatures.emotionLabel] = (emotionCounts[complaint.aiFeatures.emotionLabel] || 0) + 1;
      if (complaint.imageVerification.status === "Reused image") {
        imageFlags.reused += 1;
      } else if (complaint.imageVerification.status === "Low confidence") {
        imageFlags.lowConfidence += 1;
      } else if (complaint.imageVerification.status === "Likely original") {
        imageFlags.likelyOriginal += 1;
      }
    });

    const resolvedComplaints = complaints.filter(function (complaint) {
      return complaint.status === "resolved" && complaint.resolvedAt;
    });

    const averageResolutionHours = resolvedComplaints.length
      ? Math.round(resolvedComplaints.reduce(function (sum, complaint) {
          return sum + calculateOpenHours(complaint);
        }, 0) / resolvedComplaints.length)
      : 0;

    const resolutionRate = complaints.length
      ? Math.round((statusCounts.resolved / complaints.length) * 100)
      : 0;

    const duplicateClusters = complaints.filter(function (complaint) {
      return complaint.duplicateOf || complaint.duplicateCount;
    }).length;

    const ratedComplaints = complaints.filter(function (complaint) {
      return complaint.citizenFeedback && complaint.citizenFeedback.rating;
    });

    const averageCitizenRating = ratedComplaints.length
      ? Number((ratedComplaints.reduce(function (sum, complaint) {
          return sum + complaint.citizenFeedback.rating;
        }, 0) / ratedComplaints.length).toFixed(1))
      : 0;

    const criticalOpen = complaints.filter(function (complaint) {
      return complaint.priorityLabel === "Critical" && complaint.status !== "resolved";
    }).length;

    const totalCommunitySupport = complaints.reduce(function (sum, complaint) {
      return sum + (complaint.supportVotes ? complaint.supportVotes.length : 0);
    }, 0);

    const overdueCount = complaints.filter(function (complaint) {
      return complaint.isOverdue;
    }).length;

    const wardHeatmap = constants.wards.map(function (ward) {
      const wardComplaints = complaints.filter(function (complaint) {
        return complaint.ward === ward;
      });
      return {
        ward: ward,
        count: wardComplaints.length,
        weightedPriority: wardComplaints.reduce(function (sum, complaint) {
          return sum + complaint.priorityScore;
        }, 0),
        highPriority: wardComplaints.filter(function (complaint) {
          return complaint.priorityLabel === "High" || complaint.priorityLabel === "Critical";
        }).length
      };
    });

    const districtSafetyOverview = constants.districts.map(function (districtName) {
      const districtComplaints = complaints.filter(function (complaint) {
        return complaint.district === districtName;
      });
      const districtMeta = getDistrictMeta(districtName);
      const highPriority = districtComplaints.filter(function (complaint) {
        return complaint.priorityLabel === "High" || complaint.priorityLabel === "Critical";
      }).length;
      const pending = districtComplaints.filter(function (complaint) {
        return complaint.status !== "resolved";
      }).length;
      const score = clamp((districtMeta ? districtMeta.safetyBaseline : 74) - (pending * 3) - (highPriority * 5), 36, 95);
      const label = score >= 82 ? "Stable" : score >= 68 ? "Watch" : score >= 54 ? "Alert" : "Critical";
      return {
        district: districtName,
        headquarters: districtMeta ? districtMeta.headquarters : districtName,
        roads: districtMeta ? districtMeta.roads : [],
        count: districtComplaints.length,
        pending: pending,
        highPriority: highPriority,
        weightedPriority: districtComplaints.reduce(function (sum, complaint) {
          return sum + complaint.priorityScore;
        }, 0),
        safetyScore: score,
        safetyLabel: label,
        lat: districtMeta ? districtMeta.lat : 21.25,
        lng: districtMeta ? districtMeta.lng : 81.63
      };
    });

    const trend = buildSevenDayTrend(complaints);
    const predictiveSignals = buildPredictionSignals(complaints);
    const liveMapPoints = complaints.map(function (complaint, index) {
      const base = complaint.mapPosition || getMapPositionFromDistrict(complaint.district || resolveDistrictName(complaint));
      const offsetX = (index % 3) * 3 - 3;
      const offsetY = (index % 2) * 4 - 2;
      return {
        id: complaint.id,
        title: complaint.title,
        ward: complaint.ward,
        district: complaint.district,
        roadName: complaint.roadName,
        x: clamp(base.x + offsetX, 8, 92),
        y: clamp(base.y + offsetY, 10, 90),
        lat: base.lat,
        lng: base.lng,
        priority: complaint.priorityLabel.toLowerCase(),
        category: complaint.category
      };
    });
    const complaintAreas = districtSafetyOverview
      .filter(function (districtItem) {
        return districtItem.count > 0;
      })
      .map(function (districtItem) {
        const districtComplaints = complaints.filter(function (complaint) {
          return complaint.district === districtItem.district;
        });
        const sorted = districtComplaints.slice().sort(function (left, right) {
          return right.priorityScore - left.priorityScore;
        });
        const top = sorted[0];
        return {
          area: districtItem.district,
          count: districtItem.count,
          highPriority: districtItem.highPriority,
          highestPriority: top ? top.priorityLabel : "Low",
          topIssue: top ? top.title : "No active issue",
          department: top ? top.department : "No department",
          roads: districtItem.roads,
          safetyLabel: districtItem.safetyLabel
        };
      })
      .sort(function (left, right) {
        return right.highPriority - left.highPriority || right.count - left.count;
      });
    const departmentPerformance = constants.departments.map(function (department) {
      const departmentComplaints = complaints.filter(function (complaint) {
        return complaint.department === department;
      });
      const departmentResolved = departmentComplaints.filter(function (complaint) {
        return complaint.status === "resolved";
      });
      const averageHours = departmentResolved.length
        ? Math.round(departmentResolved.reduce(function (sum, complaint) {
            return sum + calculateOpenHours(complaint);
          }, 0) / departmentResolved.length)
        : 0;
      const backlog = departmentComplaints.filter(function (complaint) {
        return complaint.status !== "resolved";
      }).length;
      const atRisk = departmentComplaints.filter(function (complaint) {
        return complaint.isOverdue || complaint.priorityLabel === "Critical";
      }).length;

      return {
        department: department,
        backlog: backlog,
        resolved: departmentResolved.length,
        averageHours: averageHours,
        atRisk: atRisk
      };
    });

    return {
      totalComplaints: complaints.length,
      resolutionRate: resolutionRate,
      averageResolutionHours: averageResolutionHours,
      criticalOpen: criticalOpen,
      overdueCount: overdueCount,
      duplicateClusters: duplicateClusters,
      averageCitizenRating: averageCitizenRating,
      totalCommunitySupport: totalCommunitySupport,
      statusCounts: statusCounts,
      categoryCounts: categoryCounts,
      sentimentCounts: sentimentCounts,
      emotionCounts: emotionCounts,
      imageFlags: imageFlags,
      wardHeatmap: wardHeatmap,
      districtSafetyOverview: districtSafetyOverview,
      liveMapPoints: liveMapPoints,
      complaintAreas: complaintAreas,
      trend: trend,
      predictiveSignals: predictiveSignals,
      departmentPerformance: departmentPerformance,
      aiHighlights: buildAiHighlights(complaints, wardHeatmap)
    };
  }

  function buildSevenDayTrend(complaints) {
    const days = [];
    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - index);
      days.push(date);
    }

    return days.map(function (date) {
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const count = complaints.filter(function (complaint) {
        const created = new Date(complaint.createdAt);
        return created >= date && created < nextDate;
      }).length;
      return {
        label: date.toLocaleDateString("en-IN", { weekday: "short" }),
        value: count
      };
    });
  }

  function buildAiHighlights(complaints, wardHeatmap) {
    const sortedWards = wardHeatmap.slice().sort(function (left, right) {
      return right.weightedPriority - left.weightedPriority;
    });
    const hottestWard = sortedWards[0] || { ward: "Ward 1", count: 0 };
    const waterCluster = complaints.filter(function (complaint) {
      return complaint.category === "Water" && complaint.district === "Raipur";
    }).length;
    const electricityCount = complaints.filter(function (complaint) {
      return complaint.category === "Electricity";
    }).length;

    return [
      {
        title: "Prioritize Raipur water cluster",
        body: waterCluster + " related complaints point to repeat infrastructure failure and possible network-level leakage."
      },
      {
        title: "Dispatch preventive night inspection",
        body: electricityCount + " electricity complaints suggest a targeted evening lighting sweep will likely reduce safety incidents."
      },
      {
        title: "Hottest ward right now: " + hottestWard.ward,
        body: "This ward has " + hottestWard.count + " complaints and the highest weighted priority load in the current dataset."
      }
    ];
  }

  function getRecentFeed(limit) {
    return getComplaints({ includeAll: true }).slice(0, limit || 5);
  }

  function getPublicServiceDirectory() {
    return clone(publicServiceDirectory);
  }

  function getComplaintTemplates() {
    return clone(complaintTemplates);
  }

  function getSupportContacts() {
    return clone(supportContacts);
  }

  function getDistrictDirectory() {
    return clone(districtDirectory);
  }

  function getOfficerDirectory() {
    return clone(officerDirectory);
  }

  function getOfficerProfile(name, department) {
    if (!name) {
      return null;
    }
    const departments = department ? [department] : Object.keys(officerDirectory);
    let match = null;

    departments.some(function (key) {
      const roster = officerDirectory[key] || [];
      match = roster.find(function (entry) {
        return entry && entry.name === name;
      }) || null;
      return !!match;
    });

    return match ? clone(match) : null;
  }

  function getVoiceAssistantReply(question, options) {
    const prompt = normalizeText(question);
    const context = options || {};
    const complaints = getComplaints({ includeAll: !!context.includeAll });
    const userComplaints = context.userId
      ? complaints.filter(function (entry) { return entry.citizenId === context.userId; })
      : complaints;
    const latestComplaint = userComplaints[0] || null;
    const analytics = getAnalytics();

    if (!prompt) {
      return {
        title: "Voice assistant ready",
        answer: "Ask me about your complaints, current priority, recommended department, image verification, or what to do next."
      };
    }

    if (prompt.includes("latest") || prompt.includes("recent")) {
      if (!latestComplaint) {
        return {
          title: "No recent complaint found",
          answer: "I could not find a recent complaint for you yet. You can submit one with text, image, or voice input."
        };
      }
      return {
        title: "Latest complaint summary",
        answer: "Your latest complaint is " + latestComplaint.title + ". It is marked " + latestComplaint.priorityLabel + ", assigned to " + latestComplaint.department + ", and currently " + prettifyStatus(latestComplaint.status) + "."
      };
    }

    if (prompt.includes("priority") || prompt.includes("urgent")) {
      if (!latestComplaint) {
        return {
          title: "Priority guidance",
          answer: "Priority is estimated from issue type, urgency words, emotion signals, location risk, and duplicate patterns."
        };
      }
      return {
        title: "Priority explanation",
        answer: latestComplaint.title + " is " + latestComplaint.priorityLabel + " with emotion signal " + latestComplaint.aiFeatures.emotionLabel + " and score " + latestComplaint.priorityScore + "."
      };
    }

    if (prompt.includes("department") || prompt.includes("assign")) {
      if (!latestComplaint) {
        return {
          title: "Routing guidance",
          answer: "Departments are selected from complaint category, ward context, and similar past cases."
        };
      }
      return {
        title: "Department recommendation",
        answer: latestComplaint.title + " is routed to " + latestComplaint.department + " under " + latestComplaint.assignedOfficer + ". Suggested action: " + latestComplaint.suggestedSolution
      };
    }

    if (prompt.includes("image") || prompt.includes("fake") || prompt.includes("verify")) {
      if (!latestComplaint || !latestComplaint.imageVerification) {
        return {
          title: "Image verification",
          answer: "Image verification checks for reused or low-confidence evidence against the current complaint set."
        };
      }
      return {
        title: "Evidence check",
        answer: "The latest image status is " + latestComplaint.imageVerification.status + " with " + latestComplaint.imageVerification.confidence + " percent confidence. " + latestComplaint.imageVerification.reason
      };
    }

    if (prompt.includes("heatmap") || prompt.includes("city") || prompt.includes("ward")) {
      const hottest = analytics.districtSafetyOverview.slice().sort(function (left, right) {
        return right.highPriority - left.highPriority || right.weightedPriority - left.weightedPriority;
      })[0];
      return {
        title: "City hotspot",
        answer: hottest
          ? hottest.district + " currently has the highest priority load with " + hottest.count + " complaints and " + hottest.highPriority + " high-priority cases."
          : "No district hotspot is available right now."
      };
    }

    if (prompt.includes("help") || prompt.includes("what should i do") || prompt.includes("next")) {
      return {
        title: "Next best action",
        answer: latestComplaint
          ? "For your latest complaint, keep the description specific, upload clear evidence, and watch for updates from " + latestComplaint.department + "."
          : "Start by describing the issue clearly, selecting the ward, and adding an image or voice complaint for better analysis."
      };
    }

    return {
      title: "AI guidance",
      answer: latestComplaint
        ? "I found your latest complaint, " + latestComplaint.title + ". It is " + latestComplaint.priorityLabel + ", assigned to " + latestComplaint.department + ", and the recommended fix is " + latestComplaint.suggestedSolution
        : "I can help explain priority, routing, heatmaps, image verification, and what to do next after filing a complaint."
    };
  }

  function resetDemoData() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
    initStore();
    broadcast({ type: "demo-reset" });
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        reject(new Error("Unable to read file."));
      };
      reader.readAsDataURL(file);
    });
  }

  function readBlobAsDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        reject(new Error("Unable to read blob."));
      };
      reader.readAsDataURL(blob);
    });
  }

  initStore();

  window.CivicPulse = {
    constants: constants,
    initStore: initStore,
    subscribe: subscribe,
    getSession: getSession,
    getCurrentUser: getCurrentUser,
    getUserById: getUserById,
    login: login,
    logout: logout,
    register: register,
    useDemoAccount: useDemoAccount,
    getComplaints: getComplaints,
    getComplaintById: getComplaintById,
    previewComplaint: previewComplaint,
    submitComplaint: submitComplaint,
    addMessage: addMessage,
    updateComplaintStatus: updateComplaintStatus,
    assignComplaint: assignComplaint,
    logComplaintProof: logComplaintProof,
    submitCitizenFeedback: submitCitizenFeedback,
    toggleCommunitySupport: toggleCommunitySupport,
    getCitizenMetrics: getCitizenMetrics,
    getAnalytics: getAnalytics,
    getRecentFeed: getRecentFeed,
    getPublicServiceDirectory: getPublicServiceDirectory,
    getComplaintTemplates: getComplaintTemplates,
    getSupportContacts: getSupportContacts,
    getDistrictDirectory: getDistrictDirectory,
    getOfficerDirectory: getOfficerDirectory,
    getOfficerProfile: getOfficerProfile,
    getVoiceAssistantReply: getVoiceAssistantReply,
    resetDemoData: resetDemoData,
    readFileAsDataUrl: readFileAsDataUrl,
    readBlobAsDataUrl: readBlobAsDataUrl,
    prettifyStatus: prettifyStatus
  };
})();
