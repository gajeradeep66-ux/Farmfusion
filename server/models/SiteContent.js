import mongoose from 'mongoose';

const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'about' },
    title: { type: String, required: true, default: 'Rooted in care. Growing together.' },
    story: {
      type: String,
      required: true,
      default: 'FarmFusion brings thoughtfully chosen seeds, practical farm tools and crop-care essentials to growers. We believe strong harvests begin with healthy soil, trusted products and people who care for the land.',
    },
    contactEmail: { type: String, required: true, default: 'admin@farmfusion.com' },
    image: { type: String, required: true, default: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=90' },
  },
  { timestamps: true }
);

const SiteContent = mongoose.model('SiteContent', siteContentSchema);

export default SiteContent;
