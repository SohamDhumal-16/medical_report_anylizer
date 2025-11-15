/**
 * Report Details Page
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FileText, Calendar, Activity, TrendingUp, AlertCircle, Loader, ArrowLeft, Info } from 'lucide-react';

// Medical parameter descriptions database (same as Compare page)
const parameterInfo = {
  // Liver Function Tests
  'GGTP FCC': {
    name: 'Gamma-Glutamyl Transferase (GGT)',
    description: 'An enzyme found primarily in the liver. Elevated levels may indicate liver disease, bile duct problems, or alcohol consumption.',
    normalRange: '0-55 U/L',
    highMeans: 'Possible liver damage, bile duct obstruction, or excessive alcohol use',
    lowMeans: 'Generally not concerning'
  },
  'ALT (SGPT) IFCC without PSP': {
    name: 'Alanine Aminotransferase (ALT)',
    description: 'An enzyme found mainly in the liver. High levels indicate liver damage or inflammation.',
    normalRange: '7-56 U/L',
    highMeans: 'Liver damage, hepatitis, fatty liver disease',
    lowMeans: 'Generally not concerning'
  },
  'AST (SGOT) IFCC without P5P': {
    name: 'Aspartate Aminotransferase (AST)',
    description: 'An enzyme found in liver and heart. Elevated levels suggest liver or heart damage.',
    normalRange: '10-40 U/L',
    highMeans: 'Liver damage, heart problems, or muscle injury',
    lowMeans: 'Generally not concerning'
  },
  'Bilirubin Direct OPD': {
    name: 'Direct Bilirubin',
    description: 'A breakdown product of red blood cells processed by the liver. High levels indicate liver or bile duct problems.',
    normalRange: '0-0.3 mg/dL',
    highMeans: 'Liver disease or bile duct obstruction',
    lowMeans: 'Generally not concerning'
  },
  'AST : ALT Ratio': {
    name: 'AST to ALT Ratio',
    description: 'Ratio of two liver enzymes used to help diagnose the cause of liver problems.',
    normalRange: '<1.0 (ratio)',
    highMeans: 'May indicate alcohol-related liver disease or cirrhosis',
    lowMeans: 'May indicate viral hepatitis or fatty liver disease'
  },
  'Alkaline Phosphatase (ALP) FCC-AMP': {
    name: 'Alkaline Phosphatase (ALP)',
    description: 'An enzyme found in liver, bones, and bile ducts. Elevated levels may indicate liver or bone problems.',
    normalRange: '44-147 U/L',
    highMeans: 'Liver disease, bile duct obstruction, or bone disorders',
    lowMeans: 'Malnutrition or zinc deficiency'
  },
  'Total Protein': {
    name: 'Total Protein',
    description: 'Measures all proteins in blood. Helps assess nutritional status, liver and kidney function.',
    normalRange: '6.0-8.3 g/dL',
    highMeans: 'Dehydration, chronic inflammation, or multiple myeloma',
    lowMeans: 'Malnutrition, liver disease, or kidney disease'
  },
  // Complete Blood Count
  'Hemoglobin': {
    name: 'Hemoglobin (Hgb)',
    description: 'Protein in red blood cells that carries oxygen throughout the body.',
    normalRange: 'Male: 13.5-17.5 g/dL, Female: 12.0-15.5 g/dL',
    highMeans: 'Dehydration, lung disease, or polycythemia',
    lowMeans: 'Anemia, blood loss, or nutritional deficiency'
  },
  'RBC': {
    name: 'Red Blood Cell Count',
    description: 'Number of red blood cells that carry oxygen throughout the body.',
    normalRange: 'Male: 4.5-5.9 M/μL, Female: 4.1-5.1 M/μL',
    highMeans: 'Dehydration, lung disease, or bone marrow disorders',
    lowMeans: 'Anemia, blood loss, or bone marrow problems'
  },
  'WBC': {
    name: 'White Blood Cell Count',
    description: 'Measures immune system cells that fight infection.',
    normalRange: '4,000-11,000 cells/μL',
    highMeans: 'Infection, inflammation, or leukemia',
    lowMeans: 'Weak immune system, bone marrow disorders, or autoimmune disease'
  },
  'Platelets': {
    name: 'Platelet Count',
    description: 'Cell fragments that help blood clot and stop bleeding.',
    normalRange: '150,000-400,000/μL',
    highMeans: 'Blood clotting disorders or bone marrow disease',
    lowMeans: 'Risk of bleeding, autoimmune disease, or medication side effects'
  },
  // Lipid Profile
  'Total Cholesterol': {
    name: 'Total Cholesterol',
    description: 'Measures all cholesterol in blood. High levels increase heart disease risk.',
    normalRange: '<200 mg/dL (desirable)',
    highMeans: 'Increased risk of heart disease and stroke',
    lowMeans: 'Generally healthy, but very low may indicate malnutrition'
  },
  'HDL': {
    name: 'HDL Cholesterol (Good Cholesterol)',
    description: 'High-density lipoprotein removes bad cholesterol from arteries.',
    normalRange: '>40 mg/dL (men), >50 mg/dL (women)',
    highMeans: 'Lower risk of heart disease',
    lowMeans: 'Increased risk of heart disease'
  },
  'LDL': {
    name: 'LDL Cholesterol (Bad Cholesterol)',
    description: 'Low-density lipoprotein can build up in arteries and increase heart disease risk.',
    normalRange: '<100 mg/dL (optimal)',
    highMeans: 'Increased risk of heart disease and stroke',
    lowMeans: 'Lower risk of heart disease'
  },
  'Triglycerides': {
    name: 'Triglycerides',
    description: 'Type of fat in blood. High levels increase heart disease risk.',
    normalRange: '<150 mg/dL',
    highMeans: 'Risk of heart disease, pancreatitis, fatty liver',
    lowMeans: 'Generally healthy'
  },
  // Kidney Function
  'Creatinine': {
    name: 'Creatinine',
    description: 'Waste product from muscle metabolism. Measures kidney function.',
    normalRange: 'Male: 0.7-1.3 mg/dL, Female: 0.6-1.1 mg/dL',
    highMeans: 'Kidney disease or dehydration',
    lowMeans: 'Low muscle mass or pregnancy'
  },
  'BUN': {
    name: 'Blood Urea Nitrogen',
    description: 'Waste product filtered by kidneys. Measures kidney function.',
    normalRange: '7-20 mg/dL',
    highMeans: 'Kidney disease, dehydration, or high protein diet',
    lowMeans: 'Liver disease or malnutrition'
  },
  // Thyroid
  'TSH': {
    name: 'Thyroid Stimulating Hormone',
    description: 'Controls thyroid hormone production. Key test for thyroid function.',
    normalRange: '0.4-4.0 mIU/L',
    highMeans: 'Underactive thyroid (hypothyroidism)',
    lowMeans: 'Overactive thyroid (hyperthyroidism)'
  },
  'T3': {
    name: 'Triiodothyronine',
    description: 'Active thyroid hormone that regulates metabolism.',
    normalRange: '80-200 ng/dL',
    highMeans: 'Overactive thyroid',
    lowMeans: 'Underactive thyroid'
  },
  'T4': {
    name: 'Thyroxine',
    description: 'Main thyroid hormone that regulates metabolism.',
    normalRange: '5-12 μg/dL',
    highMeans: 'Overactive thyroid',
    lowMeans: 'Underactive thyroid'
  },
  // Diabetes
  'Glucose': {
    name: 'Blood Glucose (Sugar)',
    description: 'Measures blood sugar level. High levels indicate diabetes risk.',
    normalRange: 'Fasting: 70-100 mg/dL',
    highMeans: 'Diabetes or prediabetes',
    lowMeans: 'Hypoglycemia (low blood sugar)'
  },
  'HbA1c': {
    name: 'Hemoglobin A1c',
    description: 'Average blood sugar over past 2-3 months. Key test for diabetes management.',
    normalRange: '<5.7%',
    highMeans: 'Diabetes or poor diabetes control',
    lowMeans: 'Good blood sugar control'
  }
};

// Function to get parameter info with fuzzy matching
const getParameterInfo = (paramName) => {
  if (parameterInfo[paramName]) {
    return parameterInfo[paramName];
  }
  const searchTerms = paramName.toLowerCase();
  for (const [key, value] of Object.entries(parameterInfo)) {
    if (searchTerms.includes(key.toLowerCase().split(' ')[0]) ||
        key.toLowerCase().includes(searchTerms.split(' ')[0])) {
      return value;
    }
  }
  return {
    name: paramName,
    description: 'This is a medical test parameter. Consult your doctor for specific interpretation.',
    normalRange: 'Varies by lab and individual factors',
    highMeans: 'Consult your healthcare provider',
    lowMeans: 'Consult your healthcare provider'
  };
};

const ReportDetails = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const fetchReport = async () => {
    try {
      console.log('[ReportDetails] Fetching report:', reportId);
      const data = await analysisAPI.getReportAnalysis(reportId);
      console.log('[ReportDetails] Received data:', data);
      console.log('[ReportDetails] Medical values:', data.medical_values);
      setReport(data);
    } catch (err) {
      console.error('[ReportDetails] Error fetching report:', err);
      console.error('[ReportDetails] Error details:', err.response?.data);
      setError('Failed to fetch report details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-600 font-medium">{error || 'Report not found'}</p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                >
                  Go back to dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Report Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{report.file_name}</h1>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(report.report_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Activity className="w-4 h-4" />
                    <span className="capitalize">{report.report_type.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>
            {report.processed && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Processed
              </span>
            )}
          </div>
        </div>

        {/* Medical Values */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Extracted Medical Values</h2>
            <span className="text-sm text-gray-600">{report.medical_values?.length || 0} parameters</span>
          </div>

          {!report.medical_values || report.medical_values.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No medical values extracted from this report</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parameter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.medical_values.map((value, index) => {
                    const info = getParameterInfo(value.name);
                    return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 relative group">
                        <div className="flex items-center space-x-2">
                          <span>{value.name}</span>
                          <Info className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Hover Tooltip */}
                        <div className="absolute left-0 top-full mt-2 w-80 max-w-md bg-white border-2 border-blue-300 rounded-xl shadow-2xl p-4 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 overflow-hidden">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-bold text-blue-700 text-sm mb-1 break-words overflow-wrap-anywhere">{info.name}</h4>
                              <p className="text-xs text-gray-700 leading-relaxed break-words overflow-wrap-anywhere whitespace-normal">{info.description}</p>
                            </div>

                            <div className="pt-2 border-t border-blue-200">
                              <p className="text-xs font-semibold text-gray-600 mb-1">Normal Range:</p>
                              <p className="text-xs text-green-700 font-medium break-words overflow-wrap-anywhere whitespace-normal">{info.normalRange}</p>
                            </div>

                            <div className="pt-2 border-t border-blue-200 space-y-2">
                              <div>
                                <p className="text-xs font-semibold text-red-600 mb-1">High Levels:</p>
                                <p className="text-xs text-gray-700 leading-snug break-words overflow-wrap-anywhere whitespace-normal">{info.highMeans}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-blue-600 mb-1">Low Levels:</p>
                                <p className="text-xs text-gray-700 leading-snug break-words overflow-wrap-anywhere whitespace-normal">{info.lowMeans}</p>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-blue-200">
                              <p className="text-xs text-gray-500 italic break-words overflow-wrap-anywhere whitespace-normal">⚠️ Always consult your healthcare provider for medical interpretation</p>
                            </div>
                          </div>

                          {/* Tooltip Arrow */}
                          <div className="absolute -top-2 left-8 w-4 h-4 bg-white border-t-2 border-l-2 border-blue-300 transform rotate-45"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {value.value !== null ? value.value : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {value.unit || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {value.reference_range || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {value.status ? (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              value.status === 'normal'
                                ? 'bg-green-100 text-green-700'
                                : value.status === 'high'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {value.status}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => {
              // Navigate to upload page with re-analyze mode
              navigate('/upload', {
                state: {
                  reanalyze: true,
                  reportId: report.id,
                  fileName: report.file_name
                }
              });
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <Activity className="w-5 h-5" />
            <span>Re-analyze Report</span>
          </button>
          <button
            onClick={() => navigate('/compare')}
            className="btn-primary flex items-center space-x-2"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Compare with Other Reports</span>
          </button>
          <button onClick={() => navigate('/reports')} className="btn-secondary">
            View All Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
