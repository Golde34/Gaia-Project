import { useState, useEffect } from "react";
import {
    Badge,
    Button,
    Card,
    Flex,
    Select,
    SelectItem,
    Subtitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    Text,
    Title,
} from "@tremor/react";
import { RefreshIcon } from "@heroicons/react/solid";

const MemorySetting = () => {
  const [memoryType, setMemoryType] = useState('Project');
  const [memoryData, setMemoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const memoryTypes = ['Project', 'Conversation'];

  useEffect(() => {
    fetchMemoryData();
  }, [memoryType]);

  const fetchMemoryData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/memory/${memoryType}`);
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockData = [
        { id: 1, content: 'Project Alpha - AI Integration', status: 'Active' },
        { id: 2, content: 'Project Beta - Data Pipeline', status: 'Completed' },
        { id: 3, content: 'Project Gamma - UI Redesign', status: 'Pending' },
      ];
      
      setTimeout(() => {
        setMemoryData(mockData);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching memory data:', error);
      setLoading(false);
    }
  };

  const handleSyncProject = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/memory/sync-project', { method: 'POST' });
      
      console.log('Syncing project data...');
      
      setTimeout(() => {
        fetchMemoryData();
        alert('Project synchronized successfully!');
      }, 1000);
    } catch (error) {
      console.error('Error syncing project:', error);
      setLoading(false);
    }
  };

  return (
    <Card>
      <Flex justifyContent="center" alignItems="center">
        <Title className="text-white text-xl font-bold">Memory Setting</Title>
      </Flex>

      <div className="mt-6">
        <Subtitle className="mb-2">Manage your memory data</Subtitle>
        
        <Flex alignItems="center" className="mb-4 gap-4">
          <Text className="font-medium">Memory Type:</Text>
          <Select
            value={memoryType}
            onValueChange={setMemoryType}
            placeholder="Select memory type"
          >
            {memoryTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </Select>

          {memoryType === 'Project' && (
            <Button
              variant="primary"
              color="indigo"
              onClick={handleSyncProject}
              disabled={loading}
              icon={RefreshIcon}
              className="ml-auto"
            >
              {loading ? "Syncing..." : "Sync Project"}
            </Button>
          )}
        </Flex>

        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <Table>
            <TableHead>
              <TableRow className="border-b border-tremor-border dark:border-dark-tremor-border">
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Content</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {memoryData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Text className="text-tremor-content">No data available</Text>
                  </TableCell>
                </TableRow>
              ) : (
                memoryData.map((item) => (
                  <TableRow 
                    key={item.id} 
                    className="border-b border-tremor-border dark:border-dark-tremor-border"
                  >
                    <TableCell>
                      <Text className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                        {item.id}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text className="font-medium text-tremor-content dark:text-dark-tremor-content">
                        {item.content}
                      </Text>
                    </TableCell>
                    <TableCell>
                      {item.status === 'Active' ? (
                        <Badge color="emerald">Active</Badge>
                      ) : item.status === 'Completed' ? (
                        <Badge color="blue">Completed</Badge>
                      ) : (
                        <Badge color="yellow">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  );
};

export default MemorySetting;
