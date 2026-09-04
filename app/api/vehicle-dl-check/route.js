const STATE_RTO_MAP = {
  DL: {
    state: "Delhi",
    rtos: {
      "01": "Mall Road (North Delhi)",
      "02": "IP Depot (New Delhi)",
      "03": "Sheikh Sarai (South Delhi)",
      "04": "Janakpuri (West Delhi)",
      "05": "Loni Road (North East Delhi)",
      "06": "Sarai Kale Khan (Central Delhi)",
      "07": "Mayur Vihar (East Delhi)",
      "08": "Wazirpur (North West Delhi)",
      "09": "Palam (South West Delhi)",
      "10": "Raja Garden (West Delhi II)",
      "11": "Rohini (North West Delhi II)",
      "12": "Vasant Vihar (South West Delhi II)",
    },
  },
  MH: {
    state: "Maharashtra",
    rtos: {
      "01": "Mumbai (South)",
      "02": "Mumbai (West / Andheri)",
      "03": "Mumbai (East / Wadala)",
      "04": "Thane",
      "05": "Kalyan",
      "09": "Kolhapur",
      "12": "Pune",
      "14": "Pimpri-Chinchwad",
      "15": "Nashik",
      "20": "Aurangabad",
      "31": "Nagpur (Urban)",
      "43": "Navi Mumbai (Vashi)",
      "46": "Navi Mumbai (Panvel)",
    },
  },
  KA: {
    state: "Karnataka",
    rtos: {
      "01": "Bengaluru Central (Koramangala)",
      "02": "Bengaluru West (Rajajinagar)",
      "03": "Bengaluru East (Indiranagar)",
      "04": "Bengaluru North (Yeshwanthpur)",
      "05": "Bengaluru South (Jayanagar)",
      "09": "Mysuru West",
      "19": "Mangaluru",
      "51": "Bengaluru Electronics City",
      "53": "Bengaluru K.R. Puram",
    },
  },
  KL: {
    state: "Kerala",
    rtos: {
      "01": "Thiruvananthapuram",
      "07": "Ernakulam / Kochi",
      "08": "Thrissur",
      "10": "Malappuram",
      "11": "Kozhikode",
      "13": "Kannur",
    },
  },
  TN: {
    state: "Tamil Nadu",
    rtos: {
      "01": "Chennai Central (Ayanavaram)",
      "02": "Chennai North West (Anna Nagar)",
      "03": "Chennai North East (Tondiarpet)",
      "04": "Chennai East",
      "05": "Chennai North (Kolathur)",
      "07": "Chennai South (Thiruvanmiyur)",
      "09": "Chennai West (K.K. Nagar)",
      "37": "Coimbatore South",
      "38": "Coimbatore North",
      "58": "Madurai South",
    },
  },
  GJ: {
    state: "Gujarat",
    rtos: {
      "01": "Ahmedabad",
      "03": "Rajkot",
      "05": "Surat",
      "06": "Vadodara",
      "27": "Ahmedabad East (Vastral)",
    },
  },
  UP: {
    state: "Uttar Pradesh",
    rtos: {
      "14": "Ghaziabad",
      "16": "Noida / Gautam Buddha Nagar",
      "32": "Lucknow",
      "70": "Allahabad / Prayagraj",
      "78": "Kanpur Nagar",
      "65": "Varanasi",
    },
  },
  HR: {
    state: "Haryana",
    rtos: {
      "26": "Gurugram (North)",
      "55": "Gurugram (Commercial)",
      "72": "Gurugram (South)",
      "51": "Faridabad",
      "03": "Panchkula",
    },
  },
  RJ: {
    state: "Rajasthan",
    rtos: {
      "14": "Jaipur (South)",
      "45": "Jaipur (North)",
      "19": "Jodhpur",
      "27": "Udaipur",
    },
  },
  WB: {
    state: "West Bengal",
    rtos: {
      "01": "Kolkata (Beltala)",
      "02": "Kolkata (Public Vehicles Dept)",
      "06": "Howrah",
      "26": "Barasat (North 24 Parganas)",
    },
  },
  TS: {
    state: "Telangana",
    rtos: {
      "07": "Hyderabad (Khairatabad)",
      "08": "Hyderabad (Secunderabad)",
      "09": "Hyderabad (Charminar)",
      "10": "Hyderabad (Bandlaguda)",
    },
  },
  AP: {
    state: "Andhra Pradesh",
    rtos: {
      "16": "Vijayawada (Krishna)",
      "31": "Visakhapatnam",
      "05": "Kakinada",
    },
  },
};

