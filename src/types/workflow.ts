export interface Position {
  x: number;
  y: number;
}

export interface NodeMetadata {
  created?: string;
  lastModified?: string;
  author?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  status?: 'draft' | 'in-progress' | 'completed' | 'archived';
  version?: number;
  dependencies?: string[];
  notes?: string;
  customFields?: Record<string, any>;
  // LLM Configuration
  template?: string;
  inputs?: string[];
  context?: string;
  tokenLimit?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  model?: string;
  additionalInput?: string;
  // Data Source Configuration
  dataSource?: {
    type: 'url' | 'api' | 'file' | 'manual' | 'none';
    url?: string;
    apiEndpoint?: string;
    apiKey?: string;
    file?: File;
    manualInput?: string;
  };
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: Position;
  data: {
    label: string;
    content?: string;
    selectedSources?: string[];
    nlpAnalysis?: {
      sentiment?: string;
      keywords?: string[];
      summary?: string;
    };
    metadata?: NodeMetadata;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
}

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
} 