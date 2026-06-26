import { RotateCcw } from 'lucide-react';

export default function CancellationAndRefunds() {
  return (
    <div className="page-enter min-h-screen bg-slate-50 py-12">
      <div className="page-container max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="bg-navy-950 px-6 py-8 text-center">
            <RotateCcw className="w-10 h-10 text-gold-400 mx-auto mb-3" />
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Cancellation & Refund Policy</h1>
            <p className="text-slate-400 text-sm mt-2">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="prose prose-navy max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">1. Admission Cancellation</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Students who wish to cancel their admission may do so under the following conditions:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Before commencement of classes:</strong> Full refund of tuition fees minus a 10% administrative charge</li>
                <li><strong>Within 30 days of class commencement:</strong> 75% refund of tuition fees</li>
                <li><strong>Between 30-60 days:</strong> 50% refund of tuition fees</li>
                <li><strong>After 60 days:</strong> No refund of tuition fees</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-4">
                All requests for admission cancellation must be submitted in writing to the Principal's office along with original fee receipts.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">2. Fee Payment Refunds</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Refunds for fee payments are processed according to the following policy:
              </p>

              <h3 className="text-lg font-semibold text-navy-800 mb-2">Eligible for Refund</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                <li>Duplicate payments made for the same fee</li>
                <li>Excess payments beyond the required fee amount</li>
                <li>Payments made for cancelled courses or programs</li>
                <li>Wrongful charges due to system errors</li>
              </ul>

              <h3 className="text-lg font-semibold text-navy-800 mb-2">Not Eligible for Refund</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Examination fees once the student has appeared for the exam</li>
                <li>Library and laboratory fees</li>
                <li>Identity card and certificate fees</li>
                <li>Graduation and convocation fees</li>
                <li>Hostel fees after the semester has begun</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">3. Online Payment Refunds</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                For payments made through Razorpay or other online methods:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Approved refunds will be credited to the original payment source within 7-10 business days</li>
                <li>Transaction charges (if any) are non-refundable</li>
                <li>Refund requests must be made within 30 days of the transaction</li>
                <li>The college is not responsible for delays caused by payment gateway or banking processes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">4. Course/Subject Cancellation</h2>
              <p className="text-slate-600 leading-relaxed">
                If the college cancels a course or subject due to insufficient enrollment or other circumstances, students enrolled in that course will receive a full refund of fees paid specifically for that course. The college will make every effort to offer alternative courses or subjects.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">5. Refund Process</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                To request a refund:
              </p>
              <ol className="list-decimal pl-6 text-slate-600 space-y-2">
                <li>Submit a written refund request to the Accounts Office</li>
                <li>Include original fee receipts and transaction details</li>
                <li>Provide bank account details for refund transfer</li>
                <li>The request will be reviewed within 7 working days</li>
                <li>Approved refunds will be processed within 14 working days</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">6. Disciplinary Dismissal</h2>
              <p className="text-slate-600 leading-relaxed">
                Students dismissed from the college for disciplinary reasons are not entitled to any refund of fees paid. The college reserves the right to forfeit all fees in cases of serious disciplinary violations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">7. Medical Withdrawal</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Students who must withdraw due to serious medical conditions may be eligible for a pro-rated refund upon submission of appropriate medical documentation:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Medical certificate from a registered medical practitioner</li>
                <li>Written request stating the medical condition</li>
                <li>Verification by the college medical officer</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-4">
                Refund percentage will be determined based on the time of withdrawal during the semester.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">8. Hostel Refunds</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Hostel fee refunds are governed by separate policies:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Caution deposit is fully refundable upon vacating the hostel in good condition</li>
                <li>Room rent refunds follow the admission cancellation policy timeline</li>
                <li>Mess fees are refundable on a pro-rated basis only</li>
                <li>Hostel regulations violations may result in forfeiture of fees</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">9. Appealing Refund Decisions</h2>
              <p className="text-slate-600 leading-relaxed">
                Students who disagree with a refund decision may appeal to the Principal in writing within 30 days of receiving the decision. The Principal's decision on the appeal is final.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">10. Contact for Refunds</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                For refund-related queries, please contact:
              </p>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="font-medium text-navy-900">Accounts Office</p>
                <p className="text-slate-600">Aizawl Bible College</p>
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
