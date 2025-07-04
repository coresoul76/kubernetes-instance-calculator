import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const instanceTypes = {
  't3.medium': { cpu: 2, memory: 4 },
  't3.large': { cpu: 2, memory: 8 },
  't3.xlarge': { cpu: 4, memory: 16 },
  't3.2xlarge': { cpu: 8, memory: 32 },
  'm5.large': { cpu: 2, memory: 8 },
  'm5.xlarge': { cpu: 4, memory: 16 },
  'm5.2xlarge': { cpu: 8, memory: 32 },
  'm5.4xlarge': { cpu: 16, memory: 64 },
  'm5.8xlarge': { cpu: 32, memory: 128 },
  'm5.12xlarge': { cpu: 48, memory: 192 },
  'r5.large': { cpu: 2, memory: 16 },
  'r5.xlarge': { cpu: 4, memory: 32 },
  'r5.2xlarge': { cpu: 8, memory: 64 },
  'r5.4xlarge': { cpu: 16, memory: 128 },
  'r5.8xlarge': { cpu: 32, memory: 256 },
  'c5.large': { cpu: 2, memory: 4 },
  'c5.xlarge': { cpu: 4, memory: 8 },
  'c5.2xlarge': { cpu: 8, memory: 16 },
  'c5.4xlarge': { cpu: 16, memory: 32 },
  'c5.9xlarge': { cpu: 36, memory: 72 },
  'custom': { cpu: 0, memory: 0 },
};

