import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Power, Trash2, Filter } from 'lucide-react';
import { getEmployees, registerEmployee, toggleEmployeeStatus, updateEmployee, deleteEmployee } from '../../services/employeeService';
import { getRoles } from '../../services/roleService';
import './Employees.css';

const Employees = () => {
  const { addToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Selections
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    employeeName: '',
    email: '',
    mobileNumber: '',
    designation: '',
    roleId: '',
  });
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchEmployees = async (overrides = {}) => {
    setLoading(true);
    try {
      const data = await getEmployees({ 
        search: overrides.search !== undefined ? overrides.search : search, 
        role: overrides.role !== undefined ? overrides.role : roleFilter 
      });
      // The API response might be an array or wrapped in an object. Assuming array based on doc:
      setEmployees(Array.isArray(data) ? data : (data.users || []));
    } catch (err) {
      addToast('Failed to load employees', 'error');
      // For fallback during dev if API fails
      if(employees.length === 0) setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast('Failed to load roles', 'error');
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchEmployees();
  }, []);

  const handleClear = () => {
    setSearch('');
    setRoleFilter('');
    fetchEmployees({ search: '', role: '' });
  };

  const confirmToggleStatus = (e, employee) => {
    e.stopPropagation();
    setSelectedEmployee(employee);
    setStatusModalOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedEmployee) return;
    try {
      const newStatus = selectedEmployee.status === 'active' ? 'inactive' : 'active';
      const empId = selectedEmployee.employeeId || selectedEmployee.userId;
      
      await toggleEmployeeStatus(empId, newStatus);
      
      setStatusModalOpen(false);
      addToast(`Employee status updated to ${newStatus}`, 'success');
      fetchEmployees();
    } catch (error) {
      addToast('Failed to update employee status', 'error');
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      employeeName: formData.get('firstName') + ' ' + formData.get('lastName'),
      email: formData.get('email'),
      mobileNumber: formData.get('phone'),
      roleId: formData.get('roleId'),
      designation: formData.get('designation'),
      password: formData.get('password') || 'Freshioz@123',
    };

    try {
      await registerEmployee(payload);
      setAddModalOpen(false);
      addToast('Employee registered successfully', 'success');
      fetchEmployees();
    } catch (error) {
      addToast('Failed to register employee', 'error');
    }
  };

  const openEditModal = (e, employee) => {
    e.stopPropagation();
    setSelectedEmployee(employee);
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
    if (!selectedEmployee) return;
    const empId = selectedEmployee.employeeId || selectedEmployee.userId || selectedEmployee.id;
    try {
      await updateEmployee(empId, editForm);
      setEditModalOpen(false);
      addToast('Employee updated successfully', 'success');
      fetchEmployees();
    } catch (error) {
      addToast('Failed to update employee', 'error');
    }
  };

  const confirmDelete = (e, employee) => {
    e.stopPropagation();
    setSelectedEmployee(employee);
    setDeleteModalOpen(true);
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    const empId = selectedEmployee.employeeId || selectedEmployee.userId || selectedEmployee.id;
    try {
      await deleteEmployee(empId);
      setDeleteModalOpen(false);
      addToast('Employee deleted successfully', 'success');
      fetchEmployees();
    } catch (error) {
      addToast('Failed to delete employee', 'error');
    }
  };

  const handleRowClick = (employee) => {
    navigate(`/employees/${employee.employeeId || employee.userId || employee.id}`, { state: { employee } });
  };

  const columns = [
    { header: 'ID', accessor: 'employeeId' },
    { header: 'Name', accessor: 'employeeName' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role', render: (row) => <span className="capitalize">{row.role ? row.role.replace('_', ' ') : '-'}</span> },
    { header: 'Designation', accessor: 'designation' },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Actions', 
      accessor: 'actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={(e) => openEditModal(e, row)} title="Edit"><Edit size={16} /></Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={row.status === 'active' ? "text-danger" : "text-success"} 
            onClick={(e) => confirmToggleStatus(e, row)}
            title={row.status === 'active' ? 'Deactivate' : 'Activate'}
          >
            <Power size={16} />
          </Button>
          <Button variant="ghost" size="sm" className="text-danger" onClick={(e) => confirmDelete(e, row)} title="Delete"><Trash2 size={16} /></Button>
        </div>
      )
    }
  ];

  return (
    <div className="employees-page">
      <div className="page-header">
        <h2>Employees</h2>
        <Button onClick={() => setAddModalOpen(true)} icon={<Plus size={16} />}>
          Add Employee
        </Button>
      </div>

      <div className="filters-bar">
        <div className="search-wrap">
          <Input 
            placeholder="Search employees..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-wrap">
          <Select 
            options={[
              {label: 'All Roles', value: ''},
              ...roles.map(r => ({ label: r.roleName, value: r.roleCode }))
            ]} 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          />
          <Button variant="primary" onClick={() => fetchEmployees()} icon={<Filter size={16} />}>Filter</Button>
          <Button variant="light-danger" onClick={handleClear}>Clear</Button>
        </div>
      </div>

      <div className="card">
        <Table 
          columns={columns} 
          data={employees} 
          onRowClick={handleRowClick}
          emptyState={loading ? "Loading employees..." : "No employees found"}
        />
      </div>

      {/* Profile Modal Removed - Now a dedicated page */}

      {/* Status Toggle Modal */}
      <Modal 
        isOpen={statusModalOpen} 
        onClose={() => setStatusModalOpen(false)}
        title="Confirm Status Change"
        footer={
          <>
            <Button variant="ghost" onClick={() => setStatusModalOpen(false)}>Cancel</Button>
            <Button 
              variant={selectedEmployee?.status === 'active' ? "danger" : "primary"} 
              onClick={handleToggleStatus}
            >
              {selectedEmployee?.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to <strong>{selectedEmployee?.status === 'active' ? 'deactivate' : 'activate'}</strong> the account for <strong>{selectedEmployee?.employeeName}</strong>?</p>
        {selectedEmployee?.status === 'active' && <p className="status-warning">They will lose access to the system until reactivated.</p>}
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
        <p>Are you sure you want to permanently delete <strong>{selectedEmployee?.employeeName}</strong>?</p>
        <p className="status-warning">This action cannot be undone.</p>
      </Modal>

      {/* Add Employee Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Employee"
      >
        <form onSubmit={handleAddEmployee} className="add-employee-form" autoComplete="off">
          <div className="form-row">
            <Input label="First Name" name="firstName" required placeholder="Enter first name" />
            <Input label="Last Name" name="lastName" required placeholder="Enter last name" />
          </div>
          <div className="form-row mt-3">
            <Input label="Email Address" name="email" type="email" required placeholder="Enter email address" autoComplete="new-password" />
            <Input label="Phone Number" name="phone" placeholder="Enter phone number" />
          </div>
          <div className="form-row mt-3">
            <Input label="Designation" name="designation" required placeholder="e.g. Sales Executive" />
            <div className="input-group">
              <label className="input-label">System Role</label>
              <select name="roleId" required className="select-input">
                <option value="">Select Role</option>
                {roles.map(r => (
                  <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row mt-3">
            <Input label="Password" name="password" type="password" placeholder="Default: Freshioz@123" autoComplete="new-password" />
          </div>
          <div className="form-actions mt-4">
            <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Register Employee</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Employee"
      >
        <form onSubmit={handleEditEmployee} className="add-employee-form" autoComplete="off">
          <div className="form-row">
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
          </div>
          <div className="form-row mt-3">
            <Input 
              label="Phone Number" 
              placeholder="Enter phone number" 
              value={editForm.mobileNumber} 
              onChange={(e) => setEditForm({...editForm, mobileNumber: e.target.value})} 
            />
            <Input 
              label="Designation" 
              required 
              placeholder="e.g. Sales Executive" 
              value={editForm.designation} 
              onChange={(e) => setEditForm({...editForm, designation: e.target.value})} 
            />
          </div>
          <div className="form-row mt-3">
            <div className="input-group" style={{ width: '100%' }}>
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
    </div>
  );
};

export default Employees;