import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="page-enter min-h-screen bg-slate-50 py-12">
      <div className="page-container max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="bg-navy-950 px-6 py-8 text-center">
            <Shield className="w-10 h-10 text-gold-400 mx-auto mb-3" />
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Privacy Policy</h1>
            <p className="text-slate-400 text-sm mt-2">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="prose prose-navy max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">1. Information We Collect</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Aizawl Bible College collects information to provide better services to our students, applicants, and website visitors. The types of information we collect include:
              </p>

              <h3 className="text-lg font-semibold text-navy-800 mb-2">Personal Information</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                <li>Name, email address, phone number, and postal address</li>
                <li>Date of birth and gender</li>
                <li>Educational qualifications and academic records</li>
                <li>Church affiliation and denominational background</li>
                <li>Parent/guardian information</li>
                <li>Photographs and identification documents</li>
              </ul>

              <h3 className="text-lg font-semibold text-navy-800 mb-2">Financial Information</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                <li>Payment and transaction records</li>
                <li>Fee payment history</li>
                <li>Scholarship and financial aid information</li>
              </ul>

              <h3 className="text-lg font-semibold text-navy-800 mb-2">Technical Information</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>IP address and browser type</li>
                <li>Device information and operating system</li>
                <li>Pages visited and time spent on our website</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Processing admission applications and enrollment</li>
                <li>Managing student academic records and progress</li>
                <li>Communication regarding courses, events, and announcements</li>
                <li>Processing payments and maintaining financial records</li>
                <li>Generating certificates and official documents</li>
                <li>Improving website functionality and user experience</li>
                <li>Fulfilling legal and regulatory requirements</li>
                <li>Sending updates about college activities and programs</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">3. Information Sharing</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We do not sell, trade, or rent personal information to third parties. We may share information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>With accreditation bodies (PATA) for academic verification</li>
                <li>With government authorities as required by law</li>
                <li>With service providers who assist in website operations (e.g., Razorpay for payments)</li>
                <li>With consent from the individual for specific purposes</li>
                <li>In connection with legal proceedings or investigations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">4. Data Security</h2>
              <p className="text-slate-600 leading-relaxed">
                Aizawl Bible College implements appropriate security measures to protect personal information from unauthorized access, alteration, disclosure, or destruction. These measures include secure servers, encryption, access controls, and regular security reviews. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">5. Cookies and Tracking</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Our website uses cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Remember user preferences and settings</li>
                <li>Authenticate logged-in users</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Improve website performance and functionality</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-4">
                You can configure your browser to reject cookies, but this may affect website functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">6. Your Rights</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Access your personal information held by the college</li>
                <li>Request correction of inaccurate or incomplete information</li>
                <li>Request deletion of your personal information (subject to legal requirements)</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for specific data processing activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">7. Data Retention</h2>
              <p className="text-slate-600 leading-relaxed">
                We retain personal information for as long as necessary to fulfill the purposes for which it was collected, including legal, academic, and operational requirements. Academic records are retained permanently as required by the Government of Mizoram and accreditation bodies. Other records are retained according to applicable retention schedules.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">8. Third-Party Services</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Our website may use third-party services that collect information:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Razorpay:</strong> For processing online payments securely</li>
                <li><strong>Supabase:</strong> For database and authentication services</li>
                <li><strong>Google Fonts:</strong> For typography</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-4">
                These services have their own privacy policies, and we encourage you to review them.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">9. Children's Privacy</h2>
              <p className="text-slate-600 leading-relaxed">
                Our website and services are not directed to children under 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-slate-600 leading-relaxed">
                We may update this Privacy Policy periodically. Changes will be posted on this page with an updated revision date. We encourage you to review this policy regularly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">11. Contact Us</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                For questions or concerns about this Privacy Policy or our data practices, please contact:
              </p>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="font-medium text-navy-900">Aizawl Bible College</p>
                <p className="text-slate-600">Post Box – 115, Tuikual North 'D' Mual</p>
                <p className="text-slate-600">Aizawl – 796001, Mizoram, India</p>
                <p className="text-slate-600 mt-2">Email: aizawlbiblecollege24@gmail.com</p>
                <p className="text-slate-600">Phone: 9383007361 / 9862713689</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
