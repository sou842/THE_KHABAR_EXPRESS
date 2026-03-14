import { poster, putter } from '@/lib/helper';
import React, { useEffect, useState } from 'react';
import { User } from './section/Users';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Shield, 
  Check, 
  X,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  ChevronDown,
  Info
} from 'lucide-react';

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
    username: '',
    profilePhoto: '',
    bannerPhoto: '',
    shortBio: '',
    location: '',
    profession: '',
    expertise: '',
    yearsOfExperience: '',
    longBio: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      website: '',
      instagram: '',
      youtube: '',
      github: ''
    },
    access: {
      canApprove: false,
      canAddBlog: true,
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!isUpdate && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isUpdate && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'canApprove' || name === 'canAddBlog') {
      setFormData(prev => ({
        ...prev,
        access: {
          ...prev.access,
          [name]: (e.target as HTMLInputElement).checked
        }
      }));
    } else if (name.startsWith('social_')) {
      const socialKey = name.replace('social_', '');
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let result = null;
      const { password, ...payloadWithoutPassword } = formData;
      const payload = !password ? payloadWithoutPassword : formData;
      
      const finalPayload = {
        ...payload,
        expertise: typeof payload.expertise === 'string' 
          ? payload.expertise.split(',').map(s => s.trim()).filter(Boolean) 
          : payload.expertise,
        yearsOfExperience: payload.yearsOfExperience ? Number(payload.yearsOfExperience) : undefined
      };
      console.log('Submitting User Update:', finalPayload);

      if (isUpdate) {
        result = await putter(`/api/users/${data?._id}`, finalPayload);
      } else {
        result = await poster('/api/users', finalPayload);
      }

      if (onSuccess) onSuccess(result.data);
    } catch (error: any) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (data) {
      setFormData(prev => ({
        ...prev,
        ...data,
        password: ''
      }))
    }
  }, [data]);

  const inputClasses = (name: string) => `
    w-full px-4 py-2 bg-white border rounded-lg text-sm transition-all outline-none
    ${errors[name] 
      ? 'border-rose-500 ring-4 ring-rose-500/10 text-rose-900 group-hover:border-rose-500' 
      : 'border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 group-hover:border-slate-300 text-slate-900'}
  `;

  return (
    <div className="w-full bg-white p-6 sm:p-8 space-y-8 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        <AnimatePresence mode="wait">
          {submitError && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3"
            >
              <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-rose-900">Form submission failed</p>
                <p className="text-xs text-rose-700">{submitError}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Identity Information */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Account Details</h3>
            <p className="text-xs text-slate-500">Essential information for user identification and login.</p>
            <div className="h-px bg-slate-100 mt-4" />
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClasses('name')}
              placeholder="e.g. Jane Doe"
            />
            {errors.name && <p className="text-[10px] font-medium text-rose-600 ml-1">{errors.name}</p>}
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClasses('email')}
              placeholder="jane@example.com"
            />
            {errors.email && <p className="text-[10px] font-medium text-rose-600 ml-1">{errors.email}</p>}
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Username / Handle</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={inputClasses('username')}
              placeholder="e.g. johndoe"
            />
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">
              {isUpdate ? 'Change Password' : 'Password'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={inputClasses('password')}
              placeholder={isUpdate ? '••••••••' : 'Minimum 6 characters'}
            />
            {isUpdate && !errors.password && <p className="text-[10px] text-slate-400 ml-1">Leave blank to keep existing password.</p>}
            {errors.password && <p className="text-[10px] font-medium text-rose-600 ml-1">{errors.password}</p>}
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">System Role</label>
            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 appearance-none cursor-pointer transition-all"
              >
                <option value="editor">Editor</option>
                <option value="admin">Administrator</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-400 ml-1">Determines administrative access level.</p>
          </div>

          {/* Author Profile */}
          <div className="md:col-span-2 pt-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Author Profile</h3>
            <p className="text-xs text-slate-500">Publicly visible details for the creator's page.</p>
            <div className="h-px bg-slate-100 mt-4" />
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Profile Photo URL</label>
            <input
              type="url"
              name="profilePhoto"
              value={formData.profilePhoto}
              onChange={handleChange}
              className={inputClasses('profilePhoto')}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Banner Photo URL</label>
            <input
              type="url"
              name="bannerPhoto"
              value={formData.bannerPhoto}
              onChange={handleChange}
              className={inputClasses('bannerPhoto')}
              placeholder="https://example.com/banner.jpg"
            />
          </div>

          <div className="space-y-2 group md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Short Bio</label>
            <input
              type="text"
              name="shortBio"
              value={formData.shortBio}
              onChange={handleChange}
              className={inputClasses('shortBio')}
              placeholder="A brief 1-2 line description..."
              maxLength={150}
            />
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Profession / Title</label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              className={inputClasses('profession')}
              placeholder="e.g. Lead Engineer"
            />
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={inputClasses('location')}
              placeholder="e.g. San Francisco, CA"
            />
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Areas of Expertise (Comma separated)</label>
            <input
              type="text"
              name="expertise"
              value={formData.expertise}
              onChange={handleChange}
              className={inputClasses('expertise')}
              placeholder="React, Node.js, Design Systems"
            />
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Years of Experience</label>
            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              className={inputClasses('yearsOfExperience')}
              placeholder="e.g. 5"
              min="0"
            />
          </div>

          <div className="space-y-2 group md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Long Bio</label>
            <textarea
              name="longBio"
              value={formData.longBio}
              onChange={handleChange}
              className={`min-h-[100px] resize-y ${inputClasses('longBio')}`}
              placeholder="Detailed background information..."
              maxLength={1000}
            />
          </div>

          {/* Social Links */}
          <div className="md:col-span-2 pt-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Social Links</h3>
            <p className="text-xs text-slate-500">Connect the creator's social presence.</p>
            <div className="h-px bg-slate-100 mt-4" />
          </div>

          {['twitter', 'linkedin', 'github', 'website', 'instagram', 'youtube'].map((social) => (
            <div key={social} className="space-y-2 group">
              <label className="text-xs font-semibold text-slate-700 ml-0.5 capitalize">{social}</label>
              <input
                type="url"
                name={`social_${social}`}
                value={formData.socialLinks[social as keyof typeof formData.socialLinks]}
                onChange={handleChange}
                className={inputClasses(`social_${social}`)}
                placeholder={`https://${social === 'website' ? 'example.com' : `${social}.com/handle`}`}
              />
            </div>
          ))}

          {/* Permissions Section */}
          <div className="md:col-span-2 pt-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Permissions Matrix</h3>
            <p className="text-xs text-slate-500">Fine-grained control over specific feature access.</p>
            <div className="h-px bg-slate-100 mt-4" />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors group">
              <div className="relative h-5 w-5 mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  name="canAddBlog"
                  checked={formData.access.canAddBlog}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div className="h-full w-full border-2 border-slate-200 rounded-md bg-white peer-checked:bg-slate-900 peer-checked:border-slate-900 transition-all flex items-center justify-center">
                  <Check className="h-3 w-3 text-white scale-0 peer-checked:scale-100 transition-transform duration-200" strokeWidth={4} />
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-900">Manage Content</span>
                <p className="text-[11px] text-slate-500 leading-normal">Allow user to create, edit, and publish blog articles.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors group">
              <div className="relative h-5 w-5 mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  name="canApprove"
                  checked={formData.access.canApprove}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div className="h-full w-full border-2 border-slate-200 rounded-md bg-white peer-checked:bg-slate-900 peer-checked:border-slate-900 transition-all flex items-center justify-center">
                  <Check className="h-3 w-3 text-white scale-0 peer-checked:scale-100 transition-transform duration-200" strokeWidth={4} />
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-900">Approval Access</span>
                <p className="text-[11px] text-slate-500 leading-normal">Permission to moderate and approve submitted content.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Form Footer */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="inline-flex items-center justify-center px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 min-w-[120px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span>{isUpdate ? 'Save Changes' : 'Create User'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;
