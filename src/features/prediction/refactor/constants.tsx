// Constants for Brand prediction component
import {
  AlertCircle,
  ArrowUp,
  FileText,
  Sparkles,
  Target,
} from "lucide-react";

export const questions = [
  {
    value: "ranking_optimization",
    label:
      "Which project management apps are industry leaders currently using?",
    description:
      "Discover top project management tools used by industry leaders",
    category: "Project Management",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    value: "content_gaps",
    label:
      "Looking for cloud-based software to oversee construction projects—any suggestions?",
    description:
      "Find specialized construction project management software solutions",
    category: "Construction Software",
    icon: <Target className="w-4 h-4" />,
  },
  {
    value: "competitor_analysis",
    label:
      "How can I access healthcare advice 24/7 without going to the hospital?",
    description: "Explore 24/7 healthcare advice and telemedicine services",
    category: "Healthcare Services",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    value: "keyword_optimization",
    label: "What app offers online doctor booking and chat in Indonesia?",
    description: "Find telemedicine apps with doctor booking in Indonesia",
    category: "Telemedicine Apps",
    icon: <ArrowUp className="w-4 h-4" />,
  },
  {
    value: "content_structure",
    label: "Where can I find telemedicine services for common illnesses?",
    description: "Locate telemedicine platforms for common health issues",
    category: "Telemedicine Services",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    value: "user_intent",
    label: "I need top-notch printing services in Warsaw. Any recommendations?",
    description: "Find high-quality printing services in Warsaw, Poland",
    category: "Printing Services",
    icon: <Target className="w-4 h-4" />,
  },
  {
    value: "technical_seo",
    label: "Which software works best for collaborative project planning?",
    description: "Compare collaborative project planning software solutions",
    category: "Collaborative Tools",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  {
    value: "content_freshness",
    label: "What app offers online doctor booking and chat in Indonesia?",
    description: "Find telemedicine apps with doctor booking in Indonesia",
    category: "Telemedicine Apps",
    icon: <Sparkles className="w-4 h-4" />,
  },
];
