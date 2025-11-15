/**
 * Dashboard Page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { analysisAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FileText, Upload, TrendingUp, Activity, AlertCircle, Heart, Brain, CheckCircle, XCircle, Clock, BarChart3, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMetric, setSelectedMetric] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await analysisAPI.getUserReports();
      setReports(data.reports || []);
    } catch (err) {
      setError('Failed to fetch reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall progress metrics
  const calculateProgress = () => {
    if (reports.length === 0) return null;

    const totalParams = reports.reduce((sum, r) => sum + (r.parameters_count || 0), 0);
    const avgParamsPerReport = reports.length > 0 ? Math.round(totalParams / reports.length) : 0;

    // Sort reports by date
    const sortedReports = [...reports].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const latestReport = sortedReports[0];
    const oldestReport = sortedReports[sortedReports.length - 1];

    // Calculate days tracking
    const daysTracking = reports.length > 1
      ? Math.round((new Date(latestReport.created_at) - new Date(oldestReport.created_at)) / (1000 * 60 * 60 * 24))
      : 0;

    // Health score (simplified - based on having recent data)
    const daysSinceLastReport = Math.round((new Date() - new Date(latestReport.created_at)) / (1000 * 60 * 60 * 24));
    const healthScore = daysSinceLastReport <= 30 ? 'Excellent' : daysSinceLastReport <= 90 ? 'Good' : 'Needs Attention';
    const healthColor = daysSinceLastReport <= 30 ? 'text-green-600' : daysSinceLastReport <= 90 ? 'text-yellow-600' : 'text-red-600';
    const healthBgColor = daysSinceLastReport <= 30 ? 'bg-green-100' : daysSinceLastReport <= 90 ? 'bg-yellow-100' : 'bg-red-100';

    return {
      totalParams,
      avgParamsPerReport,
      daysTracking,
      daysSinceLastReport,
      healthScore,
      healthColor,
      healthBgColor,
      latestReportDate: new Date(latestReport.created_at).toLocaleDateString(),
    };
  };

  const progress = calculateProgress();

  // Render detailed metric modal
  const renderMetricModal = () => {
    if (!selectedMetric || !progress) return null;

    const sortedReports = [...reports].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMetric(null)}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">{selectedMetric}</h3>
              <button onClick={() => setSelectedMetric(null)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-300">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {selectedMetric === 'Avg Parameters/Report' && (
              <div className="space-y-4">
                <p className="text-gray-600 font-medium mb-6">Breakdown of parameters extracted from each report:</p>
                <div className="space-y-3">
                  {sortedReports.map((report, index) => (
                    <div key={report.report_id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 cursor-pointer" onClick={() => navigate(`/report/${report.report_id}`)}>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">{index + 1}</div>
                        <div>
                          <p className="font-bold text-gray-900 truncate max-w-xs">{report.file_name}</p>
                          <p className="text-sm text-gray-600">{new Date(report.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="bg-white px-4 py-2 rounded-lg border-2 border-purple-300">
                        <span className="text-2xl font-bold text-purple-600">{report.parameters_count}</span>
                        <span className="text-sm text-gray-600 ml-1">params</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedMetric === 'Days Tracking' && (
              <div className="space-y-4">
                <p className="text-gray-600 font-medium mb-6">Timeline of your report uploads:</p>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 to-green-600"></div>
                  <div className="space-y-6 ml-12">
                    {sortedReports.map((report, index) => (
                      <div key={report.report_id} className="relative">
                        <div className="absolute -left-[3.25rem] w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm border-4 border-white shadow-lg">
                          {sortedReports.length - index}
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 cursor-pointer" onClick={() => navigate(`/report/${report.report_id}`)}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-gray-900">{report.file_name}</p>
                              <p className="text-sm text-gray-600 mt-1">{report.parameters_count} parameters extracted</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-green-600">{new Date(report.created_at).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">{new Date(report.created_at).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedMetric === 'Days Since Last Report' && sortedReports[0] && (
              <div className="space-y-4">
                <p className="text-gray-600 font-medium mb-6">Details of your most recent report:</p>
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border-2 border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <FileText className="w-12 h-12 text-orange-600" />
                    <span className={`px-4 py-2 rounded-full font-bold ${progress.daysSinceLastReport <= 30 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {progress.daysSinceLastReport} days ago
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{sortedReports[0].file_name}</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Upload Date</p>
                      <p className="font-bold text-gray-900">{new Date(sortedReports[0].created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Parameters</p>
                      <p className="font-bold text-gray-900">{sortedReports[0].parameters_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Report Type</p>
                      <p className="font-bold text-gray-900 capitalize">{sortedReports[0].report_type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-bold text-gray-900">{new Date(sortedReports[0].created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/report/${sortedReports[0].report_id}`)} className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                    View Full Report
                  </button>
                </div>
              </div>
            )}

            {selectedMetric === 'Total Data Points' && (
              <div className="space-y-4">
                <p className="text-gray-600 font-medium mb-6">All health markers tracked across your reports:</p>
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl border-2 border-pink-200 mb-4">
                  <div className="text-center">
                    <p className="text-6xl font-bold text-pink-600 mb-2">{progress.totalParams}</p>
                    <p className="text-gray-700 font-semibold">Total Parameters Tracked</p>
                    <p className="text-sm text-gray-600 mt-2">Across {reports.length} reports</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {sortedReports.map((report, index) => (
                    <div key={report.report_id} className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-pink-200 hover:border-pink-400 transition-all duration-300 cursor-pointer" onClick={() => navigate(`/report/${report.report_id}`)}>
                      <div>
                        <p className="font-bold text-gray-900">{report.file_name}</p>
                        <p className="text-sm text-gray-600">{new Date(report.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full" style={{ width: `${(report.parameters_count / Math.max(...reports.map(r => r.parameters_count))) * 100}%` }}></div>
                        </div>
                        <span className="text-lg font-bold text-pink-600">{report.parameters_count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const stats = [
    {
      name: 'Total Reports',
      value: reports.length,
      icon: FileText,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Processed',
      value: reports.filter((r) => r.parameters_count > 0).length,
      icon: Activity,
      color: 'bg-green-100 text-green-600',
    },
    {
      name: 'Parameters Tracked',
      value: reports.reduce((sum, r) => sum + (r.parameters_count || 0), 0),
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ''}! 👋
          </h1>
          <p className="text-gray-700 text-lg font-medium">Here's an overview of your medical reports</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.name}
              className="card-hover animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${stat.color} shadow-lg transform transition-transform duration-300 hover:scale-110`}>
                  <stat.icon className="w-8 h-8" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Progress Analysis */}
        {progress && (
          <div className="card mb-8 animate-fade-in bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text flex items-center">
                <BarChart3 className="w-7 h-7 mr-3 text-blue-600" />
                Overall Health Progress
              </h2>
              <div className={`px-4 py-2 rounded-full ${progress.healthBgColor} border-2 border-current`}>
                <span className={`font-bold ${progress.healthColor} flex items-center`}>
                  {progress.healthScore === 'Excellent' && <CheckCircle className="w-5 h-5 mr-2" />}
                  {progress.healthScore === 'Good' && <Clock className="w-5 h-5 mr-2" />}
                  {progress.healthScore === 'Needs Attention' && <XCircle className="w-5 h-5 mr-2" />}
                  {progress.healthScore}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Average Parameters */}
              <div
                onClick={() => setSelectedMetric('Avg Parameters/Report')}
                className="bg-white p-5 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <Brain className="w-8 h-8 text-purple-600" />
                  <span className="text-3xl font-bold text-purple-600">{progress.avgParamsPerReport}</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">Avg Parameters/Report</p>
                <p className="text-xs text-gray-500 mt-1">Comprehensive tracking</p>
              </div>

              {/* Days Tracking */}
              <div
                onClick={() => setSelectedMetric('Days Tracking')}
                className="bg-white p-5 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <Clock className="w-8 h-8 text-green-600" />
                  <span className="text-3xl font-bold text-green-600">{progress.daysTracking}</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">Days Tracking</p>
                <p className="text-xs text-gray-500 mt-1">Your health journey</p>
              </div>

              {/* Last Report */}
              <div
                onClick={() => setSelectedMetric('Days Since Last Report')}
                className="bg-white p-5 rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <Activity className="w-8 h-8 text-orange-600" />
                  <span className="text-3xl font-bold text-orange-600">{progress.daysSinceLastReport}</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">Days Since Last Report</p>
                <p className="text-xs text-gray-500 mt-1">{progress.latestReportDate}</p>
              </div>

              {/* Health Monitoring */}
              <div
                onClick={() => setSelectedMetric('Total Data Points')}
                className="bg-white p-5 rounded-xl border-2 border-pink-200 hover:border-pink-400 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <Heart className="w-8 h-8 text-pink-600" />
                  <span className="text-3xl font-bold text-pink-600">{progress.totalParams}</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">Total Data Points</p>
                <p className="text-xs text-gray-500 mt-1">Health markers tracked</p>
              </div>
            </div>

            {/* Progress Insights */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-300">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Health Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {reports.length > 1 ? 'Great consistency!' : 'Good start!'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {reports.length > 1
                        ? `You've uploaded ${reports.length} reports. Keep tracking for better insights.`
                        : 'Upload more reports to track your health trends over time.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  {progress.daysSinceLastReport <= 30 ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {progress.daysSinceLastReport <= 30 ? 'Up to date!' : 'Time for a check-up?'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {progress.daysSinceLastReport <= 30
                        ? 'Your health monitoring is current. Keep it up!'
                        : 'Consider uploading a recent report for better health tracking.'}
                    </p>
                  </div>
                </div>

                {reports.length >= 2 && (
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Compare Reports</p>
                      <p className="text-xs text-gray-600">
                        Use the compare feature to track changes in your health parameters.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <Brain className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Comprehensive Analysis</p>
                    <p className="text-xs text-gray-600">
                      Tracking {progress.avgParamsPerReport} parameters per report on average.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card mb-8 animate-slide-in-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/upload')}
              className="group flex items-center space-x-3 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transform hover:-translate-y-1"
            >
              <div className="p-3 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Upload New Report</p>
                <p className="text-sm text-gray-600">Add a new medical report</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="group flex items-center space-x-3 p-6 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all duration-300 border-2 border-green-200 hover:border-green-400 hover:shadow-lg transform hover:-translate-y-1"
            >
              <div className="p-3 bg-green-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">View All Reports</p>
                <p className="text-sm text-gray-600">Browse your reports</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/compare')}
              className="group flex items-center space-x-3 p-6 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl transition-all duration-300 border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              disabled={reports.length < 2}
            >
              <div className="p-3 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Compare Reports</p>
                <p className="text-sm text-gray-600">Track your progress</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card animate-slide-in-right">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Reports</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="relative mx-auto w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-gray-700 font-medium mt-6">Loading reports...</p>
            </div>
          ) : error ? (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-xl p-4 flex items-start shadow-md">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5 animate-pulse" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-6 animate-bounce-subtle">
                <FileText className="w-20 h-20 text-blue-600" />
              </div>
              <p className="text-gray-700 text-lg font-medium mb-6">No reports uploaded yet</p>
              <button onClick={() => navigate('/upload')} className="btn-primary">
                Upload Your First Report
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parameters
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.slice(0, 5).map((report, index) => (
                    <tr
                      key={report.report_id}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {report.file_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="badge-info">{report.report_type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="badge-success">{report.parameters_count} values</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => navigate(`/report/${report.report_id}`)}
                          className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all duration-300 transform inline-block hover:scale-110"
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Metric Detail Modal */}
      {renderMetricModal()}
    </div>
  );
};

export default Dashboard;
