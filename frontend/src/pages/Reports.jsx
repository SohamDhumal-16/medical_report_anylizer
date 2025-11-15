/**
 * Reports List Page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FileText, Search, Calendar, Activity, AlertCircle, Loader, Trash2 } from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [searchTerm, filterType, reports]);

  const fetchReports = async () => {
    try {
      const data = await analysisAPI.getUserReports();
      setReports(data.reports || []);
      setFilteredReports(data.reports || []);
    } catch (err) {
      setError('Failed to fetch reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((report) =>
        report.file_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((report) => report.report_type === filterType);
    }

    setFilteredReports(filtered);
  };

  const handleDeleteReport = async (reportId, e) => {
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(reportId);
    setError('');

    try {
      await analysisAPI.deleteReport(reportId);
      // Refresh the reports list
      await fetchReports();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete report');
    } finally {
      setDeleteLoading(null);
    }
  };

  const reportTypes = [...new Set(reports.map((r) => r.report_type))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold gradient-text">My Reports</h1>
          <p className="text-gray-700 text-lg font-medium mt-2">View and manage all your medical reports</p>
        </div>

        {/* Filters */}
        <div className="card mb-6 animate-slide-in-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field"
            >
              <option value="all">All Types</option>
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="card animate-scale-in">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-gray-700 font-medium">Loading reports...</p>
            </div>
          ) : error ? (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-xl p-4 flex items-start shadow-md">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5 animate-pulse" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-6 animate-bounce-subtle">
                <FileText className="w-20 h-20 text-blue-600" />
              </div>
              <p className="text-gray-700 text-lg font-medium mb-6">
                {searchTerm || filterType !== 'all' ? 'No reports match your filters' : 'No reports uploaded yet'}
              </p>
              <button onClick={() => navigate('/upload')} className="btn-primary">
                Upload New Report
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-700 font-semibold">
                Showing {filteredReports.length} of {reports.length} reports
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report, index) => (
                  <div
                    key={report.report_id}
                    onClick={() => navigate(`/report/${report.report_id}`)}
                    className="border-2 border-blue-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer bg-white hover:border-blue-400 transform hover:-translate-y-1 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-md transform transition-transform duration-300 hover:scale-110">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className={`badge-${report.parameters_count > 0 ? 'success' : 'warning'}`}>
                        {report.parameters_count} values
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-3 truncate" title={report.file_name}>
                      {report.file_name}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600 font-medium mb-4">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-purple-600" />
                        <span className="capitalize">{report.report_type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/report/${report.report_id}`);
                        }}
                        className="flex-1 text-center text-blue-600 hover:text-white bg-white hover:bg-blue-600 font-bold text-sm py-2.5 border-2 border-blue-600 rounded-lg transition-all duration-300 transform hover:scale-105"
                      >
                        View Details
                      </button>
                      <button
                        onClick={(e) => handleDeleteReport(report.report_id, e)}
                        disabled={deleteLoading === report.report_id}
                        className="px-4 text-red-600 hover:text-white hover:bg-red-600 border-2 border-red-600 rounded-lg transition-all duration-300 disabled:opacity-50 transform hover:scale-110"
                      >
                        {deleteLoading === report.report_id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
