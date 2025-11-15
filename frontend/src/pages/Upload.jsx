/**
 * Upload Report Page
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, Loader, Sparkles } from 'lucide-react';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [reportType, setReportType] = useState('blood_test');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Please upload PDF or image files.');
        return;
      }

      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit.');
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      // Always use AI parsing
      const data = await analysisAPI.processReportWithGemini(file, reportType);

      setResult(data);
      setSuccess(true);

      // Redirect to report details after 2 seconds
      setTimeout(() => {
        navigate(`/report/${data.report_id}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload and process report');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold gradient-text">Upload Medical Report</h1>
          <p className="text-gray-700 text-lg font-medium mt-2">Upload your report for AI-powered analysis and tracking</p>
        </div>

        {/* Upload Form */}
        <div className="card animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {success && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 flex items-start shadow-md animate-slide-in-left">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5 animate-bounce-subtle" />
                <div>
                  <p className="text-sm font-bold text-green-700">Report uploaded successfully!</p>
                  <p className="text-sm text-green-600 mt-1 font-medium">
                    Extracted {result?.statistics?.total_tests || result?.extracted_parameters} tests with AI (FREE!). Redirecting...
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-xl p-4 flex items-start shadow-md animate-slide-in-left">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5 animate-pulse" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Report Type Selection */}
            <div>
              <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="input-field"
                disabled={uploading}
              >
                <option value="blood_test">Blood Test</option>
                <option value="urine_test">Urine Test</option>
                <option value="xray">X-Ray</option>
                <option value="mri">MRI</option>
                <option value="ct_scan">CT Scan</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  file
                    ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                    : 'border-blue-300 hover:border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg'
                }`}
              >
                {file ? (
                  <div className="space-y-4 animate-scale-in">
                    <FileText className="w-16 h-16 text-green-600 mx-auto animate-bounce-subtle" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-sm text-red-600 hover:text-red-700 font-bold hover:underline transition-all duration-300 transform hover:scale-110"
                      disabled={uploading}
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <UploadIcon className="w-16 h-16 text-blue-500 mx-auto animate-pulse-subtle" />
                    <div>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all duration-300">
                          Choose a file
                        </span>
                        <span className="text-gray-700 font-medium"> or drag and drop</span>
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">PDF, PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={!file || uploading || success}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>AI Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Analyze with AI</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 animate-slide-in-right">
          <h3 className="text-lg font-bold gradient-text mb-4">How it works</h3>
          <ul className="text-sm text-gray-700 space-y-3 font-medium">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Upload your medical report (PDF or image format)</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Our FREE AI (Google Gemini) extracts structured data with 95-98% accuracy</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>View extracted parameters and track changes over time</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Compare with previous reports to monitor health progress</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Upload;
