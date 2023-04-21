# Sample app to reproduce an bug/unintuitive behavior in Automerge 2.0.2

This is a simple create-react-app app using reactflow for a simple interactive graph and Automerge
is used to represent the graph.

## Issue
The issue is that when merging two documents with conflicting numbers you get a different result
from Automerge.merge(doc1, doc2) and Automerge.load(Automerge.save(Automerge.merge(doc1, doc2)).

## Repro steps:
1. Download repo and start locally
2. Open http://localhost:3000/ in two windows using the same browser
3. Move one of the nodes around in both window
4. A message will be written to console if found (in https://github.com/vegardok/automerge-bug-repro/blob/master/src/App.tsx#L58)
