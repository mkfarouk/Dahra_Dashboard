export const agriculturalData = {
            barley: {
                name: "Barley",
                icon: "🌾",
                color: "#8bc34a",
                avgEfficiency: 78.5,
                productionPerTon: 3.2,
                productionData: [850, 920, 980, 1050, 1120, 1180, 1250, 1320, 1380, 1450, 1520, 1580],
                amountData: [2500, 2650, 2800, 2950, 3100, 3250, 3400, 3550, 3700, 3850, 4000, 4150],
                currentProduction: 1580,
                lastYearProduction: 1450,
                varieties: [
                    { 
                        name: "Giza 123", 
                        location: [24.0889, 32.8998], 
                        total: 450, 
                        avg: 75.2,
                        color: "#8bc34a"
                    },
                    { 
                        name: "Giza 124", 
                        location: [24.1234, 32.9123], 
                        total: 380, 
                        avg: 82.1,
                        color: "#aed581"
                    },
                    { 
                        name: "Giza 2000", 
                        location: [24.0567, 32.8765], 
                        total: 520, 
                        avg: 78.9,
                        color: "#9ccc65"
                    }
                ]
            },
            bean: {
                name: "Bean",
                icon: "🫘",
                color: "#66bb6a",
                avgEfficiency: 95.2,
                productionPerTon: 4.87,
                productionData: [400, 420, 450, 460, 470, 475, 480, 485, 490, 495, 500, 505],
                amountData: [1200, 1280, 1350, 1420, 1480, 1550, 1620, 1690, 1760, 1830, 1900, 1970],
                currentProduction: 505,
                lastYearProduction: 495,
                varieties: [
                    { 
                        name: "Nebraska", 
                        location: [24.0789, 32.8898], 
                        total: 180, 
                        avg: 92.5,
                        color: "#66bb6a"
                    },
                    { 
                        name: "Cowpea", 
                        location: [24.1134, 32.9023], 
                        total: 165, 
                        avg: 97.8,
                        color: "#81c784"
                    },
                    { 
                        name: "White Bean", 
                        location: [24.0467, 32.8665], 
                        total: 160, 
                        avg: 95.3,
                        color: "#4caf50"
                    }
                ]
            },
            corn: {
                name: "Corn",
                icon: "🌽",
                color: "#aed581",
                avgEfficiency: 72.3,
                productionPerTon: 5.81,
                productionData: [1000, 1100, 1250, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100],
                amountData: [3500, 3750, 4000, 4250, 4500, 4750, 5000, 5250, 5500, 5750, 6000, 6250],
                currentProduction: 2100,
                lastYearProduction: 1900,
                varieties: [
                    { 
                        name: "Pioneer 30N11", 
                        location: [24.0689, 32.8798], 
                        total: 320, 
                        avg: 74.1,
                        color: "#aed581"
                    },
                    { 
                        name: "P2105", 
                        location: [24.1034, 32.8923], 
                        total: 280, 
                        avg: 71.8,
                        color: "#c5e1a5"
                    },
                    { 
                        name: "P3444", 
                        location: [24.0367, 32.8565], 
                        total: 290, 
                        avg: 73.2,
                        color: "#8bc34a"
                    },
                    { 
                        name: "32D99", 
                        location: [24.0889, 32.9098], 
                        total: 310, 
                        avg: 70.5,
                        color: "#9ccc65"
                    },
                    { 
                        name: "FINE SEEDS", 
                        location: [24.1234, 32.8823], 
                        total: 340, 
                        avg: 75.3,
                        color: "#689f38"
                    },
                    { 
                        name: "Tiger", 
                        location: [24.0567, 32.8965], 
                        total: 300, 
                        avg: 72.9,
                        color: "#7cb342"
                    },
                    { 
                        name: "HT2031", 
                        location: [24.0789, 32.8698], 
                        total: 260, 
                        avg: 69.7,
                        color: "#827717"
                    }
                ]
            },
            potatoes: {
                name: "Potatoes",
                icon: "🥔",
                color: "#81c784",
                avgEfficiency: 65.8,
                productionPerTon: 25.5,
                productionData: [2200, 2350, 2500, 2650, 2800, 2950, 3100, 3250, 3400, 3550, 3700, 3850],
                amountData: [8000, 8500, 9000, 9500, 10000, 10500, 11000, 11500, 12000, 12500, 13000, 13500],
                currentProduction: 3850,
                lastYearProduction: 3550,
                varieties: [
                    { 
                        name: "Rent", 
                        location: [24.0589, 32.8698], 
                        total: 1280, 
                        avg: 67.2,
                        color: "#81c784"
                    },
                    { 
                        name: "Spunta", 
                        location: [24.0934, 32.8823], 
                        total: 1350, 
                        avg: 65.1,
                        color: "#66bb6a"
                    },
                    { 
                        name: "Diamant", 
                        location: [24.0267, 32.8465], 
                        total: 1220, 
                        avg: 65.1,
                        color: "#4caf50"
                    }
                ]
            },
            soybean: {
                name: "Soybean",
                icon: "🌱",
                color: "#4caf50",
                avgEfficiency: 82.1,
                productionPerTon: 2.8,
                productionData: [320, 340, 360, 380, 400, 420, 440, 460, 480, 500, 520, 540],
                amountData: [950, 1020, 1090, 1160, 1230, 1300, 1370, 1440, 1510, 1580, 1650, 1720],
                currentProduction: 540,
                lastYearProduction: 500,
                varieties: [
                    { 
                        name: "Soybean", 
                        location: [24.0489, 32.8598], 
                        total: 280, 
                        avg: 83.5,
                        color: "#4caf50"
                    },
                    { 
                        name: "Soya been", 
                        location: [24.0834, 32.8723], 
                        total: 260, 
                        avg: 80.7,
                        color: "#66bb6a"
                    }
                ]
            },
            sugarbeet: {
                name: "Sugar Beet",
                icon: "🟣",
                color: "#66bb6a",
                avgEfficiency: 89.7,
                productionPerTon: 130.2,
                productionData: [250000, 260000, 265000, 270000, 272000, 274818, 276000, 278000, 280000, 282000, 284000, 286000],
                amountData: [280000, 285000, 290000, 295000, 300000, 305000, 310000, 315000, 320000, 325000, 330000, 335000],
                currentProduction: 286000,
                lastYearProduction: 282000,
                varieties: [
                    { 
                        name: "Salama", 
                        location: [24.0389, 32.8498], 
                        total: 35750, 
                        avg: 91.2,
                        color: "#66bb6a"
                    },
                    { 
                        name: "Gustav", 
                        location: [24.0734, 32.8623], 
                        total: 36200, 
                        avg: 89.8,
                        color: "#81c784"
                    },
                    { 
                        name: "Elmo", 
                        location: [24.0167, 32.8365], 
                        total: 35500, 
                        avg: 88.5,
                        color: "#4caf50"
                    },
                    { 
                        name: "Concretia", 
                        location: [24.0889, 32.8998], 
                        total: 36800, 
                        avg: 90.3,
                        color: "#8bc34a"
                    },
                    { 
                        name: "Scotta", 
                        location: [24.1134, 32.9023], 
                        total: 36100, 
                        avg: 89.1,
                        color: "#aed581"
                    },
                    { 
                        name: "Allanya", 
                        location: [24.0467, 32.8665], 
                        total: 35900, 
                        avg: 88.9,
                        color: "#9ccc65"
                    },
                    { 
                        name: "Smart Djerba", 
                        location: [24.0789, 32.8898], 
                        total: 36400, 
                        avg: 90.7,
                        color: "#689f38"
                    },
                    { 
                        name: "Amelie", 
                        location: [24.0567, 32.8765], 
                        total: 36350, 
                        avg: 89.5,
                        color: "#7cb342"
                    }
                ]
            },
            wheat: {
                name: "Wheat",
                icon: "🌾",
                color: "#8bc34a",
                avgEfficiency: 85.4,
                productionPerTon: 6.72,
                productionData: [3000, 3200, 3100, 2800, 3300, 3500, 3700, 3900, 4100, 4300, 4500, 4700],
                amountData: [12000, 12500, 13000, 13500, 14000, 14500, 15000, 15500, 16000, 16500, 17000, 17500],
                currentProduction: 4700,
                lastYearProduction: 4300,
                varieties: [
                    { 
                        name: "Misr 1", 
                        location: [24.0289, 32.8398], 
                        total: 1200, 
                        avg: 86.2,
                        color: "#8bc34a"
                    },
                    { 
                        name: "MIWOK", 
                        location: [24.0634, 32.8523], 
                        total: 1150, 
                        avg: 84.8,
                        color: "#aed581"
                    },
                    { 
                        name: "Dkc6919", 
                        location: [24.0067, 32.8265], 
                        total: 1180, 
                        avg: 85.1,
                        color: "#9ccc65"
                    },
                    { 
                        name: "Wheat Trial", 
                        location: [24.0789, 32.8798], 
                        total: 1170, 
                        avg: 85.9,
                        color: "#689f38"
                    }
                ]
            },
            alfalfa: {
                name: "Alfalfa",
                icon: "🌿",
                color: "#4caf50",
                avgEfficiency: 68.5,
                productionPerTon: 1.17,
                productionData: [1200, 1350, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300],
                amountData: [4500, 4750, 5000, 5250, 5500, 5750, 6000, 6250, 6500, 6750, 7000, 7250],
                currentProduction: 2300,
                lastYearProduction: 2100,
                varieties: [
                    { 
                        name: "AFX 1060", 
                        location: [24.0189, 32.8298], 
                        total: 780, 
                        avg: 69.8,
                        color: "#4caf50"
                    },
                    { 
                        name: "Alfa master 10", 
                        location: [24.0534, 32.8423], 
                        total: 760, 
                        avg: 67.2,
                        color: "#66bb6a"
                    },
                    { 
                        name: "Pegasis", 
                        location: [23.9967, 32.8165], 
                        total: 760, 
                        avg: 68.5,
                        color: "#81c784"
                    }
                ]
            }
        };
