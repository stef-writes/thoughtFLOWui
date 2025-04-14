import React from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Menu,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ZenModeIcon from '@mui/icons-material/VisibilityOff';
import NormalModeIcon from '@mui/icons-material/Visibility';
import WebIcon from '@mui/icons-material/Web';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ApiIcon from '@mui/icons-material/Api';
import StorageIcon from '@mui/icons-material/Storage';
import { WorkflowNode, NodeMetadata } from '../types/workflow';
import { useWorkflowStore } from '../store/workflowStore';

interface NodeExpandedViewProps {
  node: WorkflowNode | null;
  onClose: () => void;
}

const NodeExpandedView: React.FC<NodeExpandedViewProps> = ({ node, onClose }) => {
  const { updateNode, edges, nodes } = useWorkflowStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isZenMode, setIsZenMode] = React.useState(false);
  const [nodeData, setNodeData] = React.useState({
    label: node?.data.label || '',
    content: node?.data.content || '',
    selectedSources: [] as string[],
    metadata: {
      created: node?.data.metadata?.created || new Date().toISOString(),
      lastModified: node?.data.metadata?.lastModified || new Date().toISOString(),
      template: '',
      inputs: [],
      context: '',
      tokenLimit: 2000,
      temperature: 0.7,
      topP: node?.data.metadata?.topP || 1.0,
      frequencyPenalty: node?.data.metadata?.frequencyPenalty || 0.0,
      presencePenalty: node?.data.metadata?.presencePenalty || 0.0,
      model: node?.data.metadata?.model || 'gpt-4',
      version: node?.data.metadata?.version || 1,
    } as NodeMetadata,
  });
  const [dataSourceTab, setDataSourceTab] = React.useState(0);

  // Status colors
  const statusColors = {
    draft: 'bg-gray-300',
    'in-progress': 'bg-blue-400',
    completed: 'bg-green-500',
    archived: 'bg-gray-500',
  };

  // Find incoming connections to this node
  const incomingConnections = React.useMemo(() => {
    if (!node) return [];
    return edges.filter(edge => edge.target === node.id);
  }, [edges, node]);

  // Find source nodes for incoming connections
  const sourceNodes = React.useMemo(() => {
    if (!node) return [];
    const sourceIds = incomingConnections.map(edge => edge.source);
    return sourceIds.map(id => {
      const sourceNode = nodes.find(n => n.id === id);
      return {
        id,
        label: sourceNode?.data.label || `Node ${id}`,
      };
    });
  }, [incomingConnections, node, nodes]);

  React.useEffect(() => {
    if (node) {
      setNodeData({
        label: node.data.label || '',
        content: node.data.content || '',
        selectedSources: node.data.selectedSources || [],
        metadata: {
          created: node.data.metadata?.created || new Date().toISOString(),
          lastModified: node.data.metadata?.lastModified || new Date().toISOString(),
          template: node.data.metadata?.template || '',
          inputs: node.data.metadata?.inputs || [],
          context: node.data.metadata?.context || '',
          tokenLimit: node.data.metadata?.tokenLimit || 2000,
          temperature: node.data.metadata?.temperature || 0.7,
          topP: node.data.metadata?.topP || 1.0,
          frequencyPenalty: node.data.metadata?.frequencyPenalty || 0.0,
          presencePenalty: node.data.metadata?.presencePenalty || 0.0,
          model: node.data.metadata?.model || 'gpt-4',
          version: node.data.metadata?.version || 1,
        },
      });
    }
  }, [node]);

  const handleSave = () => {
    if (node) {
      updateNode(node.id, {
        data: {
          ...node.data,
          ...nodeData,
          metadata: {
            ...nodeData.metadata,
            lastModified: new Date().toISOString(),
          },
        },
      });
    }
    onClose();
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  if (!node) return null;

  return (
    <Dialog
      open={!!node}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '60vh',
          maxHeight: '80vh',
          ...(isZenMode && {
            maxWidth: '800px',
            minHeight: '70vh',
            maxHeight: '90vh',
          }),
        },
      }}
    >
      {/* Status Bar */}
      <Box sx={{ 
        height: 4,
        backgroundColor: statusColors[nodeData.metadata.status as keyof typeof statusColors],
      }} />

      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(to right, #B49042, #C4A052)',
        color: '#121212'
      }}>
        <TextField
          value={nodeData.label}
          onChange={(e) => setNodeData({ ...nodeData, label: e.target.value })}
          placeholder="Node Name"
          variant="standard"
          sx={{ 
            '& .MuiInputBase-root': { color: '#121212' },
            '& .MuiInput-underline:before': { borderBottomColor: 'rgba(0, 0, 0, 0.42)' },
            '& .MuiInput-underline:hover:before': { borderBottomColor: 'rgba(0, 0, 0, 0.87)' },
            '& .MuiInput-underline:after': { borderBottomColor: '#121212' },
            '& .MuiInputBase-input::placeholder': { color: 'rgba(0, 0, 0, 0.7)' }
          }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}>
            <IconButton
              onClick={() => setIsZenMode(!isZenMode)}
              size="small"
              sx={{ color: '#121212' }}
            >
              {isZenMode ? <NormalModeIcon /> : <ZenModeIcon />}
            </IconButton>
          </Tooltip>
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            size="small"
            sx={{ color: '#121212' }}
          >
            <SettingsIcon />
          </IconButton>
          <IconButton 
            onClick={onClose}
            size="small"
            edge="end"
            aria-label="close"
            sx={{ color: '#121212' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleSettingsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleSettingsClose}>Export Node Data</MenuItem>
        <MenuItem onClick={handleSettingsClose}>Duplicate Node</MenuItem>
        <MenuItem onClick={handleSettingsClose}>Delete Node</MenuItem>
        <Divider />
        <MenuItem onClick={handleSettingsClose}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2">System Information</Typography>
            <Typography variant="body2" color="text.secondary">
              Created: {nodeData.metadata.created ? new Date(nodeData.metadata.created).toLocaleString() : 'Not set'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last Modified: {nodeData.metadata.lastModified ? new Date(nodeData.metadata.lastModified).toLocaleString() : 'Not set'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Version: {nodeData.metadata.version}
            </Typography>
          </Box>
        </MenuItem>
      </Menu>

      <DialogContent dividers>
        {isZenMode ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3,
            height: '100%',
            p: 3
          }}>
            {/* User Input */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" gutterBottom>User Input</Typography>
              <TextField
                value={nodeData.content}
                onChange={(e) => setNodeData({ ...nodeData, content: e.target.value })}
                multiline
                rows={6}
                fullWidth
                variant="outlined"
                placeholder="Enter your input here..."
              />
            </Box>

            {/* Input Selector */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>Input Sources</Typography>
              <FormControl fullWidth>
                <Select
                  multiple
                  value={nodeData.selectedSources}
                  onChange={(e) => setNodeData({
                    ...nodeData,
                    selectedSources: e.target.value as string[]
                  })}
                  input={<OutlinedInput />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip 
                          key={value} 
                          label={sourceNodes.find(n => n.id === value)?.label || value}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {sourceNodes.map((source) => (
                    <MenuItem key={source.id} value={source.id}>
                      <Checkbox checked={nodeData.selectedSources.indexOf(source.id) > -1} />
                      <ListItemText primary={source.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Output */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Output</Typography>
              <TextField
                value={nodeData.metadata.additionalInput}
                onChange={(e) => setNodeData({
                  ...nodeData,
                  metadata: { ...nodeData.metadata, additionalInput: e.target.value }
                })}
                multiline
                rows={6}
                fullWidth
                variant="outlined"
                placeholder="Output will appear here..."
              />
            </Box>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={3} py={2}>
            {/* Data Source Configuration */}
            <Accordion 
              elevation={0}
              defaultExpanded
              sx={{ 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                '&:before': { display: 'none' },
                '& .MuiAccordionSummary-root': {
                  minHeight: '48px',
                  padding: '0 16px',
                },
                '& .MuiAccordionDetails-root': {
                  padding: '16px',
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
                sx={{ 
                  bgcolor: 'transparent',
                  '& .MuiAccordionSummary-content': { my: 0 }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StorageIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>Data Source</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ width: '100%' }}>
                  <Tabs
                    value={dataSourceTab}
                    onChange={(_, newValue) => setDataSourceTab(newValue)}
                    sx={{
                      mb: 2,
                      '& .MuiTabs-indicator': {
                        backgroundColor: 'primary.main',
                      },
                    }}
                  >
                    <Tab 
                      icon={<WebIcon />} 
                      label="Web" 
                      sx={{ 
                        minHeight: 48,
                        color: 'text.secondary',
                        '&.Mui-selected': { color: 'primary.main' }
                      }}
                    />
                    <Tab 
                      icon={<CloudUploadIcon />} 
                      label="File" 
                      sx={{ 
                        minHeight: 48,
                        color: 'text.secondary',
                        '&.Mui-selected': { color: 'primary.main' }
                      }}
                    />
                    <Tab 
                      icon={<ApiIcon />} 
                      label="API" 
                      sx={{ 
                        minHeight: 48,
                        color: 'text.secondary',
                        '&.Mui-selected': { color: 'primary.main' }
                      }}
                    />
                    <Tab 
                      icon={<StorageIcon />} 
                      label="Database" 
                      sx={{ 
                        minHeight: 48,
                        color: 'text.secondary',
                        '&.Mui-selected': { color: 'primary.main' }
                      }}
                    />
                  </Tabs>

                  {dataSourceTab === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="URL"
                        placeholder="https://example.com"
                        variant="outlined"
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="CSS Selector"
                        placeholder=".content, #main, etc."
                        variant="outlined"
                        size="small"
                      />
                      <FormControl fullWidth size="small">
                        <InputLabel>Data Format</InputLabel>
                        <Select
                          label="Data Format"
                          defaultValue="json"
                        >
                          <MenuItem value="json">JSON</MenuItem>
                          <MenuItem value="html">HTML</MenuItem>
                          <MenuItem value="text">Text</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}

                  {dataSourceTab === 1 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        sx={{ 
                          borderStyle: 'dashed',
                          borderWidth: 2,
                          '&:hover': {
                            borderStyle: 'solid',
                          }
                        }}
                      >
                        Drop files here or click to upload
                      </Button>
                      <FormControl fullWidth size="small">
                        <InputLabel>File Type</InputLabel>
                        <Select
                          label="File Type"
                          defaultValue="csv"
                        >
                          <MenuItem value="csv">CSV</MenuItem>
                          <MenuItem value="json">JSON</MenuItem>
                          <MenuItem value="excel">Excel</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}

                  {dataSourceTab === 2 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="API Endpoint"
                        placeholder="https://api.example.com/v1/data"
                        variant="outlined"
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="API Key"
                        type="password"
                        variant="outlined"
                        size="small"
                      />
                      <FormControl fullWidth size="small">
                        <InputLabel>Method</InputLabel>
                        <Select
                          label="Method"
                          defaultValue="get"
                        >
                          <MenuItem value="get">GET</MenuItem>
                          <MenuItem value="post">POST</MenuItem>
                          <MenuItem value="put">PUT</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}

                  {dataSourceTab === 3 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Database Type</InputLabel>
                        <Select
                          label="Database Type"
                          defaultValue="postgres"
                        >
                          <MenuItem value="postgres">PostgreSQL</MenuItem>
                          <MenuItem value="mysql">MySQL</MenuItem>
                          <MenuItem value="mongodb">MongoDB</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Connection String"
                        type="password"
                        variant="outlined"
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="Query"
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Smart Config */}
            <Accordion 
              elevation={0}
              sx={{ 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                '&:before': { display: 'none' },
                '& .MuiAccordionSummary-root': {
                  minHeight: '48px',
                  padding: '0 16px',
                },
                '& .MuiAccordionDetails-root': {
                  padding: '16px',
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
                sx={{ 
                  bgcolor: 'transparent',
                  '& .MuiAccordionSummary-content': { my: 0 }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LightbulbIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>Smart Config</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {/* Model Selection - More Compact */}
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <Select
                        value={nodeData.metadata.model}
                        onChange={(e) => setNodeData({
                          ...nodeData,
                          metadata: { ...nodeData.metadata, model: e.target.value }
                        })}
                        sx={{ 
                          '& .MuiSelect-select': { py: 1 },
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.12)' }
                        }}
                      >
                        <MenuItem value="gpt-4">GPT-4</MenuItem>
                        <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                        <MenuItem value="claude-2">Claude 2</MenuItem>
                        <MenuItem value="claude-3">Claude 3</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      type="number"
                      value={nodeData.metadata.tokenLimit}
                      onChange={(e) => setNodeData({
                        ...nodeData,
                        metadata: { ...nodeData.metadata, tokenLimit: parseInt(e.target.value) }
                      })}
                      size="small"
                      sx={{ 
                        width: '120px',
                        '& .MuiOutlinedInput-root': { py: 1 },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.12)' }
                      }}
                      placeholder="Token Limit"
                    />
                  </Box>

                  {/* Model Configuration - Simplified */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      value={nodeData.metadata.template}
                      onChange={(e) => setNodeData({
                        ...nodeData,
                        metadata: { ...nodeData.metadata, template: e.target.value }
                      })}
                      multiline
                      rows={1}
                      size="small"
                      fullWidth
                      placeholder="System Message"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { py: 1 },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.12)' }
                      }}
                    />

                    <TextField
                      value={nodeData.metadata.context}
                      onChange={(e) => setNodeData({
                        ...nodeData,
                        metadata: { ...nodeData.metadata, context: e.target.value }
                      })}
                      multiline
                      rows={1}
                      size="small"
                      fullWidth
                      placeholder="Output Instructions"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { py: 1 },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.12)' }
                      }}
                    />
                  </Box>

                  {/* Advanced Settings - More Compact */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 3,
                    flexWrap: 'wrap',
                    '& > *': {
                      flex: '1 1 200px',
                      minWidth: '200px'
                    }
                  }}>
                    <Box sx={{ position: 'relative' }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          position: 'absolute',
                          top: -20,
                          left: 0,
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          mb: 1
                        }}
                      >
                        Temperature
                      </Typography>
                      <TextField
                        type="number"
                        value={nodeData.metadata.temperature}
                        onChange={(e) => setNodeData({
                          ...nodeData,
                          metadata: { ...nodeData.metadata, temperature: parseFloat(e.target.value) }
                        })}
                        size="small"
                        sx={{ 
                          width: '100%',
                          '& .MuiOutlinedInput-root': { py: 1 },
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.12)' }
                        }}
                        placeholder="0.7"
                      />
                    </Box>

                    <Box sx={{ position: 'relative' }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          position: 'absolute',
                          top: -20,
                          left: 0,
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          mb: 1
                        }}
                      >
                        Top P
                      </Typography>
                      <TextField
                        type="number"
                        value={nodeData.metadata.topP}
                        onChange={(e) => setNodeData({
                          ...nodeData,
                          metadata: { ...nodeData.metadata, topP: parseFloat(e.target.value) }
                        })}
                        size="small"
                        sx={{ 
                          width: '100%',
                          '& .MuiOutlinedInput-root': { py: 1 },
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.12)' }
                        }}
                        placeholder="1.0"
                      />
                    </Box>

                    <Box sx={{ position: 'relative' }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          position: 'absolute',
                          top: -20,
                          left: 0,
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          mb: 1
                        }}
                      >
                        Freq Penalty
                      </Typography>
                      <TextField
                        type="number"
                        value={nodeData.metadata.frequencyPenalty}
                        onChange={(e) => setNodeData({
                          ...nodeData,
                          metadata: { ...nodeData.metadata, frequencyPenalty: parseFloat(e.target.value) }
                        })}
                        size="small"
                        sx={{ 
                          width: '100%',
                          '& .MuiOutlinedInput-root': { py: 1 },
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.12)' }
                        }}
                        placeholder="0.0"
                      />
                    </Box>

                    <Box sx={{ position: 'relative' }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          position: 'absolute',
                          top: -20,
                          left: 0,
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          mb: 1
                        }}
                      >
                        Presence Penalty
                      </Typography>
                      <TextField
                        type="number"
                        value={nodeData.metadata.presencePenalty}
                        onChange={(e) => setNodeData({
                          ...nodeData,
                          metadata: { ...nodeData.metadata, presencePenalty: parseFloat(e.target.value) }
                        })}
                        size="small"
                        sx={{ 
                          width: '100%',
                          '& .MuiOutlinedInput-root': { py: 1 },
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.12)' }
                        }}
                        placeholder="0.0"
                      />
                    </Box>
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Connections - More Minimalist */}
            <Accordion 
              elevation={0}
              defaultExpanded={incomingConnections.length > 0}
              sx={{ 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                '&:before': { display: 'none' },
                '& .MuiAccordionSummary-root': {
                  minHeight: '48px',
                  padding: '0 16px',
                },
                '& .MuiAccordionDetails-root': {
                  padding: '16px',
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
                sx={{ 
                  bgcolor: 'transparent',
                  '& .MuiAccordionSummary-content': { my: 0 }
                }}
              >
                <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>Connections</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {incomingConnections.length > 0 ? (
                  <FormControl fullWidth>
                    <Select
                      multiple
                      value={nodeData.selectedSources}
                      onChange={(e) => setNodeData({
                        ...nodeData,
                        selectedSources: e.target.value as string[]
                      })}
                      sx={{ 
                        '& .MuiSelect-select': { py: 1 },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.12)' }
                      }}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip 
                              key={value} 
                              label={sourceNodes.find(n => n.id === value)?.label || value}
                              size="small"
                              sx={{ 
                                bgcolor: 'primary.main',
                                color: 'common.white',
                                '& .MuiChip-deleteIcon': { color: 'common.white' }
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {sourceNodes.map((source) => (
                        <MenuItem key={source.id} value={source.id}>
                          <Checkbox 
                            checked={nodeData.selectedSources.indexOf(source.id) > -1}
                            sx={{ 
                              color: 'primary.main',
                              '&.Mui-checked': { color: 'primary.main' }
                            }}
                          />
                          <ListItemText 
                            primary={source.label}
                            sx={{ 
                              '& .MuiTypography-root': { 
                                fontSize: '0.875rem',
                                color: 'text.primary'
                              }
                            }}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No incoming connections
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>

            {/* User Input */}
            <Accordion 
              elevation={0}
              defaultExpanded
              sx={{ 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                '&:before': { display: 'none' },
                '& .MuiAccordionSummary-root': {
                  minHeight: '48px',
                  padding: '0 16px',
                },
                '& .MuiAccordionDetails-root': {
                  padding: '16px',
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
                sx={{ 
                  bgcolor: 'transparent',
                  '& .MuiAccordionSummary-content': { my: 0 }
                }}
              >
                <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>User Input</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  value={nodeData.content}
                  onChange={(e) => setNodeData({ ...nodeData, content: e.target.value })}
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your input here..."
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      py: 1,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                      }
                    },
                    '& .MuiOutlinedInput-notchedOutline': { 
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      transition: 'border-color 0.2s ease-in-out'
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'text.primary',
                      fontSize: '0.875rem',
                      lineHeight: 1.5
                    }
                  }}
                />
              </AccordionDetails>
            </Accordion>

            {/* Output */}
            <Accordion 
              elevation={0}
              defaultExpanded
              sx={{ 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                '&:before': { display: 'none' },
                '& .MuiAccordionSummary-root': {
                  minHeight: '48px',
                  padding: '0 16px',
                },
                '& .MuiAccordionDetails-root': {
                  padding: '16px',
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
                sx={{ 
                  bgcolor: 'transparent',
                  '& .MuiAccordionSummary-content': { my: 0 }
                }}
              >
                <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>Output</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  value={nodeData.metadata.additionalInput}
                  onChange={(e) => setNodeData({
                    ...nodeData,
                    metadata: { ...nodeData.metadata, additionalInput: e.target.value }
                  })}
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  placeholder="Output will appear here..."
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      py: 1,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                      }
                    },
                    '& .MuiOutlinedInput-notchedOutline': { 
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      transition: 'border-color 0.2s ease-in-out'
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'text.primary',
                      fontSize: '0.875rem',
                      lineHeight: 1.5
                    }
                  }}
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </DialogContent>

      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 1, 
          p: 2, 
          borderTop: '1px solid rgba(0, 0, 0, 0.12)' 
        }}
      >
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </Box>
    </Dialog>
  );
};

export default NodeExpandedView; 