"use client";

import { FileHeart } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  patientId: string;
  patientName: string;
  compact?: boolean;
};

export function EhrLinkButton({ patientId, patientName, compact = false }: Props) {
  function handleClick() {
    window.alert(
      `電子カルテ連携デモ\n患者: ${patientName}\n患者ID: ${patientId}\n\nGMOヘルステックとの連携仕様確定後、このボタンからハヤブサの該当患者カルテを開く想定です。`,
    );
  }

  return (
    <Button
      type="button"
      size={compact ? "sm" : "default"}
      variant="outline"
      className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
      onClick={handleClick}
    >
      <FileHeart className="size-4" />
      電子カルテ
    </Button>
  );
}
