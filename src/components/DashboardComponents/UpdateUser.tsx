import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
}

interface UpdateUserProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

const UpdateUser: React.FC<UpdateUserProps> = ({ user, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState<User>(user || { id: '', name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData(user || { id: '', name: '', email: '' });
    setHasChanges(false);
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    setLoading(true);
    try {
      // Update user in Firestore
      const userRef = doc(db, 'users', formData.id);
      await updateDoc(userRef, {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        updatedAt: new Date()
      });

      onUpdate(formData);
      onClose();
      toast.success("User updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-orange-800">Update User</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-orange-800 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-orange-800 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-orange-800 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={handleInputChange}
              className="w-full p-2 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !hasChanges}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdateUser;
