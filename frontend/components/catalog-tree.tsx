"use client";

import { useMemo, useState } from "react";

import { PublicDomainNode, publicDomainTree, publicMaterialPivotMap } from "@/lib/public-site";

type NodeState = {
  expanded: boolean;
};

function TreeNode({
  node,
  level,
  onSelect,
  activeId,
  state,
  toggle,
}: {
  node: PublicDomainNode;
  level: number;
  onSelect: (nodeId: string) => void;
  activeId: string | null;
  state: Record<string, NodeState>;
  toggle: (nodeId: string) => void;
}) {
  const hasChildren = Boolean(node.children?.length);
  const isExpanded = state[node.id]?.expanded ?? false;
  const isActive = activeId === node.id;

  return (
    <div className={`v3-tree-node v3-tree-node-level-${level}`}>
      <button
        type="button"
        className={`v3-tree-button ${isActive ? "v3-tree-button-active" : ""}`}
        onClick={() => {
          if (hasChildren) {
            toggle(node.id);
          }
          onSelect(node.id);
        }}
      >
        <span>{node.label}</span>
        {hasChildren ? <span className="v3-tree-caret">{isExpanded ? "–" : "+"}</span> : null}
      </button>
      {hasChildren && isExpanded ? (
        <div className="v3-tree-children">
          {node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              activeId={activeId}
              state={state}
              toggle={toggle}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CatalogTree() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [state, setState] = useState<Record<string, NodeState>>({
    "constructii-instalatii": { expanded: true },
  });

  const activePivot = selectedId ? publicMaterialPivotMap[selectedId] : null;
  const activeActions = activePivot?.actions ?? [];
  const constraint = activePivot?.constraints;
  const forceLevel = constraint?.minLevel;
  const requiresRental = Boolean(constraint?.requiresRental);

  const formattedTree = useMemo(() => publicDomainTree, []);

  return (
    <aside className="v3-catalog-tree">
      <div className="v3-tree-title">Domenii</div>
      <div className="v3-tree-list">
        {formattedTree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            level={1}
            activeId={selectedId}
            onSelect={setSelectedId}
            state={state}
            toggle={(nodeId) =>
              setState((current) => ({
                ...current,
                [nodeId]: { expanded: !(current[nodeId]?.expanded ?? false) },
              }))
            }
          />
        ))}
      </div>

      <div className="v3-tree-pivot">
        <div className="v3-card-kicker">Pivot material → serviciu</div>
        <h4>{activePivot?.label ?? "Selecteaza un obiect"}</h4>
        <p className="v3-muted-copy">
          {activePivot?.notes ?? "Alege un obiect tehnologic pentru a vedea fluxurile automate recomandate."}
        </p>
        {(forceLevel || requiresRental) ? (
          <div className="v3-pivot-constraints">
            {forceLevel ? (
              <span className="v3-mini-badge v3-mini-badge-strong">Nivel minim: {forceLevel}</span>
            ) : null}
            {requiresRental ? (
              <span className="v3-mini-badge v3-mini-badge-soft">Necesita utilaj rental</span>
            ) : null}
          </div>
        ) : null}
        <div className="v3-pivot-actions">
          {(activeActions.length ? activeActions : ["Reparatie", "Mentenanta", "Inlocuire", "Montaj"]).map((action) => (
            <span key={action} className="v3-mini-badge v3-mini-badge-soft">
              {action}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
