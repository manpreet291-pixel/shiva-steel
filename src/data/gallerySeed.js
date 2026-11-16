// Starter gallery categories and sample photos.
// - The backend (server/index.js) copies this into its database the first time it runs.
// - The website also uses it as a fallback when no backend is running.
// `productId` links a gallery category to a product card (see products.js).
// `image` is relative to /public. Photos uploaded in the admin panel are stored as /uploads/...
export const galleryCategories = [
  { id: 'villa-main-gates', slug: 'villa-main-gates', name: 'Villa Main Gates', productId: 'villa-main-gates',
    description: 'Grand, custom-built main gates for villas and independent houses.' },
  { id: 'profile-gates', slug: 'profile-gates', name: 'Profile Gates', productId: 'profile-gates',
    description: 'Sleek, contemporary gates made from steel profiles.' },
  { id: 'ss-gates', slug: 'ss-gates', name: 'SS Gates', productId: 'ss-gates',
    description: 'Stainless steel gates with a polished, long-lasting finish.' },
  { id: 'railings', slug: 'railings', name: 'Railings', productId: 'stainless-steel-railings',
    description: 'Stainless steel and staircase railings for balconies, terraces and stairs.' },
  { id: 'grilles', slug: 'grilles', name: 'Steel Grilles', productId: 'decorative-steel-grilles',
    description: 'Decorative and security grilles for windows and openings.' },
  { id: 'cnc-designer-gates', slug: 'cnc-designer-gates', name: 'CNC Designer Gates', productId: 'cnc-designer-gates',
    description: 'Precision CNC-cut patterns for gates with detailed, modern designs.' },
  { id: 'cnc-chokhat', slug: 'cnc-chokhat', name: 'CNC Chokhat', productId: 'cnc-chokhat',
    description: 'Accurately cut and finished CNC steel chokhat (door frames).' },
  { id: 'door-frames', slug: 'door-frames', name: 'Door Frames', productId: 'cnc-chokhat',
    description: 'Steel door frames for homes and other spaces.' },
  { id: 'custom-fabrication', slug: 'custom-fabrication', name: 'Custom Fabrication', productId: 'custom-steel-fabrication',
    description: 'One-off steel work built to your own design and measurements.' },
];

// `sample: true` shows a "Sample image" tag. Delete these in the admin panel after adding real photos.
export const galleryItems = [
  { id: 's1', categoryId: 'villa-main-gates', title: 'Villa main gate', image: 'images/villa-main-gate.svg', sample: true },
  { id: 's2', categoryId: 'profile-gates', title: 'Profile gate', image: 'images/profile-gate.svg', sample: true },
  { id: 's3', categoryId: 'ss-gates', title: 'Stainless steel gate', image: 'images/ss-gate.svg', sample: true },
  { id: 's4', categoryId: 'railings', title: 'Stainless steel railing', image: 'images/stainless-steel-railing.svg', sample: true },
  { id: 's5', categoryId: 'railings', title: 'Staircase railing', image: 'images/staircase-railing.svg', sample: true },
  { id: 's6', categoryId: 'grilles', title: 'Decorative steel grille', image: 'images/decorative-grille.svg', sample: true },
  { id: 's7', categoryId: 'cnc-designer-gates', title: 'CNC designer gate', image: 'images/cnc-designer-gate.svg', sample: true },
  { id: 's8', categoryId: 'cnc-chokhat', title: 'CNC chokhat', image: 'images/cnc-chokhat.svg', sample: true },
  { id: 's9', categoryId: 'door-frames', title: 'Steel door frame', image: 'images/cnc-chokhat.svg', sample: true },
  { id: 's10', categoryId: 'custom-fabrication', title: 'Custom fabrication', image: 'images/custom-fabrication.svg', sample: true },
];
