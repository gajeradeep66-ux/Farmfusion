export const productCategories = [
  'Seeds',
  'Farming Tools',
  'Soil & Nutrition',
  'Plant Protection',
  'Growing Essentials',
  'Smart Farming',
];

const categoryPhotos = {
  Seeds: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1000&q=85',
  'Farming Tools': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1000&q=85',
  'Soil & Nutrition': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85',
  'Plant Protection': 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1000&q=85',
  'Growing Essentials': 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1000&q=85',
  'Smart Farming': 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1000&q=85',
};

const productPhotoIds = {
  'high-yield-tomato-seeds': '1607305387299-a3d9611cd469',
  'herbal-spinach-mix': '1540420773420-3366772f4999',
  'sweet-corn-seeds': '1597362925123-77861d3fbac7',
  'okra-green-star-seeds': '1579113800032-c38bd7635818',
  'marigold-garden-seeds': '1459156212016-c812468e2115',
  'premium-drip-irrigation-kit': '1500937386664-56d1dfef3854',
  'garden-hand-trowel': '1416879595882-3373a0480b5b',
  'rechargeable-garden-sprayer': '1530267981375-f0de937f5f13',
  'steel-pruning-shears': '1558618666-fcd25c85cd64',
  'forged-garden-hoe': '1574943320219-553eb213f72d',
  'organic-compost-booster': '1500382017468-9049fed747ef',
  'earthworm-vermicompost': '1518977676601-b53f82aba655',
  'cocopeat-seedling-block': '1466692476868-aef1dfb1e735',
  'neem-cake-soil-enricher': '1518531933037-91b2f5f229cc',
  'all-purpose-potting-mix': '1530836369250-ef72a3f5cda8',
  'neem-oil-plant-spray': '1501004318641-b39e6451bec6',
  'yellow-sticky-pest-traps': '1559181567-c3190ca9959b',
  'copper-plant-fungicide': '1568584711075-3d021a7c3ca3',
  'insecticidal-soap-spray': '1545241047-6083a3684587',
  'bio-crop-guard-concentrate': '1470058869958-2a77ade41c02',
  'microgreen-starter-tray': '1523348837708-15d4a09cfac2',
  'seed-starting-cell-tray': '1598170845058-32b9d6a5da37',
  'fabric-grow-bag-set': '1512428813834-c702c7702b78',
  'garden-plant-support-clips': '1497250681960-ef046c08a56e',
  'wooden-plant-marker-set': '1464226184884-fa280b87c399',
  'smart-soil-moisture-sensor': '1500595046743-cd271d694d30',
  'digital-soil-ph-meter': '1560806887-1e4cd0b6cbd6',
  'automatic-irrigation-timer': '1528825871115-3581a5387919',
  'solar-pump-controller': '1566385101042-1a0aa0c1268c',
  'digital-rain-gauge': '1592924357228-91a4daadcfea',
};

export const farmPhoto = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=90';

const categoryColors = {
  Seeds: ['#3f7a43', '#c7a354'],
  'Farming Tools': ['#346a70', '#d39048'],
  'Soil & Nutrition': ['#70513b', '#b99c62'],
  'Plant Protection': ['#4d7141', '#ce7a54'],
  'Growing Essentials': ['#4d805d', '#d4a45a'],
  'Smart Farming': ['#315f70', '#79a96d'],
};

