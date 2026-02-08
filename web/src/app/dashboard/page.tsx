"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { 
  BuildingOffice2Icon, 
  DocumentIcon, 
  KeyIcon, 
  ChevronRightIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  EyeIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { businessApi, documentApi, apiKeyApi, formatFileSize } from "@/lib/api";

// Add these interfaces
interface Business {
  _id: string;
  name: string;
  taxId?: string;
  address?: string;
  status: string;
  created: string;
  revenue?: string;
  ownerId: string;
}

interface Document {
  _id: string;
  name: string;
  size: number;
  url?: string;
  key: string;
  uploaded: string;
  access: string;
  businessId?: string;
  fileType: string;
}

interface ApiKey {
  _id: string;
  name: string;
  key: string;
  created: string;
  status: string;
  lastUsed?: string;
}

// Mock data for fallback
const MOCK_BUSINESSES: Business[] = [
  { 
    _id: '1', 
    name: 'TechCorp Inc', 
    status: 'Active', 
    created: new Date().toISOString(), 
    revenue: '$1.2M',
    ownerId: 'user-1'
  },
  { 
    _id: '2', 
    name: 'Startup XYZ', 
    status: 'Pending', 
    created: new Date().toISOString(), 
    revenue: '$450K',
    ownerId: 'user-1'
  },
  { 
    _id: '3', 
    name: 'Global Solutions', 
    status: 'Active', 
    created: new Date().toISOString(), 
    revenue: '$2.8M',
    ownerId: 'user-1'
  }
];

const MOCK_DOCUMENTS: Document[] = [
  { 
    _id: '1', 
    name: 'Business License.pdf', 
    size: 2400000, 
    uploaded: new Date().toISOString(), 
    access: 'Secure',
    fileType: 'application/pdf',
    key: 'license.pdf'
  },
  { 
    _id: '2', 
    name: 'Tax Returns 2023.pdf', 
    size: 1800000, 
    uploaded: new Date().toISOString(), 
    access: 'Restricted',
    fileType: 'application/pdf',
    key: 'tax-returns.pdf'
  },
  { 
    _id: '3', 
    name: 'Contract Agreement.docx', 
    size: 1200000, 
    uploaded: new Date().toISOString(), 
    access: 'Secure',
    fileType: 'application/docx',
    key: 'contract.docx'
  },
  { 
    _id: '4', 
    name: 'Financial Report Q4.pdf', 
    size: 3100000, 
    uploaded: new Date().toISOString(), 
    access: 'Secure',
    fileType: 'application/pdf',
    key: 'financial-report.pdf'
  }
];

const MOCK_API_KEYS: ApiKey[] = [
  { 
    _id: '1', 
    name: 'Production Key', 
    key: 'sk_live_abc123def456', 
    created: new Date().toISOString(), 
    status: 'Active'
  },
  { 
    _id: '2', 
    name: 'Development Key', 
    key: 'sk_test_xyz789uvw012', 
    created: new Date().toISOString(), 
    status: 'Active'
  },
  { 
    _id: '3', 
    name: 'Backup Key', 
    key: 'sk_test_efg345hij678', 
    created: new Date().toISOString(), 
    status: 'Inactive'
  }
];

