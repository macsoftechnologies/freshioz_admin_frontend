import React from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import './Employees.css';

const CreateEmployee = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    addToast('Employee created successfully!', 'success');
    setTimeout(() => {
      navigate('/employees');
    }, 1500);
  };

  return (
    <div className="employees-page">
      <div className="page-header">
        <h2>Add New Employee</h2>
        <Button variant="outline" onClick={() => navigate('/employees')}>Cancel</Button>
      </div>

      <div className="card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <h3 className="form-section-title">Personal Information</h3>
          <div className="grid-2">
            <Input label="First Name" required />
            <Input label="Last Name" required />
            <Input label="Email Address" type="email" required />
            <Input label="Phone Number" required />
          </div>

          <h3 className="form-section-title mt-6">Employment Information</h3>
          <div className="grid-2">
            <Input label="Employee ID" required />
            <Select label="Department" options={[{label: 'IT', value: 'IT'}]} required />
            <Input label="Designation" required />
            <Input label="Joining Date" type="date" required />
            <Select label="Status" options={[{label: 'Active', value: 'Active'}]} required />
          </div>

          <div className="form-actions mt-6">
            <Button type="submit">Save Employee</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployee;