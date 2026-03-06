'use client';
import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
      setError(''); // Clear any previous errors
    } catch (err: any) {
      setMessage(''); // Clear any previous messages
      setError(err.message || 'Failed to send password reset email. Please try again.');
    }
  };

  return (
    <div className="py-10 px-5">
      <div className="reset-password-container max-w-md mx-auto my-10 p-8 border rounded-xl shadow-lg bg-white">
        {message && <div className="message text-green-600">{message}</div>}
        {error && <div className="error text-red-600">{error}</div>}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="field">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button type="submit" className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded w-full">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
