// import React, { useState } from 'react';
// import { signUpWithEmail } from '../auth/authService';
// import { toast } from 'react-toastify';
// import { FiEye, FiEyeOff } from 'react-icons/fi';

// interface SignupFormProps {
//   onFormSwitch: () => void;
// }

// const SignupForm: React.FC<SignupFormProps> = ({ onFormSwitch }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     phoneNumber: '',
//   });
//   const [error, setError] = useState<string>('');
//   const [loading, setLoading] = useState<boolean>(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.id]: e.target.value });
//   };

//   const handleSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       toast.error('Passwords do not match');
//       return;
//     }
//     setError('');
//     setLoading(true);
//     try {
//       await signUpWithEmail(formData.name, formData.email, formData.password, Number(formData.phoneNumber));
//       setFormData({ name: '', email: '', password: '', confirmPassword: '', phoneNumber: '' });
//       setLoading(false);
//     } catch (error: any) {
//       setLoading(false);
//       setError(error.message);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center px-8 py-12 bg-orange-50 min-h-screen">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-orange-600 mb-2">स्वागत है 🙏</h2>
//           <p className="text-gray-600">Create your account</p>
//         </div>

//         <form onSubmit={handleSignup} className="space-y-6">
//           <div>
//             <label className="block text-gray-700 mb-2" htmlFor="name">Full Name</label>
//             <input
//               id="name"
//               type="text"
//               value={formData.name}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none transition-colors"
//               placeholder="Enter your full name"
//             />
//           </div>
          
//           <div>
//             <label className="block text-gray-700 mb-2" htmlFor="email">Email Address</label>
//             <input
//               id="email"
//               type="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none transition-colors"
//               placeholder="Enter your email"
//             />
//           </div>

//           <div>
//             <label className="block text-gray-700 mb-2" htmlFor="phoneNumber">Phone Number</label>
//             <input
//               id="phoneNumber"
//               type="tel"
//               value={formData.phoneNumber}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none transition-colors"
//               placeholder="Enter your phone number"
//             />
//           </div>

//           <div>
//             <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
//             <div className="relative">
//               <input
//                 id="password"
//                 type={showPassword ? "text" : "password"}
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none transition-colors"
//                 placeholder="Enter your password"
//               />
//               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center hover:text-orange-600 focus:outline-none">
//                 {showPassword ? <FiEyeOff /> : <FiEye />}
//               </button>
//             </div>
//           </div>

//           <div>
//             <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">Confirm Password</label>
//             <div className="relative">
//               <input
//                 id="confirmPassword"
//                 type={showConfirmPassword ? "text" : "password"}
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none transition-colors"
//                 placeholder="Confirm your password"
//               />
//               <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-3 flex items-center hover:text-orange-600 focus:outline-none">
//                 {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
//               </button>
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
//           >
//             {loading ? 'Creating Account...' : 'Create Account'}
//           </button>
//         </form>

//         <p className="text-center mt-8 text-gray-600">
//           Already have an account?{' '}
//           <button onClick={onFormSwitch} className="text-orange-600 hover:text-orange-700 font-medium">
//             Login here
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default SignupForm;









// src/components/SignupForm.tsx

import React, { useState } from 'react';
import { signUpWithEmail } from '../auth/authService';
import { toast } from 'react-toastify';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface SignupFormProps {
  onFormSwitch: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onFormSwitch }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string>(''); // Fixed unused var warning
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signUpWithEmail(formData.name, formData.email, formData.password, Number(formData.phoneNumber));
      setFormData({ name: '', email: '', password: '', confirmPassword: '', phoneNumber: '' });
      setLoading(false);
    } catch (error: unknown) { // ✅ Fixed: unknown instead of any
      setLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center px-8 py-12 bg-orange-50 min-h-screen">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-orange-600 mb-2">स्वागत है 🙏</h2>
          <p className="text-gray-600">Create your account</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="phoneNumber">Phone Number</label>
            <input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="Enter your password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center hover:text-orange-600 focus:outline-none">
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="Confirm your password"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-3 flex items-center hover:text-orange-600 focus:outline-none">
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          Already have an account?{' '}
          <button onClick={onFormSwitch} className="text-orange-600 hover:text-orange-700 font-medium">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
