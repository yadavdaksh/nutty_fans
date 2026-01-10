import {
  Heart,
  Camera,
  Music,
  Video,
  Gamepad,
  Dumbbell,
  Book,
  Code,
  Mic,
} from 'lucide-react';

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type Role = 'user' | 'creator';

export const CATEGORIES = [
  { id: 'art', label: 'Art & Design', icon: <Heart className="w-6 h-6" /> },
  { id: 'music', label: 'Music', icon: <Music className="w-6 h-6" /> },
  { id: 'photography', label: 'Photography', icon: <Camera className="w-6 h-6" /> },
  { id: 'video', label: 'Video Content', icon: <Video className="w-6 h-6" /> },
  { id: 'gaming', label: 'Gaming', icon: <Gamepad className="w-6 h-6" /> },
  { id: 'fitness', label: 'Fitness', icon: <Dumbbell className="w-6 h-6" /> },
  { id: 'lifestyle', label: 'Lifestyle', icon: <Heart className="w-6 h-6" /> },
  { id: 'education', label: 'Education', icon: <Book className="w-6 h-6" /> },
  { id: 'technology', label: 'Technology', icon: <Code className="w-6 h-6" /> },
  { id: 'podcast', label: 'Podcast', icon: <Mic className="w-6 h-6" /> },
];
