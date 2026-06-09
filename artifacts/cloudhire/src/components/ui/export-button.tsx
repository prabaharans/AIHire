import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExport } from "@/hooks/use-export";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  endpoint: string;
  filename?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function ExportButton({
  endpoint,
  filename,
  variant = "outline",
  size = "sm",
}: ExportButtonProps) {
  const { exportData, loading, error } = useExport();
  const { toast } = useToast();

  const handleExport = async (format: "csv" | "json") => {
    await exportData(endpoint, format, filename);
    if (!error) {
      toast({
        title: "Success",
        description: `Data exported as ${format.toUpperCase()}`,
      });
    } else {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
