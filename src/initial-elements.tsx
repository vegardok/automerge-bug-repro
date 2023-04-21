import { Edge, Node } from "reactflow";

export const nodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: {
      label: "Input Node",
    },
    position: { x: 250, y: 0 },
  },
  {
    id: "2",
    data: {
      label: "Default Node",
    },
    position: { x: 100, y: 100 },
  },
  {
    id: "3",
    type: "output",
    data: {
      label: "Output Node",
    },
    position: { x: 400, y: 100 },
  },
];

export const edges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", label: "this is an edge label" },
  { id: "e1-3", source: "1", target: "3", animated: true },
];
