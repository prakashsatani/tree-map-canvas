import React from 'react';
import data from './data';
import initializeScene from './initializeScene';
import ThreeForceGraph from 'three-forcegraph';
import renderToSprite from './renderToSprite';
import MindMapNode from './MindMapNode';
import * as THREE from 'three';
import colorsByLevel from './colorsByLevel';
import updateLinkPosition from './updateLinkPosition';

export default async function renderMindMap(div) {
  const { scene, renderer, camera, controls } = initializeScene(div, data);
  data.nodes = await Promise.all(
    data.nodes.map((node) =>
      renderToSprite(<MindMapNode label={node.name} level={node.level} />, {
        width: 128,
        height: 64
      }).then((sprite) => {
        sprite.renderOrder = 999;
        sprite.onBeforeRender = (renderer) => renderer.clearDepth();
        return { ...node, sprite };
      })
    )
  );
  const graph = new ThreeForceGraph().graphData(data);
  graph.nodeThreeObject(({ sprite }) => sprite);
  graph.linkMaterial(
    ({ level }) => new THREE.MeshBasicMaterial({ color: colorsByLevel[level] })
  );
  graph.linkPositionUpdate(updateLinkPosition);
  graph.numDimensions(2);
  graph.linkWidth(1);
  graph.scale.set(0.005, 0.005, 0.005);
  scene.add(graph);
  camera.lookAt(graph.position);

  (function animate() {
    graph.tickFrame();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  })();
}
