const categoryPhotos = {
  Seeds: 'photo-1497250681960-ef046c08a56e',
  'Farming Tools': 'photo-1416879595882-3373a0480b5b',
  'Soil & Nutrition': 'photo-1500382017468-9049fed747ef',
  'Plant Protection': 'photo-1501004318641-b39e6451bec6',
  'Growing Essentials': 'photo-1523348837708-15d4a09cfac2',
  'Smart Farming': 'photo-1466692476868-aef1dfb1e735',
};

export function categoryIllustration(category) {
  const photo = categoryPhotos[category] || categoryPhotos.Seeds;
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=500&h=500&q=85`;
}
