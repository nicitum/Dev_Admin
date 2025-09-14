import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Settings, Save, X } from 'lucide-react';

export default function ClientSettingsHelper({ client, onClose, onSave }) {
  const [appUpdate, setAppUpdate] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchAppUpdate();
  }, [client.client_id]);

  const fetchAppUpdate = async () => {
    setFetching(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://147.93.110.150:3001/api/app_update/${client.client_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch app update value');
      }
      
      const data = await response.json();
      console.log('Received data from API:', data);
      setAppUpdate(data.app_update || '');
      setDownloadLink(data.download_link || '');
    } catch (err) {
      console.error('Fetch app update error:', err);
      toast.error('Failed to fetch app update value');
      setAppUpdate('');
      setDownloadLink('');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate app update is required
    if (!appUpdate || appUpdate.trim() === '') {
      toast.error('App update selection is required');
      return;
    }
    
    // Validate download link is required only when app update is Yes
    if (appUpdate === 'Yes' && (!downloadLink || downloadLink.trim() === '')) {
      toast.error('Download link is required when app update is enabled');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // Prepare the data to send
      const dataToSend = {
        client_id: client.client_id,
        app_update: appUpdate.trim(),
        download_link: appUpdate === 'Yes' ? downloadLink.trim() : ''
      };
      
      console.log('Sending data to API:', dataToSend);
      
      const response = await fetch('http://147.93.110.150:3001/api/app_update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not ok:', response.status, errorText);
        throw new Error(`Failed to update app update values: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Update response from API:', data);
      
      // Update local state with the response values
      if (data.app_update !== undefined) {
        setAppUpdate(data.app_update);
      }
      if (data.download_link !== undefined) {
        setDownloadLink(data.download_link);
      }
      
      toast.success('Client settings updated successfully');
      onSave(data);
    } catch (err) {
      console.error('Update app update error:', err);
      toast.error('Failed to update client settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAppUpdateChange = (e) => {
    const value = e.target.value;
    setAppUpdate(value);
    
    // Clear download link when app update is set to No
    if (value === 'No') {
      setDownloadLink('');
    }
  };

  const handleDownloadLinkChange = (e) => {
    setDownloadLink(e.target.value);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xl font-semibold text-gray-900">Client Settings</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-light"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Client:</span> {client.client_name}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">License No:</span> {client.license_no}
          </p>
        </div>

        {fetching ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">Loading client settings...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">
                App Update <span className="text-red-500">*</span>
              </label>
              <select
                value={appUpdate}
                onChange={handleAppUpdateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select an option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Enable or disable app update functionality (required)
              </p>
            </div>

            {appUpdate === 'Yes' && (
              <div className="mb-6">
                <label className="block mb-2 font-medium text-gray-700">
                  Download Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={downloadLink}
                  onChange={handleDownloadLinkChange}
                  placeholder="Enter download link..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required={appUpdate === 'Yes'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL for downloading the app update (required when app update is enabled)
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
