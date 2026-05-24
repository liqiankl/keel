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
  title: "Privacy Policy — Keel",
  description: "How Keel collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="We keep this short and plain-English. If you have questions, email us at privacy@keel.so."
      />

      <div className="mb-10 rounded-lg border border-white/6 bg-[#17171a] overflow-hidden">
        <MetaRow label="Effective date"    value="1 February 2026" />
        <MetaRow label="Last updated"      value="15 May 2026"     />
        <MetaRow label="Applies to"        value="keel.so and all subdomains" />
        <MetaRow label="Data controller"   value="Keel Technologies Ltd." />
        <MetaRow label="Contact"           value="privacy@keel.so" />
      </div>

      <Callout>
        <strong>Short version:</strong> Keel stores your workspace data locally in your browser during the beta. We don't sell your data. We don't run ads. We use minimal third-party services and tell you exactly which ones.
      </Callout>

      <Section title="1. What we collect">
        <SubSection title="Data you give us">
          <Prose>
            <p>When you use Keel, you may provide:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Your name and email address (used for your profile and member invites)</li>
              <li>Workspace name and slug</li>
              <li>Feature requests, initiative titles and descriptions, comments</li>
              <li>Scoring inputs and plan configurations</li>
            </ul>
            <p>
              During the current beta, <strong>all workspace data is stored in your browser's local storage</strong> and is not transmitted to or stored on Keel's servers. This means your planning data stays on your device.
            </p>
          </Prose>
        </SubSection>

        <SubSection title="Data collected automatically">
          <Prose>
            <p>When you visit keel.so we may automatically collect:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>IP address and general geographic location (country/region)</li>
              <li>Browser type and version, operating system</li>
              <li>Pages visited and time spent on each page</li>
              <li>Referring URL</li>
            </ul>
            <p>
              This data is collected through our hosting provider's access logs and is used for security monitoring and aggregate analytics only. It is not linked to individual user accounts.
            </p>
          </Prose>
        </SubSection>

        <SubSection title="Cookies">
          <Prose>
            <p>
              Keel uses <strong>only essential cookies</strong>. We do not use advertising cookies, tracking pixels, or third-party analytics cookies. The cookies we set are:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>keel-theme</strong> — stores your light/dark theme preference (localStorage)</li>
              <li><strong>keel-app-preferences</strong> — stores sidebar and view preferences (localStorage)</li>
              <li><strong>keel-tour-seen</strong> — records whether you've completed the product tour (localStorage)</li>
            </ul>
            <p>These are all stored in localStorage (not cookies), never sent to a server, and cleared when you clear your browser data.</p>
          </Prose>
        </SubSection>
      </Section>

      <Section title="2. How we use your data">
        <Prose>
          <p>We use the data we collect to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Provide and improve the Keel product</li>
            <li>Send product update emails (only if you opt in)</li>
            <li>Respond to support requests</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p>
            We do <strong>not</strong> use your data to train machine learning models, serve advertisements, or build profiles for third-party marketing.
          </p>
        </Prose>
      </Section>

      <Section title="3. Sharing your data">
        <Prose>
          <p>
            We do not sell your personal data. We share data only in these limited circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Service providers</strong> — we use Vercel for hosting and Resend for transactional email. Both are bound by data processing agreements.</li>
            <li><strong>Legal requirements</strong> — if required by law, court order, or to protect the rights of Keel or its users.</li>
            <li><strong>Business transfers</strong> — in the event of a merger or acquisition, user data may transfer. We'll notify you before that happens.</li>
          </ul>
        </Prose>
      </Section>

      <Section title="4. Data retention">
        <Prose>
          <p>
            Beta workspace data (stored locally) is retained until you clear your browser storage or uninstall Keel.
          </p>
          <p>
            Email addresses collected during invite flows are retained until you request deletion or your workspace is deleted. Server access logs are retained for 90 days.
          </p>
        </Prose>
      </Section>

      <Section title="5. Your rights">
        <SubSection title="Access and portability">
          <Prose>
            <p>You have the right to request a copy of all personal data we hold about you. Email <a href="mailto:privacy@keel.so">privacy@keel.so</a> and we'll respond within 30 days.</p>
          </Prose>
        </SubSection>
        <SubSection title="Deletion">
          <Prose>
            <p>You may request deletion of your account and associated data at any time. Local workspace data can be cleared by clearing your browser's storage. For server-side data (email addresses, logs), email <a href="mailto:privacy@keel.so">privacy@keel.so</a>.</p>
          </Prose>
        </SubSection>
        <SubSection title="Correction">
          <Prose>
            <p>If any personal data we hold is inaccurate, contact us and we'll correct it promptly.</p>
          </Prose>
        </SubSection>
        <SubSection title="Opt-out">
          <Prose>
            <p>You may opt out of product update emails at any time using the unsubscribe link in any email we send. We will not send marketing email without your explicit opt-in.</p>
          </Prose>
        </SubSection>
      </Section>

      <Section title="6. Security">
        <Prose>
          <p>
            Keel is served over HTTPS. Local data never leaves your browser during the beta. We use industry-standard security practices for our hosting infrastructure. No system is 100% secure — if you believe you've found a security vulnerability, please disclose it responsibly to <a href="mailto:security@keel.so">security@keel.so</a>.
          </p>
        </Prose>
      </Section>

      <Section title="7. Children">
        <Prose>
          <p>Keel is not directed at children under 16. We do not knowingly collect personal data from anyone under 16. If you believe a child has provided us with personal data, contact us and we'll delete it.</p>
        </Prose>
      </Section>

      <Section title="8. Changes to this policy">
        <Prose>
          <p>
            We may update this policy. If we make material changes, we'll post a notice on keel.so and (where we have your email) notify you directly at least 14 days before changes take effect. Continued use of Keel after that date constitutes acceptance.
          </p>
        </Prose>
      </Section>

      <Section title="9. Contact">
        <Prose>
          <p>
            Questions? Requests? Email <a href="mailto:privacy@keel.so">privacy@keel.so</a> or write to us at Keel Technologies Ltd., 1 Canada Square, London E14 5AB, United Kingdom.
          </p>
        </Prose>
      </Section>
    </MarketingShell>
  );
}
