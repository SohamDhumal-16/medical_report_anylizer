/**
 * Compare Reports Page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { analysisAPI, comparisonAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Loader, BarChart, PieChart, Activity, FileText } from 'lucide-react';

const Compare = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [oldReportId, setOldReportId] = useState('');
  const [newReportId, setNewReportId] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await analysisAPI.getUserReports();
      const sortedReports = (data.reports || []).sort(
        (a, b) => new Date(b.report_date) - new Date(a.report_date)
      );
      setReports(sortedReports);

      // Auto-select latest two reports if available
      if (sortedReports.length >= 2) {
        setNewReportId(sortedReports[0].report_id);
        setOldReportId(sortedReports[1].report_id);
      }
    } catch (err) {
      setError('Failed to fetch reports');
      console.error(err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleCompare = async () => {
    if (!oldReportId || !newReportId) {
      setError('Please select two reports to compare');
      return;
    }

    if (oldReportId === newReportId) {
      setError('Please select two different reports');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await comparisonAPI.compareReports(user.user_id, oldReportId, newReportId);
      setComparison(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to compare reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold gradient-text">Compare Reports</h1>
          <p className="text-gray-700 text-lg font-medium mt-2">Track your health progress by comparing reports</p>
        </div>

        {/* Selection Card */}
        <div className="card mb-6 animate-slide-in-left border-2 border-blue-200">
          <h2 className="text-xl font-bold gradient-text mb-4">Select Reports to Compare</h2>

          {loadingReports ? (
            <div className="flex justify-center py-8">
              <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>
          ) : reports.length < 2 ? (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-6 animate-bounce-subtle">
                <BarChart className="w-20 h-20 text-blue-600" />
              </div>
              <p className="text-gray-700 text-lg font-medium mb-6">You need at least 2 reports to compare</p>
              <button onClick={() => navigate('/upload')} className="btn-primary">
                Upload More Reports
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Old Report Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Older Report (Baseline)
                  </label>
                  <select
                    value={oldReportId}
                    onChange={(e) => setOldReportId(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select older report...</option>
                    {reports.map((report) => (
                      <option key={report.report_id} value={report.report_id}>
                        {report.file_name} - {new Date(report.report_date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* New Report Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Newer Report (Current)
                  </label>
                  <select
                    value={newReportId}
                    onChange={(e) => setNewReportId(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select newer report...</option>
                    {reports.map((report) => (
                      <option key={report.report_id} value={report.report_id}>
                        {report.file_name} - {new Date(report.report_date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-xl p-4 flex items-start mb-6 shadow-md animate-slide-in-left">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handleCompare}
                disabled={!oldReportId || !newReportId || loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Comparing...' : 'Compare Reports'}
              </button>
            </>
          )}
        </div>

        {/* Comparison Results */}
        {comparison && (
          <>
            {/* Summary Card */}
            <div className="card mb-6 animate-scale-in bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200">
              <h2 className="text-2xl font-bold gradient-text mb-6">Comparison Summary</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-white rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{comparison.summary.total_parameters}</p>
                  <p className="text-sm text-gray-700 font-semibold mt-2">Parameters Compared</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                  <p className="text-4xl font-bold text-green-600">{comparison.summary.improved}</p>
                  <p className="text-sm text-gray-700 font-semibold mt-2">Improved</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl border-2 border-red-200 hover:border-red-400 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                  <p className="text-4xl font-bold text-red-600">{comparison.summary.worsened}</p>
                  <p className="text-sm text-gray-700 font-semibold mt-2">Worsened</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                  <p className="text-4xl font-bold text-gray-600">{comparison.summary.stable}</p>
                  <p className="text-sm text-gray-700 font-semibold mt-2">Stable</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700 font-semibold">Overall Improvement Rate</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {comparison.summary.improvement_rate !== undefined && comparison.summary.improvement_rate !== null
                        ? `${parseFloat(comparison.summary.improvement_rate).toFixed(1)}%`
                        : '0%'}
                    </p>
                  </div>
                  <div className="h-3 flex-1 mx-8 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000 ease-out animate-pulse-subtle"
                      style={{
                        width: `${comparison.summary.improvement_rate !== undefined && comparison.summary.improvement_rate !== null
                          ? Math.max(0, Math.min(100, parseFloat(comparison.summary.improvement_rate)))
                          : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Pie Chart - Trend Distribution */}
              <div className="card animate-slide-in-left bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200">
                <div className="flex items-center mb-6">
                  <PieChart className="w-6 h-6 text-purple-600 mr-3" />
                  <h3 className="text-xl font-bold gradient-text">Health Status Distribution</h3>
                </div>

                <div className="flex items-center justify-center mb-6">
                  {/* Simple Pie Chart using CSS */}
                  <div className="relative w-64 h-64">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      {/* Improved slice */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="20"
                        strokeDasharray={`${(comparison.summary.improved / comparison.summary.total_parameters) * 251.2} 251.2`}
                        className="transition-all duration-1000"
                      />
                      {/* Worsened slice */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="20"
                        strokeDasharray={`${(comparison.summary.worsened / comparison.summary.total_parameters) * 251.2} 251.2`}
                        strokeDashoffset={`-${(comparison.summary.improved / comparison.summary.total_parameters) * 251.2}`}
                        className="transition-all duration-1000"
                      />
                      {/* Stable slice */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="20"
                        strokeDasharray={`${(comparison.summary.stable / comparison.summary.total_parameters) * 251.2} 251.2`}
                        strokeDashoffset={`-${((comparison.summary.improved + comparison.summary.worsened) / comparison.summary.total_parameters) * 251.2}`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-gray-900">{comparison.summary.total_parameters}</p>
                        <p className="text-sm text-gray-600 font-semibold">Tests</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="font-bold text-gray-900">Improved</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{comparison.summary.improved}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-2 border-red-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="font-bold text-gray-900">Worsened</span>
                    </div>
                    <span className="text-2xl font-bold text-red-600">{comparison.summary.worsened}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                      <span className="font-bold text-gray-900">Stable</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-600">{comparison.summary.stable}</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart - Comparison Overview */}
              <div className="card animate-slide-in-right bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200">
                <div className="flex items-center mb-6">
                  <Activity className="w-6 h-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-bold gradient-text">Quick Overview</h3>
                </div>

                <div className="space-y-6">
                  {/* Improved Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900 flex items-center">
                        <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                        Improved Parameters
                      </span>
                      <span className="text-lg font-bold text-green-600">{comparison.summary.improved}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-end pr-2 transition-all duration-1000 ease-out"
                        style={{ width: `${(comparison.summary.improved / comparison.summary.total_parameters) * 100}%` }}
                      >
                        {comparison.summary.improved > 0 && (
                          <span className="text-xs font-bold text-white">
                            {Math.round((comparison.summary.improved / comparison.summary.total_parameters) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Worsened Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900 flex items-center">
                        <TrendingDown className="w-4 h-4 text-red-600 mr-2" />
                        Worsened Parameters
                      </span>
                      <span className="text-lg font-bold text-red-600">{comparison.summary.worsened}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-end pr-2 transition-all duration-1000 ease-out"
                        style={{ width: `${(comparison.summary.worsened / comparison.summary.total_parameters) * 100}%` }}
                      >
                        {comparison.summary.worsened > 0 && (
                          <span className="text-xs font-bold text-white">
                            {Math.round((comparison.summary.worsened / comparison.summary.total_parameters) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stable Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900 flex items-center">
                        <Minus className="w-4 h-4 text-gray-600 mr-2" />
                        Stable Parameters
                      </span>
                      <span className="text-lg font-bold text-gray-600">{comparison.summary.stable}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-gray-400 to-slate-400 rounded-full flex items-center justify-end pr-2 transition-all duration-1000 ease-out"
                        style={{ width: `${(comparison.summary.stable / comparison.summary.total_parameters) * 100}%` }}
                      >
                        {comparison.summary.stable > 0 && (
                          <span className="text-xs font-bold text-white">
                            {Math.round((comparison.summary.stable / comparison.summary.total_parameters) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Health Score */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Overall Health Score</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000 ease-out animate-pulse-subtle"
                            style={{ width: `${comparison.summary.health_score}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {comparison.summary.health_score}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Parameter Changes by Category */}
            <div className="space-y-6">
              {/* Improved Parameters */}
              {comparison.comparisons.filter(c => c.trend === 'improved').length > 0 && (
                <div className="card animate-slide-in-right border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
                  <div className="flex items-center mb-6">
                    <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
                    <h2 className="text-2xl font-bold text-green-700">Improved Parameters</h2>
                    <span className="ml-auto text-2xl font-bold text-green-600">
                      {comparison.comparisons.filter(c => c.trend === 'improved').length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {comparison.comparisons
                      .filter(c => c.trend === 'improved')
                      .map((comp, index) => (
                        <div
                          key={index}
                          className="p-4 bg-white rounded-xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg animate-fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{comp.parameter_name}</h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600 font-semibold mb-1">Previous Value</p>
                                  <p className="text-gray-900 font-bold">{comp.old_value} {comp.unit}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 font-semibold mb-1">Current Value</p>
                                  <p className="text-green-700 font-bold text-lg">{comp.new_value} {comp.unit}</p>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center space-x-4">
                                <div className="px-3 py-1 bg-green-100 rounded-full">
                                  <span className="text-sm font-bold text-green-700">
                                    {comp.change > 0 ? '+' : ''}{comp.change} ({comp.change_percentage > 0 ? '+' : ''}{comp.change_percentage}%)
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce-subtle">
                                <TrendingUp className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Worsened Parameters */}
              {comparison.comparisons.filter(c => c.trend === 'worsened').length > 0 && (
                <div className="card animate-slide-in-right border-2 border-red-200 bg-gradient-to-br from-white to-red-50">
                  <div className="flex items-center mb-6">
                    <TrendingDown className="w-6 h-6 text-red-600 mr-3" />
                    <h2 className="text-2xl font-bold text-red-700">Parameters Needing Attention</h2>
                    <span className="ml-auto text-2xl font-bold text-red-600">
                      {comparison.comparisons.filter(c => c.trend === 'worsened').length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {comparison.comparisons
                      .filter(c => c.trend === 'worsened')
                      .map((comp, index) => (
                        <div
                          key={index}
                          className="p-4 bg-white rounded-xl border-2 border-red-200 hover:border-red-400 transition-all duration-300 hover:shadow-lg animate-fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{comp.parameter_name}</h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600 font-semibold mb-1">Previous Value</p>
                                  <p className="text-gray-900 font-bold">{comp.old_value} {comp.unit}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 font-semibold mb-1">Current Value</p>
                                  <p className="text-red-700 font-bold text-lg">{comp.new_value} {comp.unit}</p>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center space-x-4">
                                <div className="px-3 py-1 bg-red-100 rounded-full">
                                  <span className="text-sm font-bold text-red-700">
                                    {comp.change > 0 ? '+' : ''}{comp.change} ({comp.change_percentage > 0 ? '+' : ''}{comp.change_percentage}%)
                                  </span>
                                </div>
                                <div className="px-3 py-1 bg-yellow-100 rounded-full flex items-center space-x-1">
                                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                                  <span className="text-xs font-bold text-yellow-700">Consult Doctor</span>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                                <TrendingDown className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Stable Parameters */}
              {comparison.comparisons.filter(c => c.trend === 'stable').length > 0 && (
                <div className="card animate-slide-in-right border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-center mb-6">
                    <Minus className="w-6 h-6 text-gray-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-700">Stable Parameters</h2>
                    <span className="ml-auto text-2xl font-bold text-gray-600">
                      {comparison.comparisons.filter(c => c.trend === 'stable').length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {comparison.comparisons
                      .filter(c => c.trend === 'stable')
                      .map((comp, index) => (
                        <div
                          key={index}
                          className="p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-lg animate-fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{comp.parameter_name}</h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600 font-semibold mb-1">Previous Value</p>
                                  <p className="text-gray-900 font-bold">{comp.old_value} {comp.unit}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 font-semibold mb-1">Current Value</p>
                                  <p className="text-gray-900 font-bold text-lg">{comp.new_value} {comp.unit}</p>
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="px-3 py-1 bg-gray-100 rounded-full inline-block">
                                  <span className="text-sm font-bold text-gray-700">No significant change</span>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
                                <Minus className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Report Summary Section */}
            <div className="card animate-slide-in-left border-2 border-indigo-200">
              <div className="flex items-center mb-6">
                <FileText className="w-6 h-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold gradient-text">Comparison Summary</h2>
              </div>

              <div className="space-y-6">
                {/* Report Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Older Report</p>
                    <p className="text-lg font-bold text-gray-900">{comparison.old_report.file_name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Date: {new Date(comparison.old_report.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Latest Report</p>
                    <p className="text-lg font-bold text-gray-900">{comparison.new_report.file_name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Date: {new Date(comparison.new_report.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-purple-600 mr-2" />
                    Key Insights
                  </h3>
                  <div className="space-y-3">
                    {comparison.summary.improved > 0 && (
                      <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-green-200">
                        <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {comparison.summary.improved} parameter{comparison.summary.improved > 1 ? 's' : ''} improved
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {((comparison.summary.improved / comparison.summary.total_parameters) * 100).toFixed(1)}% of your health markers show positive changes
                          </p>
                        </div>
                      </div>
                    )}

                    {comparison.summary.worsened > 0 && (
                      <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-red-200">
                        <TrendingDown className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {comparison.summary.worsened} parameter{comparison.summary.worsened > 1 ? 's' : ''} need attention
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Consider discussing these changes with your healthcare provider
                          </p>
                        </div>
                      </div>
                    )}

                    {comparison.summary.stable > 0 && (
                      <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                        <Minus className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {comparison.summary.stable} parameter{comparison.summary.stable > 1 ? 's' : ''} remained stable
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            These markers show consistent values between reports
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Overall Assessment */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 text-blue-600 mr-2" />
                    Overall Assessment
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Health Progress Score</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                            <div
                              className={`h-full rounded-full flex items-center justify-center text-xs font-bold text-white transition-all duration-1000 ${
                                comparison.summary.health_score >= 70
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                  : comparison.summary.health_score >= 50
                                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                  : 'bg-gradient-to-r from-red-500 to-rose-500'
                              }`}
                              style={{ width: `${comparison.summary.health_score}%` }}
                            >
                              {comparison.summary.health_score >= 20 && `${comparison.summary.health_score}%`}
                            </div>
                          </div>
                        </div>
                        <span className={`text-3xl font-bold ${
                          comparison.summary.health_score >= 70
                            ? 'text-green-600'
                            : comparison.summary.health_score >= 50
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {comparison.summary.health_score}%
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-blue-200">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {comparison.summary.health_score >= 70 ? (
                          <span className="font-bold text-green-700">
                            Your health markers are showing positive trends! Continue maintaining your current lifestyle and health practices.
                          </span>
                        ) : comparison.summary.health_score >= 50 ? (
                          <span className="font-bold text-yellow-700">
                            Your health markers show mixed results. Consider reviewing the parameters that need attention with your healthcare provider.
                          </span>
                        ) : (
                          <span className="font-bold text-red-700">
                            Several health markers require attention. We recommend consulting with your healthcare provider to discuss these changes.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Medical Disclaimer */}
                <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-yellow-900 mb-1">Important Medical Disclaimer</p>
                      <p className="text-xs text-yellow-800 leading-relaxed">
                        This comparison is for informational purposes only and should not replace professional medical advice.
                        Always consult with your healthcare provider to interpret your medical test results and discuss any concerns or treatment plans.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Compare;
