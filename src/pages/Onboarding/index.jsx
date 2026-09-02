import React, { useState, useEffect } from 'react';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, CheckCircle, XCircle } from 'lucide-react';
import { getOnboardings, addOnboarding, updateOnboarding, updateOnboardingStatus } from '../../services/onboardingService';
import { getUser } from '../../services/authService';
import './Onboarding.css';

const Onboarding = () => {
  const { addToast } = useToast();
  const user = getUser();
  const isAdmin = user?.role === 'admin' || user?.role?.toLowerCase().includes('admin');
  const [onboardings, setOnboardings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);

  const fetchOnboardings = async () => {
    setLoading(true);
    try {
      const data = await getOnboardings({ search, status: statusFilter, type: typeFilter });
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
  }, [search, statusFilter, typeFilter]);

  const handleRowClick = (onboarding) => {
    setSelectedOnboarding(onboarding);
    setDetailsModalOpen(true);
  };

  const handleAddOnboarding = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      communityName: formData.get('communityName'),
      type: formData.get('type'),
      fullAddress: formData.get('fullAddress'),
      contactPersonName: formData.get('contactPersonName'),
      contactPhone: formData.get('contactPhone'),
      latitude: Number(formData.get('latitude')),
      longitude: Number(formData.get('longitude'))
    };

    if (formData.get('flatsCount')) payload.flatsCount = Number(formData.get('flatsCount'));
    if (formData.get('residentsCount')) payload.residentsCount = Number(formData.get('residentsCount'));

    try {
      await addOnboarding(payload);
      setAddModalOpen(false);
      addToast('Onboarding request created successfully', 'success');
      fetchOnboardings();
    } catch (error) {
      addToast('Failed to create onboarding request', 'error');
    }
  };

  const handleStatusChange = async (status, rejectionReason = '') => {
    if (!selectedOnboarding) return;
    try {
      await updateOnboardingStatus(selectedOnboarding.onboardingId || selectedOnboarding.id || selectedOnboarding._id, status, rejectionReason);
      setDetailsModalOpen(false);
      addToast(`Onboarding ${status} successfully`, 'success');
      fetchOnboardings();
    } catch (error) {
      addToast(`Failed to ${status} onboarding`, 'error');
    }
  };

  const columns = [
    { header: 'Community Name', accessor: 'communityName' },
    { header: 'Type', accessor: 'type', render: (row) => <span className="type-badge">{row.type}</span> },
    { header: 'Contact', accessor: 'contactPersonName', render: (row) => <span>{row.contactPersonName} <br/><small className="text-gray-500">{row.contactPhone}</small></span> },
    { header: 'Added By', accessor: 'addedBy', render: (row) => <span>{row.addedByName || row.addedBy}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="onboarding-page">
      <div className="page-header">
        <h2>Community Onboarding</h2>
        <Button onClick={() => setAddModalOpen(true)} icon={<Plus size={16} />}>
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
          <Button variant="light-danger" onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter(''); }}>Clear</Button>
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
            <div className="profile-header">
              <div className="profile-title-block">
                <h3>{selectedOnboarding.communityName}</h3>
                <p className="mt-1">{selectedOnboarding.fullAddress}</p>
                <div className="mt-2"><StatusBadge status={selectedOnboarding.status} /> <span className="type-badge ml-2">{selectedOnboarding.type}</span></div>
              </div>
            </div>
            
            <div className="profile-grid">
              <div className="profile-item">
                <span className="profile-label">Contact Person</span>
                <span className="profile-value">{selectedOnboarding.contactPersonName}</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Phone</span>
                <span className="profile-value">{selectedOnboarding.contactPhone}</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Coordinates</span>
                <span className="profile-value">{selectedOnboarding.latitude}, {selectedOnboarding.longitude}</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Added By</span>
                <span className="profile-value">{selectedOnboarding.addedByName || selectedOnboarding.addedBy}</span>
              </div>
              {selectedOnboarding.type === 'APARTMENT' && (
                <div className="profile-item">
                  <span className="profile-label">Flats Count</span>
                  <span className="profile-value">{selectedOnboarding.flatsCount}</span>
                </div>
              )}
              <div className="profile-item">
                <span className="profile-label">Residents Count</span>
                <span className="profile-value">{selectedOnboarding.residentsCount || '-'}</span>
              </div>
              <div className="profile-item col-span-2">
                <span className="profile-label">Date Submitted</span>
                <span className="profile-value">{selectedOnboarding.createdAt ? new Date(selectedOnboarding.createdAt).toLocaleString() : '-'}</span>
              </div>
            </div>
            
            {selectedOnboarding.status === 'pending' && isAdmin && (
              <div className="form-actions mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                <Button variant="danger" icon={<XCircle size={16} />} onClick={() => handleStatusChange('rejected', 'Rejected by Admin')}>Reject</Button>
                <Button variant="success" icon={<CheckCircle size={16} />} onClick={() => handleStatusChange('approved')}>Approve</Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Community Onboarding"
      >
        <form onSubmit={handleAddOnboarding} className="add-onboarding-form">
          <div className="form-row">
            <Input label="Community Name" name="communityName" required placeholder="e.g. Greenwood Regency" />
            <div className="input-group">
              <label className="input-label">Type</label>
              <select name="type" required className="select-input">
                <option value="APARTMENT">Apartment</option>
                <option value="HOSTEL">Hostel</option>
              </select>
            </div>
          </div>
          
          <div className="form-group-col mt-3">
             <div className="input-group">
                <label className="input-label">Full Address</label>
                <textarea name="fullAddress" required className="textarea-input" placeholder="Street address..." rows="2"></textarea>
             </div>
          </div>
          
          <div className="form-row mt-3">
            <Input label="Contact Person" name="contactPersonName" required placeholder="Name" />
            <Input label="Contact Phone" name="contactPhone" required placeholder="+91..." />
          </div>

          <div className="form-row mt-3">
            <Input label="Flats Count (Apt only)" name="flatsCount" type="number" placeholder="e.g. 450" />
            <Input label="Residents Count" name="residentsCount" type="number" placeholder="e.g. 1200" />
          </div>
          
          <div className="form-row mt-3">
            <Input label="Latitude" name="latitude" type="number" step="any" required placeholder="e.g. 12.9250" />
            <Input label="Longitude" name="longitude" type="number" step="any" required placeholder="e.g. 77.6890" />
          </div>

          <div className="form-actions mt-6">
            <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Submit Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Onboarding;