function Calculator({ onRemove, podColor }) {
  const [title, setTitle] = useState('Application');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [peakPods, setPeakPods] = useState(100);
  const [podCpu, setPodCpu] = useState(500);
  const [podMemory, setPodMemory] = useState(1);

  const [instanceType, setInstanceType] = useState('m5.4xlarge');
  const [nodeCpu, setNodeCpu] = useState(instanceTypes['m5.4xlarge'].cpu);
  const [nodeMemory, setNodeMemory] = useState(instanceTypes['m5.4xlarge'].memory);

  const [cpuOverhead, setCpuOverhead] = useState(10);
  const [memoryOverhead, setMemoryOverhead] = useState(10);

  const INSTANCE_COST_PER_MONTH = 700.80; // On-demand m5.4xlarge in Singapore
  const [requiredNodes, setRequiredNodes] = useState(0);
  const [nodePlacement, setNodePlacement] = useState([]);
  const [monthlyCost, setMonthlyCost] = useState(0);

  useEffect(() => {
    if (instanceType === 'custom') {
      setNodeCpu(0);
      setNodeMemory(0);
    } else {
      setNodeCpu(instanceTypes[instanceType].cpu);
      setNodeMemory(instanceTypes[instanceType].memory);
    }
  }, [instanceType]);

  useEffect(() => {
    const podCpuVcores = podCpu / 1000;
    const totalPodCpu = peakPods * podCpuVcores;
    const totalPodMemory = peakPods * podMemory;

    const usableNodeCpu = nodeCpu * (1 - cpuOverhead / 100);
    const usableNodeMemory = nodeMemory * (1 - memoryOverhead / 100);

    if (usableNodeCpu > 0 && usableNodeMemory > 0 && podCpuVcores > 0 && podMemory > 0) {
      const nodesByCpu = Math.ceil(totalPodCpu / usableNodeCpu);
      const nodesByMemory = Math.ceil(totalPodMemory / usableNodeMemory);
      const calculatedNodes = Math.max(nodesByCpu, nodesByMemory);
      setRequiredNodes(calculatedNodes);
      setMonthlyCost(calculatedNodes * INSTANCE_COST_PER_MONTH);

      const nodes = Array.from({ length: calculatedNodes }, () => ({
        pods: [],
        usedCpu: 0,
        usedMemory: 0,
      }));

      for (let i = 0; i < peakPods; i++) {
        let placed = false;
        for (const node of nodes) {
          if (node.usedCpu + podCpuVcores <= usableNodeCpu && node.usedMemory + podMemory <= usableNodeMemory) {
            node.pods.push({});
            node.usedCpu += podCpuVcores;
            node.usedMemory += podMemory;
            placed = true;
            break;
          }
        }
        if (!placed) {
            if(nodes.length > 0) {
                const newNode = { pods: [{}], usedCpu: podCpuVcores, usedMemory: podMemory };
                nodes.push(newNode);
            } else {
                 nodes.push({ pods: [{}], usedCpu: podCpuVcores, usedMemory: podMemory });
            }
        }
      }
      setNodePlacement(nodes);

    } else {
      setRequiredNodes(0);
      setNodePlacement([]);
    }
  }, [peakPods, podCpu, podMemory, nodeCpu, nodeMemory, cpuOverhead, memoryOverhead]);


  return (
    <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
            {isEditingTitle ? (
                <input 
                    type="text" 
                    className="form-control" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    onBlur={() => setIsEditingTitle(false)} 
                    onKeyPress={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                    autoFocus
                />
            ) : (
                <h5 onClick={() => setIsEditingTitle(true)} style={{ cursor: 'pointer' }}>{title}</h5>
            )}
            <button className="btn btn-danger btn-sm" onClick={onRemove}>Remove</button>
        </div>
        <div className="card-body">
            <div className="row">
                <div className="col-md-6">
                    <h6 className="mb-3">Application / Pod Inputs</h6>
                    <div className="mb-3">
                        <label className="form-label">Peak Pod Count</label>
                        <input type="number" className="form-control form-control-sm" value={peakPods} onChange={(e) => setPeakPods(parseInt(e.target.value, 10) || 0)} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Pod CPU Limit (m)</label>
                        <input type="number" className="form-control form-control-sm" value={podCpu} onChange={(e) => setPodCpu(parseInt(e.target.value, 10) || 0)} />
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Pod Memory Limit (GiB)</label>
                        <input type="number" className="form-control form-control-sm" value={podMemory} onChange={(e) => setPodMemory(parseFloat(e.target.value) || 0)} />
                    </div>
                </div>
                <div className="col-md-6">
                    <h6 className="mb-3">Worker Node Configuration</h6>
                    <div className="mb-3">
                        <label className="form-label">Instance Type</label>
                        <select className="form-select form-select-sm" value={instanceType} onChange={(e) => setInstanceType(e.target.value)}>
                            {Object.keys(instanceTypes).map(type => (
                                <option key={type} value={type}>{type} ({instanceTypes[type].cpu} vCPU, {instanceTypes[type].memory} GiB)</option>
                            ))}
                        </select>
                    </div>
                    {instanceType === 'custom' && (
                        <>
                            <div className="mb-3">
                                <label className="form-label">Node vCPU</label>
                                <input type="number" className="form-control form-control-sm" value={nodeCpu} onChange={(e) => setNodeCpu(parseInt(e.target.value, 10) || 0)} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Node Memory (GiB)</label>
                                <input type="number" className="form-control form-control-sm" value={nodeMemory} onChange={(e) => setNodeMemory(parseInt(e.target.value, 10) || 0)} />
                            </div>
                        </>
                    )}
                    <div className="mb-3">
                        <label className="form-label">CPU Overhead (%)</label>
                        <input type="number" className="form-control form-control-sm" value={cpuOverhead} onChange={(e) => setCpuOverhead(parseInt(e.target.value, 10) || 0)} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Memory Overhead (%)</label>
                        <input type="number" className="form-control form-control-sm" value={memoryOverhead} onChange={(e) => setMemoryOverhead(parseInt(e.target.value, 10) || 0)} />
                    </div>
                </div>
            </div>

            <div className="card mt-3">
                <div className="card-header">
                Results
                </div>
                <div className="card-body">
                <h2>Required Worker Nodes: {requiredNodes}</h2>
                <h2>Estimated Monthly Cost: ${monthlyCost.toFixed(2)}</h2>
                </div>
            </div>

            {nodePlacement.length > 0 && (
                <div className="card mt-4">
                    <div className="card-header">
                        Pod Placement Visualization
                    </div>
                    <div className="card-body pod-visualization-container">
                        {nodePlacement.map((node, index) => (
                            <div key={index} className="node-card">
                                <h6>Node {index + 1} ({node.pods.length} pods)</h6>
                                <div className="pods-grid">
                                    {node.pods.map((pod, podIndex) => (
                                        <div key={podIndex} className="pod-item" style={{ backgroundColor: podColor }}></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}

export default Calculator;