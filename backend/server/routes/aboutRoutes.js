import express from 'express';
import SiteContent from '../models/SiteContent.js';

const farmPhoto = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=90';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const content = await SiteContent.findOneAndUpdate(
      { key: 'about' },
      {
        $setOnInsert: {
          key: 'about',
          contactEmail: process.env.ADMIN_EMAIL || 'admin@farmfusion.com',
        },
      },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    ).lean();
    if (content.image?.startsWith('/images/about-farm.svg')) {
      content.image = farmPhoto;
      await SiteContent.updateOne({ key: 'about' }, { $set: { image: farmPhoto } });
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load FarmFusion information' });
  }
});

export default router;
