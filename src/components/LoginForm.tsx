import React, { useState } from 'react';
import { loginWithEmail } from '../auth/authService';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface LoginFormProps {
  onFormSwitch: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onFormSwitch }) => {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  // const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const userCredential = await loginWithEmail(email, password);
      
  //     if (userCredential) {
  //       // Get the ID token
  //       // const token = await userCredential.user.getIdToken();
  //       // const uid = userCredential.user.uid;  // Get the user UID
        
  //       // Fetch the user's role using the UID
  //       // const role = await fetchUserRole(uid);

  //       toast.success('Login successful!');
        
  //       // Force a router refresh to update the authentication state
  //       router.refresh();
        
  //       // Navigate to dashboard
  //       router.push('/dashboard');
  //     }
  //   } catch (error: any) {
  //     console.error('Login failed:', error);
  //     toast.error(error.message || 'Failed to login');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Function to fetch the user's role from your API using UID
  // const fetchUserRole = async (uid: string): Promise<string> => {
  //   try {
  //     const response = await fetch(`https://hindutva-backend-jwh8.onrender.com/users/${uid}`);
  //     const data = await response.json();

  //     if (data && data.role) {
  //       return data.role; // Assuming the response contains the 'role'
  //     } else {
  //       throw new Error('User role not found');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching user role:', error);
  //     throw new Error('Failed to fetch user role');
  //   }
  // };


  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const userCredential = await loginWithEmail(email, password);
    
    if (userCredential) {
      toast.success('Login successful!');
      router.refresh();
      router.push('/dashboard');
    }
  } catch (error: unknown) { // ✅ Fixed: unknown instead of any
    console.error('Login failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to login';
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex items-center justify-center px-8 py-12 bg-orange-50 min-h-screen">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-orange-600 mb-2">नमस्ते 🙏</h2>
          <p className="text-gray-600">Welcome back</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-600 focus:outline-none"
              >
                {showPassword ?  <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                Logging in...
              </div>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          Don&apos;t have an account?{' '}
          <button
            onClick={onFormSwitch}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
