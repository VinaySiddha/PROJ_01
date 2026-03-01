/**
 * @file Dynamic policy pages — refund-policy, privacy-policy, terms, privacy, refund
 * @module app/(public)/[policy]/page
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface PolicyPageProps {
  params: Promise<{ policy: string }>;
}

interface PolicyContent {
  title: string;
  lastUpdated: string;
  sections: Array<{
    heading?: string;
    body: string;
  }>;
}

const POLICIES: Record<string, PolicyContent> = {
  'refund-policy': {
    title: 'Refund Policy',
    lastUpdated: '2026-02-28',
    sections: [
      {
        body: 'The Magic Screen wants every booking to be a perfect experience. We understand that plans can change, and we have designed our refund policy to be as fair as possible.',
      },
      {
        heading: 'Advance Payment',
        body: 'We collect ₹700 as an advance to confirm your booking. This consists of ₹200 non-refundable processing fee and ₹500 refundable security deposit.',
      },
      {
        heading: 'Free Cancellation',
        body: 'Cancel at least 72 hours before your scheduled slot to receive a full refund of ₹500. The ₹200 processing fee is non-refundable in all cases.',
      },
      {
        heading: 'Late Cancellations',
        body: 'Cancellations made within 72 hours of the booking slot forfeit the entire ₹700 advance payment.',
      },
      {
        heading: 'No-Show Policy',
        body: 'No refund is applicable for no-shows. If you are unable to attend, please cancel at least 72 hours in advance.',
      },
      {
        heading: 'Refund Timeline',
        body: 'Approved refunds are processed within 7 business days to the original payment method (UPI, card, or net banking).',
      },
      {
        heading: 'Force Majeure',
        body: 'In case of circumstances beyond our control — natural disasters, government-mandated restrictions, or technical failures on our end — we will either reschedule your booking at no additional cost or issue a full refund.',
      },
      {
        heading: 'How to Cancel',
        body: 'To cancel your booking, visit the My Bookings section on our website or contact us directly via WhatsApp at +91 99999 99999. Cancellation requests are acknowledged within 2 hours during business hours.',
      },
    ],
  },

  /** Alias: Footer uses /refund as the href */
  refund: {
    title: 'Refund Policy',
    lastUpdated: '2026-02-28',
    sections: [
      {
        body: 'The Magic Screen wants every booking to be a perfect experience. We understand that plans can change, and we have designed our refund policy to be as fair as possible.',
      },
      {
        heading: 'Advance Payment',
        body: 'We collect ₹700 as an advance to confirm your booking. This consists of ₹200 non-refundable processing fee and ₹500 refundable security deposit.',
      },
      {
        heading: 'Free Cancellation',
        body: 'Cancel at least 72 hours before your scheduled slot to receive a full refund of ₹500. The ₹200 processing fee is non-refundable in all cases.',
      },
      {
        heading: 'Late Cancellations',
        body: 'Cancellations made within 72 hours of the booking slot forfeit the entire ₹700 advance payment.',
      },
      {
        heading: 'No-Show Policy',
        body: 'No refund is applicable for no-shows. If you are unable to attend, please cancel at least 72 hours in advance.',
      },
      {
        heading: 'Refund Timeline',
        body: 'Approved refunds are processed within 7 business days to the original payment method (UPI, card, or net banking).',
      },
      {
        heading: 'Force Majeure',
        body: 'In case of circumstances beyond our control — natural disasters, government-mandated restrictions, or technical failures on our end — we will either reschedule your booking at no additional cost or issue a full refund.',
      },
      {
        heading: 'How to Cancel',
        body: 'To cancel your booking, visit the My Bookings section on our website or contact us directly via WhatsApp at +91 99999 99999.',
      },
    ],
  },

  'privacy-policy': {
    title: 'Privacy Policy',
    lastUpdated: '2026-02-28',
    sections: [
      {
        body: 'The Magic Screen ("we", "our", "us") respects your privacy and is committed to protecting your personal data. This policy explains what data we collect, why we collect it, and how we use it.',
      },
      {
        heading: 'Data We Collect',
        body: 'We collect your name, phone number, email address (optional), booking preferences, and payment transaction IDs. We do not store any payment card details — all payments are processed securely through Razorpay.',
      },
      {
        heading: 'How We Use Your Data',
        body: 'Your information is used solely to process bookings, send confirmation and reminder messages via WhatsApp, improve our services, and contact you regarding your booking. We do not sell or share your data with third parties for marketing purposes.',
      },
      {
        heading: 'WhatsApp Communications',
        body: 'By providing your phone number, you consent to receive automated WhatsApp messages for booking confirmations, reminders, and review requests related to your bookings.',
      },
      {
        heading: 'Data Retention',
        body: 'Booking records are retained for 3 years for accounting and legal purposes. Account data may be deleted upon written request.',
      },
      {
        heading: 'Your Rights',
        body: 'You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at privacy@themagicscreen.com.',
      },
      {
        heading: 'Cookies',
        body: 'Our website uses essential cookies for functionality (session management, authentication). We do not use tracking or advertising cookies.',
      },
      {
        heading: 'Third-Party Services',
        body: 'We use Razorpay for payment processing and Cloudinary for image hosting. These services have their own privacy policies which govern their data practices.',
      },
    ],
  },

  /** Alias: Footer uses /privacy as the href */
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: '2026-02-28',
    sections: [
      {
        body: 'The Magic Screen ("we", "our", "us") respects your privacy and is committed to protecting your personal data. This policy explains what data we collect, why we collect it, and how we use it.',
      },
      {
        heading: 'Data We Collect',
        body: 'We collect your name, phone number, email address (optional), booking preferences, and payment transaction IDs. We do not store any payment card details.',
      },
      {
        heading: 'How We Use Your Data',
        body: 'Your information is used solely to process bookings, send confirmation and reminder messages via WhatsApp, and improve our services. We do not sell or share your data with third parties.',
      },
      {
        heading: 'WhatsApp Communications',
        body: 'By providing your phone number, you consent to receive automated WhatsApp messages for booking confirmations, reminders, and review requests related to your bookings.',
      },
      {
        heading: 'Data Retention',
        body: 'Booking records are retained for 3 years for accounting purposes. Account data may be deleted upon written request.',
      },
      {
        heading: 'Your Rights',
        body: 'You have the right to access, correct, or delete your personal data. Contact: privacy@themagicscreen.com.',
      },
      {
        heading: 'Cookies',
        body: 'Our website uses essential cookies for functionality only. We do not use tracking or advertising cookies.',
      },
    ],
  },

  terms: {
    title: 'Terms and Conditions',
    lastUpdated: '2026-02-28',
    sections: [
      {
        body: 'By booking a private theater at The Magic Screen, you agree to the following terms and conditions. Please read them carefully before confirming your booking.',
      },
      {
        heading: 'Booking & Payment',
        body: 'All bookings require an advance payment of ₹700. Bookings are confirmed only after successful payment. The remaining balance is due at the venue on the day of your booking.',
      },
      {
        heading: 'Content Policy',
        body: 'You may stream content from any legal, licensed platform (Netflix, Prime Video, Disney+, etc.). Pirated or illegal content is strictly prohibited. The Magic Screen is not responsible for streaming issues due to your account or subscription status.',
      },
      {
        heading: 'Guest Count',
        body: 'You must not exceed the maximum capacity of the theater as specified at the time of booking. Violations may result in immediate cancellation without refund.',
      },
      {
        heading: 'Responsible Use',
        body: 'Guests are responsible for the safety and cleanliness of the theater during their slot. Any damage caused will be charged accordingly. Smoking, alcohol, and harmful substances are strictly prohibited on our premises.',
      },
      {
        heading: 'Age Restriction',
        body: 'Couple-only theaters are reserved exclusively for guests aged 18 years and above. The Magic Screen reserves the right to request valid ID verification.',
      },
      {
        heading: 'Photography',
        body: 'Personal photography and videography is welcome. Commercial photography or videography inside the theater for professional purposes requires prior written permission from The Magic Screen management.',
      },
      {
        heading: 'Force Majeure',
        body: 'The Magic Screen is not liable for service interruptions due to power failures, technical issues, or circumstances beyond our reasonable control. We will make best efforts to reschedule affected bookings.',
      },
      {
        heading: 'Governing Law',
        body: 'These terms are governed by the laws of Telangana, India. All disputes are subject to the exclusive jurisdiction of courts in Hyderabad, Telangana.',
      },
      {
        heading: 'Contact',
        body: 'For legal queries, contact: legal@themagicscreen.com',
      },
    ],
  },
};

