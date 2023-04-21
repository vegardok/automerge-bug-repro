import { useCallback, useEffect, useRef, useState } from "react";
import { debounce, isEqual } from "lodash";
import * as Automerge from "@automerge/automerge";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Edge,
  Node,
  NodeChange,
} from "reactflow";
import localForage from "localforage";

import {
  nodes as initialNodes,
  edges as initialEdges,
} from "./initial-elements";
import CustomNode from "./CustomNode";

import "reactflow/dist/style.css";
import "./overview.css";
import { useMutation, useQuery } from "react-query";

const nodeTypes = {
  custom: CustomNode,
};

const minimapStyle = {
  height: 120,
};

type Canvas = {
  canvas: {
    nodes: Node<any>[];
    edges: Edge<any>[];
  };
};
type ACanvas = Automerge.unstable.Doc<Canvas>;

async function loadCanvas(): Promise<ACanvas> {
  try {
    const canvas = await localForage.getItem<Uint8Array>("canvas");
    if (canvas) {
      return Automerge.load<Canvas>(canvas);
    } else {
      throw new Error("nothing in db");
    }
  } catch {
    return Automerge.from<Canvas>({
      canvas: {
        nodes: initialNodes,
        edges: initialEdges,
      },
    });
  }
}

async function saveCanvas(canvas: ACanvas) {
  const existingCanvas = await localForage.getItem<Uint8Array>("canvas");
  if (existingCanvas) {
    const mergedCanvas = Automerge.merge(
      Automerge.load<ACanvas>(existingCanvas),
      canvas
    );
    const reloadedCanvas = Automerge.load<ACanvas>(
      Automerge.save(mergedCanvas)
    );

    mergedCanvas.canvas.nodes.forEach((node, i) => {
      if (
        node.position.x !== reloadedCanvas.canvas.nodes[i].position.x ||
        node.position.y !== reloadedCanvas.canvas.nodes[i].position.y
      ) {
        console.log("node position differs in merged and merged+reloaded doc");
        console.log(node.position);
        console.log(" vs ");
        console.log(reloadedCanvas.canvas.nodes[i].position);
        console.log(" ---- ");
      }
    });

    localForage.setItem("canvas", Automerge.save(mergedCanvas));
  } else {
    localForage.setItem("canvas", Automerge.save(canvas));
  }
}

const OverviewFlow = () => {
  const amRef = useRef<ACanvas>();
  const [amState, setAMState] = useState<ACanvas | undefined>();

  const { data } = useQuery("canvas", loadCanvas, { staleTime: Infinity });
  const { mutate, isLoading } = useMutation(saveCanvas);
  const debouncedMutate = debounce(mutate, 1000);

  const save = useCallback(
    (c: ACanvas) => {
      amRef.current = c;
      setAMState(c);
      debouncedMutate(c);
    },
    [debouncedMutate]
  );

  useEffect(() => {
    if (data) {
      amRef.current = data;
      setAMState(data);
    }
  }, [data]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (!amRef.current) {
        return;
      }
      const newCanvas = Automerge.change(amRef.current, (canvas) => {
        changes.forEach((change) => {
          switch (change.type) {
            case "position": {
              const n = canvas.canvas.nodes.find((n) => n.id === change.id);
              if (n && change.position) {
                n.position.x = change.position.x;
                n.position.y = change.position.y;
              }
              break;
            }
            default: {
              break;
            }
          }
        });
      });
      save(newCanvas);
    },
    [save]
  );

  if (!amState) {
    return <>missing data</>;
  }

  return (
    <div style={{ height: 1000 }}>
      <button
        onClick={() => {
          localForage.removeItem("canvas");
          window.location.reload();
        }}
      >
        Clear state
      </button>
      {isLoading && <>Saving...</>}
      <ReactFlow
        nodes={amState.canvas.nodes}
        edges={amState.canvas.edges}
        onNodesChange={onNodesChange}
        fitView
        attributionPosition="top-right"
        nodeTypes={nodeTypes}
      >
        <MiniMap style={minimapStyle} zoomable pannable />
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default OverviewFlow;
