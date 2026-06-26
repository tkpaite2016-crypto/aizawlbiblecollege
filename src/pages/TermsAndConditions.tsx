import { FileText } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="page-enter min-h-screen bg-slate-50 py-12">
      <div className="page-container max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="bg-navy-950 px-6 py-8 text-center">
            <FileText className="w-10 h-10 text-gold-400 mx-auto mb-3" />
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Terms and Conditions</h1>
            <p className="text-slate-400 text-sm mt-2">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="prose prose-navy max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                By accessing and using the Aizawl Bible College (ABC) website and services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our website or services.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Aizawl Bible College reserves the right to modify these terms at any time. Changes will be effective immediately upon posting on this website. Your continued use of the website after any modifications indicates your acceptance of the updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">2. Admission and Enrollment</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Admission to Aizawl Bible College is subject to the following conditions:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>All applicants must complete the official application form and submit required documents</li>
                <li>Admission decisions are made by the ABC Admissions Committee and are final</li>
                <li>Students must fulfill all academic and financial requirements before enrollment</li>
                <li>Provisional admission may be granted pending submission of required documents</li>
                <li>The college reserves the right to deny admission to any applicant without explanation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">3. Student Code of Conduct</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                All students of Aizawl Bible College are expected to:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Maintain high standards of Christian character and conduct</li>
                <li>Attend all classes, chapel services, and college activities as required</li>
                <li>Abstain from practices inconsistent with Christian values including substance abuse</li>
                <li>Respect the authority of faculty, staff, and administration</li>
                <li>Complete all academic requirements and assignments on time</li>
                <li>Maintain academic integrity and honesty in all coursework</li>
                <li>Violate any provision may result in disciplinary action, including dismissal</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">4. Academic Policies</h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Students must maintain satisfactory academic progress as defined by the college</li>
                <li>Examinations and assessments are conducted according to the academic calendar</li>
                <li>Grading follows the standards established by the Pentecostal Association for Theological Accreditation (PATA)</li>
                <li>Plagiarism and academic dishonesty will result in disciplinary action</li>
                <li>Course credits are determined by the academic program and cannot be transferred without proper evaluation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">5. Fees and Payments</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Financial obligations to the college include:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>All fees must be paid according to the fee schedule provided at admission</li>
                <li>Late payments may incur additional charges</li>
                <li>The college reserves the right to withhold transcripts and certificates for unpaid fees</li>
                <li>Payment methods include cash, bank transfer, and online payment through Razorpay</li>
                <li>Fee structures are subject to revision by the college administration</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">6. Use of Website</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                When using this website, you agree not to:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Attempt unauthorized access to any part of the website or its systems</li>
                <li>Use the website for any illegal or unauthorized purpose</li>
                <li>Transmit any harmful code, viruses, or malicious content</li>
                <li>Collect personal information about other users without consent</li>
                <li>Interfere with or disrupt the website's operation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">7. Intellectual Property</h2>
              <p className="text-slate-600 leading-relaxed">
                All content on this website, including text, images, logos, and design elements, is the property of Aizawl Bible College and is protected by copyright laws. No part of this website may be reproduced, distributed, or transmitted without prior written permission from the college administration.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-slate-600 leading-relaxed">
                Aizawl Bible College shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of this website or services. The college makes no warranties, express or implied, regarding the accuracy or reliability of any content on this website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">9. Governing Law</h2>
              <p className="text-slate-600 leading-relaxed">
                These terms and conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Aizawl, Mizoram.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">10. Contact Information</h2>
              <p className="text-slate-600 leading-relaxed">
                For questions or concerns regarding these Terms and Conditions, please contact:
              </p>
              <div className="bg-slate-50 rounded-lg p-4 mt-4">
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