export async function POST(req) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return Response.json({ error: "Vehicle RC or Driving License number is required" }, { status: 400 });
    }

    const clean = query.trim().toUpperCase().replace(/[\s-]/g, "");

    // 1. Check for Bharat Series (e.g. "22BH1234AA")
    const isBH = /^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/.test(clean);
    if (isBH) {
      const year = `20${clean.slice(0, 2)}`;
      const regNum = clean.slice(4, 8);
      const seriesLetters = clean.slice(8);
      return Response.json({
        raw: query,
        clean,
        type: "VEHICLE_RC_BH_SERIES",
        isVehicleRC: true,
        isDrivingLicense: false,
        state: "All India (Bharat Series)",
        rtoOffice: "Integrated Central Road Transport Register",
        issueYear: year,
        number: regNum,
        series: seriesLetters,
        summary: `Valid All-India Bharat Series (BH) Vehicle Registration issued in ${year}.`,
        parivahanPortal: "https://parivahan.gov.in/rcdlstatus/",
      });
    }

    // 2. Check for Driving License (15 or 16 chars: SS-RR-YYYY-NNNNNNN)
    const dlRegex = /^([A-Z]{2})([0-9]{2})([0-9]{4})([0-9]{7})$/;
    const dlMatch = clean.match(dlRegex);
    if (dlMatch) {
      const stateCode = dlMatch[1];
      const rtoCode = dlMatch[2];
      const issueYear = parseInt(dlMatch[3], 10);
      const uniqueNum = dlMatch[4];

      const stateInfo = STATE_RTO_MAP[stateCode] || { state: stateCode, rtos: {} };
      const rtoName = stateInfo.rtos[rtoCode] || `RTO Code ${rtoCode}`;

      const currentYear = new Date().getFullYear();
      const isValidYear = issueYear >= 1950 && issueYear <= currentYear;

      return Response.json({
        raw: query,
        clean,
        type: "DRIVING_LICENSE",
        isVehicleRC: false,
        isDrivingLicense: true,
        stateCode,
        state: stateInfo.state,
        rtoCode,
        rtoOffice: rtoName,
        issueYear,
        isValidYear,
        licenseNumber: uniqueNum,
        summary: `Standard Indian Driving License issued in ${issueYear} by ${rtoName}, ${stateInfo.state}.`,
        parivahanPortal: "https://parivahan.gov.in/rcdlstatus/",
      });
    }

    // 3. Check for Standard Vehicle RC (e.g. MH12AB1234, DL01A1234, KA05MB9999)
    const rcRegex = /^([A-Z]{2})([0-9]{1,2})([A-Z]{0,3})([0-9]{4})$/;
    const rcMatch = clean.match(rcRegex);
    if (rcMatch) {
      const stateCode = rcMatch[1];
      const rtoCode = rcMatch[2].padStart(2, "0");
      const series = rcMatch[3] || "";
      const vehicleNumber = rcMatch[4];

      const stateInfo = STATE_RTO_MAP[stateCode] || { state: stateCode, rtos: {} };
      const rtoName = stateInfo.rtos[rtoCode] || `District RTO ${rtoCode}`;

      return Response.json({
        raw: query,
        clean,
        type: "VEHICLE_RC",
        isVehicleRC: true,
        isDrivingLicense: false,
        stateCode,
        state: stateInfo.state,
        rtoCode,
        rtoOffice: rtoName,
        series: series || "General",
        vehicleNumber,
        formatted: `${stateCode}-${rtoCode}${series ? `-${series}` : ""}-${vehicleNumber}`,
        summary: `Standard Indian Vehicle Registration registered at ${rtoName}, ${stateInfo.state}.`,
        parivahanPortal: "https://parivahan.gov.in/rcdlstatus/",
      });
    }

    return Response.json({
      raw: query,
      clean,
      isValid: false,
      message: "Could not identify vehicle RC or driving license syntax. Examples: 'MH12AB1234' (Vehicle) or 'DL0120150012345' (Driving License).",
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
