
import LegalDocument, { ContactEmail, LEGAL_CONTACT, type LegalSection } from "@/components/commons/LegalDocument";

const sections: LegalSection[] = [
  {
    title: "1. Introduction",
    content: (
      <p>
        The 42 Chosen is committed to protecting personal data and
        respecting the privacy rights of individuals. This GDPR Compliance
        Policy describes the principles and procedures we follow to
        protect personal data in accordance with the General Data
        Protection Regulation (EU) 2016/679 (GDPR), where applicable.
      </p>
    ),
  },
  {
    title: "2. Scope of This Policy",
    content: (
      <p>
        This policy applies to personal data processed by The 42 Chosen
        in connection with our website, application, products, services,
        and business operations. It applies to employees, contractors,
        and service providers who process personal data on our behalf,
        to the extent relevant to their roles and contractual obligations.
      </p>
    ),
  },
  {
    title: "3. Principles of Data Processing",
    content: (
      <>
        <p>We aim to process personal data in accordance with the following GDPR principles:</p>
        <ul>
          <li>
            <strong>Lawfulness, fairness, and transparency:</strong>{" "}
            Data is processed lawfully, fairly, and transparently.
          </li>
          <li>
            <strong>Purpose limitation:</strong>{" "}
            Data is collected for specified, explicit, and legitimate purposes.
          </li>
          <li>
            <strong>Data minimization:</strong>{" "}
            Only data that is necessary for the intended purpose is collected.
          </li>
          <li>
            <strong>Accuracy:</strong>{" "}
            Reasonable steps are taken to keep personal data accurate and up to date.
          </li>
          <li>
            <strong>Storage limitation:</strong>{" "}
            Data is not retained longer than necessary, subject to legal requirements.
          </li>
          <li>
            <strong>Integrity and confidentiality:</strong>{" "}
            Appropriate safeguards are used to protect personal data.
          </li>
          <li>
            <strong>Accountability:</strong>{" "}
            We aim to demonstrate compliance with applicable data protection requirements.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "4. Lawful Bases for Processing",
    content: (
      <>
        <p>
          We process personal data only where an appropriate legal basis
          exists under Article 6 of the GDPR. Depending on the purpose,
          this may include:
        </p>
        <ul>
          <li>
            <strong>Consent:</strong> Where an individual has freely given
            consent to a specific processing activity.
          </li>
          <li>
            <strong>Contract:</strong> Where processing is necessary to
            perform a contract or take requested pre-contractual steps.
          </li>
          <li>
            <strong>Legal obligation:</strong> Where processing is required
            to comply with applicable law.
          </li>
          <li>
            <strong>Legitimate interests:</strong> Where our legitimate
            interests do not override the individual's rights and freedoms.
          </li>
          <li>
            <strong>Vital interests or public task:</strong> Where the
            applicable legal conditions for these bases are met.
          </li>
        </ul>
        <p>
          The applicable legal basis is determined for each processing
          purpose and communicated where required.
        </p>
      </>
    ),
  },
  {
    title: "5. Data Subject Rights",
    content: (
      <>
        <p>
          Subject to the conditions and exceptions set out in the GDPR,
          individuals may exercise the following rights:
        </p>
        <ul>
          <li>Right of access to personal data.</li>
          <li>Right to rectification of inaccurate data.</li>
          <li>Right to erasure, also known as the right to be forgotten.</li>
          <li>Right to restriction of processing.</li>
          <li>Right to data portability, where applicable.</li>
          <li>Right to object to certain processing activities.</li>
          <li>
            Rights relating to decisions based solely on automated
            processing, including profiling, where applicable.
          </li>
          <li>Right to withdraw consent where processing relies on consent.</li>
        </ul>
        <p>
          Requests can be sent to{" "}
          <ContactEmail/>.
          We will respond within the time limits required by applicable law.
          Under the GDPR, the usual deadline is one month, subject to
          permitted extensions and notification requirements.
        </p>
      </>
    ),
  },
  {
    title: "6. Data Security",
    content: (
      <p>
        We implement and maintain appropriate technical and organizational
        measures designed to protect personal data against accidental
        or unlawful destruction, loss, alteration, unauthorized disclosure,
        or unauthorized access. Depending on the risks involved, these
        measures may include access controls, encryption, secure backups,
        staff training, and regular security reviews. The measures
        implemented must reflect our actual systems and practices.
      </p>
    ),
  },
  {
    title: "7. Data Retention",
    content: (
      <p>
        Personal data is retained only for as long as necessary for the
        purposes for which it was collected, unless a longer period is
        required or permitted by law. Retention periods are determined
        according to the type of data, the processing purpose, applicable
        legal obligations, and relevant limitation periods. Data that is
        no longer required is securely deleted or anonymized, where appropriate.
      </p>
    ),
  },
  {
    title: "8. Data Processors and Third Parties",
    content: (
      <p>
        We may engage third-party service providers to support our
        operations, such as hosting, infrastructure, analytics, customer
        support, or payment processing providers. Where a provider acts
        as a processor on our behalf, we implement the contractual
        arrangements required by Article 28 of the GDPR, where applicable.
        We take appropriate steps to assess providers and limit their
        access to the personal data needed to perform their services.
      </p>
    ),
  },
  {
    title: "9. International Data Transfers",
    content: (
      <p>
        Where personal data is transferred outside the European Economic
        Area, we ensure that an appropriate transfer mechanism and
        safeguards are in place when required by Chapter V of the GDPR.
        Depending on the circumstances, this may include an adequacy
        decision, Standard Contractual Clauses, and supplementary measures
        where necessary.
      </p>
    ),
  },
  {
    title: "10. Personal Data Breaches",
    content: (
      <p>
        We maintain procedures for identifying, assessing, documenting,
        and responding to personal data breaches. Where required by the
        GDPR, we notify the competent supervisory authority without undue
        delay and, where feasible, within 72 hours after becoming aware
        of the breach. Affected individuals are informed without undue
        delay where the breach is likely to result in a high risk to
        their rights and freedoms, subject to applicable exceptions.
      </p>
    ),
  },
  {
    title: "11. Data Protection by Design and Default",
    content: (
      <p>
        We aim to incorporate data protection into the design and
        development of our products, services, and processes. Where
        appropriate, we apply data minimization, access restrictions,
        privacy-friendly settings, and other safeguards from the
        earliest stages of development and throughout the data lifecycle.
      </p>
    ),
  },
  {
    title: "12. Data Protection Impact Assessments",
    content: (
      <p>
        Where a type of processing is likely to result in a high risk
        to individuals' rights and freedoms, we assess whether a Data
        Protection Impact Assessment (DPIA) is required under Article 35
        of the GDPR. Where required, the assessment is completed before
        the relevant processing begins.
      </p>
    ),
  },
  {
    title: "13. Children's Personal Data",
    content: (
      <p>
        Where our services involve children's personal data, we apply
        appropriate safeguards and comply with the additional legal
        requirements applicable to children. Where consent is relied
        upon for an online service offered directly to a child, the
        applicable rules on parental authorization and the age of consent
        are taken into account.
      </p>
    ),
  },
  {
    title: "14. Cookies and Consent",
    content: (
      <p>
        Where cookies or similar technologies require consent, we provide
        appropriate information and obtain valid consent before activating
        the relevant technologies. Any exemptions
        from consent are assessed according to the applicable rules.
      </p>
    ),
  },
  {
    title: "15. Responsibilities and Accountability",
    content: (
      <p>
        The 42 Chosen is responsible for implementing the data protection
        measures applicable to its activities. Responsibilities may include
        maintaining records of processing where required, reviewing
        security measures, managing data subject requests, assessing
        suppliers, and providing relevant staff training. A Data Protection
        Officer (DPO) will be appointed where legally required.
      </p>
    ),
  },
  {
    title: "16. Complaints and Supervisory Authorities",
    content: (
      <p>
        Individuals who believe their personal data has been processed
        unlawfully may contact us using the details below. They also
        have the right to lodge a complaint with a competent supervisory
        authority, in particular in the EU Member State of their habitual
        residence, place of work, or the place of the alleged infringement,
        subject to applicable rules. In France, the supervisory authority
        is the Commission Nationale de l'Informatique et des Libertés (CNIL).
      </p>
    ),
  },
  {
    title: "17. Policy Updates",
    content: (
      <p>
        We may update this policy to reflect changes in our operations,
        technical measures, or legal requirements. The latest version
        will be published on this page with its revision date.
      </p>
    ),
  },
  {
    title: "18. Contact Information",
    content: (
      <>
        <p>
          For questions about this policy or our personal data protection
          practices, please contact:
        </p>
        <ul>
          <li>Company: {LEGAL_CONTACT.company}</li>
          <li>Address: {LEGAL_CONTACT.address}</li>
          <li>
            Privacy contact:{" "}
            <ContactEmail/>
          </li>
        </ul>
      </>
    ),
  },
];

export default function GDPRPolicy() {
  return (
    <LegalDocument
      id="gdpr"
      label="Legal & Compliance"
      title="GDPR Compliance Policy"
      intro="Our approach to personal data protection, privacy rights, and compliance with the General Data Protection Regulation."
      lastUpdated="28/10/2026"
      sections={sections}
    />
  );
}
