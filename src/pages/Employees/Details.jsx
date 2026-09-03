import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import StatusBadge from '../../components/common/StatusBadge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { User, ArrowLeft, Filter, Edit, Trash2 } from 'lucide-react';
import { toggleEmployeeStatus, updateEmployee, deleteEmployee } from '../../services/employeeService';
import { getRoles } from '../../services/roleService';
import { getEmployeeOnboardings } from '../../services/onboardingService';
import './Details.css';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  
  const [employee, setEmployee] = useState(location.state?.employee || null);
  const [onboardings, setOnboardings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [roles, setRoles] = useState([]);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Edit form
  const [editForm, setEditForm] = useState({
    employeeName: '',
    email: '',
    mobileNumber: '',
    designation: '',
    roleId: '',
  });

  // If there's no state (e.g. user refreshed the page), we should ideally fetch the single employee by ID.
  // For now we'll handle the case where it exists.
  useEffect(() => {
    if (!employee) {
      addToast('Employee data not found. Please select from the list.', 'error');
      navigate('/employees');
    }
  }, [employee, navigate, addToast]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(Array.isArray(data) ? data : []);
      } catch (err) {
        // silently fail
      }
    };
    fetchRoles();
  }, []);

  const fetchOnboardings = async (overrides = {}) => {
    if (!employee) return;
    setLoading(true);
    try {
      const data = await getEmployeeOnboardings(id, { 
        startDate: overrides.startDate !== undefined ? overrides.startDate : startDate, 
        endDate: overrides.endDate !== undefined ? overrides.endDate : endDate 
      });
      setOnboardings(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast('Failed to load onboarding records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboardings();
  }, [id]);

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    fetchOnboardings({ startDate: '', endDate: '' });
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = employee.status === 'active' ? 'inactive' : 'active';
      await toggleEmployeeStatus(id, newStatus);
      setEmployee({ ...employee, status: newStatus });
      addToast(`Employee status updated to ${newStatus}`, 'success');
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  const openEditModal = () => {
    setEditForm({
      employeeName: employee.employeeName || '',
      email: employee.email || '',
      mobileNumber: employee.mobileNumber || '',
      designation: employee.designation || '',
      roleId: employee.roleId || '',
    });
    setEditModalOpen(true);
  };

  const handleEditEmployee = async (e) => {
    e.preventDefault();
    try {
      await updateEmployee(id, editForm);
      setEmployee({ ...employee, ...editForm });
      setEditModalOpen(false);
      addToast('Employee updated successfully', 'success');
    } catch (error) {
      addToast('Failed to update employee', 'error');
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      await deleteEmployee(id);
      setDeleteModalOpen(false);
      addToast('Employee deleted successfully', 'success');
      navigate('/employees');
    } catch (error) {
      addToast('Failed to delete employee', 'error');
    }
  };

  if (!employee) return null;

  const columns = [
    { header: 'Community Name', accessor: 'communityName' },
    { header: 'Type', accessor: 'type', render: (row) => <span className="type-badge">{row.type}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Date', accessor: 'createdAt', render: (row) => <span>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}</span> },
  ];

  return (
    <div className="employee-details-page">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/employees')}><ArrowLeft size={20} /></Button>
          <h2>Employee Profile</h2>
        </div>
      </div>

      <div className="profile-card mt-6">
        <div className="profile-header-large">
          <div className="profile-header-left">
            <div className="profile-avatar-large">
              {employee.employeeName ? employee.employeeName.charAt(0) : <User size={40} />}
            </div>
            <div className="profile-title-block-large">
              <h3>{employee.employeeName}</h3>
              <p>{employee.designation || 'No Designation'}</p>
              <StatusBadge status={employee.status} />
            </div>
          </div>
          <div className="profile-actions-group">
             <Button variant="outline" size="sm" onClick={openEditModal} icon={<Edit size={16} />}>Edit</Button>
             <Button variant="light-danger" size="sm" onClick={() => setDeleteModalOpen(true)} icon={<Trash2 size={16} />}>Delete</Button>
             <Button 
                variant={employee.status === 'active' ? "danger" : "primary"} 
                onClick={handleToggleStatus}
              >
                {employee.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
              </Button>
          </div>
        </div>
        
        <div className="profile-grid-large">
          <div className="profile-item-large">
            <span className="profile-label-large">Employee ID</span>
            <span className="profile-value-large">{employee.employeeId || id}</span>
          </div>
          <div className="profile-item-large">
            <span className="profile-label-large">System Role</span>
            <span className="profile-value-large capitalize">{employee.role?.replace('_', ' ')}</span>
          </div>
          <div className="profile-item-large">
            <span className="profile-label-large">Email Address</span>
            <span className="profile-value-large">{employee.email}</span>
          </div>
          <div className="profile-item-large">
            <span className="profile-label-large">Mobile Number</span>
            <span className="profile-value-large">{employee.mobileNumber || '-'}</span>
          </div>
          <div className="profile-item-large">
            <span className="profile-label-large">Joining Date</span>
            <span className="profile-value-large">{employee.joiningDate || (employee.createdAt && new Date(employee.createdAt).toLocaleDateString()) || '-'}</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="section-header">
          <h3>Onboarding Submissions</h3>
          <div className="date-filters">
            <div className="date-input-wrap">
              <label>Start Date</label>
              <input type="date" className="date-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="date-input-wrap">
              <label>End Date</label>
              <input type="date" className="date-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button variant="primary" onClick={() => fetchOnboardings()} icon={<Filter size={16} />}>Filter</Button>
            <Button variant="light-danger" onClick={handleClear}>Clear</Button>
          </div>
        </div>
        
        <div className="card">
          <Table 
            columns={columns} 
            data={onboardings} 
            emptyState={loading ? "Loading records..." : "No onboarding records found for this employee in the selected date range."}
          />
        </div>
      </div>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Employee"
      >
        <form onSubmit={handleEditEmployee} className="add-employee-form" autoComplete="off">
          <Input 
            label="Full Name" 
            required 
            placeholder="Enter full name" 
            value={editForm.employeeName} 
            onChange={(e) => setEditForm({...editForm, employeeName: e.target.value})} 
          />
          <Input 
            label="Email Address" 
            type="email" 
            required 
            placeholder="Enter email address" 
            value={editForm.email} 
            onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
            autoComplete="new-password"
          />
          <Input 
            label="Phone Number" 
            placeholder="Enter phone number" 
            value={editForm.mobileNumber} 
            onChange={(e) => setEditForm({...editForm, mobileNumber: e.target.value})} 
          />
          <div className="form-row">
            <Input 
              label="Designation" 
              required 
              placeholder="e.g. Sales Executive" 
              value={editForm.designation} 
              onChange={(e) => setEditForm({...editForm, designation: e.target.value})} 
            />
            <div className="input-group">
              <label className="input-label">System Role</label>
              <select 
                required 
                className="select-input" 
                value={editForm.roleId} 
                onChange={(e) => setEditForm({...editForm, roleId: e.target.value})}
              >
                <option value="">Select Role</option>
                {roles.map(r => (
                  <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions mt-4">
            <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Update Employee</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Employee"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteEmployee}>Delete</Button>
          </>
        }
      >
        <p>Are you sure you want to permanently delete <strong>{employee.employeeName}</strong>?</p>
        <p className="status-warning">This action cannot be undone.</p>
      </Modal>

    </div>
  );
};

export default EmployeeDetails;