// Single source of truth for business details. Edit here and the whole site updates.
export const SITE = {
  name: 'SHIVA STEEL',
  owner: 'Harry Dhiman',
  phoneDisplay: '9855759696',
  phoneTel: '+919855759696',
  whatsappNumber: '919855759696',
  addressLines: [
    'Shop No. 431, Opp. Gilco Valley,',
    'Landran Road, Kharar, SAS Nagar,',
    'Mohali – 140301, Punjab, India.',
  ],
  addressOneLine:
    'Shop No. 431, Opp. Gilco Valley, Landran Road, Kharar, SAS Nagar, Mohali – 140301, Punjab, India',
  defaultMessage:
    'Hello SHIVA STEEL, I am interested in your steel products. Please share more details.',
};

export const whatsappLink = (message = SITE.defaultMessage) =>
  `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  SITE.addressOneLine
)}`;

export const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(
  SITE.addressOneLine
)}&output=embed`;

// Resolves image paths. Files in /public are relative ('images/x.jpg');
// photos uploaded from the admin panel are absolute ('/uploads/x.jpg').
export const asset = (path) =>
  /^(https?:)?\/\//.test(path) || path.startsWith('/') ? path : `${import.meta.env.BASE_URL}${path}`;
