import React, { useState, useEffect, useCallback } from 'react';
import data from './abc.json'
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  MiniMap,
  Background,
  Handle,
  Position,
  updateEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import TextUpdaterNode from './TextUpdaterNode';

const nodeTypes = { textUpdater: TextUpdaterNode };
const languages = data.bot_details.action_lang.interactive.action.buttons.map(button => button.reply.id);
let handleConnect;

const text = (
  <div>
    Start Phrases: <br/>
    {data?.bot_details?.start_phrase?.map((element) => (
      <> <button key={element}>{element}</button><br/><br/> </>
    ))}
  </div>
);

const ClosingText = (
  <div>
    Closing Phrases: <br/>
    {data?.bot_details?.close_phrase?.map((element) => (
      <> <button key={element}>{element}</button><br/><br/> </>
    ))}
  </div>
);

const getNodeLabel = (nodeId, languageId) => {
  switch (nodeId) {
    case 'action_start':
      return data.bot_details.action_start.text.body;
    case 'action_lang':
      return data.bot_details.action_lang.interactive.body.text;
    case 'category':
      return data.bot_details.lang_bot[languageId]?.category.text.body; 
    case 'seller_list':
      return data.bot_details.lang_bot[languageId]?.seller_list.text.body; 
    case 'seller_info':
      return data.bot_details.lang_bot[languageId]?.seller_info.text.body;
    default:
      return '';
  }
};

const getNodeOptions = (nodeId, languageId) => {
  switch (nodeId) {
    case 'category':
      return data.bot_details.lang_bot[languageId]?.category?.responses || []; 
    case 'seller_list':
      return data.bot_details.lang_bot[languageId]?.seller_list?.responses || []; 
    case 'seller_info':
      return data.bot_details.lang_bot[languageId]?.seller_info?.responses || [];
    default:
      return [];
  }
};

const initialNode = [
  {
    id: '1',
    type: 'input',
    data: { label: text },
    position: { x: 50, y: 15 },
    sourcePosition: Position.Right,
  },

  { id: 'action_start', 
  type:'default',
  data: { label: getNodeLabel('action_start', '')}, 
  position: { x: 250, y: 76 }, 
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
},
  { id: 'action_lang', 
  type: 'textUpdater',
  data: { question: getNodeLabel('action_lang', ''),
    options: data.bot_details.action_lang.interactive.action.buttons, 
    value: 'action_lang',
    NodeId: 'action_lang',
  },
  position: { x: 450, y: 48 },
  handleConnect,
  isConnectable: true,
},


  {
    id: 'last',
    type: 'output',
    data: { label: ClosingText },
    position: { x: 1500, y: 15 },
    targetPosition: Position.Left,
  },
];

  let Disty = -80;
  const createLanguageNodes = (languageId) => {
  const categoryNodeId = `category_${languageId}`;
  const sellerListNodeId = `seller_list_${languageId}`;
  const sellerInfoNodeId = `seller_info_${languageId}`;

  let Distx = 1100;

  const sellerInfoNode = {
    id: sellerInfoNodeId,
    type: 'textUpdater',
    data: {
      question: getNodeLabel('seller_info', languageId),
      options: getNodeOptions('seller_info', languageId),
      value: 'seller_info',
      NodeId: sellerInfoNodeId,
      targetSource: ''
    },
    position: { x: Distx, y: Disty },
    handleConnect,
    isConnectable: true,
  };

  Distx -= 200;

  const sellerListNode = {
    id: sellerListNodeId,
    type: 'textUpdater',
    data: {
      question: getNodeLabel('seller_list', languageId),
      options: getNodeOptions('seller_list', languageId),
      value: 'seller_list',
      NodeId: sellerListNodeId,
      targetSource: sellerInfoNodeId,
    },
    position: { x: Distx, y: Disty },
    handleConnect,
    isConnectable: true,
  };

  Distx -= 200;

  const categoryNode = {
    id: categoryNodeId,
    type: 'textUpdater',
    data: {
      question: getNodeLabel('category', languageId),
      options: getNodeOptions('category', languageId),
      value: 'category',
      NodeId: categoryNodeId,
      targetSource: sellerListNodeId,
    },
    position: { x: Distx, y: Disty },
    handleConnect,
    isConnectable: true,
  };
  Disty += 220;

  return [categoryNode, sellerListNode, sellerInfoNode];
};


const createLanguageEdges = (languageId, index) => {
  const edges = [];
  
  edges.push({
    id: `option-action_lang_${index}-category_${languageId}`,
    source: 'action_lang',
    sourceHandle: `option-action_lang_${index}`, 
    target: `category_${languageId}`, 
    targetHandle: `category_${languageId}`, 
  });
  
  
  edges.push({
    id: `category-seller_list_${languageId}`,
    source: `category_${languageId}`,
    target: `seller_list_${languageId}`,
  });

  getNodeOptions('category', languageId).forEach((option, index) => {
    edges.push({
      id: `option-category_${languageId}_${index}-seller_list_${languageId}`,
      source: `category_${languageId}`,
      sourceHandle: `option-category_${languageId}_${index}`, 
      target: `seller_list_${languageId}`, 
      targetHandle: `seller_list_${languageId}`, 
    });
  });

  edges.push({
    id: `seller_list-seller_info_${languageId}`,
    source: `seller_list_${languageId}`,
    target: `seller_info_${languageId}`,
  });


  getNodeOptions('seller_list', languageId).forEach((option, index) => {
    edges.push({
      id: `option-seller_list_${languageId}_${index}-seller_info_${languageId}`,
      source: `seller_list_${languageId}`,
      sourceHandle: `option-seller_list_${languageId}_${index}`, 
      target: `seller_info_${languageId}`, 
      targetHandle: `seller_info_${languageId}`, 
    });
  });

  edges.push({
    id: `seller_info_${languageId}-last`,
    source: `seller_info_${languageId}`,
    target: 'last',
    animated: true,
  });


  return edges;
};


const initialEdges = [
  { id: '1-action_start', source: '1', target: 'action_start', animated: true },
  { id: 'action_start-action_lang', source: 'action_start', target: 'action_lang' },

];

const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState();
  const [edges, setEdges, onEdgesChange] = useEdgesState();

  useEffect(() => {
    const UpdatedNodes = initialNode.concat(languages.flatMap(languageId => createLanguageNodes(languageId)));
    let UpdatedEdges = initialEdges.concat(languages.flatMap((languageId, index) => createLanguageEdges(languageId, index)));
    // const EdgeUpdated = ConnLanguageCategory(UpdatedEdges);
    setNodes(UpdatedNodes);
    setEdges(UpdatedEdges);
  }, []);

console.log(nodes);
console.log(edges);
  
  useEffect(() => {
    console.log(nodes);
  }, [initialNode]);
  

  handleConnect = useCallback(
    (sourceId, targetId) => {
      const newEdge = { id: `${sourceId}-${targetId}`, source: sourceId, target: targetId };
      setEdges((prevEdges) => [...prevEdges, newEdge]);
    },
    [setEdges]
  );

  const onConnect = useCallback(
    (connection) => {
      const { source, target } = connection;
      handleConnect(source, target);
    },
    [handleConnect]
  );
  

  return (
    <div className="providerflow">
      <ReactFlowProvider>
        <div className="reactflow-wrapper" style={{ width: '100vw', height: '100vh' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            nodeTypes={nodeTypes}
          >
            <Background color='#888' variant='dots' size={1.5}/>
            <Controls />
            <MiniMap pannable/>
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default Flow;
