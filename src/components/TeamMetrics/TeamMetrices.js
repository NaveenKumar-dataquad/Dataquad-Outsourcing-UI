import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box, CircularProgress, Stack, Typography, Alert, Button } from '@mui/material';
import UserTable from './UserTable';
import httpService from '../../Services/httpService';
import DateRangeFilter from '../muiComponents/DateRangeFilter';

const TeamMetrics = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    BDM: [],
    TEAMLEAD: [],
    EMPLOYEE: []
  });

  const tabsConfig = [
    { role: 'BDM', title: 'BDM Users' },
    { role: 'TEAMLEAD', title: 'Team Lead Users' },
    { role: 'EMPLOYEE', title: 'Employee Users' }
  ];

  useEffect(() => {
    fetchData(tabsConfig[activeTab].role);
  }, [activeTab]);

  const fetchData = async (role) => {
    setIsLoading(true);
    setError(null);
    try {
      let endpoint = '';
      let processResponse = null;
      
      switch(role) {
        case 'BDM':
          endpoint = '/users/bdmlist';
          processResponse = data => data;
          break;
        case 'TEAMLEAD':
          endpoint = '/requirements/stats';
          processResponse = data => {
            if (data?.userStats?.length) {
              return data.userStats.filter(user => 
                user.role && user.role.toUpperCase() === 'TEAMLEAD'
              );
            }
            return [];
          };
          break;
        case 'EMPLOYEE':
          endpoint = '/requirements/stats';
          processResponse = data => {
            if (data?.userStats?.length) {
              return data.userStats.filter(user => 
                user.role && user.role.toUpperCase() === 'EMPLOYEE'
              );
            }
            return [];
          };
          break;
        default:
          endpoint = '/requirements/stats';
          processResponse = data => data.userStats || [];
      }
  
      const response = await httpService.get(endpoint);
      console.log(`${role} API Response:`, response);
  
      if (response.data) {
        const processedData = processResponse(response.data);
        setUserData(prev => ({
          ...prev,
          [role]: processedData
        }));
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (error) {
      console.error(`Error fetching ${role} data:`, error);
      setError(`Failed to load ${role} data. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    fetchData(tabsConfig[activeTab].role);
  };

  const renderTabContent = () => {
    const currentRole = tabsConfig[activeTab].role;
    
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      );
    }

    return (
      <UserTable 
        role={currentRole} 
        title={tabsConfig[activeTab].title} 
        employeesList={userData[currentRole]} 
      />
    );
  };

  return (
    <>
      <Stack 
        direction="row" 
        alignItems="center" 
        spacing={2}
        sx={{
          flexWrap: 'wrap',
          mb: 3,
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: '#f9f9f9',
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h6" color="primary">Team Metrics</Typography>
        <DateRangeFilter component="TeamMetrics" onDateChange={handleRefresh} />
      </Stack>

      <Box sx={{ width: '100%', height: '100vh', mt: -1.5 }}>
        <Tabs
          value={activeTab}
          onChange={handleChange}
          aria-label="team metrics tabs"
          sx={{
            borderBottom: '2px solid #e0e0e0',
            px: 2,
            backgroundColor: '#f9f9f9',
            borderRadius: '8px 8px 0 0',
          }}
          TabIndicatorProps={{
            style: {
              backgroundColor: '#2A4DBD',
              height: 4,
              borderRadius: 4,
            },
          }}
        >
          {tabsConfig.map((tab, index) => (
            <Tab
              key={tab.role}
              label={tab.title}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 15,
                color: activeTab === index ? '#2A4DBD' : '#555',
                mx: 1,
                px: 3,
                py: 1,
                borderRadius: 2,
                backgroundColor: activeTab === index ? '#e6ecfc' : 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#f0f4ff',
                },
              }}
            />
          ))}
        </Tabs>

        <Box sx={{ mt: 2, px: 2 }}>
          {renderTabContent()}
        </Box>
      </Box>
    </>
  );
};

export default TeamMetrics;