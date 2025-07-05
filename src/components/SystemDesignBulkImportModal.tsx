
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SystemDesignBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SystemDesignBulkImportModal = ({ isOpen, onClose, onSuccess }: SystemDesignBulkImportModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [jsonData, setJsonData] = useState("");

  const exampleData = `[
  {
    "title": "Design Twitter",
    "slug": "design-twitter",
    "description": "Design a social media platform like Twitter that can handle millions of users posting tweets, following each other, and viewing timelines.",
    "requirement_discussion": "**Functional Requirements:**\\n- Users can post tweets (140 characters)\\n- Users can follow/unfollow other users\\n- Users can view their timeline (tweets from people they follow)\\n- Users can view their own tweets\\n- Support for hashtags and mentions\\n\\n**Non-Functional Requirements:**\\n- System should handle 100M daily active users\\n- Timeline should load within 200ms\\n- System should be highly available\\n- Support for 500M tweets per day",
    "solution": "**High-Level Architecture:**\\n\\n1. **Load Balancer**: Distribute incoming requests\\n2. **API Gateway**: Route requests to appropriate services\\n3. **User Service**: Handle user-related operations\\n4. **Tweet Service**: Handle tweet creation and storage\\n5. **Timeline Service**: Generate user timelines\\n6. **Notification Service**: Handle push notifications\\n\\n**Database Design:**\\n- User Table: user_id, username, email, created_at\\n- Tweet Table: tweet_id, user_id, content, created_at\\n- Follow Table: follower_id, followee_id, created_at\\n\\n**Timeline Generation:**\\n- Push model for users with few followers\\n- Pull model for celebrities with millions of followers\\n- Hybrid approach for optimal performance\\n\\n**Caching Strategy:**\\n- Redis for timeline caching\\n- CDN for static content\\n- Database query caching",
    "design_image": "",
    "video_link": "",
    "github_link": "",
    "tags": ["Social Media", "Timeline", "Scalability", "Database Design", "Caching"],
    "difficulty": "Hard",
    "pricing_tier": "Innovator",
    "status": "Published"
  },
  {
    "title": "Design URL Shortener",
    "slug": "design-url-shortener",
    "description": "Design a URL shortening service like bit.ly that can convert long URLs into short ones and redirect users when they click on short URLs.",
    "requirement_discussion": "**Functional Requirements:**\\n- Shorten long URLs to 6-8 character codes\\n- Redirect users when they click short URLs\\n- Custom aliases (optional)\\n- Analytics on click counts\\n- Link expiration\\n\\n**Non-Functional Requirements:**\\n- 100:1 read to write ratio\\n- 100M URLs shortened per month\\n- System should be highly available\\n- Redirection should happen with minimal latency",
    "solution": "**Architecture Components:**\\n\\n1. **Load Balancer**: Distribute traffic\\n2. **Application Servers**: Handle business logic\\n3. **Database**: Store URL mappings\\n4. **Cache**: Store frequently accessed URLs\\n5. **Analytics Service**: Track click metrics\\n\\n**URL Encoding:**\\n- Base62 encoding (a-z, A-Z, 0-9)\\n- 6 characters = 62^6 = 56+ billion URLs\\n- Counter-based approach with multiple ranges\\n\\n**Database Schema:**\\n- URL Table: short_url, long_url, user_id, created_at, expires_at\\n- Analytics Table: short_url, click_count, last_accessed\\n\\n**Caching Strategy:**\\n- Cache popular URLs in Redis\\n- Use CDN for global distribution\\n- Cache hit ratio should be >80%",
    "design_image": "",
    "video_link": "",
    "github_link": "",
    "tags": ["URL Shortener", "Base62", "Analytics", "Caching", "Database"],
    "difficulty": "Medium",
    "pricing_tier": "Builder",
    "status": "Published"
  }
]`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const problems = JSON.parse(jsonData);
      
      if (!Array.isArray(problems)) {
        throw new Error("Data must be an array of problems");
      }

      const { error } = await supabase
        .from('system_design_problems')
        .insert(problems);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully imported ${problems.length} system design problems`,
      });

      setJsonData("");
      onSuccess();
    } catch (error) {
      console.error('Error importing system design problems:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to import system design problems",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import System Design Problems</DialogTitle>
          <DialogDescription>
            Import multiple system design problems using JSON format. Use the example below as a reference.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="jsonData">JSON Data</Label>
            <Textarea
              id="jsonData"
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder="Paste your JSON data here..."
              rows={12}
              className="font-mono text-sm"
              required
            />
          </div>

          <div>
            <Label>Example Format:</Label>
            <div className="mt-2 p-4 bg-muted rounded-lg">
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {exampleData}
              </pre>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Importing..." : "Import Problems"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SystemDesignBulkImportModal;
