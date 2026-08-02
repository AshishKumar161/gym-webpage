"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Images, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Using Unsplash for demo purposes
const galleryImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    alt: "Modern gym floor with premium equipment",
    category: "Facility",
    span: "col-span-2 row-span-2",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80",
    alt: "Weight training area",
    category: "Equipment",
    span: "col-span-1 row-span-1",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&q=80",
    alt: "Group fitness class",
    category: "Classes",
    span: "col-span-1 row-span-1",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
    alt: "Cardio equipment zone",
    category: "Facility",
    span: "col-span-1 row-span-2",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&q=80",
    alt: "Yoga and stretching studio",
    category: "Classes",
    span: "col-span-1 row-span-1",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80",
    alt: "Personal training session",
    category: "Training",
    span: "col-span-1 row-span-1",
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80",
    alt: "Free weights and dumbbells",
    category: "Equipment",
    span: "col-span-2 row-span-1",
  },
];

const categories = ["All", "Facility", "Equipment", "Classes", "Training"];

export function GallerySection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<(typeof galleryImages)[0] | null>(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const filtered =
    activeCategory === "All"
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  return (
    <section id="gallery" className="section-spacing" aria-labelledby="gallery-heading">
      <div className="page-container">
        <div ref={ref} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
          >
            <span className="section-tag mb-4 inline-flex">
              <Images className="w-3.5 h-3.5" />
              Our Facility
            </span>
          </motion.div>
          <motion.h2
            id="gallery-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="section-title text-4xl md:text-5xl mb-6"
          >
            See It to{" "}
            <span className="gold-text">Believe It</span>
          </motion.h2>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                activeCategory === cat
                  ? "bg-brand-gold text-dark font-semibold shadow-gold"
                  : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
          <AnimatePresence mode="popLayout">
            {filtered.map((image, i) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={cn("relative overflow-hidden rounded-2xl cursor-pointer group", image.span)}
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="badge-gold text-xs">{image.category}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-dark/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
          >
            <button
              className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={() => setSelectedImage(null)}
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage.src.replace("w=600", "w=1200")}
              alt={selectedImage.alt}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
