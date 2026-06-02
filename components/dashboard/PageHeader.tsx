"use client";

import React from "react";
import { Plus, Funnel } from "@phosphor-icons/react";
import { Button, Breadcrumbs } from "@/components/ui";

interface ActionConfig {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "white" | "danger" | "ghost";
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string; active?: boolean }[];
  primaryAction?: ActionConfig;
  secondaryAction?: ActionConfig;
  thirdAction?: ActionConfig;
  extraActions?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  breadcrumbs, 
  primaryAction, 
  secondaryAction,
  thirdAction,
  extraActions 
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 mb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
        <div className="flex items-center gap-3">
          {extraActions}
          
          {secondaryAction && (
            <Button 
              variant={secondaryAction.variant || "white"} 
              icon={secondaryAction.icon || <Funnel size={18} weight="bold" />}
              onClick={secondaryAction.onClick}
              className="text-xs font-bold py-3 px-6"
            >
              {secondaryAction.label}
            </Button>
          )}

          {thirdAction && (
            <Button
              variant={thirdAction.variant || "white"}
              icon={thirdAction.icon}
              onClick={thirdAction.onClick}
              className="text-xs font-bold py-3 px-6"
            >
              {thirdAction.label}
            </Button>
          )}

          {primaryAction && (
            <Button 
              variant={primaryAction.variant || "secondary"} 
              icon={primaryAction.icon || <Plus size={18} weight="bold" />}
              onClick={primaryAction.onClick}
              className="bg-[#0095FF] hover:bg-[#0084FF] text-xs h-[40px] px-6 font-bold flex items-center justify-center shrink-0 rounded-xl"
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
    </div>
  );
}
