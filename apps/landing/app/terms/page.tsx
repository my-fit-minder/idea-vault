import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service - Ideafy',
  description: 'Terms of Service for Ideafy - Read our terms and conditions.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="max-w-none">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing and using Ideafy (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of Ideafy, including any content, functionality, and services 
              offered on or through the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed">
              Ideafy is an idea management application that allows users to capture, organize, and develop their ideas. The Service includes 
              features such as idea storage, organization with tags, search functionality, offline support, cross-device synchronization, and 
              AI-powered analysis. We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use Ideafy, you must create an account by providing an email address and password. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Ensuring that your account information is accurate and up-to-date</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              We reserve the right to suspend or terminate your account if you violate these Terms or engage in any fraudulent, abusive, or illegal activity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Content</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You retain all ownership rights to the ideas and content you create and store using Ideafy (&quot;User Content&quot;). By using the Service, you grant us:
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4">
              <li>A license to store, process, and display your User Content solely for the purpose of providing the Service</li>
              <li>The right to use your User Content to generate AI-powered reports and insights as part of the Service</li>
              <li>The right to access your User Content to provide technical support and maintain the Service</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              You are solely responsible for your User Content and represent that you have all necessary rights to submit such content. You agree not to submit 
              any content that is illegal, harmful, threatening, abusive, or violates any third-party rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others, including intellectual property rights</li>
              <li>Transmit any malicious code, viruses, or harmful software</li>
              <li>Attempt to gain unauthorized access to the Service or related systems</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service</li>
              <li>Use the Service for any commercial purpose without our prior written consent</li>
              <li>Collect or harvest information about other users without their consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service, including its original content, features, and functionality, is owned by Ideafy and is protected by international copyright, 
              trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You may not copy, modify, distribute, sell, or lease any part of the Service or included software, nor may you reverse engineer or attempt to 
              extract the source code of that software, unless laws prohibit those restrictions or you have our written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. AI-Powered Features</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ideafy includes AI-powered features that analyze your ideas and generate reports. You understand and agree that:
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4">
              <li>AI-generated content is provided for informational purposes only and should not be considered professional advice</li>
              <li>We do not guarantee the accuracy, completeness, or usefulness of AI-generated insights</li>
              <li>You should use your own judgment when making decisions based on AI-generated content</li>
              <li>AI features may be updated, modified, or discontinued at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Availability</h2>
            <p className="text-gray-700 leading-relaxed">
              We strive to provide a reliable and accessible Service, but we do not guarantee that the Service will be available at all times. The Service 
              may be unavailable due to maintenance, updates, technical issues, or other reasons beyond our control. We are not liable for any loss or damage 
              resulting from Service unavailability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Data Backup and Loss</h2>
            <p className="text-gray-700 leading-relaxed">
              While we implement measures to protect your data, you are responsible for maintaining backups of your important content. We are not responsible 
              for any loss of data, including User Content, that may occur. We recommend regularly exporting your ideas to ensure you have copies of your important information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may terminate your account at any time by deleting your account through the Service settings. We reserve the right to suspend or terminate 
              your access to the Service immediately, without prior notice, for any reason, including if you breach these Terms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Upon termination, your right to use the Service will cease immediately. We may delete your account and User Content, though some information may 
              be retained as required by law or for legitimate business purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Disclaimer of Warranties</h2>
            <p className="text-gray-700 leading-relaxed">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
              IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE 
              UNINTERRUPTED, SECURE, OR ERROR-FREE.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IDEAFY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, 
              OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, 
              RESULTING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify and hold harmless Ideafy, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, 
              and expenses (including legal fees) arising out of or relating to your use of the Service, your User Content, or your violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the updated Terms on this page and 
              updating the &quot;Last Updated&quot; date. Your continued use of the Service after such changes constitutes your acceptance of the new Terms. If you do not 
              agree to the modified Terms, you must stop using the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to its conflict of law provisions. Any disputes 
              arising from or relating to these Terms or the Service shall be resolved through appropriate legal channels.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us through the application or by email. We will respond to your inquiries 
              in a timely manner.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