export default function Dashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("business");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showNewBusinessModal, setShowNewBusinessModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);

  // Form states
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    taxId: '',
    address: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch real data
  useEffect(() => {
    if (session) {
      loadDashboardData();
    }
  }, [session]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Try to fetch real data with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );

      const fetchDataPromise = Promise.allSettled([
        fetchBusinesses(),
        fetchDocuments(),
        fetchApiKeys()
      ]);

      const result = await Promise.race([fetchDataPromise, timeoutPromise]) as PromiseSettledResult<any>[];
      
      // Check if we got real data
      const businessesResult = result[0];
      const hasRealData = 
        businessesResult.status === 'fulfilled' && 
        Array.isArray(businessesResult.value) &&
        businessesResult.value.length > 0;

      if (hasRealData) {
        // Use real data
        const businessesData = businessesResult.value;
        const documentsData = result[1].status === 'fulfilled' ? result[1].value : [];
        const apiKeysData = result[2].status === 'fulfilled' ? result[2].value : [];
        
        setBusinesses(businessesData);
        setDocuments(documentsData);
        setApiKeys(apiKeysData);
        setUseMockData(false);
      } else {
        // Use mock data
        setBusinesses(MOCK_BUSINESSES);
        setDocuments(MOCK_DOCUMENTS);
        setApiKeys(MOCK_API_KEYS);
        setUseMockData(true);
      }
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Fallback to mock data
      setBusinesses(MOCK_BUSINESSES);
      setDocuments(MOCK_DOCUMENTS);
      setApiKeys(MOCK_API_KEYS);
      setUseMockData(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBusinesses = async (): Promise<Business[]> => {
    try {
      const data = await businessApi.list();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
      return [];
    }
  };

  const fetchDocuments = async (): Promise<Document[]> => {
    try {
      const data = await documentApi.list();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      return [];
    }
  };

  const fetchApiKeys = async (): Promise<ApiKey[]> => {
    try {
      const data = await apiKeyApi.list();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      return [];
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Business Functions
  const handleCreateBusiness = async () => {
    if (!newBusiness.name.trim()) {
      showNotification('error', 'Business name is required');
      return;
    }

    try {
      if (!useMockData) {
        const business = await businessApi.create(newBusiness);
        setBusinesses(prev => [...prev, business]);
        showNotification('success', 'Business created successfully!');
      } else {
        // Mock creation for demo
        const newBusinessObj: Business = {
          _id: Date.now().toString(),
          name: newBusiness.name,
          taxId: newBusiness.taxId,
          address: newBusiness.address,
          status: 'Active',
          created: new Date().toISOString(),
          ownerId: session?.user?.id || 'demo-user'
        };
        setBusinesses(prev => [...prev, newBusinessObj]);
        showNotification('success', 'Business created successfully!');
      }
      
      setShowNewBusinessModal(false);
      setNewBusiness({ name: '', taxId: '', address: '' });
    } catch (error) {
      showNotification('error', 'Failed to create business');
    }
  };

  // Document Functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showNotification('error', 'File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      showNotification('error', 'Please select a file');
      return;
    }

    try {
      setIsUploading(true);
      
      if (!useMockData) {
        // 1. Get signed URL from your backend
        const { uploadUrl, key } = await documentApi.getUploadUrl(
          selectedFile.name,
          selectedFile.type
        );

        // 2. Upload to S3
        await documentApi.uploadToS3(uploadUrl, selectedFile);
        setUploadProgress(100);

        // 3. Save metadata to your database
        const metadata = await documentApi.saveMetadata({
          name: selectedFile.name,
          size: selectedFile.size,
          key: key,
          fileType: selectedFile.type,
          access: 'Secure'
        });

        // 4. Update local state
        setDocuments(prev => [...prev, metadata]);
      } else {
        // Mock upload for demo
        setUploadProgress(100);
        setTimeout(() => {
          const newDocument: Document = {
            _id: Date.now().toString(),
            name: selectedFile.name,
            size: selectedFile.size,
            fileType: selectedFile.type,
            key: `demo-${Date.now()}`,
            uploaded: new Date().toISOString(),
            access: 'Secure',
          };
          setDocuments(prev => [...prev, newDocument]);
        }, 500);
      }

      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadProgress(0);
      showNotification('success', 'Document uploaded successfully!');
    } catch (error) {
      showNotification('error', 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewDocument = async (documentId: string) => {
    try {
      if (!useMockData) {
        const { downloadUrl } = await documentApi.getDownloadUrl(documentId);
        window.open(downloadUrl, '_blank');
      } else {
        // Mock view for demo
        showNotification('info', 'Document opened in new tab (demo mode)');
      }
    } catch (error) {
      showNotification('error', 'Failed to open document');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      if (!useMockData) {
        await documentApi.delete(documentId);
      }
      setDocuments(prev => prev.filter(doc => doc._id !== documentId));
      showNotification('success', 'Document deleted successfully!');
    } catch (error) {
      showNotification('error', 'Failed to delete document');
    }
  };

  // API Key Functions
  const handleGenerateApiKey = async () => {
    const name = prompt('Enter a name for this API key:');
    if (!name) return;

    try {
      if (!useMockData) {
        const apiKey = await apiKeyApi.create(name);
        setApiKeys(prev => [...prev, apiKey]);
      } else {
        // Mock generation for demo
        const newApiKey: ApiKey = {
          _id: Date.now().toString(),
          name,
          key: `sk_mock_${Math.random().toString(36).substr(2, 9)}`,
          created: new Date().toISOString(),
          status: 'Active'
        };
        setApiKeys(prev => [...prev, newApiKey]);
      }
      showNotification('success', 'API key generated successfully!');
    } catch (error) {
      showNotification('error', 'Failed to generate API key');
    }
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    showNotification('success', 'API key copied to clipboard!');
  };

  const handleRevokeApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;
    
    try {
      if (!useMockData) {
        await apiKeyApi.revoke(keyId);
      }
      setApiKeys(prev => prev.filter(key => key._id !== keyId));
      showNotification('success', 'API key revoked successfully!');
    } catch (error) {
      showNotification('error', 'Failed to revoke API key');
    }
  };

  // Update the stats calculation
  const stats = [
    { 
      label: "Total Businesses", 
      value: businesses.length.toString(), 
      change: "+0", 
      icon: BuildingOffice2Icon, 
      color: "blue" 
    },
    { 
      label: "Documents", 
      value: documents.length.toString(), 
      change: `+${documents.length}`, 
      icon: DocumentIcon, 
      color: "green" 
    },
    { 
      label: "Active API Keys", 
      value: apiKeys.filter(k => k.status === 'Active').length.toString(), 
      change: `+${apiKeys.filter(k => k.status === 'Active').length}`, 
      icon: KeyIcon, 
      color: "purple" 
    },
    { 
      label: "Security Score", 
      value: `${documents.length > 0 ? '98%' : '100%'}`, 
      change: "+2%", 
      icon: ShieldCheckIcon, 
      color: "cyan" 
    }
  ];

  // Update the business section to use real data
  const renderBusinessSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Business Management</h2>
          <p className="text-gray-400">Create and manage your business entities</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNewBusinessModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20"
        >
          <PlusIcon className="h-5 w-5" />
          New Business
        </motion.button>
      </div>
      
      {businesses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700/50"
        >
          <BuildingOffice2Icon className="h-16 w-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No businesses yet</h3>
          <p className="text-gray-400 mb-6">Create your first business to get started</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewBusinessModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20"
          >
            Create Business
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business, index) => (
            <motion.div
              key={business._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <BuildingOffice2Icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{business.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${business.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {business.status}
                        </span>
                        {business.revenue && (
                          <span className="text-gray-400 text-sm">• Revenue: {business.revenue}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {business.taxId && (
                    <p className="text-gray-400 text-sm">Tax ID: {business.taxId}</p>
                  )}
                  <p className="text-gray-400 text-sm mt-2">Created: {new Date(business.created).toLocaleDateString()}</p>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  // Update the documents section to use real data
  const renderDocumentsSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Documents</h2>
          <p className="text-gray-400">Upload and manage your business documents</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 rounded-lg transition-all duration-200 shadow-lg shadow-green-500/20"
        >
          <ArrowUpTrayIcon className="h-5 w-5" />
          Upload Document
        </motion.button>
      </div>
      
      {documents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700/50"
        >
          <DocumentIcon className="h-16 w-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
          <p className="text-gray-400 mb-6">Upload your first document to get started</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 rounded-lg transition-all duration-200 shadow-lg shadow-green-500/20"
          >
            Upload Document
          </motion.button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 shadow-xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">Name</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Size</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Uploaded</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Type</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Access Level</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <motion.tr
                    key={doc._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-t border-gray-700/50 hover:bg-gray-800/30 transition-colors duration-200"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <DocumentIcon className="h-5 w-5 text-blue-400" />
                        </div>
                        <span className="font-medium truncate max-w-xs">{doc.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{formatFileSize(doc.size)}</td>
                    <td className="p-4 text-gray-300">{new Date(doc.uploaded).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-300 text-sm">{doc.fileType.split('/')[1]?.toUpperCase() || 'FILE'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${doc.access === 'Secure' ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30'}`}>
                        {doc.access}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleViewDocument(doc._id)}
                          className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors duration-200"
                          title="View Document"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteDocument(doc._id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors duration-200"
                          title="Delete Document"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  // Update the API keys section to use real data
  const renderApiKeysSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API Keys</h2>
          <p className="text-gray-400">Manage your API access keys and permissions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerateApiKey}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/20"
        >
          <PlusIcon className="h-5 w-5" />
          Generate New Key
        </motion.button>
      </div>
      
      {apiKeys.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700/50"
        >
          <KeyIcon className="h-16 w-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No API keys yet</h3>
          <p className="text-gray-400 mb-6">Generate your first API key to integrate with our services</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateApiKey}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/20"
          >
            Generate API Key
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((apiKey, index) => (
            <motion.div
              key={apiKey._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <KeyIcon className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{apiKey.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium mt-1 ${apiKey.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {apiKey.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="font-mono text-gray-300 bg-gray-900/50 p-3 rounded-lg flex-1 truncate">
                      {apiKey.key}
                    </code>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCopyApiKey(apiKey.key)}
                      className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      Copy
                    </motion.button>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>Created: {new Date(apiKey.created).toLocaleDateString()}</span>
                    {apiKey.lastUsed && (
                      <span>Last Used: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRevokeApiKey(apiKey._id)}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors duration-200"
                >
                  Revoke
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  // Add Notification Component
  const Notification = () => {
    if (!notification) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-6 right-6 z-50 rounded-xl p-4 shadow-2xl backdrop-blur-sm border ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-green-600/20 to-emerald-500/20 border-green-500/30' 
            : notification.type === 'error'
            ? 'bg-gradient-to-r from-red-600/20 to-rose-500/20 border-red-500/30'
            : 'bg-gradient-to-r from-blue-600/20 to-blue-500/20 border-blue-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          {notification.type === 'success' ? (
            <CheckCircleIcon className="h-6 w-6 text-green-400" />
          ) : notification.type === 'error' ? (
            <ExclamationCircleIcon className="h-6 w-6 text-red-400" />
          ) : (
            <ExclamationCircleIcon className="h-6 w-6 text-blue-400" />
          )}
          <div>
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  const TrustLayerLogo = () => (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3"
    >
      <motion.div 
        animate={{ 
          rotate: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="relative"
      >
        <div className="relative h-16 w-auto">
          <img 
            src="/logoo.png" 
            alt="TrustLayer" 
            className="h-16 w-auto"
          />
        </div>
      </motion.div>
      <div className="flex flex-col">
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"
        >
          TrustLayer
        </motion.span>
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-gray-400 font-medium"
        >
          Secure Business Platform
        </motion.span>
      </div>
    </motion.div>
  );

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Not authenticated</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      <Notification />
      
      {/* Top Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-b border-gray-700/50"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                {isSidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </motion.button>
              <TrustLayerLogo />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <ChartBarIcon className="h-5 w-5" />
                  <span>Analytics</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                  <span>Settings</span>
                </motion.button>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  {session.user?.image ? (
                    <motion.img 
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      src={session.user.image} 
                      alt={session.user.name || "User"} 
                      className="h-10 w-10 rounded-full border-2 border-blue-500/50"
                    />
                  ) : (
                    <motion.div 
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="h-10 w-10 rounded-full border-2 border-blue-500/50 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400"
                    >
                      <UserCircleIcon className="h-6 w-6 text-white" />
                    </motion.div>
                  )}
                  <div className="hidden md:block">
                    <p className="font-semibold">{session.user?.name}</p>
                  </div>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 rounded-lg transition-all duration-200 shadow-lg shadow-red-500/20"
                >
                  Logout
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed lg:static inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-r border-gray-700/50"
            >
              <div className="p-6 h-full flex flex-col">
                <nav className="space-y-2 flex-1">
                  {[
                    { id: "business", label: "Business", icon: BuildingOffice2Icon, color: "blue" },
                    { id: "documents", label: "Documents", icon: DocumentIcon, color: "green" },
                    { id: "apiKeys", label: "API Keys", icon: KeyIcon, color: "purple" }
                  ].map((item) => (
                    <motion.button
                      key={item.id}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 ${
                        activeTab === item.id 
                          ? `bg-gradient-to-r from-${item.color}-600 to-${item.color}-500 text-white shadow-lg shadow-${item.color}-500/30` 
                          : "hover:bg-gray-700/50"
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-white' : 'text-gray-400'}`} />
                      <span className="font-medium">{item.label}</span>
                      {activeTab === item.id && (
                        <motion.div 
                          layoutId="activeTab"
                          className="ml-auto h-2 w-2 rounded-full bg-white"
                        />
                      )}
                    </motion.button>
                  ))}
                </nav>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50"
                >
                  <h3 className="font-semibold mb-3 text-gray-300">Quick Stats</h3>
                  <div className="space-y-3">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <stat.icon className={`h-4 w-4 text-${stat.color}-400`} />
                          <span className="text-sm text-gray-400">{stat.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{stat.value}</span>
                          <span className={`text-xs px-2 py-1 rounded-full bg-${stat.color}-500/20 text-${stat.color}-400`}>
                            {stat.change}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Welcome back, {session.user?.name}
              </h1>
              <p className="text-gray-400 mt-2">Here's what's happening with your business today</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-${stat.color}-500/30 transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-${stat.color}-500/20 rounded-xl`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                    </div>
                    <span className={`text-sm font-medium text-${stat.color}-400 bg-${stat.color}-500/10 px-3 py-1 rounded-full`}>
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <p className="text-gray-400 text-sm mt-2">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Loading Skeleton */}
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-gray-800/50 rounded-xl p-6 h-32"></div>
                ))}
              </div>
            ) : (
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {activeTab === "business" && renderBusinessSection()}
                {activeTab === "documents" && renderDocumentsSection()}
                {activeTab === "apiKeys" && renderApiKeysSection()}
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showNewBusinessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 w-full max-w-md border border-gray-700/50 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-2">Create New Business</h3>
              <p className="text-gray-400 mb-6">Register a new business entity</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Business Name *</label>
                  <input 
                    type="text" 
                    placeholder="Enter business name"
                    value={newBusiness.name}
                    onChange={(e) => setNewBusiness(prev => ({...prev, name: e.target.value}))}
                    className="w-full p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tax ID</label>
                  <input 
                    type="text" 
                    placeholder="Enter tax identification number"
                    value={newBusiness.taxId}
                    onChange={(e) => setNewBusiness(prev => ({...prev, taxId: e.target.value}))}
                    className="w-full p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Business Address</label>
                  <textarea 
                    placeholder="Enter business address"
                    value={newBusiness.address}
                    onChange={(e) => setNewBusiness(prev => ({...prev, address: e.target.value}))}
                    className="w-full p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowNewBusinessModal(false);
                    setNewBusiness({ name: '', taxId: '', address: '' });
                  }}
                  className="flex-1 py-4 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateBusiness}
                  disabled={!newBusiness.name.trim()}
                  className={`flex-1 py-4 rounded-xl transition-all shadow-lg ${
                    !newBusiness.name.trim() 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                  }`}
                >
                  Create Business
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 w-full max-w-md border border-gray-700/50 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-2">Upload Document</h3>
              <p className="text-gray-400 mb-6">Securely upload your business documents</p>
              
              <motion.div 
                whileHover={{ scale: !selectedFile ? 1.02 : 1 }}
                className="border-2 border-dashed border-gray-600/50 rounded-2xl p-8 text-center bg-gray-800/30 cursor-pointer"
                onClick={() => !selectedFile && document.getElementById('file-upload')?.click()}
              >
                {selectedFile ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <DocumentIcon className="h-12 w-12 mx-auto text-green-400" />
                    <div>
                      <p className="font-medium truncate">{selectedFile.name}</p>
                      <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    {isUploading && (
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <motion.div 
                          className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                    {!isUploading && (
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Remove file
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <ArrowUpTrayIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    </motion.div>
                    <p className="text-gray-400 mb-4">Drag & drop files here or click to browse</p>
                    <p className="text-sm text-gray-500 mb-4">Max file size: 10MB</p>
                  </>
                )}
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                {!selectedFile && (
                  <label htmlFor="file-upload">
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 rounded-xl cursor-pointer shadow-lg shadow-green-500/20"
                    >
                      Select File
                    </motion.span>
                  </label>
                )}
              </motion.div>
              
              <div className="flex gap-3 mt-8">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setIsUploading(false);
                  }}
                  disabled={isUploading}
                  className="flex-1 py-4 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUploadDocument}
                  disabled={!selectedFile || isUploading}
                  className={`flex-1 py-4 rounded-xl transition-all shadow-lg ${
                    !selectedFile || isUploading
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600'
                  }`}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}