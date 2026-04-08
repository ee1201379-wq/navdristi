(function () {
  window.ChhattisgarhData = {
    defaultDistrict: "Raipur",
    stateBounds: {
      north: 24.6,
      south: 17.8,
      east: 84.5,
      west: 80.2
    },
    wardDistrictMap: {
      "Ward 1": "Bilaspur",
      "Ward 2": "Raipur",
      "Ward 3": "Durg",
      "Ward 4": "Korba",
      "Ward 5": "Raipur",
      "Ward 6": "Bastar",
      "Ward 7": "Raigarh",
      "Ward 8": "Mahasamund"
    },
    divisions: [
      {
        name: "Surguja division",
        headquarters: "Ambikapur",
        region: "North Chhattisgarh",
        districts: [
          "Balrampur-Ramanujganj",
          "Jashpur",
          "Koriya",
          "Manendragarh",
          "Surajpur",
          "Surguja"
        ]
      },
      {
        name: "Bilaspur division",
        headquarters: "Bilaspur",
        region: "North-Central Chhattisgarh",
        districts: [
          "Bilaspur",
          "Gaurella-Pendra-Marwahi",
          "Janjgir-Champa",
          "Korba",
          "Mungeli",
          "Raigarh",
          "Sakti",
          "Sarangarh-Bilaigarh"
        ]
      },
      {
        name: "Raipur division",
        headquarters: "Raipur",
        region: "East-Central Chhattisgarh",
        districts: [
          "Baloda Bazar-Bhatapara",
          "Dhamtari",
          "Gariaband",
          "Mahasamund",
          "Raipur"
        ]
      },
      {
        name: "Durg division",
        headquarters: "Durg",
        region: "West-Central Chhattisgarh",
        districts: [
          "Balod",
          "Bemetara",
          "Durg",
          "Kabirdham (Kawardha)",
          "Khairagarh-Chhuikhadan-Gandai",
          "Mohla-Manpur-Ambagarh Chowki",
          "Rajnandgaon"
        ]
      },
      {
        name: "Bastar division",
        headquarters: "Jagdalpur",
        region: "South Chhattisgarh",
        districts: [
          "Bastar",
          "Bijapur",
          "Dantewada (Dakshin Bastar)",
          "Kanker (Uttar Bastar)",
          "Kondagaon",
          "Narayanpur",
          "Sukma"
        ]
      }
    ],
    districts: [
      { name: "Balrampur-Ramanujganj", headquarters: "Balrampur", division: "Surguja division", divisionHeadquarters: "Ambikapur", region: "North Chhattisgarh", lat: 23.62, lng: 83.61, safetyBaseline: 76, roads: ["NH 343", "Ramanujganj Main Road", "Rajpur-Balrampur Road"] },
      { name: "Jashpur", headquarters: "Jashpur Nagar", division: "Surguja division", divisionHeadquarters: "Ambikapur", region: "North Chhattisgarh", lat: 22.88, lng: 84.14, safetyBaseline: 79, roads: ["NH 43", "Jashpur-Kunkuri Road", "Main Chowk Road"] },
      { name: "Koriya", aliases: ["Korea"], headquarters: "Baikunthpur", division: "Surguja division", divisionHeadquarters: "Ambikapur", region: "North Chhattisgarh", lat: 23.25, lng: 82.56, safetyBaseline: 78, roads: ["NH 43", "Baikunthpur-Manendragarh Road", "Patna Road"] },
      { name: "Manendragarh", aliases: ["Manendragarh-Chirmiri-Bharatpur"], headquarters: "Manendragarh", division: "Surguja division", divisionHeadquarters: "Ambikapur", region: "North Chhattisgarh", lat: 23.2, lng: 82.35, safetyBaseline: 76, roads: ["Manendragarh-Chirmiri Road", "Bharatpur Main Road", "Station Road"] },
      { name: "Surajpur", headquarters: "Surajpur", division: "Surguja division", divisionHeadquarters: "Ambikapur", region: "North Chhattisgarh", lat: 23.22, lng: 82.87, safetyBaseline: 79, roads: ["NH 43", "Surajpur-Ambikapur Road", "Bhatgaon Road"] },
      { name: "Surguja", headquarters: "Ambikapur", division: "Surguja division", divisionHeadquarters: "Ambikapur", region: "North Chhattisgarh", lat: 23.12, lng: 83.2, safetyBaseline: 80, roads: ["NH 43", "MG Road Ambikapur", "Banaras Road"] },
      { name: "Bilaspur", headquarters: "Bilaspur", division: "Bilaspur division", divisionHeadquarters: "Bilaspur", region: "North-Central Chhattisgarh", lat: 22.08, lng: 82.15, safetyBaseline: 81, roads: ["NH 130", "Link Road Bilaspur", "Sarkanda Main Road"] },
      { name: "Gaurella-Pendra-Marwahi", aliases: ["Gaurela-Pendra-Marwahi"], headquarters: "Gaurella", division: "Bilaspur division", divisionHeadquarters: "Bilaspur", region: "North-Central Chhattisgarh", lat: 22.77, lng: 81.89, safetyBaseline: 77, roads: ["Pendra Road", "Marwahi Main Road", "Gaurella-Amarkantak Road"] },
      { name: "Janjgir-Champa", headquarters: "Janjgir", division: "Bilaspur division", divisionHeadquarters: "Bilaspur", region: "North-Central Chhattisgarh", lat: 22.01, lng: 82.58, safetyBaseline: 76, roads: ["NH 49", "Janjgir-Champa Road", "Station Road Champa"] },
      { name: "Korba", headquarters: "Korba", division: "Bilaspur division", divisionHeadquarters: "Bilaspur", region: "North-Central Chhattisgarh", lat: 22.35, lng: 82.69, safetyBaseline: 72, roads: ["NH 149B", "TP Nagar Road", "Power House Road"] },
      { name: "Mungeli", headquarters: "Mungeli", division: "Bilaspur division", divisionHeadquarters: "Bilaspur", region: "North-Central Chhattisgarh", lat: 22.07, lng: 81.68, safetyBaseline: 80, roads: ["Mungeli-Bilaspur Road", "Lormi Road", "Main Chowk Road"] },
      { name: "Raigarh", headquarters: "Raigarh", division: "Bilaspur division", divisionHeadquarters: "Bilaspur", region: "North-Central Chhattisgarh", lat: 21.9, lng: 83.39, safetyBaseline: 77, roads: ["NH 49", "Chakradhar Nagar Road", "Station Road Raigarh"] },
      { name: "Sakti", headquarters: "Sakti", division: "Bilaspur division", divisionHeadquarters: "Bilaspur", region: "North-Central Chhattisgarh", lat: 22.03, lng: 82.96, safetyBaseline: 77, roads: ["Sakti-Champa Road", "Jaijaipur Road", "Main Market Road"] },
      { name: "Sarangarh-Bilaigarh", headquarters: "Sarangarh", division: "Bilaspur division", divisionHeadquarters: "Bilaspur", region: "North-Central Chhattisgarh", lat: 21.59, lng: 83.08, safetyBaseline: 76, roads: ["Sarangarh-Bilaigarh Road", "Raigarh Road", "Town Hall Road"] },
      { name: "Baloda Bazar-Bhatapara", headquarters: "Baloda Bazar", division: "Raipur division", divisionHeadquarters: "Raipur", region: "East-Central Chhattisgarh", lat: 21.66, lng: 82.16, safetyBaseline: 74, roads: ["NH 130B", "Bhatapara-Baloda Bazar Road", "Kasdol Road"] },
      { name: "Dhamtari", headquarters: "Dhamtari", division: "Raipur division", divisionHeadquarters: "Raipur", region: "East-Central Chhattisgarh", lat: 20.71, lng: 81.55, safetyBaseline: 77, roads: ["NH 30", "Rudri Road", "Sihawa Road"] },
      { name: "Gariaband", headquarters: "Gariaband", division: "Raipur division", divisionHeadquarters: "Raipur", region: "East-Central Chhattisgarh", lat: 20.63, lng: 82.06, safetyBaseline: 75, roads: ["NH 130C", "Rajim-Gariaband Road", "Main Market Road"] },
      { name: "Mahasamund", headquarters: "Mahasamund", division: "Raipur division", divisionHeadquarters: "Raipur", region: "East-Central Chhattisgarh", lat: 21.11, lng: 82.09, safetyBaseline: 79, roads: ["NH 53", "Bagbahara Road", "Main Market Road"] },
      { name: "Raipur", headquarters: "Raipur", division: "Raipur division", divisionHeadquarters: "Raipur", region: "East-Central Chhattisgarh", lat: 21.25, lng: 81.63, safetyBaseline: 75, roads: ["GE Road", "VIP Road", "Telibandha Main Road"] },
      { name: "Balod", headquarters: "Balod", division: "Durg division", divisionHeadquarters: "Durg", region: "West-Central Chhattisgarh", lat: 20.73, lng: 81.2, safetyBaseline: 78, roads: ["NH 930", "Balod-Dalli Rajhara Road", "Gunderdehi Main Road"] },
      { name: "Bemetara", headquarters: "Bemetara", division: "Durg division", divisionHeadquarters: "Durg", region: "West-Central Chhattisgarh", lat: 21.71, lng: 81.53, safetyBaseline: 79, roads: ["SH 9", "Bemetara-Kawardha Road", "Saja Road"] },
      { name: "Durg", headquarters: "Durg", division: "Durg division", divisionHeadquarters: "Durg", region: "West-Central Chhattisgarh", lat: 21.19, lng: 81.28, safetyBaseline: 80, roads: ["NH 53", "GE Road", "Station Road Durg"] },
      { name: "Kabirdham (Kawardha)", aliases: ["Kabirdham"], headquarters: "Kawardha", division: "Durg division", divisionHeadquarters: "Durg", region: "West-Central Chhattisgarh", lat: 22.01, lng: 81.25, safetyBaseline: 78, roads: ["NH 130A", "Kawardha-Raipur Road", "Pipariya Road"] },
      { name: "Khairagarh-Chhuikhadan-Gandai", headquarters: "Khairagarh", division: "Durg division", divisionHeadquarters: "Durg", region: "West-Central Chhattisgarh", lat: 21.42, lng: 80.98, safetyBaseline: 77, roads: ["Khairagarh-Rajnandgaon Road", "Gandai Main Road", "Chhuikhadan Road"] },
      { name: "Mohla-Manpur-Ambagarh Chowki", headquarters: "Mohla", division: "Durg division", divisionHeadquarters: "Durg", region: "West-Central Chhattisgarh", lat: 20.64, lng: 80.74, safetyBaseline: 71, roads: ["Mohla-Manpur Road", "Ambagarh Chowki Main Road", "Rajnandgaon Link Road"] },
      { name: "Rajnandgaon", headquarters: "Rajnandgaon", division: "Durg division", divisionHeadquarters: "Durg", region: "West-Central Chhattisgarh", lat: 21.1, lng: 81.03, safetyBaseline: 78, roads: ["NH 53", "Station Road Rajnandgaon", "Mamta Nagar Road"] },
      { name: "Bastar", headquarters: "Jagdalpur", division: "Bastar division", divisionHeadquarters: "Jagdalpur", region: "South Chhattisgarh", lat: 19.07, lng: 82.03, safetyBaseline: 70, roads: ["NH 30", "Jagdalpur-Naidupeta Road", "Dharampura Road"] },
      { name: "Bijapur", headquarters: "Bijapur", division: "Bastar division", divisionHeadquarters: "Jagdalpur", region: "South Chhattisgarh", lat: 18.84, lng: 80.83, safetyBaseline: 62, roads: ["NH 163", "Bijapur-Bhopalpatnam Road", "Gangaloor Road"] },
      { name: "Dantewada (Dakshin Bastar)", aliases: ["Dantewada"], headquarters: "Dantewada", division: "Bastar division", divisionHeadquarters: "Jagdalpur", region: "South Chhattisgarh", lat: 18.9, lng: 81.35, safetyBaseline: 65, roads: ["NH 63", "Dantewada-Geedam Road", "Bus Stand Road"] },
      { name: "Kanker (Uttar Bastar)", aliases: ["Kanker"], headquarters: "Kanker", division: "Bastar division", divisionHeadquarters: "Jagdalpur", region: "South Chhattisgarh", lat: 20.27, lng: 81.49, safetyBaseline: 74, roads: ["NH 30", "Kanker-Kondagaon Road", "Main Bazaar Road"] },
      { name: "Kondagaon", headquarters: "Kondagaon", division: "Bastar division", divisionHeadquarters: "Jagdalpur", region: "South Chhattisgarh", lat: 19.6, lng: 81.67, safetyBaseline: 73, roads: ["NH 30", "Keshkal Road", "Kondagaon Market Road"] },
      { name: "Narayanpur", headquarters: "Narayanpur", division: "Bastar division", divisionHeadquarters: "Jagdalpur", region: "South Chhattisgarh", lat: 19.72, lng: 81.25, safetyBaseline: 68, roads: ["NH 130D", "Narayanpur-Kondagaon Road", "Orchha Road"] },
      { name: "Sukma", headquarters: "Sukma", division: "Bastar division", divisionHeadquarters: "Jagdalpur", region: "South Chhattisgarh", lat: 18.39, lng: 81.66, safetyBaseline: 63, roads: ["NH 30", "Sukma-Dornapal Road", "Konta Road"] }
    ],
    officersByDepartment: {
      "Water Board": [
        { name: "Asha Nair", role: "Executive Engineer", district: "Raipur", phone: "+91 77140 21011", email: "asha.nair@navdristi.demo" },
        { name: "Rahul Singh", role: "Field Engineer", district: "Bilaspur", phone: "+91 77522 21012", email: "rahul.singh@navdristi.demo" },
        { name: "Priyanka Sahu", role: "Zone Officer", district: "Durg", phone: "+91 78840 21013", email: "priyanka.sahu@navdristi.demo" },
        { name: "Manoj Verma", role: "Pipeline Supervisor", district: "Korba", phone: "+91 77592 21014", email: "manoj.verma@navdristi.demo" },
        { name: "Nitin Yadav", role: "Leak Response Officer", district: "Mahasamund", phone: "+91 77232 21015", email: "nitin.yadav@navdristi.demo" },
        { name: "Shreya Das", role: "District Water Analyst", district: "Raigarh", phone: "+91 77622 21016", email: "shreya.das@navdristi.demo" }
      ],
      "Roads & Works": [
        { name: "Karan Menon", role: "Road Maintenance Lead", district: "Durg", phone: "+91 78840 32011", email: "karan.menon@navdristi.demo" },
        { name: "Ishita Paul", role: "Pothole Response Officer", district: "Raipur", phone: "+91 77140 32012", email: "ishita.paul@navdristi.demo" },
        { name: "Rohit Tiwari", role: "Bridge and Road Inspector", district: "Bilaspur", phone: "+91 77522 32013", email: "rohit.tiwari@navdristi.demo" },
        { name: "Deepak Netam", role: "Highway Coordination Officer", district: "Bastar", phone: "+91 77822 32014", email: "deepak.netam@navdristi.demo" },
        { name: "Sonal Agrawal", role: "Traffic Repair Planner", district: "Raigarh", phone: "+91 77622 32015", email: "sonal.agrawal@navdristi.demo" },
        { name: "Harshita Jain", role: "Urban Works Supervisor", district: "Korba", phone: "+91 77592 32016", email: "harshita.jain@navdristi.demo" }
      ],
      "Electricity Cell": [
        { name: "Neha Kapoor", role: "Electrical Response Lead", district: "Raipur", phone: "+91 77140 43011", email: "neha.kapoor@navdristi.demo" },
        { name: "Aditya Jain", role: "Streetlight Supervisor", district: "Bilaspur", phone: "+91 77522 43012", email: "aditya.jain@navdristi.demo" },
        { name: "Ritika Sen", role: "Feeder Line Officer", district: "Durg", phone: "+91 78840 43013", email: "ritika.sen@navdristi.demo" },
        { name: "Sushil Patel", role: "Transformer Support Engineer", district: "Korba", phone: "+91 77592 43014", email: "sushil.patel@navdristi.demo" },
        { name: "Ananya Gupta", role: "Night Safety Officer", district: "Raigarh", phone: "+91 77622 43015", email: "ananya.gupta@navdristi.demo" },
        { name: "Hemant Sinha", role: "Grid Operations Officer", district: "Surguja", phone: "+91 77742 43016", email: "hemant.sinha@navdristi.demo" }
      ],
      "Sanitation Department": [
        { name: "Deepa Joseph", role: "Sanitation Control Lead", district: "Raipur", phone: "+91 77140 54011", email: "deepa.joseph@navdristi.demo" },
        { name: "Farhan Ali", role: "Waste Collection Supervisor", district: "Bilaspur", phone: "+91 77522 54012", email: "farhan.ali@navdristi.demo" },
        { name: "Pallavi Mishra", role: "Market Cleanliness Officer", district: "Durg", phone: "+91 78840 54013", email: "pallavi.mishra@navdristi.demo" },
        { name: "Narendra Kashyap", role: "Drainage Inspector", district: "Bastar", phone: "+91 77822 54014", email: "narendra.kashyap@navdristi.demo" },
        { name: "Ankit Soni", role: "Solid Waste Officer", district: "Korba", phone: "+91 77592 54015", email: "ankit.soni@navdristi.demo" },
        { name: "Meenal Thakur", role: "Urban Health Liaison", district: "Mahasamund", phone: "+91 77232 54016", email: "meenal.thakur@navdristi.demo" }
      ],
      "Public Safety Cell": [
        { name: "Vikram Rao", role: "Emergency Response Lead", district: "Raipur", phone: "+91 77140 65011", email: "vikram.rao@navdristi.demo" },
        { name: "Nisha Das", role: "Citizen Safety Officer", district: "Bilaspur", phone: "+91 77522 65012", email: "nisha.das@navdristi.demo" },
        { name: "Ramesh Baghel", role: "Hazard Mitigation Officer", district: "Bastar", phone: "+91 77822 65013", email: "ramesh.baghel@navdristi.demo" },
        { name: "Kriti Sharma", role: "School Safety Coordinator", district: "Durg", phone: "+91 78840 65014", email: "kriti.sharma@navdristi.demo" },
        { name: "Alok Dwivedi", role: "Industrial Safety Officer", district: "Korba", phone: "+91 77592 65015", email: "alok.dwivedi@navdristi.demo" },
        { name: "Sanjana Lal", role: "Field Escalation Officer", district: "Raigarh", phone: "+91 77622 65016", email: "sanjana.lal@navdristi.demo" }
      ]
    }
  };
})();
