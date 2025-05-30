import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Info } from "lucide-react"; // Import Info icon

interface AlbumDescriptionPanelProps {
  description: string;
}

const AlbumDescriptionPanel: React.FC<AlbumDescriptionPanelProps> = ({ description }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className='h-full bg-zinc-900 rounded-lg flex flex-col'> {/* Added background and rounded corners */}
      <div className='p-4 flex justify-between items-center border-b border-zinc-800'> {/* Added header styling */}
        <div className='flex items-center gap-2'>
          <Info className='size-5 shrink-0' /> {/* Added Info icon */}
          <h2 className='font-semibold'>Album Description</h2> {/* Added title */}
        </div>
      </div>
      <ScrollArea className="flex-1 p-4"> {/* Adjusted ScrollArea to take remaining height and added padding */}
        <div className={`text-sm text-zinc-400 ${!isExpanded ? '' : ''}`}> {/* Remove max-h-40 overflow-hidden */}
          <span dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br>') }} />
        </div>
        {description.length > 200 && ( // Assuming 200 characters is the threshold for "read more"
          <Button variant="link" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-zinc-100 p-0 h-auto mt-2">
            {isExpanded ? 'Collapse' : 'Read More'}
          </Button>
        )}
      </ScrollArea>
    </div>
  );
};

export default AlbumDescriptionPanel;
