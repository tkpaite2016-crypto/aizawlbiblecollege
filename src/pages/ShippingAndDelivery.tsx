import { Truck } from 'lucide-react';

export default function ShippingAndDelivery() {
  return (
    <div className="page-enter min-h-screen bg-slate-50 py-12">
      <div className="page-container max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="bg-navy-950 px-6 py-8 text-center">
            <Truck className="w-10 h-10 text-gold-400 mx-auto mb-3" />
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Shipping & Delivery Policy</h1>
            <p className="text-slate-400 text-sm mt-2">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="prose prose-navy max-w-none">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-blue-800 text-sm leading-relaxed">
                <strong>Note:</strong> Aizawl Bible College is primarily an educational institution. This Shipping & Delivery Policy applies to the delivery of certificates, official documents, study materials, and other items that may be requested by students and graduates.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">1. Document Delivery Services</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                The college provides delivery services for the following documents and materials:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Academic transcripts and mark sheets</li>
                <li>Graduation certificates</li>
                <li>Character certificates</li>
                <li>Migration certificates</li>
                <li>Official letters and recommendation letters</li>
                <li>Study materials (for distance education programs if applicable)</li>
                <li>Identity cards (for new students)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">2. Processing Time</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Document processing times are as follows:
              </p>
              <div className="bg-slate-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-navy-800 text-white">
                      <th className="px-4 py-3 text-left font-medium">Document Type</th>
                      <th className="px-4 py-3 text-left font-medium">Processing Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="px-4 py-3 text-slate-700">Certificates (Graduation)</td>
                      <td className="px-4 py-3 text-slate-700">5-7 working days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-700">Transcripts</td>
                      <td className="px-4 py-3 text-slate-700">3-5 working days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-700">Character Certificate</td>
                      <td className="px-4 py-3 text-slate-700">2-3 working days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-700">Migration Certificate</td>
                      <td className="px-4 py-3 text-slate-700">5-7 working days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-700">Recommendation Letters</td>
                      <td className="px-4 py-3 text-slate-700">2-3 working days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-700">Identity Cards</td>
                      <td className="px-4 py-3 text-slate-700">3-5 working days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">3. Delivery Methods</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Documents can be delivered through the following methods:
              </p>

              <h3 className="text-lg font-semibold text-navy-800 mb-2">In-Person Collection</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Documents can be collected in person from the college office during working hours (9:00 AM - 4:00 PM, Monday to Friday). A valid ID proof is required for collection.
              </p>

              <h3 className="text-lg font-semibold text-navy-800 mb-2">Postal Delivery (Standard)</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                <li>Delivery through India Post (Registered Post)</li>
                <li>Delivery time: 7-15 working days (depending on location)</li>
                <li>Tracking number provided via email</li>
                <li>Cost: Standard postal charges apply</li>
              </ul>

              <h3 className="text-lg font-semibold text-navy-800 mb-2">Courier Delivery (Express)</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Delivery through professional courier services</li>
                <li>Delivery time: 3-7 working days</li>
                <li>Full tracking available</li>
                <li>Cost: Higher courier charges apply</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">4. Delivery Charges</h2>
              <div className="bg-slate-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-navy-800 text-white">
                      <th className="px-4 py-3 text-left font-medium">Delivery Type</th>
                      <th className="px-4 py-3 text-left font-medium">Destination</th>
                      <th className="px-4 py-3 text-left font-medium">Estimated Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="px-4 py-3 text-slate-700">Standard Post</td>
                      <td className="px-4 py-3 text-slate-700">Within Mizoram</td>
                      <td className="px-4 py-3 text-slate-700">Rs. 50-100</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-700">Standard Post</td>
                      <td className="px-4 py-3 text-slate-700">Rest of India</td>
                      <td className="px-4 py-3 text-slate-700">Rs. 100-150</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-700">Express Courier</td>
                      <td className="px-4 py-3 text-slate-700">Within Mizoram</td>
                      <td className="px-4 py-3 text-slate-700">Rs. 100-150</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-700">Express Courier</td>
                      <td className="px-4 py-3 text-slate-700">Rest of India</td>
                      <td className="px-4 py-3 text-slate-700">Rs. 200-400</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-700">International</td>
                      <td className="px-4 py-3 text-slate-700">Outside India</td>
                      <td className="px-4 py-3 text-slate-700">Actual cost + handling</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                * Charges are subject to revision based on carrier rates. Actual charges will be communicated at the time of request.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">5. Document Request Process</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                To request document delivery:
              </p>
              <ol className="list-decimal pl-6 text-slate-600 space-y-2">
                <li>Submit a written request to the Principal's Office</li>
                <li>Specify document type and quantity required</li>
                <li>Indicate preferred delivery method</li>
                <li>Provide complete postal address with PIN code</li>
                <li>Attach proof of payment for document fees</li>
                <li>For authorized collection, submit authorization letter</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">6. International Delivery</h2>
              <p className="text-slate-600 leading-relaxed">
                Documents requested for international delivery are sent through India Post International or professional international courier services (DHL, FedEx). Delivery time for international destinations is typically 10-20 working days. All customs duties and taxes in the destination country are the responsibility of the recipient. International delivery fees are charged at actual cost plus handling charges.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">7. Lost or Damaged Deliveries</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                In case of lost or damaged deliveries:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Report immediately to the college office within 48 hours</li>
                <li>Provide tracking number and delivery details</li>
                <li>The college will file a claim with the carrier</li>
                <li>Duplicate documents will be issued subject to verification</li>
                <li>Additional processing fees may apply for duplicate documents</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">8. Delivery Address Guidelines</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Please ensure the following for accurate delivery:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Complete address with house/flat number, street name, and landmarks</li>
                <li>Correct city/town/village name</li>
                <li>Accurate PIN code (6-digit)</li>
                <li>Active mobile number for delivery coordination</li>
                <li>Email address for tracking updates</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">9. Non-Delivery Conditions</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Delivery may be withheld or delayed in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Incomplete or inaccurate address information</li>
                <li>Outstanding fees or dues to the college</li>
                <li>Disciplinary proceedings pending</li>
                <li>Discrepancies in academic records requiring clarification</li>
                <li>External circumstances beyond the college's control (strikes, natural disasters, etc.)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-serif font-bold text-navy-900 mb-4">10. Contact for Delivery Queries</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                For delivery-related queries, please contact:
              </p>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="font-medium text-navy-900">Office of the Principal</p>
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
