import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Handle, Position } from 'reactflow';

import './TextUpdaterNode.css';

function TextUpdaterNode({ data, handleConnect, isConnectable }) {
  const { question, options, value, NodeId, targetSource } = data;
  const [arr, setArr] = useState([25, 36, 47, 58, 70, 76]);
  const nodeRef = useRef(null);

  useEffect(() => {
    const updateNodeHeight = () => {
      if (nodeRef.current) {
        const node = nodeRef.current;
        const contentHeight = node.scrollHeight;
        const updatedHeight = contentHeight + 5; 

        node.style.height = `${updatedHeight}px`;
      }
    };

    updateNodeHeight();
    window.addEventListener('resize', updateNodeHeight);
    return () => {
      window.removeEventListener('resize', updateNodeHeight);
    };
  }, []);

  const handleStyle = useCallback((i) => {
    return { top: arr[i] };
  }, [arr]);


  return (
    <div className="text-updater-node" ref={nodeRef}>
<Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      <div>
        <label htmlFor="text">
          Text: {question} <br />  
        </label>
      </div>
      {value === 'seller_info' && <Handle type="source" position={Position.Right} isConnectable={isConnectable} />}
      {value === 'action_lang' ? (
        <>
          <label htmlFor="text">
            {options.map((button) => (
              <div key={button.reply.id}>
                <button>{button.reply.title}</button><br />
              </div>
            ))}
          </label>
        </>
      ) : (
        <>
          {options.map((option, index) => ( <>
            <label htmlFor="text">
            <button key={index} className="button">
              {option.label}
            </button>
            </label> </>
          ))}
        </>
      )}


      {options.map((_, index) => (
        <Handle
          key={index}
          type="source"
          position={Position.Right}
          id={`option-${NodeId}_${index}`}
          style={handleStyle(index)}
          isConnectable={isConnectable}
          onConnect={() => console.log('handle onConnect')}
        />
      ))}
    </div>
  );
}

export default TextUpdaterNode;
