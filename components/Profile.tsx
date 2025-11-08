
import React, { useState, useEffect } from 'react';
import type { CompanyProfile, Employee, OnboardingData, BusinessLine } from '../types';
import { getProfile, updateProfile } from '../services/profileService';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';
import { UsersIcon } from './icons/UsersIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';
import { EditIcon } from './icons/EditIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { AtSymbolIcon } from './icons/AtSymbolIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import EmployeeFormModal from './EmployeeFormModal';
import { getOnboardingData } from '../services/onboardingService';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import QuestionnaireDisplay from './QuestionnaireDisplay';
import { ShieldExclamationIcon } from './icons/ShieldExclamationIcon';

const ALL_BUSINESS_LINES: BusinessLine[] = ['MSBs', 'Securities Dealers', 'Financial Entities', 'Casinos'];

interface ProfileProps {
    onStartOnboarding: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onStartOnboarding }) => {
    const { user, impersonatedTenant } = useAuth();
    const [profile, setProfile] = useState<CompanyProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingCompany, setIsEditingCompany] = useState(false);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
    
    // State for the company form
    const [companyFormData, setCompanyFormData] = useState<Partial<CompanyProfile>>({});
    
    const activeTenantId = impersonatedTenant?.tenantId || user?.tenantId;

    const loadProfile = () => {
        if (activeTenantId) {
            const profileData = getProfile(activeTenantId);
            setProfile(profileData || null);
            setCompanyFormData(profileData || {});
            const qData = getOnboardingData(activeTenantId);
            setOnboardingData(qData);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        setIsLoading(true);
        loadProfile();
    }, [activeTenantId]);

    const handleCompanyFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCompanyFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleBusinessLineChange = (line: BusinessLine) => {
        setCompanyFormData(prev => {
            const currentLines = prev.businessLines || [];
            const newLines = currentLines.includes(line)
                ? currentLines.filter(l => l !== line)
                : [...currentLines, line];
            return { ...prev, businessLines: newLines };
        });
    };

    const handleSaveCompany = () => {
        if (!activeTenantId || !profile) return;
        const updated: CompanyProfile = { ...profile, ...companyFormData } as CompanyProfile;
        updateProfile(activeTenantId, updated);
        setProfile(updated);
        setIsEditingCompany(false);
    };

    const handleCancelEditCompany = () => {
        setCompanyFormData(profile || {});
        setIsEditingCompany(false);
    };

    // Employee Handlers
    const handleAddEmployee = () => {
        setEditingEmployee(null);
        setIsEmployeeModalOpen(true);
    };

    const handleEditEmployee = (employee: Employee) => {
        setEditingEmployee(employee);
        setIsEmployeeModalOpen(true);
    };
    
    const handleDeleteEmployee = (employeeId: string) => {
        if (!activeTenantId || !profile) return;
        if (window.confirm("Are you sure you want to remove this team member?")) {
            const updatedEmployees = profile.employees.filter(emp => emp.id !== employeeId);
            const updatedProfile = { ...profile, employees: updatedEmployees };
            updateProfile(activeTenantId, updatedProfile);
            setProfile(updatedProfile);
        }
    };
    
    const handleSaveEmployee = (employee: Omit<Employee, 'id'> | Employee) => {
        if (!activeTenantId || !profile) return;

        let updatedEmployees: Employee[];
        if ('id' in employee) { // Editing existing
            updatedEmployees = profile.employees.map(emp => emp.id === employee.id ? employee : emp);
        } else { // Adding new
            const newEmployee: Employee = { ...employee, id: `emp-${Date.now()}` };
            updatedEmployees = [...profile.employees, newEmployee];
        }

        const updatedProfile = { ...profile, employees: updatedEmployees };
        updateProfile(activeTenantId, updatedProfile);
        setProfile(updatedProfile);
        setIsEmployeeModalOpen(false);
    };

    if (isLoading) {
        return <div className="text-center p-8"><Spinner /></div>;
    }
    
    if (!profile) {
        return <div className="text-center p-8 bg-white rounded-lg shadow-md border">Could not find company profile.</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Company Details Card */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between mb-4 border-b pb-3">
                    <div className="flex items-center space-x-3">
                        <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Company Details</h2>
                    </div>
                    {!isEditingCompany && (
                        <button onClick={() => setIsEditingCompany(true)} className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                            <EditIcon className="h-4 w-4 mr-2" />
                            Edit
                        </button>
                    )}
                </div>
                {/* Form / Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Legal Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Legal Name</label>
                        {isEditingCompany ? (
                            <input type="text" name="legalName" value={companyFormData.legalName || ''} onChange={handleCompanyFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-white text-gray-900" />
                        ) : (
                            <p className="text-gray-800 font-semibold mt-1">{profile.legalName}</p>
                        )}
                    </div>
                     {/* Operating Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Operating Name</label>
                         {isEditingCompany ? (
                            <input type="text" name="operatingName" value={companyFormData.operatingName || ''} onChange={handleCompanyFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-white text-gray-900" />
                        ) : (
                            <p className="text-gray-800 mt-1">{profile.operatingName || <span className="text-gray-400">N/A</span>}</p>
                        )}
                    </div>
                    {/* FINTRAC Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500">FINTRAC Registration #</label>
                        {isEditingCompany ? (
                             <input type="text" name="fintracRegNumber" value={companyFormData.fintracRegNumber || ''} onChange={handleCompanyFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-white text-gray-900" />
                        ) : (
                             <p className="text-gray-800 mt-1">{profile.fintracRegNumber}</p>
                        )}
                    </div>
                    {/* Business Lines */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Business Lines</label>
                        {isEditingCompany ? (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {ALL_BUSINESS_LINES.map(line => (
                                    <div key={line} className="flex items-center">
                                        <input
                                            id={`bl-${line}`}
                                            type="checkbox"
                                            checked={(companyFormData.businessLines || []).includes(line)}
                                            onChange={() => handleBusinessLineChange(line)}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor={`bl-${line}`} className="ml-2 text-sm text-gray-700">{line}</label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-1 flex flex-wrap gap-2">
                                {(profile.businessLines || []).length > 0 ? profile.businessLines.map(line => (
                                    <span key={line} className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">{line}</span>
                                )) : <span className="text-gray-400">N/A</span>}
                            </div>
                        )}
                    </div>
                    {/* Business Address */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500">Business Address</label>
                        {isEditingCompany ? (
                            <textarea name="businessAddress" rows={3} value={companyFormData.businessAddress || ''} onChange={handleCompanyFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-white text-gray-900" />
                        ) : (
                            <p className="text-gray-800 mt-1 whitespace-pre-line">{profile.businessAddress || <span className="text-gray-400">Not provided</span>}</p>
                        )}
                    </div>
                </div>

                {isEditingCompany && (
                    <div className="mt-6 flex justify-end space-x-3">
                        <button onClick={handleCancelEditCompany} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                        <button onClick={handleSaveCompany} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Save Changes</button>
                    </div>
                )}
            </div>

            {/* Team Members Card */}
             <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between mb-4 border-b pb-3">
                    <div className="flex items-center space-x-3">
                        <UsersIcon className="h-6 w-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Team Members</h2>
                    </div>
                    <button onClick={handleAddEmployee} className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Member
                    </button>
                </div>
                <div className="space-y-4">
                    {profile.employees.map(emp => (
                        <div key={emp.id} className="p-4 border rounded-md flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800">{emp.name} <span className="ml-2 text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{emp.role}</span></h3>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                    <span className="flex items-center"><AtSymbolIcon className="h-4 w-4 mr-1.5 text-gray-400" /> {emp.email}</span>
                                    {emp.phone && <span className="flex items-center"><PhoneIcon className="h-4 w-4 mr-1.5 text-gray-400" /> {emp.phone}</span>}
                                </div>
                                <div className="mt-2 text-xs">
                                    <span className="font-semibold">Notifications: </span>
                                    {emp.notificationPreferences.map(pref => (
                                        <span key={pref} className="ml-1.5 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md">{pref === 'inApp' ? 'In-App' : 'Email'}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleEditEmployee(emp)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-200"><EditIcon className="h-5 w-5"/></button>
                                <button onClick={() => handleDeleteEmployee(emp.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-200"><TrashIcon className="h-5 w-5"/></button>
                            </div>
                        </div>
                    ))}
                    {profile.employees.length === 0 && <p className="text-center text-gray-500 py-4">No team members added yet.</p>}
                </div>
            </div>

            {/* Questionnaire Card */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between mb-4 border-b pb-3">
                    <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Onboarding Questionnaire</h2>
                    </div>
                    {onboardingData && (
                        <button onClick={onStartOnboarding} className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                            <EditIcon className="h-4 w-4 mr-2" />
                            Edit
                        </button>
                    )}
                </div>
                {onboardingData ? (
                    <QuestionnaireDisplay data={onboardingData} />
                ) : (
                     <div className="text-center py-8">
                        <ShieldExclamationIcon className="h-12 w-12 text-yellow-500 mx-auto" />
                        <p className="mt-4 text-gray-600 font-semibold">Questionnaire Not Completed</p>
                        <p className="text-sm text-gray-500 mt-1">This client's profile is incomplete. Please complete the onboarding questionnaire.</p>
                        <button 
                            onClick={onStartOnboarding} 
                            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Complete Questionnaire Now
                        </button>
                    </div>
                )}
            </div>
            
            {isEmployeeModalOpen && (
                <EmployeeFormModal
                    employee={editingEmployee}
                    onSave={handleSaveEmployee}
                    onCancel={() => setIsEmployeeModalOpen(false)}
                />
            )}
        </div>
    );
};
export default Profile;
