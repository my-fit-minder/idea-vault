import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './PrivacyPolicy.css';

export function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="privacy-policy-container">
      <div className="privacy-policy-card">
        <div className="privacy-header">
          <button
            onClick={() => {
              void navigate(-1);
            }}
            className="back-button"
            title="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <h1>Privacy Policy</h1>
        </div>

        <div className="privacy-content">
          <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

          <section className="privacy-section">
            <h2>Introduction</h2>
            <p>
              At Ideafy, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
              application and services. By using Ideafy, you agree to the collection and use of information in accordance 
              with this policy.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, including your email address and password when you create 
              an account. We also collect information about your ideas, including titles, content, tags, and any additional 
              context you provide. Additionally, we may automatically collect certain information about your device and how you 
              interact with our application, such as your IP address, browser type, and usage patterns.
            </p>
          </section>

          <section className="privacy-section">
            <h2>How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, including processing your ideas, 
              generating AI-powered reports, and personalizing your experience. We may also use your information to communicate 
              with you about your account, respond to your inquiries, and send you important updates about our services. Your 
              ideas and personal data are stored securely and are only accessible to you through your authenticated account.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. This includes using encryption, secure authentication 
              methods, and regular security assessments. However, no method of transmission over the internet or electronic storage 
              is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Data Retention</h2>
            <p>
              We retain your personal information and ideas for as long as your account is active or as needed to provide you with 
              our services. If you choose to delete your account, we will delete or anonymize your personal information in 
              accordance with applicable laws and regulations. Some information may be retained for a longer period if required by 
              law or for legitimate business purposes.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information at any time through your account settings. 
              You may also request a copy of your data or object to certain processing activities. If you have any questions or 
              concerns about your privacy rights, please contact us using the information provided below.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Third-Party Services</h2>
            <p>
              Our application may use third-party services, such as cloud hosting providers and authentication services, to operate 
              and improve our platform. These third parties may have access to your information only to perform specific tasks on 
              our behalf and are obligated not to disclose or use it for any other purpose. We carefully select our service 
              providers and ensure they maintain appropriate security standards.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, 
              legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this 
              page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically to stay 
              informed about how we protect your information.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact 
              us through the application or by email. We are committed to addressing your privacy concerns and will respond to 
              your inquiries in a timely manner.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
