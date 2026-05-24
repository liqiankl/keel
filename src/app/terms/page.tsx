import {
  MarketingShell,
  PageHero,
  Section,
  SubSection,
  Prose,
  Callout,
  MetaRow,
} from "@/components/landing/MarketingShell";

export const metadata = {
  title: "Terms of Service — Keel",
  description: "The terms governing your use of Keel.",
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="Plain-language terms. Read them — they matter. Questions at legal@keel.so."
      />

      <div className="mb-10 rounded-lg border border-white/6 bg-[#17171a] overflow-hidden">
        <MetaRow label="Effective date"  value="1 February 2026" />
        <MetaRow label="Last updated"    value="15 May 2026" />
        <MetaRow label="Governing law"   value="England and Wales" />
        <MetaRow label="Contracting entity" value="Keel Technologies Ltd." />
        <MetaRow label="Contact"         value="legal@keel.so" />
      </div>

      <Callout>
        <strong>Short version:</strong> Use Keel for lawful planning work. Don't abuse the service or other users. We may update the product, but we'll tell you about material changes. If something goes wrong, our liability is limited.
      </Callout>

      <Section title="1. Acceptance">
        <Prose>
          <p>
            By accessing or using Keel ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you're using Keel on behalf of an organisation, you represent that you have authority to bind that organisation to these Terms.
          </p>
          <p>
            If you do not agree to these Terms, do not use the Service.
          </p>
        </Prose>
      </Section>

      <Section title="2. The Service">
        <SubSection title="What Keel provides">
          <Prose>
            <p>
              Keel is a product planning workspace that helps teams collect feature requests, prioritise initiatives, plan quarters, and share roadmaps. During the current beta, workspace data is stored locally in your browser.
            </p>
          </Prose>
        </SubSection>
        <SubSection title="Beta disclaimer">
          <Prose>
            <p>
              The Service is currently in <strong>beta</strong>. Features may change, break, or be removed without notice. We'll do our best to communicate significant changes in advance, but make no guarantee of stability during this period.
            </p>
          </Prose>
        </SubSection>
        <SubSection title="Availability">
          <Prose>
            <p>
              We aim for high availability but do not guarantee that the Service will be available at any given time. We may suspend access for maintenance, security reasons, or legal compliance without liability.
            </p>
          </Prose>
        </SubSection>
      </Section>

      <Section title="3. Your account">
        <Prose>
          <p>
            You are responsible for maintaining the security of your workspace and any share links you generate. Do not share admin access with people you don't trust. Notify us immediately at <a href="mailto:security@keel.so">security@keel.so</a> if you suspect unauthorised access.
          </p>
          <p>
            You must be at least 16 years old to use Keel. By using the Service, you confirm that you meet this requirement.
          </p>
        </Prose>
      </Section>

      <Section title="4. Acceptable use">
        <SubSection title="You may">
          <Prose>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use Keel for legitimate product planning and management purposes</li>
              <li>Invite colleagues and stakeholders to view your workspace or shared links</li>
              <li>Export or share your roadmap data as you see fit</li>
              <li>Integrate Keel into your team's existing workflow</li>
            </ul>
          </Prose>
        </SubSection>
        <SubSection title="You may not">
          <Prose>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorised access to any part of the Service or its infrastructure</li>
              <li>Reverse-engineer, decompile, or disassemble any part of the Service</li>
              <li>Use automated scraping, crawling, or data extraction tools against the Service</li>
              <li>Upload or transmit content that infringes third-party intellectual property rights</li>
              <li>Impersonate any person, company, or entity</li>
              <li>Use the Service to build a competing product and misrepresent it as your own</li>
            </ul>
          </Prose>
        </SubSection>
      </Section>

      <Section title="5. Intellectual property">
        <SubSection title="Keel's IP">
          <Prose>
            <p>
              The Keel name, logo, software, and all associated content are the intellectual property of Keel Technologies Ltd. These Terms do not grant you any rights to use our trademarks, trade dress, or branding.
            </p>
          </Prose>
        </SubSection>
        <SubSection title="Your content">
          <Prose>
            <p>
              You retain all rights to the content you create in Keel — your requests, plans, comments, and roadmaps. You grant Keel a limited licence to store and display that content solely to provide the Service to you.
            </p>
            <p>
              We do not claim ownership of your planning data and we will not use it for purposes other than operating the Service.
            </p>
          </Prose>
        </SubSection>
      </Section>

      <Section title="6. Privacy">
        <Prose>
          <p>
            Your use of the Service is also governed by our <a href="/privacy">Privacy Policy</a>, which is incorporated into these Terms by reference. By using Keel, you agree to the collection and use of data as described in the Privacy Policy.
          </p>
        </Prose>
      </Section>

      <Section title="7. Payments and free access">
        <Prose>
          <p>
            Keel is currently <strong>free to use</strong>. When paid plans are introduced, existing users will be given advance notice and a grace period before any features become paid-only. We will never retroactively charge for features that were free at the time you began using them.
          </p>
        </Prose>
      </Section>

      <Section title="8. Disclaimers">
        <Prose>
          <p>
            The Service is provided <strong>"as is"</strong> and <strong>"as available"</strong> without warranties of any kind, express or implied. We do not warrant that the Service will be error-free, uninterrupted, or fit for your particular purpose.
          </p>
          <p>
            You use the Service at your own risk. Because beta workspace data is stored locally in your browser, we are not responsible for data loss resulting from browser updates, storage clearing, or device failure.
          </p>
        </Prose>
      </Section>

      <Section title="9. Limitation of liability">
        <Prose>
          <p>
            To the maximum extent permitted by law, Keel Technologies Ltd. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the Service — including but not limited to loss of data, loss of revenue, or loss of goodwill.
          </p>
          <p>
            Our total liability to you for any claims arising under these Terms shall not exceed £100 or the amount you paid us in the 12 months preceding the claim, whichever is greater.
          </p>
        </Prose>
      </Section>

      <Section title="10. Termination">
        <Prose>
          <p>
            You may stop using Keel at any time. We may suspend or terminate your access if you violate these Terms, with or without notice.
          </p>
          <p>
            On termination, your right to use the Service ceases immediately. Sections on intellectual property, disclaimers, limitation of liability, and governing law survive termination.
          </p>
        </Prose>
      </Section>

      <Section title="11. Changes to these Terms">
        <Prose>
          <p>
            We may update these Terms from time to time. We'll post the updated version at keel.so/terms and update the "last updated" date above. For material changes, we'll notify you by email (if we have it) at least 14 days before the changes take effect. Continued use of the Service after the effective date constitutes acceptance.
          </p>
        </Prose>
      </Section>

      <Section title="12. Governing law and disputes">
        <Prose>
          <p>
            These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
          </p>
          <p>
            Before pursuing formal legal action, please email <a href="mailto:legal@keel.so">legal@keel.so</a> — we'd prefer to resolve disputes informally.
          </p>
        </Prose>
      </Section>

      <Section title="13. Contact">
        <Prose>
          <p>
            Questions about these Terms? Email <a href="mailto:legal@keel.so">legal@keel.so</a> or write to Keel Technologies Ltd., 1 Canada Square, London E14 5AB, United Kingdom.
          </p>
        </Prose>
      </Section>
    </MarketingShell>
  );
}
