import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import type { Service } from '@guard-provider/shared';
import { LandingHero } from './landing/LandingHero';
import {
  FeaturesSection,
  HowItWorks,
  ServiceCategories,
  TrustSection,
} from './landing/LandingSections';
import { ContactSection, FaqSection, Testimonials } from './landing/LandingSocial';

export function Landing() {
  const { data, loading } = useApi(() => api.get<{ items: Service[] }>('/services'), []);

  return (
    <>
      <LandingHero services={data?.items ?? []} />
      <ServiceCategories services={data?.items ?? []} loading={loading} />
      <HowItWorks />
      <TrustSection />
      <FeaturesSection />
      <Testimonials />
      <FaqSection />
      <ContactSection />
    </>
  );
}
