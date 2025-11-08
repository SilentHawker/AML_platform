
import React, { useState } from 'react';
import type { Employee, NotificationPreference } from '../types';

interface EmployeeFormModalProps {
    employee: Employee | null; // null for new, Employee object for editing
    onSave: (employee: Omit<Employee, 'id'> | Employee) => void;
    onCancel: () => void;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ employee, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: employee?.name || '',
        email: employee?.email || '',
        phone: employee?.phone || '',
        role: employee?.role || '',
        notificationPreferences: employee?.notificationPreferences || [],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (preference: NotificationPreference) => {
        setFormData(prev => {
            const currentPrefs = prev.notificationPreferences;
            if (currentPrefs.includes(preference)) {
                return { ...prev, notificationPreferences: currentPrefs.filter(p => p !== preference) };
            } else {
                return { ...prev, notificationPreferences: [...currentPrefs, preference] };
            }
        });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (employee) {
            onSave({ ...employee, ...formData });
        } else {
            onSave(formData);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" aria-modal="true" onClick={onCancel}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg m-4 animate-fade-in-down" role="dialog" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">{employee ? 'Edit Team Member' : 'Add Team Member'}</h2>
                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-white text-gray-900" />
                        </div>
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-white text-gray-900" />
                        </div>
                         {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-white text-gray-900" />
                        </div>
                         {/* Role */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                            <input type="text" name="role" id="role" placeholder="e.g., Compliance Officer" value={formData.role} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-white text-gray-900" />
                        </div>
                         {/* Notifications */}
                         <fieldset>
                            <legend className="block text-sm font-medium text-gray-700">Notification Preferences</legend>
                            <div className="mt-2 space-y-2">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input id="email-pref" type="checkbox" checked={formData.notificationPreferences.includes('email')} onChange={() => handleCheckboxChange('email')} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="email-pref" className="font-medium text-gray-700">Email</label>
                                        <p className="text-gray-500">Receive notifications via email.</p>
                                    </div>
                                </div>
                                 <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input id="inApp-pref" type="checkbox" checked={formData.notificationPreferences.includes('inApp')} onChange={() => handleCheckboxChange('inApp')} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="inApp-pref" className="font-medium text-gray-700">In-App</label>
                                        <p className="text-gray-500">Receive notifications within the platform.</p>
                                    </div>
                                </div>
                            </div>
                         </fieldset>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeFormModal;
