/** LATAM expansion; regions are editorial references, NOT measured demand. */
export const EXPANSION_COUNTRY_CODES = ["MX","GT","SV","HN","NI","CR","PA","CO","EC","VE","DO"] as const;
export const EXPANSION_COUNTRIES = {
  "MX": {
    "code": "MX",
    "name": "México",
    "flag": "🇲🇽",
    "locale": "es-MX",
    "currency": "MXN",
    "subdivisionLabel": "Estado",
    "mapCenter": [
      23.63,
      -102.55
    ],
    "mapZoom": 5
  },
  "GT": {
    "code": "GT",
    "name": "Guatemala",
    "flag": "🇬🇹",
    "locale": "es-GT",
    "currency": "GTQ",
    "subdivisionLabel": "Departamento",
    "mapCenter": [
      15.78,
      -90.23
    ],
    "mapZoom": 7
  },
  "SV": {
    "code": "SV",
    "name": "El Salvador",
    "flag": "🇸🇻",
    "locale": "es-SV",
    "currency": "USD",
    "subdivisionLabel": "Departamento",
    "mapCenter": [
      13.79,
      -88.9
    ],
    "mapZoom": 8
  },
  "HN": {
    "code": "HN",
    "name": "Honduras",
    "flag": "🇭🇳",
    "locale": "es-HN",
    "currency": "HNL",
    "subdivisionLabel": "Departamento",
    "mapCenter": [
      14.74,
      -86.46
    ],
    "mapZoom": 7
  },
  "NI": {
    "code": "NI",
    "name": "Nicaragua",
    "flag": "🇳🇮",
    "locale": "es-NI",
    "currency": "NIO",
    "subdivisionLabel": "Departamento o región autónoma",
    "mapCenter": [
      12.87,
      -85.21
    ],
    "mapZoom": 7
  },
  "CR": {
    "code": "CR",
    "name": "Costa Rica",
    "flag": "🇨🇷",
    "locale": "es-CR",
    "currency": "CRC",
    "subdivisionLabel": "Provincia",
    "mapCenter": [
      9.75,
      -84.19
    ],
    "mapZoom": 7
  },
  "PA": {
    "code": "PA",
    "name": "Panamá",
    "flag": "🇵🇦",
    "locale": "es-PA",
    "currency": "PAB",
    "subdivisionLabel": "Provincia o comarca",
    "mapCenter": [
      8.55,
      -80.78
    ],
    "mapZoom": 7
  },
  "CO": {
    "code": "CO",
    "name": "Colombia",
    "flag": "🇨🇴",
    "locale": "es-CO",
    "currency": "COP",
    "subdivisionLabel": "Departamento o distrito capital",
    "mapCenter": [
      4.57,
      -74.3
    ],
    "mapZoom": 5
  },
  "EC": {
    "code": "EC",
    "name": "Ecuador",
    "flag": "🇪🇨",
    "locale": "es-EC",
    "currency": "USD",
    "subdivisionLabel": "Provincia",
    "mapCenter": [
      -1.83,
      -78.18
    ],
    "mapZoom": 6
  },
  "VE": {
    "code": "VE",
    "name": "Venezuela",
    "flag": "🇻🇪",
    "locale": "es-VE",
    "currency": "VES",
    "subdivisionLabel": "Estado o distrito capital",
    "mapCenter": [
      7.1,
      -66
    ],
    "mapZoom": 6
  },
  "DO": {
    "code": "DO",
    "name": "República Dominicana",
    "flag": "🇩🇴",
    "locale": "es-DO",
    "currency": "DOP",
    "subdivisionLabel": "Provincia o Distrito Nacional",
    "mapCenter": [
      18.74,
      -70.16
    ],
    "mapZoom": 7
  }
} as const;
export const EXPANSION_SUBDIVISIONS = {
  "MX": [
    "Aguascalientes",
    "Baja California",
    "Baja California Sur",
    "Campeche",
    "Chiapas",
    "Chihuahua",
    "Ciudad de México",
    "Coahuila",
    "Colima",
    "Durango",
    "Guanajuato",
    "Guerrero",
    "Hidalgo",
    "Jalisco",
    "México",
    "Michoacán",
    "Morelos",
    "Nayarit",
    "Nuevo León",
    "Oaxaca",
    "Puebla",
    "Querétaro",
    "Quintana Roo",
    "San Luis Potosí",
    "Sinaloa",
    "Sonora",
    "Tabasco",
    "Tamaulipas",
    "Tlaxcala",
    "Veracruz",
    "Yucatán",
    "Zacatecas"
  ],
  "GT": [
    "Alta Verapaz",
    "Baja Verapaz",
    "Chimaltenango",
    "Chiquimula",
    "El Progreso",
    "Escuintla",
    "Guatemala",
    "Huehuetenango",
    "Izabal",
    "Jalapa",
    "Jutiapa",
    "Petén",
    "Quetzaltenango",
    "Quiché",
    "Retalhuleu",
    "Sacatepéquez",
    "San Marcos",
    "Santa Rosa",
    "Sololá",
    "Suchitepéquez",
    "Totonicapán",
    "Zacapa"
  ],
  "SV": [
    "Ahuachapán",
    "Cabañas",
    "Chalatenango",
    "Cuscatlán",
    "La Libertad",
    "La Paz",
    "La Unión",
    "Morazán",
    "San Miguel",
    "San Salvador",
    "San Vicente",
    "Santa Ana",
    "Sonsonate",
    "Usulután"
  ],
  "HN": [
    "Atlántida",
    "Choluteca",
    "Colón",
    "Comayagua",
    "Copán",
    "Cortés",
    "El Paraíso",
    "Francisco Morazán",
    "Gracias a Dios",
    "Intibucá",
    "Islas de la Bahía",
    "La Paz",
    "Lempira",
    "Ocotepeque",
    "Olancho",
    "Santa Bárbara",
    "Valle",
    "Yoro"
  ],
  "NI": [
    "Boaco",
    "Carazo",
    "Chinandega",
    "Chontales",
    "Estelí",
    "Granada",
    "Jinotega",
    "León",
    "Madriz",
    "Managua",
    "Masaya",
    "Matagalpa",
    "Nueva Segovia",
    "Río San Juan",
    "Rivas",
    "Región Autónoma de la Costa Caribe Norte",
    "Región Autónoma de la Costa Caribe Sur"
  ],
  "CR": [
    "Alajuela",
    "Cartago",
    "Guanacaste",
    "Heredia",
    "Limón",
    "Puntarenas",
    "San José"
  ],
  "PA": [
    "Bocas del Toro",
    "Chiriquí",
    "Coclé",
    "Colón",
    "Darién",
    "Herrera",
    "Los Santos",
    "Panamá",
    "Panamá Oeste",
    "Veraguas",
    "Guna Yala",
    "Emberá-Wounaan",
    "Ngäbe-Buglé",
    "Naso Tjër Di",
    "Guna de Madungandí",
    "Guna de Wargandí"
  ],
  "CO": [
    "Amazonas",
    "Antioquia",
    "Arauca",
    "Atlántico",
    "Bogotá D.C.",
    "Bolívar",
    "Boyacá",
    "Caldas",
    "Caquetá",
    "Casanare",
    "Cauca",
    "Cesar",
    "Chocó",
    "Córdoba",
    "Cundinamarca",
    "Guainía",
    "Guaviare",
    "Huila",
    "La Guajira",
    "Magdalena",
    "Meta",
    "Nariño",
    "Norte de Santander",
    "Putumayo",
    "Quindío",
    "Risaralda",
    "San Andrés y Providencia",
    "Santander",
    "Sucre",
    "Tolima",
    "Valle del Cauca",
    "Vaupés",
    "Vichada"
  ],
  "EC": [
    "Azuay",
    "Bolívar",
    "Cañar",
    "Carchi",
    "Chimborazo",
    "Cotopaxi",
    "El Oro",
    "Esmeraldas",
    "Galápagos",
    "Guayas",
    "Imbabura",
    "Loja",
    "Los Ríos",
    "Manabí",
    "Morona Santiago",
    "Napo",
    "Orellana",
    "Pastaza",
    "Pichincha",
    "Santa Elena",
    "Santo Domingo de los Tsáchilas",
    "Sucumbíos",
    "Tungurahua",
    "Zamora Chinchipe"
  ],
  "VE": [
    "Amazonas",
    "Anzoátegui",
    "Apure",
    "Aragua",
    "Barinas",
    "Bolívar",
    "Carabobo",
    "Cojedes",
    "Delta Amacuro",
    "Distrito Capital",
    "Falcón",
    "Guárico",
    "La Guaira",
    "Lara",
    "Mérida",
    "Miranda",
    "Monagas",
    "Nueva Esparta",
    "Portuguesa",
    "Sucre",
    "Táchira",
    "Trujillo",
    "Yaracuy",
    "Zulia"
  ],
  "DO": [
    "Azua",
    "Baoruco",
    "Barahona",
    "Dajabón",
    "Distrito Nacional",
    "Duarte",
    "El Seibo",
    "Elías Piña",
    "Espaillat",
    "Hato Mayor",
    "Hermanas Mirabal",
    "Independencia",
    "La Altagracia",
    "La Romana",
    "La Vega",
    "María Trinidad Sánchez",
    "Monseñor Nouel",
    "Monte Cristi",
    "Monte Plata",
    "Pedernales",
    "Peravia",
    "Puerto Plata",
    "Samaná",
    "San Cristóbal",
    "San José de Ocoa",
    "San Juan",
    "San Pedro de Macorís",
    "Sánchez Ramírez",
    "Santiago",
    "Santiago Rodríguez",
    "Santo Domingo",
    "Valverde"
  ]
} as const;
export const EXPANSION_REGIONS = {
  "MX": [
    {
      "zona": "Guasave",
      "subdivision": "Sinaloa",
      "actividad": "Maíz y hortalizas",
      "latitud": 25.57,
      "longitud": -108.47
    },
    {
      "zona": "Los Altos de Jalisco",
      "subdivision": "Jalisco",
      "actividad": "Agricultura y ganadería",
      "latitud": 20.86,
      "longitud": -102.72
    },
    {
      "zona": "Zamora",
      "subdivision": "Michoacán",
      "actividad": "Horticultura y fruticultura",
      "latitud": 19.99,
      "longitud": -102.28
    },
    {
      "zona": "Córdoba",
      "subdivision": "Veracruz",
      "actividad": "Caña, café y producción mixta",
      "latitud": 18.89,
      "longitud": -96.93
    }
  ],
  "GT": [
    {
      "zona": "Cobán",
      "subdivision": "Alta Verapaz",
      "actividad": "Café y producción diversificada",
      "latitud": 15.47,
      "longitud": -90.37
    },
    {
      "zona": "Escuintla",
      "subdivision": "Escuintla",
      "actividad": "Caña y agroindustria",
      "latitud": 14.3,
      "longitud": -90.79
    },
    {
      "zona": "Quetzaltenango",
      "subdivision": "Quetzaltenango",
      "actividad": "Hortalizas y agricultura",
      "latitud": 14.83,
      "longitud": -91.52
    },
    {
      "zona": "Flores",
      "subdivision": "Petén",
      "actividad": "Ganadería y cultivos",
      "latitud": 16.93,
      "longitud": -89.89
    }
  ],
  "SV": [
    {
      "zona": "Santa Ana",
      "subdivision": "Santa Ana",
      "actividad": "Café y producción rural",
      "latitud": 13.99,
      "longitud": -89.56
    },
    {
      "zona": "Ahuachapán",
      "subdivision": "Ahuachapán",
      "actividad": "Café y cultivos",
      "latitud": 13.92,
      "longitud": -89.85
    },
    {
      "zona": "San Miguel",
      "subdivision": "San Miguel",
      "actividad": "Ganadería y agricultura",
      "latitud": 13.48,
      "longitud": -88.17
    },
    {
      "zona": "Usulután",
      "subdivision": "Usulután",
      "actividad": "Arroz y granos básicos",
      "latitud": 13.35,
      "longitud": -88.45
    }
  ],
  "HN": [
    {
      "zona": "Juticalpa",
      "subdivision": "Olancho",
      "actividad": "Ganadería y granos básicos",
      "latitud": 14.67,
      "longitud": -86.22
    },
    {
      "zona": "Comayagua",
      "subdivision": "Comayagua",
      "actividad": "Horticultura y agroindustria",
      "latitud": 14.46,
      "longitud": -87.64
    },
    {
      "zona": "Santa Rosa de Copán",
      "subdivision": "Copán",
      "actividad": "Café y agricultura",
      "latitud": 14.77,
      "longitud": -88.78
    },
    {
      "zona": "San Pedro Sula",
      "subdivision": "Cortés",
      "actividad": "Agroindustria y logística",
      "latitud": 15.5,
      "longitud": -88.03
    }
  ],
  "NI": [
    {
      "zona": "Chinandega",
      "subdivision": "Chinandega",
      "actividad": "Caña, granos y producción mixta",
      "latitud": 12.63,
      "longitud": -87.13
    },
    {
      "zona": "León",
      "subdivision": "León",
      "actividad": "Maní y producción agrícola",
      "latitud": 12.44,
      "longitud": -86.88
    },
    {
      "zona": "Matagalpa",
      "subdivision": "Matagalpa",
      "actividad": "Café y ganadería",
      "latitud": 12.93,
      "longitud": -85.91
    },
    {
      "zona": "Jinotega",
      "subdivision": "Jinotega",
      "actividad": "Café y cultivos de altura",
      "latitud": 13.09,
      "longitud": -86
    }
  ],
  "CR": [
    {
      "zona": "Liberia",
      "subdivision": "Guanacaste",
      "actividad": "Ganadería y caña",
      "latitud": 10.63,
      "longitud": -85.44
    },
    {
      "zona": "San Carlos",
      "subdivision": "Alajuela",
      "actividad": "Lechería y piña",
      "latitud": 10.34,
      "longitud": -84.43
    },
    {
      "zona": "Cartago",
      "subdivision": "Cartago",
      "actividad": "Horticultura de altura",
      "latitud": 9.86,
      "longitud": -83.92
    },
    {
      "zona": "Guápiles",
      "subdivision": "Limón",
      "actividad": "Banano y agroindustria",
      "latitud": 10.22,
      "longitud": -83.79
    }
  ],
  "PA": [
    {
      "zona": "David",
      "subdivision": "Chiriquí",
      "actividad": "Arroz, ganadería y horticultura",
      "latitud": 8.43,
      "longitud": -82.43
    },
    {
      "zona": "Santiago",
      "subdivision": "Veraguas",
      "actividad": "Ganadería y granos básicos",
      "latitud": 8.1,
      "longitud": -80.98
    },
    {
      "zona": "Penonomé",
      "subdivision": "Coclé",
      "actividad": "Agricultura y agroindustria",
      "latitud": 8.52,
      "longitud": -80.36
    },
    {
      "zona": "Las Tablas",
      "subdivision": "Los Santos",
      "actividad": "Maíz y ganadería",
      "latitud": 7.77,
      "longitud": -80.28
    }
  ],
  "CO": [
    {
      "zona": "Villavicencio",
      "subdivision": "Meta",
      "actividad": "Ganadería, arroz y palma",
      "latitud": 4.14,
      "longitud": -73.63
    },
    {
      "zona": "Medellín Oriente",
      "subdivision": "Antioquia",
      "actividad": "Café, leche y floricultura",
      "latitud": 6.15,
      "longitud": -75.38
    },
    {
      "zona": "Facatativá",
      "subdivision": "Cundinamarca",
      "actividad": "Lechería y horticultura",
      "latitud": 4.81,
      "longitud": -74.35
    },
    {
      "zona": "Palmira",
      "subdivision": "Valle del Cauca",
      "actividad": "Caña y agroindustria",
      "latitud": 3.54,
      "longitud": -76.3
    }
  ],
  "EC": [
    {
      "zona": "Babahoyo",
      "subdivision": "Los Ríos",
      "actividad": "Arroz y cacao",
      "latitud": -1.8,
      "longitud": -79.53
    },
    {
      "zona": "Milagro",
      "subdivision": "Guayas",
      "actividad": "Caña y agroindustria",
      "latitud": -2.14,
      "longitud": -79.59
    },
    {
      "zona": "Portoviejo",
      "subdivision": "Manabí",
      "actividad": "Cacao y producción mixta",
      "latitud": -1.05,
      "longitud": -80.45
    },
    {
      "zona": "Cayambe",
      "subdivision": "Pichincha",
      "actividad": "Lechería y floricultura",
      "latitud": 0.04,
      "longitud": -78.14
    }
  ],
  "VE": [
    {
      "zona": "Acarigua",
      "subdivision": "Portuguesa",
      "actividad": "Cereales y agroindustria",
      "latitud": 9.56,
      "longitud": -69.2
    },
    {
      "zona": "Barinas",
      "subdivision": "Barinas",
      "actividad": "Ganadería y arroz",
      "latitud": 8.62,
      "longitud": -70.21
    },
    {
      "zona": "Calabozo",
      "subdivision": "Guárico",
      "actividad": "Arroz y agricultura",
      "latitud": 8.93,
      "longitud": -67.43
    },
    {
      "zona": "Maracaibo Sur del Lago",
      "subdivision": "Zulia",
      "actividad": "Ganadería y plátano",
      "latitud": 9.36,
      "longitud": -71.74
    }
  ],
  "DO": [
    {
      "zona": "La Vega",
      "subdivision": "La Vega",
      "actividad": "Horticultura y arroz",
      "latitud": 19.22,
      "longitud": -70.53
    },
    {
      "zona": "Santiago",
      "subdivision": "Santiago",
      "actividad": "Agroindustria y tabaco",
      "latitud": 19.45,
      "longitud": -70.69
    },
    {
      "zona": "San Juan de la Maguana",
      "subdivision": "San Juan",
      "actividad": "Legumbres y granos",
      "latitud": 18.81,
      "longitud": -71.23
    },
    {
      "zona": "San Francisco de Macorís",
      "subdivision": "Duarte",
      "actividad": "Cacao y arroz",
      "latitud": 19.3,
      "longitud": -70.25
    }
  ]
} as const;
