import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, ArrowLeft, RefreshCw, BookOpen, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function EmailConfirmation() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  async function handleResend() {
    if (!email) return;
    setResending(true);
    setResendError('');
    setResendSuccess(false);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      setResendError(error.message);
    } else {
      setResendSuccess(true);
    }
    setResending(false);
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* College Logo/Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl mb-6 shadow-xl">
            <BookOpen className="w-10 h-10 text-gold-400" />
          </div>

          {/* Animated mail icon */}
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-gold-100 to-gold-200 rounded-full flex items-center justify-center">
              <Mail className="w-12 h-12 text-gold-600" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-bold text-navy-900 mb-2">
            Check Your Email
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-sm mx-auto leading-relaxed">
            We've sent a confirmation link to{' '}
            <span className="font-semibold text-navy-800">{email || 'your email address'}</span>.
            Click the link in the email to activate your account.
          </p>
        </div>

        {/* Card with instructions */}
        <div className="card p-6 md:p-8">
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-6 h-6 bg-navy-800 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-navy-900 text-sm">Open your email inbox</p>
                <p className="text-xs text-slate-500 mt-0.5">Check your inbox (and spam folder just in case)</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-6 h-6 bg-navy-800 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-navy-900 text-sm">Click the confirmation link</p>
                <p className="text-xs text-slate-500 mt-0.5">The link will verify your email address</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-6 h-6 bg-navy-800 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-navy-900 text-sm">Start using your account</p>
                <p className="text-xs text-slate-500 mt-0.5">After confirming, you can sign in to access all features</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-slate-500">Didn't receive the email?</span>
            </div>
          </div>

          {/* Resend section */}
          {resendSuccess ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center">
              <CheckCircle className="w-4 h-4 inline-block mr-1" />
              A new confirmation email has been sent. Please check your inbox.
            </div>
          ) : (
            <div className="space-y-3">
              {resendError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                  {resendError}
                </div>
              )}
              <button
                onClick={handleResend}
                disabled={resending || !email}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {resending ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Resend confirmation email
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Tips box */}
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <strong>Tip:</strong> If you don't see the email within a few minutes, check your spam or junk folder. The email will be from Aizawl Bible College.
          </p>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-navy-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
