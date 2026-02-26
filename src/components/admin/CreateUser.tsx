import { poster, putter } from '@/lib/helper';
import React, { useEffect, useState } from 'react';
import { User } from './section/Users';

interface CreateUserProps {
  onSuccess?: (user: any) => void;
  onCancel?: () => void;
  data?: User & any;
  isUpdate?: boolean | Boolean;
}

const CreateUser: React.FC<CreateUserProps> = ({ onSuccess, onCancel, data, isUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editor' as 'admin' | 'editor',
    access: {
      canApprove: false,
      canAddBlog: true,
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'canApprove' || name === 'canAddBlog') {
      setFormData(prev => ({
        ...prev,
        access: {
          ...prev.access,
          [name]: (e.target as HTMLInputElement).checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let result = null;
      if (isUpdate) {
        result = await putter(`/api/users/${data?._id}`, formData);

      } else {

        result = await poster('/api/users', formData);
      }


      setSubmitSuccess(true);
      if (onSuccess) {
        onSuccess(result.data);
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'editor',
        access: {
          canApprove: false,
          canAddBlog: true,
        }
      });

    } catch (error: any) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (data) {
      setFormData(data)
    }
  }, [data])
  return (
    <div className="bg-white p-6 rounded-lg md:px-8">
      <h2 className="text-2xl font-semibold mb-6">{isUpdate ? 'Update Existing User' : 'Create New User'}</h2>

      {submitSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          User created successfully!
        </div>
      )}

      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData?.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter email"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter password"
          />
          {errors?.password && <p className="text-red-500 text-sm mt-1">{errors?.password}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="mb-6">
          <p className="block text-gray-700 font-medium mb-2">Access Permissions</p>
          <div className="flex flex-col space-y-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="canApprove"
                checked={formData.access.canApprove}
                onChange={handleChange}
                className="rounded text-blue-600"
              />
              <span className="ml-2">Can Approve Content</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="canAddBlog"
                checked={formData.access.canAddBlog}
                onChange={handleChange}
                className="rounded text-blue-600"
              />
              <span className="ml-2">Can Add Blogs</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-khabar-500 text-white rounded-md hover:bg-khabar-600 disabled:bg-blue-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;