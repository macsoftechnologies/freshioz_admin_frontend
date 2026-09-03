import React, { useState, useEffect } from 'react';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ImageUpload from '../../components/common/ImageUpload';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, CheckCircle, XCircle, Filter, Trash2 } from 'lucide-react';
import { getOnboardings, addOnboarding, updateOnboarding, updateOnboardingStatus, deleteOnboarding } from '../../services/onboardingService';
import { getUser } from '../../services/authService';
import { API_BASE_URL } from '../../services/api';
import './Onboarding.css';

const Onboarding = () => {
  const { addToast } = useToast();
  const user = getUser();
  const isAdmin = user?.role === 'admin' || user?.role?.toLowerCase().includes('admin');
  const isSalesPerson = user?.role === 'sales_person' || user?.role?.toLowerCase().includes('sales');
  const [onboardings, setOnboardings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  const [onboardingType, setOnboardingType] = useState('APARTMENT');
  
  // Edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Image upload
  const [photos, setPhotos] = useState([]);

  const fetchOnboardings = async (overrides = {}) => {
    setLoading(true);
    try {
      const data = await getOnboardings({ 
        search: overrides.search !== undefined ? overrides.search : search, 
        status: overrides.status !== undefined ? overrides.status : statusFilter, 
        type: overrides.type !== undefined ? overrides.type : typeFilter 
      });
      setOnboardings(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast('Failed to load onboarding requests', 'error');
      if(onboardings.length === 0) setOnboardings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboardings();
  }, []);

  const handleClear = () => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
    fetchOnboardings({ search: '', status: '', type: '' });
  };

  const handleRowClick = (onboarding) => {
    setSelectedOnboarding(onboarding);
    setDetailsModalOpen(true);
  };

  // Permission check for edit/delete
  const canEditDelete = (onboarding) => {
    if (isAdmin) return true;
    if (isSalesPerson && onboarding?.status === 'pending') return true;
    return false;
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setOnboardingType('APARTMENT');
    setPhotos([]);
    setEditForm({});
    setAddModalOpen(true);
  };

  const openEditModal = () => {
    if (!selectedOnboarding) return;
    setIsEditMode(true);
    setOnboardingType(selectedOnboarding.type || 'APARTMENT');
    setEditForm({
      communityName: selectedOnboarding.communityName || '',
      fullAddress: selectedOnboarding.fullAddress || '',
      contactPersonName: selectedOnboarding.contactPersonName || '',
      contactPhone: selectedOnboarding.contactPhone || '',
      flatsCount: selectedOnboarding.flatsCount || '',
      residentsCount: selectedOnboarding.residentsCount || '',
      latitude: selectedOnboarding.latitude || '',
      longitude: selectedOnboarding.longitude || '',
    });
    // Load existing images as previews
    const existingImages = Array.isArray(selectedOnboarding.images) 
      ? selectedOnboarding.images 
      : selectedOnboarding.image 
        ? [selectedOnboarding.image] 
        : [];
    setPhotos(existingImages.filter(Boolean).map(url => ({
      file: null, // null means it's an existing server image, not a new upload
      preview: resolveImageUrl(url),
      existingUrl: url,
    })));
    setDetailsModalOpen(false);
    setAddModalOpen(true);
  };

  const buildFormData = (fields) => {
    const formData = new FormData();
    formData.append('communityName', fields.communityName);
    formData.append('type', fields.type);
    formData.append('fullAddress', fields.fullAddress);
    formData.append('contactPersonName', fields.contactPersonName);
    formData.append('contactPhone', fields.contactPhone);
    formData.append('latitude', Number(fields.latitude));
    formData.append('longitude', Number(fields.longitude));
    if (fields.flatsCount) formData.append('flatsCount', Number(fields.flatsCount));
    if (fields.residentsCount) formData.append('residentsCount', Number(fields.residentsCount));
    
    // Only append new photo files (not existing server images)
    photos.forEach((photo) => {
      if (photo.file) {
        formData.append('images', photo.file);
      }
    });
    
    return formData;
  };

  const handleAddOnboarding = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const fields = {
      communityName: form.get('communityName'),
      type: form.get('type'),
      fullAddress: form.get('fullAddress'),
      contactPersonName: form.get('contactPersonName'),
      contactPhone: form.get('contactPhone'),
      latitude: form.get('latitude'),
      longitude: form.get('longitude'),
      flatsCount: form.get('flatsCount'),
      residentsCount: form.get('residentsCount'),
    };

    // Always send as FormData (API expects form-data)
    const payload = buildFormData(fields);

    try {
      if (isEditMode && selectedOnboarding) {
        const onbId = selectedOnboarding.onboardingId || selectedOnboarding.id || selectedOnboarding._id;
        await updateOnboarding(onbId, payload);
        addToast('Onboarding updated successfully', 'success');
      } else {
        await addOnboarding(payload);
        addToast('Onboarding request created successfully', 'success');
      }
      setAddModalOpen(false);
      setIsEditMode(false);
      setPhotos([]);
      fetchOnboardings();
    } catch (error) {
      addToast(isEditMode ? 'Failed to update onboarding' : 'Failed to create onboarding request', 'error');
    }
  };

  const handleStatusChange = async (status, rejectionReason = '') => {
    if (!selectedOnboarding) return;
    try {
      await updateOnboardingStatus(selectedOnboarding.onboardingId || selectedOnboarding.id || selectedOnboarding._id, status, rejectionReason);
      setDetailsModalOpen(false);
      setRejectModalOpen(false);
      setApproveModalOpen(false);
      setRejectionReason('');
      addToast(`Onboarding ${status} successfully`, 'success');
      fetchOnboardings();
    } catch (error) {
      addToast(`Failed to ${status} onboarding`, 'error');
    }
  };

  const handleDeleteOnboarding = async () => {
    if (!selectedOnboarding) return;
    try {
      const onbId = selectedOnboarding.onboardingId || selectedOnboarding.id || selectedOnboarding._id;
      await deleteOnboarding(onbId);
      setDeleteModalOpen(false);
      setDetailsModalOpen(false);
      addToast('Onboarding deleted successfully', 'success');
      fetchOnboardings();
    } catch (error) {
      addToast('Failed to delete onboarding', 'error');
    }
  };

  const handleTableEdit = (e, row) => {
    e.stopPropagation();
    setSelectedOnboarding(row);
    setIsEditMode(true);
    setOnboardingType(row.type || 'APARTMENT');
    setEditForm({
      communityName: row.communityName || '',
      fullAddress: row.fullAddress || '',
      contactPersonName: row.contactPersonName || '',
      contactPhone: row.contactPhone || '',
      flatsCount: row.flatsCount || '',
      residentsCount: row.residentsCount || '',
      latitude: row.latitude || '',
      longitude: row.longitude || '',
    });
    // Load existing images as previews
    const existingImages = Array.isArray(row.images) 
      ? row.images 
      : row.image 
        ? [row.image] 
        : [];
    setPhotos(existingImages.filter(Boolean).map(url => ({
      file: null,
      preview: resolveImageUrl(url),
      existingUrl: url,
    })));
    setAddModalOpen(true);
  };

  const handleTableDelete = (e, row) => {
    e.stopPropagation();
    setSelectedOnboarding(row);
    setDeleteModalOpen(true);
  };

  // Helper to resolve image URL
  const resolveImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Remove trailing slash from base and leading slash from url
    const base = API_BASE_URL.replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${base}${path}`;
  };

  const columns = [
    { header: 'Community Name', accessor: 'communityName' },
    { header: 'Type', accessor: 'type', render: (row) => <span className="type-badge">{row.type}</span> },
    { header: 'Contact', accessor: 'contactPersonName', render: (row) => <span>{row.contactPersonName} <br/><small className="text-gray-500">{row.contactPhone}</small></span> },
    { header: 'Added By', accessor: 'addedBy', render: (row) => <span>{row.addedByName || row.addedBy}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    ...(isAdmin || isSalesPerson ? [{
      header: 'Actions',
      accessor: 'actions',
      render: (row) => canEditDelete(row) ? (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={(e) => handleTableEdit(e, row)} title="Edit"><Edit size={16} /></Button>
          <Button variant="ghost" size="sm" className="text-danger" onClick={(e) => handleTableDelete(e, row)} title="Delete"><Trash2 size={16} /></Button>
        </div>
      ) : null
    }] : []),
  ];

  return (
    <div className="onboarding-page">
      <div className="page-header">
        <h2>Community Onboarding</h2>
        <Button onClick={openAddModal} icon={<Plus size={16} />}>
          New Onboarding
        </Button>
      </div>

      <div className="filters-bar mt-4">
        <div className="search-wrap">
          <Input 
            placeholder="Search communities..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-wrap flex gap-3">
          <Select 
            options={[
              {label: 'All Types', value: ''},
              {label: 'Apartment', value: 'APARTMENT'},
              {label: 'Hostel', value: 'HOSTEL'}
            ]} 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
          <Select 
            options={[
              {label: 'All Statuses', value: ''},
              {label: 'Pending', value: 'pending'},
              {label: 'Approved', value: 'approved'},
              {label: 'Rejected', value: 'rejected'}
            ]} 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <Button variant="primary" onClick={() => fetchOnboardings()} icon={<Filter size={16} />}>Filter</Button>
          <Button variant="light-danger" onClick={handleClear}>Clear</Button>
        </div>
      </div>

      <div className="card mt-4">
        <Table 
          columns={columns} 
          data={onboardings} 
          onRowClick={handleRowClick}
          emptyState={loading ? "Loading requests..." : "No onboarding requests found"}
        />
      </div>

      {/* Details Modal */}
      <Modal 
        isOpen={detailsModalOpen} 
        onClose={() => setDetailsModalOpen(false)}
        title="Onboarding Request Details"
      >
        {selectedOnboarding && (
          <div className="profile-details">
            <div className="profile-header" style={{ marginBottom: '1.25rem' }}>
              <div className="profile-title-block">
                <h3>{selectedOnboarding.communityName}</h3>
                <p className="mt-1">{selectedOnboarding.fullAddress}</p>
                <div className="mt-2"><span className="type-badge">{selectedOnboarding.type}</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                backgroundColor: selectedOnboarding.status === 'rejected' ? 'rgba(239, 68, 68, 0.08)' : selectedOnboarding.status === 'approved' ? 'rgba(34, 197, 94, 0.08)' : 'var(--surface)',
                border: `1px solid ${selectedOnboarding.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : selectedOnboarding.status === 'approved' ? 'rgba(34, 197, 94, 0.2)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)', padding: '1rem'
              }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: selectedOnboarding.status === 'rejected' ? '0.75rem' : 0 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Status</span>
                    <StatusBadge status={selectedOnboarding.status} />
                 </div>
                 {selectedOnboarding.status === 'rejected' && (
                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(239, 68, 68, 0.2)' }}>
                       <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--danger)', marginBottom: '0.25rem' }}>Rejection Reason</span>
                       <span style={{ fontSize: '0.9rem', color: 'var(--danger)', lineHeight: 1.4 }}>{selectedOnboarding.rejectionReason || 'No reason provided.'}</span>
                    </div>
                 )}
              </div>
              
              <div className="onboarding-details-grid">
                <div className="onboarding-details-item">
                  <span className="onboarding-details-label">Contact Person</span>
                  <span className="onboarding-details-value">{selectedOnboarding.contactPersonName}</span>
                </div>
                <div className="onboarding-details-item">
                  <span className="onboarding-details-label">Phone</span>
                  <span className="onboarding-details-value">{selectedOnboarding.contactPhone}</span>
                </div>
                <div className="onboarding-details-item">
                  <span className="onboarding-details-label">Coordinates</span>
                  <span className="onboarding-details-value">{selectedOnboarding.latitude}, {selectedOnboarding.longitude}</span>
                </div>
                <div className="onboarding-details-item">
                  <span className="onboarding-details-label">Added By</span>
                  <span className="onboarding-details-value">{selectedOnboarding.addedByName || selectedOnboarding.addedBy}</span>
                </div>
                {selectedOnboarding.type === 'APARTMENT' && (
                  <div className="onboarding-details-item">
                    <span className="onboarding-details-label">Flats Count</span>
                    <span className="onboarding-details-value">{selectedOnboarding.flatsCount}</span>
                  </div>
                )}
                <div className="onboarding-details-item">
                  <span className="onboarding-details-label">Residents Count</span>
                  <span className="onboarding-details-value">{selectedOnboarding.residentsCount || '-'}</span>
                </div>
                <div className="onboarding-details-item" style={{ gridColumn: '1 / -1' }}>
                  <span className="onboarding-details-label">Date Submitted</span>
                  <span className="onboarding-details-value">{selectedOnboarding.createdAt ? new Date(selectedOnboarding.createdAt).toLocaleString() : '-'}</span>
                </div>

                {/* Show uploaded images if available */}
                {(selectedOnboarding.images?.length > 0 || selectedOnboarding.image) && (
                  <div className="onboarding-details-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="onboarding-details-label">Community Photos</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {(Array.isArray(selectedOnboarding.images) ? selectedOnboarding.images : [selectedOnboarding.image]).filter(Boolean).map((imgUrl, idx) => (
                        <img 
                          key={idx}
                          src={resolveImageUrl(imgUrl)} 
                          alt={`Community ${idx + 1}`} 
                          style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', objectFit: 'cover' }} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Approve/Reject for admin when pending */}
            {selectedOnboarding.status === 'pending' && isAdmin && (
              <div className="form-actions mt-6 pt-4" style={{ borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button variant="danger" icon={<XCircle size={16} />} onClick={() => { setRejectionReason(''); setRejectModalOpen(true); }}>Reject</Button>
                <Button variant="success" icon={<CheckCircle size={16} />} onClick={() => setApproveModalOpen(true)}>Approve</Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => { setAddModalOpen(false); setIsEditMode(false); setPhotos([]); }}
        title={isEditMode ? "Edit Community Onboarding" : "Add Community Onboarding"}
      >
        <form onSubmit={handleAddOnboarding} className="add-onboarding-form">
          <div className="form-row">
            <Input 
              label="Community Name" 
              name="communityName" 
              required 
              placeholder="e.g. Greenwood Regency" 
              defaultValue={isEditMode ? editForm.communityName : ''} 
            />
            <div className="input-group">
              <label className="input-label">Type</label>
              <select name="type" required className="select-input" value={onboardingType} onChange={(e) => setOnboardingType(e.target.value)}>
                <option value="APARTMENT">Apartment</option>
                <option value="HOSTEL">Hostel</option>
              </select>
            </div>
          </div>

          {/* Image Upload Section */}
          <ImageUpload 
            photos={photos} 
            onPhotosChange={setPhotos} 
            maxPhotos={5} 
          />
          
          <div className="form-group-col mt-3">
             <div className="input-group">
                <label className="input-label">Full Address</label>
                <textarea 
                  name="fullAddress" 
                  required 
                  className="textarea-input" 
                  placeholder="Street address..." 
                  rows="2"
                  defaultValue={isEditMode ? editForm.fullAddress : ''}
                ></textarea>
             </div>
          </div>
          
          <div className="form-row mt-3">
            <Input 
              label="Contact Person" 
              name="contactPersonName" 
              required 
              placeholder="Name" 
              defaultValue={isEditMode ? editForm.contactPersonName : ''} 
            />
            <Input 
              label="Contact Phone" 
              name="contactPhone" 
              required 
              placeholder="+91..." 
              defaultValue={isEditMode ? editForm.contactPhone : ''} 
            />
          </div>

          <div className="form-row mt-3">
            {onboardingType === 'APARTMENT' && (
              <Input 
                label="Flats Count (Apt only)" 
                name="flatsCount" 
                type="number" 
                placeholder="e.g. 450" 
                defaultValue={isEditMode ? editForm.flatsCount : ''} 
              />
            )}
            <Input 
              label="Residents Count" 
              name="residentsCount" 
              type="number" 
              placeholder="e.g. 1200" 
              defaultValue={isEditMode ? editForm.residentsCount : ''} 
            />
          </div>
          
          <div className="form-row mt-3">
            <Input 
              label="Latitude" 
              name="latitude" 
              type="number" 
              step="any" 
              required 
              placeholder="e.g. 12.9250" 
              defaultValue={isEditMode ? editForm.latitude : ''} 
            />
            <Input 
              label="Longitude" 
              name="longitude" 
              type="number" 
              step="any" 
              required 
              placeholder="e.g. 77.6890" 
              defaultValue={isEditMode ? editForm.longitude : ''} 
            />
          </div>


          <div className="form-actions mt-6">
            <Button type="button" variant="ghost" onClick={() => { setAddModalOpen(false); setIsEditMode(false); setPhotos([]); }}>Cancel</Button>
            <Button type="submit" variant="primary">{isEditMode ? 'Update Request' : 'Submit Request'}</Button>
          </div>
        </form>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal 
        isOpen={rejectModalOpen} 
        onClose={() => setRejectModalOpen(false)}
        title="Confirm Rejection"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button 
              variant="danger" 
              onClick={() => handleStatusChange('rejected', rejectionReason)}
              disabled={!rejectionReason.trim()}
            >
              Confirm Reject
            </Button>
          </>
        }
      >
        <p style={{ marginBottom: '1rem' }}>Are you sure you want to reject the onboarding request for <strong>{selectedOnboarding?.communityName}</strong>?</p>
        <div className="input-group">
          <label className="input-label">Reason for Rejection <span style={{ color: 'red' }}>*</span></label>
          <textarea 
            className="textarea-input" 
            rows="3" 
            placeholder="e.g. Capacity metrics do not satisfy current delivery route rules."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            autoFocus
          ></textarea>
        </div>
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal 
        isOpen={approveModalOpen} 
        onClose={() => setApproveModalOpen(false)}
        title="Confirm Approval"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setApproveModalOpen(false)}>Cancel</Button>
            <Button 
              variant="success" 
              onClick={() => handleStatusChange('approved')}
            >
              Confirm Approve
            </Button>
          </>
        }
      >
        <p style={{ marginBottom: '1rem' }}>Are you sure you want to approve the onboarding request for <strong>{selectedOnboarding?.communityName}</strong>?</p>
        <p className="text-gray-500 text-sm">Once approved, this community will become active in the system.</p>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Onboarding"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteOnboarding}>Delete</Button>
          </>
        }
      >
        <p>Are you sure you want to permanently delete the onboarding request for <strong>{selectedOnboarding?.communityName}</strong>?</p>
        <p className="status-warning" style={{ marginTop: '0.5rem' }}>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default Onboarding;
