import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { MembershipSection } from "@/components/sections/membership-section";
import { CalculatorsSection } from "@/components/sections/calculators-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { FaqSection } from "@/components/sections/faq-section";
import { AboutSection } from "@/components/sections/about-section";
import { TrainersSection } from "@/components/sections/trainers-section";
import { ProgramsSection } from "@/components/sections/programs-section";
import { ContactSection } from "@/components/sections/contact-section";
import { GallerySection } from "@/components/sections/gallery-section";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <ProgramsSection />
      <TrainersSection />
      <MembershipSection />
      <CalculatorsSection />
      <GallerySection />
      <TestimonialsSection />
      <FaqSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
