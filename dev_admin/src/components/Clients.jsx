import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, Pencil } from 'lucide-react';

function formatDateDMY(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatDateTimeDMY(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${day}-${month}-${year} ${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
}

function formatDateLong(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return '-';
  const day = d.getDate();
  const month = d.toLocaleString('default', { month: 'long' });
  const year = d.getFullYear();
  // Ordinal suffix
  const j = day % 10, k = day % 100;
  let suffix = 'th';
  if (j === 1 && k !== 11) suffix = 'st';
  else if (j === 2 && k !== 12) suffix = 'nd';
  else if (j === 3 && k !== 13) suffix = 'rd';
  return `${day}${suffix} ${month} ${year}`;
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false); // Add state for AddClientModal

  const fetchClients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://147.93.110.150:3001/api/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch clients');
      const data = await res.json();
      setClients(data);
    } catch (err) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          onClick={() => setShowAddModal(true)}
        >
          + Add Client
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map(client => (
              <tr key={client.client_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.client_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{client.license_no}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateLong(client.issue_date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateLong(client.expiry_date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${client.status && client.status.toLowerCase() === 'active' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                    {client.status ? client.status.charAt(0).toUpperCase() + client.status.slice(1) : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                  <button
                    onClick={() => { setSelectedClient(client); setShowModal(true); }}
                    className="p-2 rounded-full hover:bg-blue-100 group"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5 text-blue-600 group-hover:text-blue-800" />
                  </button>
                  <button
                    onClick={() => { setEditClient(client); setShowEditModal(true); }}
                    className="p-2 rounded-full hover:bg-indigo-100 group ml-2"
                    title="Edit Client"
                  >
                    <Pencil className="w-5 h-5 text-indigo-600 group-hover:text-indigo-800" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && selectedClient && (
        <ClientDetailsModal client={selectedClient} onClose={() => setShowModal(false)} />
      )}
      {showEditModal && editClient && (
        <EditClientModal client={editClient} onClose={() => setShowEditModal(false)} onSave={() => {
          fetchClients();
          setShowEditModal(false);
        }} />
      )}
      {showAddModal && (
        <AddClientModal onClose={() => setShowAddModal(false)} onSave={() => {
          fetchClients();
          setShowAddModal(false);
        }} />
      )}
    </div>
  );
}

function ClientDetailsModal({ client, onClose }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = client.image && !imgError ? `http://147.93.110.150:3001/api/client-image/${client.image}` : null;
  

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Client Details</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-light"
          >
            ×
          </button>
        </div>
        {imageUrl ? (
          <div className="mb-6 flex justify-center">
            <img src={imageUrl} alt="Client" className="max-h-40 rounded shadow" onError={() => setImgError(true)} />
          </div>
        ) : (
          <div className="mb-6 flex justify-center">
            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded shadow text-gray-400">No Image</div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Info label="Client Name" value={client.client_name} />
          <Info label="License No" value={client.license_no} />
          <Info label="Plan" value={client.plan_name} />
          <Info label="Status" value={<span className={`px-2 py-1 text-xs font-semibold rounded-full ${client.status && client.status.toLowerCase() === 'active' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>{client.status ? client.status.charAt(0).toUpperCase() + client.status.slice(1) : 'Active'}</span>} />
          <Info label="Issue Date" value={formatDateLong(client.issue_date)} />
          <Info label="Expiry Date" value={formatDateLong(client.expiry_date)} />
          <Info label="Advt. Timer" value={client.adv_timer !== undefined ? client.adv_timer : '-'} />
          <Info label="Address" value={client.client_address || '-'} />
          <Info label="Roles" value={client.roles || '-'} />
          <Info label="Customers Login" value={client.customers_login || '-'} />
          <Info label="Sales Manager Login" value={client.sales_mgr_login || '-'} />
          <Info label="Superadmin Login" value={client.superadmin_login || '-'} />
          <Info label="Plan Duration (days)" value={client.duration || '-'} />
          <Info label="Product Prefix" value={client.product_prefix || '-'} />
          <Info label="Customer Prefix" value={client.customer_prefix || '-'} />
          <Info label="SM Prefix" value={client.sm_prefix || '-'} />
          <Info label="Order Prefix" value={client.ord_prefix || '-'} />
          <Info label="Invoice Prefix" value={client.inv_prefix || '-'} />
          <Info label="Order Prefix Number" value={client.ord_prefix_num || '-'} />
          <Info label="HSN Length" value={client.hsn_length || '-'} />
          <Info label="Default Due On" value={client.default_due_on !== undefined && client.default_due_on !== null ? client.default_due_on : '-'} />
          <Info label="Max Due On" value={client.max_due_on !== undefined && client.max_due_on !== null ? client.max_due_on : '-'} />
          <Info label="Created At" value={formatDateTimeDMY(client.created_at)} />
          <Info label="Updated At" value={formatDateTimeDMY(client.updated_at)} />
        </div>
      </div>
    </div>
  );
}

function EditClientModal({ client, onClose, onSave }) {
  const [form, setForm] = useState({ 
    ...client,
    default_due_on: client.default_due_on !== undefined && client.default_due_on !== null ? client.default_due_on : '',
    max_due_on: client.max_due_on !== undefined && client.max_due_on !== null ? client.max_due_on : ''
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(form.image ? `http://147.93.110.150:3001/api/client-image/${form.image}` : null);
  const [imageUploading, setImageUploading] = useState(false);
  


  // Auto-calculate expiry_date when duration changes
  useEffect(() => {
    if (form.issue_date && form.duration) {
      const issue = new Date(form.issue_date);
      if (!isNaN(issue)) {
        const exp = new Date(issue);
        exp.setDate(exp.getDate() + Number(form.duration));
        const yyyy = exp.getFullYear();
        const mm = String(exp.getMonth() + 1).padStart(2, '0');
        const dd = String(exp.getDate()).padStart(2, '0');
        setForm(f => ({ ...f, expiry_date: `${yyyy}-${mm}-${dd}` }));
      }
    }
    // eslint-disable-next-line
  }, [form.duration, form.issue_date]);

  const handleChange = async e => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        setImageUploading(true);
        try {
          const token = localStorage.getItem('authToken');
          const formData = new FormData();
          formData.append('image', file);
          if (form.image) {
            formData.append('oldImage', form.image);
          }
          const res = await fetch('http://147.93.110.150:3001/api/upload-image', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          if (!res.ok) throw new Error('Failed to upload image');
          const data = await res.json();
          setForm(f => ({ ...f, image: data.imageFileName }));
          setImagePreview(`http://147.93.110.150:3001/api/client-image/${data.imageFileName}?t=${Date.now()}`);
        } catch (err) {
          toast.error('Failed to upload image');
        } finally {
          setImageUploading(false);
        }
      }
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.default_due_on || !form.max_due_on) {
      toast.error('Default Due On and Max Due On are required fields');
      return;
    }
    
    // Validate that both fields are non-negative integers
    if (parseInt(form.default_due_on) < 0 || parseInt(form.max_due_on) < 0) {
      toast.error('Default Due On and Max Due On must be non-negative integers');
      return;
    }
    
    // Validate that max_due_on is greater than default_due_on
    if (parseInt(form.max_due_on) <= parseInt(form.default_due_on)) {
      toast.error('Max Due On must be greater than Default Due On');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const submitData = new FormData();
      // Add all fields to FormData
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'roles') {
          submitData.append('roles', typeof value === 'string' ? value : Array.isArray(value) ? value.join(',') : '');
        } else if (key === 'issue_date' || key === 'expiry_date') {
          if (value) {
            const d = new Date(value);
            if (!isNaN(d)) {
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              submitData.append(key, `${yyyy}-${mm}-${dd}`);
            } else {
              submitData.append(key, value);
            }
          } else {
            submitData.append(key, '');
          }
        } else if (key === 'image') {
          // Only send the image filename
          submitData.append(key, value || '');
        } else {
          submitData.append(key, value ?? '');
        }
      });
      // Always send the current image filename as existingImage if no new image was uploaded
      if (form.image) {
        submitData.append('existingImage', form.image);
      }
      const response = await fetch('http://147.93.110.150:3001/api/update_client', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });
      if (!response.ok) throw new Error('Failed to update client');
      const updated = await response.json();
      toast.success('Client updated successfully');
      onSave({ ...form, image: updated.imageFileName });
    } catch (err) {
      toast.error('Failed to update client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Edit Client</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-light"
          >
            ×
          </button>
        </div>
        {imageUploading && (
          <div className="mb-2 flex justify-center items-center text-blue-700">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            Uploading image...
          </div>
        )}
        {imagePreview && !imageUploading && (
          <div className="mb-6 flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">Uploaded image preview:</span>
            <img src={imagePreview} alt="Client" className="max-h-40 rounded shadow mb-2" />
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Client Name" name="client_name" value={form.client_name || ''} onChange={handleChange} required />
          <Input label="License No" name="license_no" value={form.license_no || ''} onChange={handleChange} required />
          <Input label="Plan" name="plan_name" value={form.plan_name || ''} onChange={handleChange} />
          <Input label="Status" name="status" value={form.status || ''} onChange={handleChange} />
          <DisplayField label="Issue Date" value={formatDateLong(form.issue_date)} />
          <Input label="Plan Duration (days)" name="duration" value={form.duration || ''} onChange={handleChange} required />
          <Input label="Expiry Date" name="expiry_date" value={form.expiry_date || ''} onChange={handleChange} type="date" disabled />
          <Input label="Advt. Timer" name="adv_timer" value={form.adv_timer || ''} onChange={handleChange} />
          <Input label="Address" name="client_address" value={form.client_address || ''} onChange={handleChange} />
          <Input label="Roles" name="roles" value={form.roles || ''} onChange={handleChange} />
          <Input label="Customers Login" name="customers_login" value={form.customers_login || ''} onChange={handleChange} />
          <Input label="Sales Manager Login" name="sales_mgr_login" value={form.sales_mgr_login || ''} onChange={handleChange} />
          <Input label="Superadmin Login" name="superadmin_login" value={form.superadmin_login || ''} onChange={handleChange} />
          <Input label="Product Prefix" name="product_prefix" value={form.product_prefix || ''} onChange={handleChange} required />
          <Input label="Customer Prefix" name="customer_prefix" value={form.customer_prefix || ''} onChange={handleChange} required />
          <Input label="SM Prefix" name="sm_prefix" value={form.sm_prefix || ''} onChange={handleChange} required />
          <Input label="Order Prefix" name="ord_prefix" value={form.ord_prefix || ''} onChange={handleChange} required />
          <Input label="Invoice Prefix" name="inv_prefix" value={form.inv_prefix || ''} onChange={handleChange} required />
          <Input label="Order Prefix Number" name="ord_prefix_num" value={form.ord_prefix_num || ''} onChange={handleChange} required />
          <Input label="HSN Length" name="hsn_length" value={form.hsn_length || ''} onChange={handleChange} />
          <Input label="Default Due On" name="default_due_on" value={form.default_due_on !== undefined && form.default_due_on !== null ? form.default_due_on : ''} onChange={handleChange} type="number" min="0" required />
          <Input label="Max Due On" name="max_due_on" value={form.max_due_on !== undefined && form.max_due_on !== null ? form.max_due_on : ''} onChange={handleChange} type="number" min="0" required />
          <Input label="Image" name="image" type="file" onChange={handleChange} />
          <div className="md:col-span-2 flex justify-end mt-4">
            <button type="submit" className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange, type = 'text', min, required }) {
  const handleNumberChange = (e) => {
    if (type === 'number') {
      const value = e.target.value;
      // Only allow positive integers
      if (value === '' || /^\d+$/.test(value)) {
        onChange(e);
      }
    } else {
      onChange(e);
    }
  };

  return (
    <div>
      <label className="block mb-1 font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleNumberChange}
        min={min}
        required={required}
        className="w-full px-3 py-2 border rounded"
      />
    </div>
  );
}

function DisplayField({ label, value }) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <div className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-700 cursor-not-allowed">{value}</div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1">{value}</p>
    </div>
  );
} 

// AddClientModal: similar to EditClientModal but for adding a new client
function AddClientModal({ onClose, onSave }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    client_name: '',
    license_no: '',
    plan_name: '',
    status: '',
    issue_date: todayStr, // default to today
    duration: '',
    expiry_date: '',
    adv_timer: '',
    client_address: '',
    roles: '',
    customers_login: '',
    sales_mgr_login: '',
    superadmin_login: '',
    product_prefix: '',
    customer_prefix: '',
    sm_prefix: '',
    ord_prefix: '',
    inv_prefix: '',
    ord_prefix_num: '',
    hsn_length: '',
    default_due_on: '',
    max_due_on: '',
    // Remove image filename, use imageFile for file
  });
  const [imageFile, setImageFile] = useState(null); // store file
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-calculate expiry_date when duration or issue_date changes
  useEffect(() => {
    if (form.issue_date && form.duration) {
      const issue = new Date(form.issue_date);
      if (!isNaN(issue)) {
        const exp = new Date(issue);
        exp.setDate(exp.getDate() + Number(form.duration));
        const yyyy = exp.getFullYear();
        const mm = String(exp.getMonth() + 1).padStart(2, '0');
        const dd = String(exp.getDate()).padStart(2, '0');
        setForm(f => ({ ...f, expiry_date: `${yyyy}-${mm}-${dd}` }));
      }
    }
    // eslint-disable-next-line
  }, [form.duration, form.issue_date]);

  const handleChange = e => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.default_due_on || !form.max_due_on) {
      toast.error('Default Due On and Max Due On are required fields');
      return;
    }
    
    // Validate that both fields are non-negative integers
    if (parseInt(form.default_due_on) < 0 || parseInt(form.max_due_on) < 0) {
      toast.error('Default Due On and Max Due On must be non-negative integers');
      return;
    }
    
    // Validate that max_due_on is greater than default_due_on
    if (parseInt(form.max_due_on) <= parseInt(form.default_due_on)) {
      toast.error('Max Due On must be greater than Default Due On');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const submitData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'roles') {
          submitData.append('roles', typeof value === 'string' ? value : Array.isArray(value) ? value.join(',') : '');
        } else if (key === 'issue_date' || key === 'expiry_date') {
          if (value) {
            const d = new Date(value);
            if (!isNaN(d)) {
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              submitData.append(key, `${yyyy}-${mm}-${dd}`);
            } else {
              submitData.append(key, value);
            }
          } else {
            submitData.append(key, '');
          }
        } else {
          submitData.append(key, value ?? '');
        }
      });
      if (imageFile) {
        submitData.append('image', imageFile);
      }
      const response = await fetch('http://147.93.110.150:3001/api/add_client', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });
      if (!response.ok) throw new Error('Failed to add client');
      await response.json();
      toast.success('Client added successfully');
      onSave();
    } catch (err) {
      toast.error('Failed to add client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Add Client</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-light"
          >
            ×
          </button>
        </div>
        {loading && (
          <div className="mb-2 flex justify-center items-center text-blue-700">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            Adding client...
          </div>
        )}
        {imagePreview && !loading && (
          <div className="mb-6 flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">Uploaded image preview:</span>
            <img src={imagePreview} alt="Client" className="max-h-40 rounded shadow mb-2" />
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Client Name" name="client_name" value={form.client_name || ''} onChange={handleChange} required />
          <Input label="License No" name="license_no" value={form.license_no || ''} onChange={handleChange} required />
          <Input label="Plan" name="plan_name" value={form.plan_name || ''} onChange={handleChange} />
          <Input label="Status" name="status" value={form.status || ''} onChange={handleChange} />
          <Input label="Issue Date" name="issue_date" value={form.issue_date || ''} onChange={handleChange} type="date" disabled />
          <Input label="Plan Duration (days)" name="duration" value={form.duration || ''} onChange={handleChange} required />
          <Input label="Expiry Date" name="expiry_date" value={form.expiry_date || ''} onChange={handleChange} type="date" disabled />
          <Input label="Advt. Timer" name="adv_timer" value={form.adv_timer || ''} onChange={handleChange} />
          <Input label="Address" name="client_address" value={form.client_address || ''} onChange={handleChange} />
          <Input label="Roles" name="roles" value={form.roles || ''} onChange={handleChange} />
          <Input label="Customers Login" name="customers_login" value={form.customers_login || ''} onChange={handleChange} />
          <Input label="Sales Manager Login" name="sales_mgr_login" value={form.sales_mgr_login || ''} onChange={handleChange} />
          <Input label="Superadmin Login" name="superadmin_login" value={form.superadmin_login || ''} onChange={handleChange} />
          <Input label="Product Prefix" name="product_prefix" value={form.product_prefix || ''} onChange={handleChange} required />
          <Input label="Customer Prefix" name="customer_prefix" value={form.customer_prefix || ''} onChange={handleChange} required />
          <Input label="SM Prefix" name="sm_prefix" value={form.sm_prefix || ''} onChange={handleChange} required />
          <Input label="Order Prefix" name="ord_prefix" value={form.ord_prefix || ''} onChange={handleChange} required />
          <Input label="Invoice Prefix" name="inv_prefix" value={form.inv_prefix || ''} onChange={handleChange} required />
          <Input label="Order Prefix Number" name="ord_prefix_num" value={form.ord_prefix_num || ''} onChange={handleChange} required />
          <Input label="HSN Length" name="hsn_length" value={form.hsn_length || ''} onChange={handleChange} />
          <Input label="Default Due On" name="default_due_on" value={form.default_due_on !== undefined && form.default_due_on !== null ? form.default_due_on : ''} onChange={handleChange} type="number" min="0" required />
          <Input label="Max Due On" name="max_due_on" value={form.max_due_on !== undefined && form.max_due_on !== null ? form.max_due_on : ''} onChange={handleChange} type="number" min="0" required />
          <Input label="Image" name="image" type="file" onChange={handleChange} />
          <div className="md:col-span-2 flex justify-end mt-4">
            <button type="submit" className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition" disabled={loading}>
              {loading ? 'Saving...' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 