const escapeXml = (value) =>
  String(value).replace(/[<>&'"]/g, (character) => {
    const entities = { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' };
    return entities[character];
  });

const packagingShape = (name, category) => {
  const normalizedName = name.toLowerCase();
  if (/spray|neem|soap|pesticide|fungicide|tonic/.test(normalizedName)) {
    return '<path d="M333 230h135v28h-135zm22-45h91v45h-91zm15-22h60v22h-60zm-50 95h165l20 240H300z" fill="#fffdf3" stroke="#d8dfd2" stroke-width="5"/><path d="M320 310h157v55H320z" fill="var(--accent)"/><path d="M400 398c-18-44 20-72 28-111 35 46 20 89-28 111z" fill="none" stroke="var(--primary)" stroke-width="11"/>';
  }
  if (/kit|sensor|meter|controller|timer|gauge|pump/.test(normalizedName)) {
    return '<rect x="276" y="234" width="250" height="235" rx="28" fill="#343d35"/><rect x="303" y="260" width="196" height="142" rx="14" fill="#dfeacb"/><circle cx="401" cy="331" r="48" fill="none" stroke="var(--primary)" stroke-width="13"/><path d="M401 331l28-28M340 431h121" stroke="var(--accent)" stroke-width="16" stroke-linecap="round"/><path d="M330 468v31m140-31v31" stroke="#384d3d" stroke-width="10" stroke-linecap="round"/>';
  }
  if (/trowel|shear|hoe|spade|glove|pruner/.test(normalizedName)) {
    return '<path d="M390 179h27v223h-27z" rx="12" fill="#9d744a"/><path d="M376 187q28-36 56 0v28h-56z" fill="#d99a47"/><path d="M402 387c-44 22-75 62-86 114q84 8 133-47z" fill="#bcc6bc" stroke="#738675" stroke-width="6"/><path d="M348 473l92-80" stroke="#fffdf2" stroke-width="7"/>';
  }
  if (category === 'Seeds') {
    return '<path d="M311 183h178l20 43-14 282q-2 24-25 24H330q-23 0-25-24l-14-282z" fill="#fffdf1" stroke="#dce2d4" stroke-width="5"/><path d="M311 183h178l17 54H294z" fill="var(--primary)"/><circle cx="400" cy="337" r="69" fill="#e9efd9"/><path d="M400 380v-75m0 26c-33-2-49-21-47-49 30 2 49 20 47 49zm2-14c29-3 44-20 42-48-29 3-44 20-42 48z" fill="none" stroke="var(--primary)" stroke-width="9" stroke-linecap="round"/><path d="M347 425h106m-106 22h77" stroke="#d7dfcf" stroke-width="7" stroke-linecap="round"/>';
  }
  if (/soil|compost|vermi|coco|peat|mulch|cake|potting|fertilizer|nutri/.test(normalizedName)) {
    return '<path d="M323 223h154l24 37-15 233q-2 25-26 25H340q-24 0-26-25l-15-233z" fill="#efe4c9" stroke="#d8cba9" stroke-width="5"/><path d="M323 223h154l18 50H305z" fill="#78583d"/><path d="M400 375c-9-37 9-68 45-91-1 36-16 68-45 91zm-2 4c-11-31-31-47-62-49 10 28 30 45 62 49z" fill="none" stroke="var(--primary)" stroke-width="10" stroke-linecap="round"/><path d="M350 422h100m-87 24h74" stroke="#b59a6c" stroke-width="7" stroke-linecap="round"/>';
  }
  if (category === 'Plant Protection') {
    return '<path d="M341 270h118l-8 209q-1 20-20 20h-62q-19 0-20-20z" fill="#fffdf5" stroke="#dce2d4" stroke-width="5"/><path d="M341 270h118v52H341z" fill="var(--primary)"/><path d="M369 250h62v20h-62z" fill="#b8c8a3"/><circle cx="400" cy="384" r="40" fill="#edf2e3"/><path d="M400 413c-20-29-13-55 14-78 12 31 7 57-14 78zm-2-2c-23-20-44-20-64-2 23 16 44 17 64 2z" fill="none" stroke="var(--primary)" stroke-width="8"/>';
  }
  if (category === 'Growing Essentials') {
    return '<path d="M292 378h216l-25 120H317z" fill="#bd7953"/><path d="M309 393h182M323 423h151M335 453h126" stroke="#e8b77c" stroke-width="8"/><path d="M401 379v-98m0 51c-38-1-56-23-52-57 34 3 55 24 52 57zm3-17c34-4 51-24 47-57-33 4-50 24-47 57z" fill="none" stroke="var(--primary)" stroke-width="11" stroke-linecap="round"/>';
  }
  return '<path d="M320 230h160v250H320z" fill="#fffdf1" stroke="#dce2d4" stroke-width="5"/>';
};

const slugify = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const isCategoryPhoto = (image) => Object.values(categoryPhotos).includes(image);

export const createProductImage = (name, category = 'Seeds') => {
  const photoId = productPhotoIds[slugify(name)];
  if (photoId) {
    return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1000&q=85`;
  }

  const [primary, accent] = categoryColors[category] || categoryColors.Seeds;
  const label = escapeXml(name);
  const shape = packagingShape(name, category)
    .replaceAll('var(--primary)', primary)
    .replaceAll('var(--accent)', accent);
  const artwork = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 640">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fbfaf4"/>
          <stop offset="1" stop-color="#e9eee3"/>
        </linearGradient>
        <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${accent}" stop-opacity=".22"/>
          <stop offset="1" stop-color="${primary}" stop-opacity=".04"/>
        </linearGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="20" stdDeviation="18" flood-color="#243a2b" flood-opacity=".14"/>
        </filter>
      </defs>
      <rect width="800" height="640" fill="url(#bg)"/>
      <circle cx="642" cy="124" r="148" fill="url(#glow)"/>
      <circle cx="126" cy="548" r="190" fill="${primary}" opacity=".035"/>
      <path d="M0 520c142-44 244-37 376 0s282 42 424-8v128H0z" fill="${primary}" opacity=".06"/>
      <g filter="url(#shadow)">${shape}</g>
      <text x="400" y="574" text-anchor="middle" font-family="Arial,sans-serif" font-size="21" font-weight="700" letter-spacing="1.2" fill="${primary}">${label}</text>
      <text x="400" y="604" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" letter-spacing="3" fill="#778477">${escapeXml(category.toUpperCase())}</text>
    </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(artwork)}`;
};

const product = (name, slug, category, price, stock, description, featured = false) => ({
  name,
  slug,
  category,
  price,
  stock,
  description,
  featured,
  image: createProductImage(name, category),
});

export const seedProducts = [
  product('High Yield Tomato Seeds', 'high-yield-tomato-seeds', 'Seeds', 249, 120, 'Disease-resistant hybrid tomato seeds for a reliable, generous harvest.', true),
  product('Herbal Spinach Mix', 'herbal-spinach-mix', 'Seeds', 149, 100, 'Fast-growing spinach seeds for tender leafy greens in beds or containers.', true),
  product('Sweet Corn Seeds', 'sweet-corn-seeds', 'Seeds', 199, 85, 'Sweet corn seed with strong germination for sunny garden beds and fields.'),
  product('Okra Green Star Seeds', 'okra-green-star-seeds', 'Seeds', 179, 92, 'Heat-loving okra variety with vigorous plants and tender green pods.'),
  product('Marigold Garden Seeds', 'marigold-garden-seeds', 'Seeds', 99, 140, 'Bright marigold seeds for colourful borders and pollinator-friendly gardens.'),

  product('Premium Drip Irrigation Kit', 'premium-drip-irrigation-kit', 'Farming Tools', 1899, 55, 'Water-saving drip irrigation kit for garden beds, greenhouses and small fields.', true),
  product('Garden Hand Trowel', 'garden-hand-trowel', 'Farming Tools', 349, 80, 'Sturdy stainless-steel hand trowel for transplanting, weeding and sowing.'),
  product('Rechargeable Garden Sprayer', 'rechargeable-garden-sprayer', 'Farming Tools', 1299, 42, 'Rechargeable compact sprayer for even watering and garden treatments.'),
  product('Steel Pruning Shears', 'steel-pruning-shears', 'Farming Tools', 599, 64, 'Sharp bypass pruning shears with a comfortable non-slip grip.'),
  product('Forged Garden Hoe', 'forged-garden-hoe', 'Farming Tools', 799, 38, 'Balanced forged hoe for loosening soil and clearing weeds between rows.'),

  product('Organic Compost Booster', 'organic-compost-booster', 'Soil & Nutrition', 499, 65, 'Bio-enriched compost booster to improve soil structure and root growth.', true),
  product('Earthworm Vermicompost', 'earthworm-vermicompost', 'Soil & Nutrition', 349, 74, 'Naturally processed vermicompost that adds organic matter to garden soil.'),
  product('Cocopeat Seedling Block', 'cocopeat-seedling-block', 'Soil & Nutrition', 199, 110, 'Expanded cocopeat block for moisture-retentive seed starting and potting.'),
  product('Neem Cake Soil Enricher', 'neem-cake-soil-enricher', 'Soil & Nutrition', 279, 58, 'Neem cake soil amendment for enriching garden beds and potted plants.'),
  product('All-Purpose Potting Mix', 'all-purpose-potting-mix', 'Soil & Nutrition', 399, 82, 'Ready-to-use airy potting blend for vegetables, herbs and flowering plants.'),

  product('Neem Oil Plant Spray', 'neem-oil-plant-spray', 'Plant Protection', 329, 70, 'Ready-to-dilute neem oil concentrate for routine garden plant care.', true),
  product('Yellow Sticky Pest Traps', 'yellow-sticky-pest-traps', 'Plant Protection', 149, 130, 'Bright sticky cards for monitoring common flying pests around plants.'),
  product('Copper Plant Fungicide', 'copper-plant-fungicide', 'Plant Protection', 449, 46, 'Copper-based fungicide for preventative plant disease management.'),
  product('Insecticidal Soap Spray', 'insecticidal-soap-spray', 'Plant Protection', 279, 64, 'Gentle ready-to-use soap spray for washing pests from garden foliage.'),
  product('Bio Crop Guard Concentrate', 'bio-crop-guard-concentrate', 'Plant Protection', 389, 51, 'Botanical crop-care concentrate for an integrated garden protection routine.'),

  product('Microgreen Starter Tray', 'microgreen-starter-tray', 'Growing Essentials', 449, 90, 'Reusable shallow growing tray for fresh microgreens on a sunny windowsill.'),
  product('Seed Starting Cell Tray', 'seed-starting-cell-tray', 'Growing Essentials', 199, 105, 'Multi-cell propagation tray for starting seedlings neatly and consistently.'),
  product('Fabric Grow Bag Set', 'fabric-grow-bag-set', 'Growing Essentials', 599, 57, 'Breathable reusable grow bags for vegetables on patios and balconies.'),
  product('Garden Plant Support Clips', 'garden-plant-support-clips', 'Growing Essentials', 129, 170, 'Reusable plant clips for gently securing climbing stems and vine crops.'),
  product('Wooden Plant Marker Set', 'wooden-plant-marker-set', 'Growing Essentials', 99, 145, 'Write-on wooden garden labels for keeping seed rows and pots organised.'),

  product('Smart Soil Moisture Sensor', 'smart-soil-moisture-sensor', 'Smart Farming', 1499, 26, 'Digital soil moisture monitor to help time irrigation more thoughtfully.', true),
  product('Digital Soil pH Meter', 'digital-soil-ph-meter', 'Smart Farming', 1199, 31, 'Portable soil pH tester for checking growing media before planting.'),
  product('Automatic Irrigation Timer', 'automatic-irrigation-timer', 'Smart Farming', 2299, 22, 'Programmable hose timer for automated watering schedules at home or field.'),
  product('Solar Pump Controller', 'solar-pump-controller', 'Smart Farming', 4999, 14, 'Solar pump controller enclosure for managing small-scale irrigation systems.'),
  product('Digital Rain Gauge', 'digital-rain-gauge', 'Smart Farming', 899, 39, 'Weather-resistant digital rain gauge for tracking rainfall at the growing site.'),

  product('Cherry Tomato Seeds', 'cherry-tomato-seeds', 'Seeds', 179, 90, 'Sweet cherry tomato seeds for compact, productive plants in beds or pots.'),
  product('Desi Cucumber Seeds', 'desi-cucumber-seeds', 'Seeds', 129, 95, 'Fast-growing cucumber variety suited to warm-weather home and field gardens.'),
  product('Red Amaranth Seeds', 'red-amaranth-seeds', 'Seeds', 99, 110, 'Leafy red amaranth seeds for quick-growing, colourful greens.'),
  product('Green Chilli Seeds', 'green-chilli-seeds', 'Seeds', 159, 80, 'Vigorous green chilli seeds for sunny kitchen gardens and small farms.'),
  product('Bottle Gourd Seeds', 'bottle-gourd-seeds', 'Seeds', 139, 85, 'Bottle gourd seeds for climbing vines and a steady warm-season harvest.'),
  product('French Bean Seeds', 'french-bean-seeds', 'Seeds', 149, 88, 'Tender French bean seeds with productive plants for garden beds and containers.'),
  product('Radish White Icicle Seeds', 'radish-white-icicle-seeds', 'Seeds', 89, 120, 'Quick-maturing white radish seeds for crisp roots and fresh greens.'),
  product('Basil Sweet Genovese Seeds', 'basil-sweet-genovese-seeds', 'Seeds', 119, 92, 'Aromatic basil seeds for windowsills, planters and herb gardens.'),
  product('Sunflower Dwarf Seeds', 'sunflower-dwarf-seeds', 'Seeds', 109, 105, 'Compact sunflower seeds that bring bright blooms to small spaces.'),
  product('Brinjal Purple Long Seeds', 'brinjal-purple-long-seeds', 'Seeds', 169, 78, 'Long purple brinjal seeds for warm-season cultivation in beds or fields.'),

  product('Garden Soil Rake', 'garden-soil-rake', 'Farming Tools', 449, 48, 'Hand rake with sturdy tines for loosening soil and clearing small garden beds.'),
  product('Long Handle Garden Spade', 'long-handle-garden-spade', 'Farming Tools', 1099, 30, 'Balanced digging spade for turning soil and preparing planting rows.'),
  product('Bypass Hand Pruner', 'bypass-hand-pruner', 'Farming Tools', 699, 52, 'Spring-loaded bypass pruner for clean cuts on stems and light branches.'),
  product('Heavy Duty Weeding Fork', 'heavy-duty-weeding-fork', 'Farming Tools', 399, 61, 'Compact steel fork for loosening earth and lifting stubborn garden weeds.'),
  product('Manual Seed Sowing Tool', 'manual-seed-sowing-tool', 'Farming Tools', 549, 44, 'Handheld seed dispenser designed to space small seeds more evenly.'),
  product('Garden Watering Wand', 'garden-watering-wand', 'Farming Tools', 799, 37, 'Extended watering wand with a gentle spray head for pots and raised beds.'),
  product('Protective Gardening Gloves', 'protective-gardening-gloves', 'Farming Tools', 299, 72, 'Reusable grip gloves for everyday planting, pruning and garden clean-up.'),
  product('Hand Cultivator Three-Tine', 'hand-cultivator-three-tine', 'Farming Tools', 329, 68, 'Three-tine cultivator for aerating soil around established plants.'),
  product('Compact Garden Wheelbarrow', 'compact-garden-wheelbarrow', 'Farming Tools', 2499, 16, 'Small-capacity garden cart for moving compost, tools and harvest baskets.'),
  product('Hose Nozzle Multi-Pattern', 'hose-nozzle-multi-pattern', 'Farming Tools', 499, 55, 'Adjustable hose nozzle with multiple spray settings for garden watering.'),

  product('Organic Potting Soil 5 kg', 'organic-potting-soil-5-kg', 'Soil & Nutrition', 299, 72, 'Light, ready-to-use potting soil blend for indoor and outdoor planters.'),
  product('Neem Seed Meal 1 kg', 'neem-seed-meal-1-kg', 'Soil & Nutrition', 229, 59, 'Neem seed meal for adding organic matter to garden soil and potting mixes.'),
  product('Coco Coir Brick 650 g', 'coco-coir-brick-650-g', 'Soil & Nutrition', 99, 105, 'Compact coco coir brick that expands into a moisture-retaining growing medium.'),
  product('Seaweed Plant Tonic 500 ml', 'seaweed-plant-tonic-500-ml', 'Soil & Nutrition', 349, 43, 'Concentrated seaweed-based plant tonic for routine feeding during growth.'),
  product('Bone Meal Garden Fertilizer 1 kg', 'bone-meal-garden-fertilizer-1-kg', 'Soil & Nutrition', 259, 47, 'Granular bone meal for gardeners seeking a slow-release phosphorus source.'),
  product('Perlite Soil Amendment 1 L', 'perlite-soil-amendment-1-l', 'Soil & Nutrition', 179, 62, 'Lightweight perlite to improve drainage and airflow in potting blends.'),
  product('Organic Mustard Cake Fertilizer 1 kg', 'organic-mustard-cake-fertilizer-1-kg', 'Soil & Nutrition', 189, 54, 'Mustard cake granules for enriching soil before planting vegetables and flowers.'),
  product('Garden Soil pH Buffer 500 g', 'garden-soil-ph-buffer-500-g', 'Soil & Nutrition', 199, 38, 'Soil amendment for gardeners following a measured pH adjustment plan.'),
  product('Rice Husk Biochar 1 kg', 'rice-husk-biochar-1-kg', 'Soil & Nutrition', 279, 33, 'Porous rice husk biochar for blending into compost and garden soil.'),
  product('Vermiculite Seedling Mix 1 L', 'vermiculite-seedling-mix-1-l', 'Soil & Nutrition', 159, 66, 'Fine vermiculite for seed starting and moisture management in potting mixes.'),

  product('Horticultural Neem Oil 250 ml', 'horticultural-neem-oil-250-ml', 'Plant Protection', 399, 48, 'Cold-pressed neem oil concentrate for garden use; follow the product label.'),
  product('Ready-to-Use Plant Insect Spray 500 ml', 'ready-to-use-plant-insect-spray-500-ml', 'Plant Protection', 249, 55, 'Convenient trigger spray for routine home-garden plant care.'),
  product('Blue Sticky Pest Traps Pack of 20', 'blue-sticky-pest-traps-pack-of-20', 'Plant Protection', 179, 75, 'Blue sticky cards for monitoring selected flying pests around plants.'),
  product('Garden Copper Fungicide 100 g', 'garden-copper-fungicide-100-g', 'Plant Protection', 299, 36, 'Copper-based garden fungicide; apply only as directed on the label.'),
  product('Plant Disease Care Concentrate 100 ml', 'plant-disease-care-concentrate-100-ml', 'Plant Protection', 269, 41, 'Concentrated plant-care solution for use according to label directions.'),
  product('Fruit Fly Trap Set of 5', 'fruit-fly-trap-set-of-5', 'Plant Protection', 199, 68, 'Reusable lure traps for monitoring fruit flies in home orchards and gardens.'),
  product('Plant Guard Horticultural Soap 250 ml', 'plant-guard-horticultural-soap-250-ml', 'Plant Protection', 229, 46, 'Horticultural soap concentrate for routine foliage care; follow label directions.'),
  product('Garden Pest Net 2 m × 5 m', 'garden-pest-net-2-m-5-m', 'Plant Protection', 549, 29, 'Fine garden netting to help create a physical barrier around vulnerable crops.'),
  product('Seedling Root Protection Powder 100 g', 'seedling-root-protection-powder-100-g', 'Plant Protection', 189, 50, 'Root-zone gardening powder for use as directed during transplanting.'),
  product('Insect Monitoring Lure Kit', 'insect-monitoring-lure-kit', 'Plant Protection', 329, 34, 'Monitoring lure kit for checking pest activity in small gardens and greenhouses.'),

  product('Fabric Grow Bag Set of 3', 'fabric-grow-bag-set-of-3', 'Growing Essentials', 499, 57, 'Three breathable fabric bags for growing vegetables on patios or balconies.'),
  product('Seedling Tray with Humidity Dome', 'seedling-tray-with-humidity-dome', 'Growing Essentials', 349, 44, 'Propagation tray with a clear cover to help manage moisture while seeds sprout.'),
  product('Self-Watering Planter 20 cm', 'self-watering-planter-20-cm', 'Growing Essentials', 399, 39, 'Compact reservoir planter for keeping herbs and small plants evenly watered.'),
  product('Bamboo Plant Support Stakes Set', 'bamboo-plant-support-stakes-set', 'Growing Essentials', 249, 70, 'Natural bamboo stakes for supporting young plants and climbing stems.'),
  product('Coir Pole Plant Support 60 cm', 'coir-pole-plant-support-60-cm', 'Growing Essentials', 299, 35, 'Coir-wrapped support pole for climbing and indoor foliage plants.'),
  product('Garden Pruning Tie Roll', 'garden-pruning-tie-roll', 'Growing Essentials', 119, 90, 'Soft reusable tie roll for securing stems without tightly constricting growth.'),
  product('Plant Watering Globes Set of 2', 'plant-watering-globes-set-of-2', 'Growing Essentials', 279, 52, 'Pair of refillable watering globes for potted plants between waterings.'),
  product('Balcony Herb Planter Box', 'balcony-herb-planter-box', 'Growing Essentials', 699, 24, 'Window or balcony planter box for growing a small collection of herbs.'),
  product('Seedling Heat Mat 25 W', 'seedling-heat-mat-25-w', 'Growing Essentials', 1299, 18, 'Low-wattage propagation heat mat for helping maintain a warm seed-starting area.'),
  product('Garden Harvest Basket', 'garden-harvest-basket', 'Growing Essentials', 449, 31, 'Lightweight ventilated basket for collecting vegetables and garden produce.'),

  product('Digital Soil Moisture Meter', 'digital-soil-moisture-meter', 'Smart Farming', 799, 32, 'Portable meter for checking soil moisture before watering plants.'),
  product('Wi-Fi Garden Temperature Sensor', 'wi-fi-garden-temperature-sensor', 'Smart Farming', 1899, 17, 'Connected temperature sensor for monitoring conditions in a greenhouse or garden.'),
  product('Solar Irrigation Controller', 'solar-irrigation-controller', 'Smart Farming', 3499, 12, 'Solar-compatible irrigation controller for scheduled watering setups.'),
  product('Drip Line Flow Meter', 'drip-line-flow-meter', 'Smart Farming', 1299, 21, 'Inline flow meter for observing water use in a small irrigation line.'),
  product('Wireless Rain Alarm Sensor', 'wireless-rain-alarm-sensor', 'Smart Farming', 999, 25, 'Wireless rain sensor to help track rainfall around a garden or greenhouse.'),
  product('Digital Greenhouse Hygrometer', 'digital-greenhouse-hygrometer', 'Smart Farming', 649, 38, 'Digital display for monitoring temperature and humidity in covered growing spaces.'),
  product('Automatic Drip Watering Timer', 'automatic-drip-watering-timer', 'Smart Farming', 1599, 20, 'Battery-powered timer for automating a compatible garden watering schedule.'),
  product('Soil EC Conductivity Meter', 'soil-ec-conductivity-meter', 'Smart Farming', 1499, 16, 'Handheld conductivity meter for checking growing solution or soil extract readings.'),
  product('Solar Garden Pump 12 V', 'solar-garden-pump-12-v', 'Smart Farming', 2799, 11, 'Compact 12-volt pump for compatible small-scale solar water setups.'),
  product('Greenhouse Ventilation Controller', 'greenhouse-ventilation-controller', 'Smart Farming', 4299, 9, 'Temperature-triggered controller for compatible greenhouse ventilation equipment.'),
];
