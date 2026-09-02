import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Power, User, Filter } from 'lucide-react';
import { getEmployees, registerEmployee, toggleEmployeeStatus } from '../../services/employeeService';
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
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  
  // Selections
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
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
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); addToast('Edit feature coming soon', 'info'); }}><Edit size={16} /></Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={row.status === 'active' ? "text-danger" : "text-success"} 
            onClick={(e) => confirmToggleStatus(e, row)}
            title={row.status === 'active' ? 'Deactivate' : 'Activate'}
          >
            <Power size={16} />
          </Button>
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

      {/* Add Employee Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Employee"
      >
        <form onSubmit={handleAddEmployee} className="add-employee-form">
          <div className="form-row">
            <Input label="First Name" name="firstName" required placeholder="Enter first name" />
            <Input label="Last Name" name="lastName" required placeholder="Enter last name" />
          </div>
          <Input label="Email Address" name="email" type="email" required placeholder="Enter email address" />
          <Input label="Phone Number" name="phone" placeholder="Enter phone number (+91...)" />
          <div className="form-row">
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
          <div className="form-row">
            <Input label="Password" name="password" type="password" placeholder="Default: Freshioz@123" />
          </div>
          <div className="form-actions mt-4">
            <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Register Employee</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;