
import LegalDocument, { ContactEmail, LEGAL_CONTACT, type LegalSection } from "@/components/commons/LegalDocument";

const sections: LegalSection[] = [
  {
    title: "1. Data Controller",
    content: (
      <>
        <p>
          The data controller responsible for the processing of personal
          data collected through this website or application is:
        </p>
        <ul>
          <li>Company / Name: {LEGAL_CONTACT.company}</li>
          <li>Address: {LEGAL_CONTACT.address}</li>
          <li>Email: <ContactEmail/></li>
        </ul>
      </>
    ),
  },
  {
    title: "2. Personal Data We Collect",
    content: (
      <>
        <p>
          Depending on how you use our services, we may collect the
          following categories of personal data:
        </p>
        <ul>
          <li>Identity information, such as your name and surname.</li>
          <li>Contact details, such as your email address and phone number.</li>
          <li>
            Account information required to create and manage your user account.
          </li>
          <li>
            Technical information, such as your IP address, browser type,
            device information, and technical logs, where collected.
          </li>
          <li>
            Information you voluntarily provide through forms or messages.
          </li>
        </ul>
        <p>
          We only collect personal data that is necessary for the
          purposes described in this Privacy Policy.
        </p>
      </>
    ),
  },
  {
    title: "3. How and Why We Use Your Data",
    content: (
      <>
        <p>We may use your personal data to:</p>
        <ul>
          <li>Provide and operate our services.</li>
          <li>Create and manage user accounts.</li>
          <li>Respond to inquiries and provide customer support.</li>
          <li>Maintain security and prevent fraud or misuse.</li>
          <li>Comply with applicable legal obligations.</li>
          <li>
            Send marketing communications where legally permitted and,
            when required, with your consent.
          </li>
        </ul>
        <p>
          Depending on the processing activity, our legal basis may be
          the performance of a contract, your consent, compliance with
          a legal obligation, or our legitimate interests.
        </p>
      </>
    ),
  },
  {
    title: "4. Data Retention",
    content: (
      <p>
        We retain personal data only for as long as necessary to fulfill
        the purposes for which it was collected, subject to applicable
        legal retention requirements. Retention periods depend on the
        category of data and the purpose of processing.
      </p>
    ),
  },
  {
    title: "5. Sharing of Personal Data",
    content: (
      <p>
        Your personal data may be accessed by authorized personnel and
        technical service providers acting on our behalf, to the extent
        necessary to perform their services. We do not sell your personal
        data to third parties, provided this statement accurately reflects
        our actual practices. Any additional disclosure will be made only
        where an appropriate legal basis exists.
      </p>
    ),
  },
  {
    title: "6. Data Hosting and International Transfers",
    content: (
      <p>
        Your personal data is hosted by 42.paris.fr in
        France. If personal data is transferred outside
        the European Economic Area, we will implement the applicable
        safeguards required by data protection law. Information about
        these safeguards will be made available where required.
      </p>
    ),
  },
  {
    title: "7. Cookies and Similar Technologies",
    content: (
      <p>
        This website may use cookies and similar technologies to ensure
        proper functionality, remember your preferences, or measure
        audience activity. Where consent is required, the relevant
        technologies will only be activated after you provide consent.
      </p>
    ),
  },
  {
    title: "8. Data Security",
    content: (
      <p>
        We implement appropriate technical and organizational measures
        designed to protect personal data against unauthorized access,
        loss, alteration, disclosure, or destruction. These measures
        are adapted to our infrastructure and the nature of the data
        being processed.
      </p>
    ),
  },
  {
    title: "9. Your Privacy Rights",
    content: (
      <>
        <p>
          Depending on applicable data protection laws, you may have
          the right to:
        </p>
        <ul>
          <li>Request access to your personal data.</li>
          <li>Request correction of inaccurate or incomplete data.</li>
          <li>Request the deletion of your personal data.</li>
          <li>Request restriction of certain processing activities.</li>
          <li>Request data portability where applicable.</li>
          <li>Object to certain processing activities.</li>
          <li>
            Withdraw your consent at any time where processing is based
            on consent.
          </li>
        </ul>
        <p>
          To exercise your rights, contact us at{" "}
          <ContactEmail/>.
        </p>
        <p>
          You may also lodge a complaint with your competent data
          protection authority, such as the CNIL in France.
        </p>
      </>
    ),
  },
  {
    title: "10. Children's Privacy",
    content: (
      <p>
        If our services are intended for children or may collect
        children's personal data, we will provide appropriate safeguards
        and comply with the applicable legal requirements concerning
        children's privacy and parental consent.
      </p>
    ),
  },
  {
    title: "11. Changes to This Privacy Policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time to reflect
        changes to our services, data processing practices, or applicable
        laws. The date of the latest revision will be indicated below.
      </p>
    ),
  },
  {
    title: "12. Contact Us",
    content: (
      <p>
        If you have any questions about this Privacy Policy or how we
        process your personal data, please contact us at{" "}
        <ContactEmail/>.
      </p>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalDocument
      id="privacy"
      label="Legal Information"
      title="Privacy Policy"
      intro="Learn how we collect, use, store, and protect your personal information."
      lastUpdated="28/10/2026"
      sections={sections}
    />
  );
}
