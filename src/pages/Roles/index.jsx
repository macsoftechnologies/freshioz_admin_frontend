import React, { useState, useEffect } from 'react';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Power } from 'lucide-react';
import { getRoles } from '../../services/roleService';
import api from '../../services/api';
import './Roles.css';

const Roles = () => {
  const { addToast } = useToast();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  
  const [selectedRole, setSelectedRole] = useState(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast('Failed to load roles', 'error');
      if(roles.length === 0) setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const confirmToggleStatus = (e, role) => {
    e.stopPropagation();
    setSelectedRole(role);
    setStatusModalOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedRole) return;
    try {
      const newStatus = selectedRole.status === 'active' ? 'inactive' : 'active';
      await api.patch(`/roles/${selectedRole.roleId || selectedRole.id || selectedRole._id}/status`, { status: newStatus });
      
      setStatusModalOpen(false);
      addToast(`Role status updated to ${newStatus}`, 'success');
      fetchRoles();
    } catch (error) {
      addToast('Failed to update role status', 'error');
    }
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      roleName: formData.get('roleName'),
      roleCode: formData.get('roleCode'),
      description: formData.get('description')
    };

    try {
      await api.post('/roles', payload);
      setAddModalOpen(false);
      addToast('Role created successfully', 'success');
      fetchRoles();
    } catch (error) {
      addToast('Failed to create role', 'error');
    }
  };

  const handleEditRole = async (e) => {
    e.preventDefault();
    if (!selectedRole) return;
    const formData = new FormData(e.target);
    const payload = {
      roleName: formData.get('roleName'),
      description: formData.get('description')
    };

    try {
      await api.put(`/roles/${selectedRole.roleId || selectedRole.id || selectedRole._id}`, payload);
      setEditModalOpen(false);
      addToast('Role updated successfully', 'success');
      fetchRoles();
    } catch (error) {
      addToast('Failed to update role', 'error');
    }
  };

  const openEditModal = (e, role) => {
    e.stopPropagation();
    setSelectedRole(role);
    setEditModalOpen(true);
  };

  const columns = [
    { header: 'Role ID', accessor: 'roleId' },
    { header: 'Role Name', accessor: 'roleName' },
    { header: 'Role Code', accessor: 'roleCode' },
    { header: 'Description', accessor: 'description' },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Actions', 
      accessor: 'actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={(e) => openEditModal(e, row)}><Edit size={16} /></Button>
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
    <div className="roles-page">
      <div className="page-header">
        <h2>Roles & Permissions</h2>
        <Button onClick={() => setAddModalOpen(true)} icon={<Plus size={16} />}>
          Create Role
        </Button>
      </div>

      <div className="card mt-6">
        <Table 
          columns={columns} 
          data={roles} 
          emptyState={loading ? "Loading roles..." : "No roles found"}
        />
      </div>

      {/* Status Toggle Modal */}
      <Modal 
        isOpen={statusModalOpen} 
        onClose={() => setStatusModalOpen(false)}
        title="Confirm Status Change"
        footer={
          <>
            <Button variant="ghost" onClick={() => setStatusModalOpen(false)}>Cancel</Button>
            <Button 
              variant={selectedRole?.status === 'active' ? "danger" : "primary"} 
              onClick={handleToggleStatus}
            >
              {selectedRole?.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to <strong>{selectedRole?.status === 'active' ? 'deactivate' : 'activate'}</strong> the role <strong>{selectedRole?.roleName}</strong>?</p>
      </Modal>

      {/* Add Role Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Create Master Role"
      >
        <form onSubmit={handleAddRole} className="add-role-form">
          <div className="form-group-col">
            <Input label="Role Name" name="roleName" required placeholder="e.g. Quality Audit Manager" />
            <Input label="Role Code" name="roleCode" required placeholder="e.g. quality_manager" />
            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea name="description" className="textarea-input" placeholder="Role responsibilities..." rows="3"></textarea>
            </div>
          </div>
          <div className="form-actions mt-6">
            <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Role</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Role"
      >
        {selectedRole && (
          <form onSubmit={handleEditRole} className="add-role-form">
            <div className="form-group-col">
              <Input label="Role Name" name="roleName" required defaultValue={selectedRole.roleName} />
              <Input label="Role Code" name="roleCode" defaultValue={selectedRole.roleCode} readOnly disabled />
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea name="description" className="textarea-input" defaultValue={selectedRole.description} rows="3"></textarea>
              </div>
            </div>
            <div className="form-actions mt-6">
              <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Roles;
