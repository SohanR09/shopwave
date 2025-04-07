import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Bell } from "lucide-react";

interface CommingSoonProps {
    title: string;
    description: string;
}

export default function CommingSoon({title, description}: CommingSoonProps) {
  return (
    <Alert variant="default" className="bg-glacier-50 border-glacier-200">
        <AlertTitle className="flex items-center gap-2"><Bell className="h-4 w-4" />{title}</AlertTitle>
        <AlertDescription className="text-sm text-gray-500 ml-6">
            <p>{description}</p>
            <span className="text-sm text-gray-500">Comming Soon...</span>
        </AlertDescription>
    </Alert>
  )
}