/** Valid policy slugs for static generation */
const VALID_POLICIES = Object.keys(POLICIES);

export function generateStaticParams() {
  return VALID_POLICIES.map((policy) => ({ policy }));
}

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const { policy } = await params;
  const content = POLICIES[policy];
  if (!content) return { title: 'Not Found' };
  return { title: content.title };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { policy } = await params;
  const content = POLICIES[policy];
  if (!content) notFound();

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#888] mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight size={14} />
          <span className="text-white">{content.title}</span>
        </nav>

        {/* Title */}
        <h1
          className="text-4xl font-bold text-white mb-8"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {content.title}
        </h1>

        {/* Policy sections */}
        <div className="space-y-6">
          {content.sections.map((section, i) => (
            <div key={i}>
              {section.heading && (
                <h2 className="text-base font-semibold text-white mb-2">
                  {section.heading}
                </h2>
              )}
              <p className="text-[#888] leading-relaxed text-[0.9375rem]">{section.body}</p>
            </div>
          ))}
        </div>

        {/* Last updated + back link */}
        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-[#555]">Last updated: {content.lastUpdated}</p>
          <Link
            href="/contact"
            className="text-sm text-[#D4A017] hover:underline"
          >
            Questions? Contact Us &#8594;
          </Link>
        </div>
      </div>
    </div>
  );
}
