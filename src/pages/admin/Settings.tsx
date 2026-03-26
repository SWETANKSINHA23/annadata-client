import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/axios';
import AdminNav from '@/components/navigation/AdminNav';

const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Annadata Harmony',
      siteDescription: 'A platform connecting farmers, vendors, and consumers',
      contactEmail: 'admin@annadata.com',
      supportPhone: '+91 1234567890'
    },
    features: {
      enableBulkOrders: true,
      enableRatings: true,
      enableChat: true,
      enableNotifications: true,
      maintenanceMode: false
    },
    integrations: {
      razorpayKey: 'rzp_test_xxxxxx',
      googleApiKey: '',
      weatherApiKey: ''
    }
  });

  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [name]: value
      }
    }));
  };

  const handleFeatureToggle = (name: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [name]: checked
      }
    }));
  };

  const handleIntegrationSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [name]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    try {
      // When backend is ready, uncomment this code:
      // await api.put('/admin/settings', settings);
      
      // For now, just simulate a successful save
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: 'Settings Saved',
          description: 'Platform settings have been updated successfully.',
        });
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: 'Failed to Save Settings',
        description: 'An error occurred while saving settings.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 border-r bg-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Portal</h2>
        <AdminNav />
      </div>
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Platform Settings</h1>
          <Button 
            onClick={handleSaveSettings}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
        
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Manage general platform configuration settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input 
                    id="siteName"
                    name="siteName"
                    value={settings.general.siteName}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input 
                    id="siteDescription"
                    name="siteDescription"
                    value={settings.general.siteDescription}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input 
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <Input 
                    id="supportPhone"
                    name="supportPhone"
                    value={settings.general.supportPhone}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Features Management</CardTitle>
                <CardDescription>
                  Enable or disable platform features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Bulk Orders</h3>
                    <p className="text-sm text-gray-500">Enable bulk order functionality for vendors</p>
                  </div>
                  <Switch 
                    checked={settings.features.enableBulkOrders}
                    onCheckedChange={(checked) => handleFeatureToggle('enableBulkOrders', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Ratings & Reviews</h3>
                    <p className="text-sm text-gray-500">Allow users to rate and review products</p>
                  </div>
                  <Switch 
                    checked={settings.features.enableRatings}
                    onCheckedChange={(checked) => handleFeatureToggle('enableRatings', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">In-App Chat</h3>
                    <p className="text-sm text-gray-500">Enable chat functionality between users</p>
                  </div>
                  <Switch 
                    checked={settings.features.enableChat}
                    onCheckedChange={(checked) => handleFeatureToggle('enableChat', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notifications</h3>
                    <p className="text-sm text-gray-500">Enable push and email notifications</p>
                  </div>
                  <Switch 
                    checked={settings.features.enableNotifications}
                    onCheckedChange={(checked) => handleFeatureToggle('enableNotifications', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Maintenance Mode</h3>
                    <p className="text-sm text-gray-500">Take the platform offline for maintenance</p>
                  </div>
                  <Switch 
                    checked={settings.features.maintenanceMode}
                    onCheckedChange={(checked) => handleFeatureToggle('maintenanceMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Third-Party Integrations</CardTitle>
                <CardDescription>
                  Configure external service integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="razorpayKey">Razorpay API Key</Label>
                  <Input 
                    id="razorpayKey"
                    name="razorpayKey"
                    value={settings.integrations.razorpayKey}
                    onChange={handleIntegrationSettingsChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="googleApiKey">Google Maps API Key</Label>
                  <Input 
                    id="googleApiKey"
                    name="googleApiKey"
                    value={settings.integrations.googleApiKey}
                    onChange={handleIntegrationSettingsChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weatherApiKey">Weather API Key</Label>
                  <Input 
                    id="weatherApiKey"
                    name="weatherApiKey"
                    value={settings.integrations.weatherApiKey}
                    onChange={handleIntegrationSettingsChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="backup">
            <Card>
              <CardHeader>
                <CardTitle>Backup & Restore</CardTitle>
                <CardDescription>
                  Manage database backups and restoration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Create Backup</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Generate a backup of the entire database. This may take a few minutes.
                  </p>
                  <Button>Create Backup</Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Restore from Backup</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload a backup file to restore the database to a previous state.
                  </p>
                  <div className="flex items-center gap-4">
                    <Input type="file" />
                    <Button variant="outline">Upload & Restore</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-yellow-50 text-yellow-600 text-sm p-4">
                Warning: Restoring from a backup will replace all current data. This action cannot be undone.
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSettings; 