// Provide legacy globals for any leftover inline scripts
try {
  if (typeof window !== 'undefined') {
    window.agriculturalData = agriculturalData;
    window.locationData = locationData;
  }
} catch (_) {}

        // Location-specific data for comparison with monthly data
export const locationData = {
            toshka: {
                name: "Toshka",
                coordinates: [24.0889, 32.8998],
                weather: {
                    temp: 28,
                    condition: "Sunny",
                    wind: 15,
                    humidity: 45,
                    pressure: 1015,
                    visibility: 12
                },
                monthlyData: {
                    barley: [1180, 1250, 1320, 1380, 1450, 1520, 1580, 1650, 1720, 1780, 1850, 1920],
                    bean: [475, 485, 495, 505, 515, 525, 535, 545, 555, 565, 575, 585],
                    corn: [1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600],
                    potatoes: [2950, 3100, 3250, 3400, 3550, 3700, 3850, 4000, 4150, 4300, 4450, 4600],
                    soybean: [420, 440, 460, 480, 500, 520, 540, 560, 580, 600, 620, 640],
                    sugarbeet: [137409, 138000, 139000, 140000, 141000, 142000, 143000, 144000, 145000, 146000, 147000, 148000],
                    wheat: [17637, 17800, 18000, 18200, 18400, 18600, 18800, 19000, 19200, 19400, 19600, 19800],
                    alfalfa: [8482, 8600, 8720, 8840, 8960, 9080, 9200, 9320, 9440, 9560, 9680, 9800]
                },
                crops: {
                    barley: { production: 1180, avg: 78.5 },
                    bean: { production: 475, avg: 95.2 },
                    corn: { production: 1500, avg: 72.3 },
                    potatoes: { production: 2950, avg: 65.8 },
                    soybean: { production: 420, avg: 82.1 },
                    sugarbeet: { production: 137409, avg: 89.7 },
                    wheat: { production: 17637, avg: 85.4 },
                    alfalfa: { production: 8482, avg: 68.5 }
                }
            },
            eastowinat: {
                name: "East Oweinat",
                coordinates: [22.5833, 28.7167],
                weather: {
                    temp: 22,
                    condition: "Partly Cloudy",
                    wind: 8,
                    humidity: 75,
                    pressure: 1011,
                    visibility: 8
                },
                monthlyData: {
                    barley: [1150, 1220, 1290, 1360, 1430, 1500, 1570, 1640, 1710, 1780, 1850, 1920],
                    bean: [465, 475, 485, 495, 505, 515, 525, 535, 545, 555, 565, 575],
                    corn: [1480, 1580, 1680, 1780, 1880, 1980, 2080, 2180, 2280, 2380, 2480, 2580],
                    potatoes: [2900, 3050, 3200, 3350, 3500, 3650, 3800, 3950, 4100, 4250, 4400, 4550],
                    soybean: [410, 430, 450, 470, 490, 510, 530, 550, 570, 590, 610, 630],
                    sugarbeet: [135200, 136000, 137000, 138000, 139000, 140000, 141000, 142000, 143000, 144000, 145000, 146000],
                    wheat: [17400, 17600, 17800, 18000, 18200, 18400, 18600, 18800, 19000, 19200, 19400, 19600],
                    alfalfa: [8300, 8420, 8540, 8660, 8780, 8900, 9020, 9140, 9260, 9380, 9500, 9620]
                },
                crops: {
                    barley: { production: 1150, avg: 76.2 },
                    bean: { production: 465, avg: 93.8 },
                    corn: { production: 1480, avg: 70.1 },
                    potatoes: { production: 2900, avg: 63.5 },
                    soybean: { production: 410, avg: 80.3 },
                    sugarbeet: { production: 135200, avg: 87.9 },
                    wheat: { production: 17400, avg: 83.2 },
                    alfalfa: { production: 8300, avg: 66.8 }
                }
            }
        };