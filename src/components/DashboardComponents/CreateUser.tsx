import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface QuizAttempt {
  quizId: string;
  quizTitle: string;
  attemptDate: string;
  registerDate: string;
  result: number;
  status: string;
}

interface RegisteredQuiz {
  quizId: string;
  quizTitle: string;
  status: string;
  registerDate: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  videoUrl?: string;
  videoUploadedAt?: string;
  videoFileName?: string;
  quizActivity?: {
    attempted: QuizAttempt[];
    registered: RegisteredQuiz[];
  };
}

interface CreateUserProps {
  onUserCreated: (user: User) => void;
  onCancel: () => void;
}

const CreateUser = ({ onUserCreated, onCancel }: CreateUserProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<Omit<User, "id">>({
    name: "",
    email: "",
    phoneNumber: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required!");
      return;
    }

    try {
      setLoading(true);

      // Add user to Firestore
      const docRef = await addDoc(collection(db, 'users'), {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const newUser = {
        id: docRef.id,
        ...formData
      };

      onUserCreated(newUser);
      toast.success("User created successfully!");
      setIsModalOpen(false);
      setFormData({ name: "", email: "", phoneNumber: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-md hover:shadow-lg"
      >
        <Plus size={20} />
        <span>Create User</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-orange-800">Create New User</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  onCancel();
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }} className="space-y-4">
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
                  onClick={() => {
                    setIsModalOpen(false);
                    onCancel();
                  }}
                  className="px-4 py-2 border-2 border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateUser;